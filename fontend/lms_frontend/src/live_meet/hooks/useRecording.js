import { useState } from 'react';
import { useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { MeetingService } from '../services/api';

export const useRecording = (roomName, initialEgressId = null) => {
  const [isRecording, setIsRecording] = useState(!!initialEgressId);
  const [isLoading, setIsLoading] = useState(false);
  const [egressId, setEgressId] = useState(initialEgressId);

  // Kiểm tra xem có track nào đang active không
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: false },
      { source: Track.Source.Microphone, withPlaceholder: false },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  const startRecording = async () => {
    // Kiểm tra xem có track nào đang active không
    const activeTracks = tracks.filter(
      (t) => t.publication && !t.publication.isMuted && t.publication.track
    );

    if (activeTracks.length === 0) {
      const confirmed = confirm(
        '⚠️ CẢNH BÁO: Không phát hiện tín hiệu video/audio!\n\n' +
        'Để ghi hình thành công, vui lòng:\n' +
        '1. BẬT CAMERA hoặc MICRO của bạn, HOẶC\n' +
        '2. BẬT CHIA SẺ MÀN HÌNH\n\n' +
        'Bạn có muốn tiếp tục ghi hình không?\n' +
        '(Lưu ý: Nếu không có tín hiệu, ghi hình sẽ thất bại sau 15 giây)'
      );
      
      if (!confirmed) {
        return;
      }
    }

    setIsLoading(true);
    try {
      const result = await MeetingService.startRecording(roomName);
      const id = result.egressId;
      if (id && id !== 'error') {
        setEgressId(id);
        setIsRecording(true);
      } else {
        throw new Error('Không nhận được ID bản ghi');
      }
    } catch (error) {
      console.error('Start recording error:', error);
      alert(error.message || "Không thể bắt đầu ghi hình");
    } finally {
      setIsLoading(false);
    }
  };

  const stopRecording = async () => {
    if (!egressId) {
      alert("Không tìm thấy ID bản ghi để dừng");
      return;
    }
    setIsLoading(true);
    try {
      await MeetingService.stopRecording(roomName, egressId);
      setIsRecording(false);
      setEgressId(null);
    } catch (error) {
      console.error('Stop recording error:', error);
      alert(error.message || "Lỗi khi dừng ghi hình");
    } finally {
      setIsLoading(false);
    }
  };

  return { isRecording, isLoading, startRecording, stopRecording };
};
