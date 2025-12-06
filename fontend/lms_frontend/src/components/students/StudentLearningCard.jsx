import React from "react";
import { useNavigate } from "react-router-dom";

export default function StudentLearningCard({ course }) {
  const navigate = useNavigate();

  const progressPercent = (course.progress / course.totalLessons) * 100;

  const handleCardClick = () => {
    navigate(`/student/courses/${course.id}`, { 
      state: { 
        isRegistered: true,
        progress: course.progress
      } 
    });
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white shadow-lg rounded-xl overflow-hidden hover:scale-105 transform transition duration-300 cursor-pointer"
    >
      <img
        src={course.image}
        alt={course.title}
        className="w-full h-40 object-cover"
      />

      <div className="p-4">
        <h4 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2">
          {course.title}
        </h4>

        <div className="flex items-center gap-2 mb-2">
          <p className="text-gray-600 text-xs">{course.instructor}</p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 h-1 rounded-full mb-2">
          <div
            className="h-1 bg-[#00b6b6] rounded-full"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        <p className="text-[11px] text-gray-500 text-right">
          Lesson {course.progress} of {course.totalLessons}
        </p>
      </div>
    </div>
  );
}