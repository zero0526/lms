import React, { useState } from "react";
import { Filter } from "lucide-react";

export default function CourseFilter({ onFilterChange, categories }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("popular");

  const handleApply = () => {
    onFilterChange({
      category: selectedCategory,
      rating: minRating,
      sort: sortBy
    });
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedCategory("All");
    setMinRating(0);
    setSortBy("popular");
    onFilterChange({
      category: "All",
      rating: 0,
      sort: "popular"
    });
  };

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
        >
          <Filter size={18} />
          {isOpen ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {/* Filter Sidebar */}
      <div className={`${isOpen ? "block" : "hidden"} md:block bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit sticky top-24`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <Filter size={20} className="text-[#00b6b6]" /> Filters
          </h3>
          <button onClick={handleClear} className="text-xs text-gray-500 hover:text-red-500 underline">
            Clear All
          </button>
        </div>

        {/* Category */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-700 mb-3 text-sm">Category</h4>
          <div className="space-y-2">
            {["All", ...categories].map((cat) => (
              <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  className="accent-[#00b6b6] w-4 h-4 cursor-pointer"
                  checked={selectedCategory === cat}
                  onChange={() => setSelectedCategory(cat)}
                />
                <span className={`text-sm ${selectedCategory === cat ? "text-[#00b6b6] font-medium" : "text-gray-600 group-hover:text-gray-800"}`}>
                  {cat}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 my-4"></div>

        {/* Rating */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-700 mb-3 text-sm">Rating</h4>
          <div className="space-y-2">
            {[4.5, 4.0, 3.5, 3.0].map((rating) => (
              <label key={rating} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="rating"
                  className="accent-[#00b6b6] w-4 h-4 cursor-pointer"
                  checked={minRating === rating}
                  onChange={() => setMinRating(rating)}
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-800 flex items-center gap-1">
                  {rating} <span className="text-yellow-400">★</span> & up
                </span>
              </label>
            ))}
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="rating"
                className="accent-[#00b6b6] w-4 h-4 cursor-pointer"
                checked={minRating === 0}
                onChange={() => setMinRating(0)}
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-800">Any Rating</span>
            </label>
          </div>
        </div>

        <div className="border-t border-gray-100 my-4"></div>

        {/* Sort By */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-700 mb-3 text-sm">Sort By</h4>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="sort"
                className="accent-[#00b6b6] w-4 h-4 cursor-pointer"
                checked={sortBy === "popular"}
                onChange={() => setSortBy("popular")}
              />
              <span className={`text-sm ${sortBy === "popular" ? "text-[#00b6b6] font-medium" : "text-gray-600 group-hover:text-gray-800"}`}>
                Most Popular
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="sort"
                className="accent-[#00b6b6] w-4 h-4 cursor-pointer"
                checked={sortBy === "newest"}
                onChange={() => setSortBy("newest")}
              />
              <span className={`text-sm ${sortBy === "newest" ? "text-[#00b6b6] font-medium" : "text-gray-600 group-hover:text-gray-800"}`}>
                Newest
              </span>
            </label>
          </div>
        </div>

        {/* Apply Button */}
        <button
          onClick={handleApply}
          className="w-full bg-[#00b6b6] text-white py-2 rounded-lg font-medium hover:bg-[#009e9e] transition shadow-md mt-2"
        >
          Apply Filters
        </button>
      </div>
    </>
  );
}