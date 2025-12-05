import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles, children }) => {
  let storedUser = localStorage.getItem("user");
  if (!storedUser) storedUser = sessionStorage.getItem("user");

  if (!storedUser) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(storedUser);

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/home" replace />; 
  }

  return children;
};

export default ProtectedRoute;