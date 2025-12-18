import apiClient from "../axiosConfig";

/**
 * Update chapter info
 */
export const updateChapter = async (chapterId, title, order) => {
  try {
    const res = await apiClient.put(`/chapter/${chapterId}`, {
      title,
      order,
    });
    return res.data;
  } catch (error) {
    console.error("Error updating chapter:", error);
    throw error;
  }
};

/**
 * Delete chapter
 */
export const deleteChapter = async (chapterId) => {
  try {
    const res = await apiClient.delete(`/chapter/${chapterId}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting chapter:", error);
    throw error;
  }
};