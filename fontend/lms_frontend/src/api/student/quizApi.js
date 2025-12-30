import apiClient from "../axiosConfig";

/**
 * Bắt đầu quiz - Lấy danh sách câu hỏi
 * @param {number} quizId - Quiz ID
 * @param {number} userId - User ID
 * @returns {Promise} Quiz questions và attempt ID
 */
export const startQuiz = async (quizId, userId) => {
  try {
    const response = await apiClient.get(`/quiz`, {
      params: { quizId, userId }
    });
    return response.data;
  } catch (error) {
    console.error("Failed to start quiz:", error);
    
    if (error.response) {
      console.error("Error Response:", error.response.data);
      throw new Error(error.response.data.message || "Failed to start quiz");
    }
    
    throw new Error("Network error. Please try again later.");
  }
};

/**
 * Submit quiz answers
 * @param {number} attemptId - Attempt ID from startQuiz
 * @param {Object} answersMap - Object map: { questionId: [answerId1, answerId2, ...] }
 * @returns {Promise} Quiz result
 */
export const submitQuiz = async (attemptId, answersMap) => {
  try {
    // Transform answers từ object map sang array format
    const answers = Object.entries(answersMap).map(([questionId, selectedChoiceIds]) => ({
      questionId: parseInt(questionId),
      selectedChoiceIds: selectedChoiceIds || []
    }));

    const payload = {
      attemptId,
      answers
    };

    const response = await apiClient.post(`/quiz/submit`, payload);

    return response.data;
  } catch (error) {
    console.error("Failed to submit quiz:", error);
    
    if (error.response) {
      console.error("Error Response:", error.response.data);
      throw new Error(error.response.data.message || "Failed to submit quiz");
    }
    
    throw new Error("Network error. Please try again later.");
  }
};

/**
 * Fetch quiz attempt result
 */
export const fetchQuizAttemptResult = async (attemptId) => {
  try {
    const res = await apiClient.get(`/quiz-attempt/user/${attemptId}`);
    return res.data.data;
  } catch (error) {
    console.error("Error fetching quiz attempt result:", error);
    throw error;
  }
};