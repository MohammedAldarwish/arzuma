import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "./ThemeContext";
import { useNavigate, useParams } from "react-router-dom";
import { clearAllData, getCurrentUser } from "../utils/auth";
import Login from "./Login";
import Register from "./Register";
import LoadingSpinner from "./LoadingSpinner";
import {
  authFetch,
  clearTokens,
  followUser,
  unfollowUser,
  getMyProfile,
  isAuthenticated,
  getUserPosts,
} from "../api";

const API_BASE = "http://127.0.0.1:8000/api/chat";

const Profile = () => {
  const { isDark, theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { username } = useParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowedBack, setIsFollowedBack] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followBtnLoading, setFollowBtnLoading] = useState(false);
  const [followBtnError, setFollowBtnError] = useState(null);
  const [messageBtnLoading, setMessageBtnLoading] = useState(false);
  const [messageBtnError, setMessageBtnError] = useState(null);
  const [instructorRequestLoading, setInstructorRequestLoading] =
    useState(false);
  const [instructorRequestError, setInstructorRequestError] = useState(null);
  const [instructorRequestSuccess, setInstructorRequestSuccess] =
    useState(false);

  // Posts state
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

  // Ensure userPosts is always an array
  const safeUserPosts = Array.isArray(userPosts) ? userPosts : [];

  // Fetch profile: if username param exists, fetch that user's profile, else fetch my profile
  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      if (username) {
        // For other user profiles, use regular fetch since no auth needed
        const response = await fetch(
          `http://127.0.0.1:8000/api/accounts/profile/${username}/`
        );
        if (!response.ok) {
          if (response.status === 404) {
            setError(`User \"${username}\" not found`);
          } else {
            setError("Failed to fetch profile");
          }
          setUser(null);
          return;
        }
        const data = await response.json();
        setUser(data);
        setIsLoggedIn(true);
        setIsFollowing(!!data.is_following);
        setIsFollowedBack(!!data.is_followed_back);
        setFollowersCount(data.followers_count || 0);
        setFollowingCount(data.following_count || 0);
      } else {
        // For my profile, check authentication first
        if (!isAuthenticated()) {
          // No tokens found, show login form immediately
          setIsLoggedIn(false);
          setUser(null);
          setShowLogin(true);
          setError(null); // Clear any previous errors
          return;
        }

        // For my profile, use getMyProfile function
        try {
          const data = await getMyProfile();
          setUser(data);
          setIsLoggedIn(true);
          setIsFollowing(!!data.is_following);
          setIsFollowedBack(!!data.is_followed_back);
          setFollowersCount(data.followers_count || 0);
          setFollowingCount(data.following_count || 0);
        } catch (err) {
          if (err.message === "Session expired") {
            // Clear tokens and show login form
            clearTokens();
            setIsLoggedIn(false);
            setUser(null);
            setShowLogin(true);
            setError(null); // Clear error for session expired
            return;
          }
          throw err; // Re-throw other errors
        }
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
      if (err.message === "Session expired") {
        clearTokens();
        setIsLoggedIn(false);
        setUser(null);
        setShowLogin(true);
        setError(null); // Clear error for session expired
      } else {
        setError("Failed to fetch profile");
      }
      setUser(null);
      if (!username) {
        setIsLoggedIn(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username]);

  // Fetch posts when user data is available
  useEffect(() => {
    if (user?.username) {
      fetchUserPosts(1);
    }
  }, [user?.username]);

  const handleLoginSuccess = (data) => {
    setIsLoggedIn(true);
    setUser(data.user || data);
  };

  const handleRegisterSuccess = (data) => {
    setIsLoggedIn(true);
    setUser(data.user || data);
  };

  const handleLogout = () => {
    // Clear all data using utility function
    clearAllData();

    // Reset state
    setIsLoggedIn(false);
    setUser(null);

    // Force page reload to clear any cached data
    window.location.reload();
  };

  // Force fresh login when token is invalid
  const forceFreshLogin = () => {
    console.log("Forcing fresh login due to invalid token...");
    // Clear all data using utility function
    clearAllData();

    // Reset state
    setIsLoggedIn(false);
    setUser(null);
    setShowLogin(true);
  };

  const switchToRegister = () => {
    console.log("switchToRegister called, setting showLogin to false");
    setShowLogin(false);
  };

  const switchToLogin = () => {
    setShowLogin(true);
  };

  // Theme handler
  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  // Handle avatar upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if user is logged in first
    if (!isLoggedIn || !user) {
      alert("Please log in first to upload an avatar.");
      return;
    }

    // Validate file type and size
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validTypes.includes(file.type)) {
      alert("Please select a valid image file (JPEG, PNG, GIF, or WebP).");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert("Image file size must be less than 5MB.");
      return;
    }

    console.log("Uploading avatar:", {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
    });

    setUploading(true);

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      console.log("Sending avatar upload request...");
      const response = await authFetch(
        "http://127.0.0.1:8000/api/accounts/my-profile/",
        {
          method: "PATCH",
          body: formData,
        }
      );

      console.log("Avatar upload response status:", response.status);
      console.log(
        "Avatar upload response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Avatar upload failed:", {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText,
        });
        throw new Error(
          `Failed to upload avatar: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Avatar upload response data:", data);
      console.log("Avatar URL from response:", data.avatar);

      // Update user state with new avatar
      setUser((prev) => {
        console.log("Previous user state:", prev);
        const updatedUser = {
          ...prev,
          avatar: data.avatar,
          bio: data.bio,
          username: data.username,
          email: data.email,
          first_name: data.first_name,
        };
        console.log("Updated user state:", updatedUser);
        return updatedUser;
      });

      // Update localStorage user
      const userData = localStorage.getItem("user");
      if (userData) {
        const updatedUser = {
          ...JSON.parse(userData),
          avatar: data.avatar,
          bio: data.bio,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        console.log("Updated localStorage user:", updatedUser);
      }

      alert("Avatar uploaded successfully!");
    } catch (err) {
      console.error("Avatar upload error:", err);

      if (err.message === "Session expired") {
        clearTokens();
        setIsLoggedIn(false);
        setUser(null);
        setShowLogin(true);
        alert("Your session has expired. Please log in again.");
      } else if (err.message.includes("Backend configuration issue")) {
        alert(
          "Session expired due to backend configuration issue. Please contact the administrator or try logging in again."
        );
        // Optionally force a fresh login
        clearTokens();
        setIsLoggedIn(false);
        setUser(null);
        setShowLogin(true);
      } else {
        alert(`فشل رفع الصورة: ${err.message}`);
      }
    } finally {
      setUploading(false);
    }
  };

  // Helper function to get full avatar URL
  const getAvatarUrl = (avatarUrl) => {
    if (!avatarUrl) return null;
    // إذا كان الرابط كاملًا، أرجعه كما هو
    if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
      return avatarUrl;
    }
    // إذا كان يبدأ بـ /avatar/ أضف عنوان السيرفر
    if (avatarUrl.startsWith("/avatar/")) {
      return `http://localhost:8000${avatarUrl}`;
    }
    // إذا كان اسم ملف فقط، أضف /avatar/
    return `http://localhost:8000/avatar/${avatarUrl}`;
  };

  // Debug: Log user avatar
  console.log("Current user avatar:", user?.avatar);
  console.log("Processed avatar URL:", getAvatarUrl(user?.avatar));

  // Debug: Log when avatar changes
  useEffect(() => {
    if (user?.avatar) {
      console.log("Avatar changed to:", user.avatar);
      console.log("Final image src will be:", getAvatarUrl(user.avatar));
    }
  }, [user?.avatar]);

  // Optimistic follow/unfollow handlers
  const handleFollow = async () => {
    if (!user) return;
    setFollowBtnLoading(true);
    setFollowBtnError(null);
    setIsFollowing(true);
    setFollowersCount((c) => c + 1);
    try {
      const res = await followUser(user.id);
      if (res.detail !== "Followed") {
        setIsFollowing(false);
        setFollowersCount((c) => Math.max(0, c - 1));
        setFollowBtnError("فشل المتابعة. حاول مرة أخرى.");
      }
    } catch (err) {
      setIsFollowing(false);
      setFollowersCount((c) => Math.max(0, c - 1));
      setFollowBtnError("فشل المتابعة. حاول مرة أخرى.");
    } finally {
      setFollowBtnLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!user) return;
    setFollowBtnLoading(true);
    setFollowBtnError(null);
    setIsFollowing(false);
    setFollowersCount((c) => Math.max(0, c - 1));
    try {
      const res = await unfollowUser(user.id);
      if (res.detail !== "Unfollowed") {
        setIsFollowing(true);
        setFollowersCount((c) => c + 1);
        setFollowBtnError("فشل إلغاء المتابعة. حاول مرة أخرى.");
      }
    } catch (err) {
      setIsFollowing(true);
      setFollowersCount((c) => c + 1);
      setFollowBtnError("فشل إلغاء المتابعة. حاول مرة أخرى.");
    } finally {
      setFollowBtnLoading(false);
    }
  };

  // Start or get conversation and navigate to chat
  const handleStartConversation = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE}/conversations/with_user/?username=${user.username}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );

      if (response.ok) {
        const conversation = await response.json();
        navigate(`/chat/${conversation.id}`);
      } else {
        console.error("Failed to start conversation");
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  // Handle instructor access request
  const handleRequestInstructorAccess = async () => {
    if (!isAuthenticated()) {
      alert("يرجى تسجيل الدخول أولاً لطلب صلاحية إنشاء الدورات.");
      return;
    }

    setInstructorRequestLoading(true);
    setInstructorRequestError(null);
    setInstructorRequestSuccess(false);

    try {
      const response = await requestInstructorAccess();
      setInstructorRequestSuccess(true);
      alert("تم إرسال طلبك بنجاح! سيتم إشعارك عند الموافقة عليه.");
    } catch (error) {
      console.error("Instructor request error:", error);
      setInstructorRequestError(
        error.message || "فشل في إرسال الطلب. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setInstructorRequestLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-[#FFA726]/20 dark:bg-[#FFA726]/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {error}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The user you're looking for doesn't exist or the profile is not
            available.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-[#FFA726] hover:bg-orange-400 text-white rounded-xl font-medium transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => navigate("/explore")}
              className="px-6 py-3 bg-gray-200 dark:bg-dark-700 hover:bg-gray-300 dark:hover:bg-dark-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
            >
              Explore Users
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show login/register forms if not logged in
  console.log(
    "Profile render - isLoggedIn:",
    isLoggedIn,
    "showLogin:",
    showLogin
  );
  if (!isLoggedIn) {
    return showLogin ? (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={switchToRegister}
      />
    ) : (
      <Register
        onRegisterSuccess={handleRegisterSuccess}
        onSwitchToLogin={switchToLogin}
      />
    );
  }

  // Fetch user posts
  const fetchUserPosts = async (page = 1) => {
    if (!user?.username) {
      console.log("No username available, skipping fetch");
      return;
    }

    console.log("Fetching posts for user:", user.username, "page:", page);
    setPostsLoading(true);
    setPostsError(null);

    try {
      const data = await getUserPosts(user.username, page);
      console.log("Received data from getUserPosts:", data);

      // Ensure posts is always an array
      const posts = Array.isArray(data.posts) ? data.posts : [];
      console.log("Setting posts:", posts);

      setUserPosts(posts);
      setCurrentPage(data.currentPage || page);
      setHasNextPage(data.hasNext || false);
      setHasPreviousPage(data.hasPrevious || false);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      setPostsError("Failed to load posts");
      setUserPosts([]); // Set empty array on error
    } finally {
      setPostsLoading(false);
    }
  };

  // Load more posts
  const loadMorePosts = () => {
    if (hasNextPage && !postsLoading) {
      fetchUserPosts(currentPage + 1);
    }
  };

  // Load previous posts
  const loadPreviousPosts = () => {
    if (hasPreviousPage && !postsLoading) {
      fetchUserPosts(currentPage - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-300">
      {/* Floating Settings Button */}
      <button
        className="hidden md:flex fixed top-20 right-4 sm:top-24 sm:right-6 md:top-28 md:right-8 lg:top-32 lg:right-10 z-40 w-11 h-11 sm:w-12 sm:h-12 bg-white/95 dark:bg-dark-800/95 backdrop-blur-md shadow-xl border border-gray-200/50 dark:border-dark-600/50 rounded-full items-center justify-center text-gray-600 dark:text-gray-300 hover:text-[#FFA726] dark:hover:text-orange-400 hover:bg-white dark:hover:bg-dark-800 hover:shadow-2xl hover:scale-105 transition-all duration-300"
        onClick={() => navigate("/settings")}
        aria-label="Open settings"
      >
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {/* Main Content Container */}
      <div className="pt-20 sm:pt-24 md:pt-28 pb-20 sm:pb-24 md:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          {username && (
            <div className="mb-6 flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <button
                onClick={() => navigate("/explore")}
                className="hover:text-[#FFA726] dark:hover:text-orange-400 transition-colors"
              >
                Explore
              </button>
              <span>/</span>
              <span className="text-gray-900 dark:text-white font-medium">
                @{username}
              </span>
            </div>
          )}

          {/* Profile Header */}
          <div className="bg-white dark:bg-dark-800 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 dark:border-dark-700 p-4 sm:p-6 md:p-8 lg:p-10 mb-6 sm:mb-8 md:mb-10">
            <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-10">
              {/* Profile Picture */}
              <div className="relative flex-shrink-0">
                {(() => {
                  const avatarUrl = getAvatarUrl(user?.avatar);
                  const finalSrc =
                    avatarUrl ||
                    "https://i0.wp.com/sbcf.fr/wp-content/uploads/2018/03/sbcf-default-avatar.png?ssl=1";
                  console.log("Avatar debugging:", {
                    userAvatar: user?.avatar,
                    processedAvatarUrl: avatarUrl,
                    finalSrc: finalSrc,
                    usingDefault: !avatarUrl,
                  });
                  return (
                    <img
                      src={finalSrc}
                      alt="Profile"
                      className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-44 lg:h-44 rounded-full object-cover border-4 border-white dark:border-dark-700 shadow-xl"
                      onLoad={() =>
                        console.log("Avatar image loaded successfully")
                      }
                      onError={(e) => {
                        console.error(
                          "Avatar image failed to load:",
                          e.target.src
                        );
                        console.error("Error event:", e);
                        // Fallback to a simple SVG avatar if the default fails
                        e.target.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236B7280'%3E%3Cpath fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z' clipRule='evenodd' /%3E%3C/svg%3E";
                      }}
                    />
                  );
                })()}
                {/* Hidden file input for avatar upload */}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleAvatarChange}
                  disabled={uploading}
                />
                <button
                  type="button"
                  className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-8 h-8 sm:w-10 sm:h-10 bg-[#FFA726] rounded-full flex items-center justify-center text-white shadow-lg hover:bg-orange-400 hover:scale-110 transition-all duration-300"
                  onClick={() =>
                    fileInputRef.current && fileInputRef.current.click()
                  }
                  aria-label="Upload new avatar"
                  disabled={uploading}
                >
                  {uploading ? (
                    <svg
                      className="animate-spin w-4 h-4 sm:w-5 sm:h-5"
                      fill="none"
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
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center lg:text-left w-full">
                {/* Name and Username */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
                  {user?.first_name || "User"}
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-[#FFA726] dark:text-orange-400 mb-4 sm:mb-5 md:mb-6">
                  @{user?.username || "@user"}
                </p>

                {/* Bio */}
                <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 mb-6 sm:mb-7 md:mb-8 max-w-3xl mx-auto lg:mx-0 leading-relaxed">
                  {user?.bio}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-10 max-w-md mx-auto lg:mx-0 mb-6 sm:mb-7 md:mb-8">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                      127
                    </div>
                    <div className="text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium mt-1">
                      Posts
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                      {followersCount}
                    </div>
                    <div className="text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium mt-1">
                      Followers
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                      {followingCount}
                    </div>
                    <div className="text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium mt-1">
                      Following
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                  {!username ? (
                    // My Profile (My Profile) - show edit, instructor request, and logout buttons
                    <>
                      <button className="bg-[#FFA726] text-white px-6 sm:px-7 md:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-medium hover:bg-orange-400 hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2">
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        <span className="text-sm sm:text-base">
                          Edit Profile
                        </span>
                      </button>

                      {/* Instructor Request Button */}
                      <button
                        onClick={handleRequestInstructorAccess}
                        disabled={
                          instructorRequestLoading || instructorRequestSuccess
                        }
                        className={`px-6 sm:px-7 md:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                          instructorRequestSuccess
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-blue-500 text-white hover:bg-blue-600"
                        }`}
                      >
                        {instructorRequestLoading ? (
                          <svg
                            className="animate-spin w-4 h-4 sm:w-5 sm:h-5"
                            fill="none"
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
                        ) : instructorRequestSuccess ? (
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                          </svg>
                        )}
                        <span className="text-sm sm:text-base">
                          {instructorRequestSuccess
                            ? "تم إرسال الطلب"
                            : "طلب صلاحية المدرس"}
                        </span>
                      </button>

                      <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-6 sm:px-7 md:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-medium hover:bg-red-600 hover:shadow-lg hover:scale-105 transition-all duration-300"
                      >
                        <span className="text-sm sm:text-base">Logout</span>
                      </button>

                      {/* Error message for instructor request */}
                      {instructorRequestError && (
                        <div className="text-red-500 text-xs mt-2 text-center lg:text-left">
                          {instructorRequestError}
                        </div>
                      )}
                    </>
                  ) : (
                    // Other User's Profile (Public Profile) - show follow/unfollow and message button
                    user && (
                      <>
                        <button
                          onClick={isFollowing ? handleUnfollow : handleFollow}
                          className={`bg-[#FFA726] text-white px-6 sm:px-7 md:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-medium hover:bg-orange-400 hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed`}
                          disabled={followBtnLoading}
                        >
                          {followBtnLoading ? (
                            <svg
                              className="animate-spin w-4 h-4 sm:w-5 sm:h-5"
                              fill="none"
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
                              className="w-4 h-4 sm:w-5 sm:h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                              />
                            </svg>
                          )}
                          <span className="text-sm sm:text-base">
                            {isFollowing ? "إلغاء المتابعة" : "متابعة"}
                          </span>
                        </button>
                        <button
                          onClick={handleStartConversation}
                          className="bg-purple-600 text-white px-6 sm:px-7 md:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-medium hover:bg-purple-700 hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
                          disabled={messageBtnLoading}
                        >
                          {messageBtnLoading ? (
                            <svg
                              className="animate-spin w-4 h-4 sm:w-5 sm:h-5"
                              fill="none"
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
                              className="w-4 h-4 sm:w-5 sm:h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8a9 9 0 1118 0z"
                              />
                            </svg>
                          )}
                          <span className="text-sm sm:text-base">مراسلة</span>
                        </button>
                        {messageBtnError && (
                          <div className="text-red-500 text-xs mt-2">
                            {messageBtnError}
                          </div>
                        )}
                        {followBtnError && (
                          <div className="text-red-500 text-xs mt-2">
                            {followBtnError}
                          </div>
                        )}
                      </>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Posts Section */}
          <div className="bg-white dark:bg-dark-800 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 dark:border-dark-700 p-4 sm:p-6 md:p-8 lg:p-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 md:mb-10">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">
                {username ? `${user?.username}'s Posts` : "My Posts"}
              </h2>
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
                  />
                </svg>
                <span>Latest first</span>
              </div>
            </div>

            {/* Loading State */}
            {postsLoading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFA726]"></div>
              </div>
            )}

            {/* Error State */}
            {postsError && (
              <div className="text-center py-12">
                <div className="text-red-500 text-lg mb-4">{postsError}</div>
                <button
                  onClick={() => fetchUserPosts(1)}
                  className="bg-[#FFA726] text-white px-6 py-2 rounded-lg hover:bg-orange-400 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Posts Grid - Enhanced Responsive Design */}
            {!postsLoading && !postsError && (
              <>
                {/* Grid: 1 column on mobile, 2 on tablets, 3 on desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                  {safeUserPosts.map((post) => (
                    <div
                      key={post.id}
                      className="group relative bg-gray-50 dark:bg-dark-700 rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer transform hover:scale-105"
                      onClick={() => navigate(`/post/${post.id}`)}
                    >
                      <div className="aspect-square overflow-hidden">
                        {post.images && post.images.length > 0 ? (
                          <img
                            src={
                              post.images[0].image.startsWith("http")
                                ? post.images[0].image
                                : `http://127.0.0.1:8000${post.images[0].image}`
                            }
                            alt={post.description || "Art post"}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                            loading="lazy"
                            onError={(e) => {
                              e.target.src =
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236B7280'%3E%3Cpath fillRule='evenodd' d='M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z' clipRule='evenodd' /%3E%3C/svg%3E";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 dark:bg-dark-600 flex items-center justify-center">
                            <svg
                              className="w-12 h-12 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Enhanced Post Overlay with better mobile support */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          <h3 className="font-semibold text-xs sm:text-sm md:text-base lg:text-lg mb-1 sm:mb-2 md:mb-3 line-clamp-2">
                            {post.description?.substring(0, 50) || "Art Post"}
                            {post.description?.length > 50 && "..."}
                          </h3>
                          <div className="flex items-center justify-between text-xs sm:text-sm">
                            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
                              <div className="flex items-center space-x-1">
                                <span className="text-red-400 text-xs sm:text-sm">
                                  ❤️
                                </span>
                                <span className="font-medium text-xs sm:text-sm">
                                  {post.like_count || 0}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="text-blue-400 text-xs sm:text-sm">
                                  💬
                                </span>
                                <span className="font-medium text-xs sm:text-sm">
                                  {post.comment_count || 0}
                                </span>
                              </div>
                            </div>
                            <div className="text-xs opacity-75 hidden sm:block">
                              {new Date(post.posted_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Corner badge for popular posts */}
                      {(post.like_count || 0) > 50 && (
                        <div className="absolute top-1 sm:top-2 md:top-3 left-1 sm:left-2 md:left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-1 sm:px-2 py-0.5 sm:py-1 rounded-full opacity-90">
                          ⭐ Popular
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Empty State */}
                {safeUserPosts.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                      {username
                        ? `${user?.username} hasn't posted anything yet`
                        : "You haven't posted anything yet"}
                    </div>
                    {!username && (
                      <button
                        onClick={() => navigate("/create-post")}
                        className="bg-[#FFA726] text-white px-6 py-2 rounded-lg hover:bg-orange-400 transition-colors"
                      >
                        Create Your First Post
                      </button>
                    )}
                  </div>
                )}

                {/* Enhanced Pagination with better mobile support */}
                {(hasNextPage || hasPreviousPage) && (
                  <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-8 sm:mt-10 md:mt-12">
                    <button
                      onClick={loadPreviousPosts}
                      disabled={!hasPreviousPage || postsLoading}
                      className="bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 text-sm"
                    >
                      <svg
                        className="w-4 h-4"
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
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">Prev</span>
                    </button>

                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                      Page {currentPage} of {totalPages || 1}
                    </span>

                    <button
                      onClick={loadMorePosts}
                      disabled={!hasNextPage || postsLoading}
                      className="bg-[#FFA726] text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 text-sm"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <span className="sm:hidden">Next</span>
                      <svg
                        className="w-4 h-4"
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
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
