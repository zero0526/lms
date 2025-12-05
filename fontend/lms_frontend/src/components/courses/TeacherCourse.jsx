import React, { useState } from "react";
import TeacherCourseCard from "../courses/TeacherCourseCard";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function TeacherCourse() {
  const [isExpanded, setIsExpanded] = useState(false);

  const recommendedCourses = [
    {
      id: 1,
      title: "AWS Certified solutions Architect",
      subtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
      category: "Design",
      duration: "3 Month",
      instructor: "Lina",
      oldPrice: 100,
      price: 0,
      img: "https://picsum.photos/200/150?1",
      studentNums: 2300,
      lessonNums: 15,
      rating: 4.8,
    },
    {
      id: 2,
      title: "Machine Learning A-Z",
      subtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
      category: "Data Science",
      duration: "3 Month",
      instructor: "Lina",
      oldPrice: 100,
      price: 0,
      img: "https://picsum.photos/200/150?2",
      studentNums: 1800,
      lessonNums: 12,
      rating: 4.7,
    },
    {
      id: 3,
      title: "The Complete Web Developer Course",
      subtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
      category: "Development",
      duration: "3 Month",
      instructor: "Lina",
      oldPrice: 100,
      price: 0,
      img: "https://picsum.photos/200/150?3",
      studentNums: 2100,
      lessonNums: 10,
      rating: 4.9,
    },
    {
      id: 4,
      title: "React JS - The Complete Guide",
      subtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
      category: "Development",
      duration: "3 Month",
      instructor: "Lina",
      oldPrice: 100,
      price: 0,
      img: "https://picsum.photos/200/150?4",
      studentNums: 1900,
      lessonNums: 9,
      rating: 4.6,
    },
    {
      id: 5,
      title: "Python for Data Science and Machine Learning",
      subtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
      category: "Data Science",
      duration: "3 Month",
      instructor: "Lina",
      oldPrice: 100,
      price: 0,
      img: "https://picsum.photos/200/150?5",
      studentNums: 1900,
      lessonNums: 9,
      rating: 4.6,
    },
    {
      id: 6,
      title: "Docker and Kubernetes: The Complete Guide",
      subtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
      category: "DevOps",
      duration: "3 Month",
      instructor: "Lina",
      oldPrice: 100,
      price: 0,
      img: "https://picsum.photos/200/150?6",
      studentNums: 2100,
      lessonNums: 10,
      rating: 4.9,
    },
  ];

  // Logic cắt danh sách khóa học
  // Nếu đang mở rộng (isExpanded = true) -> lấy hết
  // Nếu đang thu gọn (isExpanded = false) -> chỉ lấy 4 phần tử đầu
  const displayedCourses = isExpanded ? recommendedCourses : recommendedCourses.slice(0, 4);

  return (
    <section className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            My Courses
          </h2>
          
          {/* Chỉ hiện nút bấm nếu tổng số khóa học lớn hơn 4 */}
          {recommendedCourses.length > 4 && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[#00b6b6] font-semibold hover:underline cursor-pointer flex items-center gap-1 transition-all"
            >
              {isExpanded ? "Shorten" : "See all"}
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          )}
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedCourses.map((course) => (
            <div key={course.id} className="w-full">
              <TeacherCourseCard course={course} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}