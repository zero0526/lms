import React, { useState } from "react";
import { Plus } from "lucide-react";
import DevelopmentCourseGrid from "../../components/teachers/DevelopmentCourseGrid";
import CreateCourseModal from "../../components/teachers/CreateCourseModal";
import apiClient from "../../api/axiosConfig"; // Import apiClient để gọi API

export default function CourseDevelopmentContent() {
  // Giả sử đây là list khóa học lấy từ API về (hiện tại đang rỗng để test Empty State)
  const [developmentCourses, setDevelopmentCourses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- HÀM TẠO KHÓA HỌC (Logic giống bên Grid) ---
  const handleCreateCourse = async (data) => {
    setIsLoading(true);
    try {
      const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      
      if (!user || !user.userId) {
        alert("Instructor ID not found. Please login again.");
        return;
      }

      const formData = new FormData();
      formData.append("instructorId", user.userId); 
      formData.append("title", data.title);
      formData.append("desc", data.desc);
      formData.append("courseTarget", data.courseTarget);
      formData.append("precondition", data.precondition);
      formData.append("tags", data.tags);
      formData.append("thumbnail", data.thumbnail); 

      // Gọi API tạo khóa học
      const response = await apiClient.post("/course/post", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200 || response.status === 201) {
        console.log("✅ Course Created from Empty State:", response.data);
        
        const newCourse = {
          id: response.data.data?.id || Date.now(), 
          title: data.title,
          img: data.preview, 
          lastEdited: "Just now",
        };
        
        // Cập nhật state để giao diện chuyển sang Grid
        setDevelopmentCourses([newCourse, ...developmentCourses]);
        setIsModalOpen(false); 
      }
    } catch (error) {
      console.error("❌ Error creating course:", error);
      if (error.response) {
          alert(`Server Error: ${error.response.data.message || "Something went wrong"}`);
      } else {
          alert("Failed to create course. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Thẻ Create New lớn (Dành cho Empty State)
  const EmptyStateCard = () => (
    <div className="min-h-[500px] flex flex-col items-center justify-center bg-white rounded-xl border border-gray-100 shadow-sm">
      <div 
        onClick={() => setIsModalOpen(true)} // <-- Thêm sự kiện mở Modal
        className="w-64 h-48 border-2 border-dashed border-[#00b6b6] bg-teal-50/30 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-teal-50 transition group"
      >
        <div className={`w-14 h-14 bg-[#00b6b6] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition duration-300 ${isLoading ? 'animate-spin' : ''}`}>
          <Plus size={28} className="text-white" />
        </div>
        <p className="mt-4 font-bold text-gray-700 group-hover:text-[#00b6b6]">
          {isLoading ? "Creating..." : "Create Course"}
        </p>
      </div>
      <p className="mt-8 text-gray-400 text-sm uppercase tracking-wider font-medium">
        No courses in development
      </p>
    </div>
  );

  return (
    <div className="p-6">
        {/* Nếu có khóa học thì hiện Grid, nếu không thì hiện Empty State */}
        {developmentCourses.length > 0 ? (
            <DevelopmentCourseGrid courses={developmentCourses} />
        ) : (
            <EmptyStateCard />
        )}

        {/* Modal dùng chung cho Empty State */}
        <CreateCourseModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onCreate={handleCreateCourse}
        />
    </div>
  );
}