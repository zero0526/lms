import React, { useState, useEffect } from "react";
import { HelpCircle, Clock, CheckCircle, XCircle, AlertTriangle, Loader, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { startQuiz, submitQuiz } from "../../api/student/quizApi";
import { getCurrentUserId } from "../../api/user/userUtils";
import { convertDriveLink } from "../../api/user/userUtils";

export default function QuizComponent({ quizzes }) {
  const [quizState, setQuizState] = useState("preview"); // preview, active, completed, submitting
  const [questions, setQuestions] = useState([]);
  const [attemptId, setAttemptId] = useState(null);
  const [timeLimit, setTimeLimit] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Empty state
  if (!quizzes || quizzes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center space-y-5">
        <div className="bg-gray-100 p-4 rounded-full">
          <AlertTriangle size={48} className="text-gray-400"/>
        </div>
        <h3 className="text-xl font-bold text-gray-700">No Quiz Available</h3>
        <p className="text-gray-500 max-w-md">
          This lesson doesn't have any quiz yet. Check back later or continue with the next lesson.
        </p>
      </div>
    );
  }

  const quiz = quizzes[0];

  // Timer countdown
  useEffect(() => {
    if (quizState === "active" && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quizState, timeRemaining]);

  // Handle start quiz
  const handleStartQuiz = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const userId = getCurrentUserId();
      
      if (!userId) {
        setError("Please log in to start the quiz");
        setIsLoading(false);
        return;
      }

      const quizId = quiz.quizId;
      
      if (!quizId) {
        setError("Invalid quiz ID");
        setIsLoading(false);
        return;
      }

      console.log("Starting quiz with ID:", quizId, "for user:", userId);

      const response = await startQuiz(quizId, userId);

      console.log("Quiz started, response:", response);

      setQuestions(response.data.questions);
      setAttemptId(response.data.attemptId);
      setTimeLimit(response.data.timeLimit);
      setTimeRemaining(response.data.timeLimit * 60); // Convert to seconds
      setQuizState("active");
      setIsLoading(false);

    } catch (err) {
      console.error("Failed to start quiz:", err);
      setError(err.message || "Failed to start quiz. Please try again.");
      setIsLoading(false);
    }
  };

  // Handle answer selection (multiple answers)
  const handleSelectAnswer = (questionId, answerId) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionId] || [];
      const isSelected = currentAnswers.includes(answerId);

      if (isSelected) {
        // Bỏ chọn answer
        return {
          ...prev,
          [questionId]: currentAnswers.filter(id => id !== answerId)
        };
      } else {
        // Thêm answer
        return {
          ...prev,
          [questionId]: [...currentAnswers, answerId]
        };
      }
    });
  };

  const handleSubmitQuiz = async () => {
    // Validation: Check if all questions are answered
    const unansweredQuestions = questions.filter(q => {
      const questionAnswers = answers[q.questionId];
      return !questionAnswers || questionAnswers.length === 0;
    });

    if (unansweredQuestions.length > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unansweredQuestions.length} unanswered question(s). Do you want to submit anyway?`
      );
      
      if (!confirmSubmit) {
        return;
      }
    }

    try {
      setQuizState("submitting");
      setSubmitError(null);

      console.log("Submitting quiz...");
      console.log("Attempt ID:", attemptId);
      console.log("Answers:", answers);

      // Call API
      const response = await submitQuiz(attemptId, answers);

      console.log("Quiz submitted successfully:", response);
      
      setQuizState("completed");

    } catch (err) {
      console.error("Failed to submit quiz:", err);
      setSubmitError(err.message || "Failed to submit quiz. Please try again.");
      setQuizState("active"); // Back to active state
      alert(`Failed to submit quiz: ${err.message}`);
    }
  };

  // Handle time up
  const handleTimeUp = () => {
    alert("Time's up! Your quiz will be submitted automatically.");
    handleSubmitQuiz();
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Navigation
  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // PREVIEW STATE
  if (quizState === "preview") {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center space-y-5 animate-in fade-in zoom-in duration-300">
        <div className="bg-teal-100 p-4 rounded-full">
          <HelpCircle size={48} className="text-[#00b6b6]"/>
        </div>
        <h3 className="text-2xl font-bold text-gray-800">{quiz.titleQuiz || "Multiple-choice Quiz"}</h3>
        
        {quiz.description && (
          <p className="text-gray-600 max-w-md">{quiz.description}</p>
        )}
        
        <div className="flex gap-8 text-left">
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="text-3xl font-bold text-[#00b6b6] mb-1">{quiz.numOfQuestion}</div>
            <div className="text-sm text-gray-500">Questions</div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="text-3xl font-bold text-[#00b6b6] mb-1">{quiz.timeLimit}</div>
            <div className="text-sm text-gray-500">Minutes</div>
          </div>
          
          {quiz.level && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className={`text-xl font-bold mb-1 ${
                quiz.level === 'Easy' ? 'text-green-600' :
                quiz.level === 'Medium' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {quiz.level}
              </div>
              <div className="text-sm text-gray-500">Difficulty</div>
            </div>
          )}
        </div>
        
        <p className="text-gray-500 text-sm max-w-md">
          Make sure you understand the lesson content before starting the quiz.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm max-w-md">
            {error}
          </div>
        )}
        
        <button 
          onClick={handleStartQuiz}
          disabled={isLoading}
          className="bg-[#00b6b6] hover:bg-[#009e9e] text-white px-8 py-3 rounded-full font-bold shadow-lg transition transform hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader size={20} className="animate-spin"/>
              Starting Quiz...
            </>
          ) : (
            "Start Quiz"
          )}
        </button>
      </div>
    );
  }

  // SUBMITTING STATE
  if (quizState === "submitting") {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center space-y-5">
        <div className="bg-[#00b6b6]/10 p-4 rounded-full">
          <Loader size={48} className="text-[#00b6b6] animate-spin"/>
        </div>
        <h3 className="text-2xl font-bold text-gray-800">Submitting Your Quiz...</h3>
        <p className="text-gray-600 max-w-md">
          Please wait while we process your answers.
        </p>
      </div>
    );
  }

  // ACTIVE STATE
  if (quizState === "active" && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswers = answers[currentQuestion.questionId] || [];
    const isAnswered = currentAnswers.length > 0;
    
    // Count questions that have at least one answer
    const answeredCount = Object.values(answers).filter(arr => arr && arr.length > 0).length;
    const progressPercent = (answeredCount / questions.length) * 100;

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Timer & Progress Bar */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Clock size={20} className={timeRemaining < 60 ? "text-red-500" : "text-[#00b6b6]"}/>
              <span className={`font-bold ${timeRemaining < 60 ? "text-red-500 animate-pulse" : "text-gray-700"}`}>
                Time Remaining: {formatTime(timeRemaining)}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {answeredCount} / {questions.length} answered
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#00b6b6] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Info Banner - Multiple Answers */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-2">
          <Info size={18} className="text-blue-600 flex-shrink-0"/>
          <p className="text-sm text-blue-700 font-medium">
            Each question may have multiple correct answers. Select all that apply.
          </p>
        </div>

        {/* Question Navigation */}
        <div className="flex gap-2 flex-wrap">
          {questions.map((q, index) => {
            const isCurrentQuestion = index === currentQuestionIndex;
            const questionAnswers = answers[q.questionId] || [];
            const isQuestionAnswered = questionAnswers.length > 0;

            return (
              <button
                key={q.questionId}
                onClick={() => goToQuestion(index)}
                className={`w-10 h-10 rounded-lg font-bold transition-all ${
                  isCurrentQuestion
                    ? "bg-[#00b6b6] text-white ring-2 ring-[#00b6b6] ring-offset-2"
                    : isQuestionAnswered
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : "bg-gray-100 text-gray-500 border border-gray-200 hover:border-gray-300"
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        {/* Question Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-[#00b6b6] text-white text-sm font-bold px-3 py-1 rounded-full">
              Question {currentQuestionIndex + 1}
            </span>
            <span className={`text-xs font-bold px-2 py-1 rounded ${
              currentQuestion.level === 'Easy' ? 'bg-green-100 text-green-700' :
              currentQuestion.level === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {currentQuestion.level}
            </span>
            <span className="text-xs text-gray-500 ml-auto">
              {currentQuestion.score} {currentQuestion.score > 1 ? 'points' : 'point'}
            </span>
            {/* Show selected count */}
            {currentAnswers.length > 0 && (
              <span className="text-xs bg-[#00b6b6] text-white px-2 py-1 rounded-full">
                {currentAnswers.length} selected
              </span>
            )}
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {currentQuestion.questionText}
          </h3>

          {currentQuestion.questionImg && (
            <img 
              src={convertDriveLink(currentQuestion.questionImg)} 
              alt="Question" 
              className="w-full max-w-md rounded-lg border border-gray-200 mb-4 object-cover"
            />
          )}

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.mcps.map((option, index) => {
              const isSelected = currentAnswers.includes(option.aid);
              const optionLabel = String.fromCharCode(65 + index); // A, B, C, D

              return (
                <button
                  key={option.aid}
                  onClick={() => handleSelectAnswer(currentQuestion.questionId, option.aid)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${
                    isSelected
                      ? "border-[#00b6b6] bg-teal-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {/* Checkbox style */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg border-2 flex items-center justify-center font-bold text-sm transition-all ${
                    isSelected
                      ? "bg-[#00b6b6] border-[#00b6b6] text-white"
                      : "bg-white border-gray-300 text-gray-600"
                  }`}>
                    {isSelected ? (
                      <CheckCircle size={18} strokeWidth={3}/>
                    ) : (
                      optionLabel
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700">{option.atext}</p>
                    {option.aimage && (
                      <img 
                        src={convertDriveLink(option.aimage)} 
                        alt={`Option ${optionLabel}`}
                        className="mt-2 max-w-xs rounded border border-gray-200 object-cover"
                      />
                    )}
                  </div>
                  {isSelected && (
                    <CheckCircle size={20} className="text-[#00b6b6] flex-shrink-0"/>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center gap-4">
          <button
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ChevronLeft size={20}/>
            Previous
          </button>

          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              className="px-8 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 shadow-lg transition transform active:scale-95"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={goToNextQuestion}
              className="px-6 py-3 bg-[#00b6b6] text-white rounded-xl font-semibold hover:bg-[#009e9e] transition flex items-center gap-2"
            >
              Next
              <ChevronRight size={20}/>
            </button>
          )}
        </div>
      </div>
    );
  }

  // COMPLETED STATE (placeholder - will show results later)
  if (quizState === "completed") {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center space-y-5">
        <div className="bg-green-100 p-4 rounded-full">
          <CheckCircle size={48} className="text-green-600"/>
        </div>
        <h3 className="text-2xl font-bold text-gray-800">Quiz Completed!</h3>
        <p className="text-gray-600 max-w-md">
          Your answers have been submitted successfully. Results will be displayed here.
        </p>
      </div>
    );
  }

  return null;
}