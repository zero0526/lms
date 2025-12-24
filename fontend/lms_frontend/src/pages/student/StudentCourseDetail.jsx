import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { 
  PlayCircle, Check, Plus, Minus, Clock, Film, Award, Battery, Star 
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

export default function StudentCourseDetail() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [openChapters, setOpenChapters] = useState({ 0: true });
  const [isEnrolled, setIsEnrolled] = useState(false); 
  const [currentUser, setCurrentUser] = useState(null);
  
  const [courseDetails, setCourseDetails] = useState(null);
  const [courseOutline, setCourseOutline] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Review states
  const [reviews, setReviews] = useState([]);
  const [reviewPage, setReviewPage] = useState(0);
  const [reviewLimit] = useState(10);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0); // ✅ Thêm state cho hover
  const [userComment, setUserComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // ✅ Load user info
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

  // ✅ Fetch course data
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!currentUser?.userId || !courseId) return;

      try {
        setIsLoading(true);

        const detailsData = await getCourseDetails(courseId);
        setCourseDetails(detailsData.data);

        const enrolled = await checkEnrollmentStatus(currentUser.userId, courseId);
        setIsEnrolled(enrolled);

        let outlineData;
        if (enrolled) {
          outlineData = await getCourseOutlineEnrolled(currentUser.userId, courseId);
        } else {
          outlineData = await getCourseOutlinePublic(courseId);
        }
        
        setCourseOutline(outlineData.data || []);
        setIsLoading(false);
      } catch (err) {
        console.error("❌ Failed to fetch course data:", err);
        setError("Không thể tải thông tin khóa học. Vui lòng thử lại sau.");
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [currentUser, courseId]);

  // ✅ Fetch reviews
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

  const handleEnroll = async () => {
    if (!currentUser?.userId) return;

    try {
      setIsLoading(true);
      
      const enrollResult = await enrollCourse(currentUser.userId, courseId);

      if (enrollResult.status === 200) {
        alert("Đăng ký khóa học thành công! Bắt đầu học ngay.");
        setIsEnrolled(true);

        const enrolledOutline = await getCourseOutlineEnrolled(currentUser.userId, courseId);
        setCourseOutline(enrolledOutline.data || []);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Enroll error:", error);
      alert(error.response?.data?.message || "Đăng ký khóa học thất bại. Vui lòng thử lại.");
      setIsLoading(false);
    }
  };

  const handleLessonClick = (lessonId) => {
    if (!isEnrolled) {
      alert("Bạn cần đăng ký khóa học trước khi học!");
      return;
    }
    navigate(`/student/courses/${courseId}/lessons/${lessonId}`);
  };

  // ✅ Handle submit review với validation chặt chẽ
  const handleSubmitReview = async () => {
    if (!currentUser?.userId) {
      alert("Vui lòng đăng nhập để đánh giá khóa học.");
      return;
    }

    if (userRating === 0) {
      alert("Vui lòng chọn số sao đánh giá.");
      return;
    }

    if (!userComment || userComment.trim() === '') {
      alert("Vui lòng nhập nội dung đánh giá.");
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
      
      alert("Đánh giá của bạn đã được gửi thành công!");
      
      // Reset form
      setUserRating(0);
      setHoverRating(0);
      setUserComment("");
      
      // Reload reviews
      setReviewPage(0);
      setReviews([]);
      
      // Reload course details to update rating
      const detailsData = await getCourseDetails(courseId);
      setCourseDetails(detailsData.data);
      
      setIsSubmittingReview(false);
    } catch (error) {
      console.error("Submit review error:", error);
      alert(error.message || "Gửi đánh giá thất bại. Vui lòng thử lại.");
      setIsSubmittingReview(false);
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

  const formatReviewDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen font-sans">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 pt-24 pb-12">
          <div className="flex flex-col justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00b6b6] mb-4"></div>
            <p className="text-gray-500">Đang tải khóa học...</p>
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
              onClick={() => navigate("/student/courses")} 
              className="mt-4 px-6 py-2 bg-[#00b6b6] text-white rounded-lg hover:bg-[#009e9e] transition"
            >
              Quay lại khóa học của tôi
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
                    Được dạy bởi <span className="text-[#00b6b6]">{courseDetails.teacherName}</span>
                  </p>
                  <p className="text-xs text-gray-500">Giảng viên</p>
                </div>
              </div>
            </div>

            {courseDetails.preconditions && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">📋 Yêu cầu trước khi học:</h3>
                <p className="text-sm text-gray-700">{courseDetails.preconditions}</p>
              </div>
            )}

            {whatYouWillLearn.length > 0 && (
              <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Bạn sẽ học được gì?</h2>
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
                <h2 className="text-xl font-semibold text-gray-800">Nội dung khóa học</h2>
                <div className="text-sm text-gray-500 font-medium">
                  <span className="font-bold">{courseDetails.numOfChapter}</span> chương •{" "}
                  <span className="font-bold">{courseDetails.numOfLesson}</span> bài học •{" "}
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
                      <span className="text-xs text-gray-500">{chapter.lessons.length} bài học</span>
                    </div>

                    {openChapters[index] && (
                      <div className="divide-y divide-gray-100">
                        {chapter.lessons.map((lesson) => (
                          <div 
                            key={lesson.lessonId} 
                            onClick={() => handleLessonClick(lesson.lessonId)} 
                            className={`flex justify-between items-center p-4 pl-10 transition cursor-pointer group 
                              ${isEnrolled ? "hover:bg-teal-50" : "hover:bg-gray-50"}`}
                          >
                            <div className="flex items-center gap-3">
                              <PlayCircle className={`w-4 h-4 ${isEnrolled ? "text-gray-400 group-hover:text-[#00b6b6]" : "text-gray-300"}`} />
                              
                              <div className="flex flex-col">
                                <span className={`text-sm group-hover:text-gray-900 ${isEnrolled ? "text-gray-600" : "text-gray-400"}`}>
                                  {lesson.title}
                                </span>
                                {isEnrolled && lesson.progressLesson !== undefined && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="w-20 bg-gray-200 rounded-full h-1">
                                      <div 
                                        className="bg-[#00b6b6] h-1 rounded-full" 
                                        style={{width: `${lesson.progressLesson}%`}}
                                      ></div>
                                    </div>
                                    <span className="text-xs text-gray-400">{lesson.progressLesson.toFixed(0)}%</span>
                                  </div>
                                )}
                              </div>
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

            {/* ✅ Reviews Section */}
            <div id="reviews" className="pt-8 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                <h2 className="text-xl font-bold text-gray-800">
                  {courseDetails.rating?.toFixed(1) || "Chưa có"} Đánh giá khóa học
                </h2>
                <span className="text-gray-500 text-sm">({courseDetails.numOfRating || 0} đánh giá)</span>
              </div>

              {/* ✅ Review Form - Only for enrolled students */}
              {isEnrolled && (
                <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm mb-6">
                  <h3 className="font-bold text-gray-800 mb-4">Viết đánh giá của bạn</h3>
                  
                  {/* ✅ Star Rating với Hover Effect */}
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
                        {userRating} sao
                      </span>
                    )}
                  </div>

                  <textarea 
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#00b6b6] outline-none mb-3 resize-none" 
                    rows="4" 
                    placeholder="Chia sẻ cảm nghĩ của bạn về khóa học..."
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    maxLength={500}
                  ></textarea>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {userComment.length}/500 ký tự
                    </span>
                    <button 
                      onClick={handleSubmitReview}
                      disabled={isSubmittingReview || userRating === 0 || !userComment.trim()}
                      className="bg-[#00b6b6] text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-[#009e9e] transition disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                    </button>
                  </div>
                </div>
              )}

              {/* ✅ Reviews List */}
              <div className="space-y-4">
                {reviews.length > 0 ? (
                  <>
                    {reviews.map((review, index) => (
                      <div key={index} className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#00b6b6] to-[#009e9e] rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">
                              {review.userName?.charAt(0).toUpperCase() || "?"}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-gray-800">{review.userName || "Anonymous"}</h4>
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
                            </div>
                            <p className="text-xs text-gray-500 mb-2">{formatReviewDate(review.at)}</p>
                            <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Load More Button */}
                    {hasMoreReviews && (
                      <div className="text-center">
                        <button
                          onClick={() => setReviewPage(prev => prev + 1)}
                          disabled={isLoadingReviews}
                          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 font-medium"
                        >
                          {isLoadingReviews ? "Đang tải..." : "Xem thêm đánh giá"}
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
                      Chưa có đánh giá nào. {isEnrolled && "Hãy là người đầu tiên đánh giá khóa học này!"}
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
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=Course+Thumbnail' }}
                  />
                </div>
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                  <PlayCircle className="w-16 h-16 text-white" />
                </div>
              </div>

              <div className="p-6 text-center">
                {isEnrolled ? (
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-2 text-left">Tiến độ học tập</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div 
                        className="bg-[#00b6b6] h-2 rounded-full" 
                        style={{
                          width: `${
                            courseOutline.length > 0 
                              ? courseOutline.reduce((acc, chapter) => {
                                  const chapterProgress = chapter.lessons.reduce((sum, lesson) => 
                                    sum + (lesson.progressLesson || 0), 0
                                  ) / chapter.lessons.length;
                                  return acc + chapterProgress;
                                }, 0) / courseOutline.length
                              : 0
                          }%`
                        }}
                      ></div>
                    </div>
                    <button 
                      onClick={() => {
                        const firstLesson = courseOutline[0]?.lessons[0];
                        if (firstLesson) handleLessonClick(firstLesson.lessonId);
                      }}
                      className="w-full bg-[#00b6b6] text-white font-bold text-lg py-3 rounded-full hover:bg-[#009e9e] transition shadow-lg transform active:scale-95"
                    >
                      TIẾP TỤC HỌC
                    </button>
                  </div>
                ) : (
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold text-[#00b6b6] mb-4">Miễn phí</h2>
                    <button 
                      onClick={handleEnroll} 
                      className="w-full bg-[#00b6b6] text-white font-bold text-lg py-3 rounded-full hover:bg-[#009e9e] transition shadow-lg transform active:scale-95"
                    >
                      ĐĂNG KÝ HỌC
                    </button>
                  </div>
                )}

                <ul className="text-left space-y-4 text-sm text-gray-600 border-t border-gray-100 pt-4">
                  <li className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-gray-400" />
                    <span>Trình độ cơ bản</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Film className="w-5 h-5 text-gray-400" />
                    <span>Tổng số <strong>{courseDetails.numOfLesson}</strong> bài học</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span>Thời lượng <strong>{formatDuration(courseDetails.courseDuration)}</strong></span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Battery className="w-5 h-5 text-gray-400" />
                    <span>Học mọi lúc, mọi nơi</span>
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