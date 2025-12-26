import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import DevelopmentCourseGrid from "../../components/teachers/DevelopmentCourseGrid";
import CreateCourseModal from "../../components/teachers/CreateCourseModal";
import apiClient from "../../api/axiosConfig";
import courseplaceholder from "../../assets/courseplaceholder.png";

export default function CourseDevelopmentContent() {
  const [developmentCourses, setDevelopmentCourses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const imgplaceholder = courseplaceholder;

  const getDirectGoogleDriveLink = (url) => {
    if (!url || typeof url !== 'string') return "";
    if (!url.includes("drive.google.com")) return url;

    try {
      const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
      if (idMatch && idMatch[1]) {
        return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1000`;
      }
      return url; 
    } catch (e) {
      return url;
    }
  };

  useEffect(() => {
    setIsLoading(true);
    const userIdStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    const userId = userIdStr ? JSON.parse(userIdStr).userId : null;
    
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchDevelopmentCourses = async () => {
      try {
        const response = await apiClient.get(`/course/develop_course/${userId}`);
        if (response.status === 200) {
          const coursesData = response.data.data || [];
          const formattedCourses = coursesData.map(course => ({
            courseId: course.courseId,
            title: course.title,
            description: course.description,
            thumbnailUrl: getDirectGoogleDriveLink(course.thumbnailUrl) || imgplaceholder,
            numOfChapter: course.numOfChapter || 0,
          }));
          setDevelopmentCourses(formattedCourses);
        }
      } catch (error) {
        console.error("Error fetching development courses:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDevelopmentCourses();
  }, []);

  const handleCreateCourse = async (data) => {
    // Open loading for Grid to spin
    setIsLoading(true);
    try {
      const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      
      if (!user || !user.userId) {
          alert("You are not logged in or your session has expired.");
          return;
      }

      const formData = new FormData();
      formData.append("instructorId", user.userId); 
      formData.append("title", data.title);
      formData.append("desc", data.desc);
      formData.append("courseTarget", data.courseTarget);
      formData.append("precondition", data.precondition);
      formData.append("tags", data.tags);
      formData.append("thumbnail", data.thumbnail); 

      const response = await apiClient.post("/course/post", formData);

      if (response.status === 200 || response.status === 201) {
        console.log("Create Response Data:", response.data); 

        const realId = response.data?.data?.id 
                    || response.data?.id 
                    || response.data?.courseId 
                    || response.data?.data?.courseId;

        const newCourse = {
          courseId: realId || Date.now(), 
          title: data.title,
          description: data.desc,
          thumbnailUrl: data.preview, 
          numOfChapter: 0,
        };
        
        setDevelopmentCourses([newCourse, ...developmentCourses]);
        setIsModalOpen(false); 

        if (!realId) {
            console.warn("WARNING: Real ID not found.");
        }
      }
    } catch (error) {
      console.error("Error creating course:", error);
      
      if (error.response) {
          if (error.response.status === 403) {
              alert("Error 403: Server denied. Please check Teacher role or clear old JSESSIONID cookie.");
          } else {
              alert(`Error creating course: ${error.response.data.message || error.message}`);
          }
      } else {
          alert("Server connection error.");
      }
    } finally {
      // Turn off loading after completion
      setIsLoading(false);
    }
  };

  const handleDeleteSuccess = (deletedCourseId) => {
    setDevelopmentCourses((prevCourses) => 
      prevCourses.filter(course => course.courseId !== deletedCourseId)
    );
  };

  const EmptyStateCard = () => (
    <div className="min-h-[500px] flex flex-col items-center justify-center bg-white rounded-xl border border-gray-100 shadow-sm">
      <div 
        onClick={() => !isLoading && setIsModalOpen(true)}
        className={`w-64 h-48 border-2 border-dashed border-[#00b6b6] bg-teal-50/30 rounded-xl flex flex-col items-center justify-center transition group ${
            isLoading ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:bg-teal-50'
        }`}
      >
        <div className={`w-14 h-14 bg-[#00b6b6] rounded-full flex items-center justify-center shadow-lg transition duration-300 ${!isLoading && 'group-hover:scale-110'} ${isLoading ? 'animate-spin' : ''}`}>
          <Plus size={28} className="text-white" />
        </div>
        <p className="mt-4 font-bold text-gray-700 group-hover:text-[#00b6b6]">
          {isLoading ? "Creating..." : "Create Course"}
        </p>
      </div>
      <p className="mt-8 text-gray-400 text-sm uppercase tracking-wider font-medium">
        No courses in development
      </p>
    </div>
  );

  return (
    <div className="p-6">
        {developmentCourses.length > 0 ? (
            <DevelopmentCourseGrid 
              courses={developmentCourses} 
              onOpenModal={() => setIsModalOpen(true)}
              onDeleteSuccess={handleDeleteSuccess}
              isLoading={isLoading}
            />
        ) : (
            <EmptyStateCard />
        )}
        
        <CreateCourseModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onCreate={handleCreateCourse}
        />
    </div>
  );
}