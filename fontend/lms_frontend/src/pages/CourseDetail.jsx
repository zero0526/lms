import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { 
  PlayCircle, Check, Plus, Minus, Clock, Film, Award, Battery, Star, Lock 
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { convertDriveLink } from "../api/user/userUtils";
import { getCourseDetails, getCourseOutlinePublic } from "../api/user/courseApi";

export default function CourseDetail() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [openChapters, setOpenChapters] = useState({ 0: true });
  const [courseDetails, setCourseDetails] = useState(null);
  const [courseOutline, setCourseOutline] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

// Fetch course details và outline (public only)
useEffect(() => {
  const fetchCourseData = async () => {
    try {
      setIsLoading(true);

      const [detailsData, outlineData] = await Promise.all([
        getCourseDetails(courseId),
        getCourseOutlinePublic(courseId)
      ]);

      console.log("Course Details:", detailsData);
      console.log("Course Outline:", outlineData);

      setCourseDetails(detailsData.data);

      const chapters = outlineData.data?.chapters || [];
      console.log("Extracted chapters:", chapters);
      setCourseOutline(chapters);

      setIsLoading(false);
    } catch (err) {
      console.error("Failed to fetch course data:", err);
      setError("Không thể tải thông tin khóa học. Vui lòng thử lại sau.");
      setIsLoading(false);
    }
  };

  if (courseId) {
    fetchCourseData();
  }
}, [courseId]);

  const toggleChapter = (index) => {
    setOpenChapters((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Redirect to login or student course detail
  const handleViewCourse = () => {
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
  
    if (!userStr) {
      navigate("/login", { 
        state: { 
          from: `/student/courses/${courseId}`,
          courseName: courseDetails.title 
        } 
      });
      return;
    }

    try {
      const user = JSON.parse(userStr);
      
      if (user.role === "ROLE_STUDENT") {
        navigate(`/student/courses/${courseId}`);
      } else if (user.role === "ROLE_TEACHER") {
        navigate(`/teacher/courses/${courseId}`);
      } else {
        alert("Please log in as a student to enroll in this course.");
      }
    } catch (e) {
      console.error("Parse user error", e);
      navigate("/login");
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "Chưa cập nhật";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours > 0 ? hours + ' giờ ' : ''}${minutes} phút`;
  };

  const formatLessonDuration = (seconds) => {
    if (!seconds) return "Chưa cập nhật";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const parseTargets = (targets) => {
    try {
      if (Array.isArray(targets)) return targets;
      if (typeof targets === 'string') {
        try {
          const parsed = JSON.parse(targets);
          if (Array.isArray(parsed)) return parsed;
        } catch {
          return targets.split(/\n|,/).map(t => t.trim()).filter(Boolean);
        }
      }
      return [];
    } catch {
      return [];
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen font-sans">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 pt-24 pb-12">
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00b6b6]"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !courseDetails) {
    return (
      <div className="bg-gray-50 min-h-screen font-sans">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 pt-24 pb-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <h2 className="text-xl font-bold text-red-800 mb-2">Lỗi tải khóa học</h2>
            <p className="text-red-600">{error || "Không tìm thấy khóa học"}</p>
            <button 
              onClick={() => navigate("/courses")} 
              className="mt-4 px-6 py-2 bg-[#00b6b6] text-white rounded-lg hover:bg-[#009e9e] transition"
            >
              Back to course list
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const whatYouWillLearn = parseTargets(courseDetails.courseTargets);

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{courseDetails.title}</h1>
              <p className="text-gray-600 leading-relaxed mb-4">{courseDetails.desc}</p>
              
              <div className="flex items-center gap-3">
                <img 
                  src={convertDriveLink(courseDetails.teachAvatarUrl)} 
                  alt="instructor" 
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/40' }}
                />
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    Taught by <span className="text-[#00b6b6]">{courseDetails.teacherName}</span>
                  </p>
                  <p className="text-xs text-gray-500">Instructor</p>
                </div>
              </div>
            </div>

            {courseDetails.preconditions && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">📋 Prerequisites:</h3>
                <p className="text-sm text-gray-700">{courseDetails.preconditions}</p>
              </div>
            )}

            {whatYouWillLearn.length > 0 && (
              <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">What you will learn</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {whatYouWillLearn.map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-[#00b6b6] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Course Content</h2>
                <div className="text-sm text-gray-500 font-medium">
                  <span className="font-bold">{courseDetails.numOfChapter}</span> chapters •{" "}
                  <span className="font-bold">{courseDetails.numOfLesson}</span> lessons •{" "}
                  <span className="font-bold">{formatDuration(courseDetails.courseDuration)}</span>
                </div>
              </div>

              <div className="space-y-3">
                {courseOutline.map((chapter, index) => (
                  <div key={chapter.chapterId} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                    <div 
                      onClick={() => toggleChapter(index)}
                      className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition select-none"
                    >
                      <div className="flex items-center gap-3">
                        {openChapters[index] ? 
                          <Minus className="w-4 h-4 text-[#00b6b6]" /> : 
                          <Plus className="w-4 h-4 text-[#00b6b6]" />
                        }
                        <h3 className="font-semibold text-gray-700">{chapter.title}</h3>
                      </div>
                      <span className="text-xs text-gray-500">{chapter.lessons.length} lessons</span>
                    </div>

                    {openChapters[index] && (
                      <div className="divide-y divide-gray-100">
                        {chapter.lessons.map((lesson) => (
                          <div 
                            key={lesson.lessonId} 
                            className="flex justify-between items-center p-4 pl-10 bg-gray-50/50"
                          >
                            <div className="flex items-center gap-3">
                              <Lock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-400">{lesson.title}</span>
                            </div>
                            <span className="text-xs text-gray-400">
                              {formatLessonDuration(lesson.duration)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div id="reviews" className="pt-8 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                <h2 className="text-xl font-bold text-gray-800">
                  {courseDetails.rating?.toFixed(1) || "No"} Course Ratings
                </h2>
                <span className="text-gray-500 text-sm">({courseDetails.numOfRating} ratings)</span>
              </div>

              <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg text-center text-gray-500">
                Log in to see reviews
              </div>
            </div>

          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden sticky top-28">
              
              <div className="relative group cursor-pointer">
                <div className="w-full h-48 bg-gray-200 overflow-hidden">
                  <img 
                    src={convertDriveLink(courseDetails.thumbnailUrl)} 
                    alt="Thumbnail" 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=Course+Thumbnail' }}
                  />
                </div>
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                  <PlayCircle className="w-16 h-16 text-white" />
                </div>
              </div>

              <div className="p-6 text-center">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-[#00b6b6] mb-4">Free</h2>
                    {/* Show different text based on login status */}
                    <p className="text-sm text-gray-600 mb-4">
                      {(() => {
                        const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
                        if (!userStr) {
                          return "Log in to enroll and start learning";
                        }
                        
                        try {
                          const user = JSON.parse(userStr);
                          if (user.role === "ROLE_STUDENT") {
                            return "Click below to enroll in this course";
                          }
                          return "View course details";
                        } catch {
                          return "Log in to continue";
                        }
                      })()}
                    </p>
                  <button 
                    onClick={handleViewCourse} 
                    className="w-full bg-[#00b6b6] text-white font-bold text-lg py-3 rounded-full hover:bg-[#009e9e] transition shadow-lg transform active:scale-95"
                  >
                    {(() => {
                      const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
                      if (!userStr) return "LOG IN TO ENROLL";
                      
                      try {
                        const user = JSON.parse(userStr);
                        if (user.role === "ROLE_STUDENT") return "ENROLL NOW";
                        if (user.role === "ROLE_TEACHER") return "VIEW AS TEACHER";
                        return "VIEW COURSE";
                      } catch {
                        return "VIEW COURSE";
                      }
                    })()}
                  </button>
                </div>
                
                {/* Course Info */}
                <ul className="text-left space-y-4 text-sm text-gray-600 border-t border-gray-100 pt-4">
                  <li className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-gray-400" />
                    <span>Beginner Level</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Film className="w-5 h-5 text-gray-400" />
                    <span>Total <strong>{courseDetails.numOfLesson}</strong> lessons</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span>Duration <strong>{formatDuration(courseDetails.courseDuration)}</strong></span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Battery className="w-5 h-5 text-gray-400" />
                    <span>Learn anytime, anywhere</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}