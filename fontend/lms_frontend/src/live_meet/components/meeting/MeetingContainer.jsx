import { useEffect, useState, useRef } from 'react';
import { LiveKitRoom, RoomAudioRenderer, useLocalParticipant } from '@livekit/components-react';
import { Users, MessageSquare, Shield, ShieldOff, X } from 'lucide-react';
import VideoStage from './VideoStage';
import CustomControlBar from './CustomControlBar';
import ChatPanel from './ChatPanel';
import ParticipantList from './ParticipantList';
import { Avatar, Button } from '../common';
import { useChat } from '../../hooks/useChat';
import { toGoogleDriveEmbedUrl } from '../../utils/common';
import { clsx } from 'clsx';

export default function MeetingContainer(props) {
  return (
    <LiveKitRoom
      video={false}
      audio={false}
      token={props.token}
      serverUrl={props.wsUrl}
      data-lk-theme="default"
      style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}
      onConnected={() => console.log('LiveKit CONNECTED')}
      onDisconnected={(reason) => {
        console.log('LiveKit DISCONNECTED:', reason);
        props.onLeave();
      }}
      onError={(err) => console.error('LiveKit ERROR:', err)}
    >
      <MeetingContent {...props} />
    </LiveKitRoom>
  );
}

function MeetingContent({
  sessionId,
  user,
  onLeave,
  egressId,
}) {
  const { localParticipant } = useLocalParticipant();
  const [activeSidebar, setActiveSidebar] = useState('chat');
  const [permAlert, setPermAlert] = useState(null);
  const prevPerms = useRef(null);
  
  const { messages, sendMessage, isSending, lastMessage } = useChat(
    sessionId, 
    user.userId, 
    user.name,
    user.avatar
  );

  const [isVisible, setIsVisible] = useState(false);
  const [activeNotification, setActiveNotification] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Monitor Permissions Change
  useEffect(() => {
    if (!localParticipant || !localParticipant.permissions) return;
    
    const current = localParticipant.permissions;
    
    if (prevPerms.current) {
        // Check Publishing (Cam/Mic)
        if (prevPerms.current.canPublish && !current.canPublish) {
            setPermAlert({ field: 'Tương tác (Cam/Mic)', allowed: false });
        } else if (!prevPerms.current.canPublish && current.canPublish) {
            setPermAlert({ field: 'Tương tác (Cam/Mic)', allowed: true });
        }

        // Check Chat (PublishData)
        if (prevPerms.current.canPublishData && !current.canPublishData) {
            setPermAlert({ field: 'Trò chuyện (Chat)', allowed: false });
        } else if (!prevPerms.current.canPublishData && current.canPublishData) {
            setPermAlert({ field: 'Trò chuyện (Chat)', allowed: true });
        }
    }

    prevPerms.current = { ...current };

    // Auto-hide perm alert
    if (permAlert) {
        const timer = setTimeout(() => setPermAlert(null), 5000);
        return () => clearTimeout(timer);
    }
  }, [localParticipant?.permissions, permAlert]);

  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.isSelf || String(lastMessage.senderId) === String(user.userId)) return;
      if (activeSidebar === 'chat') {
        setUnreadCount(0);
        return;
      }
      setUnreadCount(prev => prev + 1);
      setActiveNotification(lastMessage);
      setIsVisible(true);
      
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);

      const clearTimer = setTimeout(() => {
        setActiveNotification(null);
      }, 3500);

      return () => {
        clearTimeout(hideTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [lastMessage, user.userId, activeSidebar]); 

  useEffect(() => {
    if (activeSidebar === 'chat') {
      setIsVisible(false);
      setActiveNotification(null);
      setUnreadCount(0);
    }
  }, [activeSidebar]);

  return (
    <>
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 relative flex flex-col">
          <VideoStage />

          <div className="absolute top-4 right-4 flex gap-2 z-20">
            <Button
              variant={activeSidebar === 'users' ? 'primary' : 'ghost'}
              onClick={() => setActiveSidebar(activeSidebar === 'users' ? null : 'users')}
              className="bg-black/50 text-white"
            >
              <Users size={18} className="mr-2" /> TV
            </Button>
            <Button
              variant={activeSidebar === 'chat' ? 'primary' : 'ghost'}
              onClick={() => setActiveSidebar(activeSidebar === 'chat' ? null : 'chat')}
              className="bg-black/50 text-white relative"
            >
              <MessageSquare size={18} className="mr-2" /> Chat
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {activeSidebar && (
          <div className="w-80 h-full border-l border-gray-800 bg-white">
            {activeSidebar === 'chat' ? (
              <ChatPanel
                messages={messages}
                sendMessage={sendMessage}
                isSending={isSending}
              />
            ) : (
              <ParticipantList isTeacher={user.role === 'TEACHER' || user.role === 'ROLE_TEACHER'} />
            )}
          </div>
        )}

        {/* Permission Alert Toast */}
        {permAlert && (
          <div className={clsx(
            "absolute top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border transition-all duration-300",
            permAlert.allowed ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
          )}>
            {permAlert.allowed ? <Shield size={20} className="text-green-600" /> : <ShieldOff size={20} className="text-red-600" />}
            <div className="flex flex-col">
              <p className="text-sm font-bold">Notification from Teacher</p>
              <p className="text-xs opacity-90">
                {permAlert.allowed ? `You have been granted permission: ${permAlert.field}` : `Teacher has revoked permission: ${permAlert.field}`}
              </p>
            </div>
            <button onClick={() => setPermAlert(null)} className="ml-2 hover:opacity-60">
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      <RoomAudioRenderer />

      {activeNotification && (
        <div 
          className={clsx(
            "absolute bottom-24 left-1/2 -translate-x-1/2 z-[100] bg-white text-gray-900 shadow-2xl border border-blue-200 rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all duration-500",
            isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
          )}
          onClick={() => setActiveSidebar('chat')}
        >
          <div className="relative">
            <Avatar 
               name={activeNotification.senderName} 
               src={toGoogleDriveEmbedUrl(activeNotification.senderAvatar)} 
               size="md" 
            />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white animate-pulse" />
          </div>
          <div className="max-w-55 md:max-w-[320px]">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] uppercase tracking-wider font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Tin nhắn mới</span>
              <p className="text-xs font-bold text-gray-500 truncate">{activeNotification.senderName}</p>
            </div>
            <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-tight">
               {activeNotification.content}
            </p>
          </div>
        </div>
      )}
      
      <CustomControlBar
        onLeave={onLeave}
        isTeacher={user.role === 'TEACHER' || user.role === 'ROLE_TEACHER'}
        egressId={egressId}
      />
    </>
  );
}
