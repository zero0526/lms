import React, { useState, useEffect } from "react";
import { 
  Play, 
  CheckCircle, 
  Circle, 
  Lock, 
  ChevronDown, 
  ChevronUp 
} from "lucide-react";
import { getCourseOutlineEnrolled } from "../../api/user/courseApi";
import { getCurrentUserId } from "../../api/user/userUtils";
import { useNavigate, useParams } from "react-router-dom";

export default function StudentCourseContent({ currentLessonId, onLessonChange }) {
  const navigate = useNavigate();
  const { courseId } = useParams();
  
  const [chapters, setChapters] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalLessons, setTotalLessons] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(0);

  // Fetch course outline
  const fetchCourseOutline = async () => {
    try {
      setIsLoading(true);
      
      const userId = getCurrentUserId();
      
      if (!userId) {
        console.error("No user logged in");
        setError("Please log in to view course content");
        setIsLoading(false);
        return;
      }

      console.log("Fetching course outline for courseId:", courseId);
      
      const response = await getCourseOutlineEnrolled(userId, courseId);
      
      console.log("Course outline response:", response);
      
      const chaptersData = response.data?.chapters || [];
      setChapters(chaptersData);
      
      // Tính tổng số lessons và completed lessons
      let total = 0;
      let completed = 0;
      const openState = {};
      
      chaptersData.forEach((chapter, index) => {
        openState[chapter.chapterId] = index === 0; // Mở chapter đầu tiên
        
        if (chapter.lessons) {
          total += chapter.lessons.length;
          // Convert 0.0-1.0 to percentage
          completed += chapter.lessons.filter(lesson => 
            (lesson.progressLesson || 0) * 2 * 100 === 100
          ).length;
        }
      });
      
      setTotalLessons(total);
      setCompletedLessons(completed);
      setSidebarOpen(openState);
      
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to fetch course outline:", err);
      setError("Failed to load course content");
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (courseId) {
      fetchCourseOutline();
    }
  }, [courseId]);

  // Listen for outline update events
  useEffect(() => {
    const handleOutlineUpdate = () => {
      console.log("📡 Received outline update event, refreshing...");
      fetchCourseOutline();
    };

    window.addEventListener('course-outline-updated', handleOutlineUpdate);

    return () => {
      window.removeEventListener('course-outline-updated', handleOutlineUpdate);
    };
  }, [courseId]);

  const toggleChapter = (chapterId) => {
    setSidebarOpen(prev => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  const handleLessonClick = (lessonId) => {
    if (onLessonChange) {
      onLessonChange(lessonId);
    } else {
      navigate(`/student/courses/${courseId}/lessons/${lessonId}`);
    }
  };

  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-100 sticky top-28 overflow-hidden">
        <div className="p-4 bg-[#00b6b6] text-white font-bold text-lg">
          Course Content
        </div>
        <div className="p-8 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00b6b6] mb-3"></div>
          <p className="text-sm text-gray-500">Loading content...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-100 sticky top-28 overflow-hidden">
        <div className="p-4 bg-[#00b6b6] text-white font-bold text-lg">
          Course Content
        </div>
        <div className="p-6 text-center">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 sticky top-28 overflow-hidden flex flex-col max-h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="p-4 bg-[#00b6b6] text-white font-bold text-lg flex justify-between items-center flex-shrink-0">
        <span>Course Content</span>
        <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded">
          {completedLessons}/{totalLessons} lessons
        </span>
      </div>
      
      {/* Chapter & Lesson List */}
      <div className="overflow-y-auto custom-scrollbar flex-1">
        {chapters.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No content available
          </div>
        ) : (
          chapters.map((chapter) => (
            <div key={chapter.chapterId} className="border-b border-gray-100 last:border-0">
              {/* Chapter Title */}
              <div 
                onClick={() => toggleChapter(chapter.chapterId)}
                className="bg-gray-50 p-3 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition select-none"
              >
                <h3 className="font-semibold text-gray-700 text-sm">
                  {chapter.title}
                </h3>
                {sidebarOpen[chapter.chapterId] ? (
                  <ChevronUp size={16} className="text-[#00b6b6]"/>
                ) : (
                  <ChevronDown size={16}/>
                )}
              </div>

              {/* Lessons List */}
              {sidebarOpen[chapter.chapterId] && (
                <div className="divide-y divide-gray-50">
                  {chapter.lessons && chapter.lessons.length > 0 ? (
                    chapter.lessons.map((lesson) => {
                      // Convert 0.0-1.0 to percentage
                      const progressPercent = (lesson.progressLesson || 0) * 2 * 100;
                      const isDone = progressPercent === 100;
                      const isCurrent = lesson.lessonId === parseInt(currentLessonId);
                      const isLocked = false;

                      return (
                        <div 
                          key={lesson.lessonId} 
                          onClick={() => !isLocked && handleLessonClick(lesson.lessonId)}
                          className={`p-3 pl-4 flex items-center gap-3 transition cursor-pointer relative group
                            ${isCurrent ? "bg-teal-50" : "hover:bg-gray-50"}
                            ${isLocked ? "opacity-60 cursor-not-allowed" : ""}
                          `}
                        >
                          {/* Active Indicator Bar */}
                          {isCurrent && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00b6b6]"></div>
                          )}

                          {/* Icon status */}
                          <div className="flex-shrink-0">
                            {isDone ? (
                              <CheckCircle size={18} className="text-[#00b6b6] fill-teal-50" />
                            ) : isLocked ? (
                              <Lock size={18} className="text-gray-400" />
                            ) : (
                              <Circle size={18} className="text-gray-300 group-hover:text-[#00b6b6] transition" />
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${
                              isCurrent ? "text-[#00b6b6]" : "text-gray-700"
                            }`}>
                              {lesson.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Play size={10} /> {formatDuration(lesson.duration)}
                              </span>
                              {progressPercent > 0 && progressPercent < 100 && (
                                <span className="text-xs text-[#00b6b6] font-medium">
                                  {progressPercent.toFixed(0)}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-gray-400 text-xs">
                      No lessons in this chapter
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}