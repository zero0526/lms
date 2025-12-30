import apiClient from "../axiosConfig";

/**
 * Fetch lesson details (video, docs, quizzes)
 */
export const fetchLessonDetails = async (userId, lessonId) => {
  try {
    const res = await apiClient.get(`/lesson/details`, {
      params: { userId, lessonId },
    });

    const details = res.data.data;

    return details;
  } catch (error) {
    console.error(`Failed to fetch details for lesson ${lessonId}`, error);
    throw error;
  }
};

/**
 * Add new lesson to chapter
 */
export const addLesson = async (chapterId, title, order) => {
  try {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("desc", "");
    formData.append("order", order.toString());
    formData.append("preCond", "None");
    formData.append("chapterId", chapterId.toString());

    const res = await apiClient.post("/course/add-lesson", formData, {
      headers: { "Content-Type": undefined },
    });
    return res.data;
  } catch (error) {
    console.error("Error adding lesson:", error);
    throw error;
  }
};

/**
 * Update lesson info
 */
export const updateLesson = async (lessonId, title, order, description = "") => {
  try {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("order", order.toString());
    formData.append("desc", description);

    const res = await apiClient.put(`/lesson/${lessonId}`, formData, {
      headers: { "Content-Type": undefined }
    });
    return res.data;
  } catch (error) {
    console.error("Error updating lesson:", error);
    throw error;
  }
};

/**
 * Delete lesson
 */
export const deleteLesson = async (lessonId) => {
  try {
    const res = await apiClient.delete(`/lesson/${lessonId}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting lesson:", error);
    throw error;
  }
};

/**
 * Update lesson with video content
 */
export const updateLessonVideo = async (lessonId, videoData, lessonTitle, lessonOrder, lessonDesc) => {
  try {
    const formData = new FormData();
    formData.append("title", lessonTitle);
    formData.append("order", lessonOrder.toString());
    formData.append("desc", lessonDesc);
    formData.append("videoDTO.title", videoData.fileName);
    
    if (videoData.file) {
      formData.append("videoDTO.video", videoData.file);
    }
    
    formData.append("videoDTO.duration", videoData.duration || "0");
    formData.append("videoDTO.segmentDTOs[0].startAtSeconds", "0");
    formData.append("videoDTO.segmentDTOs[0].endAtSeconds", "10");
    formData.append("videoDTO.segmentDTOs[0].description", "Intro");

    const res = await apiClient.put(`/lesson/${lessonId}`, formData, {
      headers: { "Content-Type": undefined },
    });
    return res.data;
  } catch (error) {
    console.error("Error updating lesson video:", error);
    throw error;
  }
};

/**
 * Update lesson with document content
 */
export const updateLessonDoc = async (lessonId, docData, lessonTitle, lessonOrder, lessonDesc) => {
  try {
    const formData = new FormData();
    formData.append("title", lessonTitle);
    formData.append("order", lessonOrder.toString());
    formData.append("desc", lessonDesc);

    if (docData.id) {
      formData.append("courseMaterialDTOs[0].id", docData.id.toString());
    }
    
    formData.append("courseMaterialDTOs[0].title", docData.title || "Document");
    
    if (docData.file) {
      formData.append("courseMaterialDTOs[0].doc", docData.file);
    }

    const res = await apiClient.put(`/lesson/${lessonId}`, formData, {
      headers: { "Content-Type": undefined },
    });
    return res.data;
  } catch (error) {
    console.error("Error updating lesson doc:", error);
    throw error;
  }
};

/**
 * Delete lesson document
 */
export const deleteLessonDoc = async (docId) => {
  try {
    const res = await apiClient.delete(`/course-material/${docId}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting lesson document:", error);
    throw error;
  }
};