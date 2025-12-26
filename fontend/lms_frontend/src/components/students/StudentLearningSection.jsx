import React, { useRef, useState, useEffect } from "react";
import LearningCard from "./StudentLearningCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getEnrolledCourses } from "../../api/student/courseApi";
import { getCurrentUserId } from "../../api/user/userUtils";
import { convertDriveLink } from "../../api/user/userUtils";

export default function StudentLearningSection() {
  const scrollRef = useRef(null);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch enrolled courses khi component mount
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        setIsLoading(true);
        
        const userId = getCurrentUserId();
        
        if (!userId) {
          console.log("⚠️ No user logged in");
          setError("Please log in to view your courses");
          setIsLoading(false);
          return;
        }

        console.log("📚 Fetching enrolled courses for user:", userId);
        
        const response = await getEnrolledCourses(userId);
        
        console.log("Response:", response);
        
        // Transform data từ BE sang format của component
        const transformedCourses = (response.data || []).map(course => ({
          id: course.courseId,
          title: course.title,
          instructor: course.teacherName,
          image: convertDriveLink(course.thumbnailUrl),
          description: course.description,
          rating: course.rating,
          numOfEnroll: course.numOfEnroll,
          numOfChapter: course.numOfChapter,
          progressPercent: course.progress,
          isPublished: course.isCompleted
        }));
        
        console.log("🔄 Transformed courses:", transformedCourses);
        
        setCourses(transformedCourses);
        setIsLoading(false);
      } catch (err) {
        console.error("❌ Failed to fetch enrolled courses:", err);
        setError("Failed to load your courses. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  // Helper function: Tính số lesson đã hoàn thành từ progress percentage
  const calculateProgress = (progressPercent) => {
    // Giả sử mỗi chapter có trung bình 5 lessons
    // Hoặc bạn có thể fetch thêm từ API outline
    return Math.round((progressPercent / 100) * 10); // Tạm tính 10 lessons
  };

  const scroll = (direction) => {
    const container = scrollRef.current;
    if (container) {
      const scrollAmount = container.offsetWidth * 0.5;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="bg-[#ecfaff] py-10">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-bold text-3xl text-gray-800 mb-8">
            Welcome back, ready for your next lesson?
          </h2>
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00b6b6]"></div>
            <p className="ml-4 text-gray-600">Loading your courses...</p>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="bg-[#ecfaff] py-10">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-bold text-3xl text-gray-800 mb-8">
            Welcome back, ready for your next lesson?
          </h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (courses.length === 0) {
    return (
      <section className="bg-[#ecfaff] py-10">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-bold text-3xl text-gray-800 mb-8">
            Welcome back, ready for your next lesson?
          </h2>
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">
              You haven't enrolled in any courses yet.
            </p>
            <a 
              href="/student/courses" 
              className="inline-block bg-[#00b6b6] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#009e9e] transition"
            >
              Browse Courses
            </a>
          </div>
        </div>
      </section>
    );
  }

  // Main render with courses
  return (
    <section className="bg-[#ecfaff] py-10">
      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-3xl text-gray-800">
            Welcome back, ready for your next lesson?
          </h2>
          <button className="text-sky-600 font-bold hover:underline cursor-pointer">
            View History
          </button>
        </div>

        {/* Course Carousel */}
        <div className="relative group">
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-6 scroll-smooth scrollbar-hide py-8 px-2"
          >
            {courses.map((course) => (
              <div key={course.id} className="flex-none w-[300px]">
                <LearningCard course={course} />
              </div>
            ))}
          </div>

          {/* Navigation Buttons - Only show if more than 3 courses */}
          {courses.length > 3 && (
            <>
              <button
                onClick={() => scroll("left")}
                className="absolute -left-4 top-1/2 -translate-y-1/2 bg-white text-teal-600 hover:bg-teal-500 hover:text-white p-3 rounded-full shadow-lg z-10 transition duration-300 opacity-80 hover:opacity-100"
              >
                <ChevronLeft size={24} />
              </button>

              <button
                onClick={() => scroll("right")}
                className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white text-teal-600 hover:bg-teal-500 hover:text-white p-3 rounded-full shadow-lg z-10 transition duration-300 opacity-80 hover:opacity-100"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}