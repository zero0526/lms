import apiClient from '../utils/apiClient';

export const submitCourseReview = async (courseId, userid, at, rating, comment) => {
  // Logic to submit a course review by a student
  if (!comment || comment.trim() === '') {
    return { success: false, message: "Comment cannot be empty" };
  }

  if (rating < 1 || rating > 5) {
    return { success: false, message: "Rating must be between 1 and 5" };
  }
  
  try {
    const response = await apiClient.post('/review/review-course', {
      courseId,
      userid,
      at,
      rating,
      comment
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export const getPageReviewCourse = async (courseId, pageNum = 0, limit = 10) => {
  // Logic to get paginated course reviews
  try {
    const response = await apiClient.get('/review/review-course', {
      params: {
        courseId,
        pageNum,
        limit
      }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}