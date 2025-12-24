import apiClient from "../axiosConfig";

/**
 * Lấy danh sách tags phổ biến
 */
export const getCourseTags = async (limit = 10) => {
  const response = await apiClient.get(`/course/course-tags?limit=${limit}`);
  return response.data;
};

/**
 * Lấy danh sách khóa học với filters
 */
export const getIntroduceCourses = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.tags && params.tags !== "All") {
    queryParams.append("tags", params.tags);
  }
  
  if (params.lowerBoundRating > 0) {
    queryParams.append("lowerBoundRating", params.lowerBoundRating.toString());
  }
  
  if (params.sortBy) {
    queryParams.append("sortBy", params.sortBy);
  }
  
  queryParams.append("page", params.page?.toString() || "0");
  queryParams.append("limit", params.limit?.toString() || "10");

  const response = await apiClient.get(`/course/introduce-course?${queryParams.toString()}`);
  return response.data;
};

/**
 * Lấy chi tiết khóa học
 */
export const getCourseDetails = async (courseId) => {
  const response = await apiClient.get(`/course/details/${courseId}`);
  return response.data;
};

/**
 * Lấy outline khóa học (public - chưa đăng ký)
 */
export const getCourseOutlinePublic = async (courseId) => {
  const response = await apiClient.get(`/course/outline?courseId=${courseId}`);
  return response.data;
};

/**
 * Lấy outline khóa học (enrolled - đã đăng ký)
 */
export const getCourseOutlineEnrolled = async (userId, courseId) => {
  // ✅ Guard clause: Validate userId
  if (!userId || userId === 'undefined' || userId === undefined) {
    console.error("❌ Invalid userId:", userId);
    throw new Error("User ID is required to fetch enrolled course outline");
  }

  const response = await apiClient.get(`/course/outline?userId=${userId}&courseId=${courseId}`);
  return response.data;
};

/**
 * Đăng ký khóa học
 */
export const enrollCourse = async (userId, courseId) => {
  // ✅ Guard clause: Validate userId
  if (!userId || userId === 'undefined' || userId === undefined) {
    console.error("❌ Invalid userId:", userId);
    throw new Error("User ID is required to enroll in a course");
  }

  const enrollData = {
    userId: userId,
    courseId: courseId,
    enrolledAt: new Date().toISOString()
  };
  
  const response = await apiClient.post('/enroll', enrollData);
  return response.data;
};

/**
 * ✅ Kiểm tra xem user đã đăng ký khóa học chưa
 * Logic: Gọi API outline với userId, nếu trả về thành công và có progressLesson field -> đã enroll
 */
export const checkEnrollmentStatus = async (userId, courseId) => {
  // ✅ Guard clause: Validate inputs
  if (!userId || userId === 'undefined' || userId === undefined) {
    console.error("❌ Invalid userId provided to checkEnrollmentStatus:", userId);
    return false; // Không có userId hợp lệ -> chưa đăng ký
  }

  if (!courseId || courseId === 'undefined' || courseId === undefined) {
    console.error("❌ Invalid courseId provided to checkEnrollmentStatus:", courseId);
    return false;
  }

  try {
    console.log("=== CHECK ENROLLMENT STATUS ===");
    console.log("userId:", userId);
    console.log("courseId:", courseId);
    
    const response = await apiClient.get(`/course/outline?userId=${userId}&courseId=${courseId}`);
    console.log("Full API Response:", response);
    console.log("Response Status:", response.status);
    console.log("Response Data:", response.data);
    
    const outline = response.data.data || [];
    console.log("Outline Data:", outline);
    
    // ✅ Check từng chapter và lesson
    outline.forEach((chapter, chapterIndex) => {
      console.log(`Chapter ${chapterIndex + 1}:`, chapter.title);
      if (chapter.lessons) {
        chapter.lessons.forEach((lesson, lessonIndex) => {
          console.log(`  Lesson ${lessonIndex + 1}:`, lesson.title);
          console.log(`    Has progressLesson field:`, lesson.hasOwnProperty('progressLesson'));
          console.log(`    progressLesson value:`, lesson.progressLesson);
        });
      }
    });
    
    // ✅ Nếu API trả về data và có bất kỳ lesson nào có field progressLesson -> đã enroll
    const hasProgressField = outline.some(chapter => 
      chapter.lessons && chapter.lessons.some(lesson => 
        lesson.hasOwnProperty('progressLesson')
      )
    );
    
    console.log("✅ Final Result - Has progress field:", hasProgressField);
    console.log("=== END CHECK ENROLLMENT ===");
    
    return hasProgressField;
  } catch (error) {
    console.error("❌ Check enrollment error:", error);
    console.error("Error response:", error.response);
    console.error("Error status:", error.response?.status);
    console.error("Error data:", error.response?.data);
    
    // ✅ Nếu API trả về 403/401 hoặc lỗi -> chưa enroll
    return false;
  }
};