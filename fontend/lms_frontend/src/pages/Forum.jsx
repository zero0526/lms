import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Loader2, MessageSquare, Search } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PostCard from "../components/forum/PostCard";
import PostModal from "../components/forum/PostModal";
import PostDetailModal from "../components/forum/PostDetailModal";
import { getPostsByCourse, createPost, updatePost, deletePost } from "../api/forumApi";
import { getCourseDetails } from "../api/user/courseApi";

export default function Forum() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  // User state
  const [currentUser, setCurrentUser] = useState(null);
  const [isTeacher, setIsTeacher] = useState(false);
  
  // Course state
  const [courseTitle, setCourseTitle] = useState("");
  
  // Posts state
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Modal state
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Detail modal state
  const [selectedPost, setSelectedPost] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Load user data
  useEffect(() => {
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      setIsTeacher(user.role === "ROLE_TEACHER");
    }
  }, []);

  // Load course details
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await getCourseDetails(courseId);
        if (response.data) {
          setCourseTitle(response.data.title);
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
      }
    };
    
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  // Fetch posts
  const fetchPosts = useCallback(async (pageNum = 0, append = false) => {
    if (!courseId) return;
    
    if (pageNum === 0) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    
    try {
      const response = await getPostsByCourse(courseId, pageNum);
      
      if (response.content) {
        if (append) {
          setPosts(prev => [...prev, ...response.content]);
        } else {
          setPosts(response.content);
        }
        setHasMore(!response.last);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchPosts(0);
  }, [fetchPosts]);

  // Create/Update post
  const handleSubmitPost = async (postData) => {
    setIsSubmitting(true);
    
    try {
      if (editingPost) {
        // Update existing post
        const response = await updatePost(editingPost.id, postData);
        setPosts(prev => prev.map(post => 
          post.id === editingPost.id ? response : post
        ));
      } else {
        // Create new post
        const response = await createPost(postData);
        setPosts(prev => [response, ...prev]);
      }
      
      setIsPostModalOpen(false);
      setEditingPost(null);
    } catch (error) {
      console.error("Error submitting post:", error);
      alert("Failed to submit post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete post
  const handleDeletePost = async (postId) => {
    try {
      await deletePost(postId);
      setPosts(prev => prev.filter(post => post.id !== postId));
      
      // Close detail modal if the deleted post is being viewed
      if (selectedPost?.id === postId) {
        setIsDetailModalOpen(false);
        setSelectedPost(null);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Please try again.");
    }
  };

  // Edit post
  const handleEditPost = (post) => {
    setEditingPost(post);
    setIsPostModalOpen(true);
  };

  // Open post detail
  const handlePostClick = (post) => {
    setSelectedPost(post);
    setIsDetailModalOpen(true);
  };

  // Load more posts
  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchPosts(page + 1, true);
    }
  };

  // Filter posts by search term
  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort posts: pinned first, then by date
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  // Navigate back
  const handleBack = () => {
    if (isTeacher) {
      navigate(`/teacher/courses/${courseId}`);
    } else {
      navigate(`/student/courses/${courseId}`);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-[#00b6b6] transition mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to course</span>
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <MessageSquare className="text-[#00b6b6]" />
                Course Forum
              </h1>
              {courseTitle && (
                <p className="text-gray-500 mt-1">{courseTitle}</p>
              )}
            </div>
            
            <button
              onClick={() => { setEditingPost(null); setIsPostModalOpen(true); }}
              className="flex items-center gap-2 bg-[#00b6b6] text-white px-5 py-2.5 rounded-full font-medium hover:bg-[#009e9e] transition shadow-md"
            >
              <Plus size={20} />
              New Post
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search posts..."
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00b6b6] focus:border-transparent outline-none transition bg-white"
          />
        </div>

        {/* Posts List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#00b6b6] mb-4" size={40} />
            <p className="text-gray-500">Loading posts...</p>
          </div>
        ) : sortedPosts.length > 0 ? (
          <div className="space-y-4">
            {sortedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUser?.userId}
                onEdit={handleEditPost}
                onDelete={handleDeletePost}
                onClick={handlePostClick}
                isTeacher={isTeacher}
              />
            ))}
            
            {/* Load More Button */}
            {hasMore && !searchTerm && (
              <div className="text-center pt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium disabled:opacity-50"
                >
                  {isLoadingMore ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={18} className="animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    "Load More Posts"
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <MessageSquare size={60} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchTerm ? "No posts found" : "No posts yet"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? "Try a different search term"
                : "Be the first to start a discussion in this course!"
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => { setEditingPost(null); setIsPostModalOpen(true); }}
                className="inline-flex items-center gap-2 bg-[#00b6b6] text-white px-6 py-3 rounded-full font-medium hover:bg-[#009e9e] transition"
              >
                <Plus size={20} />
                Create First Post
              </button>
            )}
          </div>
        )}
      </main>

      <Footer />

      {/* Post Create/Edit Modal */}
      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => { setIsPostModalOpen(false); setEditingPost(null); }}
        onSubmit={handleSubmitPost}
        initialData={editingPost}
        courseId={courseId}
        isLoading={isSubmitting}
      />

      {/* Post Detail Modal */}
      <PostDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => { setIsDetailModalOpen(false); setSelectedPost(null); }}
        post={selectedPost}
        currentUserId={currentUser?.userId}
        onEdit={handleEditPost}
        onDelete={handleDeletePost}
        isTeacher={isTeacher}
      />
    </div>
  );
}
