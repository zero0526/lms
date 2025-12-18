import apiClient from "../axiosConfig";

/**
 * Change user password
 * @param {number} userId 
 * @param {string} currentPassword 
 * @param {string} newPassword 
 */
export const changeUserPassword = async (userId, currentPassword, newPassword) => {
  try {
    console.log("=== CHANGE PASSWORD ===");
    console.log(`User ID: ${userId}`);

    const payload = {
      currentPassword,
      newPassword
    };

    const res = await apiClient.post(`/user/update/password/${userId}`, payload);

    if (res.status === 200) {
      console.log("Password changed successfully");
      return res.data;
    }

    throw new Error("Password change failed");
  } catch (error) {
    console.error("Failed to change password:", error);
    if (error.response) {
      console.error("Error Response:", error.response.data);
      throw new Error(error.response.data.message || error.response.data || "Failed to update password");
    }
    throw error;
  }
};

/**
 * Logout user (clear storage)
 */
export const logoutUser = () => {
  localStorage.removeItem("user");
  sessionStorage.removeItem("user");
  console.log("User logged out");
};