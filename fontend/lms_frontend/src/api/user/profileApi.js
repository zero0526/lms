import apiClient from "../axiosConfig";

/**
 * Fetch user profile by userId
 */
export const fetchUserProfile = async (userId) => {
  try { 
    const response = await apiClient.get(`/user/info/${userId}`);
    const result = response.data;

    if (result.status === 200) {
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
    
    const formData = new FormData();
    formData.append("fullName", profileData.fullName || "");
    formData.append("phoneNumber", profileData.phoneNumber || "");
    formData.append("gender", profileData.gender || "");
    formData.append("address", profileData.address || "");
    formData.append("bio", profileData.bio || "");

    if (avatarFile) {
      formData.append("picture", avatarFile);
    }

    const res = await apiClient.put(`/user/update/info/${userId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      }
    });

    if (res.status === 200) {
      await new Promise(resolve => setTimeout(resolve, 1000));
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