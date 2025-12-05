import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CourseCard from "./StudentCourseCard";

export default function CourseRecommendationSection() {
  const scrollRef = useRef(null);

  const recommendedCourses = [
    { id: 1, title: "AWS Certified solutions Architect", subtitle: "Lorem ipsum dolor sit amet", category: "Design", price: 80, img: "https://picsum.photos/200/150?1", studentNums: 2300, lessonNums: 15, rating: 4.8 },
    { id: 2, title: "AWS Certified solutions Architect", subtitle: "Lorem ipsum dolor sit amet", category: "Design", price: 80, img: "https://picsum.photos/200/150?2", studentNums: 1800, lessonNums: 12, rating: 4.7 },
    { id: 3, title: "AWS Certified solutions Architect", subtitle: "Lorem ipsum dolor sit amet", category: "Design", price: 80, img: "https://picsum.photos/200/150?3", studentNums: 2100, lessonNums: 10, rating: 4.9 },
    { id: 4, title: "AWS Certified solutions Architect", subtitle: "Lorem ipsum dolor sit amet", category: "Design", price: 80, img: "https://picsum.photos/200/150?4", studentNums: 1900, lessonNums: 9, rating: 4.6 },
    { id: 5, title: "AWS Certified solutions Architect", subtitle: "Lorem ipsum dolor sit amet", category: "Design", price: 80, img: "https://picsum.photos/200/150?5", studentNums: 1900, lessonNums: 9, rating: 4.6 },
    { id: 6, title: "AWS Certified solutions Architect", subtitle: "Lorem ipsum dolor sit amet", category: "Design", price: 80, img: "https://picsum.photos/200/150?6", studentNums: 2100, lessonNums: 10, rating: 4.9 },
  ];

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    
    const firstCard = scrollRef.current.children[0];
    if (!firstCard) return;

    const cardWidth = firstCard.offsetWidth; // Chiều rộng thẻ
    const gap = 24; // gap-6 trong Tailwind tương đương 24px
    const scrollAmount = cardWidth + gap; // Tổng khoảng cách cần cuộn (Thẻ + Gap)

    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            Recommended for you
          </h2>
          <button className="text-[#00b6b6] font-semibold hover:underline cursor-pointer">
            See all
          </button>
        </div>

        {/* Course List - Cuộn ngang */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide scroll-smooth gap-6 py-4"
        >
          {recommendedCourses.map((course) => (
            <div 
              key={course.id} 
              className="flex-shrink-0 w-full md:w-[calc((100%-24px)/2)] lg:w-[calc((100%-48px)/3)] xl:w-[calc((100%-72px)/4)]"
            >
              <CourseCard course={course} />
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => scroll("left")}
            className="bg-teal-100 hover:bg-[#00b6b6] hover:text-white text-[#00b6b6] p-3 rounded-lg transition duration-300 shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="bg-teal-100 hover:bg-[#00b6b6] hover:text-white text-[#00b6b6] p-3 rounded-lg transition duration-300 shadow-sm"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}