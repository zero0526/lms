import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CourseCard from "../components/courses/CourseCard";
import CourseFilter from "../components/courses/CourseFilter";
import { convertDriveLink } from "../api/user/userUtils";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { getCourseTags, getIntroduceCourses, searchCourses, getAutocompleteSuggestions } from "../api/user/courseApi";

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const searchRef = useRef(null);
  
  const [filters, setFilters] = useState({
    category: "All",
    rating: 0,
    sort: "popular"
  });

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [limit] = useState(6);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tagsResponse = await getCourseTags(10);
        const tagsData = tagsResponse.data || [];
        console.log("Tags Data:", tagsData);
        setCategories(tagsData);
      } catch (error) {
        console.error("Failed to fetch tags:", error);
      }
    };

    fetchTags();
  }, []);

  // Fetch autocomplete suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.trim().length > 0) {
        try {
          const response = await getAutocompleteSuggestions(searchTerm);
          setSuggestions(response.data || []);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Failed to fetch suggestions:", error);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Fetch courses (filter mode or search mode)
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);

        let coursesData = [];
        let totalCount = 0;

        if (isSearchMode && searchTerm.trim()) {
          // Search mode
          const searchResponse = await searchCourses(searchTerm, page, limit);
          coursesData = searchResponse.data || [];
          totalCount = coursesData.length; // Backend doesn't return total count, estimate based on results
          
          // If we got exactly 'limit' items, there might be more pages
          if (coursesData.length === limit) {
            setTotalPages(page + 2); // Assume at least one more page
          } else {
            setTotalPages(page + 1); // This is the last page
          }
        } else {
          // Filter mode
          const params = {
            page,
            limit
          };
          
          if (filters.category !== "All") {
            params.tags = filters.category;
          }
          
          if (filters.rating > 0) {
            params.lowerBoundRating = filters.rating.toString();
          }

          params.sortBy = filters.sort === "newest" ? "latest" : filters.sort;

          console.log("Fetching with params:", params);

          const coursesResponse = await getIntroduceCourses(params);
          
          console.log("API Response:", coursesResponse);
          
          coursesData = coursesResponse.data.content || [];
          totalCount = coursesResponse.data.totalElements || 0;
          setTotalPages(Math.ceil(totalCount / limit));
        }

        const completedCourses = coursesData.filter(course => course.isCompleted === true);

        const mappedCourses = completedCourses.map(course => ({
          id: course.id,
          title: course.title,
          description: course.desc || course.description,
          image: convertDriveLink(course.thumbnailUrl),
          rating: course.rating || course.avgRating || 0,
          studentNums: course.numOfEnroll || course.numUserEnrolled || 0,
          category: course.category || "All",
          chapterNums: course.numChapters || 0,
          instructorName: course.instructorName || "Unknown",
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
  }, [isSearchMode, searchTerm, filters.category, filters.rating, filters.sort, page, limit]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(0);
    setIsSearchMode(false);
    setSearchTerm("");
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setIsSearchMode(true);
      setPage(0);
      setShowSuggestions(false);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    // Auto trigger search
    setTimeout(() => {
      setIsSearchMode(true);
      setPage(0);
    }, 100);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setIsSearchMode(false);
    setPage(0);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
            
            {/* Search Bar with Autocomplete */}
            <div className="mt-8 max-w-xl mx-auto relative" ref={searchRef}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="What do you want to learn today?"
                  className="w-full py-3 pl-12 pr-24 rounded-full text-white focus:outline-none ring-4 ring-[#00b6b6]/50 shadow-lg placeholder-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                />

                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-28 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
                
                <button
                  onClick={handleSearch}
                  // Sửa nút Search: thay top-1.5 bằng top-1/2 -translate-y-1/2
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#00b6b6] text-white rounded-full hover:bg-[#009e9e] transition font-semibold"
                >
                  Search
                </button>
              </div>

              {/* Autocomplete Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-100 transition flex items-center gap-3 text-gray-700"
                    >
                      <Search size={16} className="text-gray-400"/>
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
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
              <div className="mb-6 flex justify-between items-center">
                <p className="text-gray-600 font-medium">
                  Showing <span className="text-gray-900 font-bold">{filteredCourses.length}</span> courses
                  {isSearchMode && <span className="text-sm text-gray-500 ml-2">(Search results)</span>}
                </p>
                
                {totalPages > 1 && (
                  <p className="text-sm text-gray-500">
                    Page {page + 1} of {totalPages}
                  </p>
                )}
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00b6b6]"></div>
                </div>
              ) : filteredCourses.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map(course => (
                      <div key={course.id} className="flex">
                        <CourseCard course={course} />
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center items-center gap-2">
                      <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 0}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        <ChevronLeft size={20}/>
                      </button>

                      <div className="flex gap-2">
                        {[...Array(totalPages)].map((_, index) => (
                          <button
                            key={index}
                            onClick={() => handlePageChange(index)}
                            className={`w-10 h-10 rounded-lg font-semibold transition ${
                              page === index
                                ? "bg-[#00b6b6] text-white"
                                : "border border-gray-300 hover:bg-gray-100"
                            }`}
                          >
                            {index + 1}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages - 1}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        <ChevronRight size={20}/>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No courses found</h3>
                  <p className="text-gray-500">
                    {isSearchMode 
                      ? `No courses found matching "${searchTerm}". Try a different search term.`
                      : "We couldn't find any courses matching your filters. Try adjusting your search or filters."
                    }
                  </p>
                  <button 
                    onClick={() => {
                        setSearchTerm("");
                        setIsSearchMode(false);
                        handleFilterChange({ category: "All", rating: 0, sort: "popular" });
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