import { Users, Wrench } from "lucide-react";
import { useUser } from "../../contexts/UserContext";
import { convertDriveLink, getAvatarLabel } from "../../api/user/userUtils";

export default function Sidebar({ activeMenu, setActiveMenu }) {
  const { user } = useUser();

  // Function to convert role code to a more user-friendly display name
  const getRoleLabel = (role) => {
    if (role === "ROLE_TEACHER") return "Teacher";
    if (role === "ROLE_STUDENT") return "Student";
    return "Regular Account";
  };

  const sidebarItems = [
    { id: "lectures", label: "My courses", icon: <Users size={20} /> },
    { id: "settings", label: "Course Development", icon: <Wrench size={20} /> },
  ];

  // KIỂM TRA CẢ 2 FIELD: avatar (từ login) hoặc pictureUrl (từ fetchUserInfo)
  const avatarUrl = user?.avatar || user?.pictureUrl;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col fixed h-[calc(100vh-72px)] overflow-y-auto">
      {/* User Info */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-500 font-bold text-xl overflow-hidden border border-gray-300">
            {avatarUrl ? (
              <img 
                src={convertDriveLink(avatarUrl)}
                alt={user?.fullName || user?.userName} 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = "none";
                  e.target.parentElement.innerHTML = `<span class="text-[#00b6b6]">${getAvatarLabel(user?.fullName || user?.userName)}</span>`;
                }}
              />
            ) : (
              <span className="text-[#00b6b6]">{getAvatarLabel(user?.fullName || user?.userName)}</span>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col overflow-hidden">
            <h3 className="font-bold text-gray-800 text-sm truncate" title={user?.fullName || user?.userName}>
              {user?.fullName || user?.userName || "User"}
            </h3>
            <span className="inline-block bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full mt-1 w-fit font-medium border border-gray-200">
              {getRoleLabel(user?.role)}
            </span>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveMenu(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeMenu === item.id
                ? "bg-teal-50 text-[#00b6b6] border-l-4 border-[#00b6b6]"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100 text-xs text-gray-400 text-center">
        TOTC Teacher Studio v1.0
      </div>
    </aside>
  );
}