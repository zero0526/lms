import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { 
  Save, Plus, Trash2, GripVertical, Edit3, Video, FileText, 
  HelpCircle, ChevronDown, ChevronUp, UploadCloud, X, ArrowLeft,
  Link as LinkIcon, CheckCircle2, Circle, Clock, Image as ImageIcon, Settings
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// --- 1. SIMPLE MODAL (Chương & Tên bài học) ---
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
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium">Hủy</button>
          <button onClick={() => { onSave(value); setValue(""); onClose(); }} className="px-4 py-2 bg-[#00b6b6] text-white rounded-lg hover:bg-[#009e9e] text-sm font-bold">Xác nhận</button>
        </div>
      </div>
    </div>
  );
};

// --- 2. ADVANCED CONTENT MODAL (Nâng cấp để khớp DB) ---
const ContentModal = ({ isOpen, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState("video"); 
  
  const [videoData, setVideoData] = useState({ url: "", duration: "" });
  // DB: course_materials (doc_url, title, file_type)
  const [docData, setDocData] = useState({ url: "", title: "", type: "PDF" }); 
  
  // DB: quizzes (time_limit, difficulty, total_score) + questions
  const [quizSettings, setQuizSettings] = useState({ timeLimit: 15, difficulty: "Medium", passScore: 5 });
  const [quizData, setQuizData] = useState([]);

  if (!isOpen) return null;

  // ... (Logic addQuestion, updateQuestion như cũ) ...
  const addQuestion = () => {
    setQuizData([...quizData, { id: Date.now(), question: "", score: 1, options: [{id:1, text:"", isCorrect:false}, {id:2, text:"", isCorrect:false}] }]);
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

  const handleSave = () => {
    let contentPayload = null;
    if (activeTab === "video") {
      if (!videoData.url) return alert("Thiếu URL Video");
      contentPayload = { type: "video", title: "Video bài giảng", data: videoData };
    } else if (activeTab === "doc") {
      if (!docData.url || !docData.title) return alert("Thiếu thông tin tài liệu");
      contentPayload = { type: "doc", title: docData.title, data: docData };
    } else if (activeTab === "quiz") {
      if (quizData.length === 0) return alert("Chưa có câu hỏi");
      contentPayload = { 
        type: "quiz", 
        title: `Bài kiểm tra (${quizData.length} câu)`, 
        data: { questions: quizData, settings: quizSettings } // Lưu cả setting
      };
    }
    onSave(contentPayload); onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800">Thêm nội dung chi tiết</h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* Tabs */}
          <div className="flex border-b mb-6">
            {['video', 'doc', 'quiz'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} 
                className={`px-6 py-2 flex items-center gap-2 text-sm font-bold border-b-2 capitalize transition 
                ${activeTab === tab ? "border-[#00b6b6] text-[#00b6b6]" : "border-transparent text-gray-500"}`}>
                {tab === 'video' ? <Video size={18}/> : tab === 'doc' ? <FileText size={18}/> : <HelpCircle size={18}/>} {tab}
              </button>
            ))}
          </div>

          <div className="min-h-[300px]">
            {/* 1. VIDEO TAB */}
            {activeTab === "video" && (
              <div className="space-y-4">
                <div><label className="block text-sm font-medium mb-1">URL Video</label><input type="text" className="input-field" value={videoData.url} onChange={e=>setVideoData({...videoData, url: e.target.value})} placeholder="Youtube/Vimeo URL"/></div>
                <div><label className="block text-sm font-medium mb-1">Thời lượng (phút)</label><input type="text" className="input-field w-32" value={videoData.duration} onChange={e=>setVideoData({...videoData, duration: e.target.value})} placeholder="10:00"/></div>
              </div>
            )}

            {/* 2. DOCUMENT TAB (Updated to match DB) */}
            {activeTab === "doc" && (
              <div className="space-y-4">
                <div><label className="block text-sm font-medium mb-1">Tiêu đề tài liệu</label><input type="text" className="input-field" value={docData.title} onChange={e=>setDocData({...docData, title: e.target.value})} placeholder="Ví dụ: Slide bài giảng chương 1"/></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">URL Tài liệu</label><input type="text" className="input-field" value={docData.url} onChange={e=>setDocData({...docData, url: e.target.value})} placeholder="Google Drive / Dropbox link"/></div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Loại file</label>
                    <select className="input-field" value={docData.type} onChange={e=>setDocData({...docData, type: e.target.value})}>
                      <option>PDF</option><option>DOCX</option><option>ZIP</option><option>Link</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 3. QUIZ TAB (Updated with Settings) */}
            {activeTab === "quiz" && (
              <div className="space-y-6">
                {/* Quiz Settings (DB: quizzes table) */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-purple-700 mb-1">Thời gian (phút)</label>
                    <div className="relative"><Clock size={14} className="absolute left-2 top-2.5 text-purple-400"/><input type="number" className="pl-7 input-field text-sm" value={quizSettings.timeLimit} onChange={e=>setQuizSettings({...quizSettings, timeLimit: e.target.value})}/></div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-purple-700 mb-1">Độ khó</label>
                    <select className="input-field text-sm" value={quizSettings.difficulty} onChange={e=>setQuizSettings({...quizSettings, difficulty: e.target.value})}>
                      <option>Easy</option><option>Medium</option><option>Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-purple-700 mb-1">Điểm đạt</label>
                    <input type="number" className="input-field text-sm" value={quizSettings.passScore} onChange={e=>setQuizSettings({...quizSettings, passScore: e.target.value})}/>
                  </div>
                </div>

                {/* Questions List */}
                {quizData.map((q, qIdx) => (
                  <div key={q.id} className="border p-4 rounded-xl relative group bg-gray-50">
                    <button onClick={() => setQuizData(quizData.filter((_,i)=>i!==qIdx))} className="absolute top-3 right-3 text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                    
                    <div className="flex gap-4 mb-3">
                      <div className="flex-1">
                        <label className="text-xs font-bold text-gray-500 mb-1 block">Câu hỏi {qIdx+1}</label>
                        <input type="text" className="input-field" value={q.question} onChange={e=>updateQuestion(qIdx, 'question', e.target.value)} placeholder="Nhập câu hỏi..."/>
                      </div>
                      <div className="w-20">
                        <label className="text-xs font-bold text-gray-500 mb-1 block">Điểm số</label>
                        <input type="number" className="input-field text-center" value={q.score} onChange={e=>updateQuestion(qIdx, 'score', e.target.value)}/>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => (
                        <div key={opt.id} className="flex items-center gap-2">
                          <button onClick={()=>setCorrect(qIdx, oIdx)} className={opt.isCorrect ? "text-green-500":"text-gray-300"}><CheckCircle2 size={20}/></button>
                          <input type="text" className={`input-field text-sm py-1 ${opt.isCorrect && "bg-green-50 border-green-300"}`} value={opt.text} onChange={e=>updateOption(qIdx, oIdx, e.target.value)} placeholder={`Đáp án ${oIdx+1}`}/>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                <button onClick={addQuestion} className="w-full border-2 border-dashed border-[#00b6b6] text-[#00b6b6] py-2 rounded-lg font-bold hover:bg-teal-50 flex justify-center items-center gap-2"><Plus size={18}/> Thêm câu hỏi</button>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 text-gray-600 hover:bg-gray-200 rounded-lg">Hủy</button>
          <button onClick={handleSave} className="px-6 py-2 bg-[#00b6b6] text-white rounded-lg hover:bg-[#009e9e] font-bold">Lưu nội dung</button>
        </div>
      </div>
    </div>
  );
};

// --- 3. MAIN PAGE ---
export default function EditCourse() {
  const navigate = useNavigate();
  // State quản lý tabs chính của trang Edit
  const [activeMainTab, setActiveMainTab] = useState("curriculum"); // 'curriculum' | 'info' | 'settings'

  const [chapters, setChapters] = useState([{ id: 1, title: "Chương 1: Mở đầu", lessons: [] }]);
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [activeChapterId, setActiveChapterId] = useState(null);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [expandedChapters, setExpandedChapters] = useState({ 1: true });
  const [expandedLessons, setExpandedLessons] = useState({});

  // ... (Giữ nguyên các hàm toggleChapter, toggleLesson, handleAddChapter, handleAddLesson) ...
  // Để code gọn, tôi giả định các hàm này giống hệt phiên bản trước, chỉ thay đổi phần render bên dưới

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
              <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><ArrowLeft size={24}/></button>
              <h1 className="text-xl font-bold text-gray-800">Chỉnh sửa khóa học</h1>
            </div>
            <div className="flex gap-3">
              <button className="btn-secondary">Xem trước</button>
              <button className="btn-primary">Xuất bản</button>
            </div>
          </div>
          
          {/* MAIN TABS NAVIGATION */}
          <div className="max-w-7xl mx-auto px-6 flex gap-8">
            {['curriculum', 'info', 'settings', 'students'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveMainTab(tab)}
                className={`pb-3 text-sm font-bold border-b-2 transition capitalize ${activeMainTab === tab ? "border-[#00b6b6] text-[#00b6b6]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                {tab === 'curriculum' ? "Đề cương" : tab === 'info' ? "Thông tin" : tab === 'settings' ? "Cài đặt" : "Học viên & Đánh giá"}
              </button>
            ))}
          </div>
        </div>

        <main className="max-w-5xl mx-auto w-full px-6 py-8 flex-1">
          {activeMainTab === 'curriculum' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800">Nội dung khóa học</h2>
                <button onClick={() => setIsChapterModalOpen(true)} className="text-[#00b6b6] font-medium flex items-center gap-1 hover:underline"><Plus size={18}/> Thêm chương</button>
              </div>
              
              {/* CHAPTER LIST */}
              <div className="space-y-4">
                {chapters.map((chapter, cIndex) => (
                  <div key={chapter.id} className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
                    <div className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer border-b border-gray-100" onClick={() => toggleChapter(chapter.id)}>
                      <div className="flex items-center gap-3 font-bold text-gray-700">
                        {expandedChapters[chapter.id] ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                        Chương {cIndex + 1}: {chapter.title}
                      </div>
                      <button onClick={(e) => {e.stopPropagation(); openAddLessonModal(chapter.id)}} className="text-sm bg-white border border-gray-300 px-3 py-1.5 rounded-md hover:border-[#00b6b6] hover:text-[#00b6b6] transition shadow-sm">+ Bài học</button>
                    </div>

                    {expandedChapters[chapter.id] && (
                      <div className="p-4 space-y-3 bg-white">
                        {chapter.lessons.length === 0 && <p className="text-gray-400 text-sm italic text-center">Chưa có bài học.</p>}
                        {chapter.lessons.map((lesson, lIndex) => (
                          <div key={lesson.id} className="border border-gray-200 rounded-lg">
                            <div className="p-3 flex justify-between items-center cursor-pointer hover:bg-teal-50 transition" onClick={() => toggleLesson(lesson.id)}>
                              <div className="flex items-center gap-2 font-medium text-gray-700">
                                <FileText size={16} className="text-gray-400"/>
                                <span>Bài {lIndex + 1}: {lesson.title}</span>
                                {expandedLessons[lesson.id] ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                              </div>
                              <button onClick={(e) => {e.stopPropagation(); openAddContentModal(lesson.id)}} className="text-xs bg-[#00b6b6] text-white px-2 py-1 rounded hover:bg-[#009e9e]">+ Nội dung</button>
                            </div>
                            
                            {expandedLessons[lesson.id] && (
                              <div className="border-t border-gray-100 p-2 bg-gray-50 space-y-1">
                                {lesson.contents.length === 0 && <p className="text-xs text-gray-400 pl-6">Chưa có nội dung.</p>}
                                {lesson.contents.map(c => (
                                  <div key={c.id} className="flex items-center gap-3 pl-6 py-2 text-sm text-gray-600 bg-white rounded border border-gray-100 shadow-sm mb-1">
                                    {c.type === 'video' ? <Video size={14} className="text-blue-500"/> : c.type === 'doc' ? <FileText size={14} className="text-yellow-500"/> : <HelpCircle size={14} className="text-purple-500"/>}
                                    <span className="flex-1">{c.title}</span>
                                    {c.type === 'quiz' && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">{c.data.settings.timeLimit} phút</span>}
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

          {activeMainTab === 'info' && <div className="text-center py-20 text-gray-500">Giao diện Thông tin chung (Tên, Mô tả, Ảnh)</div>}
          {activeMainTab === 'settings' && <div className="text-center py-20 text-gray-500">Giao diện Cài đặt (Giá, Danh mục)</div>}
          {activeMainTab === 'students' && <div className="text-center py-20 text-gray-500">Danh sách học viên & Đánh giá</div>}
        </main>
      </div>
      <Footer />
      <SimpleModal isOpen={isChapterModalOpen} onClose={() => setIsChapterModalOpen(false)} onSave={handleAddChapter} title="Thêm chương mới" placeholder="Nhập tên chương..." />
      <SimpleModal isOpen={isLessonModalOpen} onClose={() => setIsLessonModalOpen(false)} onSave={handleAddLesson} title="Thêm bài học mới" placeholder="Nhập tên bài học..." />
      <ContentModal isOpen={isContentModalOpen} onClose={() => setIsContentModalOpen(false)} onSave={handleAddContent} />
    </div>
  );
}

// CSS Helper classes (add to your global css or use Tailwind arbitrary values)
// .input-field { @apply w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00b6b6] outline-none transition-all; }
// .btn-primary { @apply px-6 py-2 bg-[#00b6b6] text-white rounded-lg font-bold shadow-md hover:bg-[#009e9e] transition; }
// .btn-secondary { @apply px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition; }