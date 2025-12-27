import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Award, Loader, AlertCircle, Home } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import QuestionReviewCard from "../../components/students/QuestionReviewCard";
import { fetchQuizAttemptResult } from "../../api/student/quizApi";

export default function QuizResult() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    const loadResult = async () => {
      try {
        setIsLoading(true);
        const data = await fetchQuizAttemptResult(attemptId);
        setResult(data);
      } catch (err) {
        console.error("Failed to load quiz result:", err);
        setError(err.message || "Failed to load quiz result");
      } finally {
        setIsLoading(false);
      }
    };

    if (attemptId) {
      loadResult();
    }
  }, [attemptId]);

  // Calculate statistics
  const getStatistics = () => {
    if (!result) return { correct: 0, incorrect: 0, totalQuestions: 0 };
    
    let correct = 0;
    let incorrect = 0;

    result.questions.forEach(q => {
      const selectedChoices = q.choices.filter(c => c.isSelected);
      const allCorrect = selectedChoices.every(c => c.isCorrect) && 
                         selectedChoices.length === q.choices.filter(c => c.isCorrect).length;
      
      if (allCorrect && selectedChoices.length > 0) {
        correct++;
      } else if (selectedChoices.length > 0) {
        incorrect++;
      }
    });

    return {
      correct,
      incorrect,
      totalQuestions: result.questions.length
    };
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    // Scroll to top of question
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
          <div className="text-center space-y-4">
            <Loader size={48} className="text-[#00b6b6] animate-spin mx-auto"/>
            <p className="text-gray-600 font-medium">Loading your results...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
          <div className="text-center space-y-4 max-w-md">
            <AlertCircle size={48} className="text-red-500 mx-auto"/>
            <h3 className="text-xl font-bold text-gray-800">Error Loading Results</h3>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-[#00b6b6] text-white rounded-lg font-semibold hover:bg-[#009e9e] transition"
            >
              Go Back
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const stats = getStatistics();
  const percentage = ((stats.correct / stats.totalQuestions) * 100).toFixed(1);
  const currentQuestion = result.questions[currentQuestionIndex];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT SIDEBAR */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Header Card */}
              <div className="bg-gradient-to-r from-[#00b6b6] to-[#009e9e] rounded-2xl p-6 text-white shadow-xl top-24">
                <div className="flex items-center gap-3 mb-6">
                  <Award size={48} className="text-white/80"/>
                  <div>
                    <h1 className="text-2xl font-bold">Quiz Results</h1>
                    <p className="text-sm text-white/80">Great effort!</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <div className="text-2xl font-bold">{result.totalScore}</div>
                    <div className="text-xs text-white/80">Total Score</div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <div className="text-2xl font-bold">{percentage}%</div>
                    <div className="text-xs text-white/80">Accuracy</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                      <div className="text-xl font-bold text-green-300">{stats.correct}</div>
                      <div className="text-xs text-white/80">Correct</div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                      <div className="text-xl font-bold text-red-300">{stats.incorrect}</div>
                      <div className="text-xs text-white/80">Incorrect</div>
                    </div>
                  </div>
                </div>

                {/* Back Button */}
                <button
                  onClick={() => navigate("/student/courses")}
                  className="w-full mt-6 px-4 py-3 bg-white text-[#00b6b6] rounded-xl font-semibold hover:bg-gray-100 transition flex items-center justify-center gap-2"
                >
                  <Home size={20}/>
                  Back to My Courses
                </button>
              </div>

              {/* Question Navigation Grid */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-gray-700 mb-4">Questions</h3>
                <div className="grid grid-cols-5 gap-2">
                  {result.questions.map((q, index) => {
                    const selectedChoices = q.choices.filter(c => c.isSelected);
                    const isCorrect = selectedChoices.every(c => c.isCorrect) && 
                                     selectedChoices.length === q.choices.filter(c => c.isCorrect).length &&
                                     selectedChoices.length > 0;
                    const isIncorrect = selectedChoices.length > 0 && !isCorrect;
                    const isActive = index === currentQuestionIndex;

                    return (
                      <button
                        key={q.qId}
                        onClick={() => goToQuestion(index)}
                        className={`aspect-square rounded-lg font-bold text-sm transition-all ${
                          isActive
                            ? "bg-[#00b6b6] text-white ring-2 ring-[#00b6b6] ring-offset-2 scale-110"
                            : isCorrect
                            ? "bg-green-100 text-green-700 border-2 border-green-300 hover:bg-green-200"
                            : isIncorrect
                            ? "bg-red-100 text-red-700 border-2 border-red-300 hover:bg-red-200"
                            : "bg-gray-100 text-gray-400 border-2 border-gray-200 hover:bg-gray-200"
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT CONTENT - Question Display */}
            <div className="lg:col-span-2">
              <QuestionReviewCard 
                question={currentQuestion} 
                questionNumber={currentQuestionIndex + 1}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}