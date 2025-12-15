import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Plus, Loader2 } from "lucide-react";
import { useParams } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SimpleModal from "../../components/teachers/SimpleModal";
import ContentModal from "../../components/teachers/ContentModal";
import LessonModal from "../../components/teachers/LessonModal";
import { ChapterItem } from "../../components/teachers/CourseListComponents";
import apiClient from "../../api/axiosConfig";

export default function EditCourse() {
  const { courseId } = useParams(); // Lấy courseId từ URL (VD: /teacher/courses/14/edit)
  const [activeMainTab, setActiveMainTab] = useState("curriculum"); 
  const [isLoading, setIsLoading] = useState(false); // Thêm loading state
    const [lessonModal, setLessonModal] = useState({
    isOpen: false,
    chapterId: null
  });

  // --- STATE DỮ LIỆU ---
  const [chapters, setChapters] = useState([]);

  // --- STATE QUẢN LÝ UI (Expand/Collapse) ---
  const [expandedChapters, setExpandedChapters] = useState({});
  const [expandedLessons, setExpandedLessons] = useState({});

  // --- STATE QUẢN LÝ MODAL ---
  const [simpleModal, setSimpleModal] = useState({ 
    isOpen: false, 
    type: null, 
    title: "", 
    placeholder: "",
    initialValue: "",
    targetId: null,
    parentId: null 
  });

  const [contentModal, setContentModal] = useState({
    isOpen: false, type: null, initialData: null, chapterId: null, lessonId: null, contentId: null
  });

  // --- FETCH DATA BAN ĐẦU ---
  const fetchCourseData = useCallback(async () => {
    if (!courseId) return;

    // Lấy userId từ localStorage
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user?.userId;

    if (!userId) {
        console.warn("User ID not found, cannot fetch course outline.");
        return;
    }

    try {
        console.log(`Fetching outline for userId: ${userId}, courseId: ${courseId}`);
        // Gọi API lấy outline theo yêu cầu của BE
        const res = await apiClient.get(`/course/outline`, {
            params: { userId, courseId }
        });
        
        console.log("Course Outline Response:", res.data);

        // Backend trả về: { status: 200, data: [ { chapterId, title, lessons: [...] } ] }
        const rawChapters = res.data.data || [];
        
        // --- MAP DỮ LIỆU BACKEND -> FRONTEND ---
        // Frontend dùng 'id', Backend dùng 'chapterId'/'lessonId'
        const mappedChapters = rawChapters.map(ch => ({
            id: ch.chapterId,       // Map chapterId -> id
            title: ch.title,
            order: ch.order,
            lessons: (ch.lessons || []).map(ls => ({
                id: ls.lessonId,    // Map lessonId -> id
                title: ls.title,
                order: ls.order,
                duration: ls.duration,
                // LƯU Ý: JSON mẫu không có field 'contents'. 
                // Nếu BE chưa trả về, ta để mảng rỗng để tránh lỗi crash, 
                // nhưng giáo viên sẽ không thấy nội dung đã tạo trước đó.
                contents: ls.contents || [] 
            }))
        }));
        
        setChapters(mappedChapters);
    } catch (error) {
        console.error("Error fetching course:", error);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  // --- HANDLERS: EXPAND / COLLAPSE ---
  const toggleChapter = (id) => setExpandedChapters(prev => ({...prev, [id]: !prev[id]}));
  const toggleLesson = (id) => setExpandedLessons(prev => ({...prev, [id]: !prev[id]}));

  // ==========================================
  // LOGIC: CHAPTERS
  // ==========================================
  const openAddChapter = () => {
    setSimpleModal({ isOpen: true, type: 'add_chapter', title: "Add New Chapter", placeholder: "Enter chapter title...", initialValue: "" });
  };

  const openEditChapter = (chapter) => {
    setSimpleModal({ 
        isOpen: true, 
        type: 'edit_chapter', 
        title: "Edit Chapter Title", 
        placeholder: "Enter chapter title...", 
        initialValue: chapter.title, 
        targetId: chapter.id,
        extraData: { order: chapter.order } 
    });
  };

  const deleteChapter = async (id) => {
    if (!window.confirm("Are you sure? This will delete all lessons inside.")) return;

    setIsLoading(true);
    try {
        await apiClient.delete(`/chapter/${id}`);
        // Xóa thành công thì fetch lại để đảm bảo đồng bộ
        // Hoặc xóa optimistic update
        setChapters(chapters.filter(c => c.id !== id));
    } catch (error) {
        console.error("Failed to delete chapter:", error);
        alert("Failed to delete chapter. " + (error.response?.data?.message || error.message));
        
        // Nếu lỗi do ID sai (404/500), load lại dữ liệu để lấy ID mới nhất
        if (error.response && (error.response.status === 404 || error.response.status === 500)) {
            console.log("ID not found on server, refreshing data...");
            fetchCourseData();
        }
    } finally {
        setIsLoading(false);
    }
  };

  // ==========================================
  // LOGIC: LESSONS
  // ==========================================
  const openAddLesson = (chapterId) => {
    setLessonModal({ isOpen: true, chapterId });
  };

  const openEditLesson = (lesson, chapterId) => {
    setSimpleModal({ isOpen: true, type: 'edit_lesson', title: "Edit Lesson Title", placeholder: "Enter lesson title...", initialValue: lesson.title, targetId: lesson.id, parentId: chapterId });
  };

  const deleteLesson = (chapterId, lessonId) => {
    if (window.confirm("Delete this lesson and its content?")) {
      // Logic tạm thời ở FE, sau này cần gọi API delete lesson
      setChapters(chapters.map(ch => 
        ch.id === chapterId ? { ...ch, lessons: ch.lessons.filter(l => l.id !== lessonId) } : ch
      ));
    }
  };

    const handleSaveLesson = async (payload) => {
    const { chapterId } = lessonModal;
    setIsLoading(true);

    try {
        const formData = new FormData();
        
        // 1. Basic Fields
        formData.append("title", payload.title);
        formData.append("desc", payload.description);
        // Tự động tính Order cho Lesson (Lấy số bài hiện tại + 1)
        const currentChapter = chapters.find(c => c.id === chapterId);
        const newOrder = (currentChapter?.lessons?.length || 0) + 1;
        formData.append("order", newOrder.toString());
        formData.append("preCond", "None"); // Mặc định hoặc thêm field nhập nếu cần
        
        // Cần gửi chapterId để BE biết bài học thuộc chương nào (dựa theo request mẫu của bạn thấy có field chapterId)
        // Tuy nhiên, request mẫu bạn gửi KHÔNG THẤY field 'chapterId' ở cấp ngoài cùng body form-data.
        // NHƯNG thường API add-lesson phải biết chapterId.
        // Dựa vào URL: /api/course/add-lesson -> Có vẻ nó thiếu context chapter.
        // Kiểm tra kỹ lại ảnh Postman: À, tôi thấy "key": "chapterId", "value": "3" ở gần cuối ảnh!
        formData.append("chapterId", chapterId.toString());


        // 2. Content Fields (Dựa vào contentType)
        if (payload.contentType === "video") {
            const { fileName, file, duration } = payload.data;
            formData.append("videoDTO.title", fileName);
            if (file) formData.append("videoDTO.video", file); // File object
            formData.append("videoDTO.duration", duration || "0");
            
            // Dummy segments (để tránh lỗi null nếu BE bắt buộc)
            formData.append("videoDTO.segmentDTOs[0].startAtSeconds", "0");
            formData.append("videoDTO.segmentDTOs[0].endAtSeconds", "10");
            formData.append("videoDTO.segmentDTOs[0].description", "Intro");
        } 
        else if (payload.contentType === "doc") {
            const { title, file } = payload.data;
            formData.append("courseMaterialDTOs[0].title", title);
            if (file) formData.append("courseMaterialDTOs[0].doc", file);
        }
        else if (payload.contentType === "quiz") {
            const { questions, settings } = payload.data;
            
            // Map Settings
            formData.append("quizDTOs[0].title", payload.title + " Quiz");
            formData.append("quizDTOs[0].desc", "Quiz for " + payload.title);
            formData.append("quizDTOs[0].timeLimitMinutes", settings.timeLimit.toString());
            formData.append("quizDTOs[0].difficultyAvg", settings.difficulty);
            formData.append("quizDTOs[0].score", settings.passScore.toString());
            formData.append("quizDTOs[0].precondition", "None");

            // Map Questions
            questions.forEach((q, qIdx) => {
                formData.append(`quizDTOs[0].questions[${qIdx}].qText`, q.question);
                formData.append(`quizDTOs[0].questions[${qIdx}].explanation`, "Explanation");
                formData.append(`quizDTOs[0].questions[${qIdx}].level`, settings.difficulty);
                formData.append(`quizDTOs[0].questions[${qIdx}].score`, q.score.toString());
                formData.append(`quizDTOs[0].questions[${qIdx}].order`, (qIdx + 1).toString());
                
                // Map Options (Answers)
                q.options.forEach((opt, oIdx) => {
                    formData.append(`quizDTOs[0].questions[${qIdx}].mcqContents[${oIdx}].cText`, opt.text);
                    formData.append(`quizDTOs[0].questions[${qIdx}].mcqContents[${oIdx}].isCorrect`, opt.isCorrect.toString());
                });
            });
        }

        // Gọi API
        // Lưu ý: Content-Type phải là undefined để trình duyệt tự thêm boundary
        const res = await apiClient.post("/course/add-lesson", formData, {
            headers: { "Content-Type": undefined }
        });

        if (res.status === 200 || res.status === 201) {
            console.log("Add Lesson Success:", res.data);
            alert("Lesson added successfully!");
            // Load lại dữ liệu để cập nhật ID và cấu trúc
            fetchCourseData();
        }

    } catch (error) {
        console.error("Add Lesson Error:", error);
        alert("Failed to add lesson. " + (error.response?.data?.message || error.message));
    } finally {
        setIsLoading(false);
    }
  };

  // ==========================================
  // LOGIC: CONTENT
  // ==========================================
  const openAddContent = (chapterId, lessonId) => {
    setContentModal({ isOpen: true, type: 'add', initialData: null, chapterId, lessonId });
  };

  const openEditContent = (chapterId, lessonId, content) => {
    setContentModal({ isOpen: true, type: 'edit', initialData: content, chapterId, lessonId, contentId: content.id });
  };

  const deleteContent = (chapterId, lessonId, contentId) => {
    if (window.confirm("Remove this content?")) {
      setChapters(chapters.map(ch => 
        ch.id === chapterId ? {
          ...ch,
          lessons: ch.lessons.map(ls => 
            ls.id === lessonId ? { ...ls, contents: ls.contents.filter(c => c.id !== contentId) } : ls
          )
        } : ch
      ));
    }
  };

  // ==========================================
  // HANDLERS: SAVE MODALS
  // ==========================================
  
  const handleSaveSimpleModal = async (value) => {
    const { type, targetId, parentId, extraData } = simpleModal;
    setIsLoading(true);

    try {
        // --- 1. ADD NEW CHAPTER ---
        if (type === 'add_chapter') {
            const newOrder = chapters.length + 1;
            const payload = {
                courseId: parseInt(courseId),
                title: value,
                order: newOrder
            };

            const res = await apiClient.post("/course/add-chapter", payload);
            
            if (res.status === 200 || res.status === 201) {
                console.log("Add Chapter Response:", res.data);

                // Kiểm tra response
                const responseData = res.data; // Có thể là {status: 200, data: 'successfully'}
                let realId = null;
                let createdChapterData = {};

                // ... Logic tìm ID cũ ...
                if (responseData.data && (responseData.data.id || responseData.data.chapterId)) {
                    realId = responseData.data.id || responseData.data.chapterId;
                    createdChapterData = responseData.data;
                } else if (responseData.id || responseData.chapterId) {
                    realId = responseData.id || responseData.chapterId;
                    createdChapterData = responseData;
                } else if (typeof responseData === 'number') {
                    realId = responseData;
                }

                if (realId) {
                    // Update UI ngay lập tức
                    const newChapterState = {
                        id: realId,
                        title: createdChapterData.title || value,
                        order: createdChapterData.order || newOrder,
                        lessons: []
                    };
                    setChapters([...chapters, newChapterState]);
                    setExpandedChapters(prev => ({...prev, [realId]: true}));
                } else {
                    // FALLBACK QUAN TRỌNG:
                    // Backend trả text 'successfully' -> Không có ID.
                    console.warn("Server response doesn't contain ID. Fetching outline from server...");
                    
                    // Thêm delay nhỏ 500ms để đảm bảo DB đã cập nhật xong trước khi gọi GET
                    setTimeout(() => {
                        fetchCourseData();
                    }, 500);
                }
            }
        } 
        
        // --- 2. UPDATE CHAPTER ---
        else if (type === 'edit_chapter') {
            const payload = {
                title: value,
                order: extraData?.order || 1
            };
            const res = await apiClient.put(`/chapter/${targetId}`, payload);
            if (res.status === 200) {
                 // Update optimistic
                 setChapters(chapters.map(c => c.id === targetId ? { ...c, title: value } : c));
                 // Cẩn thận fetch lại để chắc chắn
                 fetchCourseData();
            }
        } 
        
        // --- 3. LESSON LOGIC ---
        else if (type === 'add_lesson') {
            const newLesson = { id: Date.now(), title: value, contents: [] };
            setChapters(chapters.map(c => c.id === parentId ? { ...c, lessons: [...c.lessons, newLesson] } : c));
            setExpandedLessons(prev => ({...prev, [newLesson.id]: true}));
        } 
        else if (type === 'edit_lesson') {
            setChapters(chapters.map(c => 
                c.id === parentId ? {
                  ...c, lessons: c.lessons.map(l => l.id === targetId ? { ...l, title: value } : l)
                } : c
            ));
        }

        setSimpleModal({ ...simpleModal, isOpen: false });

    } catch (error) {
        console.error("Error saving:", error);
        alert("Failed to save. " + (error.response?.data?.message || error.message));
    } finally {
        setIsLoading(false);
    }
  };

  const handleSaveContentModal = (contentPayload) => {
    const { type, chapterId, lessonId, contentId } = contentModal;
    setChapters(chapters.map(ch => {
      if (ch.id !== chapterId) return ch;
      return {
        ...ch,
        lessons: ch.lessons.map(ls => {
          if (ls.id !== lessonId) return ls;
          if (type === 'add') {
            return { ...ls, contents: [...ls.contents, { id: Date.now(), ...contentPayload }] };
          } else {
            return { 
              ...ls, 
              contents: ls.contents.map(c => c.id === contentId ? { ...c, ...contentPayload, id: contentId } : c) 
            };
          }
        })
      };
    }));
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
              {isLoading && <Loader2 className="animate-spin text-[#00b6b6]" />}
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition">Save Draft</button>
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
                <button onClick={openAddChapter} className="text-[#00b6b6] font-medium flex items-center gap-1 hover:underline"><Plus size={18}/> Add Chapter</button>
              </div>
              
              <div className="space-y-4">
                {chapters.map((chapter, cIndex) => (
                  <ChapterItem 
                    key={chapter.id}
                    index={cIndex}
                    chapter={chapter}
                    isExpanded={expandedChapters[chapter.id]}
                    onToggle={toggleChapter}
                    onEdit={openEditChapter}
                    onDelete={deleteChapter}
                    onAddLesson={openAddLesson}
                    // Lesson Props
                    expandedLessons={expandedLessons}
                    toggleLesson={toggleLesson}
                    onEditLesson={(lesson) => openEditLesson(lesson, chapter.id)}
                    onDeleteLesson={deleteLesson}
                    // Content Props
                    onAddContent={(lessonId) => openAddContent(chapter.id, lessonId)}
                    onEditContent={(chapterId, lessonId, content) => openEditContent(chapterId, lessonId, content)}
                    onDeleteContent={deleteContent}
                  />
                ))}
              </div>
            </div>
          )}

          {activeMainTab === 'info' && <div className="text-center py-20 text-gray-500">Basic Info Placeholder</div>}
          {activeMainTab === 'settings' && <div className="text-center py-20 text-gray-500">Settings Placeholder</div>}
          {activeMainTab === 'students' && <div className="text-center py-20 text-gray-500">Students & Reviews Placeholder</div>}
        </main>
      </div>
      <Footer />
      
      {/* MODALS */}
      <SimpleModal 
        isOpen={simpleModal.isOpen} 
        onClose={() => setSimpleModal({...simpleModal, isOpen: false})} 
        onSave={handleSaveSimpleModal} 
        title={simpleModal.title} 
        placeholder={simpleModal.placeholder}
        initialValue={simpleModal.initialValue} 
      />

      <LessonModal 
        isOpen={lessonModal.isOpen}
        onClose={() => setLessonModal({ ...lessonModal, isOpen: false })}
        onSave={handleSaveLesson}
      />
      
      <ContentModal 
        isOpen={contentModal.isOpen} 
        onClose={() => setContentModal({...contentModal, isOpen: false})} 
        onSave={handleSaveContentModal}
        initialData={contentModal.initialData}
      />
    </div>
  );
}