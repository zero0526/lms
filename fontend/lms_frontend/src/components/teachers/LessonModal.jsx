import React, { useState, useEffect } from "react";
import { Video, FileText, HelpCircle, UploadCloud, X, CheckSquare, Square, Trash2, Clock, Plus, Info } from "lucide-react";

const LessonModal = ({ isOpen, onClose, onSave, initialData = null }) => {
  // --- STATE CHUNG ---
  const [lessonInfo, setLessonInfo] = useState({ title: "", description: "" });
  const [activeTab, setActiveTab] = useState("video"); // video | doc | quiz

  // --- CONTENT STATES ---
  // Video
  const [videoData, setVideoData] = useState({ file: null, fileName: "", duration: "" });
  // Doc
  const [docData, setDocData] = useState({ file: null, fileName: "", title: "" });
  // Quiz
  const [quizSettings, setQuizSettings] = useState({ timeLimit: 10, difficulty: "Medium", passScore: 5 });
  const [quizData, setQuizData] = useState([]);

  // Reset form khi mở modal
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Logic cho Edit (nếu cần sau này)
        setLessonInfo({ title: initialData.title, description: initialData.description || "" });
      } else {
        // Logic cho Add New
        setLessonInfo({ title: "", description: "" });
        setVideoData({ file: null, fileName: "", duration: "" });
        setDocData({ file: null, fileName: "", title: "" });
        setQuizData([]);
        setQuizSettings({ timeLimit: 10, difficulty: "Medium", passScore: 5 });
        setActiveTab("video");
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  // --- QUIZ HELPERS (Đã sửa cho Multiple Correct Answers) ---
  const addQuestion = () => {
    setQuizData([
      ...quizData,
      {
        id: Date.now(),
        question: "",
        score: 10,
        options: [
          { id: 1, text: "", isCorrect: false },
          { id: 2, text: "", isCorrect: false },
          { id: 3, text: "", isCorrect: false },
          { id: 4, text: "", isCorrect: false }
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

  // SỬA: Cho phép toggle đúng/sai (nhiều đáp án đúng)
  const toggleCorrect = (qIdx, oIdx) => {
    const newQ = [...quizData];
    newQ[qIdx].options[oIdx].isCorrect = !newQ[qIdx].options[oIdx].isCorrect;
    setQuizData(newQ);
  };

  // --- FILE HANDLERS ---
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) setVideoData({ ...videoData, file: file, fileName: file.name });
  };

  const handleDocUpload = (e) => {
    const file = e.target.files[0];
    if (file) setDocData({ ...docData, file: file, fileName: file.name, title: file.name });
  };

  // --- SUBMIT HANDLER ---
  const handleSave = () => {
    // 1. Validate Lesson Info
    if (!lessonInfo.title.trim()) return alert("Please enter lesson title.");

    // 2. Validate Content (Yêu cầu ít nhất 1 loại nội dung)
    let payload = {
      title: lessonInfo.title,
      description: lessonInfo.description,
      contentType: activeTab, // Để FE biết gửi cái gì
      data: null
    };

    if (activeTab === "video") {
      if (!videoData.file) return alert("Please upload a video file for this lesson.");
      payload.data = videoData;
    } 
    else if (activeTab === "doc") {
      if (!docData.file) return alert("Please upload a document file.");
      payload.data = docData;
    } 
    else if (activeTab === "quiz") {
      if (quizData.length === 0) return alert("Please add at least one question.");
      
      // Validate Quiz: Mỗi câu hỏi phải có ít nhất 1 đáp án đúng
      for (let i = 0; i < quizData.length; i++) {
        const hasCorrect = quizData[i].options.some(opt => opt.isCorrect);
        if (!hasCorrect) return alert(`Question ${i + 1} needs at least one correct answer.`);
        if (!quizData[i].question.trim()) return alert(`Question ${i + 1} is empty.`);
      }
      payload.data = { questions: quizData, settings: quizSettings };
    }

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800">
            {initialData ? "Edit Lesson" : "Create New Lesson"}
          </h3>
          <button onClick={onClose}><X size={20} className="text-gray-500 hover:text-red-500" /></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* 1. LESSON INFO SECTION */}
          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Lesson Title <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#00b6b6]"
                placeholder="e.g. Introduction to Java"
                value={lessonInfo.title}
                onChange={(e) => setLessonInfo({...lessonInfo, title: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#00b6b6] h-20 resize-none"
                placeholder="Brief description of this lesson..."
                value={lessonInfo.description}
                onChange={(e) => setLessonInfo({...lessonInfo, description: e.target.value})}
              />
            </div>
          </div>

          <div className="border-t border-gray-200 my-4"></div>

          {/* 2. CONTENT TYPE SELECTION */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">Lesson Content (Choose one) <span className="text-red-500">*</span></label>
            <div className="flex border-b">
              {['video', 'doc', 'quiz'].map(tab => (
                <button key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 flex items-center gap-2 text-sm font-bold border-b-2 capitalize transition 
                  ${activeTab === tab ? "border-[#00b6b6] text-[#00b6b6] bg-teal-50" : "border-transparent text-gray-500 hover:text-gray-700"}
                  `}>
                  {tab === 'video' ? <Video size={18}/> : tab === 'doc' ? <FileText size={18}/> : <HelpCircle size={18}/>} 
                  {tab === 'doc' ? 'Document' : tab}
                </button>
              ))}
            </div>
          </div>

          {/* 3. DYNAMIC CONTENT FORMS */}
          <div className="min-h-[250px]">
            {/* VIDEO FORM */}
            {activeTab === "video" && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition cursor-pointer relative bg-gray-50">
                  <input type="file" accept="video/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleVideoUpload} />
                  <div className="w-14 h-14 bg-[#00b6b6]/10 rounded-full flex items-center justify-center mb-3">
                    <UploadCloud size={28} className="text-[#00b6b6]" />
                  </div>
                  {videoData.fileName ? (
                    <div>
                      <p className="text-[#00b6b6] font-bold">{videoData.fileName}</p>
                      <p className="text-gray-500 text-xs mt-1">Click to change video</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-700 font-bold">Upload Lesson Video</p>
                      <p className="text-gray-400 text-sm">MP4, WebM up to 500MB</p>
                    </div>
                  )}
                </div>
                <div>
                   <label className="text-sm font-medium text-gray-700">Duration (seconds/minutes)</label>
                   <input type="text" className="ml-2 border rounded px-2 py-1 text-sm w-32" 
                     value={videoData.duration} onChange={e=>setVideoData({...videoData, duration: e.target.value})} placeholder="e.g. 120" />
                </div>
              </div>
            )}

            {/* DOC FORM */}
            {activeTab === "doc" && (
              <div className="space-y-4 animate-in fade-in duration-300">
                 <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition cursor-pointer relative bg-gray-50">
                  <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleDocUpload} />
                  <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                    <FileText size={28} className="text-yellow-600" />
                  </div>
                  {docData.fileName ? (
                    <div>
                      <p className="text-yellow-700 font-bold">{docData.fileName}</p>
                      <p className="text-gray-500 text-xs mt-1">Click to change document</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-700 font-bold">Upload Document</p>
                      <p className="text-gray-400 text-sm">PDF, DOCX, PPTX</p>
                    </div>
                  )}
                </div>
                <input type="text" className="w-full border rounded px-3 py-2" placeholder="Document Title" value={docData.title} onChange={e=>setDocData({...docData, title: e.target.value})} />
              </div>
            )}

            {/* QUIZ FORM */}
            {activeTab === "quiz" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-purple-700 mb-1">Time (Min)</label>
                    <input type="number" className="w-full border rounded px-2 py-1 text-sm" value={quizSettings.timeLimit} onChange={e=>setQuizSettings({...quizSettings, timeLimit: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-purple-700 mb-1">Pass Score</label>
                    <input type="number" className="w-full border rounded px-2 py-1 text-sm" value={quizSettings.passScore} onChange={e=>setQuizSettings({...quizSettings, passScore: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-purple-700 mb-1">Difficulty</label>
                    <select className="w-full border rounded px-2 py-1 text-sm" value={quizSettings.difficulty} onChange={e=>setQuizSettings({...quizSettings, difficulty: e.target.value})}>
                      <option>Easy</option><option>Medium</option><option>Hard</option>
                    </select>
                  </div>
                </div>

                {quizData.map((q, qIdx) => (
                  <div key={q.id} className="border p-4 rounded-xl relative bg-gray-50/50">
                    <button onClick={() => setQuizData(quizData.filter((_,i)=>i!==qIdx))} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                    <div className="mb-3">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-bold text-gray-500">QUESTION {qIdx+1}</span>
                        <input type="number" className="w-16 text-center border rounded text-xs" value={q.score} onChange={e=>updateQuestion(qIdx, 'score', e.target.value)} placeholder="Score"/>
                      </div>
                      <textarea className="w-full border rounded p-2 text-sm" rows={2} placeholder="Question text..." value={q.question} onChange={e=>updateQuestion(qIdx, 'question', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => (
                        <div key={opt.id} className="flex items-center gap-2">
                          <button onClick={()=>toggleCorrect(qIdx, oIdx)} className={`p-1 rounded ${opt.isCorrect ? "text-green-600 bg-green-100" : "text-gray-400"}`}>
                            {opt.isCorrect ? <CheckSquare size={18}/> : <Square size={18}/>}
                          </button>
                          <input type="text" className={`flex-1 border rounded px-2 py-1 text-sm ${opt.isCorrect ? "border-green-300 bg-green-50" : ""}`} value={opt.text} onChange={e=>updateOption(qIdx, oIdx, e.target.value)} placeholder={`Option ${oIdx+1}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <button onClick={addQuestion} className="w-full border-2 border-dashed border-purple-300 text-purple-600 py-2 rounded-lg font-bold hover:bg-purple-50">+ Add Question</button>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium">Cancel</button>
          <button onClick={handleSave} className="px-6 py-2 bg-[#00b6b6] text-white rounded-lg hover:bg-[#009e9e] font-bold">Create Lesson</button>
        </div>
      </div>
    </div>
  );
};

export default LessonModal;