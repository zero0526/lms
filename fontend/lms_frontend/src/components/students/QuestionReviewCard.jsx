import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, TrendingUp, AlertCircle, MessageCircle, ChevronDown, ChevronUp, Send } from "lucide-react";
import { convertDriveLink } from "../../api/user/userUtils";
import { postQuestionComment, fetchQuestionComments, editQuestionComment, deleteQuestionComment } from "../../api/student/commentApi";
import { useUser } from "../../contexts/UserContext";
import CommentItem from "./CommentItem";

export default function QuestionReviewCard({ question, questionNumber }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [commentCount, setCommentCount] = useState(0); // Track comment count
  const { user } = useUser();

  const selectedChoices = question.choices.filter(c => c.isSelected);
  const correctChoices = question.choices.filter(c => c.isCorrect);
  const isFullyCorrect = selectedChoices.every(c => c.isCorrect) && 
                        selectedChoices.length === correctChoices.length &&
                        selectedChoices.length > 0;

  // Reset state khi chuyển câu hỏi
  useEffect(() => {
    setShowComments(false);
    setComments([]);
    setNewComment("");
    setCommentCount(0);
    
    // Fetch comments count ngay khi component mount
    loadCommentsCount();
  }, [question.qId]);

  // Load comments count only (lightweight)
  const loadCommentsCount = async () => {
    try {
      const fetchedComments = await fetchQuestionComments(question.qId);
      setCommentCount(fetchedComments.length);
    } catch (error) {
      console.error("Failed to load comments count:", error);
      setCommentCount(0);
    }
  };

  // Load full comments when dropdown is opened
  const loadComments = async () => {
    if (comments.length > 0) return; // Already loaded
    
    try {
      setIsLoadingComments(true);
      const fetchedComments = await fetchQuestionComments(question.qId);
      setComments(fetchedComments);
      setCommentCount(fetchedComments.length);
    } catch (error) {
      console.error("Failed to load comments:", error);
      setComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  };

  // Fetch comments when dropdown opens
  useEffect(() => {
    if (showComments) {
      loadComments();
    }
  }, [showComments]);

  const handlePostComment = async () => {
    if (!newComment.trim()) {
      alert("Please enter a comment");
      return;
    }
    
    if (!user?.userId) {
      console.error("User object:", user);
      alert("You must be logged in to comment");
      return;
    }

    try {
      setIsPosting(true);
      
      await postQuestionComment(user.userId, question.qId, newComment, null);
      setNewComment("");
      
      // Reload comments and update count
      const updatedComments = await fetchQuestionComments(question.qId);
      setComments(updatedComments);
      setCommentCount(updatedComments.length);
    } catch (error) {
      console.error("Failed to post comment:", error);
      alert(`Failed to post comment: ${error.message}`);
    } finally {
      setIsPosting(false);
    }
  };

  const handleReply = async (parentCommentId, content) => {
    if (!user?.userId) {
      alert("You must be logged in to reply");
      return;
    }

    try {
      await postQuestionComment(user.userId, question.qId, content, parentCommentId);
      
      // Reload comments and update count
      const updatedComments = await fetchQuestionComments(question.qId);
      setComments(updatedComments);
      setCommentCount(updatedComments.length);
    } catch (error) {
      console.error("Failed to post reply:", error);
      alert(`Failed to post reply: ${error.message}`);
    }
  };

  const handleEdit = async (commentId, content) => {
    if (!user?.userId) {
      alert("You must be logged in to edit");
      return;
    }

    try {
      await editQuestionComment(commentId, user.userId, content);
      
      // Reload comments (count stays same)
      const updatedComments = await fetchQuestionComments(question.qId);
      setComments(updatedComments);
    } catch (error) {
      console.error("Failed to edit comment:", error);
      alert(`Failed to edit comment: ${error.message}`);
    }
  };

  const handleDelete = async (commentId) => {
    if (!user?.userId) {
      alert("You must be logged in to delete");
      return;
    }

    try {
      await deleteQuestionComment(commentId, user.userId);
      
      // Reload comments and update count
      const updatedComments = await fetchQuestionComments(question.qId);
      setComments(updatedComments);
      setCommentCount(updatedComments.length);
    } catch (error) {
      console.error("Failed to delete comment:", error);
      alert(`Failed to delete comment: ${error.message}`);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      
      {/* Question Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="bg-gray-100 text-gray-700 text-sm font-bold px-3 py-1 rounded-full">
            Q{questionNumber}
          </span>
          {isFullyCorrect ? (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle size={20} strokeWidth={2.5}/>
              <span className="text-sm font-bold">Correct</span>
            </div>
          ) : selectedChoices.length > 0 ? (
            <div className="flex items-center gap-1 text-red-600">
              <XCircle size={20} strokeWidth={2.5}/>
              <span className="text-sm font-bold">Incorrect</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-gray-400">
              <AlertCircle size={20}/>
              <span className="text-sm font-bold">Not Answered</span>
            </div>
          )}
        </div>
        <span className="text-sm text-gray-500 font-medium">
          {selectedChoices.reduce((sum, c) => sum + c.score, 0)} / {correctChoices.reduce((sum, c) => sum + c.score, 0)} points
        </span>
      </div>

      {/* Question Text */}
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        {question.qText}
      </h3>

      {/* Question Image */}
      {question.qImage && (
        <img 
          src={convertDriveLink(question.qImage)} 
          alt="Question" 
          className="w-full max-w-md rounded-lg border border-gray-200 mb-4 object-cover"
        />
      )}

      {/* Answer Options */}
      <div className="space-y-3 mb-4">
        {question.choices.map((choice, cIdx) => {
          const optionLabel = String.fromCharCode(65 + cIdx);
          
          let borderColor = "border-gray-200";
          let bgColor = "bg-white";
          let icon = null;

          if (choice.isCorrect) {
            borderColor = "border-green-500";
            bgColor = "bg-green-50";
            icon = <CheckCircle size={20} strokeWidth={2.5}/>;
          } else if (choice.isSelected && !choice.isCorrect) {
            borderColor = "border-red-500";
            bgColor = "bg-red-50";
            icon = <XCircle size={20} strokeWidth={2.5}/>;
          }

          return (
            <div
              key={cIdx}
              className={`p-4 rounded-xl border-2 ${borderColor} ${bgColor} flex items-start gap-3`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg border-2 flex items-center justify-center font-bold text-sm ${
                choice.isCorrect ? "bg-green-500 border-green-500 text-white" :
                choice.isSelected && !choice.isCorrect ? "bg-red-500 border-red-500 text-white" :
                "bg-white border-gray-300 text-gray-600"
              }`}>
                {choice.isCorrect || (choice.isSelected && !choice.isCorrect) ? icon : optionLabel}
              </div>
              
              <div className="flex-1">
                <p className={`${choice.isCorrect ? "text-green-800 font-medium" : choice.isSelected && !choice.isCorrect ? "text-red-800 font-medium" : "text-gray-700"}`}>
                  {choice.choiceText}
                </p>
                {choice.choiceImage && (
                  <img 
                    src={convertDriveLink(choice.choiceImage)} 
                    alt={`Option ${optionLabel}`}
                    className="mt-2 max-w-xs rounded border border-gray-200 object-cover"
                  />
                )}
              </div>

              {icon && <div className="text-inherit">{icon}</div>}
            </div>
          );
        })}
      </div>

      {/* Explanation */}
      {question.explain && (
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-2">
            <TrendingUp size={18} className="text-blue-600 flex-shrink-0 mt-0.5"/>
            <div>
              <p className="text-sm font-bold text-blue-800 mb-1">Explanation</p>
              <p className="text-sm text-blue-700">{question.explain}</p>
            </div>
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="border-t border-gray-200 pt-4">
        <button
          onClick={() => setShowComments(!showComments)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
        >
          <div className="flex items-center gap-2">
            <MessageCircle size={18} className="text-gray-600"/>
            <span className="text-sm font-semibold text-gray-700">
              Comments ({commentCount})
            </span>
          </div>
          {showComments ? (
            <ChevronUp size={18} className="text-gray-600"/>
          ) : (
            <ChevronDown size={18} className="text-gray-600"/>
          )}
        </button>

        {showComments && (
          <div className="mt-4 space-y-4">
            {/* Add New Comment */}
            <div className="flex items-start gap-3">
              {user?.avatar || user?.pictureUrl ? (
                <img
                  src={convertDriveLink(user.avatar || user.pictureUrl)}
                  alt="You"
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#00b6b6] flex items-center justify-center text-white font-bold flex-shrink-0">
                  {user?.name || user?.userName ? 
                    (user.name || user.userName).charAt(0).toUpperCase() : 
                    "U"
                  }
                </div>
              )}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !isPosting && handlePostComment()}
                  placeholder="Write a comment..."
                  className="w-full pl-4 pr-12 py-3 bg-gray-50 rounded-full border border-gray-200 focus:ring-2 focus:ring-[#00b6b6] focus:border-transparent outline-none text-sm"
                  disabled={isPosting}
                />
                <button
                  onClick={handlePostComment}
                  disabled={!newComment.trim() || isPosting}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#00b6b6] text-white rounded-full hover:bg-[#009e9e] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPosting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send size={16}/>
                  )}
                </button>
              </div>
            </div>

            {/* Comments List */}
            {isLoadingComments ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00b6b6]"></div>
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={{
                      ...comment,
                      currentUserAvatar: user?.avatar || user?.pictureUrl,
                      currentUserName: user?.name || user?.userName
                    }}
                    onReply={handleReply}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    currentUserId={user?.userId}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}