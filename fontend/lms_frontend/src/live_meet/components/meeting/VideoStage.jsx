import {
  ParticipantTile,
  useTracks,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { useMemo } from 'react';
import { clsx } from 'clsx';

export default function VideoStage() {
  // 1. Lấy tất cả tracks (Cam & Screen)
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: false },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  // 2. Tìm track đang chia sẻ màn hình (Lấy cái đầu tiên tìm thấy)
  const screenShareTrack = useMemo(() => 
    tracks.find((t) => t.source === Track.Source.ScreenShare), 
    [tracks]
  );

  // 3. Lấy DANH SÁCH các camera đang bật (Lọc bỏ các track bị muted hoặc null)
  const activeCameraTracks = useMemo(() => {
    return tracks
      .filter((t) => 
        t.source === Track.Source.Camera && 
        t.publication && 
        !t.publication.isMuted && 
        t.publication.track
      )
      .slice(0, 2); // TỐI ĐA 2 VIDEO CAM theo yêu cầu
  }, [tracks]);

  return (
    <div className="flex-1 h-full bg-gray-900 relative overflow-hidden flex items-center justify-center">
      
      {/* --- MÀN HÌNH CHÍNH --- */}
      <div className="w-full h-full flex items-center justify-center p-2">
        {screenShareTrack ? (
          // Ưu tiên 1: Hiển thị màn hình chia sẻ làm trung tâm
          <ParticipantTile trackRef={screenShareTrack} className="w-full h-full object-contain rounded-lg overflow-hidden" />
        ) : activeCameraTracks.length > 0 ? (
          // Ưu tiên 2: Hiển thị lưới Camera (Tối đa 2)
          <div className={clsx(
            "grid w-full h-full gap-2",
            activeCameraTracks.length === 2 ? "grid-cols-2" : "grid-cols-1"
          )}>
            {activeCameraTracks.map((track) => (
              <ParticipantTile 
                key={track.publication?.trackSid || track.participant.identity} 
                trackRef={track} 
                className="w-full h-full object-cover rounded-lg overflow-hidden" 
              />
            ))}
          </div>
        ) : (
          // Ưu tiên 3: Giao diện chờ
          <div className="flex flex-col items-center gap-4">
             <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                <span className="text-gray-600 text-xl font-bold font-sans">LIVE</span>
             </div>
             <p className="text-gray-600 text-sm font-sans">Chờ tín hiệu từ giáo viên...</p>
          </div>
        )}
      </div>

      {/* --- Ô NHỎ GÓC DƯỚI (PiP) KHI SHARE MÀN HÌNH --- */}
      {screenShareTrack && activeCameraTracks.length > 0 && (
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-30">
          {activeCameraTracks.map((track) => (
            <div 
              key={`pip-${track.publication?.trackSid || track.participant.identity}`}
              className="w-40 md:w-56 aspect-video shadow-2xl border-2 border-white/20 rounded-lg overflow-hidden bg-black"
            >
              <ParticipantTile 
                trackRef={track} 
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Thông báo trạng thái đang share */}
      {screenShareTrack && (
        <div className="absolute top-4 left-4 bg-red-600/90 text-white px-3 py-1 rounded-full text-[10px] font-bold z-10 animate-pulse flex items-center gap-2 border border-red-500 shadow-lg">
          <div className="w-2 h-2 bg-white rounded-full" />
          ĐANG CHIA SẺ MÀN HÌNH
        </div>
      )}
    </div>
  );
}
