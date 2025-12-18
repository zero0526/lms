import apiClient from "../axiosConfig";

/**
 * Fetch quiz details by quizId
 */
export const fetchQuizDetails = async (quizId) => {
  try {
    console.log(`=== FETCHING QUIZ DETAILS ===`);
    console.log(`Quiz ID: ${quizId}`);
    
    const res = await apiClient.get(`/quiz/${quizId}`);
    console.log("Quiz Details Response:", res.data);
    
    const quizData = res.data.data;
    
    if (quizData) {
      console.log(`Quiz Title: ${quizData.title}`);
      console.log(`Question Count: ${quizData.questions.length}`);
      
      // ← Transform backend data sang format của ContentModal
      const transformedData = {
        id: quizData.id,
        title: quizData.title,
        description: quizData.desc,
        precondition: quizData.precondition,
        timeLimit: quizData.timeLimitMinutes,
        difficulty: quizData.difficultyAvg,
        passScore: quizData.score,
        questions: quizData.questions.map(q => ({
          id: q.id,
          question: q.qText,
          qImage: q.qImage,
          explanation: q.explanation,
          level: q.level,
          score: q.score,
          order: q.order,
          options: q.mcqContents.map(opt => ({
            id: opt.id,
            text: opt.cText,
            cImage: opt.cImage,
            isCorrect: opt.isCorrect,
          })),
        })),
      };
      
      console.log("Transformed Quiz Data:", transformedData);
      return transformedData;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching quiz details:", error);
    if (error.response) {
      console.error("Response Status:", error.response.status);
      console.error("Response Data:", error.response.data);
    }
    throw error;
  }
};

/**
 * Add new quiz to lesson
 */
export const addQuiz = async (lessonId, quizData) => {
  try {
    const formData = buildQuizFormData(quizData, false);
    
    console.log("=== ADD QUIZ ===");
    console.log(`Lesson ID: ${lessonId}`);
    logFormData(formData);

    const res = await apiClient.put(`/lesson/${lessonId}/add-quiz`, formData, {
      headers: { "Content-Type": undefined },
    });
    
    return res.data;
  } catch (error) {
    console.error("Error adding quiz:", error);
    throw error;
  }
};

/**
 * Update existing quiz
 */
export const updateQuiz = async (quizId, quizData) => {
  try {
    const formData = buildQuizFormData(quizData, true);
    
    console.log("=== UPDATE QUIZ ===");
    console.log(`Quiz ID: ${quizId}`);
    logFormData(formData);

    const res = await apiClient.put(`/quiz/${quizId}`, formData, {
      headers: { "Content-Type": undefined },
    });
    
    return res.data;
  } catch (error) {
    console.error("Error updating quiz:", error);
    throw error;
  }
};

/**
 * Helper: Build FormData for quiz (add/update)
 */
function buildQuizFormData(data, isEditMode) {
  const { questions, settings } = data;
  const formData = new FormData();

  // ← BASIC INFO
  formData.append("title", settings.title || "Quiz");
  formData.append("precondition", settings.precondition || "None");
  formData.append("desc", settings.description || "Quiz description");
  formData.append("timeLimitMinutes", settings.timeLimit.toString());
  formData.append("difficultyAvg", settings.difficulty);
  formData.append("score", settings.passScore.toString());

  // ← QUESTIONS
  questions.forEach((q, qIdx) => {
    formData.append(`questions[${qIdx}].qText`, q.question);
    
    // ← IMAGE: Chỉ append nếu là File (upload mới)
    if (q.qImage && q.qImage instanceof File) {
      formData.append(`questions[${qIdx}].qImage`, q.qImage);
      console.log(`  → Question ${qIdx + 1}: Uploading NEW image`);
    }
    
    formData.append(`questions[${qIdx}].explanation`, q.explanation || "");
    formData.append(`questions[${qIdx}].level`, q.level || settings.difficulty);
    formData.append(`questions[${qIdx}].score`, q.score.toString());
    formData.append(`questions[${qIdx}].order`, (qIdx + 1).toString());

    // ← question.id (nếu EDIT và ID hợp lệ)
    if (isEditMode && q.id && typeof q.id === 'number' && q.id < 1000000) {
      formData.append(`questions[${qIdx}].id`, q.id.toString());
      console.log(`  → Question ${qIdx + 1}: Existing ID = ${q.id}`);
    } else {
      console.log(`  → Question ${qIdx + 1}: NEW question (no ID)`);
    }

    // ← OPTIONS
    q.options.forEach((opt, oIdx) => {
      formData.append(`questions[${qIdx}].mcqContents[${oIdx}].cText`, opt.text);
      
      // ← IMAGE
      if (opt.cImage && opt.cImage instanceof File) {
        formData.append(`questions[${qIdx}].mcqContents[${oIdx}].cImage`, opt.cImage);
        console.log(`    → Option ${oIdx + 1}: Uploading NEW image`);
      }
      
      formData.append(`questions[${qIdx}].mcqContents[${oIdx}].isCorrect`, opt.isCorrect.toString());

      // ← option.id (nếu EDIT và ID hợp lệ)
      if (isEditMode && opt.id && typeof opt.id === 'number' && opt.id > 100) {
        formData.append(`questions[${qIdx}].mcqContents[${oIdx}].id`, opt.id.toString());
        console.log(`    → Option ${oIdx + 1}: Existing ID = ${opt.id}`);
      } else {
        console.log(`    → Option ${oIdx + 1}: NEW option (no ID)`);
      }
    });
  });

  return formData;
}

/**
 * Helper: Log FormData content
 */
function logFormData(formData) {
  console.log("=== FormData Content ===");
  for (let pair of formData.entries()) {
    if (pair[1] instanceof File) {
      console.log(`${pair[0]}: [File: ${pair[1].name}, Size: ${pair[1].size}]`);
    } else {
      console.log(`${pair[0]}: ${pair[1]}`);
    }
  }
}