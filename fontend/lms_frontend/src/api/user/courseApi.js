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
 * 
 * STRATEGY MỚI: 
 * 1. Gọi API public outline (không có userId)
 * 2. Gọi API enrolled outline (có userId)
 * 3. So sánh response để xác định enrolled status
 */
export const checkEnrollmentStatus = async (userId, courseId) => {
  if (!userId || userId === 'undefined' || userId === undefined) {
    console.error("❌ Invalid userId provided to checkEnrollmentStatus:", userId);
    return false;
  }

  if (!courseId || courseId === 'undefined' || courseId === undefined) {
    console.error("❌ Invalid courseId provided to checkEnrollmentStatus:", courseId);
    return false;
  }

  try {
    console.log("=== CHECK ENROLLMENT STATUS (NEW STRATEGY) ===");
    console.log("userId:", userId);
    console.log("courseId:", courseId);
    
    // ✅ Gọi API enrolled outline
    const enrolledResponse = await apiClient.get(`/course/outline?userId=${userId}&courseId=${courseId}`);
    
    console.log("📦 Enrolled API Response:", enrolledResponse.data);
    
    const outline = enrolledResponse.data.data || [];
    
    if (outline.length === 0) {
      console.log("❌ No chapters found");
      return false;
    }
    
    // ✅ STRATEGY 1: Check nếu có progressLesson và giá trị !== null/undefined
    let hasValidProgress = false;
    let hasAnyProgress = false;
    
    outline.forEach((chapter, chapterIndex) => {
      console.log(`\n📚 Chapter ${chapterIndex + 1}: ${chapter.title}`);
      
      if (chapter.lessons) {
        chapter.lessons.forEach((lesson, lessonIndex) => {
          const hasField = lesson.hasOwnProperty('progressLesson');
          const progressValue = lesson.progressLesson;
          
          console.log(`  📝 Lesson ${lessonIndex + 1}: ${lesson.title}`);
          console.log(`     - Has progressLesson field: ${hasField}`);
          console.log(`     - progressLesson value: ${progressValue}`);
          console.log(`     - Is null/undefined: ${progressValue === null || progressValue === undefined}`);
          
          if (hasField) {
            hasAnyProgress = true;
            
            // ✅ Nếu progressLesson có giá trị thực (không phải null/undefined)
            if (progressValue !== null && progressValue !== undefined) {
              hasValidProgress = true;
            }
          }
        });
      }
    });
    
    console.log("\n🔍 Analysis:");
    console.log("- Has any progressLesson field:", hasAnyProgress);
    console.log("- Has valid progress value:", hasValidProgress);
    
    // ✅ STRATEGY 2: Nếu tất cả lessons đều có progressLesson = 0 hoặc null -> có thể là chưa enroll
    // Nhưng nếu có ít nhất 1 lesson có progress > 0 -> đã enroll
    const hasNonZeroProgress = outline.some(chapter => 
      chapter.lessons && chapter.lessons.some(lesson => 
        lesson.progressLesson && lesson.progressLesson > 0
      )
    );
    
    console.log("- Has non-zero progress:", hasNonZeroProgress);
    
    // ✅ STRATEGY 3: Check HTTP status code hoặc response structure
    // Nếu BE trả về status khác nhau cho enrolled vs not enrolled
    console.log("- Response status:", enrolledResponse.status);
    
    // ✅ KẾT LUẬN: User đã enroll nếu:
    // 1. Có ít nhất 1 lesson với progress > 0, HOẶC
    // 2. Có progressLesson field với giá trị hợp lệ (không null/undefined), HOẶC
    // 3. (Tùy vào cách BE implement)
    
    const isEnrolled = hasNonZeroProgress || hasValidProgress;
    
    console.log("\n✅ Final Result - Is Enrolled:", isEnrolled);
    console.log("=== END CHECK ENROLLMENT ===\n");
    
    return isEnrolled;
    
  } catch (error) {
    console.error("❌ Check enrollment error:", error);
    console.error("Error response:", error.response);
    console.error("Error status:", error.response?.status);
    console.error("Error data:", error.response?.data);
    
    // ✅ Nếu API trả về lỗi -> chưa enroll
    return false;
  }
};