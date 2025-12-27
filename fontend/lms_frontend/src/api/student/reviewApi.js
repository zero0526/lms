import apiClient from "../axiosConfig";

/**
 * Submit course review
 * @param {Object} reviewData - Review data
 * @param {number} reviewData.courseId - Course ID
 * @param {number} reviewData.userid - User ID
 * @param {string} reviewData.at - Timestamp (ISO format)
 * @param {number} reviewData.rating - Rating (1-5)
 * @param {string} reviewData.comment - Review comment
 */
export const submitCourseReview = async (reviewData) => {
  // Validate input
  if (!reviewData.comment || reviewData.comment.trim() === '') {
    throw new Error("Comment cannot be empty");
  }

  if (reviewData.rating < 1 || reviewData.rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  if (!reviewData.userid || !reviewData.courseId) {
    throw new Error("User ID and Course ID are required");
  }
  
  try {
    // Gửi đúng format theo BE yêu cầu
    const response = await apiClient.post('/review/review-course', {
      rating: reviewData.rating,
      userid: reviewData.userid,
      at: reviewData.at || new Date().toISOString(),
      courseId: reviewData.courseId,
      comment: reviewData.comment
    });
    
    return response.data;
  } catch (error) {
    console.error("Submit review error:", error);
    throw error;
  }
};

/**
 * Get paginated course reviews
 * @param {number} courseId - Course ID
 * @param {number} pageNum - Page number (default: 0)
 * @param {number} limit - Items per page (default: 10)
 */
export const getCourseReviews = async (courseId, pageNum = 0, limit = 10) => {
  if (!courseId) {
    throw new Error("Course ID is required");
  }

  try {
    const response = await apiClient.get('/review/review-course', {
      params: {
        courseId,
        pageNum,
        limit
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("Get reviews error:", error);
    throw error;
  }
};