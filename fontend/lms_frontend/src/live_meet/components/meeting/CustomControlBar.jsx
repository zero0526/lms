import { useEffect, useState } from 'react';
import { Track } from 'livekit-client';
import {
  useRoomContext,
  useTrackToggle,
  useLocalParticipant,
} from '@livekit/components-react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  PhoneOff,
  Disc,
} from 'lucide-react';
import { Button } from '../common';
import { useScreenShareProtection } from '../../hooks/useScreenShareProtection';
import { useRecording } from '../../hooks/useRecording';
import { ManagementService } from '../../services/api';

export default function CustomControlBar({
  onLeave,
  isTeacher,
  egressId: initialEgressId,
}) {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();

  /* ================= MIC (GIỮ useTrackToggle) ================= */
  const {
    toggle: toggleMic,
    enabled: isMicOn,
  } = useTrackToggle({
    source: Track.Source.Microphone,
  });

  /* ================= CAMERA (DÙNG API CHUẨN) ================= */
  const [camBusy, setCamBusy] = useState(false);
  const isCamOn = localParticipant?.isCameraEnabled ?? false;

  const handleToggleCam = async () => {
    if (camBusy) return;

    // Check Permission
    if (!localParticipant?.permissions?.canPublish) {
      alert('Giáo viên đã khóa quyền sử dụng Camera của bạn.');
      return;
    }

    console.log('Toggle Camera. Current:', isCamOn);
    setCamBusy(true);

    try {
      await localParticipant.setCameraEnabled(!isCamOn);
    } catch (e) {
      console.error('Camera error:', e);
      alert('Không thể truy cập Camera. Vui lòng kiểm tra quyền trình duyệt.');
    } finally {
      setCamBusy(false);
    }
  };

  /* ================= MIC HANDLER ================= */
  const handleToggleMic = async () => {
    // Check Permission
    if (!localParticipant?.permissions?.canPublish) {
      alert('Giáo viên đã khóa quyền sử dụng Micro của bạn.');
      return;
    }

    try {
      await toggleMic();
    } catch (e) {
      console.error('Mic error:', e);
    }
  };

  /* ================= SCREEN SHARE + RECORD ================= */
  const { isSomeoneElseSharing, amISharing, toggleScreenShare } =
    useScreenShareProtection();

  const {
    isRecording,
    isLoading: isRecLoading,
    startRecording,
    stopRecording,
  } = useRecording(room.name, initialEgressId);

  /* ================= DEBUG LOG ================= */
  useEffect(() => {
    console.log('--- ROOM STATE ---');
    console.log('Mic:', isMicOn);
    console.log('Cam:', isCamOn);
    console.log('Room:', room.state);
  }, [isMicOn, isCamOn, room.state]);

  /* ================= UI ================= */
  return (
    <div className="h-20 bg-gray-900 border-t border-gray-800 flex items-center justify-center gap-4 px-4 z-50">
      
      {/* Mic */}
      <Button
        onClick={handleToggleMic}
        className={`rounded-full w-12 h-12 ${
          isMicOn ? 'bg-gray-700 text-green-400' : 'bg-red-600 text-white'
        }`}
      >
        {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
      </Button>

      {/* Camera */}
      <Button
        onClick={handleToggleCam}
        disabled={camBusy}
        className={`rounded-full w-12 h-12 ${
          isCamOn ? 'bg-gray-700 text-green-400' : 'bg-red-600 text-white'
        }`}
      >
        {isCamOn ? <Video size={20} /> : <VideoOff size={20} />}
      </Button>

      {/* Screen Share */}
      <Button
        onClick={toggleScreenShare}
        disabled={isSomeoneElseSharing}
        className={`rounded-full w-12 h-12 ${
          amISharing ? 'bg-blue-600 text-white' : 'bg-gray-700'
        }`}
      >
        <MonitorUp size={20} />
      </Button>

      {/* Recording */}
      {isTeacher ? (
        <Button
          onClick={() => (isRecording ? stopRecording() : startRecording())}
          disabled={isRecLoading}
          className={`flex flex-col items-center justify-center rounded-xl min-w-[64px] h-16 transition-all ${
            isRecording ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <Disc size={20} className={isRecording ? 'animate-pulse' : ''} />
          <span className="text-[10px] mt-1 font-medium">
            {isRecording ? 'Dừng ghi' : 'Ghi hình'}
          </span>
        </Button>
      ) : isRecording && (
        <div className="flex flex-col items-center justify-center rounded-xl min-w-[64px] h-16 bg-red-500/10 text-red-500 border border-red-500/20 px-2">
          <Disc size={20} className="animate-pulse" />
          <span className="text-[10px] mt-1 font-medium text-center leading-tight">Đang ghi...</span>
        </div>
      )}

      {/* Leave / End */}
      <Button
        onClick={async () => {
          if (isTeacher) {
            if (confirm("Bạn có chắc chắn muốn kết thúc lớp học cho tất cả mọi người?")) {
              try {
                await ManagementService.endMeeting(room.name);
                onLeave();
              } catch (e) {
                console.error("Failed to end meeting:", e);
                await room.disconnect();
                onLeave();
              }
            }
          } else {
            await room.disconnect();
            onLeave();
          }
        }}
        className="bg-red-600 hover:bg-red-700 text-white px-6 rounded-full ml-4"
      >
        <PhoneOff size={20} />
        {isTeacher ? 'Kết thúc' : 'Rời khỏi'}
      </Button>
    </div>
  );
}
