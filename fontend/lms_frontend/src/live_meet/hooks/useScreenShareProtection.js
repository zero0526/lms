import { useRoomContext, useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { useMemo, useCallback } from 'react';
import { ManagementService } from '../services/api';

export const useScreenShareProtection = () => {
  const room = useRoomContext();
  
  // 1. Lấy danh sách screen tracks trong phòng
  const screenTracks = useTracks([Track.Source.ScreenShare]);

  // 2. Kiểm tra xem có ai khác share không
  const isSomeoneElseSharing = useMemo(() => {
    return screenTracks.some(
      (track) => track.participant.identity !== room.localParticipant.identity
    );
  }, [screenTracks, room.localParticipant.identity]);

  // 3. Tôi có đang share không
  const amISharing = room.localParticipant.isScreenShareEnabled;

  // 4. Toggle screen share có đồng bộ Backend
  const toggleScreenShare = useCallback(async () => {
    const newState = !amISharing;

    try {
      if (newState) {
        // Muốn bật: Phải xin phép Backend
        await ManagementService.acquireScreenShare(room.name);
        await room.localParticipant.setScreenShareEnabled(true);
      } else {
        // Muốn tắt: Tắt xong báo Backend release
        await room.localParticipant.setScreenShareEnabled(false);
        await ManagementService.releaseScreenShare(room.name);
      }
    } catch (err) {
      if (err.status === 409) {
        alert("Đang có người khác chia sẻ màn hình. Vui lòng đợi!");
      } else {
        console.error("Lỗi Screen Share:", err);
        alert(err.message || "Không thể thực hiện yêu cầu chia sẻ màn hình");
      }
    }
  }, [amISharing, room.localParticipant, room.name]);

  return {
    isSomeoneElseSharing,
    amISharing,
    toggleScreenShare,
    screenTracks
  };
};
