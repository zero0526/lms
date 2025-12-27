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
    console.log("=== POST COMMENT ===");
    console.log(`User ID: ${userId}, Question ID: ${questionId}`);
    console.log(`Content: ${content}, Parent ID: ${parentCommentId}`);

    const payload = {
      questionId,
      content,
      parentCommentId
    };

    const response = await apiClient.post(`/question-comment/${userId}`, payload);
    
    console.log("Comment posted successfully:", response.data);
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
    console.log(`Fetching comments for question: ${questionId}`);
    const response = await apiClient.get(`/question/question-comment/${questionId}`);
    console.log("Comments fetched:", response.data);
    
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
    console.log(`Editing comment ${commentId} by user ${userId}`);
    
    const response = await apiClient.put(`/question-comment/${commentId}`, null, {
      params: {
        userId,
        content
      }
    });
    
    console.log("Comment edited successfully:", response.data);
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
    console.log(`Deleting comment ${commentId} by user ${userId}`);
    
    const response = await apiClient.delete(`/question-comment/${commentId}`, {
      params: {
        userId
      }
    });
    
    console.log("Comment deleted successfully:", response.data);
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