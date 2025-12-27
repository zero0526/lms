import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { 
  PlayCircle, Check, Plus, Minus, Clock, Film, Award, Battery, Star, CheckCircle
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { convertDriveLink } from "../../api/user/userUtils";
import { 
  getCourseDetails, 
  getCourseOutlinePublic, 
  getCourseOutlineEnrolled,
  enrollCourse,
  checkEnrollmentStatus 
} from "../../api/user/courseApi";
import { submitCourseReview, getCourseReviews } from "../../api/student/reviewApi";
import courseplaceholder from "../../assets/courseplaceholder.png";

export default function StudentCourseDetail() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const cimgplaceholder = courseplaceholder;

  const [openChapters, setOpenChapters] = useState({ 0: true });
  const [isEnrolled, setIsEnrolled] = useState(false); 
  const [currentUser, setCurrentUser] = useState(null);
  
  const [courseDetails, setCourseDetails] = useState(null);
  const [courseOutline, setCourseOutline] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review states
  const [reviews, setReviews] = useState([]);
  const [reviewPage, setReviewPage] = useState(0);
  const [reviewLimit] = useState(10);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Load user info
  useEffect(() => {
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      } catch (e) {
        console.error("Parse user error", e);
      }
    }
  }, []);

  // Reset all states when courseId changes
  useEffect(() => {
    console.log("🔄 Course ID changed to:", courseId);
    
    setIsEnrolled(false);
    setCourseDetails(null);
    setCourseOutline([]);
    setError(null);
    setIsLoading(true);
    
    setReviews([]);
    setReviewPage(0);
    setHasMoreReviews(true);
    setUserRating(0);
    setHoverRating(0);
    setUserComment("");
    
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
        setCourseDetails(detailsData.data);

        // 2. Check if user is logged in
        if (!currentUser?.userId) {
          console.log("👤 Guest user - fetching public outline");
          
          // Guest: Fetch public outline
          const publicOutline = await getCourseOutlinePublic(courseId);
          
          console.log("📦 Public Outline:", publicOutline);
          
          setIsEnrolled(false);
          setCourseOutline(publicOutline.data?.chapters || []);
        } else {
          console.log("👤 Logged in user - checking enrollment");
          
          // Logged in: Check enrollment status
          const enrolled = await checkEnrollmentStatus(currentUser.userId, courseId);
          console.log("Enrollment status:", enrolled);
          setIsEnrolled(enrolled);

          // Fetch appropriate outline based on enrollment
          let outlineData;
          if (enrolled) {
            outlineData = await getCourseOutlineEnrolled(currentUser.userId, courseId);
          } else {
            outlineData = await getCourseOutlinePublic(courseId);
          }
          
          console.log("📦 Outline data:", outlineData);
          setCourseOutline(outlineData.data?.chapters || []);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("❌ Failed to fetch course data:", err);
        setError("Unable to load course information. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [currentUser, courseId]);

  // Handle enroll - Update outline sau khi enroll
  const handleEnroll = async () => {
    if (!currentUser?.userId) {
      alert("Please log in to enroll in this course.");
      navigate("/login");
      return;
    }

    try {
      setIsLoading(true);
      
      const enrollResult = await enrollCourse(currentUser.userId, courseId);

      if (enrollResult.status === 200) {
        alert("Successfully enrolled in the course! Start learning now.");
        
        // Fetch lại enrolled outline sau khi enroll
        const enrolledOutline = await getCourseOutlineEnrolled(currentUser.userId, courseId);
        
        console.log("📦 Enrolled outline after enroll:", enrolledOutline);
        
        setIsEnrolled(enrolledOutline.data?.isEnrolled || true);
        setCourseOutline(enrolledOutline.data?.chapters || []);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Enroll error:", error);
      alert(error.response?.data?.message || "Failed to enroll in the course. Please try again.");
      setIsLoading(false);
    }
  };

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!courseId) return;

      try {
        setIsLoadingReviews(true);
        const reviewsData = await getCourseReviews(courseId, reviewPage, reviewLimit);
        
        console.log("Reviews data:", reviewsData);
        
        if (reviewsData.data && reviewsData.data.content) {
          setReviews(prev => reviewPage === 0 ? reviewsData.data.content : [...prev, ...reviewsData.data.content]);
          setHasMoreReviews(!reviewsData.data.last);
        }
        
        setIsLoadingReviews(false);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
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

  const handleLessonClick = (lessonId) => {
    if (!isEnrolled) {
      alert("You need to enroll in the course before learning!");
      return;
    }
    navigate(`/student/courses/${courseId}/lessons/${lessonId}`);
  };

  const handleSubmitReview = async () => {
    if (!currentUser?.userId) {
      alert("Please log in to review the course.");
      return;
    }

    if (userRating === 0) {
      alert("Please select a star rating.");
      return;
    }

    if (!userComment || userComment.trim() === '') {
      alert("Please enter your review content.");
      return;
    }

    try {
      setIsSubmittingReview(true);

      const reviewData = {
        rating: userRating,
        userid: currentUser.userId,
        at: new Date().toISOString(),
        courseId: parseInt(courseId),
        comment: userComment.trim()
      };

      console.log("Submitting review:", reviewData);

      await submitCourseReview(reviewData);
      
      alert("Your review has been submitted successfully!");
      
      setUserRating(0);
      setHoverRating(0);
      setUserComment("");
      
      setReviewPage(0);
      setReviews([]);
      
      const detailsData = await getCourseDetails(courseId);
      setCourseDetails(detailsData.data);
      
      setIsSubmittingReview(false);
    } catch (error) {
      console.error("Submit review error:", error);
      alert(error.message || "Failed to submit review. Please try again.");
      setIsSubmittingReview(false);
    }
  };

  // Calculate overall course progress (0-100%)
  const calculateCourseProgress = () => {
    if (!isEnrolled || courseOutline.length === 0) return 0;

    let totalLessons = 0;
    let totalProgress = 0;

    courseOutline.forEach(chapter => {
      if (chapter.lessons && chapter.lessons.length > 0) {
        chapter.lessons.forEach(lesson => {
          totalLessons++;
          // Convert 0.0-1.0 to 0-100%
          totalProgress += (lesson.progressLesson * 2 || 0) * 100;
        });
      }
    });

    return totalLessons > 0 ? Math.round(totalProgress / totalLessons) : 0;
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

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen font-sans">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 pt-24 pb-12">
          <div className="flex flex-col justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00b6b6] mb-4"></div>
            <p className="text-gray-500">Loading course...</p>
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
            <h2 className="text-xl font-bold text-red-800 mb-2">Failed to load course</h2>
            <p className="text-red-600">{error || "Course not found"}</p>
            <button 
              onClick={() => navigate("/student/courses")} 
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
  const overallProgress = calculateCourseProgress();

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
                  onError={(e) => { e.target.src = cimgplaceholder }}
                />
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    <span className="text-[#00b6b6]">{courseDetails.teacherName}</span>
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
                <h2 className="text-xl font-semibold mb-4 text-gray-800">What you'll learn</h2>
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
                        {chapter.lessons.map((lesson) => {
                          // Convert 0.0-1.0 to 0-100%
                          const progressPercent = Math.round((lesson.progressLesson * 2 || 0) * 100);
                          const isCompleted = progressPercent === 100;

                          return (
                            <div 
                              key={lesson.lessonId} 
                              onClick={() => handleLessonClick(lesson.lessonId)} 
                              className={`flex justify-between items-center p-4 pl-10 transition cursor-pointer group 
                                ${isEnrolled ? "hover:bg-teal-50" : "hover:bg-gray-50"}`}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                {/* Icon based on completion status */}
                                {isEnrolled && isCompleted ? (
                                  <CheckCircle className="w-4 h-4 text-[#00b6b6] fill-teal-50 flex-shrink-0" />
                                ) : (
                                  <PlayCircle className={`w-4 h-4 flex-shrink-0 ${isEnrolled ? "text-gray-400 group-hover:text-[#00b6b6]" : "text-gray-300"}`} />
                                )}
                                
                                <div className="flex flex-col flex-1">
                                  <span className={`text-sm group-hover:text-gray-900 ${isEnrolled ? "text-gray-600" : "text-gray-400"}`}>
                                    {lesson.title}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                {/* Show progress percentage if enrolled */}
                                {isEnrolled && progressPercent > 0 && (
                                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                                    isCompleted 
                                      ? "bg-teal-50 text-[#00b6b6]" 
                                      : "bg-blue-50 text-blue-600"
                                  }`}>
                                    {progressPercent}%
                                  </span>
                                )}
                                
                                {/* Duration */}
                                <span className="text-xs text-gray-400">
                                  {formatLessonDuration(lesson.duration)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
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
                  {courseDetails.rating?.toFixed(1) || "N/A"} Course Rating
                </h2>
                <span className="text-gray-500 text-sm">({courseDetails.numOfRating || 0} reviews)</span>
              </div>

              {/* Review Form - Only for enrolled students */}
              {isEnrolled && (
                <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm mb-6">
                  <h3 className="font-bold text-gray-800 mb-4">Write your review</h3>
                  
                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map(star => {
                      const displayRating = hoverRating || userRating;
                      return (
                        <Star 
                          key={star} 
                          size={28}
                          className={`cursor-pointer transition-all duration-150 ${
                            star <= displayRating
                              ? "text-yellow-400 fill-yellow-400 scale-110" 
                              : "text-gray-300 hover:text-yellow-300"
                          }`}
                          onClick={() => setUserRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                        />
                      );
                    })}
                    {userRating > 0 && (
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        {userRating} {userRating === 1 ? 'star' : 'stars'}
                      </span>
                    )}
                  </div>

                  <textarea 
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#00b6b6] outline-none mb-3 resize-none" 
                    rows="4" 
                    placeholder="Share your thoughts about the course..."
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    maxLength={500}
                  ></textarea>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {userComment.length}/500 characters
                    </span>
                    <button 
                      onClick={handleSubmitReview}
                      disabled={isSubmittingReview || userRating === 0 || !userComment.trim()}
                      className="bg-[#00b6b6] text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-[#009e9e] transition disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSubmittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length > 0 ? (
                  <>
                    {reviews.map((review, index) => {
                      const firstLetter = review.fullName?.charAt(0).toUpperCase() || "?";
                      const avatarUrl = review.avatarUrl ? convertDriveLink(review.avatarUrl) : null;
                      
                      return (
                        <div key={index} className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                          <div className="flex items-start gap-4">
                            {avatarUrl ? (
                              <img 
                                src={avatarUrl}
                                alt={review.fullName}
                                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className={`w-10 h-10 bg-gradient-to-br from-[#00b6b6] to-[#009e9e] rounded-full flex items-center justify-center flex-shrink-0 ${avatarUrl ? 'hidden' : ''}`}
                            >
                              <span className="text-white font-bold text-sm">
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
                  <div className="bg-gray-50 border border-gray-200 p-8 rounded-lg text-center">
                    <div className="text-gray-400 mb-2">
                      <Star size={48} className="mx-auto" />
                    </div>
                    <p className="text-gray-500">
                      No reviews yet. {isEnrolled && "Be the first to review this course!"}
                    </p>
                  </div>
                )}
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
                    onError={(e) => { e.target.src = cimgplaceholder }}
                  />
                </div>
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                  <PlayCircle className="w-16 h-16 text-white" />
                </div>
              </div>

              <div className="p-6 text-center">
                {isEnrolled ? (
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-3 text-left font-medium">Learning Progress</p>
                    
                    {/* Progress Bar with Percentage */}
                    <div className="relative mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-[#00b6b6] to-[#009e9e] h-3 rounded-full transition-all duration-500 ease-out" 
                          style={{ width: `${overallProgress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">Progress</span>
                        <span className="text-sm font-bold text-[#00b6b6]">
                          {overallProgress}%
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        const firstLesson = courseOutline[0]?.lessons[0];
                        if (firstLesson) handleLessonClick(firstLesson.lessonId);
                      }}
                      className="w-full bg-[#00b6b6] text-white font-bold text-lg py-3 rounded-full hover:bg-[#009e9e] transition shadow-lg transform active:scale-95"
                    >
                      CONTINUE
                    </button>
                  </div>
                ) : (
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold text-[#00b6b6] mb-4">Free</h2>
                    <button 
                      onClick={handleEnroll} 
                      className="w-full bg-[#00b6b6] text-white font-bold text-lg py-3 rounded-full hover:bg-[#009e9e] transition shadow-lg transform active:scale-95"
                    >
                      ENROLL
                    </button>
                  </div>
                )}

                <ul className="text-left space-y-4 text-sm text-gray-600 border-t border-gray-100 pt-4">
                  <li className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-gray-400" />
                    <span>Basic Level</span>
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