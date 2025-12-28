import { useRoomContext, useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { useMemo, useCallback } from 'react';
import { ManagementService } from '../services/api';

export const useScreenShareProtection = () => {
  const room = useRoomContext();
  
  // 1. Get screen share tracks
  const screenTracks = useTracks([Track.Source.ScreenShare]);

  // 2. Check if someone else is sharing
  const isSomeoneElseSharing = useMemo(() => {
    return screenTracks.some(
      (track) => track.participant.identity !== room.localParticipant.identity
    );
  }, [screenTracks, room.localParticipant.identity]);

  // 3. Am I currently sharing
  const amISharing = room.localParticipant.isScreenShareEnabled;

  // 4. Toggle screen share with Backend synchronization
  const toggleScreenShare = useCallback(async () => {
    const newState = !amISharing;

    try {
      if (newState) {
        // Want to enable: Must request permission from Backend
        await ManagementService.acquireScreenShare(room.name);
        await room.localParticipant.setScreenShareEnabled(true);
      } else {
        // Want to disable: Disable first then notify Backend to release
        await room.localParticipant.setScreenShareEnabled(false);
        await ManagementService.releaseScreenShare(room.name);
      }
    } catch (err) {
      if (err.status === 409) {
        alert("Someone else is sharing the screen. Please wait!");
      } else {
        console.error("Screen Share error:", err);
        alert(err.message || "Unable to process screen share request");
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
