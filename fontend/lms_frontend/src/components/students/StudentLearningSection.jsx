import React, { useState, useEffect } from "react";
import LearningCard from "./StudentLearningCard";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { getEnrolledCourses } from "../../api/student/courseApi";
import { getCurrentUserId } from "../../api/user/userUtils";
import { convertDriveLink } from "../../api/user/userUtils";

export default function StudentLearningSection() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [showTwoRows, setShowTwoRows] = useState(false);

  const COURSES_PER_ROW = 4;
  const coursesPerPage = showTwoRows ? COURSES_PER_ROW * 2 : COURSES_PER_ROW;

  // Fetch enrolled courses khi component mount
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        setIsLoading(true);
        
        const userId = getCurrentUserId();
        
        if (!userId) {
          setError("Please log in to view your courses");
          setIsLoading(false);
          return;
        }
        
        const response = await getEnrolledCourses(userId);
        
        // Transform data từ BE sang format của component
        const transformedCourses = (response.data || []).map(course => ({
          id: course.courseId,
          title: course.title,
          instructor: course.teacherName,
          image: convertDriveLink(course.thumbnailUrl),
          description: course.description,
          rating: course.rating,
          studentNums: course.numOfEnroll,
          numOfChapter: course.numOfChapter,
          progressPercent: course.progress * 2,
          isPublished: course.isCompleted
        }));
        
        setCourses(transformedCourses);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to fetch enrolled courses:", err);
        setError("Failed to load your courses. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  // Reset to first page when toggle rows
  useEffect(() => {
    setCurrentPage(0);
  }, [showTwoRows]);

  const totalPages = Math.ceil(courses.length / coursesPerPage);
  const startIdx = currentPage * coursesPerPage;
  const endIdx = startIdx + coursesPerPage;
  const currentCourses = courses.slice(startIdx, endIdx);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  const toggleRows = () => {
    setShowTwoRows(!showTwoRows);
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
              href="/courses" 
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
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-3xl text-gray-800">
            Welcome back, ready for your next lesson?
          </h2>
          
          {/* Show expand button if more than 4 courses */}
          {courses.length > COURSES_PER_ROW && (
            <button 
              onClick={toggleRows}
              className="flex items-center gap-2 text-[#00b6b6] font-semibold hover:text-[#009e9e] transition"
            >
              {showTwoRows ? (
                <>
                  Show Less <ChevronUp size={20} />
                </>
              ) : (
                <>
                  Show More <ChevronDown size={20} />
                </>
              )}
            </button>
          )}
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
          {currentCourses.map((course) => (
            <LearningCard key={course.id} course={course} />
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-end items-center gap-3">
            <span className="text-sm text-gray-600">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className="bg-teal-100 hover:bg-[#00b6b6] hover:text-white text-[#00b6b6] p-3 rounded-lg transition duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1}
              className="bg-teal-100 hover:bg-[#00b6b6] hover:text-white text-[#00b6b6] p-3 rounded-lg transition duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}