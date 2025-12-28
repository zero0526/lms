import { useState } from "react";
import { X, Video, Loader2, Copy, Check, ExternalLink } from "lucide-react";

export default function CreateMeetingModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading = false,
  successResult = null // { message, link }
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert("Please enter a meeting title");
      return;
    }

    onSubmit({ title: title.trim(), description: description.trim() });
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setCopied(false);
    onClose();
  };

  const handleCopyLink = () => {
    if (successResult?.link) {
      navigator.clipboard.writeText(successResult.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleJoinMeeting = () => {
    if (successResult?.link) {
      window.open(successResult.link, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-purple-500 to-pink-500">
          <div className="flex items-center gap-3">
            <Video className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">
              {successResult ? "Meeting Created!" : "Start Live Session"}
            </h2>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-full transition"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Content */}
        {successResult ? (
          // Success State
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-gray-700 mb-2">Your meeting has been created successfully!</p>
              <p className="text-sm text-gray-500">Share the link below with your students</p>
            </div>

            {/* Meeting Link */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
              <p className="text-xs text-gray-500 mb-2">Meeting Link:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={successResult.link || ""}
                  readOnly
                  className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  title="Copy link"
                >
                  {copied ? (
                    <Check size={18} className="text-green-600" />
                  ) : (
                    <Copy size={18} className="text-gray-600" />
                  )}
                </button>
              </div>
              {copied && (
                <p className="text-xs text-green-600 mt-2">Link copied to clipboard!</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition"
              >
                Close
              </button>
              <button
                onClick={handleJoinMeeting}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition flex items-center justify-center gap-2"
              >
                <ExternalLink size={18} />
                Join Meeting
              </button>
            </div>
          </div>
        ) : (
          // Form State
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Live Q&A Session"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description about this live session..."
                rows={3}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1 text-right">{description.length}/500</p>
            </div>

            {/* Info Box */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <p className="text-sm text-purple-700">
                <strong>Note:</strong> A notification will be sent to all enrolled students with the meeting link.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !title.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Video size={18} />
                    Create Meeting
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
