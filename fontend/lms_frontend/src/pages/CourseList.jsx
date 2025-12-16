import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CourseCard from "../components/courses/CourseCard";
import CourseFilter from "../components/courses/CourseFilter";
import { mockCourses } from "../data/mockCourses";
import { Search, SlidersHorizontal } from "lucide-react";

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Search State
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter States
  const [filters, setFilters] = useState({
    category: "All",
    price: "all",
    rating: 0,
    sort: "popular"
  });

  // Load initial data
  useEffect(() => {
    // In a real app, fetch from API here
    setCourses(mockCourses);
    setFilteredCourses(mockCourses);
    
    // Extract unique categories
    const uniqueCategories = [...new Set(mockCourses.map(c => c.category))];
    setCategories(uniqueCategories);
  }, []);

  // Apply filters whenever filters state or search term changes
  useEffect(() => {
    let result = [...courses];

    // 1. Search Filter
    if (searchTerm) {
      result = result.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. Category Filter
    if (filters.category !== "All") {
      result = result.filter(course => course.category === filters.category);
    }

    // 3. Price Filter
    if (filters.price === "free") {
      result = result.filter(course => course.price === 0);
    } else if (filters.price === "paid") {
      result = result.filter(course => course.price > 0);
    }

    // 4. Rating Filter
    if (filters.rating > 0) {
      result = result.filter(course => course.rating >= filters.rating);
    }

    // 5. Sorting
    switch (filters.sort) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result.sort((a, b) => b.id - a.id); // Assuming higher ID is newer
        break;
      case "popular":
      default:
        result.sort((a, b) => b.studentNums - a.studentNums); // Most students = most popular
        break;
    }

    setFilteredCourses(result);
  }, [filters, searchTerm, courses]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
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
            
            {/* Search Bar in Header */}
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
              {/* Top Controls */}
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600 font-medium">
                  Showing <span className="text-gray-900 font-bold">{filteredCourses.length}</span> courses
                </p>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 hidden sm:inline">Sort by:</span>
                  <div className="relative">
                    <select 
                      className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-4 pr-8 rounded-lg focus:outline-none focus:border-[#00b6b6] cursor-pointer text-sm font-medium"
                      value={filters.sort}
                      onChange={(e) => handleFilterChange({ sort: e.target.value })}
                    >
                      <option value="popular">Most Popular</option>
                      <option value="newest">Newest</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </select>
                    <SlidersHorizontal size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Grid */}
              {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map(course => (
                    <div key={course.id} className="flex"> {/* Flex wrapper to make cards equal height */}
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
                        handleFilterChange({ category: "All", price: "all", rating: 0, sort: "popular" });
                        // We need a way to reset Filter component state too, but simplified for now
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