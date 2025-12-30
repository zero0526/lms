/**
 * Get cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null
 */
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return null;
};

/**
 * Delete cookie by name
 * @param {string} name - Cookie name
 */
const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  // Also try with domain if backend set it
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;`;
};

/**
 * Process OAuth tokens from cookies after third-party login
 * Moves tokens from cookies to localStorage/sessionStorage and cleans up cookies
 * @returns {Object|null} User data or null if no tokens found
 */
export const processOAuthTokens = () => {
  // Get tokens from cookies
  const accessToken = getCookie('accessToken');
  const refreshToken = getCookie('refreshToken');
  const userDataStr = getCookie('userData'); // Backend should send user info
  
  if (!accessToken) {
    console.warn("⚠️ No accessToken found in cookies");
    return null;
  }
  
  // Get remember preference from OAuth flow
  const rememberMe = sessionStorage.getItem('oauth_remember') === 'true';
  const storage = rememberMe ? localStorage : sessionStorage;
  
  // Save tokens to storage
  storage.setItem('accessToken', accessToken);
  if (refreshToken) {
    storage.setItem('refreshToken', refreshToken);
  }
  
  // Parse and save user data
  let userData = null;
  if (userDataStr) {
    try {
      userData = JSON.parse(decodeURIComponent(userDataStr));
      storage.setItem('user', JSON.stringify(userData));
    } catch (e) {
      console.error("Failed to parse userData cookie:", e);
    }
  }
  
  // Delete cookies after moving to storage
  deleteCookie('accessToken');
  deleteCookie('refreshToken');
  deleteCookie('userData');
  
  // Clean up OAuth session storage
  sessionStorage.removeItem('oauth_remember');
  
  return userData;
};

/**
 * Get OAuth redirect path after login
 * @returns {string|null} Redirect path or null
 */
export const getOAuthRedirect = () => {
  const redirectPath = sessionStorage.getItem('oauth_redirect');
  sessionStorage.removeItem('oauth_redirect');
  sessionStorage.removeItem('oauth_course_name');
  return redirectPath;
};

/**
 * Clear all authentication data (for logout)
 */
export const clearAuthData = () => {
  // Clear storage
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
  
  // Clear cookies
  deleteCookie('accessToken');
  deleteCookie('refreshToken');
  deleteCookie('userData');
  deleteCookie('JSESSIONID');
};