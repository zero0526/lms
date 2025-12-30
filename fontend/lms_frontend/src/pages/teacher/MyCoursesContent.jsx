import React, { useState, useEffect } from "react";
import apiClient from "../../api/axiosConfig";
import TeacherCourseCard from "../../components/teachers/TeacherCourseCard"; 
import { fetchPublishedCourses } from "../../api/teacher/courseApi";
import { BookOpen, Loader2 } from "lucide-react";

export default function MyCoursesContent() {
  const [myCourses, setMyCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getDirectGoogleDriveLink = (url) => {
    if (!url || typeof url !== 'string') return "";
    if (!url.includes("drive.google.com")) return url;

    try {
      const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
      if (idMatch && idMatch[1]) {
        return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1000`;
      }
      return url; 
    } catch (e) {
      return url;
    }
  };
  // Get user Id from storage
  const getUserId = () => {
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    return userStr ? JSON.parse(userStr).userId : null;
  };

  // Fetch published courses
  useEffect(() => {
    const loadPublishedCourses = async () => {
      const userId = getUserId();
      if (!userId) {
        setError("User not logged in.");
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetchPublishedCourses(userId);

        const mappedCourses = (response.data || []).map(course => ({
          id: course.courseId,
          courseId: course.courseId,
          title: course.title,
          description: course.description,
          thumbnailUrl: getDirectGoogleDriveLink(course.thumbnailUrl),
          rating: course.rating,
          numOfEnroll: course.numOfEnroll,
          numOfChapter: course.numOfChapter,
        }));

        setMyCourses(mappedCourses);
        setError(null);
      } catch (err) {
        setError("Failed to load courses. Please try again later.");
        console.error("Error fetching published courses:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPublishedCourses();
  }, []);

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">My Courses</h1>
        {myCourses.length > 0 && (
          <div className="text-sm text-gray-500">
            Total: <span className="font-bold text-[#00b6b6]">{myCourses.length}</span> courses
          </div>
        )}
      </div>

      {/* --- LOGIC HIỂN THỊ EMPTY STATE --- */}
      {/* --- LOADING STATE --- */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <Loader2 size={48} className="animate-spin text-[#00b6b6]" />
        </div>
      ) : error ? (
        /* --- ERROR STATE --- */
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl border border-red-100 shadow-sm">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <BookOpen size={40} className="text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Error Loading Courses</h3>
          <p className="text-gray-500 text-center max-w-md">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-[#00b6b6] text-white rounded-lg font-semibold hover:bg-[#009e9e] transition"
          >
            Retry
          </button>
        </div>
      ) : myCourses.length === 0 ? (
        /* --- EMPTY STATE --- */
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mb-6">
            <BookOpen size={40} className="text-[#00b6b6]" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No courses published yet</h3>
          <p className="text-gray-500 text-center max-w-md">
            You haven't published any courses yet. Go to <span className="font-bold text-[#00b6b6]">Course Development</span> to create and publish your first course.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {myCourses.map((course) => (
            <div key={course.id} className="w-full">
              <TeacherCourseCard course={course} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}