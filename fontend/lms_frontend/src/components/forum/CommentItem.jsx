import { useState } from "react";
import { MoreVertical, Edit2, Trash2, Reply, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { formatPostDate } from "../../api/forumApi";
import { convertDriveLink } from "../../api/user/userUtils";

export default function CommentItem({ 
  comment, 
  currentUserId, 
  onEdit, 
  onDelete, 
  onReply,
  onLoadReplies,
  isTeacher = false,
  depth = 0 
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showReplies, setShowReplies] = useState(false);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  
  const canModify = currentUserId === comment.userId || isTeacher;
  const avatarUrl = comment.userAvatar ? convertDriveLink(comment.userAvatar) : null;
  const firstLetter = comment.userName?.charAt(0).toUpperCase() || "?";
  const hasReplies = comment.repliesCount > 0;

  const handleToggleReplies = async () => {
    if (!showReplies && hasReplies && (!comment.replies || comment.replies.length === 0)) {
      setIsLoadingReplies(true);
      await onLoadReplies(comment.id);
      setIsLoadingReplies(false);
    }
    setShowReplies(!showReplies);
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) return;
    
    setIsSubmitting(true);
    await onReply(comment.id, replyContent.trim());
    setReplyContent("");
    setIsReplying(false);
    setIsSubmitting(false);
    setShowReplies(true);
  };

  const handleSubmitEdit = async () => {
    if (!editContent.trim()) return;
    
    setIsSubmitting(true);
    await onEdit(comment.id, editContent.trim());
    setIsEditing(false);
    setIsSubmitting(false);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      onDelete(comment.id);
    }
    setShowMenu(false);
  };

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''}`}>
      <div className="py-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={comment.userName}
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={`w-8 h-8 rounded-full bg-gradient-to-br from-[#00b6b6] to-[#009e9e] flex items-center justify-center text-white font-bold text-sm ${avatarUrl ? 'hidden' : ''}`}
            >
              {firstLetter}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800 text-sm">{comment.userName}</span>
                {comment.isEdited && (
                  <span className="text-xs text-gray-400">(edited)</span>
                )}
              </div>
              <p className="text-xs text-gray-500">{formatPostDate(comment.createdAt)}</p>
            </div>
          </div>

          {/* Actions Menu */}
          {canModify && (
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition"
              >
                <MoreVertical size={16} className="text-gray-500" />
              </button>
              
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 min-w-[100px]">
                    <button 
                      onClick={() => { setIsEditing(true); setShowMenu(false); }}
                      className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button 
                      onClick={handleDelete}
                      className="w-full px-3 py-1.5 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {isEditing ? (
          <div className="mt-2 ml-11">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#00b6b6] focus:border-transparent outline-none resize-none"
              rows={3}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => { setIsEditing(false); setEditContent(comment.content); }}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitEdit}
                disabled={isSubmitting || !editContent.trim()}
                className="px-3 py-1.5 text-sm bg-[#00b6b6] text-white rounded-lg hover:bg-[#009e9e] disabled:opacity-50 flex items-center gap-1"
              >
                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-2 ml-11 text-gray-700 text-sm whitespace-pre-wrap">{comment.content}</p>
        )}

        {/* Actions */}
        {!isEditing && (
          <div className="mt-2 ml-11 flex items-center gap-4">
            {depth === 0 && (
              <button 
                onClick={() => setIsReplying(!isReplying)}
                className="text-xs text-gray-500 hover:text-[#00b6b6] flex items-center gap-1 transition"
              >
                <Reply size={14} /> Reply
              </button>
            )}
            
            {hasReplies && depth === 0 && (
              <button 
                onClick={handleToggleReplies}
                className="text-xs text-[#00b6b6] hover:underline flex items-center gap-1"
              >
                {isLoadingReplies ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : showReplies ? (
                  <><ChevronUp size={14} /> Hide {comment.repliesCount} replies</>
                ) : (
                  <><ChevronDown size={14} /> View {comment.repliesCount} replies</>
                )}
              </button>
            )}
          </div>
        )}

        {/* Reply Input */}
        {isReplying && (
          <div className="mt-3 ml-11">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#00b6b6] focus:border-transparent outline-none resize-none"
              rows={2}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => { setIsReplying(false); setReplyContent(""); }}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReply}
                disabled={isSubmitting || !replyContent.trim()}
                className="px-3 py-1.5 text-sm bg-[#00b6b6] text-white rounded-lg hover:bg-[#009e9e] disabled:opacity-50 flex items-center gap-1"
              >
                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                Reply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Replies */}
      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="mt-1">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              onEdit={onEdit}
              onDelete={onDelete}
              onReply={onReply}
              onLoadReplies={onLoadReplies}
              isTeacher={isTeacher}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
