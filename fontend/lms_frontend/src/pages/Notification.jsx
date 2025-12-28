import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, ChevronLeft, ChevronRight, Loader2, ExternalLink } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getNotifications, markAsRead, markAllAsRead, formatNotificationDate } from "../api/user/notificationApi";

export default function Notification() {
  const navigate = useNavigate();
  
  // User state
  const [currentUser, setCurrentUser] = useState(null);
  
  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  // Load user data
  useEffect(() => {
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch notifications
  const fetchNotifications = useCallback(async (pageNum = 0) => {
    if (!currentUser?.userId) return;
    
    setIsLoading(true);
    try {
      const response = await getNotifications(currentUser.userId, pageNum, 10);
      
      if (response.data) {
        // Check if response is paginated or array
        if (Array.isArray(response.data)) {
          setNotifications(response.data);
          setTotalPages(1);
        } else if (response.data.content) {
          setNotifications(response.data.content);
          setTotalPages(response.data.totalPages || 1);
        } else {
          setNotifications(response.data);
          setTotalPages(1);
        }
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchNotifications(0);
    }
  }, [currentUser, fetchNotifications]);

  // Handle mark single as read
  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await markAsRead(notification.id);
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );
      } catch (error) {
        console.error("Error marking as read:", error);
      }
    }
    
    // Navigate to the link if exists
    if (notification.linkUrl) {
      // Convert absolute URL to relative path if same origin
      try {
        const url = new URL(notification.linkUrl);
        if (url.origin === window.location.origin) {
          navigate(url.pathname);
        } else {
          window.open(notification.linkUrl, '_blank');
        }
      } catch {
        // If URL parsing fails, try direct navigation
        navigate(notification.linkUrl);
      }
    }
  };

  // Handle mark all as read
  const handleMarkAllRead = async () => {
    if (!currentUser?.userId) return;
    
    setIsMarkingAll(true);
    try {
      await markAllAsRead(currentUser.userId);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    } finally {
      setIsMarkingAll(false);
    }
  };

  // Pagination handlers
  const handlePrevPage = () => {
    if (page > 0) {
      fetchNotifications(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages - 1) {
      fetchNotifications(page + 1);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8 text-[#00b6b6]" />
            <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          
          {notifications.some(n => !n.read) && (
            <button
              onClick={handleMarkAllRead}
              disabled={isMarkingAll}
              className="flex items-center gap-2 px-4 py-2 text-[#00b6b6] hover:bg-teal-50 rounded-lg transition font-medium disabled:opacity-50"
            >
              {isMarkingAll ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <CheckCheck size={18} />
              )}
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#00b6b6] mb-4" size={40} />
            <p className="text-gray-500">Loading notifications...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition ${
                    !notification.read ? 'bg-teal-50/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Unread indicator */}
                    <div className="flex-shrink-0 mt-2">
                      {!notification.read ? (
                        <div className="w-2.5 h-2.5 bg-[#00b6b6] rounded-full"></div>
                      ) : (
                        <div className="w-2.5 h-2.5 bg-gray-300 rounded-full"></div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`font-semibold text-gray-800 ${!notification.read ? 'text-[#00b6b6]' : ''}`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {formatNotificationDate(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      {notification.linkUrl && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-[#00b6b6]">
                          <ExternalLink size={12} />
                          <span>View details</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 0}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <span className="text-sm text-gray-500">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={page >= totalPages - 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Bell size={60} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No notifications</h3>
            <p className="text-gray-500">You're all caught up! Check back later for new updates.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
