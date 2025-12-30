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

  // 1. Load chat history
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

  // 2. Listen for realtime messages from LiveKit
  useEffect(() => {
    const handleDataReceived = (payload, _participant) => {
      try {
        const decoder = new TextDecoder();
        const strData = decoder.decode(payload);
        
        // Parse full ChatMessageResponse object from broadcast
        const msgData = JSON.parse(strData); 

        if (msgData.content && msgData.senderId) {
          if (String(msgData.senderId) !== String(currentUserId)) {
            const incomingMsg = { ...msgData, isSelf: false };
            setMessages(prev => [...prev, incomingMsg]);
            setLastMessage(incomingMsg);
          }
        }
      } catch (e) {
        console.error("Failed to parse chat data:", e);
      }
    };

    if (room) {
      room.on(RoomEvent.DataReceived, handleDataReceived);
      return () => {
        room.off(RoomEvent.DataReceived, handleDataReceived);
      };
    }
  }, [room, currentUserId]);

  // 3. Function to send message
  const sendMessage = useCallback(async (content, replyToMessageId) => {
    if (!content.trim()) return;
    
    // Check room status before sending
    if (!room || room.state !== 'connected') {
      console.warn("Room not connected, cannot broadcast message");
      alert("Meeting connection lost. Please reload the page.");
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
        } catch (broadcastErr) {
          console.warn("Failed to broadcast message (room may be disconnected):", broadcastErr);
        }
      }

    } catch (err) {
      console.error("Failed to send message:", err);
      // Do not show alert for connection errors
      if (err.message?.includes('connection') || err.message?.includes('closed')) {
        alert("Meeting connection lost. Message could not be sent.");
      } else if (err.status === 401) {
        alert("Please log in again to send messages.");
      } else {
        alert("System error when sending message");
      }
    } finally {
      setIsSending(false);
    }
  }, [sessionId, currentUserId, currentUserName, currentUserAvatar, room]);

  return { messages, sendMessage, isSending, lastMessage, setLastMessage };
};
