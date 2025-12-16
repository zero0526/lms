import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Eye, EyeOff, ArrowLeft, Github } from "lucide-react";
import { AxiosError } from "axios";
import apiClient from "../api/axiosConfig";

const BACKEND_URL = "http://localhost:8081";

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [roleName, setRoleName] = useState("ROLE_STUDENT");
  const [error, setError] = useState("");
  
  const location = useLocation();
  const navigate = useNavigate();

  // --- XỬ LÝ OAUTH2 CALLBACK ---
  // useEffect này sẽ chạy khi Backend redirect ngược lại trang Login kèm accessToken
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("accessToken");
    const errorMsg = params.get("error");

    if (errorMsg) {
      setError("Login failed: " + errorMsg);
      // Xóa query param trên URL cho sạch
      window.history.replaceState({}, document.title, location.pathname);
      return;
    }

    if (token) {
      console.log("OAuth2 Success. Token received:", token);
      
      // 1. Lưu token tạm thời
      if (remember) {
        localStorage.setItem('accessToken', token);
      } else {
        sessionStorage.setItem('accessToken', token);
        // Lưu tạm vào localStorage để apiClient có thể dùng ngay cho request tiếp theo
        // (Tùy logic axiosConfig của bạn, ở đây tôi giả sử bạn ưu tiên localStorage)
        localStorage.setItem('accessToken', token); 
      }

      // 2. Gọi API lấy thông tin User (Profile)
      // Vì OAuth chỉ trả về token, ta cần fetch info để lưu vào localStorage 'user' 
      // để Navbar hiển thị được Avatar/Name
      fetchUserProfile(token);
    }
  }, [location, remember]);

  const fetchUserProfile = async (token) => {
    try {
      // Gửi request lấy thông tin user hiện tại. 
      // LƯU Ý: Bạn cần hỏi BE endpoint chính xác là gì (ví dụ: /auth/me, /users/profile, /auth/profile)
      // Ở đây tôi ví dụ là `/auth/profile` hoặc `/user/me`
      const response = await apiClient.get('/auth/profile'); // <-- CẦN CẬP NHẬT ENDPOINT NÀY THEO BE
      
      const responseData = response.data.data || response.data;
      
      const userToSave = {
          userId: responseData.userId || responseData.id,
          userName: responseData.userName || responseData.name || responseData.email,
          email: responseData.email,
          role: responseData.role || "ROLE_STUDENT",
          avatar: responseData.avatar || null
      };

      const userString = JSON.stringify(userToSave);
      
      if (remember) {
          localStorage.setItem('user', userString);
      } else {
          sessionStorage.setItem('user', userString);
          // Dọn dẹp localStorage nếu không chọn remember (vì ở trên đã set tạm)
          localStorage.removeItem('accessToken');
          sessionStorage.setItem('accessToken', token);
      }

      // Xóa query param và chuyển hướng
      window.history.replaceState({}, document.title, location.pathname);
      navigate('/home');

    } catch (err) {
      console.error("Failed to fetch user profile after OAuth:", err);
      setError("Login successful but failed to load user profile.");
      // Vẫn cho vào nhưng có thể thiếu info user
      navigate('/home'); 
    }
  };

  // 3rd party login handler
  const handleSocialLogin = (provider) => {
    const targetUrl = `${BACKEND_URL}/oauth2/authorization/${provider}?role=${encodeURIComponent(roleName)}`;
    // Navigate to backend OAuth2 endpoint
    window.location.href = targetUrl;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    const payload = {
      email: email.trim(),
      password: password,
      role: roleName, 
    };
    console.log("Sending Login Payload:", payload);

    try {
      const response = await apiClient.post('/auth/login', payload);
      const responseData = response.data.data;
      console.log("Login Success Raw Data:", responseData);

      const accessToken = responseData.accessToken; 

      const userToSave = {
          userId: responseData.userId,
          userName: responseData.userName,
          email: responseData.email,
          role: responseData.role,
          avatar: responseData.avatar
      };
      
      const userString = JSON.stringify(userToSave);
      
      if (remember) {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('user', userString);
      } else {
          sessionStorage.setItem('accessToken', accessToken);
          sessionStorage.setItem('user', userString);
      }

      navigate('/home');
    } catch (err) {
      console.error("Login Error:", err);
      
      if (err instanceof AxiosError) {
          if (err.response) {
            if (err.response.status === 500) {
                setError("Server Error (500). Please check Backend logs.");
            } else {
                setError(err.response.data?.message || "Login failed. Please check your credentials.");
            }
          } else {
              setError("Network Error. Cannot connect to server.");
          }
      } else {
          setError("An unexpected error occurred");
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl flex flex-col md:flex-row max-w-5xl w-full overflow-hidden relative">
        {/* Left Image Section */}
        <div className="hidden md:block md:w-1/2 relative">
          <img
            src="https://images.pexels.com/photos/8613086/pexels-photo-8613086.jpeg"
            alt="Classroom"
            className="h-full w-full object-cover"
          />
          <div className="absolute bottom-5 left-5 text-white">
            <h2 className="text-2xl font-semibold">Learn at TOTC</h2>
            <p className="text-sm opacity-90">
              Learn faster. Grow smarter. Anytime, anywhere.
            </p>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="md:w-1/2 p-10 flex flex-col justify-center relative">
          <Link
            to="/"
            className="absolute top-5 left-5 flex items-center gap-2 text-teal-500 hover:text-teal-600 transition"
          >
            <ArrowLeft size={18} />
            <span className="font-medium">Back to Home</span>
          </Link>

          <div className="flex justify-center mb-6 mt-10">
            <div className="flex bg-teal-200 rounded-full p-1">
              <Link
                to="/login"
                className={`px-8 py-2 rounded-full font-medium transition ${
                  location.pathname === "/login"
                    ? "bg-teal-500 text-white"
                    : "text-teal-700 hover:text-teal-900"
                }`}
              >
                Login
              </Link>

              <Link
                to="/register"
                className={`px-6 py-2 rounded-full font-medium transition ${
                  location.pathname === "/register"
                    ? "bg-teal-500 text-white"
                    : "text-teal-700 hover:text-teal-900"
                }`}
              >
                Register
              </Link>
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-2 text-center">
            Welcome to TOTC
          </h2>
          <p className="text-gray-500 text-center mb-6">
            Empowering your learning journey with modern online courses.
          </p>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block mb-1 text-gray-600">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your Email"
                className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-600">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your Password"
                  className="w-full border border-gray-300 rounded-full px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* ROLE SELECTION */}
            <div>
              <label className="block mb-1 text-gray-600">Login as</label>
              <div className="flex bg-gray-100 p-1 rounded-full">
                <button
                  type="button"
                  className={`flex-1 py-2 rounded-full font-medium transition duration-300 ${
                    roleName === "ROLE_STUDENT"
                      ? "bg-teal-500 text-white shadow-md"
                      : "text-gray-500 hover:text-teal-600"
                  }`}
                  onClick={() => setRoleName("ROLE_STUDENT")}
                >
                  Student
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 rounded-full font-medium transition duration-300 ${
                    roleName === "ROLE_TEACHER"
                      ? "bg-teal-500 text-white shadow-md"
                      : "text-gray-500 hover:text-teal-600"
                  }`}
                  onClick={() => setRoleName("ROLE_TEACHER")}
                >
                  Teacher
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-teal-500" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me
              </label>
              <a href="#" className="text-teal-500 hover:underline">
                Forgot Password?
              </a>
            </div>

            {/* ERROR MESSAGE DISPLAY */}
            {error && (
              <div className="text-red-500 text-sm font-medium mt-2 animate-pulse w-full max-w-md mx-auto text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-teal-500 text-white py-2 rounded-full font-medium hover:bg-teal-600 transition shadow-md cursor-pointer"
            >
              Login
            </button>

            {/* DIVIDER */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or login with
                </span>
              </div>
            </div>
            {/* DIVIDER END */}

            {/* SOCIAL BUTTONS */}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                className="w-full flex items-center justify-center gap-3 border border-gray-300 text-gray-700 py-2 rounded-full hover:bg-gray-50 transition cursor-pointer"
              >
                <GoogleIcon />
                <span className="font-medium">Google</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleSocialLogin('github')}
                className="w-full flex items-center justify-center gap-3 border border-gray-300 text-gray-700 py-2 rounded-full hover:bg-gray-50 transition cursor-pointer"
              >
                <Github size={20} />
                <span className="font-medium">GitHub</span>
              </button>
            </div>
            {/* SOCIAL BUTTONS END */}

          </form>
        </div>
      </div>
    </div>
  );
}