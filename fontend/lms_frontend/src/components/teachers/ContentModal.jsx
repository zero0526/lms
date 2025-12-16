import React, { useState, useEffect } from "react";
import { Video, FileText, HelpCircle, UploadCloud, X, CheckSquare, Square, Trash2, Clock, Plus } from "lucide-react";

const ContentModal = ({ isOpen, onClose, onSave, initialData = null }) => {
  const [activeTab, setActiveTab] = useState("video"); 
  
  // Content States
  const [videoData, setVideoData] = useState({ file: null, fileName: "", duration: "" });
  const [docData, setDocData] = useState({ file: null, fileName: "", title: "" });
  const [quizSettings, setQuizSettings] = useState({ timeLimit: 10, difficulty: "Medium", passScore: 5 });
  const [quizData, setQuizData] = useState([]);

  // Reset/Init Data
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Logic edit (nếu cần sau này)
        setActiveTab(initialData.type);
      } else {
        // Reset form for new content
        setVideoData({ file: null, fileName: "", duration: "" });
        setDocData({ file: null, fileName: "", title: "" });
        setQuizData([]);
        setQuizSettings({ timeLimit: 10, difficulty: "Medium", passScore: 5 });
        setActiveTab("video");
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  // --- Helpers ---
  const handleVideoUpload = (e) => { const file = e.target.files[0]; if (file) setVideoData({ ...videoData, file, fileName: file.name }); };
  const handleDocUpload = (e) => { const file = e.target.files[0]; if (file) setDocData({ ...docData, file, fileName: file.name, title: file.name }); };
  
  const addQuestion = () => setQuizData([...quizData, { id: Date.now(), question: "", score: 10, options: [{ id: 1, text: "", isCorrect: false }, { id: 2, text: "", isCorrect: false }, { id: 3, text: "", isCorrect: false }, { id: 4, text: "", isCorrect: false }] }]);
  const updateQuestion = (idx, field, val) => { const newQ = [...quizData]; newQ[idx][field] = val; setQuizData(newQ); };
  const updateOption = (qIdx, oIdx, val) => { const newQ = [...quizData]; newQ[qIdx].options[oIdx].text = val; setQuizData(newQ); };
  const toggleCorrect = (qIdx, oIdx) => { const newQ = [...quizData]; newQ[qIdx].options[oIdx].isCorrect = !newQ[qIdx].options[oIdx].isCorrect; setQuizData(newQ); };

  // --- SAVE HANDLER ---
  const handleSave = () => {
    let payload = { contentType: activeTab, data: null };

    if (activeTab === "video") {
      if (!videoData.file && !initialData) return alert("Please upload a video.");
      payload.data = videoData;
    } else if (activeTab === "doc") {
      if (!docData.file && !initialData) return alert("Please upload a document.");
      payload.data = docData;
    } else if (activeTab === "quiz") {
      if (quizData.length === 0) return alert("Please add at least one question.");
      for (let i = 0; i < quizData.length; i++) {
         if (!quizData[i].options.some(opt => opt.isCorrect)) return alert(`Question ${i + 1} needs correct answer.`);
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
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800">Add Content to Lesson</h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <div className="flex border-b mb-6">
            {['video', 'doc', 'quiz'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 flex items-center gap-2 text-sm font-bold border-b-2 capitalize transition ${activeTab === tab ? "border-[#00b6b6] text-[#00b6b6] bg-teal-50" : "border-transparent text-gray-500"}`}>
                {tab === 'video' ? <Video size={18}/> : tab === 'doc' ? <FileText size={18}/> : <HelpCircle size={18}/>} {tab}
              </button>
            ))}
          </div>

          <div className="min-h-[300px]">
            {/* VIDEO FORM */}
            {activeTab === "video" && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 cursor-pointer relative">
                  <input type="file" accept="video/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleVideoUpload} />
                  <UploadCloud size={32} className="text-[#00b6b6] mb-2" />
                  <p className="font-medium text-gray-700">{videoData.fileName || "Click to upload Video"}</p>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm">Duration (sec):</label>
                    <input type="text" className="border rounded px-2 py-1 w-20" value={videoData.duration} onChange={e=>setVideoData({...videoData, duration:e.target.value})} placeholder="120" />
                </div>
              </div>
            )}

            {/* DOC FORM */}
            {activeTab === "doc" && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 cursor-pointer relative">
                  <input type="file" accept=".pdf,.doc,.docx" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleDocUpload} />
                  <FileText size={32} className="text-yellow-500 mb-2" />
                  <p className="font-medium text-gray-700">{docData.fileName || "Click to upload Document"}</p>
                </div>
                <input type="text" className="w-full border rounded px-3 py-2" placeholder="Document Title" value={docData.title} onChange={e=>setDocData({...docData, title:e.target.value})} />
              </div>
            )}

            {/* QUIZ FORM */}
            {activeTab === "quiz" && (
              <div className="space-y-6">
                <div className="bg-purple-50 p-4 rounded grid grid-cols-3 gap-4">
                   {/* ... Settings inputs (Time, Pass Score, Difficulty) giống file cũ ... */}
                   <div><label className="block text-xs font-bold text-purple-700">Time (Min)</label><input type="number" className="w-full border rounded px-2 py-1" value={quizSettings.timeLimit} onChange={e=>setQuizSettings({...quizSettings, timeLimit: e.target.value})} /></div>
                   <div><label className="block text-xs font-bold text-purple-700">Pass Score</label><input type="number" className="w-full border rounded px-2 py-1" value={quizSettings.passScore} onChange={e=>setQuizSettings({...quizSettings, passScore: e.target.value})} /></div>
                   <div><label className="block text-xs font-bold text-purple-700">Difficulty</label><select className="w-full border rounded px-2 py-1" value={quizSettings.difficulty} onChange={e=>setQuizSettings({...quizSettings, difficulty: e.target.value})}><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
                </div>
                {quizData.map((q, qIdx) => (
                  <div key={q.id} className="border p-4 rounded relative bg-gray-50">
                    <button onClick={() => setQuizData(quizData.filter((_,i)=>i!==qIdx))} className="absolute top-2 right-2 text-red-400"><Trash2 size={16}/></button>
                    <div className="mb-2"><span className="text-xs font-bold text-gray-500">Q{qIdx+1}</span> <input type="number" className="w-12 border rounded text-center text-xs" value={q.score} onChange={e=>updateQuestion(qIdx, 'score', e.target.value)} placeholder="Pts"/></div>
                    <textarea className="w-full border rounded p-2 mb-2 text-sm" rows={2} placeholder="Question..." value={q.question} onChange={e=>updateQuestion(qIdx, 'question', e.target.value)} />
                    <div className="space-y-1">
                        {q.options.map((opt, oIdx) => (
                            <div key={opt.id} className="flex items-center gap-2">
                                <button onClick={()=>toggleCorrect(qIdx, oIdx)} className={opt.isCorrect ? "text-green-600" : "text-gray-300"}>{opt.isCorrect ? <CheckSquare size={18}/> : <Square size={18}/>}</button>
                                <input className="flex-1 border rounded px-2 py-1 text-sm" value={opt.text} onChange={e=>updateOption(qIdx, oIdx, e.target.value)} placeholder={`Option ${oIdx+1}`} />
                            </div>
                        ))}
                    </div>
                  </div>
                ))}
                <button onClick={addQuestion} className="w-full border-2 border-dashed border-purple-300 text-purple-600 py-2 rounded font-bold hover:bg-purple-50">+ Add Question</button>
              </div>
            )}
          </div>
        </div>
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-[#00b6b6] text-white rounded font-bold">Save Content</button>
        </div>
      </div>
    </div>
  );
};
export default ContentModal;