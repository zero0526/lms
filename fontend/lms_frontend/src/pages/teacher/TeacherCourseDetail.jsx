import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { 
  PlayCircle, 
  Check, 
  Plus, 
  Minus, 
  Clock, 
  Award,
  Edit3,
  Trash2,
  Users,
  Video,
  Star,
  TrendingUp,
  BookOpen,
  Target
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { convertDriveLink } from "../../api/user/userUtils";
import { 
  getCourseDetails, 
  getCourseOutlinePublic
} from "../../api/user/courseApi";
import { getCourseReviews } from "../../api/student/reviewApi";
import courseplaceholder from "../../assets/courseplaceholder.png";

export default function TeacherCourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const cimgplaceholder = courseplaceholder;

  const [courseDetails, setCourseDetails] = useState(null);
  const [courseOutline, setCourseOutline] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [openChapters, setOpenChapters] = useState({ 0: true });

  // Review states
  const [reviews, setReviews] = useState([]);
  const [reviewPage, setReviewPage] = useState(0);
  const [reviewLimit] = useState(10);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  // Reset states when courseId changes
  useEffect(() => {
    console.log("🔄 Course ID changed to:", courseId);
    
    setCourseDetails(null);
    setCourseOutline([]);
    setError(null);
    setIsLoading(true);
    
    setReviews([]);
    setReviewPage(0);
    setHasMoreReviews(true);
    
    setOpenChapters({ 0: true });
  }, [courseId]);

  // Fetch course data
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;

      try {
        setIsLoading(true);

        console.log("📚 Fetching course data for courseId:", courseId);

        // 1. Fetch course details
        const detailsData = await getCourseDetails(courseId);
        console.log("📦 Course details:", detailsData.data);
        setCourseDetails(detailsData.data);

        // 2. Fetch public outline (teacher doesn't need enrollment check)
        const outlineData = await getCourseOutlinePublic(courseId);
        console.log("📦 Course outline:", outlineData.data);
        setCourseOutline(outlineData.data?.chapters || []);
        
        setIsLoading(false);
      } catch (err) {
        console.error("❌ Failed to fetch course data:", err);
        setError("Unable to load course information. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!courseId) return;

      try {
        setIsLoadingReviews(true);
        const reviewsData = await getCourseReviews(courseId, reviewPage, reviewLimit);
        
        console.log("📝 Reviews data:", reviewsData);
        
        if (reviewsData.data && reviewsData.data.content) {
          setReviews(prev => reviewPage === 0 ? reviewsData.data.content : [...prev, ...reviewsData.data.content]);
          setHasMoreReviews(!reviewsData.data.last);
        }
        
        setIsLoadingReviews(false);
      } catch (err) {
        console.error("❌ Failed to fetch reviews:", err);
        setIsLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [courseId, reviewPage, reviewLimit]);

  const toggleChapter = (index) => {
    setOpenChapters((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "Not updated";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours > 0 ? hours + ' hours ' : ''}${minutes} minutes`;
  };

  const formatLessonDuration = (seconds) => {
    if (!seconds) return "None";
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

  // Format date từ array [year, month, day, hour, minute, second, nano]
  const formatReviewDate = (dateArray) => {
    if (!dateArray || !Array.isArray(dateArray)) return "";
    
    try {
      const [year, month, day, hour, minute, second] = dateArray;
      const date = new Date(year, month - 1, day, hour, minute, second);
      
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  const handleEditCourse = () => {
    navigate(`/teacher/courses/${courseId}/edit`);
  };

  const handleStartLive = () => {
    // TODO: Navigate to live streaming page or show modal
    alert("Live streaming feature coming soon!");
  };

  const handleDeleteCourse = () => {
    if (window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      // TODO: Call delete API
      alert("Delete course functionality coming soon!");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen font-sans">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
          <div className="flex flex-col justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00b6b6] mb-4"></div>
            <p className="text-gray-500">Loading course...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !courseDetails) {
    return (
      <div className="bg-gray-50 min-h-screen font-sans">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <h2 className="text-xl font-bold text-red-800 mb-2">Failed to load course</h2>
            <p className="text-red-600">{error || "Course not found"}</p>
            <button 
              onClick={() => navigate("/teacher/courses")} 
              className="mt-4 px-6 py-2 bg-[#00b6b6] text-white rounded-lg hover:bg-[#009e9e] transition"
            >
              Back to My Courses
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const whatYouWillLearn = parseTargets(courseDetails.courseTargets);
  const avgRating = courseDetails.rating || 0;
  const totalReviews = courseDetails.numOfRating || 0;

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        {/* Breadcrumb */}
        <div 
          className="text-sm text-gray-500 mb-4 cursor-pointer hover:text-[#00b6b6] inline-flex items-center gap-1"
          onClick={() => navigate('/teacher/courses')}
        >
          ← Back to course list
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* === LEFT COLUMN: MAIN CONTENT === */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Header Info */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{courseDetails.title}</h1>
                  <p className="text-gray-600 leading-relaxed mb-4">{courseDetails.desc}</p>
                </div>
                {/* Course Status Badge */}
                <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                  courseDetails.isCompleted 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {courseDetails.isCompleted ? 'Published' : 'Draft'}
                </div>
              </div>
              
              {/* Instructor Info */}
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src={convertDriveLink(courseDetails.teachAvatarUrl)} 
                  alt="instructor" 
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#00b6b6]"
                  onError={(e) => { e.target.src = cimgplaceholder }}
                />
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    Created by <span className="text-[#00b6b6]">{courseDetails.teacherName}</span>
                  </p>
                  <p className="text-xs text-gray-500">Course Instructor</p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
                  <Users className="w-6 h-6 text-[#00b6b6] mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-800">{courseDetails.numOfEnroll || 0}</p>
                  <p className="text-xs text-gray-500">Students</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
                  <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-800">{avgRating.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">{totalReviews} Reviews</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
                  <BookOpen className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-800">{courseDetails.numOfLesson}</p>
                  <p className="text-xs text-gray-500">Lessons</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
                  <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-xl font-bold text-gray-800">{formatDuration(courseDetails.courseDuration)}</p>
                  <p className="text-xs text-gray-500">Duration</p>
                </div>
              </div>
            </div>

            {/* Prerequisites Section */}
            {courseDetails.preconditions && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Target size={18} className="text-yellow-600" />
                  Prerequisites:
                </h3>
                <p className="text-sm text-gray-700">{courseDetails.preconditions}</p>
              </div>
            )}

            {/* What you'll learn */}
            {whatYouWillLearn.length > 0 && (
              <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Course Objectives</h2>
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

            {/* Course Content */}
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
                            className="flex justify-between items-center p-4 pl-10 hover:bg-teal-50 transition cursor-pointer group"
                          >
                            <div className="flex items-center gap-3">
                              <PlayCircle className="w-4 h-4 text-gray-400 group-hover:text-[#00b6b6]" />
                              <span className="text-sm text-gray-600 group-hover:text-gray-900">
                                {lesson.title}
                              </span>
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

            {/* Reviews Section */}
            <div id="reviews" className="pt-8 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                <h2 className="text-xl font-bold text-gray-800">
                  {avgRating.toFixed(1)} Course Rating
                </h2>
                <span className="text-gray-500 text-sm">({totalReviews} reviews)</span>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length > 0 ? (
                  <>
                    {reviews.map((review, index) => {
                      const firstLetter = review.fullName?.charAt(0).toUpperCase() || "?";
                      const avatarUrl = review.avatarUrl ? convertDriveLink(review.avatarUrl) : null;
                      
                      return (
                        <div key={index} className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition">
                          <div className="flex items-start gap-4">
                            {/* Avatar */}
                            {avatarUrl ? (
                              <img 
                                src={avatarUrl}
                                alt={review.fullName}
                                className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-gray-100"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className={`w-12 h-12 bg-gradient-to-br from-[#00b6b6] to-[#009e9e] rounded-full flex items-center justify-center flex-shrink-0 ${avatarUrl ? 'hidden' : ''}`}
                            >
                              <span className="text-white font-bold text-lg">
                                {firstLetter}
                              </span>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-gray-800">{review.fullName || "Anonymous"}</h4>
                                <div className="flex gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      size={16}
                                      className={`${
                                        i < review.rating 
                                          ? "text-yellow-400 fill-yellow-400" 
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                {review.isEdit && (
                                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                    Edited
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mb-2">
                                {formatReviewDate(review.lastUpdated)}
                              </p>
                              <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Load More Button */}
                    {hasMoreReviews && (
                      <div className="text-center">
                        <button
                          onClick={() => setReviewPage(prev => prev + 1)}
                          disabled={isLoadingReviews}
                          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 font-medium"
                        >
                          {isLoadingReviews ? "Loading..." : "Load More Reviews"}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 p-12 rounded-lg text-center">
                    <div className="text-gray-400 mb-3">
                      <Star size={56} className="mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No reviews yet</h3>
                    <p className="text-gray-500 text-sm">
                      This course hasn't received any reviews from students.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* === RIGHT COLUMN: SIDEBAR === */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden sticky top-28">
              
              {/* Thumbnail */}
              <div className="relative group cursor-pointer">
                <div className="w-full h-48 bg-gray-200 overflow-hidden">
                  <img 
                    src={convertDriveLink(courseDetails.thumbnailUrl)} 
                    alt="Thumbnail" 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    onError={(e) => { e.target.src = cimgplaceholder }}
                  />
                </div>
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                  <PlayCircle className="w-16 h-16 text-white" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl font-bold text-[#00b6b6]">Free</span>
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Star size={20} className="fill-yellow-400" />
                    <span className="font-bold text-gray-800">{avgRating.toFixed(1)}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {/* Edit Course Button */}
                  <button 
                    onClick={handleEditCourse}
                    className="w-full bg-[#00b6b6] text-white font-bold text-lg py-3 rounded-full hover:bg-[#009e9e] transition shadow-md transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Edit3 size={20} /> Edit Course
                  </button>
                  
                  {/* Start Live Button */}
                  <button 
                    onClick={handleStartLive}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg py-3 rounded-full hover:from-purple-600 hover:to-pink-600 transition shadow-md transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Video size={20} /> Start Live
                  </button>
                </div>

                {/* Course Info */}
                <ul className="text-left space-y-4 text-sm text-gray-600 border-t border-gray-100 pt-6 mt-6">
                  <li className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-[#00b6b6]" />
                    <span>Level: <strong>Beginner</strong></span>
                  </li>
                  <li className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-[#00b6b6]" />
                    <span><strong>{courseDetails.numOfLesson}</strong> Lessons</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#00b6b6]" />
                    <span><strong>{formatDuration(courseDetails.courseDuration)}</strong></span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-[#00b6b6]" />
                    <span><strong>{courseDetails.numOfEnroll}</strong> Students Enrolled</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-[#00b6b6]" />
                    <span>Last updated: <strong>Recently</strong></span>
                  </li>
                </ul>

                {/* Delete Button */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <button 
                    onClick={handleDeleteCourse}
                    className="w-full text-red-500 font-medium text-sm hover:text-red-600 hover:underline flex items-center justify-center gap-2 transition"
                  >
                    <Trash2 size={16} /> Delete this course
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}