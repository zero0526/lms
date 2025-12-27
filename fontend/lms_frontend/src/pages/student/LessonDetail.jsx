import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  CheckCircle,
  Clock, 
  FileText, 
  HelpCircle, 
  Download,
  ExternalLink,
  AlertCircle,
  VideoOff,
  FileX
} from "lucide-react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import StudentCourseContent from "../../components/students/StudentCourseContent";
import QuizComponent from "../../components/students/QuizComponent";
import { getLessonDetail, updateVideoProgress } from "../../api/student/lessonApi";
import { getCourseOutlineEnrolled } from "../../api/user/courseApi";
import { getCurrentUserId } from "../../api/user/userUtils";
import { convertDriveLink } from "../../api/user/userUtils";

export default function LessonPage() {
  const { courseId, lessonId } = useParams();
  const videoRef = useRef(null);
  const youtubePlayerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState("quiz");
  const [lessonData, setLessonData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [youtubeReady, setYoutubeReady] = useState(false);

  // Load YouTube IFrame API
  useEffect(() => {
    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      setYoutubeReady(true);
      return;
    }

    // Load YouTube API script
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // API ready callback
    window.onYouTubeIframeAPIReady = () => {
      console.log("YouTube IFrame API Ready");
      setYoutubeReady(true);
    };

    return () => {
      window.onYouTubeIframeAPIReady = null;
    };
  }, []);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (youtubePlayerRef.current) {
        youtubePlayerRef.current.destroy();
        youtubePlayerRef.current = null;
      }
    };
  }, []);

  // Fetch lesson detail
  useEffect(() => {
    const fetchLessonDetail = async () => {
      if (!lessonId) return;

      try {
        setIsLoading(true);
        setError(null);
        
        const userId = getCurrentUserId();
        
        if (!userId) {
          setError("Please log in to view lesson content");
          setIsLoading(false);
          return;
        }

        console.log("Fetching lesson detail for lessonId:", lessonId);
        
        const response = await getLessonDetail(userId, lessonId);
        
        console.log("Lesson data:", response.data);
        
        setLessonData(response.data);
        setVideoEnded(false);
        setIsLoading(false);
        
        // Auto-select tab based on available content
        if (response.data.quizzes && response.data.quizzes.length > 0) {
          setActiveTab("quiz");
        } else if (response.data.docs && response.data.docs.length > 0) {
          setActiveTab("document");
        }
        
      } catch (err) {
        console.error("Failed to fetch lesson detail:", err);
        setError("Failed to load lesson content. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchLessonDetail();
  }, [lessonId]);

  // Initialize YouTube Player
  useEffect(() => {
    if (!lessonData || !youtubeReady || !lessonData.urlVideo) return;

    const isYouTube = lessonData.urlVideo.includes('youtube') || lessonData.urlVideo.includes('youtu.be');
    if (!isYouTube) return;

    const videoId = getYoutubeVideoId(lessonData.urlVideo);
    if (!videoId) {
      console.error("Could not extract YouTube video ID");
      return;
    }

    console.log("🎬 Initializing YouTube Player with ID:", videoId);

    // Destroy existing player
    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.destroy();
    }

    // Create new player
    youtubePlayerRef.current = new window.YT.Player('youtube-player', {
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 1,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    });

  }, [lessonData, youtubeReady]);

  // YouTube Player Ready
  const onPlayerReady = (event) => {
    console.log("YouTube Player Ready");
  };

  // YouTube Player State Change
  const onPlayerStateChange = (event) => {
    const userId = getCurrentUserId();
    if (!userId) return;

    // Playing state
    if (event.data === window.YT.PlayerState.PLAYING) {
      console.log("▶️ Video Playing");
      startYouTubeProgressTracking();
    }

    // Paused state
    if (event.data === window.YT.PlayerState.PAUSED) {
      console.log("⏸️ Video Paused");
      stopProgressTracking();
    }

    // Ended state
    if (event.data === window.YT.PlayerState.ENDED) {
      console.log("🎉 Video Ended");
      handleVideoEnded();
    }
  };

  // Start YouTube Progress Tracking
  const startYouTubeProgressTracking = () => {
    const userId = getCurrentUserId();
    if (!userId || !youtubePlayerRef.current) return;

    // Clear existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    console.log("📹 Starting YouTube progress tracking (every 10 seconds)");

    progressIntervalRef.current = setInterval(async () => {
      try {
        if (!youtubePlayerRef.current) return;

        const currentTime = Math.floor(youtubePlayerRef.current.getCurrentTime());
        
        console.log(`⏱️ YouTube Progress: ${currentTime}s`);

        await updateVideoProgress(userId, lessonId, courseId, currentTime);
      } catch (error) {
        console.error("Failed to update YouTube progress:", error);
      }
    }, 10000); // Every 10 seconds
  };

  // Stop Progress Tracking
  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
      console.log("⏹️ Progress tracking stopped");
    }
  };

  // Setup HTML5 video progress tracking (for non-YouTube videos)
  useEffect(() => {
    const video = videoRef.current;
    
    if (!video || !lessonData || videoEnded) return;

    const isYouTube = lessonData.urlVideo?.includes('youtube') || lessonData.urlVideo?.includes('youtu.be');
    if (isYouTube) return; // Skip for YouTube videos

    const userId = getCurrentUserId();
    if (!userId) return;

    // Start tracking progress every 10 seconds
    const startProgressTracking = () => {
      console.log("📹 Starting HTML5 video progress tracking");
      
      progressIntervalRef.current = setInterval(async () => {
        if (video.paused || video.ended) return;
        
        const currentTime = Math.floor(video.currentTime);
        
        console.log(`⏱️ HTML5 Progress: ${currentTime}s`);
        
        try {
          await updateVideoProgress(userId, lessonId, courseId, currentTime);
        } catch (error) {
          console.error("Failed to update progress:", error);
        }
      }, 10000); // Every 10 seconds
    };

    // Handle video play
    const handlePlay = () => {
      if (!progressIntervalRef.current) {
        startProgressTracking();
      }
    };

    // Handle video pause - stop tracking
    const handlePause = () => {
      stopProgressTracking();
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    // Auto start if video is already playing
    if (!video.paused) {
      startProgressTracking();
    }

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      stopProgressTracking();
    };
  }, [lessonData, courseId, lessonId, videoEnded]);

  // Handle video ended (both YouTube and HTML5)
  const handleVideoEnded = async () => {
    console.log("🎉 Video ended - updating final progress");
    
    setVideoEnded(true);
    stopProgressTracking();

    const userId = getCurrentUserId();
    if (!userId) return;

    try {
      let finalTime = 0;

      // Get duration from YouTube player or HTML5 video
      if (youtubePlayerRef.current) {
        finalTime = Math.floor(youtubePlayerRef.current.getDuration());
      } else if (videoRef.current) {
        finalTime = Math.floor(videoRef.current.duration);
      }
      
      console.log(`📤 Sending final progress: ${finalTime}s`);

      // Update final progress
      await updateVideoProgress(userId, lessonId, courseId, finalTime);
      
      console.log("Final progress updated, refreshing course outline...");
      
      // Refresh course outline to get updated progress
      await getCourseOutlineEnrolled(userId, courseId);
      
      // Trigger refresh of StudentCourseContent component
      window.dispatchEvent(new CustomEvent('course-outline-updated'));
      
    } catch (error) {
      console.error("Failed to update final progress:", error);
    }
  };

  // Extract YouTube Video ID
  const getYoutubeVideoId = (url) => {
    if (!url) return null;
    
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[7].length === 11) ? match[7] : null;
  };

  // Convert YouTube URL to embed (legacy support)
  const getYoutubeEmbedUrl = (url) => {
    const videoId = getYoutubeVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00b6b6] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading lesson...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !lessonData) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-24 px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-800 mb-2">Failed to load lesson</h2>
            <p className="text-red-600">{error || "Lesson not found"}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const hasVideo = lessonData.urlVideo && lessonData.urlVideo.trim() !== '';
  const hasDocs = lessonData.docs && lessonData.docs.length > 0;
  const hasQuizzes = lessonData.quizzes && lessonData.quizzes.length > 0;
  const isYouTube = lessonData.urlVideo?.includes('youtube') || lessonData.urlVideo?.includes('youtu.be');
  
  // Convert 0.0-0.5 to 0-100%
  const progressPercent = (lessonData.progressLesson || 0) * 2 * 100;
  const isCompleted = progressPercent === 100;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto w-full pt-24 pb-10 px-4 gap-6 grid grid-cols-1 lg:grid-cols-3">
        
        {/* LEFT COLUMN (Video + Tabs) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* VIDEO PLAYER AREA */}
          <div className="bg-black rounded-xl overflow-hidden shadow-lg aspect-video relative group border-4 border-white">
            {hasVideo ? (
              isYouTube ? (
                // YouTube Player with API
                <div id="youtube-player" className="w-full h-full"></div>
              ) : (
                // HTML5 Video
                <video 
                  ref={videoRef}
                  controls 
                  className="w-full h-full object-cover"
                  onEnded={handleVideoEnded}
                >
                  <source src={lessonData.urlVideo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white">
                <VideoOff size={64} className="mb-4 opacity-50" />
                <p className="text-lg font-medium">No video available</p>
                <p className="text-sm text-gray-400 mt-2">This lesson doesn't have video content yet</p>
              </div>
            )}
          </div>

          {/* INFO BAR */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{lessonData.title}</h1>
            <div className="flex items-center text-sm text-gray-500 gap-4 mb-4 flex-wrap">
              <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                <CheckCircle size={16}/> Length
              </span>
              <span className={`flex items-center gap-1 px-2 py-1 rounded ${
                isCompleted ? "bg-teal-50 text-[#00b6b6]" : "bg-gray-100 text-gray-500"
              }`}>
                <Clock size={16}/> {formatDuration(lessonData.duration)}
              </span>
              {progressPercent > 0 && !isCompleted && (
                <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded">
                  Progress: {progressPercent}%
                </span>
              )}
            </div>
            {lessonData.description && (
              <p className="text-gray-600 leading-relaxed">{lessonData.description}</p>
            )}
          </div>

          {/* TABS SECTION (Quiz & Document) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[450px]">
            {/* Tab Header */}
            <div className="flex border-b border-gray-200">
              <button 
                onClick={() => setActiveTab("quiz")}
                className={`cursor-pointer flex-1 py-4 font-semibold flex items-center justify-center gap-2 transition relative
                  ${activeTab === "quiz" ? "text-[#00b6b6] bg-teal-50/50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}
                `}
              >
                <HelpCircle size={20}/> 
                Quiz
                {!hasQuizzes && <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded">Empty</span>}
                {activeTab === "quiz" && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#00b6b6]"></div>}
              </button>
              <button 
                onClick={() => setActiveTab("document")}
                className={`cursor-pointer flex-1 py-4 font-semibold flex items-center justify-center gap-2 transition relative
                  ${activeTab === "document" ? "text-[#00b6b6] bg-teal-50/50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}
                `}
              >
                <FileText size={20}/> 
                Documents
                {!hasDocs && <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded">Empty</span>}
                {activeTab === "document" && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#00b6b6]"></div>}
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "quiz" ? (
                <QuizComponent quizzes={lessonData.quizzes} /> 
              ) : (
                <DocumentComponent documents={lessonData.docs} />
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (Course content) */}
        <div className="lg:col-span-1">
          <StudentCourseContent 
            currentLessonId={lessonId}
            onLessonChange={(newLessonId) => {
              // Clear interval and destroy player before changing lesson
              stopProgressTracking();
              if (youtubePlayerRef.current) {
                youtubePlayerRef.current.destroy();
                youtubePlayerRef.current = null;
              }
              window.location.href = `/student/courses/${courseId}/lessons/${newLessonId}`;
            }}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}

// SUB-COMPONENT: DOCUMENT
function DocumentComponent({ documents }) {
  if (!documents || documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center space-y-5">
        <div className="bg-gray-100 p-4 rounded-full">
          <FileX size={48} className="text-gray-400"/>
        </div>
        <h3 className="text-xl font-bold text-gray-700">No Documents Available</h3>
        <p className="text-gray-500 max-w-md">
          This lesson doesn't have any documents yet. Focus on the video content and quiz.
        </p>
      </div>
    );
  }

  const getFileIcon = (fileType) => {
    if (!fileType) return <FileText size={24}/>;
    
    if (fileType.includes('pdf')) return <FileText size={24} className="text-white"/>;
    if (fileType.includes('doc')) return <FileText size={24} className="text-white"/>;
    if (fileType.includes('zip')) return <Download size={24} className="text-white"/>;
    
    return <FileText size={24}/>;
  };

  const getFileColor = (fileType) => {
    if (!fileType) return "bg-gray-500";
    
    if (fileType.includes('pdf')) return "bg-red-500";
    if (fileType.includes('doc')) return "bg-blue-500";
    if (fileType.includes('zip')) return "bg-purple-500";
    
    return "bg-gray-500";
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <h3 className="font-bold text-gray-800 mb-4 text-lg border-l-4 border-[#00b6b6] pl-3">
        Study Materials ({documents.length})
      </h3>
      
      {documents.map((doc, index) => {
        const downloadUrl = convertDriveLink(doc.docUrl);
        const displayTitle = doc.title || `Document ${index + 1}`;
        
        return (
          <a 
            key={doc.id} 
            href={downloadUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-[#00b6b6] transition group"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg text-white transition-colors ${getFileColor(doc.fileType)}`}>
                {getFileIcon(doc.fileType)}
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 group-hover:text-[#00b6b6] transition">
                  {displayTitle}
                </h4>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  {doc.fileType || 'Unknown type'} • Click to view or download
                </p>
              </div>
            </div>
            <ExternalLink size={18} className="text-gray-300 group-hover:text-[#00b6b6] transition"/>
          </a>
        );
      })}
    </div>
  );
}