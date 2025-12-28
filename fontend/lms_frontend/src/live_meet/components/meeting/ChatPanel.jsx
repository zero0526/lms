import { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Reply, X } from 'lucide-react';
import { Input, Button, Avatar } from '../common';
import { clsx } from 'clsx';
import { toGoogleDriveEmbedUrl } from '../../utils/common';
import { useLocalParticipant } from '@livekit/components-react';

export default function ChatPanel({ 
  messages, sendMessage, isSending 
}) {
  const [inputValue, setInputValue] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const handleInitiateReply = (msg) => {
    setReplyingTo(msg);
    // Focus on the input field after clicking reply
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Map messages by ID for easy parent lookup
  const messageMap = useMemo(() => {
    const map = new Map();
    messages.forEach(m => map.set(m.id, m));
    return map;
  }, [messages]);

  // Automatically scroll to the bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const { localParticipant } = useLocalParticipant();
  const canChat = localParticipant?.permissions?.canPublishData ?? true;

  const handleSend = () => {
    if (!canChat) {
      alert("Teacher has disabled your chat permissions.");
      return;
    }
    if (!inputValue.trim()) return;
    sendMessage(inputValue, replyingTo?.id);
    setInputValue("");
    setReplyingTo(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      <div className="p-4 border-b border-gray-200 font-semibold text-gray-700">
        Chat ({messages.length})
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 flex flex-col" ref={scrollRef}>
        {messages.map((msg) => {
          const parent = msg.parentId ? messageMap.get(msg.parentId) : null;
          
          return (
            <div key={msg.id} className={clsx("flex gap-2 max-w-[90%] group", msg.isSelf ? "ml-auto flex-row-reverse" : "")}>
              <Avatar name={msg.senderName} src={toGoogleDriveEmbedUrl(msg.senderAvatar)} size="sm" />
              
              <div className={clsx("flex flex-col", msg.isSelf ? "items-end" : "items-start")}>
                 {/* Reply button - Update onClick handler */}
                 <button 
                    onClick={() => handleInitiateReply(msg)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-500 transition-opacity mb-1 flex items-center gap-1 text-[10px]"
                 >
                    <Reply size={14} /> Reply
                 </button>

                 <div className={clsx(
                    "p-2 rounded-lg text-sm shadow-sm relative",
                    msg.isSelf ? "bg-blue-600 text-white rounded-br-none" : "bg-white border text-gray-800 rounded-bl-none"
                 )}>
                    {/* Display parent message (Quote) */}
                    {parent && (
                        <div 
                          className={clsx(
                             "bg-black/5 p-1.5 rounded mb-2 border-l-2 text-xs cursor-pointer hover:bg-black/10 transition-colors",
                             msg.isSelf ? "border-white/50" : "border-blue-500"
                          )}
                          onClick={() => {
                            // Additional logic: Scroll to the original message when clicking on the quote
                            const parentElement = document.getElementById(`msg-${parent.id}`);
                            parentElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }}
                        >
                           <div className="font-bold opacity-70 flex items-center gap-1">
                              <Reply size={10} /> {parent.senderName}
                           </div>
                           <div className="opacity-80 italic line-clamp-1">{parent.content}</div>
                        </div>
                    )}
                    
                    {/* ID message for scrolling (scrollIntoView) */}
                    <div id={`msg-${msg.id}`}>{msg.content}</div>
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reply indicator (Giữ nguyên giao diện của bạn) */}
      {replyingTo && (
         <div className="px-4 py-2 border-t bg-blue-50 flex items-center justify-between text-xs text-blue-800">
            <div className="flex items-center gap-1 overflow-hidden">
               <Reply size={12} className="shrink-0" />
               <span className="truncate">Đang trả lời <strong>{replyingTo.senderName}</strong></span>
            </div>
            <button onClick={() => setReplyingTo(null)} className="text-gray-400 hover:text-red-500">
               <X size={14} />
            </button>
         </div>
      )}

      {/* Input gửi tin - Thêm ref */}
      <div className="p-3 border-t bg-white flex gap-2">
        <Input 
          ref={inputRef}
          disabled={!canChat}
          placeholder={!canChat ? "Chat bị giáo viên khóa" : (replyingTo ? "Enter your reply..." : "Enter your message...")}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button variant="primary" onClick={handleSend} disabled={isSending || !inputValue.trim() || !canChat} className="px-3">
          <Send size={18} />
        </Button>
      </div>
    </div>
  );
}
