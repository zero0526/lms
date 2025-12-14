import React from "react";
import { 
  Trash2, Video, FileText, HelpCircle, ChevronDown, ChevronUp, Edit2 
} from "lucide-react";

// --- CONTENT ITEM COMPONENT ---
export const ContentItem = ({ content, onEdit, onDelete }) => {
  const Icon = content.type === 'video' ? Video : content.type === 'doc' ? FileText : HelpCircle;
  const iconColor = content.type === 'video' ? "text-blue-500" : content.type === 'doc' ? "text-yellow-500" : "text-purple-500";

  return (
    <div className="group flex items-center gap-3 pl-4 pr-3 py-2 text-sm text-gray-600 bg-white rounded border border-gray-100 shadow-sm mb-1 hover:shadow-md hover:border-[#00b6b6]/30 transition">
      <Icon size={16} className={iconColor} />
      
      <span className="flex-1 font-medium truncate">{content.title}</span>
      
      {content.type === 'quiz' && (
        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded mr-2">
          {content.data?.settings?.timeLimit || 0} min
        </span>
      )}

      {/* Action Buttons (Visible on Hover) */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => { e.stopPropagation(); onEdit(content); }}
          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded" 
          title="Edit Content"
        >
          <Edit2 size={14} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(content.id); }}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded" 
          title="Delete Content"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

// --- LESSON ITEM COMPONENT ---
export const LessonItem = ({ 
  lesson, index, isExpanded, onToggle, 
  onEdit, onDelete, onAddContent, 
  onEditContent, onDeleteContent 
}) => {
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
          <button 
            onClick={(e) => { e.stopPropagation(); onAddContent(lesson.id); }} 
            className="text-xs bg-[#00b6b6] text-white px-2 py-1 rounded hover:bg-[#009e9e] font-medium"
          >
            + Content
          </button>
          
          <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>

          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(lesson); }}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
            title="Edit Lesson Title"
          >
            <Edit2 size={14} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(lesson.id); }}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
            title="Delete Lesson"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="border-t border-gray-100 p-2 bg-gray-50/50 space-y-1 pl-8">
          {lesson.contents.length === 0 && <p className="text-xs text-gray-400 py-2">No content yet.</p>}
          {lesson.contents.map(content => (
            <ContentItem 
              key={content.id} 
              content={content} 
              onEdit={(c) => onEditContent(lesson.id, c)}
              onDelete={(cid) => onDeleteContent(lesson.id, cid)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// --- CHAPTER ITEM COMPONENT ---
export const ChapterItem = ({ 
  chapter, index, isExpanded, onToggle, 
  onEdit, onDelete, onAddLesson, 
  // Lesson props passthrough
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
          <button 
            onClick={(e) => {e.stopPropagation(); onAddLesson(chapter.id)}} 
            className="text-sm bg-white border border-gray-300 px-3 py-1.5 rounded-md hover:border-[#00b6b6] hover:text-[#00b6b6] transition shadow-sm font-medium"
          >
            + Lesson
          </button>
          
          <div className="w-[1px] h-5 bg-gray-300"></div>

          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(chapter); }}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
            title="Edit Chapter Title"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(chapter.id); }}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition"
            title="Delete Chapter"
          >
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
              onToggle={toggleLesson}
              onEdit={onEditLesson}
              onDelete={(lid) => onDeleteLesson(chapter.id, lid)}
              onAddContent={onAddContent}
              onEditContent={(lid, c) => onEditContent(chapter.id, lid, c)}
              onDeleteContent={(lid, cid) => onDeleteContent(chapter.id, lid, cid)}
            />
          ))}
        </div>
      )}
    </div>
  );
};