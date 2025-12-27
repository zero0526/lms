import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUserData = () => {
      let storedUser = localStorage.getItem("user");
      if (!storedUser) {
        storedUser = sessionStorage.getItem("user");
      }
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    };
    getUserData();
  }, []);

  const updateUser = (newUserData) => {
    console.log("Updating user context:", newUserData);
    
    // Normalize avatar and pictureUrl fields
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

  return (
    <UserContext.Provider value={{ user, setUser, updateUser }}>
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