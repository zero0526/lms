import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Blog from "./pages/Blog";
import CourseStudent from "./pages/student/CourseStudent";
import CourseDetail from "./pages/student/CourseDetail";
import LessonDetail from "./pages/student/LessonDetail";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/courses" element={<CourseStudent />} />
        <Route path="/course/course-detail" element={<CourseDetail />} />
        <Route path="/course/course-detail/lesson-detail" element={<LessonDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
