import apiClient from "./axiosConfig";

/**
 * ==================== POST APIs ====================
 */

/**
 * Create a new post
 * @param {Object} postData - { courseId, title, content, isPinned }
 */
export const createPost = async (postData) => {
  try {
    const response = await apiClient.post("/posts", postData);
    return response.data;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

/**
 * Get posts by course ID with pagination
 * @param {number} courseId - Course ID
 * @param {number} page - Page number (0-indexed)
 * @param {number} limit - Number of posts per page
 */
export const getPostsByCourse = async (courseId, page = 0, limit = 10) => {
  try {
    const response = await apiClient.get(`/posts/course/${courseId}`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};

/**
 * Update a post
 * @param {number} postId - Post ID
 * @param {Object} postData - { courseId, title, content }
 */
export const updatePost = async (postId, postData) => {
  try {
    const response = await apiClient.put(`/posts/${postId}`, postData);
    return response.data;
  } catch (error) {
    console.error("Error updating post:", error);
    throw error;
  }
};

/**
 * Delete a post
 * @param {number} postId - Post ID
 */
export const deletePost = async (postId) => {
  try {
    const response = await apiClient.delete(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
};

/**
 * ==================== COMMENT APIs ====================
 */

/**
 * Create a comment or reply
 * @param {Object} commentData - { postId, content, parentCommentId (optional) }
 */
export const createComment = async (commentData) => {
  try {
    const response = await apiClient.post("/posts/comments", commentData);
    return response.data;
  } catch (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
};

/**
 * Get comments for a post
 * @param {number} postId - Post ID
 * @param {number} page - Page number (0-indexed)
 * @param {number} size - Number of comments per page
 */
export const getPostComments = async (postId, page = 0, size = 10) => {
  try {
    const response = await apiClient.get(`/posts/${postId}/comments`, {
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
};

/**
 * Get replies to a comment
 * @param {number} commentId - Parent comment ID
 * @param {number} page - Page number (0-indexed)
 * @param {number} size - Number of replies per page
 */
export const getCommentReplies = async (commentId, page = 0, size = 10) => {
  try {
    const response = await apiClient.get(`/posts/comments/${commentId}/replies`, {
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching replies:", error);
    throw error;
  }
};

/**
 * Update a comment
 * @param {number} commentId - Comment ID
 * @param {string} content - New content
 */
export const updateComment = async (commentId, content) => {
  try {
    const response = await apiClient.put(`/posts/comments/${commentId}`, { content });
    return response.data;
  } catch (error) {
    console.error("Error updating comment:", error);
    throw error;
  }
};

/**
 * Delete a comment
 * @param {number} commentId - Comment ID
 */
export const deleteComment = async (commentId) => {
  try {
    const response = await apiClient.delete(`/posts/comments/${commentId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
};

/**
 * ==================== UTILITY FUNCTIONS ====================
 */

/**
 * Format date array to readable string
 * @param {Array} dateArray - [year, month, day, hour, minute, second, nano]
 */
export const formatPostDate = (dateArray) => {
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
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};
