import { ArrowRight } from "lucide-react";
import CourseCard from "./courses/StudentCourseCard";

const categories = [
  {
    name: "Main Category here",
    icon: "🎓",
    courses: [
      { title: "Main title here. How long can it be ?", subtitle: "subtitle here", rating: "4.7", studentNums: 200, lessonNums: 10, price: 0, img: "https://picsum.photos/200/150?1" },
      { title: "Main title here", subtitle: "subtitle here", rating: "4.7", studentNums: 200, lessonNums: 10, price: 0, img: "https://picsum.photos/200/150?2" },
      { title: "Main title here", subtitle: "subtitle here", rating: "4.7", studentNums: 200, lessonNums: 10, price: 0, img: "https://picsum.photos/200/150?3" },
      { title: "Main title here", subtitle: "subtitle here", rating: "4.7", studentNums: 200, lessonNums: 10, price: 0, img: "https://picsum.photos/200/150?4" },
    ],
  },
  {
    name: "Main Category here",
    icon: "🌕",
    courses: [
      { title: "Main title here", subtitle: "subtitle here", rating: "4.7", studentNums: 200, lessonNums: 10, price: 450, img: "https://picsum.photos/200/150?5" },
      { title: "Main title here", subtitle: "subtitle here", rating: "4.7", studentNums: 200, lessonNums: 10, price: 350, img: "https://picsum.photos/200/150?6" },
      { title: "Main title here", subtitle: "subtitle here", rating: "4.7", studentNums: 200, lessonNums: 10, price: 400, img: "https://picsum.photos/200/150?7" },
    ],
  },
  {
    name: "Main Category here",
    icon: "📷",
    courses: [
      { title: "Main title here", subtitle: "subtitle here", rating: "4.7", studentNums: 200, lessonNums: 10, price: 450, img: "https://picsum.photos/200/150?8" },
      { title: "Main title here", subtitle: "subtitle here", rating: "4.7", studentNums: 200, lessonNums: 10, price: 340, img: "https://picsum.photos/200/150?9" },
      { title: "Main title here", subtitle: "subtitle here", rating: "4.7", studentNums: 200, lessonNums: 10, price: 300, img: "https://picsum.photos/200/150?10" },
    ],
  },
];

export default function ExploreCourses() {
  return (
    <section className="bg-[#E9F4FF] p-4 py-20 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-2">Explore Course</h2>
        <p className="text-gray-700 mb-12">Ut sed eros finibus, placerat orci id, dapibus.</p>

        {categories.map((cat, idx) => (
          <div key={idx} className="mb-16">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <span>{cat.icon}</span> {cat.name}
              </h3>
              <a href="#" className="flex items-center text-[#00b6b6] font-semibold hover:underline">
                SEE ALL <ArrowRight className="ml-1 w-4 h-4" />
              </a>
            </div>

            {/* Thêm scrollbar-hide để ẩn thanh cuộn nếu muốn đẹp hơn */}
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {cat.courses.map((course, i) => (
                <div key={i} className="w-[300px] flex-shrink-0">
                  <CourseCard course={course} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}