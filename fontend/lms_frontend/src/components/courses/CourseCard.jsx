import React from "react";
import { useNavigate } from "react-router-dom";
import student from "../../assets/person.svg";
import lesson from "../../assets/lesson.svg";

export default function CourseCard({ course }) {
  const navigate = useNavigate(); // 2. Khởi tạo hook điều hướng

  const priceCheck = (price) => {
    return price > 0 ? `${price}$` : "Free";
  };

  // 3. Hàm xử lý khi click vào Card
  const handleCardClick = () => {
    // Cách 1: Nếu bạn muốn chuyển đến trang chi tiết chung (demo)
    navigate("/course/course-detail");
    
    // Cách 2: Nếu bạn muốn chuyển đến ID cụ thể (thực tế)
    // navigate(`/courses/${course.id}`); 
  };

  return (
    <div 
      onClick={handleCardClick} // 4. Gắn sự kiện onClick
      className="min-w-[300px] max-w-[320px] bg-white shadow-lg rounded-xl overflow-hidden flex-shrink-0 transform hover:scale-105 transition duration-300 cursor-pointer"
    >
      <img src={course.img} alt={course.title} className="w-full h-40 object-cover" />
      <div className="p-4">
        <div className="flex flex-row justify-between">
          <h4 className="font-bold text-gray-800 text-sm mb-2">{course.title}</h4>
          <p className="text-yellow-500">{course.rating}★</p>
        </div>
        <p className="text-gray-500 text-xs mb-3 truncate">{course.subtitle}</p> {/* Thêm truncate để tránh vỡ layout nếu text dài */}
        
        <div className="flex items-center justify-between">
          <span className="flex flex-row text-black-100 items-center gap-1">
            <img className="w-5 h-5" src={student} alt="student" />
            <span className="text-sm">{course.studentNums}</span>
          </span>
          <span className="flex flex-row text-black-100 items-center gap-1">
            <img className="w-5 h-5" src={lesson} alt="lesson" />
            <span className="text-sm">{course.lessonNums}</span>
          </span>
          <span className="font-semibold text-teal-600">{priceCheck(course.price)}</span>
        </div>

        <button className="mt-3 w-full border border-[#00b6b6] text-[#00b6b6] rounded-lg py-1 hover:bg-[#00b6b6] hover:text-white transition">
          Explore
        </button>
      </div>
    </div>
  );
}