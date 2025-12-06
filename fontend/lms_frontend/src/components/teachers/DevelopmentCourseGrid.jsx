import React, { useState, useRef, useEffect } from "react";
import { Plus, Clock, MoreVertical, Edit3, X, Upload, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

// --- Internal Modal Component ---
const CreateCourseModal = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) return alert("Please enter a course title");
    
    // Pass data back to parent
    onCreate({ 
      title, 
      image: imagePreview || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60"
    });
    
    // Reset form
    setTitle("");
    setImageFile(null);
    setImagePreview(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-800">Create New Course</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Course Title</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#00b6b6] outline-none transition"
              placeholder="e.g. Advanced React Patterns"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Course Thumbnail</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer hover:bg-teal-50 hover:border-[#00b6b6] transition relative overflow-hidden group"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-gray-400 group-hover:text-[#00b6b6]">
                  <div className="bg-gray-100 p-3 rounded-full mb-2 group-hover:bg-white transition">
                    <Upload size={24} />
                  </div>
                  <p className="text-sm font-medium">Click to upload image</p>
                </div>
              )}
              
              {imagePreview && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                  <span className="bg-white text-gray-800 px-3 py-1 rounded-full text-xs font-bold">Change Image</span>
                </div>
              )}
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium transition"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            className="px-6 py-2 bg-[#00b6b6] text-white rounded-lg hover:bg-[#009e9e] text-sm font-bold shadow-md transition"
          >
            Create Course
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---
export default function DevelopmentCourseGrid({ courses }) {
  const navigate = useNavigate();
  const [courseList, setCourseList] = useState(courses || []);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Update local state if props change
  useEffect(() => {
    if (courses) {
      setCourseList(courses);
    }
  }, [courses]);

  const handleEditClick = (courseId) => {
    navigate(`/teacher/courses/${courseId}/edit`);
  };

  const handleCreateCourse = (data) => {
    const newCourse = {
      id: Date.now(),
      title: data.title,
      img: data.image,
      lastEdited: "Just now",
    };
    
    // Add new course to the beginning of the list
    setCourseList([newCourse, ...courseList]);
  };

  const CreateNewCard = () => (
    <div 
      onClick={() => setIsModalOpen(true)}
      className="bg-white rounded-xl border-2 border-dashed border-[#00b6b6] bg-teal-50/30 h-[280px] flex flex-col items-center justify-center cursor-pointer hover:bg-teal-50 transition group"
    >
      <div className="w-14 h-14 bg-[#00b6b6] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition duration-300">
        <Plus size={28} className="text-white" />
      </div>
      <p className="mt-4 font-bold text-gray-700 group-hover:text-[#00b6b6]">
        Create Course
      </p>
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <CreateNewCard />

        {/* 2. Danh sách khóa học */}
        {courseList.map((course) => (
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
              
              {/* Removed Status Badge here as requested */}
              
              {/* Hover Overlay with Edit Button */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                <button 
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
                <h3 className="font-bold text-gray-800 line-clamp-2 mb-2 text-sm" title={course.title}>
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

      {/* Modal is rendered here */}
      <CreateCourseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreate={handleCreateCourse} 
      />
    </>
  );
}