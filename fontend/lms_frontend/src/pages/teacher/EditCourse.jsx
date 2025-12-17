import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Plus, Loader2 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SimpleModal from "../../components/teachers/SimpleModal";
import ContentModal from "../../components/teachers/ContentModal";
import { ChapterItem } from "../../components/teachers/CourseListComponents";
import apiClient from "../../api/axiosConfig";

export default function EditCourse() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [activeMainTab, setActiveMainTab] = useState("curriculum");
  const [isLoading, setIsLoading] = useState(false);

  // --- STATE DỮ LIỆU ---
  const [chapters, setChapters] = useState([]);

  // --- STATE QUẢN LÝ UI ---
  const [expandedChapters, setExpandedChapters] = useState({});
  const [expandedLessons, setExpandedLessons] = useState({});

  // --- STATE MODALS ---
  const [simpleModal, setSimpleModal] = useState({
    isOpen: false,
    type: null,
    title: "",
    placeholder: "",
    initialValue: "",
    targetId: null,
    parentId: null,
  });

  const [contentModal, setContentModal] = useState({
    isOpen: false,
    type: null,
    initialData: null,
    chapterId: null,
    lessonId: null,
    contentId: null,
  });

  // --- HELPER: GET USER ID ---
  const getUserId = () => {
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    return userStr ? JSON.parse(userStr).userId : null;
  };

  // --- API: FETCH COURSE OUTLINE ---
  const fetchCourseData = useCallback(async () => {
    if (!courseId) return;

    const userId = getUserId();
    if (!userId) {
      console.warn("User ID not found.");
      return;
    }

    try {
      console.log(`Fetching outline for userId: ${userId}, courseId: ${courseId}`);
      const res = await apiClient.get(`/course/outline`, {
        params: { userId, courseId },
      });

      console.log("Course Outline Response (Raw):", res.data);

      const rawChapters = res.data.data || [];

      // ← LOG ALL CHAPTER & LESSON IDS
      console.log("=== COURSE STRUCTURE ===");
      rawChapters.forEach((ch, chIdx) => {
        console.log(`Chapter ${chIdx + 1}: ID=${ch.chapterId}, Title="${ch.title}", Order=${ch.order}`);
        (ch.lessons || []).forEach((ls, lsIdx) => {
          console.log(`  └─ Lesson ${lsIdx + 1}: ID=${ls.lessonId}, Title="${ls.title}", Order=${ls.order}`);
        });
      });

      // ← CẬP NHẬT CHAPTERS VỚI CURRENT STATE
      setChapters((prevChapters) => {
        return rawChapters.map((ch) => {
          // TÌM CHAPTER CŨ
          const oldChapter = prevChapters.find(oldCh => oldCh.id === ch.chapterId);
          
          return {
            id: ch.chapterId,
            title: ch.title,
            order: ch.order,
            lessons: (ch.lessons || []).map((ls) => {
              // TÌM LESSON CŨ ĐỂ PRESERVE DETAILS
              const oldLesson = oldChapter?.lessons.find(oldL => oldL.id === ls.lessonId);
              
              return {
                id: ls.lessonId,
                title: ls.title,
                order: ls.order,
                duration: ls.duration,
                // ← PRESERVE: isDetailsLoaded, urlVideo, docs, quizzes
                isDetailsLoaded: oldLesson?.isDetailsLoaded || false,
                urlVideo: oldLesson?.urlVideo || null,
                docs: oldLesson?.docs || null,
                quizzes: oldLesson?.quizzes || [],
                description: oldLesson?.description || "",
              };
            }),
          };
        });
      });

      console.log("Mapped Structure Updated");
    } catch (error) {
      console.error("Error fetching course:", error);
    }
  }, [courseId]);

  useEffect(() => {
    // ← Chỉ chạy khi chapters đã load xong
    if (chapters.length === 0) return;

    // ← Duyệt qua tất cả lessons đang expanded
    Object.keys(expandedLessons).forEach((lessonIdStr) => {
      const lessonId = parseInt(lessonIdStr);
      const isExpanded = expandedLessons[lessonId];

      // ← Nếu lesson đang expanded
      if (isExpanded) {
        // ← Tìm chapter chứa lesson này
        let chapterId = null;
        let lesson = null;

        for (const ch of chapters) {
          const foundLesson = ch.lessons.find((l) => l.id === lessonId);
          if (foundLesson) {
            chapterId = ch.id;
            lesson = foundLesson;
            break;
          }
        }

        if (lesson && !lesson.isDetailsLoaded) {
          console.log(`Auto-fetching details for lesson ${lessonId} (chapter ${chapterId})`);
          fetchLessonDetails(lessonId, chapterId);
        }
      }
    });
  }, [chapters, expandedLessons]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  // --- API: FETCH LESSON DETAILS ---
  const fetchLessonDetails = async (lessonId, chapterId) => {
    const userId = getUserId();
    if (!userId) return;

    try {
      console.log(`Fetching details for lessonID: ${lessonId} (in chapterID: ${chapterId})...`);
      const res = await apiClient.get(`/lesson/details`, {
        params: { userId, lessonId },
      });

      const details = res.data.data;
      
      // --- LOG DEBUG: CHI TIẾT NỘI DUNG & ID ---
      console.log(`=== LESSON DETAILS: ${lessonId} ===`);
      console.log(`Lesson ID: ${lessonId}`);
      console.log(`Chapter ID: ${chapterId}`);
      if (details) {
          console.log(`Title: "${details.title}"`);
          console.log(`Duration: ${details.duration}`);
          
          // ← LOG VIDEO DETAILS
          if (details.urlVideo) {
              console.log(`=== VIDEO ===`);
              console.log(`Video URL: ${details.urlVideo}`);
              if (typeof details.urlVideo === 'object') {
                  console.log(`Video ID: ${details.urlVideo.videoId || details.urlVideo.id || "N/A"}`);
                  console.log(`Video Title: ${details.urlVideo.title || "N/A"}`);
                  console.log(`Video Duration: ${details.urlVideo.duration || "N/A"}`);
                  console.log(`Full Video Object:`, details.urlVideo);
              }
          } else {
              console.log(`Video: NULL`);
          }
          
          // ← LOG DOCS DETAILS
          if (details.docs) {
              console.log(`=== DOCUMENTS ===`);
              if (Array.isArray(details.docs)) {
                  console.log(`Document Count: ${details.docs.length}`);
                  details.docs.forEach((doc, dIdx) => {
                      console.log(`  Doc ${dIdx + 1}:`);
                      console.log(`    ID: ${doc.id || doc.docId || doc.materialId || "N/A"}`);
                      console.log(`    Title: ${doc.title || "N/A"}`);
                      console.log(`    URL: ${doc.url || doc.docUrl || "N/A"}`);
                      console.log(`    Full Doc Object:`, doc);
                  });
              } else if (typeof details.docs === 'object') {
                  console.log(`Document (Single Object):`);
                  console.log(`  ID: ${details.docs.id || details.docs.docId || details.docs.materialId || "N/A"}`);
                  console.log(`  Title: ${details.docs.title || "N/A"}`);
                  console.log(`  URL: ${details.docs.url || details.docs.docUrl || "N/A"}`);
                  console.log(`  Full Doc Object:`, details.docs);
              } else {
                  console.log(`Docs: ${details.docs}`);
              }
          } else {
              console.log(`Documents: NULL`);
          }
          
          if (details.quizzes && details.quizzes.length > 0) {
              console.log(`=== QUIZZES (${details.quizzes.length}) ===`);
              details.quizzes.forEach((q, qIdx) => {
                console.log(`  Quiz ${qIdx + 1}: ID=${q.quizId}, Title="${q.titleQuiz}"`);
              });
          } else {
              console.log(`Quizzes: Empty`);
          }
      }

      if (details) {
        setChapters((prev) =>
          prev.map((ch) => {
            if (ch.id !== chapterId) return ch;
            return {
              ...ch,
              lessons: ch.lessons.map((ls) => {
                if (ls.id !== lessonId) return ls;
                return {
                  ...ls,
                  isDetailsLoaded: true,
                  urlVideo: details.urlVideo,
                  docs: details.docs,
                  quizzes: details.quizzes || [],
                  description: details.description,
                  duration: details.duration,
                  title: details.title || ls.title,
                  order: details.order || ls.order,
                };
              }),
            };
          })
        );
      }
    } catch (error) {
      console.error(`Failed to fetch details for lesson ${lessonId}`, error);
    }
  };

  // --- UI HANDLERS ---
  const toggleChapter = (id) => {
    setExpandedChapters((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleLesson = (lessonId, chapterId) => {
    const isExpanding = !expandedLessons[lessonId];
    setExpandedLessons((prev) => ({ ...prev, [lessonId]: isExpanding }));

    if (isExpanding) {
      const chapter = chapters.find((c) => c.id === chapterId);
      const lesson = chapter?.lessons.find((l) => l.id === lessonId);
      if (lesson && !lesson.isDetailsLoaded) {
        fetchLessonDetails(lessonId, chapterId);
      }
    }
  };

  // --- MODAL OPENERS ---
  const openAddChapter = () => {
    setSimpleModal({
      isOpen: true,
      type: "add_chapter",
      title: "Add New Chapter",
      placeholder: "Chapter title...",
      initialValue: "",
    });
  };

  const openEditChapter = (chapter) => {
    setSimpleModal({
      isOpen: true,
      type: "edit_chapter",
      title: "Edit Chapter",
      placeholder: "Chapter title...",
      initialValue: chapter.title,
      targetId: chapter.id,
      extraData: { order: chapter.order },
    });
  };

  const openAddLesson = (chapterId) => {
    setSimpleModal({
      isOpen: true,
      type: "add_lesson",
      title: "Add New Lesson",
      placeholder: "Lesson title...",
      initialValue: "",
      parentId: chapterId,
    });
  };

  const openEditLesson = (lesson, chapterId) => {
    setSimpleModal({
      isOpen: true,
      type: "edit_lesson",
      title: "Edit Lesson",
      placeholder: "Lesson title...",
      initialValue: lesson.title,
      targetId: lesson.id,
      parentId: chapterId,
    });
  };

  const openAddContent = (lessonId) => {
    // ← Tìm chapterId từ lessonId
    let chapterId = null;
    chapters.forEach(ch => {
      if (ch.lessons.some(l => l.id === lessonId)) {
        chapterId = ch.id;
      }
    });

    console.log(`=== OPEN ADD CONTENT ===`);
    console.log(`Lesson ID: ${lessonId}`);
    console.log(`Chapter ID: ${chapterId}`);

    setContentModal({
      isOpen: true,
      type: "add",
      initialData: null,
      chapterId: chapterId,  // ← Tìm được từ lessonId
      lessonId: lessonId,
      contentId: null,
      contentType: null,  // ← null = cho phép chọn tất cả tabs
    });
  };

  const openEditContent = (lessonId, contentType, contentData) => {

    let chapterId = null;
    chapters.forEach(ch => {
      if (ch.lessons.some(l => l.id === lessonId)) {
        chapterId = ch.id;
      }
    });

    console.log(`=== OPEN EDIT CONTENT ===`);
    console.log(`Lesson ID: ${lessonId}`);
    console.log(`Content Type: ${contentType}`);
    console.log(`Content Data:`, contentData);

    setContentModal({
      isOpen: true,
      type: "edit",
      initialData: contentData,  // ← Data của video/doc cần edit
      chapterId: chapterId,
      lessonId: lessonId,
      contentId: contentData?.id || null,
      contentType: contentType,  // ← "video" hoặc "doc" hoặc "quiz"
    });
  };

  const openDeleteContent = (lessonId, contentId) => {
    console.log(`Delete content: ${contentId} from lesson: ${lessonId}`);
    // TODO: Implement delete logic
  };

  // --- DELETE ACTIONS ---
  const deleteChapter = async (id) => {
    if (!window.confirm("Delete this chapter? All lessons inside will be lost.")) return;
    setIsLoading(true);
    try {
      await apiClient.delete(`/chapter/${id}`);
      setChapters(chapters.filter((c) => c.id !== id));
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 500) {
        fetchCourseData();
      } else {
        alert("Error deleting chapter");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- DELETE LESSON ---
  const deleteLesson = async (lessonId) => {  // ← SỬA: Chỉ nhận lessonId
    if (!confirm("Are you sure you want to delete this lesson?")) return;

    try {
      console.log(`Deleting lesson: ${lessonId}`);
      
      // ← API CALL: Delete lesson
      const res = await apiClient.delete(`/lesson/${lessonId}`);
      
      console.log("Delete lesson response:", res);

      if (res.status === 200) {
        console.log("Lesson deleted successfully!");
        
        // ← XÓA lesson khỏi expandedLessons state
        setExpandedLessons((prev) => {
          const updated = { ...prev };
          delete updated[lessonId];
          return updated;
        });
        
        // ← Clear contentModal nếu đang mở content của lesson bị xóa
        if (contentModal.lessonId === lessonId) {
          setContentModal({
            isOpen: false,
            type: null,
            initialData: null,
            chapterId: null,
            lessonId: null,
            contentId: null,
          });
        }
        
        // ← Reload course outline
        fetchCourseData();
        
        alert("Lesson deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting lesson:", error);
      
      if (error.response) {
        console.error("Error Response Status:", error.response.status);
        console.error("Error Response Data:", error.response.data);
        alert(`Failed to delete lesson (${error.response.status}): ${JSON.stringify(error.response.data)}`);
      } else {
        alert("Network error while deleting lesson.");
      }
    }
  };

  const deleteContent = (chapterId, lessonId, contentId) => {
    alert("Delete content feature coming soon.");
  };

  // ==========================================
  // HANDLERS: SAVE SIMPLE MODAL
  // ==========================================
  const handleSaveSimpleModal = async (value) => {
    const { type, targetId, parentId, extraData } = simpleModal;
    setIsLoading(true);

    try {
      // 1. ADD CHAPTER
      if (type === "add_chapter") {
        const newOrder = chapters.length + 1;
        const res = await apiClient.post("/course/add-chapter", {
          courseId: parseInt(courseId),
          title: value,
          order: newOrder,
        });
        if (res.status === 200 || res.status === 201){
          await new Promise(resolve => setTimeout(resolve, 500));
          fetchCourseData();
          alert("Chapter added successfully!");
        }
      }
      
      // 2. EDIT CHAPTER
      else if (type === "edit_chapter") {
        await apiClient.put(`/chapter/${targetId}`, {
          title: value,
          order: extraData?.order || 1,
        });
        fetchCourseData();
      }
      
      // 3. ADD LESSON (Basic Info)
      else if (type === "add_lesson") {
        const currentChapter = chapters.find((c) => c.id === parentId);
        const newOrder = (currentChapter?.lessons?.length || 0) + 1;

        const formData = new FormData();
        formData.append("title", value);
        formData.append("desc", "");
        formData.append("order", newOrder.toString());
        formData.append("preCond", "None");
        formData.append("chapterId", parentId.toString());

        await apiClient.post("/course/add-lesson", formData, {
          headers: { "Content-Type": undefined },
        });
        fetchCourseData();
      }
      
      // 4. EDIT LESSON (Rename)
      else if (type === "edit_lesson") {
        console.log("=== EDIT LESSON ===");
        console.log("LessonID:", targetId);
        const formData = new FormData();
        formData.append("title", value);

        let currentOrder = "1";
        let currentDesc = "";
        
        const chapter = chapters.find((c) => c.id === parentId);
        if (chapter) {
            const lesson = chapter.lessons.find((l) => l.id === targetId);
            if (lesson) {
                if (lesson.order) currentOrder = lesson.order.toString();
                if (lesson.description) currentDesc = lesson.description;
            }
        }
        formData.append("order", currentOrder);
        formData.append("desc", currentDesc);

        const res = await apiClient.put(`/lesson/${targetId}`, formData, {
            headers: { "Content-Type": undefined }
        });

        if (res.status === 200) fetchCourseData();
      }

      setSimpleModal({ ...simpleModal, isOpen: false });
    } catch (error) {
      console.error("Save Simple Modal Error:", error);
      if (error.response) {
        alert(`Failed to save (Error ${error.response.status}): ${JSON.stringify(error.response.data)}`);
      } else {
        alert("Failed to save. Network error.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // HANDLERS: SAVE CONTENT (VIDEO / DOC / QUIZ)
  // ==========================================
  const handleSaveContentModal = async (payload) => {
    const { lessonId } = contentModal;
    const { contentType, data } = payload;
    
    let chapterId = null;
    chapters.forEach(ch => {
        if (ch.lessons.some(l => l.id === lessonId)) {
            chapterId = ch.id;
        }
    });

    console.log("=== SAVE CONTENT ===");
    console.log(`Chapter ID: ${chapterId}`);
    console.log(`Lesson ID: ${lessonId}`);
    console.log(`Content Type: ${contentType}`);

    setIsLoading(true);

    try {
      // --- CASE A: VIDEO hoặc DOC (PUT Lesson) ---
      if (contentType === "video" || contentType === "doc") {
        const formData = new FormData();
        let currentTitle = "Lesson";
        let currentOrder = "1";
        let currentDesc = "";

        const chapter = chapters.find((c) => c.id === chapterId);
        if (chapter) {
             const l = chapter.lessons.find((ls) => ls.id === lessonId);
             if (l) {
                currentTitle = l.title;
                currentOrder = l.order.toString();
                currentDesc = l.description || "";
             }
        }

        formData.append("title", currentTitle);
        formData.append("order", currentOrder);
        formData.append("desc", currentDesc);

        if (contentType === "video") {
          formData.append("videoDTO.title", data.fileName);
          if (data.file) formData.append("videoDTO.video", data.file);
          formData.append("videoDTO.duration", data.duration || "0");
          formData.append("videoDTO.segmentDTOs[0].startAtSeconds", "0");
          formData.append("videoDTO.segmentDTOs[0].endAtSeconds", "10");
          formData.append("videoDTO.segmentDTOs[0].description", "Intro");
        } 
        else if (contentType === "doc") {
          // ← THÊM: ID của doc nếu là EDIT (không phải ADD)
          if (data.id) {
            formData.append("courseMaterialDTOs[0].id", data.id.toString());
          }
          formData.append("courseMaterialDTOs[0].title", data.title || "Document");
          if (data.file) {
            formData.append("courseMaterialDTOs[0].doc", data.file);
          }
        }

        await apiClient.put(`/lesson/${lessonId}`, formData, {
          headers: { "Content-Type": undefined },
        });
        alert(`${contentType} updated successfully!`);
      } 
      
      // --- CASE B: QUIZ (PUT Add Quiz) ---
      else if (contentType === "quiz") {
        const formData = new FormData();
        const { questions, settings } = data;

        console.log("=== QUIZ DATA ===");
        console.log(`Chapter ID: ${chapterId}`);
        console.log(`Lesson ID: ${lessonId}`);
        console.log(`Quiz Title: ${settings.title || "Quiz"}`);
        console.log(`Question Count: ${questions.length}`);
        questions.forEach((q, qIdx) => {
          console.log(`  Question ${qIdx + 1}: "${q.question}" (Score: ${q.score})`);
          q.options.forEach((opt, oIdx) => {
            console.log(`    Option ${oIdx + 1}: "${opt.text}" (Correct: ${opt.isCorrect})`);
          });
        });
        
        // Cần confirm URL này với BE, hiện tại dùng theo giả định sửa ở bước trước
        const ADD_QUIZ_URL = `/lesson/${lessonId}/add-quiz`;

        formData.append("lessonId", lessonId.toString());
        formData.append("title", "Quiz");
        formData.append("desc", "Quiz description");
        formData.append("timeLimitMinutes", settings.timeLimit.toString());
        formData.append("difficultyAvg", settings.difficulty);
        formData.append("score", settings.passScore.toString());
        formData.append("precondition", "None");

        questions.forEach((q, qIdx) => {
          formData.append(`questions[${qIdx}].qText`, q.question);
          if (q.image && q.image instanceof File) {
            formData.append(`questions[${qIdx}].qImage`, q.image);
          }
          formData.append(`questions[${qIdx}].explanation`, "Exp");
          formData.append(`questions[${qIdx}].level`, settings.difficulty);
          formData.append(`questions[${qIdx}].score`, q.score.toString());
          formData.append(`questions[${qIdx}].order`, (qIdx + 1).toString());

          q.options.forEach((opt, oIdx) => {
            formData.append(`questions[${qIdx}].mcqContents[${oIdx}].cText`, opt.text);
            if (opt.image && opt.image instanceof File) {
              formData.append(`questions[${qIdx}].mcqContents[${oIdx}].cImage`, opt.image);
            }
            formData.append(`questions[${qIdx}].mcqContents[${oIdx}].isCorrect`, opt.isCorrect.toString());
          });
        });

        await apiClient.put(ADD_QUIZ_URL, formData, {
          headers: { "Content-Type": undefined },
        });
        alert("Quiz added successfully!");
      }

      fetchCourseData();
      if (chapterId) fetchLessonDetails(lessonId, chapterId);

    } catch (error) {
      console.error("Save Content Error:", error);
      if (error.response) {
        alert(`Failed (Error ${error.response.status}): ${JSON.stringify(error.response.data)}`);
      } else {
        alert("Network Error.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
      <Navbar />

      <div className="pt-[72px] flex-1 flex flex-col">
        {/* TOP BAR */}
        <div className="bg-white border-b border-gray-200 sticky top-[72px] z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button 
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
                onClick={() => navigate(`/teacher/courses`)}
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-xl font-bold text-gray-800">Edit Course</h1>
              {isLoading && <Loader2 className="animate-spin text-[#00b6b6]" />}
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-2 bg-[#00b6b6] text-white rounded-lg font-bold shadow-md hover:bg-[#009e9e] transition">
                Publish
              </button>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 flex gap-8">
            {["curriculum", "info", "settings", "students"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveMainTab(tab)}
                className={`pb-3 text-sm font-bold border-b-2 transition capitalize ${
                  activeMainTab === tab
                    ? "border-[#00b6b6] text-[#00b6b6]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <main className="max-w-5xl mx-auto w-full px-6 py-8 flex-1">
          {activeMainTab === "curriculum" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800">Course Content</h2>
                <button
                  onClick={openAddChapter}
                  className="text-[#00b6b6] font-medium flex items-center gap-1 hover:underline"
                >
                  <Plus size={18} /> Add Chapter
                </button>
              </div>

              <div className="space-y-4">
                {/* COURSE OUTLINE */}
                {chapters.map((chapter, chIdx) => (
                  <ChapterItem
                    key={chapter.id}
                    chapter={chapter}
                    index={chIdx}
                    isExpanded={expandedChapters[chapter.id]}
                    onToggle={toggleChapter}
                    onEdit={openEditChapter}
                    onDelete={deleteChapter}
                    onAddLesson={openAddLesson}
                    expandedLessons={expandedLessons}
                    toggleLesson={toggleLesson}
                    onEditLesson={openEditLesson}
                    onDeleteLesson={deleteLesson}
                    // ← THÊM: 3 hàm xử lý content
                    onAddContent={openAddContent}
                    onEditContent={openEditContent}  // ← MỚI
                    onDeleteContent={openDeleteContent}  // ← MỚI
                  />
                ))}
              </div>
            </div>
          )}

          {activeMainTab !== "curriculum" && (
            <div className="text-center py-20 text-gray-500">
              {activeMainTab} Placeholder
            </div>
          )}
        </main>
      </div>
      <Footer />

      <SimpleModal
        isOpen={simpleModal.isOpen}
        onClose={() => setSimpleModal({ ...simpleModal, isOpen: false })}
        onSave={handleSaveSimpleModal}
        title={simpleModal.title}
        placeholder={simpleModal.placeholder}
        initialValue={simpleModal.initialValue}
      />

      <ContentModal
        isOpen={contentModal.isOpen}
        onClose={() => setContentModal({ ...contentModal, isOpen: false })}
        onSave={handleSaveContentModal}
        initialData={contentModal.initialData}
        contentType={contentModal.contentType}
      />
    </div>
  );
}