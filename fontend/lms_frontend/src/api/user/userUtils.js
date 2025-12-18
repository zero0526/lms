/**
 * Convert Google Drive link to thumbnail/direct link
 */
export const convertDriveLink = (url) => {
  if (!url || typeof url !== 'string') return "";
  
  // Nếu là blob url (ảnh vừa upload từ máy tính để preview) thì hiển thị luôn
  if (!url.includes("drive.google.com")) return url;

  try {
    // Tìm ID file trong link drive
    const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1000`;
    }
    return url; 
  } catch (e) {
    return url;
  }
};

/**
 * Format date array from backend to readable string
 */
export const formatDate = (dateArray) => {
  if (!dateArray || !Array.isArray(dateArray)) return "N/A";
  const [year, month, day, hour, minute] = dateArray;
  return new Date(year, month - 1, day, hour, minute).toLocaleString('vi-VN', {
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit', 
    minute: '2-digit'
  });
};

/**
 * Get avatar label from name (first letter)
 */
export const getAvatarLabel = (name) => {
  return name ? name.charAt(0).toUpperCase() : "U";
};

/**
 * Get current user from storage
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Get current user ID
 */
export const getCurrentUserId = () => {
  const user = getCurrentUser();
  return user?.userId || null;
};