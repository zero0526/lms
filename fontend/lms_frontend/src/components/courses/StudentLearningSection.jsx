import React, { useRef } from "react";
import LearningCard from "./StudentLearningCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function StudentLearningSection() {
  const scrollRef = useRef(null);

  const courses = [
    { id: 1, title: "AWS Certified Solutions Architect", instructor: "Lina", progress: 5, totalLessons: 7, image: "https://picsum.photos/300/200?1" },
    { id: 2, title: "Machine Learning A–Z", instructor: "David", progress: 2, totalLessons: 10, image: "https://picsum.photos/300/200?2" },
    { id: 3, title: "Data Structures & Algorithms", instructor: "Anna", progress: 4, totalLessons: 9, image: "https://picsum.photos/300/200?3" },
    { id: 4, title: "Fullstack React Development", instructor: "Minh", progress: 3, totalLessons: 8, image: "https://picsum.photos/300/200?4" },
    { id: 5, title: "DevOps with Docker & Kubernetes", instructor: "Sofia", progress: 6, totalLessons: 10, image: "https://picsum.photos/300/200?5" },
    { id: 6, title: "Deep Learning Foundations", instructor: "Lucas", progress: 1, totalLessons: 12, image: "https://picsum.photos/300/200?6" },
  ];

  const scroll = (direction) => {
    const container = scrollRef.current;
    if (container) {
        const scrollAmount = container.offsetWidth * 0.5;
        container.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    }
  };

  return (
    <section className="bg-[#ecfaff] py-10">
      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-3xl text-gray-800">
            Welcome back, ready for your next lesson?
          </h2>
          <button className="text-sky-600 font-bold hover:underline cursor-pointer">
            View History
          </button>
        </div>

        {/* Course Carousel */}
        <div className="relative group">
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-6 scroll-smooth scrollbar-hide py-8 px-2"
          >
            {courses.map((course) => (
              <div key={course.id} className="flex-none w-[300px]">
                <LearningCard course={course} />
              </div>
            ))}
          </div>

          <button
            onClick={() => scroll("left")}
            className="absolute -left-4 top-1/2 -translate-y-1/2 bg-white text-teal-600 hover:bg-teal-500 hover:text-white p-3 rounded-full shadow-lg z-10 transition duration-300 opacity-80 hover:opacity-100"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={() => scroll("right")}
            className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white text-teal-600 hover:bg-teal-500 hover:text-white p-3 rounded-full shadow-lg z-10 transition duration-300 opacity-80 hover:opacity-100"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </section>
  );
}