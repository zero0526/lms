import apiClient from "../axiosConfig";
import apiPublicClient from "../axiosPublicConfig";

export const changeUserPassword = async (userId, currentPassword, newPassword) => {
  try {
    const payload = {
      currentPassword,
      newPassword
    };

    const res = await apiClient.post(`/user/update/password/${userId}`, payload);

    if (res.status === 200) {
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

export const requestForgotPassword = async (email) => {
  try {
    const payload = { email: email.trim() };
    const response = await apiClient.post('/user/forgot/password', payload);
    return response.data;
  } catch (error) {
    console.error("Forgot password request failed:", error);
    
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

export const resetPassword = async (token, userId, newPassword) => {
  try {
    const payload = { newPassword };
    const response = await apiPublicClient.post(
      `/user/forgot?token=${token}&userId=${userId}`,
      payload,
      {
        maxRedirects: 0,
        validateStatus: function (status) {
          return status >= 200 && status < 400;
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error("Reset password failed:", error);
    
    if (error.response) {
      console.error("Error Status:", error.response.status);
      console.error("Error Response:", error.response.data);
      
      // Xử lý 302 redirect
      if (error.response.status === 302) {
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
 * @param {Object} userData 
 */
export const logoutUser = async (userData) => {
  try {
    if (!userData || !userData.email) {
      console.warn("No user data found, clearing storage only");
      clearStorage();
      return;
    }

    // Prepare logout payload
    const logoutPayload = {
      email: userData.email,
      password: "",
      fullName: userData.fullName || userData.userName || "",
      roleName: userData.role || "ROLE_STUDENT"
    };
    const response = await apiClient.post('/auth/logout', logoutPayload, {
      withCredentials: true
    });

  } catch (error) {
    console.error("Logout API error:", error); 
    if (error.response) {
      console.error("Error status:", error.response.status);
      console.error("Error data:", error.response.data);
    }
  } finally {
    // Luôn clear storage
    clearStorage();
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