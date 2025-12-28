import { useState } from "react";
import { MessageCircle, MoreVertical, Edit2, Trash2, Pin } from "lucide-react";
import { formatPostDate } from "../../api/forumApi";
import { convertDriveLink } from "../../api/user/userUtils";

export default function PostCard({ 
  post, 
  currentUserId, 
  onEdit, 
  onDelete, 
  onClick,
  isTeacher = false 
}) {
  const [showMenu, setShowMenu] = useState(false);
  
  const canModify = currentUserId === post.userId || isTeacher;
  const avatarUrl = post.userAvatar ? convertDriveLink(post.userAvatar) : null;
  const firstLetter = post.userName?.charAt(0).toUpperCase() || "?";

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit(post);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    if (window.confirm("Are you sure you want to delete this post?")) {
      onDelete(post.id);
    }
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition cursor-pointer relative"
      onClick={() => onClick(post)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={post.userName}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className={`w-10 h-10 rounded-full bg-gradient-to-br from-[#00b6b6] to-[#009e9e] flex items-center justify-center text-white font-bold ${avatarUrl ? 'hidden' : ''}`}
          >
            {firstLetter}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{post.userName}</p>
            <p className="text-xs text-gray-500">{formatPostDate(post.createdAt)}</p>
          </div>
        </div>

        {/* Actions Menu */}
        {canModify && (
          <div className="relative">
            <button 
              onClick={handleMenuClick}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <MoreVertical size={18} className="text-gray-500" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                <button 
                  onClick={handleEdit}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button 
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pinned Badge */}
      {post.isPinned && (
        <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full w-fit mb-2">
          <Pin size={12} /> Pinned
        </div>
      )}

      {/* Content */}
      <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">{post.title}</h3>
      <p className="text-gray-600 text-sm line-clamp-3 whitespace-pre-wrap">{post.content}</p>

      {/* Footer */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1 text-gray-500 text-sm">
          <MessageCircle size={16} />
          <span>{post.commentsCount} comments</span>
        </div>
      </div>

      {/* Close menu when clicking outside */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(false);
          }}
        />
      )}
    </div>
  );
}
