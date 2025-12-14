import React, { useState, useEffect } from "react";
import { Plus, Clock, MoreVertical, Edit3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/axiosConfig"; // Đảm bảo import đúng apiClient của bạn
import CreateCourseModal from "./CreateCourseModal";

export default function DevelopmentCourseGrid({ courses }) {
  const navigate = useNavigate();
  const [courseList, setCourseList] = useState(courses || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (courses) setCourseList(courses);
  }, [courses]);

  // --- HÀM GỌI API TẠO KHÓA HỌC ---
  const handleCreateCourse = async (data) => {
    setIsLoading(true);
    try {
      // 1. Lấy thông tin user hiện tại
      const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      
      if (!user || !user.userId) {
        alert("Instructor ID not found. Please login again.");
        return;
      }

      // 2. Chuẩn bị FormData
      const formData = new FormData();
      formData.append("instructorId", user.userId); 
      formData.append("title", data.title);
      formData.append("desc", data.desc);
      formData.append("courseTarget", data.courseTarget);
      formData.append("precondition", data.precondition);
      formData.append("tags", data.tags);
      formData.append("thumbnail", data.thumbnail); 

      // 3. Gọi API - QUAN TRỌNG: Ghi đè header Content-Type
      const response = await apiClient.post("/course/post", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200 || response.status === 201) {
        console.log("✅ Course Created:", response.data);
        
        const newCourse = {
          id: response.data.data?.id || Date.now(), 
          title: data.title,
          img: data.preview, 
          lastEdited: "Just now",
        };
        
        setCourseList([newCourse, ...courseList]);
        setIsModalOpen(false); 
      }
    } catch (error) {
      console.error("❌ Error creating course:", error);
      // Log chi tiết lỗi từ backend để debug nếu vẫn bị 500
      if (error.response) {
          console.error("Server Response Data:", error.response.data);
          alert(`Server Error: ${error.response.data.message || "Something went wrong"}`);
      } else {
          alert("Failed to create course. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (courseId) => {
    navigate(`/teacher/courses/${courseId}/edit`);
  };

  const CreateNewCard = () => (
    <div 
      onClick={() => setIsModalOpen(true)}
      className="bg-white rounded-xl border-2 border-dashed border-[#00b6b6] bg-teal-50/30 h-[280px] flex flex-col items-center justify-center cursor-pointer hover:bg-teal-50 transition group"
    >
      <div className={`w-14 h-14 bg-[#00b6b6] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition duration-300 ${isLoading ? 'animate-spin' : ''}`}>
        <Plus size={28} className="text-white" />
      </div>
      <p className="mt-4 font-bold text-gray-700 group-hover:text-[#00b6b6]">
        {isLoading ? "Creating..." : "Create Course"}
      </p>
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <CreateNewCard />

        {courseList.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition h-[280px] flex flex-col group relative"
          >
            <div className="h-40 bg-gray-200 relative overflow-hidden">
              <img
                src={course.img}
                alt={course.title}
                className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                <button 
                  onClick={() => handleEditClick(course.id)} 
                  className="bg-white text-gray-800 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-[#00b6b6] hover:text-white transition cursor-pointer transform hover:scale-105"
                >
                  <Edit3 size={16} /> Edit Course
                </button>
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-gray-800 line-clamp-2 mb-2 text-sm" title={course.title}>
                  {course.title}
                </h3>
                <div className="flex items-center text-xs text-gray-500 gap-1">
                  <Clock size={12} />
                  Edited {course.lastEdited || "Unknown"}
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

      <CreateCourseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreate={handleCreateCourse} 
      />
    </>
  );
}