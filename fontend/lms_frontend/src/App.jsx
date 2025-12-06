import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Blog from "./pages/Blog";

// Student Pages
import CourseStudent from "./pages/student/CourseStudent";
import StudentCourseDetail from "./pages/student/StudentCourseDetail";
import LessonDetail from "./pages/student/LessonDetail";

// Teacher Pages
import TeacherStudio from "./pages/teacher/TeacherStudio";
import TeacherCourseDetail from "./pages/teacher/TeacherCourseDetail";
import EditCourse from "./pages/teacher/EditCourse";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/" element={<Navigate to="/home" />} />
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
          path="/student/courses/:courseId" 
          element={
            <ProtectedRoute allowedRoles={["ROLE_STUDENT"]}>
              <StudentCourseDetail />
            </ProtectedRoute>
          } 
        />

        <Route
          path="/student/courses/:courseId/lessons/:lessonId" 
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
          path="/teacher/courses/:courseId" 
          element={
            <ProtectedRoute allowedRoles={["ROLE_TEACHER"]}>
              <TeacherCourseDetail />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/teacher/courses/:courseId/edit" 
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