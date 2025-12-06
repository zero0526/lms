import React, { useState } from "react";
import { Plus } from "lucide-react";
import DevelopmentCourseGrid from "../../components/teachers/DevelopmentCourseGrid";

export default function CourseDevelopmentContent() {
  const [developmentCourses, setDevelopmentCourses] = useState([
    {
      id: 1,
      title: "Complete Python Bootcamp",
      status: "Draft",
      lastEdited: "2 hours ago",
      img: "https://picsum.photos/300/200?random=1",
    },
    {
      id: 2,
      title: "Advanced React Patterns",
      status: "Review",
      lastEdited: "1 day ago",
      img: "https://picsum.photos/300/200?random=2",
    },
  ]);

  // Thẻ Create New lớn (Dành cho Empty State)
  const EmptyStateCard = () => (
    <div className="min-h-[500px] flex flex-col items-center justify-center bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="w-64 h-48 border-2 border-dashed border-[#00b6b6] bg-teal-50/30 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-teal-50 transition group">
        <div className="w-14 h-14 bg-[#00b6b6] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition duration-300">
          <Plus size={28} className="text-white" />
        </div>
        <p className="mt-4 font-bold text-gray-700 group-hover:text-[#00b6b6]">
          Create Course
        </p>
      </div>
      <p className="mt-8 text-gray-400 text-sm uppercase tracking-wider font-medium">
        No courses in development
      </p>
    </div>
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800">
            Course Development
          </h1>
          <div className="flex items-center text-xs bg-gray-200 rounded-full px-3 py-1 text-gray-600">
             Developing: <span className="text-[#00b6b6] font-bold mx-1">{developmentCourses.length}</span>
          </div>
        </div>
      </div>

      {/* --- LOGIC DISPLAY --- */}
      {developmentCourses.length === 0 ? (
        <EmptyStateCard />
      ) : (
        <DevelopmentCourseGrid courses={developmentCourses} />
      )}
    </div>
  );
}