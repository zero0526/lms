import apiClient from '../axiosConfig';

/**
 * Lấy chi tiết bài học
 * @param {number} userId - Student ID
 * @param {number} lessonId - Lesson ID
 * @returns {Promise} Lesson details with video, docs, quizzes
 */
export const getLessonDetail = async (userId, lessonId) => {
  if (!userId || userId === 'undefined' || userId === undefined) {
    console.error("Invalid userId:", userId);
    throw new Error("User ID is required to fetch lesson detail");
  }

  if (!lessonId || lessonId === 'undefined' || lessonId === undefined) {
    console.error("Invalid lessonId:", lessonId);
    throw new Error("Lesson ID is required");
  }

  try {
    console.log("Fetching lesson detail for userId:", userId, "lessonId:", lessonId);
    
    const response = await apiClient.get(`/lesson/details`, {
      params: {
        userId: userId,
        lessonId: lessonId
      }
    });
    
    console.log("Lesson detail response:", response.data);
    
    return response.data;
  } catch (error) {
    console.error("Get lesson detail error:", error);
    console.error("Error response:", error.response?.data);
    
    throw error;
  }
};

/**
 * Cập nhật progress bài học
 * @param {number} userId - Student ID
 * @param {number} lessonId - Lesson ID
 * @param {number} progress - Progress percentage (0-100)
 * @returns {Promise} Update result
 */
export const updateLessonProgress = async (userId, lessonId, progress) => {
  if (!userId || !lessonId) {
    throw new Error("User ID and Lesson ID are required");
  }

  try {
    const response = await apiClient.post('/lesson/progress', {
      userId: parseInt(userId),
      lessonId: parseInt(lessonId),
      progress: Math.min(100, Math.max(0, progress))
    });
    
    console.log("Progress updated:", response.data);
    return response.data;
  } catch (error) {
    console.error("Update progress error:", error);
    throw error;
  }
};

/**
 * Lưu thời điểm xem video
 * @param {number} userId - Student ID
 * @param {number} lessonId - Lesson ID
 * @param {number} watchedAt - Timestamp in seconds
 * @returns {Promise} Update result
 */
export const updateLastWatchedAt = async (userId, lessonId, watchedAt) => {
  try {
    const response = await apiClient.post('/lesson/watch-time', {
      userId: parseInt(userId),
      lessonId: parseInt(lessonId),
      lastWatchedAt: Math.floor(watchedAt)
    });
    
    return response.data;
  } catch (error) {
    console.error("Update watch time error:", error);
    throw error;
  }
};

/**
 * Đánh dấu bài học đã hoàn thành
 * @param {number} userId - Student ID
 * @param {number} lessonId - Lesson ID
 * @returns {Promise} Completion result
 */
export const markLessonCompleted = async (userId, lessonId) => {
  try {
    const response = await updateLessonProgress(userId, lessonId, 100);
    console.log("Lesson marked as completed");
    return response;
  } catch (error) {
    console.error("Mark completed error:", error);
    throw error;
  }
};

/**
 * Lấy danh sách quiz của bài học
 * @param {number} lessonId - Lesson ID
 * @returns {Promise} Quiz list
 */
export const getLessonQuizzes = async (lessonId) => {
  try {
    const response = await apiClient.get(`/lesson/${lessonId}/quizzes`);
    return response.data;
  } catch (error) {
    console.error("Get quizzes error:", error);
    throw error;
  }
};

/**
 * Download document
 * @param {string} docUrl - Document URL (Google Drive link)
 * @returns {string} Converted download link
 */
export const getDownloadLink = (docUrl) => {
  if (!docUrl) return null;
  
  // Convert Google Drive view link to download link
  if (docUrl.includes('drive.google.com')) {
    const fileIdMatch = docUrl.match(/\/d\/([^\/]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`;
    }
  }
  
  return docUrl;
};