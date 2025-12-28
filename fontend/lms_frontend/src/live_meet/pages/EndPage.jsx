import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RefreshCcw, Home, Star } from 'lucide-react';
import { Button, Card } from '../components/common';

export default function EndPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Rating state
  const [rating, setRating] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Get data from navigation state
  const previousMeetingId = location.state?.meetingId;
  const userName = location.state?.name;

  const handleRejoin = () => {
    if (previousMeetingId) {
      navigate(`/meeting/room/${previousMeetingId}${location.search}`); // Keep params
    } else {
      navigate(-1); // Go back to previous page
    }
  };

  const handleGoHome = () => {
    navigate('/home');
  };

  const handleRate = (star) => {
    setRating(star);
    // TODO: Call API to send rating to Backend if needed
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
          <h2 className="text-2xl font-bold text-gray-900">Meeting Ended</h2>
          <p className="text-gray-500 mt-2">
            Thank you {userName || 'you'} for attending the meeting.
          </p>
        </div>

        {/* Rating section (Optional) */}
        {!isSubmitted ? (
          <div className="py-4 border-t border-b border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-3">How was the session quality?</p>
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
            Thank you for your rating!
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          {previousMeetingId && (
            <Button 
              variant="primary" 
              onClick={handleRejoin}
              className="w-full"
              icon={<RefreshCcw size={18} />}
            >
              Rejoin
            </Button>
          )}

          <Button 
            variant="ghost" 
            onClick={handleGoHome}
            className="w-full"
            icon={<Home size={18} />}
          >
            Go Home
          </Button>
        </div>
        
        <div className="text-xs text-gray-400 mt-6">
           You can close this browser tab now.
        </div>
      </Card>
    </div>
  );
}
