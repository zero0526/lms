import apiClient from "../axiosConfig";

/**
 * Fetch user profile by userId
 */
export const fetchUserProfile = async (userId) => {
  try {
    console.log(`=== FETCHING USER PROFILE ===`);
    console.log(`User ID: ${userId}`);
    
    const response = await apiClient.get(`/user/info/${userId}`);
    const result = response.data;

    if (result.status === 200) {
      console.log("Profile Data:", result.data);
      return result.data;
    }
    
    throw new Error("Failed to fetch profile");
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

/**
 * Update user profile (with optional avatar upload)
 * @param {number} userId 
 * @param {Object} profileData - { fullName, phoneNumber, gender, address, bio }
 * @param {File|null} avatarFile - Image file to upload
 */
export const updateUserProfile = async (userId, profileData, avatarFile = null) => {
  try {
    console.log("=== UPDATE PROFILE ===");
    console.log(`User ID: ${userId}`);
    
    const formData = new FormData();
    formData.append("fullName", profileData.fullName || "");
    formData.append("phoneNumber", profileData.phoneNumber || "");
    formData.append("gender", profileData.gender || "");
    formData.append("address", profileData.address || "");
    formData.append("bio", profileData.bio || "");

    if (avatarFile) {
      formData.append("picture", avatarFile);
      console.log(`Uploading avatar: ${avatarFile.name}`);
    }

    // ← LOG FormData
    console.log("FormData Content:");
    for (let pair of formData.entries()) {
      if (pair[1] instanceof File) {
        console.log(`  ${pair[0]}: [File: ${pair[1].name}]`);
      } else {
        console.log(`  ${pair[0]}: ${pair[1]}`);
      }
    }

    const res = await apiClient.put(`/user/update/info/${userId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      }
    });

    console.log("=== API RESPONSE ===");
    console.log("Status:", res.status);
    console.log("Data:", res.data);

    if (res.status === 200) {
      // ← Đợi backend upload ảnh xong (1 giây)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // ← Fetch lại profile để lấy pictureUrl mới
      const updatedProfile = await fetchUserProfile(userId);
      return updatedProfile;
    }

    throw new Error("Update failed");
  } catch (error) {
    console.error("Failed to update profile:", error);
    if (error.response) {
      console.error("Error Response:", error.response.data);
    }
    throw error;
  }
};