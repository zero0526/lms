import React, { useState } from "react";
import { CheckCircle, XCircle, TrendingUp, AlertCircle, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { convertDriveLink } from "../../api/user/userUtils";

export default function QuestionReviewCard({ question, questionNumber }) {
  const [showComments, setShowComments] = useState(false);

  const selectedChoices = question.choices.filter(c => c.isSelected);
  const correctChoices = question.choices.filter(c => c.isCorrect);
  const isFullyCorrect = selectedChoices.every(c => c.isCorrect) && 
                        selectedChoices.length === correctChoices.length &&
                        selectedChoices.length > 0;

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
          const optionLabel = String.fromCharCode(65 + cIdx); // A, B, C, D
          
          // Determine styling
          let borderColor = "border-gray-200";
          let bgColor = "bg-white";
          let iconColor = "text-gray-600";
          let icon = null;

          if (choice.isCorrect) {
            // Correct answer
            borderColor = "border-green-500";
            bgColor = "bg-green-50";
            iconColor = "text-green-600";
            icon = <CheckCircle size={20} strokeWidth={2.5}/>;
          } else if (choice.isSelected && !choice.isCorrect) {
            // Wrong answer selected
            borderColor = "border-red-500";
            bgColor = "bg-red-50";
            iconColor = "text-red-600";
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

              {icon && (
                <div className={iconColor}>
                  {icon}
                </div>
              )}
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
              Comments ({question.commentCount})
            </span>
          </div>
          {showComments ? (
            <ChevronUp size={18} className="text-gray-600"/>
          ) : (
            <ChevronDown size={18} className="text-gray-600"/>
          )}
        </button>

        {showComments && (
          <div className="mt-4 space-y-3">
            {question.commentCount === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No comments yet</p>
            ) : (
              <div className="space-y-3">
                {/* Placeholder for comments - will be implemented with API */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">Student Name</p>
                      <p className="text-sm text-gray-600 mt-1">Comment content will appear here...</p>
                      <p className="text-xs text-gray-400 mt-2">2 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Add Comment Input */}
            <div className="mt-4">
              <textarea
                placeholder="Add a comment..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00b6b6] focus:border-transparent outline-none resize-none text-sm"
                rows="3"
              />
              <div className="flex justify-end mt-2">
                <button className="px-4 py-2 bg-[#00b6b6] text-white rounded-lg text-sm font-semibold hover:bg-[#009e9e] transition">
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}