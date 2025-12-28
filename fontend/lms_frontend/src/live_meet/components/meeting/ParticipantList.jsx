import { useState } from 'react';
import { useParticipants, useRoomContext } from '@livekit/components-react';
import { UserX, VolumeX, Loader2, MonitorOff, CameraOff, Lock, Unlock, MessageSquareOff } from 'lucide-react';
import { Avatar, Button } from '../common';
import { ManagementService } from '../../services/api';
import { toGoogleDriveEmbedUrl } from '../../utils/common';
import { clsx } from 'clsx';

export default function ParticipantList({ isTeacher }) {
  const participants = useParticipants();
  const room = useRoomContext();
  const sortedParticipants = participants.sort((a, b) => (a.isLocal ? -1 : 1));
  
  const [loadingAction, setLoadingAction] = useState(null);

  const handleMute = async (identity) => {
    setLoadingAction(`mute-${identity}`);
    try {
      await ManagementService.muteUser(room.name, identity, true);
    } catch (error) {
      console.error("Failed to mute user:", error);
      alert(error.message || "Unable to mute user");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleMuteCamera = async (identity) => {
    setLoadingAction(`mute-cam-${identity}`);
    try {
      await ManagementService.muteCamera(room.name, identity, true);
    } catch (error) {
      console.error("Failed to mute camera:", error);
      alert(error.message || "Unable to mute user's camera");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleStopScreenShare = async (identity) => {
    setLoadingAction(`stop-screen-${identity}`);
    try {
      await ManagementService.stopScreenShare(room.name, identity);
    } catch (error) {
      console.error("Failed to stop screen share:", error);
      alert(error.message || "Unable to stop screen share");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleKick = async (identity) => {
    const participant = participants.find(p => p.identity === identity);
  
    const displayName = participant?.name || identity;
    if (!confirm(`Are you sure you want to remove ${displayName} from the room?`)) return;
    
    setLoadingAction(`kick-${identity}`);
    try {
      await ManagementService.kickUser(room.name, identity);
    } catch (error) {
      console.error("Failed to kick user:", error);
      alert(error.message || "Unable to remove user");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleKickAll = async () => {
    if (!confirm("WARNING: Are you sure you want to remove ALL students from the room and end the meeting?")) return;
    setLoadingAction('kick-all');
    try {
      await ManagementService.kickAll(room.name);
    } catch (error) {
      console.error("Failed to kick all:", error);
      alert("Error removing all users from the room");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleTogglePermission = async (identity, currentPerms, field) => {
    setLoadingAction(`perm-${identity}-${field}`);
    try {
      const newPerms = {
        canPublish: field === 'canPublish' ? !currentPerms.canPublish : currentPerms.canPublish,
        canPublishData: field === 'canPublishData' ? !currentPerms.canPublishData : currentPerms.canPublishData,
      };
      await ManagementService.updatePermissions(room.name, identity, newPerms.canPublish, newPerms.canPublishData);
    } catch (error) {
      console.error("Failed to update permissions:", error);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleMuteAll = async () => {
    setLoadingAction('mute-all');
    try {
      await ManagementService.muteAll(room.name, true);
    } catch (error) {
      console.error("Failed to mute all:", error);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleMuteCameraAll = async () => {
    setLoadingAction('mute-cam-all');
    try {
      await ManagementService.muteCameraAll(room.name, true);
    } catch (error) {
      console.error("Failed to mute all cameras:", error);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleStopScreenShareAll = async () => {
    setLoadingAction('stop-screen-all');
    try {
      await ManagementService.stopScreenShareAll(room.name);
    } catch (error) {
      console.error("Failed to stop all screen shares:", error);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <span className="font-semibold text-gray-700">Participants ({participants.length})</span>
        
        {/* Global Controls for Teacher */}
        {isTeacher && (
           <div className="flex items-center gap-1">
             <Button 
               variant="ghost" size="sm" className="p-1.5 h-8 w-8 text-orange-500 hover:bg-orange-50"
               onClick={handleMuteAll}
               disabled={loadingAction === 'mute-all'}
               title="Disable all microphones"
             >
               {loadingAction === 'mute-all' ? <Loader2 size={14} className="animate-spin" /> : <VolumeX size={14} />}
             </Button>
             <Button 
               variant="ghost" size="sm" className="p-1.5 h-8 w-8 text-red-500 hover:bg-red-50"
               onClick={handleMuteCameraAll}
               disabled={loadingAction === 'mute-cam-all'}
               title="Mute all cameras"
             >
               {loadingAction === 'mute-cam-all' ? <Loader2 size={14} className="animate-spin" /> : <CameraOff size={14} />}
             </Button>
             <Button 
               variant="ghost" size="sm" className="p-1.5 h-8 w-8 text-blue-500 hover:bg-blue-50"
               onClick={handleStopScreenShareAll}
               disabled={loadingAction === 'stop-screen-all'}
               title="Stop all screen shares"
             >
               {loadingAction === 'stop-screen-all' ? <Loader2 size={14} className="animate-spin" /> : <MonitorOff size={14} />}
             </Button>
             <Button 
               variant="ghost" size="sm" className="p-1.5 h-8 w-8 text-red-600 hover:bg-red-50"
               onClick={handleKickAll}
               disabled={loadingAction === 'kick-all'}
               title="Remove all participants from room"
             >
               {loadingAction === 'kick-all' ? <Loader2 size={14} className="animate-spin" /> : <UserX size={14} />}
             </Button>
           </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {sortedParticipants.map((p) => {
          const metadata = JSON.parse(p.metadata || '{}');
          return (
            <div key={p.identity} className="flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-100 group">
              <div className="flex items-center gap-3 overflow-hidden">
                <Avatar name={p.name} src={toGoogleDriveEmbedUrl(metadata.avatar)} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {p.name || `User ${p.identity}`}
                  {p.isLocal && <span className="text-blue-600 ml-1">(You)</span>}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">
                    {metadata.role || 'STUDENT'}
                  </p>
                  {p.isScreenShareEnabled && (
                    <span className="text-[9px] bg-blue-100 text-blue-600 px-1 rounded font-bold animate-pulse">SHARING</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Teacher Controls */}
              {isTeacher && !p.isLocal && (
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  {/* Permission: Allow/Mute interaction (Mic/Cam) */}
                  <Button 
                    variant="ghost" size="sm" className={clsx("p-1 h-8 w-8", p.permissions?.canPublish ? "text-green-500 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100")}
                    onClick={() => handleTogglePermission(p.identity, p.permissions, 'canPublish')}
                    disabled={loadingAction?.startsWith('perm-')}
                    title={p.permissions?.canPublish ? "Mute Cam/Mic" : "Allow Cam/Mic"}
                  >
                    {loadingAction === `perm-${p.identity}-canPublish` ? <Loader2 size={14} className="animate-spin" /> : (p.permissions?.canPublish ? <Unlock size={14} /> : <Lock size={14} />)}
                  </Button>

                  {/* Permission: Allow/Mute Chat */}
                  <Button 
                    variant="ghost" size="sm" className={clsx("p-1 h-8 w-8", p.permissions?.canPublishData ? "text-blue-500 hover:bg-blue-50" : "text-gray-400 hover:bg-gray-100")}
                    onClick={() => handleTogglePermission(p.identity, p.permissions, 'canPublishData')}
                    disabled={loadingAction?.startsWith('perm-')}
                    title={p.permissions?.canPublishData ? "Mute Chat" : "Allow Chat"}
                  >
                    {loadingAction === `perm-${p.identity}-canPublishData` ? <Loader2 size={14} className="animate-spin" /> : (p.permissions?.canPublishData ? <Unlock size={14} /> : <MessageSquareOff size={14} />)}
                  </Button>

                  {/* Quick mute Mic if enabled */}
                  {p.isMicrophoneEnabled && (
                    <Button 
                      variant="ghost" size="sm" className="p-1 h-8 w-8 text-orange-500 hover:bg-orange-50"
                      onClick={() => handleMute(p.identity)}
                      disabled={loadingAction === `mute-${p.identity}`}
                      title="Mute Microphone"
                    >
                      {loadingAction === `mute-${p.identity}` ? <Loader2 size={14} className="animate-spin" /> : <VolumeX size={14} />}
                    </Button>
                  )}

                  {/* Quick mute Cam if enabled */}
                  {p.isCameraEnabled && (
                    <Button 
                      variant="ghost" size="sm" className="p-1 h-8 w-8 text-red-500 hover:bg-red-50"
                      onClick={() => handleMuteCamera(p.identity)}
                      disabled={loadingAction === `mute-cam-${p.identity}`}
                      title="Mute Camera"
                    >
                      {loadingAction === `mute-cam-${p.identity}` ? <Loader2 size={14} className="animate-spin" /> : <CameraOff size={14} />}
                    </Button>
                  )}

                  {/* Quick stop Share if enabled */}
                  {p.isScreenShareEnabled && (
                    <Button 
                      variant="ghost" size="sm" className="p-1 h-8 w-8 text-blue-500 hover:bg-blue-50"
                      onClick={() => handleStopScreenShare(p.identity)}
                      disabled={loadingAction === `stop-screen-${p.identity}`}
                      title="Stop screen sharing"
                    >
                      {loadingAction === `stop-screen-${p.identity}` ? <Loader2 size={14} className="animate-spin" /> : <MonitorOff size={14} />}
                    </Button>
                  )}

                  <Button 
                    variant="ghost" size="sm" className="p-1 h-8 w-8 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    onClick={() => handleKick(p.identity)}
                    disabled={loadingAction === `kick-${p.identity}`}
                    title="Remove from room"
                  >
                    {loadingAction === `kick-${p.identity}` ? <Loader2 size={14} className="animate-spin" /> : <UserX size={14} />}
                  </Button>
                </div>
              )}
            </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
