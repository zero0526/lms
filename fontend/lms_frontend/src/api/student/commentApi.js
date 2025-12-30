import apiClient from "../axiosConfig";

/**
 * Post a new comment or reply to a question
 * @param {number} userId - User ID
 * @param {number} questionId - Question ID
 * @param {string} content - Comment content
 * @param {number|null} parentCommentId - Parent comment ID (null for new comment)
 * @returns {Promise} Posted comment data
 */
export const postQuestionComment = async (userId, questionId, content, parentCommentId = null) => {
  try {

    const payload = {
      questionId,
      content,
      parentCommentId
    };

    const response = await apiClient.post(`/question-comment/${userId}`, payload);

    return response.data;
  } catch (error) {
    console.error("Failed to post comment:", error);
    
    if (error.response) {
      console.error("Error Response:", error.response.data);
      throw new Error(error.response.data.message || "Failed to post comment");
    }
    
    throw new Error("Network error. Please try again later.");
  }
};

/**
 * Fetch comments for a question
 * @param {number} questionId - Question ID
 * @returns {Promise} List of comments
 */
export const fetchQuestionComments = async (questionId) => {
  try {
    const response = await apiClient.get(`/question-comment/question/${questionId}`);
    
    // Transform response to match expected structure
    const comments = (response.data.data || []).map(comment => ({
      id: comment.commentId,
      userId: comment.userId,
      userName: comment.userName,
      userAvatar: comment.avatar,
      content: comment.content,
      isEdited: comment.isEdited,
      createdAt: comment.lastEdited, // Array format from backend
      parentCommentId: null, // Root comments have no parent
      numOfChild: comment.numOfChild || 0,
      replies: [] // Will be populated if needed
    }));
    
    return comments;
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return [];
  }
};

/**
 * Edit a comment
 * @param {number} commentId - Comment ID
 * @param {number} userId - User ID (owner of comment)
 * @param {string} content - New content
 * @returns {Promise} Updated comment
 */
export const editQuestionComment = async (commentId, userId, content) => {
  try {
    
    const response = await apiClient.put(`/question-comment/${commentId}`, null, {
      params: {
        userId,
        content
      }
    });

    return response.data;
  } catch (error) {
    console.error("Failed to edit comment:", error);
    
    if (error.response) {
      console.error("Error Response:", error.response.data);
      throw new Error(error.response.data.message || "Failed to edit comment");
    }
    
    throw new Error("Network error. Please try again later.");
  }
};

/**
 * Delete a comment
 * @param {number} commentId - Comment ID
 * @param {number} userId - User ID (owner of comment)
 * @returns {Promise}
 */
export const deleteQuestionComment = async (commentId, userId) => {
  try {
    
    const response = await apiClient.delete(`/question-comment/${commentId}`, {
      params: {
        userId
      }
    });
    

    return response.data;
  } catch (error) {
    console.error("Failed to delete comment:", error);
    
    if (error.response) {
      console.error("Error Response:", error.response.data);
      throw new Error(error.response.data.message || "Failed to delete comment");
    }
    
    throw new Error("Network error. Please try again later.");
  }
};

/**
 * Get replies for a specific comment
 * @param {number} commentId - Parent comment ID
 */
export const getCommentReplies = async (commentId) => {
  if (!commentId) {
    throw new Error("Comment ID is required");
  }

  try {
    const response = await apiClient.get(`/question-comment/question-comment/${commentId}`);
    return response.data;
  } catch (error) {
    console.error("Get comment replies error:", error);
    throw error;
  }
};