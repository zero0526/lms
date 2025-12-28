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
 * Logout user - Clear HTTP-only cookies và storage
 * @param {Object} userData - User data from storage
 */
export const logoutUser = async (userData) => {
  try {
    console.log("🚪 Logging out...");
    
    if (!userData || !userData.email) {
      console.warn("⚠️ No user data found, clearing storage only");
      clearStorage();
      return;
    }

    // Prepare logout payload
    const logoutPayload = {
      email: userData.email,
      password: "", // Backend có thể không cần password khi logout
      fullName: userData.fullName || userData.userName || "",
      roleName: userData.role || "ROLE_STUDENT"
    };

    console.log("📤 Sending logout request:", { email: logoutPayload.email, role: logoutPayload.roleName });

    // Gọi backend để xóa HTTP-only cookies
    const response = await apiClient.post('/auth/logout', logoutPayload, {
      withCredentials: true // ← Gửi cookies
    });

    if (response.status === 200) {
      console.log("✅ Backend logout successful:", response.data);
    }

  } catch (error) {
    console.error("⚠️ Logout API error:", error);
    
    if (error.response) {
      console.error("Error status:", error.response.status);
      console.error("Error data:", error.response.data);
    }
    
    // Vẫn tiếp tục clear storage dù API lỗi
    console.log("⚠️ Continuing to clear storage despite API error");
  } finally {
    // Luôn clear storage
    clearStorage();
    console.log("✅ User logged out from frontend");
  }
};

/**
 * Clear all authentication storage
 */
const clearStorage = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
  
  // Clear any OAuth session data
  sessionStorage.removeItem("oauth_remember");
  sessionStorage.removeItem("oauth_redirect");
  sessionStorage.removeItem("oauth_course_name");
};