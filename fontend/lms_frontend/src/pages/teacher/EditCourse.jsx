import React, { useState } from "react";
import { 
  Save, Plus, Trash2, Video, FileText, 
  HelpCircle, ChevronDown, ChevronUp, UploadCloud, X, ArrowLeft,
  CheckCircle2, Circle, Clock
} from "lucide-react";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

// --- 1. SIMPLE MODAL (Chapter & Lesson Titles) ---
const SimpleModal = ({ isOpen, onClose, onSave, title, placeholder }) => {
  const [value, setValue] = useState("");
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">{title}</h3>
          <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-red-500"/></button>
        </div>
        <div className="p-6">
          <input 
            type="text" autoFocus
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#00b6b6] outline-none"
            placeholder={placeholder}
            value={value} onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <div className="p-4 border-t flex justify-end gap-2 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium">Cancel</button>
          <button onClick={() => { onSave(value); setValue(""); onClose(); }} className="px-4 py-2 bg-[#00b6b6] text-white rounded-lg hover:bg-[#009e9e] text-sm font-bold">Confirm</button>
        </div>
      </div>
    </div>
  );
};

// --- 2. ADVANCED CONTENT MODAL (Video Upload, Docs, Quiz) ---
const ContentModal = ({ isOpen, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState("video"); 
  
  // Video State
  const [videoData, setVideoData] = useState({ file: null, fileName: "", duration: "" });
  
  // Doc State
  const [docData, setDocData] = useState({ url: "", title: "", type: "PDF" }); 
  
  // Quiz State
  const [quizSettings, setQuizSettings] = useState({ timeLimit: 15, difficulty: "Medium", passScore: 5 });
  const [quizData, setQuizData] = useState([]);

  if (!isOpen) return null;

  // --- Quiz Helper Functions ---
  const addQuestion = () => {
    setQuizData([
      ...quizData, 
      { 
        id: Date.now(), 
        question: "", 
        score: 1, 
        options: [
          {id: 1, text: "", isCorrect: false}, 
          {id: 2, text: "", isCorrect: false},
          {id: 3, text: "", isCorrect: false},
          {id: 4, text: "", isCorrect: false}
        ] 
      }
    ]);
  };

  const updateQuestion = (idx, field, val) => {
    const newQ = [...quizData]; newQ[idx][field] = val; setQuizData(newQ);
  };
  const updateOption = (qIdx, oIdx, val) => {
    const newQ = [...quizData]; newQ[qIdx].options[oIdx].text = val; setQuizData(newQ);
  };
  const setCorrect = (qIdx, oIdx) => {
    const newQ = [...quizData]; 
    newQ[qIdx].options.forEach((o, i) => o.isCorrect = i === oIdx);
    setQuizData(newQ);
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoData({ ...videoData, file: file, fileName: file.name });
    }
  };

  const handleSave = () => {
    let contentPayload = null;
    if (activeTab === "video") {
      if (!videoData.file) return alert("Please upload a video file.");
      contentPayload = { type: "video", title: videoData.fileName || "Uploaded Video", data: videoData };
    } else if (activeTab === "doc") {
      if (!docData.url || !docData.title) return alert("Please fill in document details.");
      contentPayload = { type: "doc", title: docData.title, data: docData };
    } else if (activeTab === "quiz") {
      if (quizData.length === 0) return alert("Please add at least one question.");
      contentPayload = { 
        type: "quiz", 
        title: `Quiz (${quizData.length} questions)`, 
        data: { questions: quizData, settings: quizSettings } 
      };
    }
    onSave(contentPayload); 
    setVideoData({ file: null, fileName: "", duration: "" });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800">Add Content Details</h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* Tabs */}
          <div className="flex border-b mb-6">
            {['video', 'doc', 'quiz'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} 
                className={`px-6 py-2 flex items-center gap-2 text-sm font-bold border-b-2 capitalize transition 
                ${activeTab === tab ? "border-[#00b6b6] text-[#00b6b6]" : "border-transparent text-gray-500"}`}>
                {tab === 'video' ? <Video size={18}/> : tab === 'doc' ? <FileText size={18}/> : <HelpCircle size={18}/>} {tab === 'doc' ? 'Document' : tab}
              </button>
            ))}
          </div>

          <div className="min-h-[300px]">
            {/* 1. VIDEO TAB */}
            {activeTab === "video" && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition cursor-pointer relative bg-gray-50">
                  <input 
                    type="file" 
                    accept="video/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleVideoUpload}
                  />
                  <div className="w-16 h-16 bg-[#00b6b6]/10 rounded-full flex items-center justify-center mb-4">
                    <UploadCloud size={32} className="text-[#00b6b6]" />
                  </div>
                  
                  {videoData.file ? (
                    <div>
                      <p className="text-[#00b6b6] font-bold text-lg">{videoData.fileName}</p>
                      <p className="text-gray-500 text-sm mt-1">{(videoData.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      <p className="text-green-600 text-xs mt-2 font-medium">Ready to upload</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-700 font-bold text-lg">Click to upload video</p>
                      <p className="text-gray-400 text-sm mt-1">MP4, WebM, or Ogg up to 500MB</p>
                    </div>
                  )}
                </div>

                <div>
                   <label className="block text-sm font-medium mb-1 text-gray-700">Duration (optional)</label>
                   <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#00b6b6] max-w-xs" 
                    value={videoData.duration} 
                    onChange={e=>setVideoData({...videoData, duration: e.target.value})} 
                    placeholder="e.g. 10:00"
                   />
                </div>
              </div>
            )}

            {/* 2. DOCUMENT TAB */}
            {activeTab === "doc" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Document Title</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#00b6b6]" 
                    value={docData.title} 
                    onChange={e=>setDocData({...docData, title: e.target.value})} 
                    placeholder="e.g., Chapter 1 Slides"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Document URL</label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#00b6b6]" 
                      value={docData.url} 
                      onChange={e=>setDocData({...docData, url: e.target.value})} 
                      placeholder="Google Drive / Dropbox link"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">File Type</label>
                    <select 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#00b6b6]" 
                      value={docData.type} 
                      onChange={e=>setDocData({...docData, type: e.target.value})}
                    >
                      <option>PDF</option><option>DOCX</option><option>ZIP</option><option>Link</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 3. QUIZ TAB (UPDATED FOR LAYOUT) */}
            {activeTab === "quiz" && (
              <div className="space-y-6">
                {/* Quiz Settings */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-purple-700 mb-1">Time (Minutes)</label>
                    <div className="relative">
                      <Clock size={14} className="absolute left-2 top-2.5 text-purple-400"/>
                      <input 
                        type="number" 
                        className="pl-7 w-full border border-purple-200 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-purple-400 outline-none" 
                        value={quizSettings.timeLimit} 
                        onChange={e=>setQuizSettings({...quizSettings, timeLimit: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-purple-700 mb-1">Difficulty</label>
                    <select 
                      className="w-full border border-purple-200 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-purple-400 outline-none" 
                      value={quizSettings.difficulty} 
                      onChange={e=>setQuizSettings({...quizSettings, difficulty: e.target.value})}
                    >
                      <option>Easy</option><option>Medium</option><option>Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-purple-700 mb-1">Pass Score</label>
                    <input 
                      type="number" 
                      className="w-full border border-purple-200 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-purple-400 outline-none" 
                      value={quizSettings.passScore} 
                      onChange={e=>setQuizSettings({...quizSettings, passScore: e.target.value})}
                    />
                  </div>
                </div>

                {/* Questions List */}
                {quizData.map((q, qIdx) => (
                  <div key={q.id} className="border border-gray-200 p-5 rounded-xl relative group bg-gray-50/50 hover:bg-white hover:shadow-md transition">
                    <button 
                      onClick={() => setQuizData(quizData.filter((_,i)=>i!==qIdx))} 
                      className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition"
                      title="Remove Question"
                    >
                      <Trash2 size={18}/>
                    </button>
                    
                    <div className="flex flex-col gap-2 mb-4 pr-8">
                      <div className="flex justify-between items-end">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Question {qIdx+1}</label>
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-gray-500">Score:</label>
                          <input 
                            type="number" 
                            className="w-16 text-center border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-[#00b6b6] outline-none" 
                            value={q.score} 
                            onChange={e=>updateQuestion(qIdx, 'score', e.target.value)}
                          />
                        </div>
                      </div>
                      {/* UPDATED: Changed input to Textarea for wrapping long questions */}
                      <textarea 
                        className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-[#00b6b6] outline-none resize-none bg-white min-h-[80px] text-gray-800" 
                        value={q.question} 
                        onChange={e=>updateQuestion(qIdx, 'question', e.target.value)} 
                        placeholder="Enter your full question here..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-3">
                      {q.options.map((opt, oIdx) => (
                        <div key={opt.id} className="flex items-start gap-3">
                          <button 
                            onClick={()=>setCorrect(qIdx, oIdx)} 
                            className={`mt-2 ${opt.isCorrect ? "text-green-500" : "text-gray-300 hover:text-gray-400"}`}
                          >
                            <CheckCircle2 size={22} className={opt.isCorrect ? "fill-green-100" : ""}/>
                          </button>
                          
                          {/* UPDATED: Changed Option input to Textarea to prevent cutting off text */}
                          <textarea 
                            className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 outline-none resize-none min-h-[42px] overflow-hidden
                              ${opt.isCorrect 
                                ? "bg-green-50/50 border-green-300 focus:ring-green-400 text-green-900 placeholder-green-400" 
                                : "bg-white border-gray-300 focus:ring-[#00b6b6] text-gray-700"
                              }`} 
                            value={opt.text} 
                            onChange={e=>updateOption(qIdx, oIdx, e.target.value)} 
                            placeholder={`Option ${oIdx+1}`}
                            rows={1}
                            style={{ height: 'auto', minHeight: '42px' }}
                            onInput={(e) => {
                              e.target.style.height = 'auto';
                              e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={addQuestion} 
                  className="w-full border-2 border-dashed border-[#00b6b6] text-[#00b6b6] py-3 rounded-xl font-bold hover:bg-teal-50 flex justify-center items-center gap-2 transition"
                >
                  <Plus size={20}/> Add New Question
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium">Cancel</button>
          <button onClick={handleSave} className="px-6 py-2 bg-[#00b6b6] text-white rounded-lg hover:bg-[#009e9e] font-bold">Save Content</button>
        </div>
      </div>
    </div>
  );
};

// --- 3. MAIN PAGE ---
export default function EditCourse() {
  const [activeMainTab, setActiveMainTab] = useState("curriculum"); 
  const [chapters, setChapters] = useState([{ id: 1, title: "Chapter 1: Introduction", lessons: [] }]);
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [activeChapterId, setActiveChapterId] = useState(null);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [expandedChapters, setExpandedChapters] = useState({ 1: true });
  const [expandedLessons, setExpandedLessons] = useState({});

  const toggleChapter = (id) => setExpandedChapters(prev => ({...prev, [id]: !prev[id]}));
  const toggleLesson = (id) => setExpandedLessons(prev => ({...prev, [id]: !prev[id]}));

  const handleAddChapter = (title) => {
    const newChapter = { id: Date.now(), title, lessons: [] };
    setChapters([...chapters, newChapter]);
    setExpandedChapters(prev => ({...prev, [newChapter.id]: true}));
  };

  const openAddLessonModal = (chapterId) => { setActiveChapterId(chapterId); setIsLessonModalOpen(true); };
  
  const handleAddLesson = (title) => {
    const newLesson = { id: Date.now(), title, contents: [] };
    setChapters(chapters.map(ch => ch.id === activeChapterId ? { ...ch, lessons: [...ch.lessons, newLesson] } : ch));
    setExpandedLessons(prev => ({...prev, [newLesson.id]: true}));
  };

  const openAddContentModal = (lessonId) => { setActiveLessonId(lessonId); setIsContentModalOpen(true); };

  const handleAddContent = (contentData) => {
    const updatedChapters = chapters.map(ch => ({
      ...ch, lessons: ch.lessons.map(ls => ls.id === activeLessonId ? { ...ls, contents: [...ls.contents, { id: Date.now(), ...contentData }] } : ls)
    }));
    setChapters(updatedChapters);
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
      <Navbar />
      <div className="pt-[72px] flex-1 flex flex-col">
        {/* TOP BAR */}
        <div className="bg-white border-b border-gray-200 sticky top-[72px] z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><ArrowLeft size={24}/></button>
              <h1 className="text-xl font-bold text-gray-800">Edit Course</h1>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition">Preview</button>
              <button className="px-6 py-2 bg-[#00b6b6] text-white rounded-lg font-bold shadow-md hover:bg-[#009e9e] transition">Publish</button>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto px-6 flex gap-8">
            {['curriculum', 'info', 'settings', 'students'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveMainTab(tab)}
                className={`pb-3 text-sm font-bold border-b-2 transition capitalize ${activeMainTab === tab ? "border-[#00b6b6] text-[#00b6b6]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                {tab === 'curriculum' ? "Curriculum" : tab === 'info' ? "Basic Info" : tab === 'settings' ? "Settings" : "Students & Reviews"}
              </button>
            ))}
          </div>
        </div>

        <main className="max-w-5xl mx-auto w-full px-6 py-8 flex-1">
          {activeMainTab === 'curriculum' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800">Course Content</h2>
                <button onClick={() => setIsChapterModalOpen(true)} className="text-[#00b6b6] font-medium flex items-center gap-1 hover:underline"><Plus size={18}/> Add Chapter</button>
              </div>
              
              <div className="space-y-4">
                {chapters.map((chapter, cIndex) => (
                  <div key={chapter.id} className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
                    <div className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer border-b border-gray-100" onClick={() => toggleChapter(chapter.id)}>
                      <div className="flex items-center gap-3 font-bold text-gray-700">
                        {expandedChapters[chapter.id] ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                        Chapter {cIndex + 1}: {chapter.title}
                      </div>
                      <button onClick={(e) => {e.stopPropagation(); openAddLessonModal(chapter.id)}} className="text-sm bg-white border border-gray-300 px-3 py-1.5 rounded-md hover:border-[#00b6b6] hover:text-[#00b6b6] transition shadow-sm">+ Lesson</button>
                    </div>

                    {expandedChapters[chapter.id] && (
                      <div className="p-4 space-y-3 bg-white">
                        {chapter.lessons.length === 0 && <p className="text-gray-400 text-sm italic text-center">No lessons yet.</p>}
                        {chapter.lessons.map((lesson, lIndex) => (
                          <div key={lesson.id} className="border border-gray-200 rounded-lg">
                            <div className="p-3 flex justify-between items-center cursor-pointer hover:bg-teal-50 transition" onClick={() => toggleLesson(lesson.id)}>
                              <div className="flex items-center gap-2 font-medium text-gray-700">
                                <FileText size={16} className="text-gray-400"/>
                                <span>Lesson {lIndex + 1}: {lesson.title}</span>
                                {expandedLessons[lesson.id] ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                              </div>
                              <button onClick={(e) => {e.stopPropagation(); openAddContentModal(lesson.id)}} className="text-xs bg-[#00b6b6] text-white px-2 py-1 rounded hover:bg-[#009e9e]">+ Content</button>
                            </div>
                            
                            {expandedLessons[lesson.id] && (
                              <div className="border-t border-gray-100 p-2 bg-gray-50 space-y-1">
                                {lesson.contents.length === 0 && <p className="text-xs text-gray-400 pl-6">No content yet.</p>}
                                {lesson.contents.map(c => (
                                  <div key={c.id} className="flex items-center gap-3 pl-6 py-2 text-sm text-gray-600 bg-white rounded border border-gray-100 shadow-sm mb-1">
                                    {c.type === 'video' ? <Video size={14} className="text-blue-500"/> : c.type === 'doc' ? <FileText size={14} className="text-yellow-500"/> : <HelpCircle size={14} className="text-purple-500"/>}
                                    <span className="flex-1">{c.title}</span>
                                    {c.type === 'quiz' && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">{c.data.settings.timeLimit} min</span>}
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
            </div>
          )}

          {activeMainTab === 'info' && <div className="text-center py-20 text-gray-500">General Information (Name, Description, Thumbnail)</div>}
          {activeMainTab === 'settings' && <div className="text-center py-20 text-gray-500">Settings (Price, Categories)</div>}
          {activeMainTab === 'students' && <div className="text-center py-20 text-gray-500">Students List & Reviews</div>}
        </main>
      </div>
      <Footer />
      <SimpleModal isOpen={isChapterModalOpen} onClose={() => setIsChapterModalOpen(false)} onSave={handleAddChapter} title="Add New Chapter" placeholder="Enter chapter title..." />
      <SimpleModal isOpen={isLessonModalOpen} onClose={() => setIsLessonModalOpen(false)} onSave={handleAddLesson} title="Add New Lesson" placeholder="Enter lesson title..." />
      <ContentModal isOpen={isContentModalOpen} onClose={() => setIsContentModalOpen(false)} onSave={handleAddContent} />
    </div>
  );
}