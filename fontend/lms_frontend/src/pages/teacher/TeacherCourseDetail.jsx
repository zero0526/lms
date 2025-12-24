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
  Presentation,
  Edit3,
  Trash2,
  Users,
  BarChart,
  Loader2
} from "lucide-react";
import { fetchCourseInfo, fetchCourseOutline } from "../../api/teacher/courseApi";
import { useNavigate, useParams } from "react-router-dom";

export default function TeacherCourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [courseData, setCourseData] = useState(null);
  const [courseOutline, setCourseOutline] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [openChapters, setOpenChapters] = useState({});

  // Get user ID from storage
  const getUserId = () => {
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    return userStr ? JSON.parse(userStr).userId : null;
  };

  // Convert Google Drive link
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

  // Format duration
  const formatDuration = (minutes) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // ✅ Fetch course data from API
  useEffect(() => {
    const loadCourseData = async () => {
      const userId = getUserId();
      
      if (!userId || !courseId) {
        setError("Invalid user or course ID");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch both course info and outline
        const [info, outline] = await Promise.all([
          fetchCourseInfo(courseId),
          fetchCourseOutline(userId, courseId)
        ]);

        // Map data to match current structure
        const mappedCourseData = {
          id: info.courseId,
          title: info.title,
          description: info.desc,
          price: 0, // Always free for now
          thumbnail: info.thumbnailUrl,
          instructor: {
            name: info.teacherName,
            avatar: info.teachAvatarUrl
          },
          whatYouWillLearn: info.courseTargets?.split('\n').filter(t => t.trim()) || [],
          requirements: info.preconditions?.split('\n').filter(r => r.trim()) || [],
          stats: {
            chapters: info.numOfChapter,
            lessons: info.numOfLesson,
            duration: formatDuration(info.courseDuration),
            students: 0, // Not available in API
            rating: info.rating || 0
          },
          isCompleted: info.isCompleted
        };

        setCourseData(mappedCourseData);
        setCourseOutline(outline);
        
        // Auto-open first chapter
        if (outline.length > 0) {
          setOpenChapters({ 0: true });
        }
        
        setError(null);
      } catch (err) {
        console.error("Error loading course:", err);
        setError("Failed to load course data");
      } finally {
        setIsLoading(false);
      }
    };

    loadCourseData();
  }, [courseId]);

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

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen font-sans">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 pt-24 pb-12 flex items-center justify-center min-h-[60vh]">
          <Loader2 size={48} className="animate-spin text-[#00b6b6]" />
        </main>
        <Footer />
      </div>
    );
  }

  //Error state
  if (error || !courseData) {
    return (
      <div className="bg-gray-50 min-h-screen font-sans">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Course Not Found</h2>
            <p className="text-gray-500 mb-6">{error || "Unable to load course"}</p>
            <button 
              onClick={() => navigate("/teacher/courses")}
              className="px-6 py-3 bg-[#00b6b6] text-white rounded-full hover:bg-[#009e9e] font-bold"
            >
              Back to Courses
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
                {courseOutline.map((chapter, index) => (
                  <div key={chapter.chapterId} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                    {/* Chapter Header */}
                    <div 
                      onClick={() => toggleChapter(index)}
                      className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition select-none"
                    >
                      <div className="flex items-center gap-3">
                        {openChapters[index] ? <Minus className="w-4 h-4 text-[#00b6b6]" /> : <Plus className="w-4 h-4 text-[#00b6b6]" />}
                        <h3 className="font-semibold text-gray-700">
                          {chapter.order}. {chapter.title}
                        </h3>
                      </div>
                      <span className="text-xs text-gray-500">{chapter.lessons?.length || 0} lessons</span>
                    </div>

                    {/* Chapter Lessons */}
                    {openChapters[index] && (
                      <div className="divide-y divide-gray-100">
                        {chapter.lessons?.map((lesson) => (
                          <div key={lesson.lessonId} className="flex justify-between items-center p-3 pl-10 hover:bg-teal-50 transition cursor-pointer group">
                            <div className="flex items-center gap-3">
                              <PlayCircle className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600 text-sm group-hover:text-gray-900">
                                {lesson.order}. {lesson.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-xs text-gray-400">
                                {lesson.duration ? formatDuration(lesson.duration) : 'N/A'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Removed "Add new chapter" button */}
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
                      src={getDirectGoogleDriveLink(courseData.thumbnail)} 
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