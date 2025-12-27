import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import CourseCard from "./CourseCard";

export default function CourseRecommendationSection() {
  const [currentPage, setCurrentPage] = useState(0);
  const [showTwoRows, setShowTwoRows] = useState(false);

  const COURSES_PER_ROW = 4;
  const coursesPerPage = showTwoRows ? COURSES_PER_ROW * 2 : COURSES_PER_ROW;

  // khóa học giả để test
  const recommendedCourses = [
    { 
      id: 1, 
      title: "AWS Certified Solutions Architect", 
      description: "Learn AWS architecture and cloud computing fundamentals", 
      image: "https://picsum.photos/400/300?1", 
      rating: 4.8,
      studentNums: 2300, 
      numOfChapter: 15,
      chapterNums: 15,
      instructor: "John Doe",
      price: 0
    },
    { 
      id: 2, 
      title: "Complete Web Development Bootcamp", 
      description: "Master HTML, CSS, JavaScript, React and Node.js", 
      image: "https://picsum.photos/400/300?2", 
      rating: 4.7,
      studentNums: 1800, 
      numOfChapter: 12,
      chapterNums: 12,
      instructor: "Jane Smith",
      price: 0
    },
    { 
      id: 3, 
      title: "Python for Data Science", 
      description: "Data analysis, visualization and machine learning with Python", 
      image: "https://picsum.photos/400/300?3", 
      rating: 4.9,
      studentNums: 2100, 
      numOfChapter: 10,
      chapterNums: 10,
      instructor: "Mike Johnson",
      price: 0
    },
    { 
      id: 4, 
      title: "Digital Marketing Masterclass", 
      description: "SEO, Social Media Marketing, Email Marketing and more", 
      image: "https://picsum.photos/400/300?4", 
      rating: 4.6,
      studentNums: 1900, 
      numOfChapter: 9,
      chapterNums: 9,
      instructor: "Sarah Wilson",
      price: 0
    },
    { 
      id: 5, 
      title: "UI/UX Design Fundamentals", 
      description: "Learn design thinking, wireframing, prototyping with Figma", 
      image: "https://picsum.photos/400/300?5", 
      rating: 4.8,
      studentNums: 2500, 
      numOfChapter: 11,
      chapterNums: 11,
      instructor: "Emily Davis",
      price: 0
    },
    { 
      id: 6, 
      title: "Mobile App Development with React Native", 
      description: "Build cross-platform mobile apps for iOS and Android", 
      image: "https://picsum.photos/400/300?6", 
      rating: 4.7,
      studentNums: 1600, 
      numOfChapter: 13,
      chapterNums: 13,
      instructor: "Tom Brown",
      price: 0
    },
    { 
      id: 7, 
      title: "Blockchain and Cryptocurrency Fundamentals", 
      description: "Understand blockchain technology, Bitcoin and Ethereum", 
      image: "https://picsum.photos/400/300?7", 
      rating: 4.5,
      studentNums: 1400, 
      numOfChapter: 8,
      chapterNums: 8,
      instructor: "Alex Martinez",
      price: 0
    },
    { 
      id: 8, 
      title: "Cybersecurity Essentials", 
      description: "Network security, ethical hacking and threat prevention", 
      image: "https://picsum.photos/400/300?8", 
      rating: 4.9,
      studentNums: 2200, 
      numOfChapter: 14,
      chapterNums: 14,
      instructor: "David Lee",
      price: 0
    },
    { 
      id: 9, 
      title: "Machine Learning A-Z", 
      description: "Neural networks, deep learning with TensorFlow and Keras", 
      image: "https://picsum.photos/400/300?9", 
      rating: 4.8,
      studentNums: 2800, 
      numOfChapter: 16,
      chapterNums: 16,
      instructor: "Lisa Anderson",
      price: 0
    },
  ];

  const totalPages = Math.ceil(recommendedCourses.length / coursesPerPage);
  const startIdx = currentPage * coursesPerPage;
  const endIdx = startIdx + coursesPerPage;
  const currentCourses = recommendedCourses.slice(startIdx, endIdx);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  const toggleRows = () => {
    setShowTwoRows(!showTwoRows);
    setCurrentPage(0); // Reset to first page when toggling
  };

  return (
    <section className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            Recommended for you
          </h2>
          
          {/* Show expand button if more than 4 courses */}
          {recommendedCourses.length > COURSES_PER_ROW && (
            <button 
              onClick={toggleRows}
              className="flex items-center gap-2 text-[#00b6b6] font-semibold hover:text-[#009e9e] transition"
            >
              {showTwoRows ? (
                <>
                  Show Less <ChevronUp size={20} />
                </>
              ) : (
                <>
                  Show More <ChevronDown size={20} />
                </>
              )}
            </button>
          )}
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
          {currentCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-end items-center gap-3">
            <span className="text-sm text-gray-600">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className="bg-teal-100 hover:bg-[#00b6b6] hover:text-white text-[#00b6b6] p-3 rounded-lg transition duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1}
              className="bg-teal-100 hover:bg-[#00b6b6] hover:text-white text-[#00b6b6] p-3 rounded-lg transition duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}