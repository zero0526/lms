import { useState, useEffect, useCallback } from 'react';
import { useRoomContext } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import { ChatService } from '../services/api';

export const useChat = (sessionId, currentUserId, currentUserName, currentUserAvatar) => {
  const room = useRoomContext();
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);

  const checkIsSelf = (senderId, userId) => {
    return String(senderId) === String(userId);
  };

  // 1. Load lịch sử chat cũ
  useEffect(() => {
    if (!sessionId) return;
    ChatService.getHistory(sessionId)
      .then(history => {
        const mapped = history.map((m) => ({
          ...m,
          isSelf: checkIsSelf(m.senderId, currentUserId) 
        }));
        setMessages(mapped);
      })
      .catch((err) => {
        console.error('Failed to load chat history:', err);
      });
  }, [sessionId, currentUserId]);

  // 2. Lắng nghe tin nhắn Realtime từ LiveKit
  useEffect(() => {
    const handleDataReceived = (payload, _participant) => {
      console.log("RECEIVED DATA FROM LIVEKIT:", payload);
      try {
        const decoder = new TextDecoder();
        const strData = decoder.decode(payload);
        console.log("DECODED DATA:", strData);
        
        // Parse full ChatMessageResponse object from broadcast
        const msgData = JSON.parse(strData); 

        if (msgData.content && msgData.senderId) {
          console.log("PROCESS CHAT MESSAGE:", msgData);
          if (String(msgData.senderId) !== String(currentUserId)) {
            const incomingMsg = { ...msgData, isSelf: false };
            setMessages(prev => [...prev, incomingMsg]);
            setLastMessage(incomingMsg);
          } else {
            console.log("MESSAGE IS FROM SELF (Skipping update from websocket)");
          }
        }
      } catch (e) {
        console.error("Lỗi parse chat data:", e);
      }
    };

    if (room) {
      console.log("ATTACHING CHAT LISTENER TO ROOM:", room.name);
      room.on(RoomEvent.DataReceived, handleDataReceived);
      return () => {
        console.log("DETACHING CHAT LISTENER FROM ROOM:", room.name);
        room.off(RoomEvent.DataReceived, handleDataReceived);
      };
    }
  }, [room, currentUserId]);

  // 3. Hàm gửi tin nhắn
  const sendMessage = useCallback(async (content, replyToMessageId) => {
    if (!content.trim()) return;
    
    // Kiểm tra trạng thái room trước khi gửi
    if (!room || room.state !== 'connected') {
      console.warn("Room not connected, cannot broadcast message");
      alert("Kết nối phòng họp đã bị ngắt. Vui lòng tải lại trang.");
      return;
    }
    
    setIsSending(true);

    try {
      const response = await ChatService.sendMessage(
        sessionId,
        Number(currentUserId),
        content,
        replyToMessageId
      );

      // Backend should return full object, but handle legacy "Sent" string gracefully
      const savedMsg = typeof response === 'object' ? response : null;

      const fullMsg = {
        id: savedMsg?.id || Date.now(),
        sessionId: sessionId,
        parentId: replyToMessageId || savedMsg?.parentId || null,
        senderId: currentUserId,
        senderName: currentUserName,
        senderAvatar: currentUserAvatar || savedMsg?.senderAvatar || undefined,
        content: content,
        sentAt: savedMsg?.sentAt || new Date().toISOString(),
        isSelf: true
      };

      console.log("PREPARING TO BROADCAST:", fullMsg);

      // Update local state immediately
      setMessages(prev => [...prev, fullMsg]);
      setLastMessage(fullMsg);

      // BROADCAST to others via LiveKit Data Channel (Reliable)
      if (room && room.localParticipant && room.state === 'connected') {
        try {
          const encoder = new TextEncoder();
          const data = encoder.encode(JSON.stringify(fullMsg));
          await room.localParticipant.publishData(data, {
            reliable: true
          });
          console.log("CLIENT BROADCAST SUCCESSFUL");
        } catch (broadcastErr) {
          console.warn("Failed to broadcast message (room may be disconnected):", broadcastErr);
          // Message đã được lưu vào backend, chỉ không broadcast được
        }
      }

    } catch (err) {
      console.error("Lỗi gửi tin nhắn:", err);
      // Không hiện alert cho lỗi connection
      if (err.message?.includes('connection') || err.message?.includes('closed')) {
        alert("Kết nối phòng họp đã bị ngắt. Tin nhắn không thể gửi.");
      } else if (err.status === 401) {
        alert("Vui lòng đăng nhập lại");
      } else {
        alert("Lỗi hệ thống khi gửi tin nhắn");
      }
    } finally {
      setIsSending(false);
    }
  }, [sessionId, currentUserId, currentUserName, currentUserAvatar, room]);

  return { messages, sendMessage, isSending, lastMessage, setLastMessage };
};
