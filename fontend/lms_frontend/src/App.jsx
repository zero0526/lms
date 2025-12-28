import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { UserProvider, useUser } from "./contexts/UserContext";

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

// Forum Page
import Forum from "./pages/Forum";

import ProtectedRoute from "./components/ProtectedRoute";

function OAuthCallbackHandler() {
  const location = useLocation();
  const { setUser } = useUser();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    const userId = params.get("id");
    const userName = params.get("fullName");
    const userEmail = params.get("email");
    const userRole = params.get("role");
    const userAvatar = params.get("pictureUrl");
    const errorMsg = params.get("error");

    // Nếu có error từ OAuth
    if (errorMsg) {
      console.error("OAuth Error:", errorMsg);
      alert("Login failed: " + errorMsg);
      window.history.replaceState({}, document.title, location.pathname);
      return;
    }

    if (userId && userEmail) {
      console.log("OAuth2 Success - Processing user data");
      console.log("URL params:", { userId, userName, userEmail, userRole, userAvatar });

      const savedRemember = sessionStorage.getItem('oauth_remember') === 'true';
      console.log("Remember preference:", savedRemember);

      const cleanRole = userRole?.replace('ROLE_ROLE_', 'ROLE_') || "ROLE_STUDENT";
      
      const userToSave = {
        userId: parseInt(userId),
        userName: decodeURIComponent(userName || userEmail.split('@')[0]),
        email: userEmail,
        role: cleanRole,
        avatar: userAvatar || null,
        pictureUrl: userAvatar || null
      };

      console.log("User data to save:", userToSave);

      const userString = JSON.stringify(userToSave);

      if (savedRemember) {
        console.log("Saving user to localStorage");
        localStorage.setItem('user', userString);
        // Clear tokens cũ nếu có (từ normal login)
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } else {
        console.log("Saving user to sessionStorage");
        sessionStorage.setItem('user', userString);
        // Clear tokens cũ
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
      }

      setUser(userToSave);

      console.log("OAuth tokens are in HTTP-only cookies");

      window.history.replaceState({}, document.title, location.pathname);
      
      console.log("OAuth login completed");

      sessionStorage.removeItem('oauth_remember');

      const savedRedirect = sessionStorage.getItem('oauth_redirect');
      if (savedRedirect && savedRedirect !== location.pathname) {
        console.log("Redirecting to saved URL:", savedRedirect);
        sessionStorage.removeItem('oauth_redirect');
        sessionStorage.removeItem('oauth_course_name');
        window.location.href = savedRedirect;
      }
    }
  }, [location, setUser]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        {/* OAuth Handler chạy global */}
        <OAuthCallbackHandler />
        
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
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

          {/* --- FORUM ROUTE --- */}
          <Route 
            path="/forum/:courseId" 
            element={
              <ProtectedRoute allowedRoles={["ROLE_STUDENT", "ROLE_TEACHER"]}>
                <Forum />
              </ProtectedRoute>
            } 
          />

        </Routes>
      </UserProvider>
    </BrowserRouter>
  );
}