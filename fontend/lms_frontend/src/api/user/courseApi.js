import apiClient from "../axiosConfig";
import axios from "axios";
import apiPublicClient from "../axiosPublicConfig";

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
  if (!courseId) {
    throw new Error("Course ID is required");
  }

  try {
    const response = await apiPublicClient.get(`/course/details/${courseId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch course details for courseId ${courseId}:`, error);
    throw error;
  }
};

/**
 * Lấy outline khóa học (public - chưa đăng ký)
 * Response mới:
 * {
 *   status: 200,
 *   data: {
 *     chapters: [...],
 *     isEnrolled: false
 *   }
 * }
 */
export const getCourseOutlinePublic = async (courseId) => {
  if (!courseId) {
    throw new Error("Course ID is required");
  }

  try {
    const response = await apiPublicClient.get(`/course/outline`, {
      params: { courseId }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch public course outline for courseId ${courseId}:`, error);
    throw error;
  }
};

/**
 * ✅ Lấy outline khóa học (enrolled - đã đăng ký)
 * Response mới:
 * {
 *   status: 200,
 *   data: {
 *     chapters: [...],
 *     isEnrolled: true
 *   }
 * }
 */
export const getCourseOutlineEnrolled = async (userId, courseId) => {
  if (!userId || userId === 'undefined' || userId === undefined) {
    console.error("❌ Invalid userId:", userId);
    throw new Error("User ID is required to fetch enrolled course outline");
  }

  const response = await apiClient.get(`/course/outline?userId=${userId}&courseId=${courseId}`);
  console.log("📦 Enrolled Outline Response:", response.data);
  return response.data;
};

/**
 * Đăng ký khóa học
 * Endpoint này KHÔNG có prefix /api
 */
export const enrollCourse = async (userId, courseId) => {
  if (!userId || userId === 'undefined' || userId === undefined) {
    console.error("❌ Invalid userId:", userId);
    throw new Error("User ID is required to enroll in a course");
  }

  if (!courseId || courseId === 'undefined' || courseId === undefined) {
    console.error("❌ Invalid courseId:", courseId);
    throw new Error("Course ID is required to enroll");
  }

  try {
    console.log("=== ENROLLING IN COURSE ===");
    console.log("User ID:", userId);
    console.log("Course ID:", courseId);

    const enrollData = {
      userId: parseInt(userId),
      courseId: parseInt(courseId),
      enrolledAt: new Date().toISOString()
    };
    
    console.log("📤 Enroll request data:", enrollData);
    
    // Tạo request riêng với full URL (không qua apiClient)
    const baseURL = apiClient.defaults.baseURL.replace('/api', ''); // Loại bỏ /api
    const response = await axios.post(`${baseURL}/enroll`, enrollData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiClient.defaults.headers.Authorization || ''
      }
    });
    
    console.log("Enroll response:", response.data);
    console.log("=== END ENROLL ===\n");
    
    return response.data;
    
  } catch (error) {
    console.error("Enroll error:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.response?.status === 404) {
      throw new Error("Enroll endpoint not found. Please check API configuration.");
    } else if (error.response?.status === 409) {
      throw new Error("You are already enrolled in this course.");
    } else {
      throw new Error("Failed to enroll in course. Please try again.");
    }
  }
};

/**
 * Kiểm tra enrollment status - SIMPLIFIED
 * Giờ BE trả về isEnrolled trong response rồi!
 */
export const checkEnrollmentStatus = async (userId, courseId) => {
  if (!userId || userId === 'undefined' || userId === undefined) {
    console.log("⚠️ No userId - User is guest");
    return false;
  }

  if (!courseId || courseId === 'undefined' || courseId === undefined) {
    console.error("❌ Invalid courseId provided to checkEnrollmentStatus:", courseId);
    return false;
  }

  try {
    console.log("=== CHECK ENROLLMENT STATUS ===");
    console.log("userId:", userId);
    console.log("courseId:", courseId);
    
    // ✅ Gọi API outline với userId
    const response = await apiClient.get(`/course/outline?userId=${userId}&courseId=${courseId}`);
    
    console.log("📦 Response:", response.data);
    
    // ✅ BE đã trả về isEnrolled field rồi!
    const isEnrolled = response.data?.data?.isEnrolled || false;
    
    console.log("✅ Enrollment status from BE:", isEnrolled);
    console.log("=== END CHECK ENROLLMENT ===\n");
    
    return isEnrolled;
    
  } catch (error) {
    console.error("❌ Check enrollment error:", error);
    return false;
  }
};

/**
 * Search courses by title
 */
export const searchCourses = async (title, page = 0, size = 6) => {
  try {
    const response = await apiPublicClient.post('/course/search', {
      title,
      page,
      size
    });
    return response.data;
  } catch (error) {
    console.error("Search courses error:", error);
    throw error;
  }
};

/**
 * Get autocomplete suggestions for course search
 */
export const getAutocompleteSuggestions = async (keyword) => {
  if (!keyword || keyword.trim() === '') {
    return { status: 200, data: [] };
  }
  
  try {
    const response = await apiPublicClient.get('/course/search/auto-complete', {
      params: { keyword }
    });
    return response.data;
  } catch (error) {
    console.error("Autocomplete error:", error);
    return { status: 200, data: [] };
  }
};