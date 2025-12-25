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
 * ✅ Request forgot password (send reset email)
 * @param {string} email - User email
 */
export const requestForgotPassword = async (email) => {
  try {
    console.log("=== FORGOT PASSWORD REQUEST ===");
    console.log(`Email: ${email}`);

    const payload = { email: email.trim() };

    const response = await apiClient.post('/user/forgot/password', payload);

    console.log("✅ Forgot password request successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Forgot password request failed:", error);
    
    if (error.response) {
      console.error("Error Response:", error.response.data);
      throw new Error(
        error.response.data.message || 
        error.response.data || 
        "Failed to send reset password email"
      );
    }
    
    throw new Error("Network error. Please try again later.");
  }
};

/**
 * Logout user (clear storage)
 */
export const logoutUser = () => {
  localStorage.removeItem("user");
  sessionStorage.removeItem("user");
  localStorage.removeItem("accessToken");
  sessionStorage.removeItem("accessToken");
  console.log("User logged out");
};