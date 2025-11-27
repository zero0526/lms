import React from "react";
import Navbar from "../../components/Navbar";
import LearningSection from "../../components/courses/LearningSection";
import CourseRecommendationSection from "../../components/courses/CourseRecommendationSection";
import Footer from "../../components/Footer";

export default function Course() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="w-full mt-19">
        <LearningSection />
        <CourseRecommendationSection />
      </main>
      <Footer />
    </div>
  );
}
