import React, { useState } from "react";
import { Plus, Clock, MoreVertical, Edit3 } from "lucide-react";

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

  const CreateNewCard = ({ className }) => (
    <div
      className={`border-2 border-dashed border-[#00b6b6] bg-teal-50/30 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-teal-50 transition group ${className}`}
    >
      <div className="w-14 h-14 bg-[#00b6b6] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition duration-300">
        <Plus size={28} className="text-white" />
      </div>
      <p className="mt-4 font-bold text-gray-700 group-hover:text-[#00b6b6]">
        Create Course
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
        </div>
      </div>

      {/* --- LOGIC Display --- */}
      {developmentCourses.length === 0 ? (
        // No COURSES IN DEVELOPMENT (Empty State)
        <div className="min-h-[500px] flex flex-col items-center justify-center bg-white rounded-xl border border-gray-100 shadow-sm">
          <CreateNewCard className="w-64 h-48" />
          <p className="mt-8 text-gray-400 text-sm uppercase tracking-wider font-medium">
            No courses in development
          </p>
        </div>
      ) : (
        // HAS COURSES IN DEVELOPMENT (Display Grid, Create button first)
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          
          {/* Card 1: Create button always first */}
          <CreateNewCard className="w-full h-[280px]" />

          {/* Courses in development */}
          {developmentCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition h-[280px] flex flex-col group relative"
            >
              {/* Image */}
              <div className="h-40 bg-gray-200 relative overflow-hidden">
                <img
                  src={course.img}
                  alt={course.title}
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                />
                {/* Status badge */}
                <div className="absolute top-3 left-3 bg-black/60 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">
                  {course.status}
                </div>
                {/* Quick Edit button on hover */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                    <button className="bg-white text-gray-800 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-[#00b6b6] hover:text-white transition">
                        <Edit3 size={16}/> Edit Course
                    </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-gray-800 line-clamp-2 mb-2">
                    {course.title}
                  </h3>
                  <div className="flex items-center text-xs text-gray-500 gap-1">
                    <Clock size={12} />
                    Edited {course.lastEdited}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mr-3">
                    <div className="bg-yellow-400 h-1.5 rounded-full w-1/3"></div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}