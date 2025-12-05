import React, { useState } from "react";
import Navbar from "../../components/Navbar"; 
import Footer from "../../components/Footer"; 
import Sidebar from "../../components/teachers/Sidebar";
import CourseDevelopmentContent from "./CourseDevelopmentContent";
import MyCoursesContent from "./MyCoursesContent";

export default function TeacherStudio() {
  const [activeMenu, setActiveMenu] = useState("lectures");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      {/* Main Container */}
      <div className="flex flex-1 pt-[72px] max-w-[1920px] mx-auto w-full">
        
        {/* === SIDEBAR === */}
        <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

        {/* === MAIN CONTENT === */}
        <main className="flex-1 lg:ml-64 overflow-y-auto min-h-[calc(100vh-72px)]">
          
          {/* Conditional Rendering dựa trên activeMenu */}
          {activeMenu === "lectures" && <MyCoursesContent />}
          {activeMenu === "settings" && <CourseDevelopmentContent />}
          
        </main>
      </div>
    </div>
  );
}