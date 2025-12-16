import React from "react";
import { 
  Trash2, Video, FileText, HelpCircle, ChevronDown, ChevronUp, Edit2, PlayCircle, File
} from "lucide-react";

// --- SUB-COMPONENTS FOR CONTENT TYPES ---

const ContentRow = ({ icon: Icon, color, title, subtitle, onEdit, onDelete, isEditable = true }) => (
  <div className="group flex items-center gap-3 pl-4 pr-3 py-2.5 text-sm text-gray-700 bg-white rounded-md border border-gray-100 shadow-sm mb-2 hover:shadow-md hover:border-[#00b6b6]/30 transition">
    <div className={`p-1.5 rounded-full bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
        <Icon size={16} className={color} />
    </div>
    
    <div className="flex-1 flex flex-col">
        <span className="font-medium truncate">{title}</span>
        {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
    </div>

    {isEditable && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded" title="Edit">
            <Edit2 size={14} />
        </button>
        <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded" title="Delete">
            <Trash2 size={14} />
        </button>
        </div>
    )}
  </div>
);

// --- MAIN COMPONENTS ---

export const LessonItem = ({ 
  lesson, index, isExpanded, onToggle, 
  onEdit, onDelete, 
  // Các prop xử lý content
  onAddContent, onEditContent, onDeleteContent 
}) => {
  
  // Helpers để parse dữ liệu
  const hasVideo = !!lesson.urlVideo;
  const hasDoc = !!lesson.docs; // Giả sử docs là string URL hoặc object
  const quizzes = lesson.quizzes || [];

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden group">
      <div 
        className="p-3 flex justify-between items-center cursor-pointer hover:bg-teal-50 transition" 
        onClick={() => onToggle(lesson.id)}
      >
        <div className="flex items-center gap-2 font-medium text-gray-700">
          <FileText size={16} className="text-gray-400" />
          <span>Lesson {index + 1}: {lesson.title}</span>
          {isExpanded ? <ChevronUp size={14} className="text-gray-400"/> : <ChevronDown size={14} className="text-gray-400"/>}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Nút + Content: Chỉ hiện nếu chưa đủ content, hoặc logic tùy ý */}
          <button 
            onClick={(e) => { e.stopPropagation(); onAddContent(lesson.id); }} 
            className="text-xs bg-[#00b6b6] text-white px-2 py-1 rounded hover:bg-[#009e9e] font-medium hidden group-hover:block"
          >
            + Add More
          </button>
          
          <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>

          <button onClick={(e) => { e.stopPropagation(); onEdit(lesson); }} className="p-1.5 text-gray-400 hover:text-blue-600 rounded">
            <Edit2 size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(lesson.id); }} className="p-1.5 text-gray-400 hover:text-red-600 rounded">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="border-t border-gray-100 p-3 bg-gray-50/50 space-y-2 pl-8">
          
          {/* Loading State */}
          {!lesson.isDetailsLoaded && (
             <div className="text-xs text-gray-400 italic py-1">Loading details...</div>
          )}

          {/* 1. VIDEO */}
          {hasVideo && (
            <ContentRow 
                icon={PlayCircle} 
                color="black"
                title="Lesson Video"
                subtitle={lesson.urlVideo}
                onEdit={(e) => { e.stopPropagation(); alert('Edit Video feature coming soon'); }}
                onDelete={(e) => { e.stopPropagation(); onDeleteContent(lesson.id, 'video'); }}
            />
          )}

          {/* 2. DOCUMENT */}
          {hasDoc && (
            <ContentRow 
                icon={File} 
                color="text-yellow-500"
                title="Lesson Document"
                subtitle={typeof lesson.docs === 'string' ? lesson.docs : "Document attached"}
                onEdit={(e) => { e.stopPropagation(); alert('Edit Doc feature coming soon'); }}
                onDelete={(e) => { e.stopPropagation(); onDeleteContent(lesson.id, 'doc'); }}
            />
          )}

          {/* 3. QUIZZES */}
          {quizzes.map((quiz, idx) => (
            <ContentRow 
                key={quiz.quizId || idx}
                icon={HelpCircle} 
                color="text-purple-500"
                title={quiz.titleQuiz || `Quiz ${idx + 1}`}
                subtitle={`${quiz.numOfQuestion} Questions • ${quiz.timeLimit} mins • ${quiz.level}`}
                onEdit={(e) => { e.stopPropagation(); alert('Edit Quiz feature coming soon'); }}
                onDelete={(e) => { e.stopPropagation(); onDeleteContent(lesson.id, quiz.quizId); }}
            />
          ))}

          {/* Empty State */}
          {lesson.isDetailsLoaded && !hasVideo && !hasDoc && quizzes.length === 0 && (
            <p className="text-xs text-gray-400 italic">No content content added yet.</p>
          )}

        </div>
      )}
    </div>
  );
};

export const ChapterItem = ({ 
  chapter, index, isExpanded, onToggle, 
  onEdit, onDelete, onAddLesson, 
  expandedLessons, toggleLesson,
  onEditLesson, onDeleteLesson,
  onAddContent, onEditContent, onDeleteContent
}) => {
  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm mb-4">
      <div 
        className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer border-b border-gray-100 group hover:bg-gray-100 transition" 
        onClick={() => onToggle(chapter.id)}
      >
        <div className="flex items-center gap-3 font-bold text-gray-700">
          {isExpanded ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
          Chapter {index + 1}: {chapter.title}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={(e) => {e.stopPropagation(); onAddLesson(chapter.id)}} className="text-sm bg-white border border-gray-300 px-3 py-1.5 rounded-md hover:border-[#00b6b6] hover:text-[#00b6b6] transition shadow-sm font-medium">
            + Lesson
          </button>
          <div className="w-[1px] h-5 bg-gray-300"></div>
          <button onClick={(e) => { e.stopPropagation(); onEdit(chapter); }} className="p-2 text-gray-500 hover:text-blue-600 rounded-full">
            <Edit2 size={16} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(chapter.id); }} className="p-2 text-gray-500 hover:text-red-600 rounded-full">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-3 bg-white">
          {chapter.lessons.length === 0 && <p className="text-gray-400 text-sm italic text-center py-4">No lessons in this chapter yet.</p>}
          {chapter.lessons.map((lesson, lIndex) => (
            <LessonItem 
              key={lesson.id}
              index={lIndex}
              lesson={lesson}
              isExpanded={expandedLessons[lesson.id]}
              onToggle={(lessonId) => toggleLesson(lessonId)} // Pass ID lên trên
              onEdit={onEditLesson}
              onDelete={(lid) => onDeleteLesson(lid)}
              onAddContent={onAddContent}
              onEditContent={onEditContent}
              onDeleteContent={onDeleteContent}
            />
          ))}
        </div>
      )}
    </div>
  );
};