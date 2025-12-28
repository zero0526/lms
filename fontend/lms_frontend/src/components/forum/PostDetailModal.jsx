import { useState, useEffect } from "react";
import { X, ArrowLeft, Send, Loader2, MessageCircle, Pin } from "lucide-react";
import { formatPostDate, getPostComments, createComment, updateComment, deleteComment, getCommentReplies } from "../../api/forumApi";
import { convertDriveLink } from "../../api/user/userUtils";
import CommentItem from "./CommentItem";

export default function PostDetailModal({ 
  isOpen, 
  onClose, 
  post,
  currentUserId,
  onEdit,
  onDelete,
  isTeacher = false
}) {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (isOpen && post) {
      fetchComments();
    }
  }, [isOpen, post]);

  const fetchComments = async (pageNum = 0) => {
    if (!post) return;
    
    setIsLoading(true);
    try {
      const response = await getPostComments(post.id, pageNum);
      if (response.content) {
        if (pageNum === 0) {
          setComments(response.content);
        } else {
          setComments(prev => [...prev, ...response.content]);
        }
        setHasMore(!response.last);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !post) return;
    
    setIsSubmitting(true);
    try {
      const response = await createComment({
        postId: post.id,
        content: newComment.trim(),
        parentCommentId: null
      });
      
      setComments(prev => [response, ...prev]);
      setNewComment("");
      post.commentsCount = (post.commentsCount || 0) + 1;
    } catch (error) {
      console.error("Error creating comment:", error);
      alert("Failed to post comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (parentCommentId, content) => {
    try {
      const response = await createComment({
        postId: post.id,
        content,
        parentCommentId
      });
      
      // Update replies in the parent comment
      setComments(prev => prev.map(comment => {
        if (comment.id === parentCommentId) {
          return {
            ...comment,
            repliesCount: (comment.repliesCount || 0) + 1,
            replies: [...(comment.replies || []), response]
          };
        }
        return comment;
      }));
      
      post.commentsCount = (post.commentsCount || 0) + 1;
    } catch (error) {
      console.error("Error creating reply:", error);
      alert("Failed to post reply. Please try again.");
    }
  };

  const handleLoadReplies = async (commentId) => {
    try {
      const response = await getCommentReplies(commentId);
      if (response.content) {
        setComments(prev => prev.map(comment => {
          if (comment.id === commentId) {
            return { ...comment, replies: response.content };
          }
          return comment;
        }));
      }
    } catch (error) {
      console.error("Error loading replies:", error);
    }
  };

  const handleEditComment = async (commentId, content) => {
    try {
      const response = await updateComment(commentId, content);
      
      // Update in comments list
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return response;
        }
        // Check in replies
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map(reply => 
              reply.id === commentId ? response : reply
            )
          };
        }
        return comment;
      }));
    } catch (error) {
      console.error("Error updating comment:", error);
      alert("Failed to update comment. Please try again.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      
      // Remove from comments list
      setComments(prev => {
        // Check if it's a top-level comment
        const isTopLevel = prev.some(c => c.id === commentId);
        if (isTopLevel) {
          return prev.filter(c => c.id !== commentId);
        }
        
        // Check in replies
        return prev.map(comment => ({
          ...comment,
          replies: comment.replies?.filter(reply => reply.id !== commentId) || [],
          repliesCount: comment.replies?.some(r => r.id === commentId) 
            ? comment.repliesCount - 1 
            : comment.repliesCount
        }));
      });
      
      post.commentsCount = Math.max((post.commentsCount || 1) - 1, 0);
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment. Please try again.");
    }
  };

  const handleClose = () => {
    setComments([]);
    setNewComment("");
    setPage(0);
    setHasMore(true);
    onClose();
  };

  if (!isOpen || !post) return null;

  const avatarUrl = post.userAvatar ? convertDriveLink(post.userAvatar) : null;
  const firstLetter = post.userName?.charAt(0).toUpperCase() || "?";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition flex items-center gap-2 text-gray-600"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back</span>
          </button>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Post Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 border-b border-gray-100">
            {/* Author Info */}
            <div className="flex items-center gap-3 mb-4">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={post.userName}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className={`w-12 h-12 rounded-full bg-gradient-to-br from-[#00b6b6] to-[#009e9e] flex items-center justify-center text-white font-bold text-lg ${avatarUrl ? 'hidden' : ''}`}
              >
                {firstLetter}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{post.userName}</p>
                <p className="text-sm text-gray-500">{formatPostDate(post.createdAt)}</p>
              </div>
            </div>

            {/* Pinned Badge */}
            {post.isPinned && (
              <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full w-fit mb-3">
                <Pin size={12} /> Pinned
              </div>
            )}

            {/* Post Title & Content */}
            <h2 className="text-xl font-bold text-gray-800 mb-3">{post.title}</h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <MessageCircle size={18} />
                <span>{post.commentsCount} comments</span>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Comments</h3>
            
            {/* Comments List */}
            {isLoading && comments.length === 0 ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-[#00b6b6]" size={32} />
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-1 divide-y divide-gray-100">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    currentUserId={currentUserId}
                    onEdit={handleEditComment}
                    onDelete={handleDeleteComment}
                    onReply={handleReply}
                    onLoadReplies={handleLoadReplies}
                    isTeacher={isTeacher}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle size={40} className="mx-auto mb-2 opacity-50" />
                <p>No comments yet. Be the first to comment!</p>
              </div>
            )}

            {/* Load More */}
            {hasMore && comments.length > 0 && (
              <button
                onClick={() => fetchComments(page + 1)}
                disabled={isLoading}
                className="w-full mt-4 py-2 text-[#00b6b6] hover:bg-teal-50 rounded-lg transition text-sm font-medium"
              >
                {isLoading ? "Loading..." : "Load more comments"}
              </button>
            )}
          </div>
        </div>

        {/* Comment Input */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <div className="flex gap-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00b6b6] focus:border-transparent outline-none resize-none text-sm"
              rows={2}
            />
            <button
              onClick={handleSubmitComment}
              disabled={isSubmitting || !newComment.trim()}
              className="px-4 bg-[#00b6b6] text-white rounded-xl hover:bg-[#009e9e] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
