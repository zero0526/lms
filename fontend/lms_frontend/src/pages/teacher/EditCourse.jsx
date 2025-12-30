import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Plus, Loader2 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SimpleModal from "../../components/teachers/SimpleModal";
import ContentModal from "../../components/teachers/ContentModal";
import { ChapterItem } from "../../components/teachers/CourseListComponents";

// Api functions
import { fetchCourseOutline, addChapter, publishCourse } from "../../api/teacher/courseApi";
import { deleteChapter as deleteChapterApi, updateChapter } from "../../api/teacher/chapterApi";
import { 
  fetchLessonDetails, 
  addLesson, 
  updateLesson, 
  deleteLesson as deleteLessonApi,
  updateLessonVideo,
  updateLessonDoc
} from "../../api/teacher/lessonApi";
import { fetchQuizDetails, addQuiz, updateQuiz } from "../../api/teacher/quizApi";

export default function EditCourse() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [activeMainTab, setActiveMainTab] = useState("curriculum");
  const [isLoading, setIsLoading] = useState(false);

  // --- STATE DỮ LIỆU ---
  const [chapters, setChapters] = useState([]);
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
      const rawChapters = await fetchCourseOutline(userId, courseId);

      // ← CẬP NHẬT CHAPTERS VỚI CURRENT STATE
      setChapters((prevChapters) => {
        return rawChapters.map((ch) => {
          const oldChapter = prevChapters.find(oldCh => oldCh.id === ch.chapterId);
          
          return {
            id: ch.chapterId,
            title: ch.title,
            order: ch.order,
            lessons: (ch.lessons || []).map((ls) => {
              const oldLesson = oldChapter?.lessons.find(oldL => oldL.id === ls.lessonId);
              
              return {
                id: ls.lessonId,
                title: ls.title,
                order: ls.order,
                duration: ls.duration,
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
    } catch (error) {
      console.error("Error fetching course:", error);
    }
  }, [courseId]);

  // AUTO-FETCH LESSON DETAILS when expanded
  useEffect(() => {
    if (chapters.length === 0) return;

    Object.keys(expandedLessons).forEach((lessonIdStr) => {
      const lessonId = parseInt(lessonIdStr);
      const isExpanded = expandedLessons[lessonId];

      if (isExpanded) {
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
          handleFetchLessonDetails(lessonId, chapterId);
        }
      }
    });
  }, [chapters, expandedLessons]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  // --- FETCH LESSON DETAILS ---
  const handleFetchLessonDetails = async (lessonId, chapterId) => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const details = await fetchLessonDetails(userId, lessonId);

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
        handleFetchLessonDetails(lessonId, chapterId);
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
    let chapterId = null;
    chapters.forEach(ch => {
      if (ch.lessons.some(l => l.id === lessonId)) {
        chapterId = ch.id;
      }
    });

    setContentModal({
      isOpen: true,
      type: "add",
      initialData: null,
      chapterId: chapterId,
      lessonId: lessonId,
      contentId: null,
      contentType: null,
    });
  };

  const openEditContent = async (lessonId, contentType, contentData) => {
    let chapterId = null;
    chapters.forEach(ch => {
      if (ch.lessons.some(l => l.id === lessonId)) {
        chapterId = ch.id;
      }
    });

    if (contentType === "quiz") {
      setIsLoading(true);
      try {
        const quizDetails = await fetchQuizDetails(contentData.quizId);
        setIsLoading(false);
        
        if (!quizDetails) {
          alert("Failed to load quiz details");
          return;
        }
        
        setContentModal({
          isOpen: true,
          type: "edit",
          initialData: quizDetails,
          chapterId: chapterId,
          lessonId: lessonId,
          contentId: contentData.quizId,
          contentType: "quiz",
        });
      } catch (error) {
        setIsLoading(false);
        alert("Failed to load quiz details");
      }
    } else {
      setContentModal({
        isOpen: true,
        type: "edit",
        initialData: contentData,
        chapterId: chapterId,
        lessonId: lessonId,
        contentId: contentData?.id || null,
        contentType: contentType,
      });
    }
  };

  const openDeleteContent = (lessonId, contentId) => {
    console.log(`Delete content: ${contentId} from lesson: ${lessonId}`);
    // TODO: Implement delete logic
  };

  // --- DELETE ACTIONS ---
  const handleDeleteChapter = async (id) => {
    if (!window.confirm("Delete this chapter? All lessons inside will be lost.")) return;
    setIsLoading(true);
    try {
      await deleteChapterApi(id);
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

  const handleDeleteLesson = async (lessonId) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;

    try {
      await deleteLessonApi(lessonId);
      
      setExpandedLessons((prev) => {
        const updated = { ...prev };
        delete updated[lessonId];
        return updated;
      });
      
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
      
      fetchCourseData();
      alert("Lesson deleted successfully!");
    } catch (error) {
      console.error("Error deleting lesson:", error);
      if (error.response) {
        alert(`Failed to delete lesson (${error.response.status}): ${JSON.stringify(error.response.data)}`);
      } else {
        alert("Network error while deleting lesson.");
      }
    }
  };

  // --- SAVE SIMPLE MODAL ---
  const handleSaveSimpleModal = async (value) => {
    const { type, targetId, parentId, extraData } = simpleModal;
    setIsLoading(true);

    try {
      if (type === "add_chapter") {
        const newOrder = chapters.length + 1;
        const res = await addChapter(parseInt(courseId), value, newOrder);
        if (res) {
          await new Promise(resolve => setTimeout(resolve, 500));
          fetchCourseData();
          // alert("Chapter added successfully!");
        }
      }
      else if (type === "edit_chapter") {
        await updateChapter(targetId, value, extraData?.order || 1);
        fetchCourseData();
      }
      else if (type === "add_lesson") {
        const currentChapter = chapters.find((c) => c.id === parentId);
        const newOrder = (currentChapter?.lessons?.length || 0) + 1;
        await addLesson(parentId, value, newOrder);
        fetchCourseData();
      }
      else if (type === "edit_lesson") {
        const chapter = chapters.find((c) => c.id === parentId);
        const lesson = chapter?.lessons.find((l) => l.id === targetId);
        const currentOrder = lesson?.order || 1;
        const currentDesc = lesson?.description || "";
        
        await updateLesson(targetId, value, currentOrder, currentDesc);
        fetchCourseData();
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

  // --- SAVE CONTENT MODAL ---
  const handleSaveContentModal = async (payload) => {
    const { lessonId, chapterId } = contentModal;
    const { contentType, data } = payload;

    setIsLoading(true);

    try {
      const chapter = chapters.find((c) => c.id === chapterId);
      const lesson = chapter?.lessons.find((ls) => ls.id === lessonId);
      
      const currentTitle = lesson?.title || "Lesson";
      const currentOrder = lesson?.order || 1;
      const currentDesc = lesson?.description || "";

      if (contentType === "video") {
        await updateLessonVideo(lessonId, data, currentTitle, currentOrder, currentDesc);
        // alert("Video updated successfully!");
      } 
      else if (contentType === "doc") {
        await updateLessonDoc(lessonId, data, currentTitle, currentOrder, currentDesc);
        // alert("Document updated successfully!");
      }
      else if (contentType === "quiz") {
        const isEditMode = !!contentModal.initialData?.id;
        
        if (isEditMode) {
          const quizId = contentModal.initialData.id;
          await updateQuiz(quizId, data);
          // alert("Quiz updated successfully!");
        } else {
          await addQuiz(lessonId, data);
          // alert("Quiz added successfully!");
        }
      }

      fetchCourseData();
      if (chapterId) {
        await new Promise(resolve => setTimeout(resolve, 300));
        handleFetchLessonDetails(lessonId, chapterId);
      }

    } catch (error) {
      console.error("Save Content Error:", error);
      if (error.response) {
        alert(`Failed (Error ${error.response.status}): ${JSON.stringify(error.response.data)}`);
      } else {
        alert("Network Error.");
      }
    } finally {
      setIsLoading(false);
      setContentModal({ ...contentModal, isOpen: false });
    }
  };

  // Publish Course Handler
  const handlePublishCourse = async () => {
    if (!window.confirm("Are you sure you want to publish this course?")){
      return;
    }

    setIsLoading(true);
    try {
      await publishCourse(courseId);
      alert("Course published successfully!");
      navigate(`/teacher/courses`);
    } catch (error) {
      console.error("Error publishing course:", error);
      alert("Failed to publish course.");
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
              <button
                onClick={handlePublishCourse}
                disabled={isLoading}
                className="px-6 py-2 bg-[#00b6b6] text-white rounded-lg font-bold shadow-md hover:bg-[#009e9e] transition">
                Publish
              </button>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 flex gap-8">
            {["curriculum"].map((tab) => (
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
                {chapters.map((chapter, chIdx) => (
                  <ChapterItem
                    key={chapter.id}
                    chapter={chapter}
                    index={chIdx}
                    isExpanded={expandedChapters[chapter.id]}
                    onToggle={toggleChapter}
                    onEdit={openEditChapter}
                    onDelete={handleDeleteChapter}
                    onAddLesson={openAddLesson}
                    expandedLessons={expandedLessons}
                    toggleLesson={toggleLesson}
                    onEditLesson={openEditLesson}
                    onDeleteLesson={handleDeleteLesson}
                    onAddContent={openAddContent}
                    onEditContent={openEditContent}
                    onDeleteContent={openDeleteContent}
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