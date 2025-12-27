import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function ResetPasswordRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Chuyển query params sang route mới
    navigate(`/reset-password${location.search}`, { replace: true });
  }, [navigate, location.search]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}