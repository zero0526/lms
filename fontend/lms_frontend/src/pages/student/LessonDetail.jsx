import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  CheckCircle, 
  Circle, 
  Lock, 
  Clock, 
  FileText, 
  HelpCircle, 
  Download,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

// --- MOCK DATA ---
const lessonData = {
  id: 1,
  title: "Bài 1: Tổng quan về ReactJS và mô hình Component",
  videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
  duration: "12:30",
  views: 1250,
  description: "Trong bài này chúng ta sẽ tìm hiểu về khái niệm Component, JSX và Virtual DOM."
};

const courseContent = [
  {
    id: 1,
    title: "Chương 1: Giới thiệu",
    lessons: [
      { id: 101, title: "1. Tổng quan ReactJS", duration: "12:30", isCompleted: true },
      { id: 102, title: "2. Cài đặt môi trường", duration: "08:15", isCompleted: true },
      { id: 103, title: "3. JSX là gì?", duration: "15:00", isCompleted: false, isActive: true }, // Bài đang học
    ]
  },
  {
    id: 2,
    title: "Chương 2: Components & Props",
    lessons: [
      { id: 201, title: "4. Function Component", duration: "10:20", isCompleted: false },
      { id: 202, title: "5. Props là gì?", duration: "14:10", isCompleted: false, isLocked: true },
      { id: 203, title: "6. Thực hành Props", duration: "20:00", isCompleted: false, isLocked: true },
    ]
  }
];

const quizData = [
  {
    id: 1,
    question: "ReactJS là gì?",
    options: ["Một Framework", "Một Library", "Một Ngôn ngữ", "Một Database"],
  },
  {
    id: 2,
    question: "Hàm nào được sử dụng để tạo state trong Functional Component?",
    options: ["useState", "useEffect", "useReducer", "useRef"],
  },
  {
    id: 3,
    question: "JSX là viết tắt của từ gì?",
    options: ["Java XML", "JavaScript XML", "JSON XML", "Java Syntax Extension"],
  }
];

const documentsData = [
  { id: 1, title: "Slide bài giảng (PDF)", link: "#", type: "PDF" },
  { id: 2, title: "Source code mẫu (Zip)", link: "#", type: "ZIP" },
  { id: 3, title: "Tài liệu tham khảo React Docs", link: "#", type: "LINK" },
];

// --- MAIN COMPONENT: LESSON PAGE ---
export default function LessonPage() {
  const [activeTab, setActiveTab] = useState("quiz"); // 'quiz' | 'document'
  const [completedLessons, setCompletedLessons] = useState([101, 102]); // ID các bài đã học
  const [sidebarOpen, setSidebarOpen] = useState({ 1: true, 2: true }); // Trạng thái đóng mở chương
  
  // Xử lý video kết thúc -> Đánh dấu hoàn thành
  const handleVideoEnded = () => {
    // Giả sử bài hiện tại có ID là 103
    if (!completedLessons.includes(103)) {
      setCompletedLessons([...completedLessons, 103]);

    }
  };

  const toggleChapter = (id) => {
    setSidebarOpen(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto w-full pt-24 pb-10 px-4 gap-6 grid grid-cols-1 lg:grid-cols-3">
        
        {/* === CỘT TRÁI (Video + Tabs) === */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. VIDEO PLAYER AREA */}
          <div className="bg-black rounded-xl overflow-hidden shadow-lg aspect-video relative group border-4 border-white">
            <video 
              controls 
              className="w-full h-full object-cover"
              onEnded={handleVideoEnded}
            >
              <source src={lessonData.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* INFO BAR */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{lessonData.title}</h1>
            <div className="flex items-center text-sm text-gray-500 gap-4 mb-4 flex-wrap">
               <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded"><Clock size={16}/> {lessonData.duration}</span>
               <span className={`flex items-center gap-1 px-2 py-1 rounded ${completedLessons.includes(103) ? "bg-teal-50 text-[#00b6b6]" : "bg-gray-100 text-gray-500"}`}>
                 <CheckCircle size={16}/> {completedLessons.includes(103) ? "Đã hoàn thành" : "Chưa hoàn thành"}
               </span>
               <span className="px-2 py-1">{lessonData.views} lượt xem</span>
            </div>
            <p className="text-gray-600 leading-relaxed">{lessonData.description}</p>
          </div>

          {/* 2. TABS SECTION (Quiz & Document) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[450px]">
            {/* Tab Header */}
            <div className="flex border-b border-gray-200">
              <button 
                onClick={() => setActiveTab("quiz")}
                className={`cursor-pointer flex-1 py-4 font-semibold flex items-center justify-center gap-2 transition relative
                  ${activeTab === "quiz" ? "text-[#00b6b6] bg-teal-50/50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}
                `}
              >
                <HelpCircle size={20}/> 
                Hỏi đáp với AI (Quiz)
                {activeTab === "quiz" && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#00b6b6]"></div>}
              </button>
              <button 
                onClick={() => setActiveTab("document")}
                className={`cursor-pointer flex-1 py-4 font-semibold flex items-center justify-center gap-2 transition relative
                  ${activeTab === "document" ? "text-[#00b6b6] bg-teal-50/50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}
                `}
              >
                <FileText size={20}/> 
                Tài liệu khóa học
                {activeTab === "document" && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#00b6b6]"></div>}
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "quiz" ? <QuizComponent /> : <DocumentComponent />}
            </div>
          </div>

        </div>

        {/* === CỘT PHẢI (Nội dung khóa học) === */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 sticky top-28 overflow-hidden flex flex-col max-h-[calc(100vh-140px)]">
            <div className="p-4 bg-[#00b6b6] text-white font-bold text-lg flex justify-between items-center flex-shrink-0">
              <span>Nội dung khóa học</span>
              <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded">3/12 bài</span>
            </div>
            
            <div className="overflow-y-auto custom-scrollbar flex-1">
              {courseContent.map((chapter) => (
                <div key={chapter.id} className="border-b border-gray-100 last:border-0">
                  {/* Chapter Title */}
                  <div 
                    onClick={() => toggleChapter(chapter.id)}
                    className="bg-gray-50 p-3 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition select-none"
                  >
                    <h3 className="font-semibold text-gray-700 text-sm">{chapter.title}</h3>
                    {sidebarOpen[chapter.id] ? <ChevronUp size={16} className="text-[#00b6b6]"/> : <ChevronDown size={16}/>}
                  </div>

                  {/* Lessons List */}
                  {sidebarOpen[chapter.id] && (
                    <div className="divide-y divide-gray-50">
                      {chapter.lessons.map((lesson) => {
                         const isDone = completedLessons.includes(lesson.id) || lesson.isCompleted;
                         const isCurrent = lesson.isActive;
                         const isLocked = lesson.isLocked;

                         return (
                          <div 
                            key={lesson.id} 
                            className={`p-3 pl-4 flex items-center gap-3 transition cursor-pointer relative group
                              ${isCurrent ? "bg-teal-50" : "hover:bg-gray-50"}
                              ${isLocked ? "opacity-60 cursor-not-allowed" : ""}
                            `}
                          >
                            {/* Active Indicator Bar */}
                            {isCurrent && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00b6b6]"></div>}

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
                              <p className={`text-sm font-medium truncate ${isCurrent ? "text-[#00b6b6]" : "text-gray-700"}`}>
                                {lesson.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <Play size={10} /> {lesson.duration}
                                </span>
                              </div>
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
        </div>
      </div>

      <Footer />
    </div>
  );
}

// --- SUB-COMPONENT: QUIZ ---
function QuizComponent() {
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 phút = 600 giây
  const [answers, setAnswers] = useState({}); // Lưu câu trả lời { questionId: optionIndex }
  const [submitted, setSubmitted] = useState(false);

  // Timer logic
  useEffect(() => {
    let timer;
    if (started && timeLeft > 0 && !submitted) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [started, timeLeft, submitted]);

  // Format thời gian MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSelect = (qId, optionIdx) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const clearChoice = (qId) => {
    if (submitted) return;
    const newAnswers = { ...answers };
    delete newAnswers[qId];
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    // Check if all questions answered (optional)
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < quizData.length) {
      if(!window.confirm(`Bạn mới trả lời ${answeredCount}/${quizData.length} câu hỏi. Bạn có chắc muốn nộp bài?`)) {
        return;
      }
    }
    setSubmitted(true);
    alert("Nộp bài thành công! Xem kết quả...");
  };

  // Màn hình bắt đầu
  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center space-y-5 animate-in fade-in zoom-in duration-300">
        <div className="bg-teal-100 p-4 rounded-full">
           <HelpCircle size={48} className="text-[#00b6b6]"/>
        </div>
        <h3 className="text-2xl font-bold text-gray-800">Bài kiểm tra trắc nghiệm</h3>
        <p className="text-gray-500 max-w-md">
          Bài kiểm tra gồm <strong className="text-gray-700">{quizData.length} câu hỏi</strong>. 
          Bạn có <strong className="text-gray-700">10 phút</strong> để hoàn thành. 
          Hãy chắc chắn rằng bạn đã hiểu rõ nội dung bài học trước khi bắt đầu.
        </p>
        <button 
          onClick={() => setStarted(true)}
          className="bg-[#00b6b6] hover:bg-[#009e9e] text-white px-8 py-3 rounded-full font-bold shadow-lg transition transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          Bắt đầu làm bài
        </button>
      </div>
    );
  }

  // Màn hình làm bài
  return (
    <div className="relative animate-in slide-in-from-right-4 duration-300">
      {/* Timer Header */}
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl mb-6 sticky top-0 z-10 shadow-sm border border-gray-100">
        <span className="font-bold text-gray-700">Tiến độ: <span className="text-[#00b6b6]">{Object.keys(answers).length}/{quizData.length}</span></span>
        <div className={`flex items-center gap-2 font-mono font-bold text-lg bg-white px-3 py-1 rounded shadow-sm ${timeLeft < 60 ? "text-red-500 animate-pulse" : "text-[#00b6b6]"}`}>
          <Clock size={20}/> {formatTime(timeLeft)}
        </div>
      </div>

      <div className="space-y-8 pb-20">
        {quizData.map((q, index) => (
          <div key={q.id} className="border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition bg-white">
            <h4 className="font-semibold text-lg text-gray-800 mb-4 flex gap-3">
              <span className="bg-[#00b6b6] text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm">
                {index + 1}
              </span> 
              {q.question}
            </h4>
            
            <div className="space-y-3 pl-11">
              {q.options.map((opt, i) => (
                <label 
                  key={i} 
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition select-none
                    ${answers[q.id] === i 
                      ? "border-[#00b6b6] bg-teal-50/50 ring-1 ring-[#00b6b6]" 
                      : "border-gray-200 hover:bg-gray-50"
                    }
                  `}
                >
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 transition-colors
                    ${answers[q.id] === i ? "border-[#00b6b6]" : "border-gray-400"}
                  `}>
                    {answers[q.id] === i && <div className="w-2.5 h-2.5 rounded-full bg-[#00b6b6]"></div>}
                  </div>
                  <input 
                    type="radio" 
                    name={`q-${q.id}`} 
                    className="hidden" 
                    checked={answers[q.id] === i}
                    onChange={() => handleSelect(q.id, i)}
                  />
                  <span className="text-gray-700">{opt}</span>
                </label>
              ))}
            </div>

            {/* Clear Choice Button */}
            {answers[q.id] !== undefined && !submitted && (
              <div className="pl-11 mt-3">
                <button 
                  onClick={() => clearChoice(q.id)}
                  className="text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-full flex items-center gap-1 font-medium transition"
                >
                  <RotateCcw size={14} /> Xóa lựa chọn
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-200 sticky bottom-0 bg-white pb-2">
        <button 
          onClick={handleSubmit}
          disabled={submitted}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition transform active:scale-[0.99]
            ${submitted 
              ? "bg-gray-400 text-white cursor-not-allowed" 
              : "bg-[#00b6b6] hover:bg-[#009e9e] text-white cursor-pointer"
            }
          `}
        >
          {submitted ? "Đã nộp bài" : "Nộp bài thi"}
        </button>
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: DOCUMENT ---
function DocumentComponent() {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <h3 className="font-bold text-gray-800 mb-4 text-lg border-l-4 border-[#00b6b6] pl-3">Tài liệu học tập</h3>
      {documentsData.map((doc) => (
        <a 
          key={doc.id} 
          href={doc.link}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-[#00b6b6] transition group"
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg text-white transition-colors
               ${doc.type === "PDF" ? "bg-red-500" : doc.type === "ZIP" ? "bg-blue-500" : "bg-green-500"}
            `}>
              {doc.type === "PDF" ? <FileText size={24}/> : doc.type === "ZIP" ? <Download size={24}/> : <ExternalLink size={24}/>}
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 group-hover:text-[#00b6b6] transition">{doc.title}</h4>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                {doc.type} • Nhấn để xem chi tiết
              </p>
            </div>
          </div>
          <ExternalLink size={18} className="text-gray-300 group-hover:text-[#00b6b6] transition"/>
        </a>
      ))}
      
      <div className="mt-8 bg-amber-50 p-4 rounded-xl border border-amber-200 text-sm text-amber-800 flex gap-3 items-start">
         <div className="bg-amber-100 p-1 rounded-full mt-0.5"><Lock size={14}/></div>
         <p><strong>Lưu ý:</strong> Các tài liệu được lưu trữ trên hệ thống bảo mật. Vui lòng đăng nhập tài khoản học viên để có quyền truy cập và tải xuống tài liệu.</p>
      </div>
    </div>
  );
}