import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';
const API_URL = `${API_BASE_URL}/api`;

// LiveKit WebSocket URL - used to replace Docker hostname
const LIVEKIT_WS_URL = import.meta.env.VITE_LIVEKIT_WS_URL || 'ws://localhost:7880';

/**
 * Convert wsUrl from Docker hostname to localhost/public hostname
 * Backend returns ws://livekit:7880 but browser needs ws://localhost:7880
 */
const normalizeWsUrl = (wsUrl) => {
  if (!wsUrl) return wsUrl;
  
  try {
    const url = new URL(wsUrl);
    // If hostname is "livekit" (Docker internal), replace with LIVEKIT_WS_URL
    if (url.hostname === 'livekit') {
      const targetUrl = new URL(LIVEKIT_WS_URL);
      url.hostname = targetUrl.hostname;
      url.port = targetUrl.port || url.port;
      url.protocol = targetUrl.protocol;
      return url.toString();
    }
    return wsUrl;
  } catch (e) {
    console.error('Error normalizing wsUrl:', e);
    return wsUrl;
  }
};

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Support sending cookies
});

/**
 * Function to get the user's accessToken
 * Priority: localStorage -> sessionStorage -> cookie
 */
const getAccessToken = () => {
  // 1. Check localStorage
  const localToken = localStorage.getItem('accessToken');
  if (localToken) return localToken;

  // 2. Check sessionStorage
  const sessionToken = sessionStorage.getItem('accessToken');
  if (sessionToken) return sessionToken;

  // 3. Check cookie (accessToken is not an HTTP-only cookie)
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'accessToken' && value) {
      return value;
    }
  }

  return null;
};

// Request interceptor to add Authorization header
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = {
      message: error.response?.data?.message || error.message || 'An unknown error occurred',
      status: error.response?.status,
      response: error.response,
    };
    return Promise.reject(apiError);
  }
);

// ============================================================================
// Meeting Service
// ============================================================================

export const MeetingService = {
  /**
   * Join a meeting room
   * @param {Object} data - Meeting join request data
   * @returns {Promise<Object>} Meeting connection details (token, wsUrl, sessionId, roomName)
   */
  joinMeeting: async (data) => {
    const response = await api.post('/meeting/join', data);
    const result = response.data;
    
    // Normalize wsUrl để browser có thể kết nối
    if (result && result.wsUrl) {
      result.wsUrl = normalizeWsUrl(result.wsUrl);
    }
    
    return result;
  },

  /**
   * Get meeting preview info
   * @param {number|string} meetingId - Meeting ID
   */
  getPreviewInfo: async (meetingId) => {
    const response = await api.get(`/meeting/preview/${meetingId}`);
    return response.data;
  },

  /**
   * Start recording a meeting (Teacher only)
   * @param {string} roomName - Name of the room to record
   * @returns {Promise<Object>} Recording details including egressId
   */
  startRecording: async (roomName) => {
    const response = await api.post('/meeting/record/start', { roomName });
    return response.data;
  },

  /**
   * Stop an active recording
   * @param {string} roomName - Name of the room
   * @param {string} egressId - ID of the egress to stop
   */
  stopRecording: async (roomName, egressId) => {
    const response = await api.post('/meeting/record/stop', { roomName, egressId });
    return response.data;
  },
};

// ============================================================================
// Management Service
// ============================================================================

export const ManagementService = {
  /**
   * Mute or unmute a participant (Teacher only)
   */
  muteUser: async (roomName, identity, mute) => {
    const response = await api.post(
      `/meeting/manage/mute?roomName=${encodeURIComponent(roomName)}&identity=${encodeURIComponent(identity)}&mute=${mute}`
    );
    return response.data;
  },

  /**
   * Kick a participant from the room (Teacher only)
   */
  kickUser: async (roomName, identity) => {
    const response = await api.post(
      `/meeting/manage/kick?roomName=${encodeURIComponent(roomName)}&identity=${encodeURIComponent(identity)}`
    );
    return response.data;
  },

  muteCamera: async (roomName, identity, mute) => {
    const response = await api.post(
      `/meeting/manage/mute-camera?roomName=${encodeURIComponent(roomName)}&identity=${encodeURIComponent(identity)}&mute=${mute}`
    );
    return response.data;
  },

  stopScreenShare: async (roomName, identity) => {
    const response = await api.post(
      `/meeting/manage/stop-screen-share?roomName=${encodeURIComponent(roomName)}&identity=${encodeURIComponent(identity)}`
    );
    return response.data;
  },

  muteAll: async (roomName, mute) => {
    const response = await api.post(
      `/meeting/manage/mute-all?roomName=${encodeURIComponent(roomName)}&mute=${mute}`
    );
    return response.data;
  },

  muteCameraAll: async (roomName, mute) => {
    const response = await api.post(
      `/meeting/manage/mute-camera-all?roomName=${encodeURIComponent(roomName)}&mute=${mute}`
    );
    return response.data;
  },

  stopScreenShareAll: async (roomName) => {
    const response = await api.post(
      `/meeting/manage/stop-screen-share-all?roomName=${encodeURIComponent(roomName)}`
    );
    return response.data;
  },

  kickAll: async (roomName) => {
    const response = await api.post(
      `/meeting/manage/kick-all?roomName=${encodeURIComponent(roomName)}`
    );
    return response.data;
  },

  updatePermissions: async (roomName, identity, canPublish, canPublishData) => {
    const response = await api.post(
      `/meeting/manage/permissions?roomName=${encodeURIComponent(roomName)}&identity=${encodeURIComponent(identity)}&canPublish=${canPublish}&canPublishData=${canPublishData}`
    );
    return response.data;
  },

  /**
   * End the meeting for all participants (Teacher only)
   */
  endMeeting: async (roomName) => {
    const response = await api.post(
      `/meeting/manage/end?roomName=${encodeURIComponent(roomName)}`
    );
    return response.data;
  },

  /**
   * Acquire screen share permission
   */
  acquireScreenShare: async (roomName) => {
    const response = await api.post(
      `/meeting/manage/screen-share/acquire?roomName=${encodeURIComponent(roomName)}`
    );
    return response.data;
  },

  /**
   * Release screen share permission
   */
  releaseScreenShare: async (roomName) => {
    const response = await api.post(
      `/meeting/manage/screen-share/release?roomName=${encodeURIComponent(roomName)}`
    );
    return response.data;
  },
};

// ============================================================================
// Chat Service
// ============================================================================

export const ChatService = {
  /**
   * Send a chat message
   * @param {number} sessionId - Session ID
   * @param {number|null} userId - User ID (can be null for guests)
   * @param {string} content - Message content
   * @param {number} [replyToMessageId] - Optional ID of message being replied to
   */
  sendMessage: async (sessionId, userId, content, replyToMessageId) => {
    const response = await api.post('/chat/send', {
      sessionId,
      userId,
      content,
      replyToMessageId,
    });
    return response.data;
  },

  /**
   * Get chat history for a session
   * @param {number} sessionId - Session ID
   */
  getHistory: async (sessionId) => {
    const response = await api.get(`/chat/history/${sessionId}`);
    return response.data;
  },
};
