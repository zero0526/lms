import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, CheckCircle, AlertCircle, Loader, Lock, ArrowLeft } from "lucide-react";
import { resetPassword } from "../api/user/authApi";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const token = searchParams.get("token");
  const userId = searchParams.get("userId");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);

  // Validate token and userId when loading page
  useEffect(() => {
    if (!token || !userId) {
      setError("Invalid reset link. Please request a new password reset.");
    }
  }, [token, userId]);

  // Password validation rules
  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    
    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    
    if (!/[@$!%*?&#]/.test(password)) {
      errors.push("Password must contain at least one special character (@$!%*?&#)");
    }
    
    return errors;
  };

  // Real-time validation when entering password
  useEffect(() => {
    if (newPassword) {
      const errors = validatePassword(newPassword);
      setValidationErrors(errors);
    } else {
      setValidationErrors([]);
    }
  }, [newPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation checks
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      setError("Password does not meet requirements");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!token || !userId) {
      setError("Invalid reset link");
      return;
    }

    try {
      setIsLoading(true);
      
      await resetPassword(token, userId, newPassword);
      
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login", { 
          state: { 
            message: "Password reset successful! Please log in with your new password." 
          } 
        });
      }, 3000);
      
    } catch (err) {
      console.error("Reset password error:", err);
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Success State
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-in zoom-in duration-300">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={48} className="text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Password Reset Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your password has been successfully reset. You will be redirected to the login page shortly.
          </p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Loader size={16} className="animate-spin" />
            <span>Redirecting to login...</span>
          </div>
        </div>
      </div>
    );
  }

  // Invalid Link State
  if (!token || !userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertCircle size={48} className="text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Invalid Reset Link</h2>
          <p className="text-gray-600 mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-[#00b6b6] text-white rounded-full font-medium hover:bg-[#009e9e] transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Main Form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-6">
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 text-white hover:text-teal-100 transition mb-4"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">Back to Login</span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-full">
              <Lock size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Reset Password</h2>
              <p className="text-teal-100 text-sm">Enter your new password below</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter new password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Confirm new password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            {newPassword && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-700 mb-2">Password Requirements:</p>
                <ul className="space-y-1.5">
                  {[
                    { label: "At least 8 characters", valid: newPassword.length >= 8 },
                    { label: "One uppercase letter", valid: /[A-Z]/.test(newPassword) },
                    { label: "One lowercase letter", valid: /[a-z]/.test(newPassword) },
                    { label: "One number", valid: /\d/.test(newPassword) },
                    { label: "One special character (@$!%*?&#)", valid: /[@$!%*?&#]/.test(newPassword) }
                  ].map((req, index) => (
                    <li key={index} className="flex items-center gap-2 text-xs">
                      {req.valid ? (
                        <CheckCircle size={14} className="text-green-500" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300" />
                      )}
                      <span className={req.valid ? "text-green-700" : "text-gray-600"}>
                        {req.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Password Match Indicator */}
            {confirmPassword && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                newPassword === confirmPassword 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                {newPassword === confirmPassword ? (
                  <>
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-sm text-green-700">Passwords match</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} className="text-red-600" />
                    <span className="text-sm text-red-700">Passwords do not match</span>
                  </>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full px-4 py-3 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
              disabled={isLoading || validationErrors.length > 0 || !newPassword || !confirmPassword}
            >
              {isLoading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}