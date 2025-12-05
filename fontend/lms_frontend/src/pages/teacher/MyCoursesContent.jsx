import React from "react";
import StudentCourseCard from "../../components/courses/StudentCourseCard"; 
import { BookOpen } from "lucide-react";

export default function MyCoursesContent() {
  const myCourses = [
    {
      id: 1,
      title: "AWS Certified solutions Architect",
      subtitle: "Comprehensive guide to AWS architecture.",
      category: "Design",
      price: 80,
      img: "https://picsum.photos/200/150?1",
      studentNums: 2300,
      lessonNums: 15,
      rating: 4.8,
    },
    {
      id: 2,
      title: "React JS - The Complete Guide",
      subtitle: "Master React with modern practices.",
      category: "Development",
      price: 120,
      img: "https://picsum.photos/200/150?2",
      studentNums: 1500,
      lessonNums: 20,
      rating: 4.9,
    },
  ];

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">My Courses</h1>
        {myCourses.length > 0 && (
          <div className="text-sm text-gray-500">
            Total: <span className="font-bold text-[#00b6b6]">{myCourses.length}</span> courses
          </div>
        )}
      </div>

      {/* --- LOGIC HIỂN THỊ EMPTY STATE --- */}
      {myCourses.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mb-6">
            <BookOpen size={40} className="text-[#00b6b6]" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No courses published yet</h3>
          <p className="text-gray-500 text-center max-w-md">
            You haven't published any courses yet. Go to <span className="font-bold text-[#00b6b6]">Course Development</span> to create and publish your first course.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {myCourses.map((course) => (
            <div key={course.id} className="w-full">
              <StudentCourseCard course={course} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}