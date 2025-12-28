import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMeetingJoin } from '../hooks/useMeetingJoin';
import PreJoinScreen from '../components/join/PreJoinForm';
import MeetingContainer from '../components/meeting/MeetingContainer';

export default function MeetingPage() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  
  const { joinMeeting, getPreviewInfo, isLoading, error } = useMeetingJoin();
  
  // State save connection data after joining
  const [connectionData, setConnectionData] = useState(null);
  
  const [previewData, setPreviewData] = useState(null);

  // Update handleJoin function in MeetingPage
  const handleJoin = async (alias) => {
    if (!meetingId) return;
      
    const result = await joinMeeting({
      meetingId: Number(meetingId),
      alias: alias
    });
  
    console.log("result join room", result);
  
    if (result) {
      setConnectionData({
        token: result.token,
        wsUrl: result.wsUrl, 
        sessionId: result.sessionId,
        roomName: result.roomName,
        user: { 
          userId: String(result.userId), 
          name: result.name, 
          role: result.role || 'STUDENT',
          avatar: result.avatar
        },
        egressId: result.egressId
      });
    }
  };

  // Get preview information before joining
  useEffect(() => {
    const fetchPreview = async () => {
      if (meetingId && !connectionData) {
        const preview = await getPreviewInfo(meetingId);
        if (preview) {
          setPreviewData({
            defaultName: preview.defaultName,
            meetingTitle: preview.meetingTitle,
            role: preview.role
          });
        }
      }
    };
    fetchPreview();
  }, [meetingId]);


  if (isLoading && !connectionData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
           <p className="text-gray-500">
             {!previewData ? 'Preparing meeting room...' : 'Joining the room...'}
           </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // 1. If no Token -> Show name input screen (PreJoin)
  if (!connectionData) {
    return (
      <PreJoinScreen 
        user={previewData ? { name: previewData.defaultName } : undefined}
        onJoin={handleJoin} 
      />
    );
  }

  // 2. If Token exists -> Show meeting room
  return (
    <MeetingContainer 
      token={connectionData.token}
      wsUrl={connectionData.wsUrl}
      sessionId={connectionData.sessionId}
      user={connectionData.user}
      egressId={connectionData.egressId}
      onLeave={() => navigate('/meeting/ended', { 
        state: { 
          meetingId: Number(meetingId),
          name: connectionData?.user.name
        } 
      })}
    />
  );
}
