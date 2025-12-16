import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { 
  PlayCircle, Check, Plus, Minus, Clock, BookOpen, Battery, Film, Award, 
  Presentation, Star, Lock 
} from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

// --- MOCK DATA (Giữ nguyên) ---
const courseData = {
  id: 1,
  title: "Kiến Thức Nhập Môn IT",
  description: "Để có cái nhìn tổng quan về ngành IT - Lập trình web các bạn nên xem các videos tại khóa này trước nhé.",
  price: 0, 
  instructor: {
    name: "Sơn Đặng",
    title: "Fullstack Developer",
    avatar: "https://files.fullstack.edu.vn/f8-prod/user_avatars/1/64f95c8b3206c.jpg",
    bio: "Giảng viên có 8 năm kinh nghiệm lập trình web."
  },
  whatYouWillLearn: [
    "Các kiến thức cơ bản, nền móng của ngành IT",
    "Các mô hình, kiến trúc cơ bản khi triển khai ứng dụng",
    "Các khái niệm, thuật ngữ cốt lõi khi triển khai ứng dụng",
    "Hiểu hơn về cách internet và máy vi tính hoạt động",
  ],
  stats: {
    chapters: 3,
    lessons: 8,
    duration: "03 giờ 26 phút",
    students: 10450,
    rating: 4.8,
    reviewCount: 320
  },
  chapters: [
    {
      id: 1,
      title: "1. Khái niệm kỹ thuật cần biết",
      lessons: [
        { id: 101, title: "1. Mô hình Client - Server là gì?", time: "11:35", type: "video" },
        { id: 102, title: "2. Domain là gì? Tên miền là gì?", time: "10:34", type: "video" },
      ]
    },
    {
      id: 2,
      title: "2. Môi trường, con người IT",
      lessons: [
        { id: 104, title: "4. Front-end, Back-end là gì?", time: "15:20", type: "video" },
        { id: 106, title: "6. Quy trình làm phần mềm", time: "12:10", type: "quiz" },
      ]
    },
  ],
  reviews: [
    {
      id: 1,
      user: "Nguyễn Văn A",
      avatar: null,
      rating: 5,
      comment: "Khóa học rất hay, dễ hiểu cho người mới bắt đầu.",
      date: "2 ngày trước"
    },
    {
      id: 2,
      user: "Trần Thị B",
      avatar: "https://i.pravatar.cc/150?img=5",
      rating: 4,
      comment: "Nội dung tốt nhưng âm thanh video hơi nhỏ.",
      date: "1 tuần trước"
    }
  ]
};

export default function CourseDetail() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const location = useLocation();

  const [openChapters, setOpenChapters] = useState({ 0: true });
  const [isEnrolled, setIsEnrolled] = useState(false); 
  const [currentUser, setCurrentUser] = useState(null);

  // --- 1. KIỂM TRA TRẠNG THÁI USER KHI VÀO TRANG ---
  useEffect(() => {
    // Lấy user từ storage để biết là Khách hay Student
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            setCurrentUser(user);
            
            // Logic giả lập: Nếu user là student và đã có trong danh sách đăng ký (Giả định)
            // Trong thực tế, bạn sẽ gọi API: api.get(`/enrollment/check/${courseId}`)
            if (user.role === "ROLE_STUDENT") {
                // Tạm thời giả lập: Nếu có state từ trang trước truyền sang thì coi như đã đăng ký
                if (location.state && location.state.isRegistered) {
                    setIsEnrolled(true);
                }
            }
        } catch (e) {
            console.error("Parse user error", e);
        }
    }
  }, [location, courseId]);

  const toggleChapter = (index) => {
    setOpenChapters((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // --- 2. XỬ LÝ KHI BẤM NÚT ĐĂNG KÝ HỌC ---
  const handleEnroll = () => {
      // TH1: Chưa đăng nhập
      if (!currentUser) {
          // Chuyển hướng sang Login, kèm theo state 'from' để sau khi login xong quay lại đúng trang này
          if(window.confirm("Bạn cần đăng nhập để tham gia khóa học. Đi tới trang đăng nhập?")) {
              navigate("/login", { state: { from: location.pathname } });
          }
          return;
      }

      // TH2: Đã đăng nhập nhưng không phải Student (VD: Teacher)
      if (currentUser.role !== "ROLE_STUDENT") {
          alert("Tài khoản của bạn không phải là Học sinh nên không thể đăng ký khóa học này.");
          return;
      }

      // TH3: Đã đăng nhập là Student -> Gọi API đăng ký
      // const res = await apiClient.post('/course/enroll', { courseId });
      setTimeout(() => {
        alert("Đăng ký khóa học thành công! Bắt đầu học ngay.");
        setIsEnrolled(true);
      }, 500);
  }

  const handleLessonClick = (lessonId) => {
    if (!isEnrolled) {
        // Nếu chưa đăng ký, bấm vào bài học sẽ kích hoạt luồng đăng ký
        handleEnroll(); 
        return;
    }
    const currentCourseId = courseId || courseData.id;
    navigate(`/student/courses/${currentCourseId}/lessons/${lessonId}`);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
        <Star 
            key={i} 
            size={14} 
            className={`${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} 
        />
    ));
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* === CỘT TRÁI: NỘI DUNG CHÍNH === */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{courseData.title}</h1>
              <p className="text-gray-600 leading-relaxed mb-4">{courseData.description}</p>
              
              <div className="flex items-center gap-3">
                <img src={courseData.instructor.avatar} alt="instructor" className="w-10 h-10 rounded-full object-cover"/>
                <div>
                    <p className="text-sm font-bold text-gray-800">Được dạy bởi <span className="text-[#00b6b6]">{courseData.instructor.name}</span></p>
                    <p className="text-xs text-gray-500">{courseData.instructor.title}</p>
                </div>
              </div>
            </div>

            {/* What you will learn */}
            <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Bạn sẽ học được gì?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {courseData.whatYouWillLearn.map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#00b6b6] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Content (Chapters) */}
            <div>
              <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Nội dung khóa học</h2>
                <div className="text-sm text-gray-500 font-medium">
                  <span className="font-bold">{courseData.stats.chapters}</span> chương •{" "}
                  <span className="font-bold">{courseData.stats.lessons}</span> bài học •{" "}
                  <span className="font-bold">{courseData.stats.duration}</span>
                </div>
              </div>

              <div className="space-y-3">
                {courseData.chapters.map((chapter, index) => (
                  <div key={chapter.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                    <div 
                      onClick={() => toggleChapter(index)}
                      className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition select-none"
                    >
                      <div className="flex items-center gap-3">
                        {openChapters[index] ? <Minus className="w-4 h-4 text-[#00b6b6]" /> : <Plus className="w-4 h-4 text-[#00b6b6]" />}
                        <h3 className="font-semibold text-gray-700">{chapter.title}</h3>
                      </div>
                      <span className="text-xs text-gray-500">{chapter.lessons.length} bài học</span>
                    </div>

                    {openChapters[index] && (
                      <div className="divide-y divide-gray-100">
                        {chapter.lessons.map((lesson) => (
                          <div 
                            key={lesson.id} 
                            onClick={() => handleLessonClick(lesson.id)} 
                            className={`flex justify-between items-center p-4 pl-10 transition cursor-pointer group 
                                ${isEnrolled ? "hover:bg-teal-50" : "hover:bg-gray-50 bg-gray-50/50"}`}
                          >
                            <div className="flex items-center gap-3">
                              {/* Logic Icon: Nếu chưa Enroll thì hiện Lock, nếu rồi thì hiện Play/Presentation */}
                              {!isEnrolled ? (
                                <Lock className="w-4 h-4 text-gray-400" />
                              ) : (
                                lesson.type === 'video' ? 
                                    <PlayCircle className="w-4 h-4 text-gray-400 group-hover:text-[#00b6b6]" /> : 
                                    <Presentation className="w-4 h-4 text-gray-400 group-hover:text-[#00b6b6]" />
                              )}
                              
                              <span className={`text-sm group-hover:text-gray-900 ${isEnrolled ? "text-gray-600" : "text-gray-400"}`}>
                                {lesson.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-400">{lesson.time}</span>
                            </div>
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
                    <h2 className="text-xl font-bold text-gray-800">{courseData.stats.rating} Đánh giá khóa học</h2>
                    <span className="text-gray-500 text-sm">({courseData.stats.reviewCount} xếp hạng)</span>
                </div>

                <div className="space-y-6 mb-8">
                    {courseData.reviews.map(review => (
                        <div key={review.id} className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                {review.avatar ? <img src={review.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold bg-teal-100 text-[#00b6b6]">{review.user[0]}</div>}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-sm text-gray-800">{review.user}</h4>
                                    <span className="text-xs text-gray-400">• {review.date}</span>
                                </div>
                                <div className="flex mb-2">
                                    {renderStars(review.rating)}
                                </div>
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{review.comment}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Form đánh giá - Chỉ hiện khi đã Enroll */}
                {isEnrolled ? (
                    <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4">Viết đánh giá của bạn</h3>
                        {/* ... (Giữ nguyên form) */}
                        <div className="flex gap-1 mb-4 cursor-pointer">
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star key={star} className="text-gray-300 hover:text-yellow-400 hover:fill-yellow-400 transition" />
                            ))}
                        </div>
                        <textarea className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#00b6b6] outline-none mb-3" rows="3" placeholder="Chia sẻ cảm nghĩ..."></textarea>
                        <button className="bg-[#00b6b6] text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-[#009e9e] transition">Gửi đánh giá</button>
                    </div>
                ) : (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-center text-yellow-800 text-sm">
                        Bạn cần tham gia khóa học để để lại đánh giá.
                    </div>
                )}
            </div>

          </div>

          {/* === CỘT PHẢI: SIDEBAR (Sticky) === */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden sticky top-28">
              
              <div className="relative group cursor-pointer">
                <div className="w-full h-48 bg-gray-200 overflow-hidden">
                    <img src="https://files.fullstack.edu.vn/f8-prod/courses/7.png" alt="Thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                </div>
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                    <PlayCircle className="w-16 h-16 text-white" />
                </div>
              </div>

              <div className="p-6 text-center">
                {/* LOGIC NÚT BẤM DỰA TRÊN TRẠNG THÁI ENROLL */}
                {isEnrolled ? (
                    <div className="mb-6">
                        <p className="text-sm text-gray-500 mb-2 text-left">Tiến độ học tập</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                            <div className="bg-[#00b6b6] h-2 rounded-full" style={{width: `${location.state?.progress || 0}%`}}></div>
                        </div>
                        <button onClick={() => handleLessonClick(101)} className="w-full bg-[#00b6b6] text-white font-bold text-lg py-3 rounded-full hover:bg-[#009e9e] transition shadow-lg transform active:scale-95">
                            TIẾP TỤC HỌC
                        </button>
                    </div>
                ) : (
                    <div className="mb-6">
                        <h2 className="text-3xl font-bold text-[#00b6b6] mb-4">Miễn phí</h2>
                        <button onClick={handleEnroll} className="w-full bg-[#00b6b6] text-white font-bold text-lg py-3 rounded-full hover:bg-[#009e9e] transition shadow-lg transform active:scale-95">
                            ĐĂNG KÝ HỌC
                        </button>
                    </div>
                )}

                <ul className="text-left space-y-4 text-sm text-gray-600 border-t border-gray-100 pt-4">
                  <li className="flex items-center gap-3"><Award className="w-5 h-5 text-gray-400" /><span>Trình độ cơ bản</span></li>
                  <li className="flex items-center gap-3"><Film className="w-5 h-5 text-gray-400" /><span>Tổng số <strong>{courseData.stats.lessons}</strong> bài học</span></li>
                  <li className="flex items-center gap-3"><Clock className="w-5 h-5 text-gray-400" /><span>Thời lượng <strong>{courseData.stats.duration}</strong></span></li>
                  <li className="flex items-center gap-3"><Battery className="w-5 h-5 text-gray-400" /><span>Học mọi lúc, mọi nơi</span></li>
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