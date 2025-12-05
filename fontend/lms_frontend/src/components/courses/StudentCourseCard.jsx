import React from "react";
import { useNavigate } from "react-router-dom";
import student from "../../assets/person.svg";
import lesson from "../../assets/lesson.svg";

export default function StudentCourseCard({ course }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate("course/course-detail");
  };

  return (
    <div 
      onClick={handleCardClick}
      className="w-full bg-white shadow-lg rounded-xl overflow-hidden flex flex-col h-full transform hover:-translate-y-2 hover:shadow-xl transition duration-300 cursor-pointer border border-gray-100"
    >
      <div className="relative h-44 overflow-hidden">
         <img src={course.img} alt={course.title} className="w-full h-full object-cover transition duration-500 hover:scale-110" />
      </div>
      
      <div className="p-4 flex flex-col flex-1">
        <div className="flex flex-row justify-between items-start mb-2">
          <h4 className="font-bold text-gray-800 text-sm line-clamp-2 flex-1 pr-2">{course.title}</h4>
          <p className="text-yellow-500 text-sm font-bold flex-shrink-0 whitespace-nowrap">{course.rating} ★</p>
        </div>
        
        <p className="text-gray-500 text-xs mb-4 line-clamp-2">{course.subtitle}</p>
        
        <div className="mt-auto">
            <div className="flex items-center justify-between border-t border-gray-100 pt-3 mb-3">
            <span className="flex items-center gap-1 text-xs text-gray-600">
                <img className="w-4 h-4 opacity-70" src={student} alt="student" />
                {course.studentNums}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-600">
                <img className="w-4 h-4 opacity-70" src={lesson} alt="lesson" />
                {course.lessonNums}
            </span>
            <span className="font-bold text-teal-600 text-sm">Free</span>
            </div>

            <button className="w-full border border-[#00b6b6] text-[#00b6b6] rounded-lg py-2 text-sm font-semibold hover:bg-[#00b6b6] hover:text-white transition duration-300">
            Explore
            </button>
        </div>
      </div>
    </div>
  );
}