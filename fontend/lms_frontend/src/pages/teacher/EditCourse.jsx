import React, { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SimpleModal from "../../components/teachers/SimpleModal";
import ContentModal from "../../components/teachers/ContentModal";
import { ChapterItem } from "../../components/teachers/CourseListComponents";

export default function EditCourse() {
  const [activeMainTab, setActiveMainTab] = useState("curriculum"); 
  
  // --- STATE DỮ LIỆU ---
  const [chapters, setChapters] = useState([
    { id: 1, title: "Introduction", lessons: [] }
  ]);

  // --- STATE QUẢN LÝ UI (Expand/Collapse) ---
  const [expandedChapters, setExpandedChapters] = useState({ 1: true });
  const [expandedLessons, setExpandedLessons] = useState({});

  // --- STATE QUẢN LÝ MODAL ---
  // Modal cho tên (Chapter/Lesson)
  const [simpleModal, setSimpleModal] = useState({ 
    isOpen: false, 
    type: null, // 'add_chapter' | 'edit_chapter' | 'add_lesson' | 'edit_lesson'
    title: "", 
    placeholder: "",
    initialValue: "",
    targetId: null,
    parentId: null // Dùng cho lesson để biết thuộc chapter nào
  });

  // Modal cho Content
  const [contentModal, setContentModal] = useState({
    isOpen: false,
    type: null, // 'add' | 'edit'
    initialData: null,
    chapterId: null,
    lessonId: null,
    contentId: null
  });

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
    setSimpleModal({ isOpen: true, type: 'edit_chapter', title: "Edit Chapter Title", placeholder: "Enter chapter title...", initialValue: chapter.title, targetId: chapter.id });
  };

  const deleteChapter = (id) => {
    if (window.confirm("Are you sure? This will delete all lessons inside.")) {
      setChapters(chapters.filter(c => c.id !== id));
    }
  };

  // ==========================================
  // LOGIC: LESSONS
  // ==========================================
  const openAddLesson = (chapterId) => {
    setSimpleModal({ isOpen: true, type: 'add_lesson', title: "Add New Lesson", placeholder: "Enter lesson title...", initialValue: "", parentId: chapterId });
  };

  const openEditLesson = (lesson, chapterId) => {
    setSimpleModal({ isOpen: true, type: 'edit_lesson', title: "Edit Lesson Title", placeholder: "Enter lesson title...", initialValue: lesson.title, targetId: lesson.id, parentId: chapterId });
  };

  const deleteLesson = (chapterId, lessonId) => {
    if (window.confirm("Delete this lesson and its content?")) {
      setChapters(chapters.map(ch => 
        ch.id === chapterId ? { ...ch, lessons: ch.lessons.filter(l => l.id !== lessonId) } : ch
      ));
    }
  };

  // ==========================================
  // LOGIC: CONTENT (Video/Docs/Quiz)
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
  
  // Xử lý lưu từ SimpleModal (Chapter/Lesson)
  const handleSaveSimpleModal = (value) => {
    const { type, targetId, parentId } = simpleModal;

    if (type === 'add_chapter') {
      const newChapter = { id: Date.now(), title: value, lessons: [] };
      setChapters([...chapters, newChapter]);
      setExpandedChapters(prev => ({...prev, [newChapter.id]: true}));
    } 
    else if (type === 'edit_chapter') {
      setChapters(chapters.map(c => c.id === targetId ? { ...c, title: value } : c));
    } 
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
  };

  // Xử lý lưu từ ContentModal
  const handleSaveContentModal = (contentPayload) => {
    const { type, chapterId, lessonId, contentId } = contentModal;

    setChapters(chapters.map(ch => {
      if (ch.id !== chapterId) return ch;
      return {
        ...ch,
        lessons: ch.lessons.map(ls => {
          if (ls.id !== lessonId) return ls;
          
          if (type === 'add') {
            // Thêm mới
            return { ...ls, contents: [...ls.contents, { id: Date.now(), ...contentPayload }] };
          } else {
            // Sửa cũ
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
                    // Lesson Props passing down
                    expandedLessons={expandedLessons}
                    toggleLesson={toggleLesson}
                    onEditLesson={(lesson) => openEditLesson(lesson, chapter.id)}
                    onDeleteLesson={deleteLesson}
                    // Content Props passing down
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
      
      <ContentModal 
        isOpen={contentModal.isOpen} 
        onClose={() => setContentModal({...contentModal, isOpen: false})} 
        onSave={handleSaveContentModal}
        initialData={contentModal.initialData}
      />
    </div>
  );
}