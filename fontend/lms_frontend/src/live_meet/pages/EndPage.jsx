import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RefreshCcw, Home, Star } from 'lucide-react';
import { Button, Card } from '../components/common';

export default function EndPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Rating State (Tùy chọn: để user đánh giá chất lượng buổi học)
  const [rating, setRating] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Lấy dữ liệu từ navigation state
  const previousMeetingId = location.state?.meetingId;
  const userName = location.state?.name;

  const handleRejoin = () => {
    if (previousMeetingId) {
      navigate(`/meeting/room/${previousMeetingId}${location.search}`); // Giữ nguyên params
    } else {
      navigate(-1); // Quay lại trang trước
    }
  };

  const handleGoHome = () => {
    navigate('/home');
  };

  const handleRate = (star) => {
    setRating(star);
    // TODO: Gọi API gửi đánh giá về Backend nếu cần
    setTimeout(() => setIsSubmitted(true), 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center space-y-6">
        
        {/* Icon / Image minh họa */}
        <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-4xl">👋</span>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cuộc gọi đã kết thúc</h2>
          <p className="text-gray-500 mt-2">
            Cảm ơn {userName || 'bạn'} đã tham gia buổi học.
          </p>
        </div>

        {/* Phần đánh giá (Optional) */}
        {!isSubmitted ? (
          <div className="py-4 border-t border-b border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-3">Chất lượng buổi học thế nào?</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRate(star)}
                  className={`transition-transform hover:scale-110 focus:outline-none ${
                    star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                  }`}
                >
                  <Star size={32} fill={star <= rating ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-4 text-green-600 font-medium bg-green-50 rounded-lg">
            Cảm ơn đánh giá của bạn!
          </div>
        )}

        {/* Các nút hành động */}
        <div className="flex flex-col gap-3">
          {previousMeetingId && (
            <Button 
              variant="primary" 
              onClick={handleRejoin}
              className="w-full"
              icon={<RefreshCcw size={18} />}
            >
              Tham gia lại
            </Button>
          )}

          <Button 
            variant="ghost" 
            onClick={handleGoHome}
            className="w-full"
            icon={<Home size={18} />}
          >
            Về trang chủ
          </Button>
        </div>
        
        <div className="text-xs text-gray-400 mt-6">
           Bạn có thể đóng tab này trình duyệt này ngay bây giờ.
        </div>
      </Card>
    </div>
  );
}
