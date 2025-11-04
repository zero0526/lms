import React, { useRef } from "react";
import CourseCard from "./CourseCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CourseDevelopmentSection() {
  const scrollRef = useRef(null);

  const recommendedCourses = [
    {
      id: 1,
      title: "AWS Certified solutions Architect",
      subtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
      category: "Design",
      duration: "3 Month",
      instructor: "Lina",
      oldPrice: 100,
      price: 80,
      img: "https://picsum.photos/200/150?1",
      studentNums: 2300,
      lessonNums: 15,
      rating: 4.8,
    },
    {
      id: 2,
      title: "AWS Certified solutions Architect",
      subtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
      category: "Design",
      duration: "3 Month",
      instructor: "Lina",
      oldPrice: 100,
      price: 80,
      img: "https://picsum.photos/200/150?2",
      studentNums: 1800,
      lessonNums: 12,
      rating: 4.7,
    },
    {
      id: 3,
      title: "AWS Certified solutions Architect",
      subtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
      category: "Design",
      duration: "3 Month",
      instructor: "Lina",
      oldPrice: 100,
      price: 80,
      img: "https://picsum.photos/200/150?3",
      studentNums: 2100,
      lessonNums: 10,
      rating: 4.9,
    },
    {
      id: 4,
      title: "AWS Certified solutions Architect",
      subtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
      category: "Design",
      duration: "3 Month",
      instructor: "Lina",
      oldPrice: 100,
      price: 80,
      img: "https://picsum.photos/200/150?4",
      studentNums: 1900,
      lessonNums: 9,
      rating: 4.6,
    },
    {
      id: 5,
      title: "AWS Certified solutions Architect",
      subtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
      category: "Design",
      duration: "3 Month",
      instructor: "Lina",
      oldPrice: 100,
      price: 80,
      img: "https://picsum.photos/200/150?5",
      studentNums: 1900,
      lessonNums: 9,
      rating: 4.6,
    },
    {
      id: 6,
      title: "AWS Certified solutions Architect",
      subtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor",
      category: "Design",
      duration: "3 Month",
      instructor: "Lina",
      oldPrice: 100,
      price: 80,
      img: "https://picsum.photos/200/150?6",
      studentNums: 2100,
      lessonNums: 10,
      rating: 4.9,
    },
  ];

  // 👉 logic cuộn
  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const scrollAmount = clientWidth * 0.9; // cuộn 90% chiều rộng mỗi lần
    scrollRef.current.scrollTo({
      left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="bg-[#ecfaff] py-12">
      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-semibold text-gray-800">
            Recommended for you
          </h2>
          <button className="text-sky-600 font-semibold hover:underline cursor-pointer">
            See all
          </button>
        </div>

        {/* Course List - Cuộn ngang */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide scroll-smooth space-x-6"
        >
          {recommendedCourses.map((course) => (
            <div key={course.id} className="flex-shrink-0 w-[300px]">
              <CourseCard course={course} />
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-end gap-2 mt-8">
          <button
            onClick={() => scroll("left")}
            className="bg-teal-100 hover:bg-teal-500 text-teal-600 p-2 rounded cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="bg-teal-100 hover:bg-teal-500 text-teal-600 p-2 rounded cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
