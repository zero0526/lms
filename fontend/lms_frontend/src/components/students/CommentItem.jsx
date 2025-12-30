import React, { useState } from "react";
import { MoreVertical, Send, ChevronDown, ChevronUp, Edit2, Trash2 } from "lucide-react";
import { convertDriveLink } from "../../api/user/userUtils";
import { getCommentReplies } from "../../api/student/commentApi";

export default function CommentItem({ 
  comment, 
  onReply, 
  onEdit, 
  onDelete, 
  currentUserId,
  currentUserName,
  currentUserAvatar,
  level = 0 
}) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  
  // State để lưu replies
  const [replies, setReplies] = useState([]);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [repliesError, setRepliesError] = useState(null);

  const isOwner = currentUserId === comment.userId;
  const hasReplies = comment.numOfChild > 0;

  // Fetch replies khi click "See replies"
  const handleToggleReplies = async () => {
    if (!showReplies && replies.length === 0) {
      // Chưa load replies, cần fetch
      setIsLoadingReplies(true);
      setRepliesError(null);
      
      try {
        const response = await getCommentReplies(comment.id);
        
        // Transform data
        const transformedReplies = (response.data || []).map(reply => ({
          id: reply.commentId,
          userId: reply.userId,
          userName: reply.userName,
          userAvatar: reply.avatar,
          content: reply.content,
          createdAt: reply.lastEdited,
          isEdited: reply.isEdited,
          numOfChild: reply.numOfChild
        }));
        setReplies(transformedReplies);
        setShowReplies(true);
      } catch (error) {
        console.error("Failed to load replies:", error);
        setRepliesError("Failed to load replies");
      } finally {
        setIsLoadingReplies(false);
      }
    } else {
      // Đã có replies, chỉ toggle
      setShowReplies(!showReplies);
    }
  };

  const handleReplySubmit = () => {
    if (replyContent.trim()) {
      onReply(comment.id, replyContent);
      setReplyContent("");
      setShowReplyBox(false);
      
      // Sau khi reply, reload replies để hiển thị comment mới
      setReplies([]);
      setShowReplies(false);
      // Hoặc có thể tự động mở replies
      setTimeout(() => {
        handleToggleReplies();
      }, 500);
    }
  };

  const handleEditSubmit = () => {
    if (editContent.trim() && editContent !== comment.content) {
      onEdit(comment.id, editContent);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp || !Array.isArray(timestamp)) return "just now";
    
    try {
      const [year, month, day, hour, minute, second] = timestamp;
      const commentTime = new Date(year, month - 1, day, hour, minute, second);
      const now = new Date();
      const diffInMinutes = Math.floor((now - commentTime) / (1000 * 60));
      
      if (diffInMinutes < 1) return "just now";
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    } catch (e) {
      return "just now";
    }
  };

  return (
    <div className={`${level > 0 ? "ml-12 border-l-2 border-gray-100 pl-4" : ""}`}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        {comment.userAvatar ? (
          <img
            src={convertDriveLink(comment.userAvatar)}
            alt={comment.userName}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#00b6b6] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {comment.userName ? comment.userName.charAt(0).toUpperCase() : "U"}
          </div>
        )}

        <div className="flex-1">
          {/* Comment Header */}
          <div className="bg-gray-50 rounded-2xl px-4 py-3 relative">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-gray-800">{comment.userName}</p>
                {comment.isEdited && (
                  <span className="text-xs text-gray-400 italic">(edited)</span>
                )}
              </div>
              
              {/* Menu Button (only for owner) */}
              {isOwner && !isEditing && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1 hover:bg-gray-200 rounded-full transition"
                  >
                    <MoreVertical size={16} className="text-gray-500"/>
                  </button>

                  {showMenu && (
                    <div className="absolute right-0 top-6 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                      >
                        <Edit2 size={14}/>
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this comment?")) {
                            onDelete(comment.id);
                          }
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
                      >
                        <Trash2 size={14}/>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Comment Content */}
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00b6b6] outline-none resize-none text-sm"
                  rows="2"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleEditSubmit}
                    className="px-3 py-1 bg-[#00b6b6] text-white rounded-lg text-xs font-semibold hover:bg-[#009e9e] transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-700">{comment.content}</p>
            )}
          </div>

          {/* Comment Actions */}
          {!isEditing && (
            <div className="flex items-center gap-4 mt-2 px-2">
              <span className="text-xs text-gray-400">{formatTimeAgo(comment.createdAt)}</span>
              <button
                onClick={() => setShowReplyBox(!showReplyBox)}
                className="text-xs font-bold text-gray-600 hover:text-[#00b6b6] transition"
              >
                Reply
              </button>
              
              {/* See replies button */}
              {hasReplies && (
                <button
                  onClick={handleToggleReplies}
                  disabled={isLoadingReplies}
                  className="text-xs font-bold text-[#00b6b6] hover:text-[#009e9e] transition flex items-center gap-1 disabled:opacity-50"
                >
                  {isLoadingReplies ? (
                    <>
                      <div className="w-3 h-3 border-2 border-[#00b6b6] border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </>
                  ) : showReplies ? (
                    <>
                      <ChevronUp size={14}/>
                      Hide {comment.numOfChild} {comment.numOfChild === 1 ? "reply" : "replies"}
                    </>
                  ) : (
                    <>
                      <ChevronDown size={14}/>
                      See {comment.numOfChild} {comment.numOfChild === 1 ? "reply" : "replies"}
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Error loading replies */}
          {repliesError && (
            <div className="mt-2 px-2 text-xs text-red-500">
              {repliesError}
            </div>
          )}

          {/* Reply Input Box */}
          {showReplyBox && (
            <div className="mt-3 flex items-start gap-2">
              {currentUserAvatar ? (
                <img
                  src={convertDriveLink(currentUserAvatar)}
                  alt="You"
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#00b6b6] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  {currentUserName ? currentUserName.charAt(0).toUpperCase() : "U"}
                </div>
              )}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleReplySubmit()}
                  placeholder={`Reply to ${comment.userName}...`}
                  className="w-full pl-4 pr-10 py-2 bg-gray-50 rounded-full border border-gray-200 focus:ring-2 focus:ring-[#00b6b6] focus:border-transparent outline-none text-sm"
                  autoFocus
                />
                <button
                  onClick={handleReplySubmit}
                  disabled={!replyContent.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#00b6b6] text-white rounded-full hover:bg-[#009e9e] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={14}/>
                </button>
              </div>
            </div>
          )}

          {/* Render Replies */}
          {showReplies && replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  currentUserId={currentUserId}
                  currentUserName={currentUserName}
                  currentUserAvatar={currentUserAvatar}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}