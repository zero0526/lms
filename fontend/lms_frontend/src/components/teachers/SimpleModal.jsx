import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const SimpleModal = ({ isOpen, onClose, onSave, title, placeholder, initialValue = "" }) => {
  const [value, setValue] = useState(initialValue);

  // Reset hoặc cập nhật giá trị khi modal mở lại hoặc initialValue thay đổi
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue, isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!value.trim()) {
      alert("Please enter a value");
      return;
    }

    console.log("=== SIMPLE MODAL: CONFIRM ===");
    console.log(`Input Value: ${value}`);
    
    try {
      await onSave(value);  // ← Đợi onSave hoàn thành
      console.log("onSave completed successfully");
    } catch (error) {
      console.error("onSave failed:", error);
      // ← KHÔNG đóng modal nếu có lỗi
      return;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden animate-fade-in">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">{title}</h3>
          <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-red-500"/></button>
        </div>
        <div className="p-6">
          <input 
            type="text" autoFocus
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#00b6b6] outline-none transition"
            placeholder={placeholder}
            value={value} onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
          />
        </div>
        <div className="p-4 border-t flex justify-end gap-2 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium">Cancel</button>
          <button onClick={handleConfirm} className="px-4 py-2 bg-[#00b6b6] text-white rounded-lg hover:bg-[#009e9e] text-sm font-bold shadow-sm">Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default SimpleModal;