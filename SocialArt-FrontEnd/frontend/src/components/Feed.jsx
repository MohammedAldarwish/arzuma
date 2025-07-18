import React, { useState, useEffect, useRef } from "react";
import PostCard from "./PostCard";
import { SkeletonFeed } from "./Skeleton";
import { useAppState } from "./AppStateContext";
import StoryViewer from "./StoryViewer";
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
      userObj = { id: userId, username: "Unknown" };
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
  console.log("Feed component rendered");

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

  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);

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
      const userData = JSON.parse(user);
      return userData.username;
    } catch (error) {
      console.error("Error getting current username:", error);
      return null;
    }
  };

  const isUserLiked = (post) => {
    const currentUsername = getCurrentUsername();
    return post.likes?.some((like) => like.user === currentUsername) || false;
  };

  const handleLike = async (postId) => {
    if (likeDebounce[postId]) return;

    setLikeDebounce((prev) => ({ ...prev, [postId]: true }));
    setLikeLoading((prev) => ({ ...prev, [postId]: true }));

    try {
      const currentUsername = getCurrentUsername();
      const isLiked = isUserLiked(posts.find((post) => post.id === postId));

      if (isLiked) {
        // Unlike
        const likeToRemove = posts
          .find((post) => post.id === postId)
          ?.likes?.find((like) => like.user === currentUsername);

        if (likeToRemove) {
          await unlikePost(likeToRemove.id);
          setPosts((prevPosts) =>
            prevPosts.map((post) => {
              if (post.id === postId) {
                return {
                  ...post,
                  like_count: Math.max(0, (post.like_count || 0) - 1),
                  likes:
                    post.likes?.filter((like) => like.id !== likeToRemove.id) ||
                    [],
                };
              }
              return post;
            })
          );
        }
      } else {
        // Like
        await likePost(postId);
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                like_count: (post.like_count || 0) + 1,
                likes: [
                  ...(post.likes || []),
                  {
                    id: Date.now(), // Temporary ID
                    user: currentUsername,
                    created_at: new Date().toISOString(),
                  },
                ],
              };
            }
            return post;
          })
        );
      }
    } catch (error) {
      console.error("Error handling like:", error);
    } finally {
      setLikeLoading((prev) => ({ ...prev, [postId]: false }));
      setTimeout(() => {
        setLikeDebounce((prev) => ({ ...prev, [postId]: false }));
      }, 1000);
    }
  };

  const handleComment = async (postId) => {
    const comment = commentText[postId]?.trim();
    if (!comment) return;

    try {
      await createComment(postId, comment);
      setCommentText((prev) => ({ ...prev, [postId]: "" }));

      // Refresh comments for this post
      const comments = await getComments(postId);
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              comment_count: (post.comment_count || 0) + 1,
              comments: comments,
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  };

  const toggleComments = async (postId) => {
    if (showComments[postId]) {
      setShowComments((prev) => ({ ...prev, [postId]: false }));
    } else {
      try {
        const comments = await getComments(postId);
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post.id === postId) {
              return { ...post, comments: comments };
            }
            return post;
          })
        );
        setShowComments((prev) => ({ ...prev, [postId]: true }));
      } catch (error) {
        console.error("Error loading comments:", error);
      }
    }
  };

  const loadMore = () => {
    if (!loading && hasNext) {
      setPage((prev) => prev + 1);
    }
  };

  const handleStoryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingStory(true);
      await createStory(file);
      // Refresh stories
      const data = await getStories();
      setStories(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      alert("فشل رفع الستوري: " + (err.message || err));
    } finally {
      setUploadingStory(false);
    }
  };

  const openStoryViewer = (userIndex) => {
    setSelectedUserIndex(userIndex);
    setSelectedStoryIndex(0);
    setShowStoryViewer(true);
  };

  const closeStoryViewer = () => {
    setShowStoryViewer(false);
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
          ) : (
            groupStoriesByUser(stories).map((userStories, userIndex) => (
              <div key={userIndex} className="flex-shrink-0 text-center">
                <div
                  className="w-16 h-16 rounded-full p-0.5 bg-[#FFA726] mb-2 flex items-center justify-center overflow-hidden border-2 border-white dark:border-dark-800 cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => openStoryViewer(userIndex)}
                  title={userStories.user?.username || "Story"}
                >
                  {/* صورة البروفايل للمستخدم */}
                  {userStories.user?.avatar ? (
                    <img
                      src={
                        userStories.user.avatar.startsWith("http")
                          ? userStories.user.avatar
                          : `http://127.0.0.1:8000${userStories.user.avatar}`
                      }
                      alt={userStories.user?.username || "User"}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white font-semibold text-lg">
                      {(userStories.user?.username || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 truncate w-16">
                  {userStories.user?.username?.split(" ")[0] || "Unknown"}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Story Viewer */}
      {showStoryViewer && (
        <StoryViewer
          stories={groupStoriesByUser(stories)}
          initialUserIndex={selectedUserIndex}
          initialStoryIndex={selectedStoryIndex}
          onClose={closeStoryViewer}
        />
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
                        alt={post.user?.username || "Unknown"}
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
