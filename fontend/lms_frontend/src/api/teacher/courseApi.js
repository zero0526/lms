import apiClient from "../axiosConfig";

/**
 * Fetch course outline (chapters + lessons structure)
 */
export const fetchCourseOutline = async (userId, courseId) => {
  try {
    console.log(`Fetching outline for userId: ${userId}, courseId: ${courseId}`);
    const res = await apiClient.get(`/course/outline`, {
      params: { userId, courseId },
    });

    console.log("Course Outline Response (Raw):", res.data);

    const rawChapters = res.data.data || [];

    // ← LOG ALL CHAPTER & LESSON IDS
    console.log("=== COURSE STRUCTURE ===");
    rawChapters.forEach((ch, chIdx) => {
      console.log(`Chapter ${chIdx + 1}: ID=${ch.chapterId}, Title="${ch.title}", Order=${ch.order}`);
      (ch.lessons || []).forEach((ls, lsIdx) => {
        console.log(`  └─ Lesson ${lsIdx + 1}: ID=${ls.lessonId}, Title="${ls.title}", Order=${ls.order}`);
      });
    });

    return rawChapters;
  } catch (error) {
    console.error("Error fetching course outline:", error);
    throw error;
  }
};

/**
 * Add new chapter to course
 */
export const addChapter = async (courseId, title, order) => {
  try {
    const res = await apiClient.post("/course/add-chapter", {
      courseId: parseInt(courseId),
      title,
      order,
    });
    return res.data;
  } catch (error) {
    console.error("Error adding chapter:", error);
    throw error;
  }
};