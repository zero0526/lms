import apiClient from "../axiosConfig";

/**
 * Get notifications for a user with pagination
 * @param {number} userId - User ID
 * @param {number} page - Page number (0-indexed)
 * @param {number} size - Number of notifications per page
 */
export const getNotifications = async (userId, page = 0, size = 10) => {
  try {
    const response = await apiClient.get(`/notification/user/${userId}`, {
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

/**
 * Get unread notifications for a user
 * @param {number} userId - User ID
 */
export const getUnreadNotifications = async (userId) => {
  try {
    const response = await apiClient.get(`/notification/user/${userId}/unread`);
    return response.data;
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    throw error;
  }
};

/**
 * Get count of unread notifications
 * @param {number} userId - User ID
 */
export const getUnreadCount = async (userId) => {
  try {
    const response = await apiClient.get(`/notification/user/${userId}/unread-count`);
    return response.data;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    throw error;
  }
};

/**
 * Mark a single notification as read
 * @param {number} notificationId - Notification ID
 */
export const markAsRead = async (notificationId) => {
  try {
    const response = await apiClient.put(`/notification/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

/**
 * Mark all notifications as read for a user
 * @param {number} userId - User ID
 */
export const markAllAsRead = async (userId) => {
  try {
    const response = await apiClient.put(`/notification/user/${userId}/read-all`);
    return response.data;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

/**
 * Format notification date from array to readable string
 * @param {Array} dateArray - [year, month, day, hour, minute, second, nano]
 */
export const formatNotificationDate = (dateArray) => {
  if (!dateArray || !Array.isArray(dateArray)) return "";
  
  try {
    const [year, month, day, hour, minute] = dateArray;
    const date = new Date(year, month - 1, day, hour, minute);
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: year !== now.getFullYear() ? 'numeric' : undefined
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};
