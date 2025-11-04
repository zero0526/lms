import { useState } from "react";
import { Search } from "lucide-react";

export default function Navbar() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchTerm);
    // TODO: Thêm logic tìm kiếm
  };

  return (
    <nav className="flex justify-between items-center px-10 py-4 bg-[#00b6b6] text-white fixed top-0 w-full z-50">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <div className="bg-white text-[#00b6b6] font-bold text-lg px-2 py-1 rounded">
          TOTC
        </div>
      </div>

      {/* Thanh tìm kiếm */}
      <form
        onSubmit={handleSearch}
        className="hidden md:flex items-center bg-white rounded-full overflow-hidden mx-6 w-90 focus-within:ring-2"
      >
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 text-gray-700 outline-none"
        />
        <button
          type="submit"
          className="px-3 py-2 transition"
        >
          <Search className="w-5 h-5 text-[#00b6b6] cursor-pointer hover:text-yellow-300" />
        </button>
      </form>

      {/* Menu */}
      <ul className="hidden md:flex space-x-8 font-medium">
        <li><a href="/home" className="hover:text-yellow-200">Home</a></li>
        <li><a href="/courses" className="hover:text-yellow-200">Courses</a></li>
        <li><a href="#careers" className="hover:text-yellow-200">Careers</a></li>
        <li><a href="/blog" className="hover:text-yellow-200">Blog</a></li>
        <li><a href="#about" className="hover:text-yellow-200">About Us</a></li>
      </ul>

      {/* Login / Register */}
      <div className="flex space-x-4">
        <a
          href="/login"
          className="bg-white text-[#00b6b6] px-4 py-2 rounded-lg font-medium hover:bg-gray-100"
        >
          Login
        </a>
        <a
          href="/register"
          className="bg-[#00b6b6] border border-white text-white px-4 py-2 rounded-lg font-medium hover:bg-white hover:text-[#00b6b6]"
        >
          Register
        </a>
      </div>
    </nav>
  );
}
