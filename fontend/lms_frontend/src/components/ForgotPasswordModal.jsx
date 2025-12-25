import React, { useState } from "react";
import { X, Mail, CheckCircle, AlertCircle, Loader } from "lucide-react";
import { requestForgotPassword } from "../api/user/authApi";

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Không render nếu modal đóng
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setIsLoading(true);
      
      console.log("Sending forgot password request for:", email);
      
      await requestForgotPassword(email);
      
      setSuccess(true);
      setEmail("");
      
      // Auto close modal after 5 seconds
      setTimeout(() => {
        handleClose();
      }, 5000);
      
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setError("");
    setSuccess(false);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-6 relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-1 transition"
          >
            <X size={24} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-full">
              <Mail size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Forgot Password?</h2>
              <p className="text-teal-100 text-sm">No worries, we'll send you reset instructions</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {success ? (
            // Success State
            <div className="text-center space-y-4 py-4 animate-in fade-in zoom-in duration-300">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle size={40} className="text-green-600" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-800">Request Sent!</h3>
                <p className="text-sm text-green-600 font-medium px-4">
                  Requested successfully. Please check your email and follow the guided steps.
                </p>
                <p className="text-xs text-gray-500 px-4">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
              </div>

              <button
                onClick={handleClose}
                className="mt-4 px-6 py-2 bg-teal-500 text-white rounded-full font-medium hover:bg-teal-600 transition"
              >
                Close
              </button>
            </div>
          ) : (
            // Form State
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter your registered email"
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Info Message */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <span className="font-semibold">Note:</span> The reset link will be sent to your email and will expire 24 hours.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}