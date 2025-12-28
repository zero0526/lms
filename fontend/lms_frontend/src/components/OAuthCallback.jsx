import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { processOAuthTokens, getOAuthRedirect } from '../api/utils/oauthUtils';
import { useUser } from '../contexts/UserContext';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  
  useEffect(() => {
    console.log("📍 OAuth Callback Page Loaded");
    
    // Process tokens from cookies
    const userData = processOAuthTokens();
    
    if (userData) {
      // Update user context
      setUser(userData);
      
      // Get redirect path
      const redirectTo = getOAuthRedirect();
      
      console.log("✅ OAuth login successful");
      console.log("Redirect to:", redirectTo || '/home');
      
      // Redirect user
      setTimeout(() => {
        navigate(redirectTo || '/home', { replace: true });
      }, 500);
    } else {
      console.error("❌ OAuth login failed - no tokens found");
      alert("OAuth login failed. Please try again.");
      navigate('/login', { replace: true });
    }
  }, [navigate, setUser]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
        <Loader2 className="w-12 h-12 animate-spin text-teal-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Completing Login...
        </h2>
        <p className="text-gray-500">Please wait while we set up your account</p>
      </div>
    </div>
  );
}