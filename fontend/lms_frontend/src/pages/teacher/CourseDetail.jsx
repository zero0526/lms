import { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { 
  PlayCircle, 
  Check, 
  Plus, 
  Minus, 
  Clock, 
  BookOpen, 
  Battery, 
  Film,
  Award, 
  Presentation,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";


const courseData = {
  title: "Kiến Thức Nhập Môn IT",
  description: "Để có cái nhìn tổng quan về ngành IT - Lập trình web các bạn nên xem các videos tại khóa này trước nhé.",
  whatYouWillLearn: [
    "Các kiến thức cơ bản, nền móng của ngành IT",
    "Các mô hình, kiến trúc cơ bản khi triển khai ứng dụng",
    "Các khái niệm, thuật ngữ cốt lõi khi triển khai ứng dụng",
    "Hiểu hơn về cách internet và máy vi tính hoạt động",
  ],
  requirements: [
    "Máy tính kết nối internet",
    "Ý thức tự học cao, trách nhiệm với bản thân",
  ],
  stats: {
    chapters: 4,
    lessons: 12,
    duration: "03 giờ 26 phút",
  },
  chapters: [
    {
      title: "1. Khái niệm kỹ thuật cần biết",
      lessons: [
        { title: "1. Mô hình Client - Server là gì?", time: "11:35" },
        { title: "2. Domain là gì? Tên miền là gì?", time: "10:34" },
        { title: "3. Server là gì? Web Server là gì?", time: "08:12" },
      ]
    },
    {
      title: "2. Môi trường, con người IT",
      lessons: [
        { title: "4. Front-end, Back-end là gì?", time: "15:20" },
        { title: "5. Dev là gì? Tester là gì?", time: "09:45" },
        { title: "6. Quy trình làm phần mềm", time: "12:10" },
      ]
    },
    {
      title: "3. Phương pháp, định hướng",
      lessons: [
        { title: "7. Tư duy lập trình", time: "20:05" },
        { title: "8. Lộ trình học Web Developer", time: "18:30" },
      ]
    },
  ]
};

export default function TeacherCourseDetail() {
  const [openChapters, setOpenChapters] = useState(false);
  const navigate = useNavigate();

  const toggleChapter = (index) => {
    setOpenChapters((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleLessonClick = () => {
    // Cách 1: Nếu bạn muốn chuyển đến trang chi tiết chung (demo)
    navigate("/course/course-detail/lesson-detail");
    
    // Cách 2: Nếu bạn muốn chuyển đến ID cụ thể (thực tế)
    // navigate(`/courses/${course.id}/lessons/${lesson.id}`); 
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* 1. NAVBAR */}
      <Navbar />

      {/* 2. MAIN CONTENT */}
      <main className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Thông tin khóa học */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{courseData.title}</h1>
              <p className="text-gray-600 leading-relaxed">{courseData.description}</p>
            </div>

            {/* Section: Yêu cầu */}
            <div>
               <h2 className="text-xl font-semibold mb-4 text-gray-800">Yêu cầu</h2>
               <ul className="list-disc list-inside space-y-2 text-gray-600">
                  {courseData.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
               </ul>
            </div>

            {/* Section: Bạn sẽ học được gì? */}
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

            {/* Section: Nội dung khóa học */}
            <div>
              <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Nội dung khóa học</h2>
                <div className="text-sm text-gray-500 font-medium">
                  <span className="font-bold">{courseData.stats.chapters}</span> chương •{" "}
                  <span className="font-bold">{courseData.stats.lessons}</span> bài học •{" "}
                  Thời lượng <span className="font-bold">{courseData.stats.duration}</span>
                </div>
              </div>

              {/* Danh sách chương */}
              <div className="space-y-3">
                {courseData.chapters.map((chapter, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                    {/* Chapter Header */}
                    <div 
                      onClick={() => toggleChapter(index)}
                      className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition select-none"
                    >
                      <div className="flex items-center gap-3">
                        {openChapters[index] ? (
                          <Minus className="w-4 h-4 text-[#00b6b6]" />
                        ) : (
                          <Plus className="w-4 h-4 text-[#00b6b6]" />
                        )}
                        <h3 className="font-semibold text-gray-700">{chapter.title}</h3>
                      </div>
                      <span className="text-xs text-gray-500">{chapter.lessons.length} bài học</span>
                    </div>

                    {/* Chapter Lessons */}
                    {openChapters[index] && (
                      <div className="divide-y divide-gray-100">
                        {chapter.lessons.map((lesson, idx) => (
                          <div key={idx} className="flex justify-between items-center p-4 pl-10 hover:bg-teal-50 transition cursor-pointer group" onClick={handleLessonClick}>
                            <div className="flex items-center gap-3">
                              <Presentation className="w-4 h-4 text-gray-400 group-hover:text-[#00b6b6] transition" />
                              <span className="text-gray-600 text-sm group-hover:text-gray-900">{lesson.title}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#00b6b6] transition" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden sticky top-28">
              
              <div className="relative group cursor-pointer">
                <div className="w-full h-48 bg-gray-200 overflow-hidden">
                    <img 
                      src="https://files.fullstack.edu.vn/f8-prod/courses/7.png" 
                      alt="Course Thumbnail" 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                </div>
              </div>

              <div className="p-6 text-center">
                <h2 className="text-3xl font-bold text-[#00b6b6] mb-4">Miễn phí</h2>
                
                <button className="w-full bg-[#00b6b6] text-white font-bold text-lg py-3 rounded-full hover:bg-[#009e9e] transition shadow-lg mb-6 transform active:scale-95">
                  ĐĂNG KÝ HỌC
                </button>

                <ul className="text-left space-y-4 text-sm text-gray-600">
                  <li className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-gray-400" />
                    <span>Trình độ cơ bản</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Film className="w-5 h-5 text-gray-400" />
                    <span>Tổng số <strong>{courseData.stats.lessons}</strong> bài học</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span>Thời lượng <strong>{courseData.stats.duration}</strong></span>
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