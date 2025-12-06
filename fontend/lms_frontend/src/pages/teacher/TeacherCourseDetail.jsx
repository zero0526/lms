import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { 
  PlayCircle, 
  Check, 
  Plus, 
  Minus, 
  Clock, 
  Film,
  Award, 
  Presentation,
  ChevronRight,
  Edit3,
  Trash2,
  Users,
  BarChart
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const mockCourseDetail = {
  id: 1,
  title: "Introductory IT Knowledge",
  description: "To get an overview of the IT field and web development, watch the videos in this course first. The course is designed for beginners.",
  price: 0,
  oldPrice: 100,
  thumbnail: "https://files.fullstack.edu.vn/f8-prod/courses/7.png",
  instructor: {
    name: "Nguyễn Văn Khoẻ",
    avatar: "https://i.pravatar.cc/150?img=3"
  },
  whatYouWillLearn: [
    "Basic foundational IT concepts",
    "Common application architectures and deployment patterns",
    "Core concepts and terminology used in application development",
    "A better understanding of how the internet and computers work",
  ],
  requirements: [
    "Computer with internet access",
    "Strong self-learning mindset and personal responsibility",
  ],
  stats: {
    chapters: 3,
    lessons: 8,
    duration: "03 hours 26 minutes",
    students: 1234,
    rating: 4.8
  },
  chapters: [
    {
      id: 1,
      title: "1. Technical concepts to know",
      lessons: [
        { id: 101, title: "1. What is the Client-Server model?", time: "11:35", type: "video" },
        { id: 102, title: "2. What is a Domain? What is a Hostname?", time: "10:34", type: "video" },
        { id: 103, title: "3. What is a Server? What is a Web Server?", time: "08:12", type: "article" },
      ]
    },
    {
      id: 2,
      title: "2. IT environment and roles",
      lessons: [
        { id: 104, title: "4. What are Front-end and Back-end?", time: "15:20", type: "video" },
        { id: 105, title: "5. What is a Developer? What is a Tester?", time: "09:45", type: "video" },
        { id: 106, title: "6. Software development process", time: "12:10", type: "quiz" },
      ]
    },
    {
      id: 3,
      title: "3. Methods and learning paths",
      lessons: [
        { id: 107, title: "7. Programming mindset", time: "20:05", type: "video" },
        { id: 108, title: "8. Web Developer learning roadmap", time: "18:30", type: "video" },
      ]
    },
  ]
};

export default function TeacherCourseDetail() {
  const { courseId } = useParams(); // Get ID from URL if you need to call API
  const [courseData, setCourseData] = useState(mockCourseDetail);
  const [openChapters, setOpenChapters] = useState({}); // Object to manage open state for multiple chapters
  const navigate = useNavigate();

  // Default: open the first chapter on load
  useEffect(() => {
    setOpenChapters({ 0: true });
  }, []);

  const toggleChapter = (index) => {
    setOpenChapters((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleEditCourse = () => {
    // Navigate to course edit page
    navigate(`/teacher/courses/${courseData.id}/edit`);
  };

  const handleLessonPreview = (lessonId) => {
    console.log("Preview lesson:", lessonId);
    // Preview logic for lessons
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        {/* Breadcrumb (optional) */}
        <div className="text-sm text-gray-500 mb-4 cursor-pointer hover:text-[#00b6b6]" onClick={() => navigate('/teacher/courses')}>
           &larr; Back to course list
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* === LEFT COLUMN: MAIN CONTENT === */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Header Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{courseData.title}</h1>
              <p className="text-gray-600 leading-relaxed">{courseData.description}</p>
              
              <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
                 <span className="flex items-center gap-1"><Users size={16}/> {courseData.stats.students} students</span>
                 <span className="flex items-center gap-1"><Award size={16}/> {courseData.stats.rating} stars</span>
                 <span className="flex items-center gap-1"><Clock size={16}/> {courseData.stats.duration}</span>
              </div>
            </div>

            {/* Section: What you'll learn */}
            <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Course Objectives</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {courseData.whatYouWillLearn.map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#00b6b6] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section: Course content (Curriculum) */}
            <div>
              <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Course Outline</h2>
                  <div className="text-sm text-gray-500 font-medium">
                    <span className="font-bold">{courseData.stats.chapters}</span> chapters •{" "}
                    <span className="font-bold">{courseData.stats.lessons}</span> lessons
                  </div>
              </div>

              {/* Chapters list */}
              <div className="space-y-3">
                {courseData.chapters.map((chapter, index) => (
                  <div key={chapter.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                    {/* Chapter Header */}
                    <div 
                      onClick={() => toggleChapter(index)}
                      className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition select-none"
                    >
                      <div className="flex items-center gap-3">
                        {openChapters[index] ? <Minus className="w-4 h-4 text-[#00b6b6]" /> : <Plus className="w-4 h-4 text-[#00b6b6]" />}
                        <h3 className="font-semibold text-gray-700">{chapter.title}</h3>
                      </div>
                        <span className="text-xs text-gray-500">{chapter.lessons.length} lessons</span>
                    </div>

                    {/* Chapter Lessons */}
                    {openChapters[index] && (
                      <div className="divide-y divide-gray-100">
                        {chapter.lessons.map((lesson) => (
                          <div key={lesson.id} className="flex justify-between items-center p-3 pl-10 hover:bg-teal-50 transition cursor-pointer group">
                            <div className="flex items-center gap-3">
                              {lesson.type === 'video' ? <PlayCircle className="w-4 h-4 text-gray-400" /> : <Presentation className="w-4 h-4 text-gray-400" />}
                              <span className="text-gray-600 text-sm group-hover:text-gray-900">{lesson.title}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-xs text-gray-400">{lesson.time}</span>
                                {/* Small action button for lesson */}
                                <Edit3 size={14} className="text-gray-300 hover:text-[#00b6b6]" />
                            </div>
                          </div>
                        ))}
                        {/* Quick add lesson button */}
                          <div className="p-3 pl-10 text-sm text-[#00b6b6] font-medium cursor-pointer hover:underline flex items-center gap-2">
                            <Plus size={16}/> Add new lesson
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Add new chapter button */}
              <button className="mt-4 w-full border-2 border-dashed border-gray-300 text-gray-500 py-3 rounded-lg hover:border-[#00b6b6] hover:text-[#00b6b6] transition font-medium flex items-center justify-center gap-2">
                   <Plus size={20}/> Add new chapter
              </button>
            </div>

            {/* Section: Prerequisites */}
            <div>
               <h2 className="text-xl font-semibold mb-4 text-gray-800">Prerequisites</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  {courseData.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
               </ul>
            </div>
          </div>

          {/* === CỘT PHẢI: SIDEBAR QUẢN LÝ (Sticky) === */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden sticky top-28">
              
              {/* Thumbnail Image */}
              <div className="relative group cursor-pointer">
                <div className="w-full h-48 bg-gray-200 overflow-hidden">
                    <img 
                      src={courseData.thumbnail} 
                      alt="Thumbnail" 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                </div>
                {/* Overlay Button Change Image */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                  <span className="text-white font-medium border border-white px-4 py-2 rounded-full">Change image</span>
                </div>
              </div>

              {/* Action Buttons cho Teacher */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-[#00b6b6]">
                    {courseData.price === 0 ? "Free" : `$${courseData.price}`}
                  </span>
                  <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                    Active
                  </span>
                </div>
                
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={handleEditCourse}
                        className="w-full bg-[#00b6b6] text-white font-bold text-lg py-3 rounded-full hover:bg-[#009e9e] transition shadow-md flex items-center justify-center gap-2"
                    >
                        <Edit3 size={20}/> Edit Course
                    </button>
                    
                    <button className="w-full bg-white border border-gray-300 text-gray-700 font-bold text-lg py-3 rounded-full hover:bg-gray-50 transition shadow-sm flex items-center justify-center gap-2">
                      <BarChart size={20}/> Analytics & Reports
                    </button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                    <button className="w-full text-red-500 font-medium text-sm hover:underline flex items-center justify-center gap-2">
                        <Trash2 size={16}/> Delete this course
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