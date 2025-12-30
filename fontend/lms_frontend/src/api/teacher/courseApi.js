import apiClient from "../axiosConfig";

/**
 * Fetch overall courses info
 */
export const fetchCourseInfo = async (courseId) => {
  try {
    const res = await apiClient.get(`course/details/${courseId}`);
    const details = res.data.data;
    return details; // Trả về data
  } catch (error) {
    console.error(`Failed to fetch details for course ${courseId}`, error);
    throw error;
  }
};

/**
 * Fetch course outline (chapters + lessons structure)
 */
export const fetchCourseOutline = async (userId, courseId) => {
  try {
    const res = await apiClient.get(`/course/outline`, {
      params: { userId, courseId },
    });

    const rawChapters = res.data?.data?.chapters || [];

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

/**
 * Publish course
 */
export const publishCourse = async (courseId) => {
  try {
    const formData = new FormData();
    formData.append("isCompleted", "true");
    const res = await apiClient.put(`/course/${courseId}`, formData, {
      headers: { "Content-Type": undefined },
    }
);
    return res.data;
  } catch (error) {
    console.error("Error publishing course:", error);
    throw error;
  }
};

/**
 * Get punlished courses
 */
export const fetchPublishedCourses = async (userId) => {
  try {
    const res = await apiClient.get(`/course/completed/${userId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching published courses:", error);
    throw error;
  }
};

/**
 * Create a new meeting for live streaming
 * @param {number} courseId - Course ID
 * @param {string} title - Meeting title
 * @param {string} description - Meeting description
 */
export const createMeeting = async (courseId, title, description) => {
  try {
    const res = await apiClient.post("/meeting/create", {
      courseId: parseInt(courseId),
      title,
      description
    });
    return res.data;
  } catch (error) {
    console.error("Error creating meeting:", error);
    throw error;
  }
};
