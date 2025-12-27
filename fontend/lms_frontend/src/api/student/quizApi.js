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

    const response = await apiClient.get(`/quiz`, {
      params: { quizId, userId }
    });

    console.log("Quiz started successfully:", response.data);
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
    console.log("=== SUBMIT QUIZ ===");
    console.log(`Attempt ID: ${attemptId}`);
    console.log("Answers Map:", answersMap);

    // Transform answers từ object map sang array format
    const answers = Object.entries(answersMap).map(([questionId, selectedChoiceIds]) => ({
      questionId: parseInt(questionId),
      selectedChoiceIds: selectedChoiceIds || []
    }));

    console.log("Transformed answers:", answers);

    const payload = {
      attemptId,
      answers
    };

    console.log("Sending payload:", JSON.stringify(payload, null, 2));

    const response = await apiClient.post(`/quiz/submit`, payload);

    console.log("Quiz submitted successfully:", response.data);
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
    console.log(`Fetching quiz attempt result for attemptId: ${attemptId}`);
    const res = await apiClient.get(`/quiz-attempt/user/${attemptId}`);
    console.log("Quiz Attempt Result:", res.data);
    return res.data.data;
  } catch (error) {
    console.error("Error fetching quiz attempt result:", error);
    throw error;
  }
};