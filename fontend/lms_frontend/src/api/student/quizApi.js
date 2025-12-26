import apiClient from "../axiosConfig";

/**
 * Bắt đầu quiz - Lấy danh sách câu hỏi
 * @param {number} quizId - Quiz ID
 * @param {number} userId - User ID
 * @returns {Promise} Quiz questions và attempt ID
 */
export const startQuiz = async (quizId, userId) => {
  try {
    console.log("=== START QUIZ ===");
    console.log(`Quiz ID: ${quizId}, User ID: ${userId}`);

    const response = await apiClient.get(`/quiz`,  {
      params: { quizId, userId }
    });

    console.log("✅ Quiz started successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to start quiz:", error);
    
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
 * @param {Array} answers - Array of {questionId, selectedAnswerId}
 * @returns {Promise} Quiz result
 */
export const submitQuiz = async (attemptId, answers) => {
  try {
    console.log("=== SUBMIT QUIZ ===");
    console.log(`Attempt ID: ${attemptId}`);
    console.log("Answers:", answers);

    const response = await apiClient.post(`/quiz/submit`, {
      attemptId,
      answers
    });

    console.log("✅ Quiz submitted successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to submit quiz:", error);
    
    if (error.response) {
      console.error("Error Response:", error.response.data);
      throw new Error(error.response.data.message || "Failed to submit quiz");
    }
    
    throw new Error("Network error. Please try again later.");
  }
};