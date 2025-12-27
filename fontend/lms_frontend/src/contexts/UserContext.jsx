import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUserData = () => {
      let storedUser = localStorage.getItem("user");
      if (!storedUser) {
        storedUser = sessionStorage.getItem("user");
      }
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log("User restored:", parsedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error("Error parsing user data:", error);
          localStorage.removeItem("user");
          sessionStorage.removeItem("user");
        }
      }
      setIsLoading(false);
    };
    getUserData();
  }, []);

  const updateUser = (newUserData) => {
    console.log("Updating user context:", newUserData);
    
    const normalizedData = {
      ...newUserData,
      avatar: newUserData.pictureUrl || newUserData.avatar,
      pictureUrl: newUserData.pictureUrl || newUserData.avatar,
    };
    
    setUser(normalizedData);
    
    const storageKey = localStorage.getItem("user") ? "localStorage" : "sessionStorage";
    if (storageKey === "localStorage") {
      localStorage.setItem("user", JSON.stringify(normalizedData));
    } else {
      sessionStorage.setItem("user", JSON.stringify(normalizedData));
    }
  };

  // Logout function
  const logout = () => {
    console.log("🚪 Logging out...");
    
    // Clear storage
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    
    // Clear cookies
    document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <UserContext.Provider value={{ user, setUser, updateUser, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};