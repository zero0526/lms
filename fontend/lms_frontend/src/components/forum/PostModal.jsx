import { useState } from "react";
import { X, Loader2 } from "lucide-react";

export default function PostModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null,
  courseId,
  isLoading = false 
}) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [isPinned, setIsPinned] = useState(initialData?.isPinned || false);

  const isEdit = !!initialData;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      alert("Please fill in all fields");
      return;
    }

    onSubmit({
      courseId: parseInt(courseId),
      title: title.trim(),
      content: content.trim(),
      isPinned
    });
  };

  const handleClose = () => {
    setTitle("");
    setContent("");
    setIsPinned(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {isEdit ? "Edit Post" : "Create New Post"}
          </h2>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#00b6b6] focus:border-transparent outline-none transition"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1 text-right">{title.length}/200</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content..."
              rows={6}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#00b6b6] focus:border-transparent outline-none transition resize-none"
              maxLength={2000}
            />
            <p className="text-xs text-gray-500 mt-1 text-right">{content.length}/2000</p>
          </div>

          {/* Pin option - only for teachers */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPinned"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 text-[#00b6b6] border-gray-300 rounded focus:ring-[#00b6b6]"
            />
            <label htmlFor="isPinned" className="text-sm text-gray-700">
              Pin this post to the top
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim() || !content.trim()}
              className="px-6 py-2.5 bg-[#00b6b6] text-white rounded-lg font-medium hover:bg-[#009e9e] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading && <Loader2 size={18} className="animate-spin" />}
              {isEdit ? "Update" : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
