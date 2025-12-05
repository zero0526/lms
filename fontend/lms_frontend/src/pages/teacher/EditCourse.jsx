import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { 
  Save, Plus, Trash2, GripVertical, Edit3, Video, FileText, 
  HelpCircle, ChevronDown, ChevronUp, UploadCloud, X, ArrowLeft,
  Link as LinkIcon, CheckCircle2, Circle, File
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// --- 1. SIMPLE MODAL (Used for Creating Chapters & Lessons) ---
const SimpleModal = ({ isOpen, onClose, onSave, title, placeholder }) => {
  const [value, setValue] = useState("");

  if (!isOpen) return null;

  const handleSave = () => {
    if (!value.trim()) {
      alert("Please enter content!");
      return;
    }
    onSave(value);
    setValue("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">{title}</h3>
          <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-red-500"/></button>
        </div>
        <div className="p-6">
          <input 
            type="text" 
            autoFocus
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#00b6b6] outline-none"
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
        </div>
          <div className="p-4 border-t flex justify-end gap-2 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-[#00b6b6] text-white rounded-lg hover:bg-[#009e9e] text-sm font-bold">Confirm</button>
        </div>
      </div>
    </div>
  );
};

// --- 2. CONTENT MODAL (Add Video/Doc/Quiz to a Lesson) ---
const ContentModal = ({ isOpen, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState("video"); 
  
  // Data state
  const [videoData, setVideoData] = useState({ url: "", duration: "" });
  const [docData, setDocData] = useState({ url: "" });
  const [quizData, setQuizData] = useState([]);

  if (!isOpen) return null;

  // --- LOGIC QUIZ ---
  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      question: "",
      options: [
        { id: 1, text: "", isCorrect: false },
        { id: 2, text: "", isCorrect: false },
        { id: 3, text: "", isCorrect: false },
        { id: 4, text: "", isCorrect: false },
      ]
    };
    setQuizData([...quizData, newQuestion]);
  };

  const updateQuestionText = (qIndex, text) => {
    const newQuiz = [...quizData];
    newQuiz[qIndex].question = text;
    setQuizData(newQuiz);
  };

  const updateOptionText = (qIndex, oIndex, text) => {
    const newQuiz = [...quizData];
    newQuiz[qIndex].options[oIndex].text = text;
    setQuizData(newQuiz);
  };

  const setCorrectOption = (qIndex, oIndex) => {
    const newQuiz = [...quizData];
    newQuiz[qIndex].options.forEach((opt, idx) => {
      opt.isCorrect = idx === oIndex;
    });
    setQuizData(newQuiz);
  };

  const removeQuestion = (qIndex) => {
    const newQuiz = quizData.filter((_, idx) => idx !== qIndex);
    setQuizData(newQuiz);
  };
  // ------------------

  const handleSave = () => {
    let contentPayload = null;

    if (activeTab === "video") {
      if (!videoData.url.trim()) return alert("Please enter the video URL");
      contentPayload = { type: "video", title: "Lecture Video", data: videoData };
    } else if (activeTab === "doc") {
      if (!docData.url.trim()) return alert("Please enter the document URL");
      contentPayload = { type: "doc", title: "Reference Document", data: docData };
    } else if (activeTab === "quiz") {
      if (quizData.length === 0) return alert("Please add at least one question");
      contentPayload = { type: "quiz", title: `Quiz (${quizData.length} questions)`, data: quizData };
    }

    onSave(contentPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800">Add Lesson Content</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500"><X size={20}/></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* Tabs */}
          <div className="flex border-b mb-6">
            <button onClick={() => setActiveTab("video")} className={`px-6 py-2 flex items-center gap-2 text-sm font-bold border-b-2 transition ${activeTab === "video" ? "border-[#00b6b6] text-[#00b6b6]" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              <Video size={18}/> Video
            </button>
            <button onClick={() => setActiveTab("doc")} className={`px-6 py-2 flex items-center gap-2 text-sm font-bold border-b-2 transition ${activeTab === "doc" ? "border-[#00b6b6] text-[#00b6b6]" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              <FileText size={18}/> Document
            </button>
            <button onClick={() => setActiveTab("quiz")} className={`px-6 py-2 flex items-center gap-2 text-sm font-bold border-b-2 transition ${activeTab === "quiz" ? "border-[#00b6b6] text-[#00b6b6]" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              <HelpCircle size={18}/> Quiz
            </button>
          </div>

          <div className="min-h-[250px]">
            {activeTab === "video" && (
              <div className="space-y-4 animate-in fade-in">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-700 mb-4">
                  Supports links from YouTube, Vimeo or Google Drive.
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00b6b6] outline-none" placeholder="https://..." value={videoData.url} onChange={(e) => setVideoData({...videoData, url: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00b6b6] outline-none" placeholder="10:00" value={videoData.duration} onChange={(e) => setVideoData({...videoData, duration: e.target.value})} />
                </div>
              </div>
            )}

            {activeTab === "doc" && (
              <div className="space-y-4 animate-in fade-in">
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm text-yellow-700 mb-4">
                  Enter the document URL (PDF, Slide, Docs).
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document URL</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00b6b6] outline-none" placeholder="https://drive.google.com/..." value={docData.url} onChange={(e) => setDocData({...docData, url: e.target.value})} />
                </div>
              </div>
            )}

            {activeTab === "quiz" && (
              <div className="animate-in fade-in space-y-6">
                {quizData.map((q, qIndex) => (
                  <div key={q.id} className="border border-gray-200 rounded-xl p-5 bg-gray-50 relative group">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-sm font-bold text-[#00b6b6]">Question {qIndex + 1}</span>
                      <button onClick={() => removeQuestion(qIndex)} className="text-gray-400 hover:text-red-500 transition"><Trash2 size={18}/></button>
                    </div>
                    <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-[#00b6b6] outline-none font-medium" placeholder="Enter the question..." value={q.question} onChange={(e) => updateQuestionText(qIndex, e.target.value)} />
                    <div className="space-y-2 pl-2">
                      {q.options.map((opt, oIndex) => (
                        <div key={opt.id} className="flex items-center gap-3">
                          <button onClick={() => setCorrectOption(qIndex, oIndex)} className={`flex-shrink-0 transition-colors ${opt.isCorrect ? "text-green-500" : "text-gray-300 hover:text-gray-400"}`} title="Mark as correct answer">
                            {opt.isCorrect ? <CheckCircle2 size={22} fill="#ecfdf5"/> : <Circle size={22}/>}
                          </button>
                          <input type="text" className={`flex-1 border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-[#00b6b6] ${opt.isCorrect ? "bg-green-50 border-green-200" : "bg-white border-gray-300"}`} placeholder={`Answer ${oIndex + 1}`} value={opt.text} onChange={(e) => updateOptionText(qIndex, oIndex, e.target.value)} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <button onClick={addQuestion} className="w-full border-2 border-dashed border-[#00b6b6] text-[#00b6b6] py-3 rounded-xl hover:bg-teal-50 flex items-center justify-center gap-2 font-bold transition">
                  <Plus size={20}/> Add question
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium">Cancel</button>
          <button onClick={handleSave} className="px-8 py-2 bg-[#00b6b6] text-white rounded-lg hover:bg-[#009e9e] shadow-md font-bold">Save content</button>
        </div>
      </div>
    </div>
  );
};

// --- 3. MAIN COMPONENT: EDIT COURSE ---
export default function EditCourse() {
  const navigate = useNavigate();
  
  const [courseInfo, setCourseInfo] = useState({
    title: "Introduction to IT",
    description: "A foundational course for beginners.",
    category: "Development",
    price: 0
  });

  const [chapters, setChapters] = useState([
    {
      id: 1,
      title: "Chapter 1: Technical Concepts",
      lessons: [] // Lessons will contain an array of contents
    }
  ]);

  // Modal management states
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  
  // State to track where content is being added
  const [activeChapterId, setActiveChapterId] = useState(null);
  const [activeLessonId, setActiveLessonId] = useState(null);

  // Toggle Collapse
  const [expandedChapters, setExpandedChapters] = useState({ 1: true });
  const [expandedLessons, setExpandedLessons] = useState({});

  const toggleChapter = (id) => setExpandedChapters(prev => ({...prev, [id]: !prev[id]}));
  const toggleLesson = (id) => setExpandedLessons(prev => ({...prev, [id]: !prev[id]}));

  // --- HANDLERS ---

  // 1. Add Chapter
  const handleAddChapter = (title) => {
    const newChapter = { id: Date.now(), title, lessons: [] };
    setChapters([...chapters, newChapter]);
    setExpandedChapters(prev => ({...prev, [newChapter.id]: true}));
  };

  // 2. Add Lesson (Title only)
  const openAddLessonModal = (chapterId) => {
    setActiveChapterId(chapterId);
    setIsLessonModalOpen(true);
  };

  const handleAddLesson = (title) => {
    const newLesson = { id: Date.now(), title, contents: [] };
    setChapters(chapters.map(ch => 
      ch.id === activeChapterId 
      ? { ...ch, lessons: [...ch.lessons, newLesson] } 
      : ch
    ));
    setExpandedLessons(prev => ({...prev, [newLesson.id]: true})); // Auto-expand the new lesson
  };

  // 3. Add Content (Video/Doc/Quiz)
  const openAddContentModal = (lessonId) => {
    setActiveLessonId(lessonId);
    setIsContentModalOpen(true);
  };

  const handleAddContent = (contentData) => {
    // Find the chapter that contains this lesson to update (nested 3-level structure)
    const updatedChapters = chapters.map(ch => ({
      ...ch,
      lessons: ch.lessons.map(ls => {
        if (ls.id === activeLessonId) {
          return { ...ls, contents: [...ls.contents, { id: Date.now(), ...contentData }] };
        }
        return ls;
      })
    }));
    setChapters(updatedChapters);
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
      <Navbar />
      
      <div className="pt-[72px] flex-1"> 
        {/* HEADER ACTIONS */}
        <div className="bg-white border-b border-gray-200 sticky top-[72px] z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition"><ArrowLeft size={24}/></button>
              <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Edit3 size={20} className="text-[#00b6b6]"/> Edit Course</h1>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition">Save Draft</button>
              <button className="px-6 py-2 bg-[#00b6b6] text-white rounded-lg font-bold shadow-md hover:bg-[#009e9e] transition flex items-center gap-2"><Save size={18}/> Publish</button>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-8">
            {/* General Information */}
            <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">General Information</h2>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label><input type="text" value={courseInfo.title} onChange={e => setCourseInfo({...courseInfo, title: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#00b6b6] outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea rows={4} value={courseInfo.description} onChange={e => setCourseInfo({...courseInfo, description: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#00b6b6] outline-none resize-none" /></div>
              </div>
            </section>

            {/* Course Outline (Nested) */}
            <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-800">Course Outline</h2>
                <button onClick={() => setIsChapterModalOpen(true)} className="text-[#00b6b6] font-medium hover:underline text-sm flex items-center gap-1 cursor-pointer"><Plus size={16}/> Add new chapter</button>
              </div>

              <div className="space-y-4">
                {chapters.map((chapter, cIndex) => (
                  <div key={chapter.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    
                    {/* Chapter Header */}
                    <div className="bg-gray-100 p-4 flex justify-between items-center cursor-pointer hover:bg-gray-200 transition" onClick={() => toggleChapter(chapter.id)}>
                      <div className="flex items-center gap-3">
                        {expandedChapters[chapter.id] ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                        <span className="font-bold text-gray-800">Chapter {cIndex + 1}: {chapter.title}</span>
                      </div>
                      <button onClick={(e) => {e.stopPropagation(); openAddLessonModal(chapter.id)}} className="text-[#00b6b6] text-sm font-medium flex items-center gap-1 hover:bg-white px-2 py-1 rounded shadow-sm"><Plus size={14}/> Add lesson</button>
                    </div>

                    {/* Lesson List */}
                    {expandedChapters[chapter.id] && (
                      <div className="bg-gray-50 p-3 space-y-3">
                        {chapter.lessons.length === 0 && <p className="text-gray-400 text-sm text-center italic py-2">No lessons yet.</p>}
                        
                        {chapter.lessons.map((lesson, lIndex) => (
                          <div key={lesson.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            {/* Lesson Header */}
                                <div className="p-3 flex justify-between items-center cursor-pointer hover:bg-teal-50 transition" onClick={() => toggleLesson(lesson.id)}>
                              <div className="flex items-center gap-2">
                                <File size={16} className="text-gray-400"/>
                                <span className="font-medium text-gray-700">Lesson {lIndex + 1}: {lesson.title}</span>
                                {expandedLessons[lesson.id] ? <ChevronUp size={14} className="text-gray-400"/> : <ChevronDown size={14} className="text-gray-400"/>}
                              </div>
                              <button onClick={(e) => {e.stopPropagation(); openAddContentModal(lesson.id)}} className="text-xs bg-[#00b6b6] text-white px-2 py-1 rounded hover:bg-[#009e9e] flex items-center gap-1"><Plus size={12}/> Add content</button>
                            </div>

                            {/* Content List */}
                            {expandedLessons[lesson.id] && (
                              <div className="border-t border-gray-100 p-2 space-y-2 bg-gray-50/50">
                                {lesson.contents.length === 0 && <p className="text-xs text-gray-400 pl-6">No content yet (Video, Doc, Quiz).</p>}
                                {lesson.contents.map((content) => (
                                  <div key={content.id} className="flex items-center gap-3 pl-6 py-2 text-sm text-gray-600 hover:text-gray-900">
                                    {content.type === 'video' && <Video size={14} className="text-blue-500"/>}
                                    {content.type === 'doc' && <FileText size={14} className="text-yellow-500"/>}
                                    {content.type === 'quiz' && <HelpCircle size={14} className="text-purple-500"/>}
                                    <span>{content.title}</span>
                                    {content.data.duration && <span className="text-xs text-gray-400">({content.data.duration})</span>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-700 mb-4">Course Cover Image</h3>
              <div className="aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 transition">
                <UploadCloud size={32} className="mb-2"/> <span className="text-sm">Click to upload image</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-700 mb-2">Settings</h3>
              <div><label className="block text-sm text-gray-600 mb-1">Category</label><select className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[#00b6b6]"><option>Web Development</option><option>Data Science</option></select></div>
              <div><label className="block text-sm text-gray-600 mb-1">Price ($)</label><input type="number" className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[#00b6b6]" value={courseInfo.price} onChange={e => setCourseInfo({...courseInfo, price: e.target.value})} /></div>
            </div>
          </div>
        </main>
      </div>

      <Footer />

      {/* Modals */}
      <SimpleModal isOpen={isChapterModalOpen} onClose={() => setIsChapterModalOpen(false)} onSave={handleAddChapter} title="Add new chapter" placeholder="Enter chapter name..." />
      <SimpleModal isOpen={isLessonModalOpen} onClose={() => setIsLessonModalOpen(false)} onSave={handleAddLesson} title="Add new lesson" placeholder="Enter lesson name..." />
      <ContentModal isOpen={isContentModalOpen} onClose={() => setIsContentModalOpen(false)} onSave={handleAddContent} />
    </div>
  );
}