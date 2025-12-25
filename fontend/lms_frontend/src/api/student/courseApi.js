import apiClient from '../axiosConfig';

export const getEnrolledCourses = async (userId) => {
  if (!userId || userId === 'undefined' || userId === undefined) {
    console.error("❌ Invalid userId:", userId);
    throw new Error("User ID is required to fetch enrolled courses");
  }

  try {
    console.log("📚 Fetching enrolled courses for userId:", userId);
    
    const response = await apiClient.get(`/course/${userId}`);
    
    console.log("✅ Enrolled courses response:", response.data);
    
    return response.data;
  } catch (error) {
    console.error("❌ Get enrolled courses error:", error);
    console.error("Error response:", error.response?.data);
    
    if (error.response?.status === 404) {
      // User chưa đăng ký khóa học nào
      return { status: 200, data: [] };
    }
    
    throw error;
  }
};

export const getEnrolledCourseDetail = async (userId, courseId) => {
  if (!userId || !courseId) {
    throw new Error("User ID and Course ID are required");
  }

  try {
    const response = await apiClient.get(`/course/${userId}`);
    const courses = response.data.data || [];
    
    // Tìm course theo courseId
    const course = courses.find(c => c.courseId === parseInt(courseId));
    
    if (!course) {
      throw new Error("Course not found in enrolled list");
    }
    
    return { status: 200, data: course };
  } catch (error) {
    console.error("❌ Get enrolled course detail error:", error);
    throw error;
  }
};

export const checkCourseCompletion = async (userId, courseId) => {
  try {
    const response = await getEnrolledCourseDetail(userId, courseId);
    return response.data?.isCompleted || false;
  } catch (error) {
    console.error("❌ Check completion error:", error);
    return false;
  }
};