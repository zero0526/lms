import { useState, useEffect, useRef } from "react";
import { Search, Bell, User, LogOut } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { convertDriveLink, getAvatarLabel } from "../api/user/userUtils";

export default function Navbar() {
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const dropdownRef = useRef(null); 
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchTerm);
  };

  const handleLogoClick = () => {
    navigate("/home");
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");
    
    setIsDropdownOpen(false);
    navigate("/login");
    window.location.reload();
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    navigate("/profile");
  };

  const getCoursesPath = () => {
    if (user?.role === "ROLE_TEACHER") {
      return "/teacher/courses"; 
    }
    if (user?.role === "ROLE_STUDENT") {
      return "/student/courses";
    }
    return "/login";
  };

  const avatarUrl = user?.avatar || user?.pictureUrl;
  console.log("Navbar avatarUrl:", avatarUrl);
  console.log("User object:", user);

  return (
    <nav className="flex justify-between items-center px-4 md:px-10 py-4 bg-[#00b6b6] text-white fixed top-0 w-full z-50 shadow-md">
      {/* Logo */}
      <div className="flex items-center space-x-2 cursor-pointer" onClick={handleLogoClick}>
        <div className="bg-white text-[#00b6b6] font-bold text-lg px-2 py-1 rounded shadow-sm">
          TOTC
        </div>
      </div>

      {/* Menu */}
      <ul className="hidden md:flex space-x-8 font-medium">
        <li>
          <Link to="/home" className="hover:text-yellow-200 transition">Home</Link>
        </li>
        <li>
          <Link to="/courses" className="hover:text-yellow-200 transition">Courses</Link>
        </li>
        <li>
          {/* Changed from /courses to dynamic path based on role */}
          <Link to={getCoursesPath()} className="hover:text-yellow-200 transition">
            My Courses
          </Link>
        </li>
        <li><a href="#careers" className="hover:text-yellow-200 transition">Careers</a></li>
        <li>
          <Link to="/blog" className="hover:text-yellow-200 transition">Blog</Link>
        </li>
        <li><a href="#about" className="hover:text-yellow-200 transition">About Us</a></li>
      </ul>

      {/* User */}
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            {/* Notification */}
            <button className="relative p-2 hover:bg-white/20 rounded-full transition group">
              <Bell className="w-6 h-6 text-white group-hover:text-yellow-200 transition cursor-pointer" />
              <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#00b6b6]"></span>
            </button>

            {/* Avatar User & Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-10 h-10 rounded-full bg-white text-[#00b6b6] flex items-center justify-center font-bold text-lg overflow-hidden border-2 border-white shadow-sm hover:ring-2 hover:ring-yellow-200 transition cursor-pointer select-none"
              >
                {avatarUrl ? (
                  <img 
                    src={convertDriveLink(avatarUrl)} 
                    alt={user.fullName || user.userName} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML = `<span class="text-[#00b6b6]">${getAvatarLabel(user.fullName || user.userName)}</span>`;
                    }} 
                  />
                ) : (
                  <span>{getAvatarLabel(user.fullName || user.userName)}</span>
                )}
              </div>

              {/* DROPDOWN MENU */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl py-2 text-gray-700 z-50 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="absolute -top-2 right-3 w-4 h-4 bg-white transform rotate-45 border-l border-t border-gray-100"></div>

                  <div className="px-4 py-2 border-b border-gray-100 mb-1">
                      <p className="text-sm font-bold text-gray-800 truncate" title={user.fullName || user.userName}>
                        {user.fullName || user.userName || "User"}
                      </p>
                      <p className="text-xs text-gray-500 font-medium text-teal-600">
                        {user.role === "ROLE_STUDENT" ? "Student" : user.role === "ROLE_TEACHER" ? "Teacher" : "Admin"}
                      </p>
                  </div>

                  <button 
                    onClick={handleProfileClick}
                    className="w-full text-left px-4 py-2 hover:bg-teal-50 hover:text-[#00b6b6] flex items-center gap-2 transition"
                  >
                    <User size={16} />
                    <span>Profile</span>
                  </button>

                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 hover:text-red-500 flex items-center gap-2 transition"
                  >
                    <LogOut size={16} />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          // Guest State
          <>
            <Link
              to="/login"
              className="bg-white text-[#00b6b6] px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition shadow-sm"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-[#00b6b6] border border-white text-white px-4 py-2 rounded-lg font-medium hover:bg-white hover:text-[#00b6b6] transition shadow-sm"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}