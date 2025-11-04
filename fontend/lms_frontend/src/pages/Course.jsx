import React from "react";
import Navbar from "../components/Navbar";
import LearningSection from "../components/LearningSection";
import CourseRecommendationSection from "../components/CourseRecommendationSection";
import Footer from "../components/Footer";
import CourseDevelopmentSection from "../components/CourseDevelopmentSection";
import CourseTeacher from "../components/CourseTeacher";

export default function Course() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="w-full mt-19">
        <LearningSection />
        <CourseRecommendationSection />
        <CourseDevelopmentSection />
        <CourseTeacher />
      </main>
      <Footer />
    </div>
  );
}
