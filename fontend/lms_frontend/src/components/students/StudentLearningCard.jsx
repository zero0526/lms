import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import courseplaceholder from "../../assets/courseplaceholder.png";

export default function StudentLearningCard({ course }) {
  const navigate = useNavigate();
  const imgplaceholder = courseplaceholder;

  const progressPercent = course.progressPercent || 0;
  
  // Đánh giá hoàn thiện dựa trên progress, không phải isCompleted
  const isCourseCompleted = progressPercent >= 100;

  const handleCardClick = () => {
    navigate(`/student/courses/${course.id}`, { 
      state: { 
        isRegistered: true,
        progress: course.progress,
        progressPercent: progressPercent
      } 
    });
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white shadow-lg rounded-xl overflow-hidden hover:scale-105 transform transition duration-300 cursor-pointer relative"
    >
      {/* Completed Badge - dựa vào progress */}
      {isCourseCompleted && (
        <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 z-10">
          <CheckCircle size={14} />
          Completed
        </div>
      )}

      <img
        src={course.image}
        alt={course.title}
        className="w-full h-40 object-cover"
        onError={(e) => { 
          e.target.src = imgplaceholder; 
        }}
      />

      <div className="p-4">
        <h4 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2">
          {course.title}
        </h4>

        <div className="flex items-center gap-2 mb-3">
          <p className="text-gray-600 text-xs">{course.instructor}</p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 h-2 rounded-full mb-2">
          <div
            className="h-2 bg-[#00b6b6] rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-[11px] text-gray-500">
            Progress: <span className="font-bold">{progressPercent.toFixed(0)}%</span>
          </p>
          {/* Hiển thị số chapters */}
          <p className="text-[11px] text-gray-500">
            {course.numOfChapter} {course.numOfChapter === 1 ? 'chapter' : 'chapters'}
          </p>
        </div>
      </div>
    </div>
  );
}