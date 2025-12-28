import { useState } from 'react';
import { useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { MeetingService } from '../services/api';

export const useRecording = (roomName, initialEgressId = null) => {
  const [isRecording, setIsRecording] = useState(!!initialEgressId);
  const [isLoading, setIsLoading] = useState(false);
  const [egressId, setEgressId] = useState(initialEgressId);

  // Check active tracks
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: false },
      { source: Track.Source.Microphone, withPlaceholder: false },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  const startRecording = async () => {
    // Check if any track is currently active
    const activeTracks = tracks.filter(
      (t) => t.publication && !t.publication.isMuted && t.publication.track
    );

    if (activeTracks.length === 0) {
      const confirmed = confirm(
        'WARNING: No video/audio signal detected!\n\n' +
        'To successfully record, please:\n' +
        '1. TURN ON your CAMERA or MICROPHONE, OR\n' +
        '2. TURN ON SCREEN SHARING\n\n' +
        'Do you want to continue recording?\n' +
        '(Note: Recording will fail after 15 seconds if no signal is detected)'
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
        throw new Error('Did not receive recording ID');
      }
    } catch (error) {
      console.error('Start recording error:', error);
      alert(error.message || "Unable to start recording");
    } finally {
      setIsLoading(false);
    }
  };

  const stopRecording = async () => {
    if (!egressId) {
      alert("Recording ID not found to stop");
      return;
    }
    setIsLoading(true);
    try {
      await MeetingService.stopRecording(roomName, egressId);
      setIsRecording(false);
      setEgressId(null);
    } catch (error) {
      console.error('Stop recording error:', error);
      alert(error.message || "Error stopping recording");
    } finally {
      setIsLoading(false);
    }
  };

  return { isRecording, isLoading, startRecording, stopRecording };
};
