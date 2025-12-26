import apiClient from "../axiosConfig";
import apiPublicClient from "../axiosPublicConfig";

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
 * Request forgot password (send reset email)
 * @param {string} email - User email
 */
export const requestForgotPassword = async (email) => {
  try {
    console.log("=== FORGOT PASSWORD REQUEST ===");
    console.log(`Email: ${email}`);

    const payload = { email: email.trim() };

    const response = await apiClient.post('/user/forgot/password', payload);

    console.log("Forgot password request successful:", response.data);
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
 * Reset password với token (KHÔNG CẦN AUTH)
 * @param {string} token - Reset token từ email
 * @param {number} userId - User ID
 * @param {string} newPassword - Mật khẩu mới
 */
export const resetPassword = async (token, userId, newPassword) => {
  try {
    console.log("=== RESET PASSWORD ===");
    console.log(`Token: ${token}`);
    console.log(`User ID: ${userId}`);
    console.log(`New Password: ${newPassword}`);

    const payload = { newPassword };

    // Thêm maxRedirects: 0 để không follow redirect
    const response = await apiPublicClient.post(
      `/user/forgot?token=${token}&userId=${userId}`,
      payload,
      {
        maxRedirects: 0,
        validateStatus: function (status) {
          // Chấp nhận cả 200, 302 là success
          return status >= 200 && status < 400;
        }
      }
    );

    console.log("Reset password successful:", response.status);
    return response.data;
  } catch (error) {
    console.error("Reset password failed:", error);
    
    if (error.response) {
      console.error("Error Status:", error.response.status);
      console.error("Error Response:", error.response.data);
      
      // Xử lý 302 redirect
      if (error.response.status === 302) {
        console.log("Password reset successful (got 302 redirect)");
        return { success: true, message: "Password reset successful" };
      }
      
      // Handle other error cases
      if (error.response.status === 400) {
        const errorMsg = typeof error.response.data === 'string' 
          ? error.response.data 
          : "Invalid or expired reset token. Please request a new password reset.";
        throw new Error(errorMsg);
      }
      
      if (error.response.status === 404) {
        throw new Error("User not found.");
      }
      
      const errorMessage = typeof error.response.data === 'string'
        ? error.response.data
        : error.response.data.message || "Failed to reset password";
      
      throw new Error(errorMessage);
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