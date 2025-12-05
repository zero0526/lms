import React from "react";
import { Plus, Clock, MoreVertical, Edit3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DevelopmentCourseGrid({ courses }) {
  const navigate = useNavigate();

  const handleEditClick = (courseId) => {
    // SỬA LỖI: Dùng courseId (tham số truyền vào) thay vì courseData.id (không tồn tại)
    navigate(`/teacher/courses/course/course-detail/edit/${courseId}`);
  };

  // Nút Create New
  const CreateNewCard = () => (
    <div className="bg-white rounded-xl border-2 border-dashed border-[#00b6b6] bg-teal-50/30 h-[280px] flex flex-col items-center justify-center cursor-pointer hover:bg-teal-50 transition group">
      <div className="w-14 h-14 bg-[#00b6b6] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition duration-300">
        <Plus size={28} className="text-white" />
      </div>
      <p className="mt-4 font-bold text-gray-700 group-hover:text-[#00b6b6]">
        Create Course
      </p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {/* 1. Thẻ Create luôn nằm đầu */}
      <CreateNewCard />

      {/* 2. Danh sách khóa học */}
      {courses.map((course) => (
        <div
          key={course.id}
          className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition h-[280px] flex flex-col group relative"
        >
          {/* Image Area */}
          <div className="h-40 bg-gray-200 relative overflow-hidden">
            <img
              src={course.img}
              alt={course.title}
              className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
            />
            {/* Status Badge */}
            <div className="absolute top-3 left-3 bg-black/60 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">
              {course.status}
            </div>
            
            {/* Hover Overlay with Edit Button */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
              <button 
                // Truyền ID vào hàm xử lý
                onClick={() => handleEditClick(course.id)} 
                className="bg-white text-gray-800 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-[#00b6b6] hover:text-white transition cursor-pointer transform hover:scale-105"
              >
                <Edit3 size={16} /> Edit Course
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-4 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-gray-800 line-clamp-2 mb-2 text-sm">
                {course.title}
              </h3>
              <div className="flex items-center text-xs text-gray-500 gap-1">
                <Clock size={12} />
                Edited {course.lastEdited}
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <div className="w-full bg-gray-100 rounded-full h-1.5 mr-3">
                <div className="bg-yellow-400 h-1.5 rounded-full w-1/3"></div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}