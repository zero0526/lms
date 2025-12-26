import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";

// Public Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Profile from "./pages/Profile";
import CourseList from "./pages/CourseList";
import ResetPassword from './pages/ResetPassword';
import CourseDetail from "./pages/CourseDetail";

// Student Pages
import CourseStudent from "./pages/student/CourseStudent";
import StudentCourseDetail from "./pages/student/StudentCourseDetail";
import LessonDetail from "./pages/student/LessonDetail";
import QuizResult from "./pages/student/QuizResult";

// Teacher Pages
import TeacherStudio from "./pages/teacher/TeacherStudio";
import TeacherCourseDetail from "./pages/teacher/TeacherCourseDetail";
import EditCourse from "./pages/teacher/EditCourse";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <Routes>
          {/* --- PUBLIC ROUTES (Ai cũng xem được) --- */}
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:category" element={<BlogDetail/>} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/courses" element={<CourseList />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />

          {/* --- PROTECTED ROUTES --- */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute allowedRoles={["ROLE_STUDENT", "ROLE_TEACHER"]}>
                <Profile />
              </ProtectedRoute>
            } 
          />
          
          {/* --- STUDENT ROUTES --- */}
          <Route 
            path="/student/courses" 
            element={
              <ProtectedRoute allowedRoles={["ROLE_STUDENT"]}>
                <CourseStudent />
              </ProtectedRoute>
            } 
          />

          {/* Giữ lại route cũ nếu cần backward compatibility, nhưng redirect về route public mới */}
          <Route 
            path="/student/courses/:courseId" 
            element={
              <ProtectedRoute allowedRoles={["ROLE_STUDENT"]}>
                <StudentCourseDetail />
              </ProtectedRoute>
            } 
          />

          <Route
            path="/student/quiz-result/:attemptId" 
            element={
              <ProtectedRoute allowedRoles={["ROLE_STUDENT"]}>
                <QuizResult />
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
      </UserProvider>
    </BrowserRouter>
  );
}