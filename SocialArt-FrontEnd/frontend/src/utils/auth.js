// Authentication utility functions

// Clear all user data and session data
export const clearAllData = () => {
  // Clear localStorage
  localStorage.clear();
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Clear any cookies
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
  });
  
  console.log("All user data cleared");
};

// Clear only authentication data
export const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("access");
  sessionStorage.removeItem("refresh");
  
  console.log("Authentication data cleared");
};

// Get current user data
export const getCurrentUser = () => {
  const userData = localStorage.getItem("user");
  if (!userData) return null;
  
  try {
    return JSON.parse(userData);
  } catch (e) {
    console.error("Error parsing user data:", e);
    return null;
  }
};

// Get current username
export const getCurrentUsername = () => {
  const user = getCurrentUser();
  return user ? user.username : null;
};

// Check if user is logged in
export const isLoggedIn = () => {
  const token = localStorage.getItem("token") || localStorage.getItem("access");
  const user = getCurrentUser();
  return !!(token && user);
}; 