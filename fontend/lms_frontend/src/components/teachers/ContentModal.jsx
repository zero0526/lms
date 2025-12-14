import React, { useState, useEffect } from "react";
import { Video, FileText, HelpCircle, UploadCloud, X, CheckCircle2, Trash2, Clock, Plus } from "lucide-react";

const ContentModal = ({ isOpen, onClose, onSave, initialData = null }) => {
  const [activeTab, setActiveTab] = useState("video"); 
  
  // Video State
  const [videoData, setVideoData] = useState({ file: null, fileName: "", duration: "" });
  
  // Doc State
  const [docData, setDocData] = useState({ url: "", title: "", type: "PDF" }); 
  
  // Quiz State
  const [quizSettings, setQuizSettings] = useState({ timeLimit: 15, difficulty: "Medium", passScore: 5 });
  const [quizData, setQuizData] = useState([]);

  // Effect: Load data khi mở modal để Edit (nếu có initialData)
  useEffect(() => {
    if (isOpen && initialData) {
      setActiveTab(initialData.type);
      if (initialData.type === 'video') {
        // Lưu ý: File object thật không thể restore từ server, chỉ hiển thị tên giả lập
        setVideoData(initialData.data);
      } else if (initialData.type === 'doc') {
        setDocData(initialData.data);
      } else if (initialData.type === 'quiz') {
        setQuizData(initialData.data.questions || []);
        setQuizSettings(initialData.data.settings || { timeLimit: 15, difficulty: "Medium", passScore: 5 });
      }
    } else if (isOpen && !initialData) {
      // Reset form khi tạo mới
      setVideoData({ file: null, fileName: "", duration: "" });
      setDocData({ url: "", title: "", type: "PDF" });
      setQuizData([]);
      setQuizSettings({ timeLimit: 15, difficulty: "Medium", passScore: 5 });
      setActiveTab("video");
    }
  }, [isOpen, initialData]);

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
      if (!videoData.fileName) return alert("Please upload a video file.");
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
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800">{initialData ? "Edit Content" : "Add Content"}</h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* Tabs - Disable tabs when editing to prevent changing type mid-edit */}
          <div className="flex border-b mb-6">
            {['video', 'doc', 'quiz'].map(tab => (
              <button key={tab} 
                onClick={() => !initialData && setActiveTab(tab)} 
                disabled={!!initialData}
                className={`px-6 py-2 flex items-center gap-2 text-sm font-bold border-b-2 capitalize transition 
                ${activeTab === tab ? "border-[#00b6b6] text-[#00b6b6]" : "border-transparent text-gray-500"}
                ${!!initialData ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                ${!!initialData && activeTab === tab ? "!opacity-100" : ""}
                `}>
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
                  
                  {videoData.fileName ? (
                    <div>
                      <p className="text-[#00b6b6] font-bold text-lg">{videoData.fileName}</p>
                      {videoData.file && <p className="text-gray-500 text-sm mt-1">{(videoData.file.size / (1024 * 1024)).toFixed(2)} MB</p>}
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

            {/* 3. QUIZ TAB */}
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

export default ContentModal;