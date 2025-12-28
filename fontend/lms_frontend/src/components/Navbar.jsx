import { useState, useEffect, useRef } from "react";
import { Search, Bell, User, LogOut, CheckCheck, ExternalLink, Loader2 } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { convertDriveLink, getAvatarLabel } from "../api/user/userUtils";
import { logoutUser } from "../api/user/authApi";
import { getNotifications, getUnreadCount, markAllAsRead, markAsRead, formatNotificationDate } from "../api/user/notificationApi";

export default function Navbar() {
  const [searchTerm, setSearchTerm] = useState("");
  const { user, setUser } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Notification states
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch unread count on mount and periodically
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user?.userId) return;
      try {
        const response = await getUnreadCount(user.userId);
        if (response.data !== undefined) {
          setUnreadCount(response.data);
        }
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Fetch notifications when dropdown opens
  const fetchNotifications = async () => {
    if (!user?.userId) return;
    
    setIsLoadingNotifications(true);
    try {
      const response = await getNotifications(user.userId, 0, 5);
      if (response.data) {
        // Handle both array and paginated response
        if (Array.isArray(response.data)) {
          setNotifications(response.data.slice(0, 5));
        } else if (response.data.content) {
          setNotifications(response.data.content.slice(0, 5));
        } else {
          setNotifications(response.data);
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const handleNotificationClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
    if (!isNotificationOpen) {
      fetchNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    if (!user?.userId) return;
    
    setIsMarkingAllRead(true);
    try {
      await markAllAsRead(user.userId);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  const handleSingleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await markAsRead(notification.id);
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Error marking as read:", error);
      }
    }
    
    setIsNotificationOpen(false);
    
    // Navigate to the link if exists
    if (notification.linkUrl) {
      try {
        const url = new URL(notification.linkUrl);
        if (url.origin === window.location.origin) {
          navigate(url.pathname);
        } else {
          window.open(notification.linkUrl, '_blank');
        }
      } catch {
        navigate(notification.linkUrl);
      }
    }
  };

  const handleLogoClick = () => {
    navigate("/home");
  };

const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent double click
    
    setIsLoggingOut(true);
    setIsDropdownOpen(false);

    try {
      // Gọi API logout với user data
      await logoutUser(user);
      
      // Clear user context
      setUser(null);
      
      // Redirect về home
      navigate("/home");
      
      // Optional: Reload để clear mọi state
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
      setUser(null);
      navigate("/home");
      window.location.reload();
    } finally {
      setIsLoggingOut(false);
    }
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
    <nav className="flex justify-between items-center px-4 md:px-10 py-4 bg-[#00b6b6] text-white fixed top-0 w-full z-50">
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
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={handleNotificationClick}
                className="relative p-2 hover:bg-white/20 rounded-full transition group"
              >
                <Bell className="w-6 h-6 text-white group-hover:text-yellow-200 transition cursor-pointer" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-[#00b6b6] flex items-center justify-center text-[10px] font-bold text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl text-gray-700 z-50 border border-gray-100 overflow-hidden">
                  <div className="absolute -top-2 right-4 w-4 h-4 bg-white transform rotate-45 border-l border-t border-gray-100"></div>
                  
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <h3 className="font-bold text-gray-800">Notifications</h3>
                    {notifications.some(n => !n.read) && (
                      <button
                        onClick={handleMarkAllRead}
                        disabled={isMarkingAllRead}
                        className="text-xs text-[#00b6b6] hover:underline flex items-center gap-1 disabled:opacity-50"
                      >
                        {isMarkingAllRead ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <CheckCheck size={12} />
                        )}
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-80 overflow-y-auto">
                    {isLoadingNotifications ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="animate-spin text-[#00b6b6]" size={24} />
                      </div>
                    ) : notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleSingleNotificationClick(notification)}
                          className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition border-b border-gray-50 last:border-b-0 ${
                            !notification.read ? 'bg-teal-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {!notification.read ? (
                                <div className="w-2 h-2 bg-[#00b6b6] rounded-full"></div>
                              ) : (
                                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${!notification.read ? 'text-[#00b6b6]' : 'text-gray-800'}`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                                {notification.message}
                              </p>
                              <p className="text-[10px] text-gray-400 mt-1">
                                {formatNotificationDate(notification.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-gray-500 text-sm">
                        <Bell size={32} className="mx-auto mb-2 opacity-50" />
                        No notifications yet
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                    <button
                      onClick={() => {
                        setIsNotificationOpen(false);
                        navigate('/notifications');
                      }}
                      className="w-full text-center text-sm text-[#00b6b6] hover:underline font-medium py-1"
                    >
                      See all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

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