import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CourseCard from "../components/courses/CourseCard";
import CourseFilter from "../components/courses/CourseFilter";
import { convertDriveLink } from "../api/user/userUtils";
import { Search } from "lucide-react";
import apiClient from "../api/axiosConfig";

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  
  const [filters, setFilters] = useState({
    category: "All",
    rating: 0,
    sort: "popular"
  });

  const [page, setPage] = useState(0);
  const [limit] = useState(10);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tagsResponse = await apiClient.get(`/course/course-tags?limit=10`);
        const tagsData = tagsResponse.data.data || [];
        console.log("Tags Data:", tagsData);
        setCategories(tagsData);
      } catch (error) {
        console.error("Failed to fetch tags:", error);
      }
    };

    fetchTags();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);

        const params = new URLSearchParams();
        
        if (filters.category !== "All") {
          params.append("tags", filters.category);
        }
        
        if (filters.rating > 0) {
          params.append("lowerBoundRating", filters.rating.toString());
        }

        const sortBy = filters.sort === "newest" ? "latest" : filters.sort;
        params.append("sortBy", sortBy);
        
        params.append("page", page.toString());
        params.append("limit", limit.toString());

        console.log("Fetching with params:", params.toString());

        const coursesResponse = await apiClient.get(`/course/introduce-course?${params.toString()}`);
        
        console.log("API Response:", coursesResponse.data);
        
        const coursesData = coursesResponse.data.data.content || [];

        const mappedCourses = coursesData.map(course => ({
          id: course.id,
          title: course.title,
          description: course.description,
          image: convertDriveLink(course.thumbnailUrl),
          rating: course.avgRating || 0,
          studentNums: course.numUserEnrolled,
          category: course.category || "All",
          chapterNums: course.numChapters,
          isCompleted: course.isCompleted
        }));
        
        console.log("Mapped Courses:", mappedCourses);

        setCourses(mappedCourses);
        setFilteredCourses(mappedCourses);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        console.error("Error response:", error.response?.data);
        setError("Failed to load courses. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [filters.category, filters.rating, filters.sort, page, limit]);

  useEffect(() => {
    if (searchTerm) {
      const result = courses.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCourses(result);
    } else {
      setFilteredCourses(courses);
    }
  }, [searchTerm, courses]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(0);
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col font-sans">
      <Navbar />
      
      <div className="pt-[80px] flex-1">
        {/* Header Section */}
        <div className="bg-[#002B3D] text-white py-12 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Explore Our Courses</h1>
            <p className="text-gray-300 max-w-2xl mx-auto text-lg">
              Discover a wide range of courses to enhance your skills and advance your career.
              From programming to design, we have something for everyone.
            </p>
            
            {/* Search Bar */}
            <div className="mt-8 max-w-xl mx-auto relative">
              <input
                type="text"
                placeholder="What do you want to learn today?"
                className="w-full py-3 pl-12 pr-4 rounded-full text-white focus:outline-none focus:ring-4 focus:ring-[#00b6b6]/50 shadow-lg placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
          <div className="flex flex-col md:flex-row gap-8">
            
            {/* Sidebar Filters */}
            <div className="w-full md:w-1/4 flex-shrink-0">
              <CourseFilter 
                onFilterChange={handleFilterChange} 
                categories={categories} 
              />
            </div>

            {/* Course Grid */}
            <div className="w-full md:w-3/4">
              {/* ✅ Chỉ hiển thị số lượng courses */}
              <div className="mb-6">
                <p className="text-gray-600 font-medium">
                  Showing <span className="text-gray-900 font-bold">{filteredCourses.length}</span> courses
                </p>
              </div>

              {/* Grid */}
              {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map(course => (
                    <div key={course.id} className="flex">
                      <CourseCard course={course} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No courses found</h3>
                  <p className="text-gray-500">
                    We couldn't find any courses matching your filters. Try adjusting your search or filters.
                  </p>
                  <button 
                    onClick={() => {
                        setSearchTerm("");
                        handleFilterChange({ category: "All", rating: 0, sort: "popular" });
                        window.location.reload(); 
                    }}
                    className="mt-6 px-6 py-2 bg-[#00b6b6] text-white rounded-lg hover:bg-[#009e9e] transition"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}