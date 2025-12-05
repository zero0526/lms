import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Blog from "./pages/Blog";
import CourseStudent from "./pages/student/CourseStudent";
import TeacherStudio from "./pages/teacher/TeacherStudio";
import StudentCourseDetail from "./pages/student/StudentCourseDetail";
import TeacherCourseDetail from "./pages/teacher/TeacherCourseDetail";
import EditCourse from "./pages/teacher/EditCourse";
import LessonDetail from "./pages/student/LessonDetail";
import ProtectedRoute from "./components/ProtectedRoute";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/home" />} />
        
        {/* Public Routes */}
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/blog" element={<Blog />} />
        
        {/* --- STUDENT ROUTES --- */}
        <Route 
          path="/student/courses" 
          element={
            <ProtectedRoute allowedRoles={["ROLE_STUDENT"]}>
              <CourseStudent />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/student/courses/course/course-detail" 
          element={
            <ProtectedRoute allowedRoles={["ROLE_STUDENT"]}>
              <StudentCourseDetail />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/student/courses/course/course-detail/lesson-detail" 
          element={
            <ProtectedRoute allowedRoles={["ROLE_STUDENT"]}>
              <LessonDetail />
            </ProtectedRoute>
          } 
        />
        
        {/* --- TEACHER ROUTES --- */}
        <Route 
          path="/teacher/courses" 
          element={
            <ProtectedRoute allowedRoles={["ROLE_TEACHER"]}>
              <TeacherStudio />
            </ProtectedRoute>
          } 
        />

          <Route 
            path="/teacher/courses/course/course-detail" 
            element={
              <ProtectedRoute allowedRoles={["ROLE_TEACHER"]}>
                <TeacherCourseDetail />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/teacher/courses/course/course-detail/edit/:courseId" 
            element={
              <ProtectedRoute allowedRoles={["ROLE_TEACHER"]}>
                <EditCourse />
              </ProtectedRoute>
            } 
          />

      </Routes>
    </BrowserRouter>
  );
}