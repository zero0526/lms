import React, { useState, useEffect, useRef } from "react";
import { 
  User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Camera, Loader2 
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import apiClient from "../api/axiosConfig";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // HELPER: FORMAT DATE
  const formatDate = (dateArray) => {
    if (!dateArray || !Array.isArray(dateArray)) return "N/A";
    const [year, month, day, hour, minute] = dateArray;
    return new Date(year, month - 1, day, hour, minute).toLocaleString('vi-VN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // FETCH DATA
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user"));
        
        if (!storedUser || !storedUser.userId) {
            setLoading(false);
            return;
        }

        const response = await apiClient.get(`/user/info/${storedUser.userId}`);
        const result = response.data;

        if (result.status === 200) {
          setProfileData(result.data);
          setFormData(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // HANDLERS
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, pictureUrl: previewUrl }));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const storedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user"));
      const currentUserId = storedUser?.userId || profileData?.userId;

      if (!currentUserId) {
        alert("User ID not found. Please verify login.");
        setLoading(false);
        return;
      }

      const dataToSend = new FormData();
      dataToSend.append("fullName", formData.fullName || "");
      dataToSend.append("phoneNumber", formData.phoneNumber || "");
      dataToSend.append("gender", formData.gender || "");
      dataToSend.append("address", formData.address || "");
      dataToSend.append("bio", formData.bio || "");

      if (selectedFile) {
        dataToSend.append("file", selectedFile); 
      } else {
        dataToSend.append("pictureUrl", formData.pictureUrl || ""); 
      }

      const res = await apiClient.put(`/user/update/info/${currentUserId}`, dataToSend, {
        headers: {
            "Content-Type": "multipart/form-data",
        }
      });

      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (res.status === 200) {
        if (res.data && res.data.data) {
          setProfileData(res.data.data);
          setFormData(res.data.data);
        } else {
            setProfileData({...formData});
        }
        
        setIsEditing(false); 
        setSelectedFile(null);
        alert("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      if (error.response) {
        console.log("Backend error details:", error.response.data);
        alert(`Error: ${error.response.data.message || "Update failed"}`);
      } else {
        alert("An unexpected error occurred during update.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(profileData);
    setSelectedFile(null);
    setIsEditing(false);
  };

  const getAvatarLabel = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="animate-spin text-[#00b6b6]" size={48} />
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex justify-center items-center text-gray-500">
          User profile not found.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 mt-[72px]">
        {/* HEADER SECTION */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-[#00b6b6] to-teal-400 opacity-20"></div>
          
          <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white shadow-md bg-gray-200 flex items-center justify-center text-4xl font-bold text-gray-400 overflow-hidden relative">
                {formData.pictureUrl ? (
                  <img src={formData.pictureUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#00b6b6]">{getAvatarLabel(formData.fullName)}</span>
                )}
              </div>
              
              {/* Edit Avatar */}
              {/* {isEditing && (
                <>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept="image/png, image/jpeg, image/jpg"
                    />
                    <button 
                        type="button"
                        onClick={handleCameraClick}
                        className="absolute bottom-0 right-0 bg-gray-800 text-white p-2 rounded-full hover:bg-black transition shadow-sm cursor-pointer z-10" 
                        title="Upload new photo"
                    >
                        <Camera size={16} />
                    </button>
                </>
              )} */}
            </div>

            {/* Name & Role */}
            <div className="text-center md:text-left flex-1 mb-2 w-full md:w-auto">
              {isEditing ? (
                 <div className="flex flex-col gap-1 w-full md:max-w-md">
                    <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                    <input 
                      type="text" 
                      name="fullName"
                      value={formData.fullName || ""}
                      onChange={handleInputChange}
                      className="text-2xl font-bold text-gray-800 border-b-2 border-[#00b6b6] focus:outline-none bg-transparent px-1 w-full"
                    />
                 </div>
              ) : (
                <h1 className="text-3xl font-bold text-gray-800">{profileData.fullName}</h1>
              )}
              <p className="text-gray-500 font-medium">{profileData.role}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <button onClick={handleCancel} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition flex items-center gap-2">
                    <X size={18} /> Cancel
                  </button>
                  <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-[#00b6b6] text-white font-medium hover:bg-[#009e9e] transition flex items-center gap-2 shadow-sm">
                    <Save size={18} /> Save Changes
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:border-[#00b6b6] hover:text-[#00b6b6] transition flex items-center gap-2 bg-white shadow-sm">
                  <Edit2 size={18} /> Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column: Personal Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User size={20} className="text-[#00b6b6]" /> Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Phone size={14} /> Phone Number
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" name="phoneNumber"
                      value={formData.phoneNumber || ""}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00b6b6] outline-none"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium">{profileData.phoneNumber || "Not updated"}</p>
                  )}
                </div>

                {/* Gender */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <User size={14} /> Gender
                  </label>
                  {isEditing ? (
                    <select 
                      name="gender"
                      value={formData.gender || ""}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00b6b6] outline-none bg-white"
                    >
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
                  ) : (
                    <p className="text-gray-800 font-medium">{profileData.gender || "Not updated"}</p>
                  )}
                </div>

                {/* Address */}
                <div className="md:col-span-2 space-y-1">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <MapPin size={14} /> Address
                  </label>
                  {isEditing ? (
                    <input 
                      type="text" name="address"
                      value={formData.address || ""}
                      onChange={handleInputChange}
                      placeholder="Enter your address"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00b6b6] outline-none"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium">{profileData.address || "Not updated"}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Bio</h3>
              {isEditing ? (
                <textarea 
                  name="bio"
                  value={formData.bio || ""}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Tell us a little about yourself..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00b6b6] outline-none resize-none"
                />
              ) : (
                <p className="text-gray-600 leading-relaxed">
                  {profileData.bio || <span className="italic text-gray-400">No bio added yet.</span>}
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Account Info (Read Only) */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Account Activity</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-teal-50 p-2 rounded-lg text-[#00b6b6]">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Joined Date</p>
                    <p className="text-sm font-bold text-gray-700">{formatDate(profileData.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-orange-50 p-2 rounded-lg text-orange-500">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Last Login</p>
                    <p className="text-sm font-bold text-gray-700">{formatDate(profileData.lastLogin)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[#00b6b6] to-teal-600 rounded-xl shadow-md p-6 text-white">
               <h3 className="font-bold text-lg mb-2">Ready to learn?</h3>
               <p className="text-sm text-teal-100 mb-4">Check out new courses and expand your skills today.</p>
               <button className="w-full bg-white text-[#00b6b6] font-bold py-2 rounded-lg hover:bg-gray-50 transition">
                 Browse Courses
               </button>
            </div>
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
}