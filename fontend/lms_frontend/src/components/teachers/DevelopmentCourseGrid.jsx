import React, { useState } from "react";
import { Plus, Trash2, Edit3, BookOpen, AlertTriangle, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import courseplaceholder from "../../assets/courseplaceholder.png";
import apiClient from "../../api/axiosConfig";

export default function DevelopmentCourseGrid({ courses, onOpenModal, onDeleteSuccess, isLoading }) {
  const navigate = useNavigate();
  const imgplaceholder = courseplaceholder;
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, courseId: null, courseTitle: "" });

  const handleEditClick = (courseId) => {
    navigate(`/teacher/courses/${courseId}/edit`);
  };

  const openDeleteConfirmation = (e, courseId, courseTitle) => {
    e.stopPropagation(); 
    setDeleteModal({ show: true, courseId, courseTitle });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.courseId) return;

    setIsDeleting(true);
    try {
      const response = await apiClient.delete(`/course/${deleteModal.courseId}`);
      if (response.status === 200) {
        if (onDeleteSuccess) {
            onDeleteSuccess(deleteModal.courseId);
        }
        setDeleteModal({ show: false, courseId: null, courseTitle: "" });
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      
      let errorMessage = "Failed to delete course.";
      if (error.response) {
          errorMessage = error.response.data?.message || error.response.data || error.message;
          if (error.response.status === 404 || error.response.status === 500) {
              errorMessage = "Course not found or already deleted. Please refresh the page.";
          }
      }
      alert(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const CreateNewCard = () => (
    <div 
      onClick={!isLoading ? onOpenModal : undefined}
      className={`bg-white rounded-xl border-2 border-dashed border-[#00b6b6] bg-teal-50/30 h-[320px] flex flex-col items-center justify-center transition group ${
        isLoading ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:bg-teal-50'
      }`}
    >
      <div className={`w-14 h-14 bg-[#00b6b6] rounded-full flex items-center justify-center shadow-lg transition duration-300 ${!isLoading && 'group-hover:scale-110'} ${isLoading ? 'animate-spin' : ''}`}>
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

        {courses.map((course) => (
          <div
            key={course.courseId} 
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition h-[320px] flex flex-col group relative"
          >
            {/* Image Section */}
            <div className="h-44 bg-gray-200 relative overflow-hidden">
              <img
                src={course.thumbnailUrl || imgplaceholder}
                alt={course.title}
                className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = imgplaceholder;
                }}
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                <button 
                  onClick={() => handleEditClick(course.courseId)} 
                  className="bg-white text-gray-800 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-[#00b6b6] hover:text-white transition cursor-pointer transform hover:scale-105"
                >
                  <Edit3 size={16} /> Edit Course
                </button>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-gray-800 line-clamp-2 mb-2 text-base leading-snug" title={course.title}>
                  {course.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                  {course.description || "No description provided."}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                <div className="flex items-center text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-xs font-medium">
                  <BookOpen size={14} className="mr-1.5 text-[#00b6b6]" />
                  {course.numOfChapter} {course.numOfChapter > 1 ? "Chapters" : "Chapter"}
                </div>
                
                <button 
                    className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition" 
                    onClick={(e) => openDeleteConfirmation(e, course.courseId, course.title)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all scale-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <AlertTriangle className="text-red-500" size={20} />
                    Confirm Delete
                </h3>
                <button 
                    onClick={() => setDeleteModal({ show: false, courseId: null, courseTitle: "" })}
                    className="text-gray-400 hover:text-gray-600 transition"
                >
                    <X size={20} />
                </button>
            </div>
            <div className="p-6">
                <p className="text-gray-600 mb-4">Are you sure you want to delete the course:</p>
                <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-100 font-medium text-sm mb-4 line-clamp-2">"{deleteModal.courseTitle}"</div>
                <p className="text-sm text-gray-500">This action cannot be undone. All chapters and contents within this course will be permanently removed.</p>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                <button
                    onClick={() => setDeleteModal({ show: false, courseId: null, courseTitle: "" })}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition disabled:opacity-50"
                    disabled={isDeleting}
                >
                    Cancel
                </button>
                <button
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 font-medium transition flex items-center gap-2 disabled:opacity-70"
                    disabled={isDeleting}
                >
                    {isDeleting ? "Processing..." : <><Trash2 size={16} /> Delete Course</>}
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}