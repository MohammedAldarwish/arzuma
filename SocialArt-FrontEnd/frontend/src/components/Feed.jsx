import React, { useState, useEffect, useRef } from "react";
import PostCard from "./PostCard";
import { SkeletonFeed } from "./Skeleton";
import { useAppState } from "./AppStateContext";
import {
  getArtPosts,
  likePost,
  unlikePost,
  createComment,
  getComments,
  getStories,
  createStory,
  deleteStory,
} from "../api";
import { getAccessToken } from "../api";

const STORY_DURATION = 90_000; // 90 ثانية لكل ستوري

// دالة لتجميع ستوريز كل مستخدم في قائمة واحدة
function groupStoriesByUser(stories) {
  const map = new Map();
  stories.forEach((story) => {
    // دعم أكثر من شكل للبيانات
    let userId = null;
    let userObj = null;
    if (typeof story.user === "object" && story.user !== null) {
      userId = story.user.id || story.user.user?.id;
      userObj = story.user;
    } else if (typeof story.user === "number") {
      userId = story.user;
      userObj = { id: userId, username: "User" };
    }
    if (!userId) return;
    if (!map.has(userId)) {
      map.set(userId, { user: userObj, stories: [story] });
    } else {
      map.get(userId).stories.push(story);
    }
  });
  return Array.from(map.values());
}

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(true);
  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});
  const [likeDebounce, setLikeDebounce] = useState({});
  const [likeLoading, setLikeLoading] = useState({});
  const [stories, setStories] = useState([]);
  const [storiesLoading, setStoriesLoading] = useState(true);
  const [storiesError, setStoriesError] = useState(null);
  const [uploadingStory, setUploadingStory] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const progressRef = useRef();
  const timerRef = useRef();
  const [activeUserStories, setActiveUserStories] = useState(null); // قائمة ستوريز المستخدم المفتوحة
  const [activeUserStoryIndex, setActiveUserStoryIndex] = useState(0); // مؤشر الستوري الحالية للمستخدم

  // Simplify the AppStateContext usage
  let userPreferences = { showAnimations: true };
  try {
    const appState = useAppState();
    userPreferences = appState.userPreferences;
  } catch (err) {
    console.warn("Could not load user preferences:", err);
  }

  useEffect(() => {
    // Check if we're returning from upload page
    const urlParams = new URLSearchParams(window.location.search);
    const shouldRefresh = urlParams.get("refresh");

    if (shouldRefresh) {
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
      // Force refresh posts
      setPage(1);
      fetchPosts();
    } else {
      fetchPosts();
    }

    // Auto-refresh posts every 30 seconds
    const interval = setInterval(() => {
      fetchPosts();
    }, 30000);

    return () => clearInterval(interval);
  }, [page]);

  // جلب الستوري عند التحميل
  useEffect(() => {
    const fetchStories = async () => {
      setStoriesLoading(true);
      setStoriesError(null);
      try {
        const data = await getStories();
        console.log("Stories from API (useEffect):", data);
        setStories(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        setStoriesError("فشل تحميل الستوري");
      } finally {
        setStoriesLoading(false);
      }
    };
    fetchStories();
  }, []);

  // عند فتح ستوري: ابدأ العداد
  useEffect(() => {
    if (activeStoryIndex === null) return;
    setStoryProgress(0);
    if (timerRef.current) clearInterval(timerRef.current);
    const start = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      setStoryProgress(Math.min(1, elapsed / STORY_DURATION));
      if (elapsed >= STORY_DURATION) {
        handleNextStory();
      }
    }, 50);
    return () => clearInterval(timerRef.current);
  }, [activeStoryIndex]);

  // إغلاق الستوري عند الضغط على زر Esc
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeStoryIndex === null) return;
      if (e.key === "Escape") closeStoryModal();
      if (e.key === "ArrowRight") handleNextStory();
      if (e.key === "ArrowLeft") handlePrevStory();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeStoryIndex]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from Django backend first
      try {
        const data = await getArtPosts(page);
        if (page === 1) {
          setPosts(data.results || data);
        } else {
          setPosts((prev) => [...prev, ...(data.results || data)]);
        }
        setHasNext(!!data.next);
        return;
      } catch (backendError) {
        console.log("Backend not available, using mock data");
      }

      // Fallback to mock data if backend is not available
      const delay = userPreferences?.showAnimations ? 800 : 400;
      await new Promise((resolve) => setTimeout(resolve, delay));

      const mockPosts = [
        {
          id: 1,
          user: "Emma Chen",
          description:
            "Just finished this classical still life study. The interplay of light and shadow in flowers has always fascinated me. What do you think? 🌸",
          posted_at: new Date().toISOString(),
          like_count: 324,
          comment_count: 28,
          images: [
            {
              image:
                "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119",
            },
          ],
          categories: [{ id: 1, name: "Classical" }],
          likes: [],
          comments: [],
        },
        {
          id: 2,
          user: "Marcus Rodriguez",
          description:
            "Exploring vibrant colors and abstract forms. This piece represents the energy of urban life and the emotions it evokes.",
          posted_at: new Date(Date.now() - 3600000).toISOString(),
          like_count: 456,
          comment_count: 42,
          images: [
            {
              image:
                "https://images.pexels.com/photos/1585325/pexels-photo-1585325.jpeg",
            },
          ],
          categories: [{ id: 2, name: "Abstract" }],
          likes: [],
          comments: [],
        },
        {
          id: 3,
          user: "Sophia Kim",
          description:
            "Watercolor painting has always been my passion. The way colors blend and flow creates such beautiful, unexpected results.",
          posted_at: new Date(Date.now() - 7200000).toISOString(),
          like_count: 289,
          comment_count: 19,
          images: [
            {
              image:
                "https://images.unsplash.com/photo-1573221566340-81bdde00e00b",
            },
          ],
          categories: [{ id: 3, name: "Watercolor" }],
          likes: [],
          comments: [],
        },
      ];

      if (page === 1) {
        setPosts(mockPosts);
      } else {
        setPosts((prev) => [...prev, ...mockPosts]);
      }
      setHasNext(false);
    } catch (err) {
      setError("Failed to load posts. Please try again.");
      console.error("Error loading posts:", err);
    } finally {
      setLoading(false);
    }
  };

  // دالة مساعدة لاستخراج username من localStorage
  const getCurrentUsername = () => {
    try {
      const user = localStorage.getItem("user");
      if (!user) return null;
      const parsedUser = JSON.parse(user);
      return typeof parsedUser === "string" ? parsedUser : parsedUser?.username;
    } catch {
      return null;
    }
  };

  // دالة مساعدة للتحقق من إعجاب المستخدم الحالي
  const isUserLiked = (post) => {
    const username = getCurrentUsername();
    if (!username || !post.likes || !Array.isArray(post.likes)) return false;

    return post.likes.some(
      (like) =>
        like &&
        like.user &&
        like.user.trim().toLowerCase() === username.trim().toLowerCase()
    );
  };

  const handleLike = async (postId) => {
    // احفظ الحالة السابقة للتراجع عنها في حالة الفشل
    const currentPost = posts.find((p) => p.id === postId);
    const wasLiked = isUserLiked(currentPost);
    const prevLikeCount = currentPost.like_count || 0;

    try {
      const token = getAccessToken();
      if (!token) {
        alert("Please login to like posts");
        return;
      }

      // Optimistic Update - تحديث فوري في الواجهة (مثل إنستجرام)
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId
            ? {
                ...p,
                like_count: wasLiked
                  ? Math.max(0, prevLikeCount - 1)
                  : prevLikeCount + 1,
                likes: wasLiked
                  ? (p.likes || []).filter(
                      (like) =>
                        like && like.user && like.user !== getCurrentUsername()
                    )
                  : [
                      ...(p.likes || []).filter(
                        (like) =>
                          like &&
                          like.user &&
                          like.user !== getCurrentUsername()
                      ),
                      { user: getCurrentUsername() },
                    ],
              }
            : p
        )
      );

      // أرسل طلب toggle للـ like في الخلفية (بدون تحديث الواجهة)
      await likePost(postId);
    } catch (err) {
      console.error("Like/Unlike error:", err);

      // في حالة الفشل فقط، أعيد الحالة السابقة
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId
            ? {
                ...p,
                like_count: prevLikeCount,
                likes: wasLiked
                  ? [
                      ...(p.likes || []).filter(
                        (like) =>
                          like &&
                          like.user &&
                          like.user !== getCurrentUsername()
                      ),
                      { user: getCurrentUsername() },
                    ]
                  : (p.likes || []).filter(
                      (like) =>
                        like && like.user && like.user !== getCurrentUsername()
                    ),
              }
            : p
        )
      );

      alert("فشل في الإعجاب أو إلغاء الإعجاب: " + (err.message || err));
    }
  };

  const handleComment = async (postId) => {
    try {
      const content = commentText[postId];
      if (!content || !content.trim()) {
        alert("Please enter a comment");
        return;
      }

      await createComment(postId, content);
      setCommentText((prev) => ({ ...prev, [postId]: "" }));

      // Refresh comments
      const updatedPosts = posts.map((post) => {
        if (post.id === postId) {
          return { ...post, comment_count: (post.comment_count || 0) + 1 };
        }
        return post;
      });
      setPosts(updatedPosts);
    } catch (err) {
      console.error("Comment error:", err);
      alert("Failed to post comment");
    }
  };

  const toggleComments = async (postId) => {
    if (!showComments[postId]) {
      try {
        const comments = await getComments(postId);
        const updatedPosts = posts.map((post) => {
          if (post.id === postId) {
            return { ...post, comments };
          }
          return post;
        });
        setPosts(updatedPosts);
      } catch (err) {
        console.error("Fetch comments error:", err);
      }
    }
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const loadMore = () => {
    if (hasNext && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  // رفع ستوري جديدة
  const handleStoryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingStory(true);
    try {
      await createStory(file);
      // أعد تحميل الستوري بعد الرفع
      const data = await getStories();
      console.log("Stories from API (after upload):", data);
      setStories(Array.isArray(data) ? data : data.results || []);
      alert("تم رفع الستوري بنجاح!");
    } catch (err) {
      alert("فشل رفع الستوري: " + (err.message || err));
    } finally {
      setUploadingStory(false);
    }
  };

  const openStoryModal = (index) => {
    setActiveStoryIndex(index);
    setStoryProgress(0);
  };
  const closeStoryModal = () => {
    setActiveStoryIndex(null);
    setStoryProgress(0);
  };
  const handleNextStory = () => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex < stories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
    } else {
      closeStoryModal();
    }
  };
  const handlePrevStory = () => {
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
    }
  };

  // دعم السحب (Swipe) على الجوال
  const touchStartX = useRef(null);
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX > 50) handlePrevStory();
    else if (deltaX < -50) handleNextStory();
    touchStartX.current = null;
  };

  // بدلاً من استخدام stories مباشرة، استخدم قائمة مجمعة لكل مستخدم
  const groupedStories = groupStoriesByUser(stories);

  // عند فتح ستوري مستخدم: افتح كل ستوريز هذا المستخدم
  const openUserStoriesModal = (userStories) => {
    setActiveUserStories(userStories);
    setActiveUserStoryIndex(0);
    setStoryProgress(0);
  };
  const closeUserStoriesModal = () => {
    setActiveUserStories(null);
    setActiveUserStoryIndex(0);
    setStoryProgress(0);
  };
  const handleNextUserStory = () => {
    if (!activeUserStories) return;
    if (activeUserStoryIndex < activeUserStories.stories.length - 1) {
      setActiveUserStoryIndex(activeUserStoryIndex + 1);
    } else {
      closeUserStoriesModal();
    }
  };
  const handlePrevUserStory = () => {
    if (activeUserStoryIndex > 0) {
      setActiveUserStoryIndex(activeUserStoryIndex - 1);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="max-w-lg mx-auto pt-20 md:pt-24 pb-20 md:pb-8 px-4">
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-700 p-4"
            >
              <div className="animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-dark-600 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-dark-600 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-dark-600 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="h-80 bg-gray-200 dark:bg-dark-600 rounded-xl mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-dark-600 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-dark-600 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto pt-20 md:pt-24 pb-20 md:pb-8 px-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
            Unable to load posts
          </h3>
          <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto pt-20 md:pt-24 pb-20 md:pb-8 px-4">
      {/* Stories Section */}
      <div className="mb-6">
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {/* زر رفع ستوري */}
          <div className="flex-shrink-0 text-center">
            <label htmlFor="story-upload" className="cursor-pointer">
              <div className="w-16 h-16 bg-[#FFA726] rounded-full flex items-center justify-center mb-2 border-2 border-white dark:border-dark-800 shadow-lg">
                {uploadingStory ? (
                  <svg
                    className="w-8 h-8 animate-spin text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                )}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Your Story
              </p>
              <input
                id="story-upload"
                type="file"
                accept="image/*,video/*"
                style={{ display: "none" }}
                onChange={handleStoryUpload}
                disabled={uploadingStory}
              />
            </label>
          </div>
          {/* عرض الستوري: أيقونة واحدة لكل مستخدم */}
          {storiesLoading ? (
            <div className="flex items-center">جاري التحميل...</div>
          ) : storiesError ? (
            <div className="flex items-center text-red-500">{storiesError}</div>
          ) : groupedStories.length === 0 ? (
            <div className="flex items-center text-gray-400">لا يوجد ستوري</div>
          ) : (
            groupedStories.map((group, idx) => (
              <div
                key={group.user?.user?.id || idx}
                className="flex-shrink-0 text-center"
              >
                <div
                  className="w-16 h-16 rounded-full p-0.5 bg-[#FFA726] mb-2 flex items-center justify-center overflow-hidden border-2 border-white dark:border-dark-800 cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => openUserStoriesModal(group)}
                  title={group.user?.user?.username || "Story"}
                >
                  {/* صورة الستوري الأولى للمستخدم */}
                  {group.stories[0].media_type === "image" ? (
                    <img
                      src={
                        group.stories[0].file.startsWith("http")
                          ? group.stories[0].file
                          : `http://127.0.0.1:8000${group.stories[0].file}`
                      }
                      alt={group.user?.user?.username || "Story"}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : group.stories[0].media_type === "video" ? (
                    <video
                      src={
                        group.stories[0].file.startsWith("http")
                          ? group.stories[0].file
                          : `http://127.0.0.1:8000${group.stories[0].file}`
                      }
                      className="w-full h-full object-cover rounded-full"
                      controls={false}
                      autoPlay
                      muted
                      loop
                    />
                  ) : null}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 truncate w-16">
                  {group.user?.user?.username?.split(" ")[0] || "User"}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal لعرض ستوريز المستخدم المتسلسلة */}
      {activeUserStories && activeUserStories.stories[activeUserStoryIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm animate-fade-in"
          onClick={closeUserStoriesModal}
        >
          <div
            className="relative flex flex-col items-center justify-center w-full h-full max-w-full max-h-full"
            style={{ minWidth: 0, minHeight: 0 }}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* شريط التقدم */}
            <div className="absolute top-0 left-0 w-full flex space-x-1 px-4 pt-4 z-20">
              {activeUserStories.stories.map((_, idx) => (
                <div
                  key={idx}
                  className="flex-1 h-1 rounded bg-white/30 overflow-hidden"
                  style={{ minWidth: 0 }}
                >
                  <div
                    className="h-full bg-[#FFA726] transition-all duration-100"
                    style={{
                      width:
                        idx < activeUserStoryIndex
                          ? "100%"
                          : idx === activeUserStoryIndex
                          ? `${Math.round(storyProgress * 100)}%`
                          : "0%",
                    }}
                  ></div>
                </div>
              ))}
            </div>
            {/* زر إغلاق */}
            <button
              className="absolute top-4 right-4 bg-black bg-opacity-60 rounded-full p-2 text-white hover:bg-opacity-90 focus:outline-none z-30"
              onClick={closeUserStoriesModal}
              aria-label="إغلاق"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            {/* زر السابق/التالي */}
            {activeUserStoryIndex > 0 && (
              <button
                className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 hover:bg-opacity-70 text-white rounded-full p-2 z-30"
                onClick={handlePrevUserStory}
                aria-label="السابق"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}
            {activeUserStoryIndex < activeUserStories.stories.length - 1 && (
              <button
                className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 hover:bg-opacity-70 text-white rounded-full p-2 z-30"
                onClick={handleNextUserStory}
                aria-label="التالي"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}
            {/* عرض الستوري */}
            <div
              className="flex flex-col items-center justify-center w-full h-full"
              style={{
                minHeight: "100vh",
                minWidth: "100vw",
                maxWidth: "100vw",
                maxHeight: "100vh",
              }}
            >
              <div
                className="relative flex items-center justify-center w-full h-full"
                style={{
                  width: "100vw",
                  height: "100vh",
                  maxWidth: 480,
                  maxHeight: 800,
                  margin: "auto",
                  borderRadius: 24,
                  background: "#111",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {activeUserStories.stories[activeUserStoryIndex].media_type ===
                "image" ? (
                  <img
                    src={
                      activeUserStories.stories[
                        activeUserStoryIndex
                      ].file.startsWith("http")
                        ? activeUserStories.stories[activeUserStoryIndex].file
                        : `http://127.0.0.1:8000${activeUserStories.stories[activeUserStoryIndex].file}`
                    }
                    alt={activeUserStories.user?.user?.username || "Story"}
                    className="w-full h-full object-contain bg-black"
                    style={{ maxHeight: "100%", maxWidth: "100%" }}
                  />
                ) : activeUserStories.stories[activeUserStoryIndex]
                    .media_type === "video" ? (
                  <video
                    src={
                      activeUserStories.stories[
                        activeUserStoryIndex
                      ].file.startsWith("http")
                        ? activeUserStories.stories[activeUserStoryIndex].file
                        : `http://127.0.0.1:8000${activeUserStories.stories[activeUserStoryIndex].file}`
                    }
                    className="w-full h-full object-contain bg-black"
                    style={{ maxHeight: "100%", maxWidth: "100%" }}
                    controls
                    autoPlay
                    muted
                  />
                ) : null}
                {/* اسم المستخدم */}
                <div className="absolute left-4 bottom-4 bg-black bg-opacity-60 px-3 py-1 rounded-full text-white text-sm font-semibold">
                  {activeUserStories.user?.user?.username || "User"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.map((post) => {
          return (
            <div
              key={post.id}
              className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-700 overflow-hidden transition-colors duration-200"
            >
              {/* Post Header */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 dark:bg-dark-600 flex items-center justify-center">
                    {post.user?.avatar ? (
                      <img
                        src={
                          post.user.avatar.startsWith("http")
                            ? post.user.avatar
                            : `http://127.0.0.1:8000${post.user.avatar}`
                        }
                        alt={post.user?.username || "User"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <span
                      className="text-gray-600 dark:text-gray-400 font-semibold"
                      style={{ display: post.user?.avatar ? "none" : "flex" }}
                    >
                      {post.user?.username?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {post.user?.username || "Unknown Artist"}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(post.posted_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Post Images */}
              {post.images && post.images.length > 0 && (
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-1 gap-4">
                    {post.images.map((image, index) => (
                      <img
                        key={index}
                        src={
                          image.image.startsWith("http")
                            ? image.image
                            : `http://127.0.0.1:8000${image.image}`
                        }
                        alt={`Art ${index + 1}`}
                        className="w-full h-80 object-cover rounded-xl"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Post Description */}
              <div className="px-4 pb-4">
                <p className="text-gray-800 dark:text-gray-200 mb-3">
                  {post.description}
                </p>

                {/* Categories */}
                {post.categories && post.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.categories.map((category) => (
                      <span
                        key={category.id}
                        className="px-2 py-1 bg-[#FFA726]/10 text-[#FFA726] text-xs rounded-full border border-[#FFA726]/20"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Post Actions */}
              <div className="px-4 py-3 border-t border-gray-100 dark:border-dark-700 bg-gray-50 dark:bg-dark-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-all duration-150 ${
                        isUserLiked(post)
                          ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-300 dark:border-red-700"
                          : "bg-gray-100 text-gray-600 dark:bg-dark-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-500 border border-gray-200 dark:border-dark-600"
                      } hover:scale-105 active:scale-95`}
                    >
                      <span className="text-lg">
                        {isUserLiked(post) ? "❤️" : "🤍"}
                      </span>
                      <span className="font-medium">
                        {post.like_count || 0}
                      </span>
                    </button>

                    <button
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center space-x-1 px-3 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-dark-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-500 transition-colors"
                    >
                      <span>💬</span>
                      <span>{post.comment_count || 0}</span>
                    </button>
                  </div>
                </div>

                {/* Comments Section */}
                {showComments[post.id] && (
                  <div className="mt-4 space-y-3">
                    {/* Comment Input */}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentText[post.id] || ""}
                        onChange={(e) =>
                          setCommentText((prev) => ({
                            ...prev,
                            [post.id]: e.target.value,
                          }))
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFA726] bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
                      />
                      <button
                        onClick={() => handleComment(post.id)}
                        className="px-4 py-2 bg-[#FFA726] text-white rounded-lg hover:bg-orange-500 transition-colors"
                      >
                        Post
                      </button>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-2">
                      {post.comments?.map((comment) => (
                        <div
                          key={comment.id}
                          className="bg-white dark:bg-dark-800 p-3 rounded-lg border border-gray-200 dark:border-dark-600"
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-sm text-gray-900 dark:text-white">
                              {comment.user}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(
                                comment.created_at
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-800 dark:text-gray-200 text-sm">
                            {comment.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasNext && (
        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-3 bg-[#FFA726] text-white rounded-lg hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Feed;
