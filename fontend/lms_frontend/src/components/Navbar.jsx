import { useState, useEffect, useRef } from "react";
import { Search, Bell, User, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const dropdownRef = useRef(null); 
  const navigate = useNavigate();
  const location = useLocation();

  // LOGIC AUTHENTICATION
  useEffect(() => {
    const checkLoginStatus = () => {
      let token = localStorage.getItem("accessToken");
      let storedUser = localStorage.getItem("user");

      if (!token) {
        token = sessionStorage.getItem("accessToken");
        storedUser = sessionStorage.getItem("user");
      }

      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error("Lỗi parse user data:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkLoginStatus();
  }, [location]);

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
    
    setUser(null);
    setIsDropdownOpen(false);
    
    navigate("/login");
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    navigate("/profile");
  };

  const getAvatarLabel = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  return (
    <nav className="flex justify-between items-center px-4 md:px-10 py-4 bg-[#00b6b6] text-white fixed top-0 w-full z-50">
      {/* Logo */}
      <div className="flex items-center space-x-2 cursor-pointer" onClick={handleLogoClick}>
        <div className="bg-white text-[#00b6b6] font-bold text-lg px-2 py-1 rounded shadow-sm">
          TOTC
        </div>
      </div>

      {/* Search Bar */}
      <form
        onSubmit={handleSearch}
        className="hidden md:flex items-center bg-white rounded-full overflow-hidden mx-6 w-96 focus-within:ring-2 ring-teal-200 transition shadow-inner"
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
          className="px-3 py-2 transition hover:bg-gray-100"
        >
          <Search className="w-5 h-5 text-[#00b6b6]" />
        </button>
      </form>

      {/* Menu */}
      <ul className="hidden md:flex space-x-8 font-medium">
        <li><a href="/home" className="hover:text-yellow-200 transition">Home</a></li>
        <li><a href="/courses" className="hover:text-yellow-200 transition">Courses</a></li>
        <li><a href="#careers" className="hover:text-yellow-200 transition">Careers</a></li>
        <li><a href="/blog" className="hover:text-yellow-200 transition">Blog</a></li>
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
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.userName} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span>{getAvatarLabel(user.userName)}</span>
                )}
              </div>

              {/* DROPDOWN MENU */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl py-2 text-gray-700 z-50 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="absolute -top-2 right-3 w-4 h-4 bg-white transform rotate-45 border-l border-t border-gray-100"></div>

                  <div className="px-4 py-2 border-b border-gray-100 mb-1">
                      <p className="text-sm font-bold text-gray-800 truncate" title={user.userName}>
                        {user.userName || "User"}
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
          // --- Guest State (Not Logged In) ---
          <>
            <a
              href="/login"
              className="bg-white text-[#00b6b6] px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition shadow-sm"
            >
              Login
            </a>
            <a
              href="/register"
              className="bg-[#00b6b6] border border-white text-white px-4 py-2 rounded-lg font-medium hover:bg-white hover:text-[#00b6b6] transition shadow-sm"
            >
              Register
            </a>
          </>
        )}
      </div>
    </nav>
  );
}