import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Blog from "./pages/Blog";
import CourseStudent from "./pages/student/CourseStudent";
import TeacherStudio from "./pages/teacher/TeacherStudio";
import CourseDetail from "./pages/student/CourseDetail";
import TeacherCourseDetail from "./pages/teacher/CourseDetail";
import LessonDetail from "./pages/student/LessonDetail";
import ProtectedRoute from "./components/ProtectedRoute";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect mặc định */}
        <Route path="/" element={<Navigate to="/home" />} />
        
        {/* Public Routes */}
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/blog" element={<Blog />} />
        
        {/* --- STUDENT ROUTES --- */}
        {/* Đổi từ /courses sang /student/courses cho rõ ràng */}
        <Route 
          path="/student/courses" 
          element={
            <ProtectedRoute allowedRoles={["ROLE_STUDENT"]}>
              <CourseStudent />
            </ProtectedRoute>
          } 
        />
        
        {/* Các trang chi tiết có thể cho cả 2 role xem hoặc cần logic riêng */}
        <Route path="/course/course-detail" element={<CourseDetail />} />
        <Route path="/course/course-detail/lesson-detail" element={<LessonDetail />} />

        {/* --- TEACHER ROUTES --- */}
        <Route 
          path="/teacher/courses" 
          element={
            <ProtectedRoute allowedRoles={["ROLE_TEACHER"]}>
              <TeacherStudio />
            </ProtectedRoute>
          } 
        />

      </Routes>
    </BrowserRouter>
  );
}