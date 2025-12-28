import { useState } from 'react';
import { MeetingService } from '../services/api';

export const useMeetingJoin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const joinMeeting = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await MeetingService.joinMeeting(data);
      return result;
    } catch (err) {
      console.error('Join meeting error:', err);
      const msg = err.message || "Unable to join the meeting.";
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getPreviewInfo = async (meetingId) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await MeetingService.getPreviewInfo(meetingId);
      return result;
    } catch (err) {
      console.error('Get preview error:', err);
      setError(err.message || "Unable to get meeting preview information.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { joinMeeting, getPreviewInfo, isLoading, error };
};
