import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { AxiosError } from "axios";
import apiClient from "../api/axiosConfig";

export default function Register() {
  const [fullName, setFullName] = useState(""); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [roleName, setRoleName] = useState("ROLE_STUDENT");
  
  const location = useLocation();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!fullName || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const payload = {
        fullName,
        email,   
        password,
        roleName, 
      };
      
      console.log("Register Payload:", payload);
      await apiClient.post("/auth/register", payload);
      alert("Registration successful! Please login.");
      navigate("/login");

    } catch (error) {
      console.error("Register Error:", error);
      if (error instanceof AxiosError) {
        setError(error.response?.data?.message || "Registration failed");
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
            src="https://images.pexels.com/photos/8613083/pexels-photo-8613083.jpeg"
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

          <form className="space-y-4" onSubmit={handleRegister}>
            <div>
              <label className="block mb-1 text-gray-600">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: Nguyễn Văn A"
                className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-600">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your Email Address"
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
            
            <div>
              <label className="block mb-1 text-gray-600">Confirm Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Enter your Password again"
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
              <label className="block mb-1 text-gray-600">Select Role</label>
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

            {/* ERROR MESSAGE DISPLAY */}
            {error && (
              <div className="text-red-500 text-sm font-medium mt-2 animate-pulse w-full max-w-md mx-auto text-center p-2 bg-red-50 rounded">
                {error}
              </div>
            )}
            
            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-teal-500 text-white py-2 rounded-full font-medium hover:bg-teal-600 transition shadow-md mt-4 cursor-pointer"
            >
              Register
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}