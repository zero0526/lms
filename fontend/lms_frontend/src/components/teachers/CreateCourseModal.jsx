import { useState, useRef } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";

export default function CreateCourseModal({ isOpen, onClose, onCreate }) {
  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    courseTarget: "",
    precondition: "",
    tags: ""
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) return alert("Please enter a course title");

    // Gửi toàn bộ dữ liệu ra ngoài cho component cha xử lý
    onCreate({
      ...formData,
      thumbnail: imageFile,
      preview: imagePreview // Dùng để hiển thị tạm nếu cần
    });

    // Reset form
    setFormData({ title: "", desc: "", courseTarget: "", precondition: "", tags: "" });
    setImageFile(null);
    setImagePreview(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-800 text-lg">Create New Course</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
          {/* Row 1: Title & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Course Title <span className="text-red-500">*</span></label>
              <input 
                name="title"
                className="input-field"
                placeholder="e.g. ReactJS from Zero to Hero"
                value={formData.title} onChange={handleInputChange}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Tags (comma separated)</label>
              <input 
                name="tags"
                className="input-field"
                placeholder="e.g. react, javascript, frontend"
                value={formData.tags} onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
            <textarea 
              name="desc"
              rows={3}
              className="input-field resize-none"
              placeholder="Briefly describe your course content..."
              value={formData.desc} onChange={handleInputChange}
            />
          </div>

          {/* Row 2: Targets & Preconditions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Course Target</label>
              <textarea 
                name="courseTarget"
                rows={2}
                className="input-field resize-none"
                placeholder="Who is this course for?"
                value={formData.courseTarget} onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Preconditions</label>
              <textarea 
                name="precondition"
                rows={2}
                className="input-field resize-none"
                placeholder="Required knowledge before starting..."
                value={formData.precondition} onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Thumbnail</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl h-40 flex flex-col items-center justify-center cursor-pointer hover:bg-teal-50 hover:border-[#00b6b6] transition relative overflow-hidden group bg-gray-50"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-gray-400 group-hover:text-[#00b6b6]">
                  <Upload size={32} className="mb-2" />
                  <p className="text-sm font-medium">Click to upload thumbnail</p>
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSubmit} className="btn-primary">Create Course</button>
        </div>
      </div>

      <style jsx>{`
        .input-field {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          padding: 0.5rem 1rem;
          outline: none;
          transition: all 0.2s;
        }
        .input-field:focus {
          border-color: #00b6b6;
          box-shadow: 0 0 0 2px rgba(0, 182, 182, 0.2);
        }
        .btn-primary {
          padding: 0.5rem 1.5rem;
          background-color: #00b6b6;
          color: white;
          font-weight: bold;
          border-radius: 0.5rem;
          transition: background-color 0.2s;
        }
        .btn-primary:hover { background-color: #009e9e; }
        .btn-secondary {
          padding: 0.5rem 1.5rem;
          color: #4b5563;
          font-weight: 500;
          border-radius: 0.5rem;
        }
        .btn-secondary:hover { background-color: #e5e7eb; }
      `}</style>
    </div>
  );
}