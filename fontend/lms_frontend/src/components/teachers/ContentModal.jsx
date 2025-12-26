import React, { useState, useEffect } from "react";
import { Video, FileText, HelpCircle, UploadCloud, X, CheckSquare, Square, Trash2, Clock, Plus, CheckCircle2, File as FileIcon, Image as ImageIcon, Loader } from "lucide-react";

const convertDriveLink = (url) => {
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

const ContentModal = ({ isOpen, onClose, onSave, initialData = null, contentType = null }) => {
  const [activeTab, setActiveTab] = useState("video"); 
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Content States
  const [videoData, setVideoData] = useState({ 
    file: null, 
    fileName: "", 
    duration: "", 
    videoUrl: "",
    autoDetectedDuration: false
  });
  const [isLoadingDuration, setIsLoadingDuration] = useState(false);
  const [docData, setDocData] = useState({ id: null, file: null, fileName: "", title: "", docUrl: "" });
  const [quizSettings, setQuizSettings] = useState({ timeLimit: 10, difficulty: "Medium", score: 0 }); // ✅ Changed passScore to score
  const [quizData, setQuizData] = useState([]);

  // ✅ AUTO-CALCULATE TOTAL SCORE whenever quizData changes
  useEffect(() => {
    const totalScore = quizData.reduce((sum, q) => sum + (parseInt(q.score) || 0), 0);
    setQuizSettings(prev => ({ ...prev, score: totalScore }));
  }, [quizData]);

  // Reset/Init Data
  useEffect(() => {
    if (!isOpen) {
      setActiveTab("video");
      setIsEditMode(false);
      setVideoData({ file: null, fileName: "", duration: "", videoUrl: "", autoDetectedDuration: false });
      setIsLoadingDuration(false);
      setDocData({ id: null, file: null, fileName: "", title: "", docUrl: "" });
      setQuizSettings({ timeLimit: 10, difficulty: "Medium", score: 0 });
      setQuizData([]);
      return;
    }

    if (initialData && contentType) {
      setIsEditMode(true);
      
      if (contentType === "video") {
        setActiveTab("video");
        setVideoData({
          file: null,
          fileName: initialData.title || "Video",
          duration: initialData.duration || "",
          videoUrl: initialData.videoUrl,
          autoDetectedDuration: false
        });
      } 
      else if (contentType === "doc") {
        setActiveTab("doc");
        setDocData({
          id: initialData.id,
          file: null,
          fileName: initialData.title || "Document",
          title: initialData.title || "Document",
          docUrl: initialData.docUrl,
        });
      } 
      else if (contentType === "quiz") {
        setActiveTab("quiz");
        
        setQuizSettings({
          title: initialData.title || "Quiz",
          description: initialData.description || "",
          precondition: initialData.precondition || "None",
          timeLimit: initialData.timeLimit || 10,
          difficulty: initialData.difficulty || "Medium",
          score: initialData.score || 0, // ✅ Changed from passScore
        });
        
        setQuizData(initialData.questions || []);
        
        console.log("Loaded Quiz Data:", initialData.questions);
      }
    } else {
      setIsEditMode(false);
    }
  }, [isOpen, initialData, contentType]);

  if (!isOpen) return null;

  const isTabDisabled = (tabId) => {
    if (!isEditMode) return false;
    return activeTab !== tabId;
  };

  // --- Helpers ---
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    console.log("📹 Video file selected:", file.name);
    setIsLoadingDuration(true);
    setVideoData(prev => ({
      ...prev,
      file,
      fileName: file.name,
      duration: "",
      videoUrl: "",
      autoDetectedDuration: false
    }));

    const videoElement = document.createElement('video');
    videoElement.preload = 'metadata';

    videoElement.onloadedmetadata = function() {
      window.URL.revokeObjectURL(videoElement.src);
      const durationInSeconds = Math.round(videoElement.duration);
      
      console.log("✅ Video duration auto-detected:", durationInSeconds, "seconds");
      
      setVideoData(prev => ({
        ...prev,
        duration: durationInSeconds.toString(),
        autoDetectedDuration: true
      }));
      
      setIsLoadingDuration(false);
    };

    videoElement.onerror = function() {
      console.error("Failed to load video metadata");
      alert("Unable to auto-detect video duration. Please enter the duration manually.");
      
      setVideoData(prev => ({
        ...prev,
        autoDetectedDuration: false
      }));
      
      setIsLoadingDuration(false);
    };

    videoElement.src = URL.createObjectURL(file);
  };

  const handleDocUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocData({
        ...docData,
        file,
        fileName: file.name,
        title: docData.title || file.name.split('.')[0], 
      });
    }
  };
  
  const addQuestion = () => setQuizData([...quizData, { 
    id: Date.now(), 
    question: "", 
    qImage: null,
    score: 1,
    options: [
      { text: "", isCorrect: false, cImage: null },
      { text: "", isCorrect: false, cImage: null }, 
      { text: "", isCorrect: false, cImage: null }, 
      { text: "", isCorrect: false, cImage: null }
    ] 
  }]);

  const updateQuestion = (idx, field, val) => {
    const updated = [...quizData];
    updated[idx][field] = val;
    setQuizData(updated);
  };

  const updateOption = (qIdx, oIdx, field, val) => {
    const updated = [...quizData];
    updated[qIdx].options[oIdx][field] = val;
    setQuizData(updated);
  };

  const toggleCorrect = (qIdx, oIdx) => {
    const updated = [...quizData];
    updated[qIdx].options[oIdx].isCorrect = !updated[qIdx].options[oIdx].isCorrect;
    setQuizData(updated);
  };

  const handleQuestionImageUpload = (qIdx, e) => {
    const file = e.target.files[0];
    if (file) {
      updateQuestion(qIdx, 'qImage', file);
    }
  };

  const handleOptionImageUpload = (qIdx, oIdx, e) => {
    const file = e.target.files[0];
    if (file) {
      updateOption(qIdx, oIdx, 'cImage', file);
    }
  };

  const removeQuestionImage = (qIdx) => {
    updateQuestion(qIdx, 'qImage', null);
  };

  const removeOptionImage = (qIdx, oIdx) => {
    updateOption(qIdx, oIdx, 'cImage', null);
  };

  // --- SAVE HANDLER ---
  const handleSave = () => {
    if (activeTab === "video") {
      if (!videoData.file && !videoData.videoUrl) {
        alert("Please upload a video or provide a video URL");
        return;
      }
      onSave({ contentType: "video", data: videoData });
    } else if (activeTab === "doc") {
      if (!docData.file && !docData.docUrl) {
        alert("Please upload a document or provide a URL");
        return;
      }
      onSave({ contentType: "doc", data: docData });
    } else if (activeTab === "quiz") {
      if (quizData.length === 0) {
        alert("Please add at least one question");
        return;
      }
      
      // ✅ Validation: Check if total score matches
      const totalScore = quizData.reduce((sum, q) => sum + (parseInt(q.score) || 0), 0);
      if (totalScore !== quizSettings.score) {
        alert(`Total score mismatch! Expected: ${quizSettings.score}, Got: ${totalScore}`);
        return;
      }
      
      onSave({ contentType: "quiz", data: { questions: quizData, settings: quizSettings } });
    }
    onClose();
  };

  return (
    <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] ${isOpen ? "" : "hidden"}`}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Add Content</h2>
            <p className="text-sm text-gray-500">Add video, documents or quizzes to your lesson</p>
            <p className="mt-1 text-sm text-red-500">You can only add one new content at a time</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition">
            <X size={24}/>
          </button>
        </div>

        {/* TABS - Redesigned */}
        <div className="bg-gray-50 px-6 pt-4 border-b border-gray-200">
          <div className="flex gap-6">
            {[
              { id: 'video', label: 'Video Lesson', icon: Video },
              { id: 'doc', label: 'Document', icon: FileText },
              { id: 'quiz', label: 'Quiz', icon: HelpCircle }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => !isTabDisabled(tab.id) && setActiveTab(tab.id)}
                disabled={isTabDisabled(tab.id)}
                className={`flex items-center gap-2 pb-3 text-sm font-bold transition-all border-b-2 relative top-[2px] 
                ${isTabDisabled(tab.id) 
                    ? "cursor-not-allowed opacity-40"
                    : activeTab === tab.id 
                      ? "border-[#00b6b6] text-[#00b6b6]" 
                      : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"}`}
                title={isTabDisabled(tab.id) ? `Cannot edit ${tab.label} while in edit mode` : ""}
              >
                <tab.icon size={18} className={activeTab === tab.id ? "stroke-[2.5px]" : ""} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* BODY CONTENT */}
        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar bg-white">
          
          {/* 1. VIDEO TAB */}
          {activeTab === "video" && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700">1. Video Title</label>
                <input
                  type="text"
                  value={videoData.fileName}
                  onChange={(e) => setVideoData({ ...videoData, fileName: e.target.value })}
                  placeholder="e.g. Introduction to React Hooks"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00b6b6] focus:border-transparent transition bg-gray-50 hover:bg-white"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700">2. Upload Video</label>
                
                {/* DRAG & DROP AREA */}
                <div className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all group cursor-pointer
                  ${videoData.file ? "border-[#00b6b6] bg-teal-50/30" : "border-gray-300 bg-gray-50 hover:bg-white hover:border-[#00b6b6] hover:shadow-sm"}`}>
                  
                  <input 
                    type="file" 
                    accept="video/*" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    onChange={handleVideoUpload} 
                  />
                  
                  {videoData.file ? (
                    <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-2">
                      <div className="w-16 h-16 bg-[#00b6b6]/10 rounded-full flex items-center justify-center mb-3 text-[#00b6b6]">
                        <Video size={32} />
                      </div>
                      <p className="text-[#00b6b6] font-bold text-lg truncate max-w-sm">{videoData.file.name}</p>
                      <p className="text-gray-500 text-sm mt-1">
                        {(videoData.file.size / (1024 * 1024)).toFixed(2)} MB • Click or drag to replace
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center group-hover:scale-[1.02] transition-transform">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-gray-500 group-hover:bg-[#00b6b6]/10 group-hover:text-[#00b6b6] transition-colors">
                        <UploadCloud size={32} />
                      </div>
                      <p className="text-gray-700 font-bold text-lg">Drag & Drop video here</p>
                      <p className="text-gray-400 text-sm mt-1">or click to browse files (MP4, WebM)</p>
                    </div>
                  )}
                </div>

                {videoData.videoUrl && !videoData.file && (
                   <div className="mt-2 p-3 bg-blue-50 text-blue-700 text-sm rounded-lg flex items-center gap-2">
                      <CheckCircle2 size={16}/> Current video source: URL
                   </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      Duration (seconds)
                      {/* Loading indicator */}
                      {isLoadingDuration && (
                        <span className="text-xs text-[#00b6b6] flex items-center gap-1">
                          <Loader size={12} className="animate-spin"/> Detecting...
                        </span>
                      )}
                      {/* Auto-detected badge */}
                      {videoData.autoDetectedDuration && !isLoadingDuration && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 size={12}/> Checked
                        </span>
                      )}
                    </label>
                    <div className="relative">
                        <Clock size={18} className="absolute left-3 top-3 text-gray-400"/>
                        <input
                        type="number"
                        value={videoData.duration}
                        onChange={(e) => {
                          // Only allow change if NOT auto-detected
                          if (!videoData.autoDetectedDuration) {
                            setVideoData({ ...videoData, duration: e.target.value });
                          }
                        }}
                        placeholder={videoData.file ? "Auto-detecting..." : "Enter duration"}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none transition
                          ${isLoadingDuration 
                            ? "bg-gray-100 border-gray-200 cursor-wait" 
                            : videoData.autoDetectedDuration 
                              ? "bg-green-50 border-green-300 cursor-not-allowed" // Locked style
                              : "bg-gray-50 border-gray-200 focus:ring-2 focus:ring-[#00b6b6]"
                          }`}
                        disabled={isLoadingDuration || videoData.autoDetectedDuration} // Disable nếu auto-detected
                        readOnly={videoData.autoDetectedDuration}
                        />
                    </div>

                    {/* Helper text */}
                    {isLoadingDuration && (
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Loader size={12} className="animate-spin"/>
                        Reading video metadata...
                      </p>
                    )}
                    
                    {videoData.duration && !isLoadingDuration && videoData.autoDetectedDuration && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <CheckCircle2 size={12}/>
                        = {(parseInt(videoData.duration) / 60).toFixed(2)} minutes (locked)
                      </p>
                    )}
                    
                    {videoData.duration && !isLoadingDuration && !videoData.autoDetectedDuration && videoData.file && (
                      <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                        Auto-detection failed - enter manually
                      </p>
                    )}
                    
                    {!videoData.file && !videoData.duration && !isLoadingDuration && (
                      <p className="text-xs text-gray-400 mt-1">
                        Upload a video to auto-detect duration
                      </p>
                    )}
                 </div>
              </div>
            </div>
          )}

          {/* 2. DOC TAB */}
          {activeTab === "doc" && (
            <div className="space-y-6 max-w-2xl mx-auto">
               <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700">1. Document Title</label>
                <input
                  type="text"
                  value={docData.title}
                  onChange={(e) => setDocData({ ...docData, title: e.target.value })}
                  placeholder="e.g. Lecture Notes - Chapter 1"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00b6b6] bg-gray-50 hover:bg-white transition"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700">2. Upload Document</label>
                
                 {/* DRAG & DROP AREA DOC */}
                 <div className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all group cursor-pointer
                  ${docData.file ? "border-yellow-400 bg-yellow-50/30" : "border-gray-300 bg-gray-50 hover:bg-white hover:border-yellow-400 hover:shadow-sm"}`}>
                  
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    onChange={handleDocUpload} 
                  />
                  
                  {docData.file ? (
                    <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-2">
                      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-3 text-yellow-600">
                        <FileText size={32} />
                      </div>
                      <p className="text-yellow-700 font-bold text-lg truncate max-w-sm">{docData.file.name}</p>
                      <p className="text-gray-500 text-sm mt-1">
                        Click or drag to replace
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center group-hover:scale-[1.02] transition-transform">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-gray-500 group-hover:bg-yellow-100 group-hover:text-yellow-600 transition-colors">
                        <FileIcon size={32} />
                      </div>
                      <p className="text-gray-700 font-bold text-lg">Drag & Drop document here</p>
                      <p className="text-gray-400 text-sm mt-1">PDF, Word, Excel, PowerPoint</p>
                    </div>
                  )}
                </div>

                 {docData.docUrl && !docData.file && (
                   <div className="mt-2 p-3 bg-blue-50 text-blue-700 text-sm rounded-lg flex items-center gap-2 truncate">
                      <CheckCircle2 size={16} className="flex-shrink-0"/> 
                      <span>Current file: <a href={docData.docUrl} target="_blank" className="underline">{docData.docUrl.split('/').pop()}</a></span>
                   </div>
                )}
              </div>
            </div>
          )}

          {/* 3. QUIZ TAB */}
          {activeTab === "quiz" && (
            <div className="space-y-6">
              {/* Settings Panel */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Time (Minutes)</label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-3 top-3 text-gray-400"/>
                    <input
                      type="number"
                      value={quizSettings.timeLimit}
                      onChange={(e) => setQuizSettings({ ...quizSettings, timeLimit: parseInt(e.target.value) || 0 })}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00b6b6] outline-none"
                    />
                  </div>
                </div>
                
                {/* ✅ TOTAL SCORE - READ ONLY + AUTO-CALCULATED */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-2">
                    Total Score
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Auto</span>
                  </label>
                  <div className="relative">
                    <CheckCircle2 size={16} className="absolute left-3 top-3 text-green-500"/>
                    <input
                      type="number"
                      value={quizSettings.score}
                      readOnly
                      className="w-full pl-9 pr-3 py-2 border border-green-200 rounded-lg bg-green-50 text-green-700 font-bold cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Sum of all question points</p>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Difficulty</label>
                  <select
                    value={quizSettings.difficulty}
                    onChange={(e) => setQuizSettings({ ...quizSettings, difficulty: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00b6b6] outline-none bg-white"
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <HelpCircle size={20} className="text-purple-500"/>
                        Questions ({quizData.length})
                     </h3>
                </div>
                
                <div className="space-y-4">
                    {quizData.map((q, qIdx) => (
                    <div key={q.id} className="p-6 border border-gray-200 rounded-xl bg-white hover:shadow-md transition-shadow relative group">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setQuizData(quizData.filter((_,i)=>i!==qIdx))} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                                <Trash2 size={18}/>
                            </button>
                        </div>

                        <div className="mb-4 pr-10">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded">Q{qIdx + 1}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400 font-bold uppercase">Points:</span>
                                    <input
                                        type="number"
                                        value={q.score}
                                        onChange={(e) => updateQuestion(qIdx, "score", parseInt(e.target.value) || 0)}
                                        className="w-16 px-2 py-1 border border-gray-200 rounded text-sm text-center focus:ring-1 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                            </div>
                            <textarea
                                value={q.question}
                                onChange={(e) => updateQuestion(qIdx, "question", e.target.value)}
                                placeholder="Type your question here..."
                                className="w-full px-0 py-2 text-lg font-medium border-b border-transparent focus:border-purple-500 outline-none placeholder-gray-300 resize-none bg-transparent"
                                rows="1"
                            />
                            
                            {/* Question Image */}
                            <div className="mt-2">
                                {q.qImage ? (
                                    <div className="relative inline-block group/img">
                                        <img 
                                          src={q.qImage instanceof File ?
                                            URL.createObjectURL(q.qImage) : 
                                            convertDriveLink(q.qImage)
                                          } alt="Question" className="h-24 w-auto rounded-lg border border-gray-200 object-cover" />
                                        <button onClick={() => removeQuestionImage(qIdx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/img:opacity-100 transition shadow-sm">
                                            <X size={12}/>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative inline-block">
                                        <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleQuestionImageUpload(qIdx, e)} />
                                        <button className="text-xs text-[#00b6b6] hover:bg-teal-50 px-2 py-1 rounded flex items-center gap-1 transition">
                                            <ImageIcon size={14}/> Add Image
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${opt.isCorrect ? "border-green-200 bg-green-50" : "border-gray-100 bg-gray-50"}`}>
                                <button
                                    onClick={() => toggleCorrect(qIdx, oIdx)}
                                    className={`w-6 h-6 rounded flex items-center justify-center transition-colors flex-shrink-0 ${opt.isCorrect ? "bg-green-500 text-white" : "bg-white border border-gray-300 text-transparent hover:border-gray-400"}`}
                                >
                                    <CheckSquare size={14} />
                                </button>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={opt.text}
                                        onChange={(e) => updateOption(qIdx, oIdx, 'text', e.target.value)}
                                        placeholder={`Option ${oIdx + 1}`}
                                        className="w-full bg-transparent outline-none text-sm"
                                    />
                                    {/* Option Image */}
                                    <div className="mt-1">
                                        {opt.cImage ? (
                                            <div className="relative inline-block group/optImg">
                                                <img 
                                                  src={
                                                    opt.cImage instanceof File ? 
                                                    URL.createObjectURL(opt.cImage) : convertDriveLink(opt.cImage)} 
                                                    alt="Option" 
                                                    className="h-12 w-auto rounded border border-gray-200 object-cover" />
                                                <button onClick={() => removeOptionImage(qIdx, oIdx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/optImg:opacity-100 transition shadow-sm">
                                                    <X size={10}/>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="relative inline-block">
                                                <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleOptionImageUpload(qIdx, oIdx, e)} />
                                                <button className="text-[10px] text-gray-400 hover:text-[#00b6b6] flex items-center gap-1 transition">
                                                    <ImageIcon size={12}/> Add Image
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        </div>

                        {/* Explanation Field */}
                        <div className="mt-4">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Explaination (Optional)</label>
                            <textarea
                                value={q.explanation || ""}
                                onChange={(e) => updateQuestion(qIdx, "explanation", e.target.value)}
                                placeholder="Explain why the correct answer is right..."
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none bg-gray-50 text-sm"
                                rows="2"
                            />
                        </div>
                    </div>
                    ))}

                    {/* Add Question Button - New Style at Bottom */}
                    <button 
                        onClick={addQuestion} 
                        className="w-full py-4 border-2 border-dashed border-[#00b6b6]/30 text-[#00b6b6] rounded-xl font-bold hover:bg-teal-50 hover:border-[#00b6b6] transition flex justify-center items-center gap-2 group"
                    >
                        <div className="w-8 h-8 rounded-full bg-[#00b6b6]/10 flex items-center justify-center group-hover:bg-[#00b6b6] group-hover:text-white transition">
                            <Plus size={20}/> 
                        </div>
                        Add New Question
                    </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 z-10">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 rounded-xl font-bold transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-8 py-2.5 bg-[#00b6b6] text-white rounded-xl font-bold hover:bg-[#009e9e] shadow-lg shadow-teal-200 transition transform active:scale-95"
          >
            Save Content
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentModal;