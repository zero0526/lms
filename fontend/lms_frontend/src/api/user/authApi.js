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
 * Reset password với token
 * @param {string} token - Reset token từ email
 * @param {number} userId - User ID
 * @param {string} newPassword - Mật khẩu mới
 */
export const resetPassword = async (token, userId, newPassword) => {
  try {
    console.log("=== RESET PASSWORD ===");
    console.log(`Token: ${token}`);
    console.log(`User ID: ${userId}`);

    const payload = { newPassword };

    const response = await apiClient.post(`/user/forgot`, payload, {
      params: { token, userId }
    });

    console.log("Reset password successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("Reset password failed:", error);
    
    if (error.response) {
      console.error("Error Response:", error.response.data);
      
      // Handle specific error cases
      if (error.response.status === 400) {
        throw new Error("Invalid or expired reset token. Please request a new password reset.");
      }
      
      if (error.response.status === 404) {
        throw new Error("User not found.");
      }
      
      throw new Error(
        error.response.data.message || 
        error.response.data || 
        "Failed to reset password"
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