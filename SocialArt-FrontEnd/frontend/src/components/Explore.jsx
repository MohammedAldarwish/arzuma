import React, { useState, useEffect, useRef } from "react";
import { useDebounce } from "../hooks/usePerformance";
import { SkeletonGrid, SkeletonList } from "./Skeleton";
import { useAppState } from "./AppStateContext";
import {
  searchUsers,
  followUser,
  unfollowUser,
  getArtPosts,
  likePost,
  unlikePost,
  createComment,
  getComments,
} from "../api";
import { getAccessToken } from "../api";
import { Link } from "react-router-dom";

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [focusedSuggestion, setFocusedSuggestion] = useState(-1);
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(true);
  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});
  const { user, token } = useAppState();

  const debouncedSearch = useDebounce(searchQuery, 500);
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Mock data for trending posts
  const mockTrendingPosts = [
    {
      id: 1,
      artistName: "Emma Chen",
      artistAvatar:
        "https://images.pexels.com/photos/32718227/pexels-photo-32718227.jpeg",
      username: "@emma_art",
      image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119",
      title: "Blooming Elegance",
      likes: 324,
      category: "Classical",
      featured: true,
    },
    {
      id: 2,
      artistName: "Marcus Rodriguez",
      artistAvatar:
        "https://images.unsplash.com/photo-1625682103688-2ab73a4fb11a",
      username: "@marcus_creates",
      image:
        "https://images.pexels.com/photos/1585325/pexels-photo-1585325.jpeg",
      title: "Vibrant Energy",
      likes: 456,
      category: "Abstract",
      featured: true,
    },
    {
      id: 3,
      artistName: "Sophia Kim",
      artistAvatar:
        "https://images.pexels.com/photos/32721688/pexels-photo-32721688.jpeg",
      username: "@sophia_paints",
      image: "https://images.unsplash.com/photo-1573221566340-81bdde00e00b",
      title: "Watercolor Dreams",
      likes: 289,
      category: "Watercolor",
      featured: true,
    },
    {
      id: 4,
      artistName: "David Thompson",
      artistAvatar:
        "https://images.unsplash.com/photo-1695927521717-a0ad39d93505",
      username: "@david_classical",
      image:
        "https://images.unsplash.com/flagged/photo-1572392640988-ba48d1a74457",
      title: "Divine Ceiling Study",
      likes: 378,
      category: "Renaissance",
      featured: true,
    },
    {
      id: 5,
      artistName: "Luna Martinez",
      artistAvatar:
        "https://images.unsplash.com/photo-1539135950877-26943cd58152",
      username: "@luna_abstract",
      image:
        "https://images.pexels.com/photos/1573434/pexels-photo-1573434.jpeg",
      title: "Monochrome Emotions",
      likes: 412,
      category: "Contemporary",
      featured: true,
    },
    {
      id: 6,
      artistName: "James Wilson",
      artistAvatar:
        "https://images.unsplash.com/photo-1745165549821-7382d2e740d4",
      username: "@james_maritime",
      image: "https://images.unsplash.com/photo-1582561424760-0321d75e81fa",
      title: "Maritime Memories",
      likes: 267,
      category: "Historical",
      featured: true,
    },
    {
      id: 7,
      artistName: "Alex Rivera",
      artistAvatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      username: "@alex_digital",
      image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262",
      title: "Digital Dreams",
      likes: 523,
      category: "Digital",
      featured: true,
    },
    {
      id: 8,
      artistName: "Maya Patel",
      artistAvatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786",
      username: "@maya_ink",
      image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0",
      title: "Ink Flow",
      likes: 198,
      category: "Illustration",
      featured: true,
    },
    {
      id: 9,
      artistName: "Carlos Silva",
      artistAvatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
      username: "@carlos_3d",
      image: "https://images.unsplash.com/photo-1561736778-92e52a7769ef",
      title: "3D Sculpture",
      likes: 345,
      category: "Sculpture",
      featured: true,
    },
  ];

  // Mock search results
  const mockSearchResults = [
    {
      id: 101,
      artistName: "Emma Chen",
      artistAvatar:
        "https://images.pexels.com/photos/32718227/pexels-photo-32718227.jpeg",
      username: "@emma_art",
      image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119",
      title: "Blooming Elegance",
      likes: 324,
      category: "Classical",
      type: "post",
    },
    {
      id: 102,
      artistName: "Emma Chen",
      artistAvatar:
        "https://images.pexells.com/photos/32718227/pexels-photo-32718227.jpeg",
      username: "@emma_art",
      image: "https://images.unsplash.com/photo-1573221566340-81bdde00e00b",
      title: "Watercolor Dreams",
      likes: 289,
      category: "Watercolor",
      type: "post",
    },
    {
      id: 103,
      artistName: "Emma Chen",
      artistAvatar:
        "https://images.pexels.com/photos/32718227/pexels-photo-32718227.jpeg",
      username: "@emma_art",
      followers: 1247,
      posts: 23,
      type: "user",
    },
  ];

  // Mock search suggestions
  const mockSuggestions = [
    {
      type: "artist",
      name: "Emma Chen",
      username: "@emma_art",
      avatar:
        "https://images.pexels.com/photos/32718227/pexels-photo-32718227.jpeg",
    },
    { type: "category", name: "Classical Art", icon: "🏛️" },
    { type: "category", name: "Abstract Paintings", icon: "✨" },
    {
      type: "artist",
      name: "Marcus Rodriguez",
      username: "@marcus_creates",
      avatar: "https://images.unsplash.com/photo-1625682103688-2ab73a4fb11a",
    },
    { type: "title", name: "Blooming Elegance", category: "Classical" },
    { type: "title", name: "Vibrant Energy", category: "Abstract" },
  ];

  const categories = [
    { id: "all", name: "All", icon: "🎨" },
    { id: "classical", name: "Classical", icon: "🏛️" },
    { id: "abstract", name: "Abstract", icon: "✨" },
    { id: "watercolor", name: "Watercolor", icon: "🌊" },
    { id: "digital", name: "Digital", icon: "💻" },
    { id: "contemporary", name: "Contemporary", icon: "🎭" },
    { id: "illustration", name: "Illustration", icon: "✏️" },
    { id: "sculpture", name: "Sculpture", icon: "🗿" },
  ];

  // Load trending posts and art posts on mount
  useEffect(() => {
    const loadTrendingPosts = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));
        setTrendingPosts(mockTrendingPosts);
      } catch (error) {
        console.error("Error loading trending posts:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTrendingPosts();
  }, []);

  // Fetch art posts
  const fetchPosts = async () => {
    try {
      setPostsLoading(true);

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

      // Fallback to mock data
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
      ];

      if (page === 1) {
        setPosts(mockPosts);
      } else {
        setPosts((prev) => [...prev, ...mockPosts]);
      }
      setHasNext(false);
    } catch (err) {
      console.error("Error loading posts:", err);
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (page > 1) {
      fetchPosts();
    }
  }, [page]);

  // Handle search suggestions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Filter suggestions based on search query
    const filtered = mockSuggestions.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setSearchSuggestions(filtered.slice(0, 6));
    setShowSuggestions(filtered.length > 0);
    setFocusedSuggestion(-1);
  }, [searchQuery]);

  // Handle search
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearch.trim()) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      setLoading(true);
      setShowSearchResults(true);
      setShowSuggestions(false);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 600));

        // Filter mock results based on search query
        const filtered = mockSearchResults.filter(
          (item) =>
            item &&
            ((item.artistName &&
              item.artistName
                .toLowerCase()
                .includes(debouncedSearch.toLowerCase())) ||
              (item.username &&
                item.username
                  .toLowerCase()
                  .includes(debouncedSearch.toLowerCase())) ||
              (item.title &&
                item.title
                  .toLowerCase()
                  .includes(debouncedSearch.toLowerCase())) ||
              (item.category &&
                item.category
                  .toLowerCase()
                  .includes(debouncedSearch.toLowerCase())))
        );

        setSearchResults(filtered);
      } catch (error) {
        console.error("Error performing search:", error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedSearch]);

  // Handle user search with live suggestions
  useEffect(() => {
    const performUserSearch = async () => {
      if (!debouncedSearch.trim() || debouncedSearch.length < 2) {
        setUserSearchResults([]);
        return;
      }

      setUserSearchLoading(true);
      try {
        const users = await searchUsers(debouncedSearch, 10);
        setUserSearchResults(users);
      } catch (error) {
        console.error("Error searching users:", error);
        setUserSearchResults([]);
      } finally {
        setUserSearchLoading(false);
      }
    };

    performUserSearch();
  }, [debouncedSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (focusedSuggestion >= 0 && searchSuggestions[focusedSuggestion]) {
      const suggestion = searchSuggestions[focusedSuggestion];
      setSearchQuery(suggestion.name);
    }
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    const totalSuggestions =
      userSearchResults.length + searchSuggestions.length;
    if (!showSuggestions && userSearchResults.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedSuggestion((prev) =>
          prev < totalSuggestions - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedSuggestion((prev) =>
          prev > 0 ? prev - 1 : totalSuggestions - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (focusedSuggestion >= 0) {
          if (focusedSuggestion < userSearchResults.length) {
            // User result
            const user = userSearchResults[focusedSuggestion];
            handleSuggestionClick({
              type: "user",
              name: user.username,
              username: user.username,
              avatar: user.avatar,
            });
          } else {
            // Other suggestion
            const suggestionIndex =
              focusedSuggestion - userSearchResults.length;
            if (searchSuggestions[suggestionIndex]) {
              handleSuggestionClick(searchSuggestions[suggestionIndex]);
            }
          }
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        searchInputRef.current?.blur();
        break;
    }
  };

  const handleClickOutside = (e) => {
    if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
      setShowSuggestions(false);
      setFocusedSuggestion(-1);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredPosts =
    activeFilter === "all"
      ? showSearchResults
        ? searchResults
        : trendingPosts
      : (showSearchResults ? searchResults : trendingPosts).filter(
          (post) => post.category.toLowerCase() === activeFilter
        );

  const handleFollow = async (post) => {
    const res = await followUser(post.user, token);
    if (res.detail === "Followed") {
      // Update UI to reflect the new follow state
      // For example, you might want to refresh the post list or the user's profile
      console.log("User followed successfully");
    }
  };

  const handleUnfollow = async (post) => {
    const res = await unfollowUser(post.user, token);
    if (res.detail === "Unfollowed") {
      console.log("User unfollowed successfully");
    }
  };

  const fetchProfile = async (username) => {
    const res = await fetch(`/api/profile/${username}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setProfileData(data);
  };

  // Art post interaction functions
  const handleLike = async (postId) => {
    try {
      const token = getAccessToken();
      if (!token) {
        alert("Please login to like posts");
        return;
      }

      const post = posts.find((p) => p.id === postId);
      let currentUser = localStorage.getItem("user");
      try {
        currentUser = JSON.parse(currentUser);
      } catch {}

      const username =
        typeof currentUser === "string" ? currentUser : currentUser?.username;

      console.log("All likes:", post.likes);
      console.log("Current username:", username);

      const userLike = post.likes?.find(
        (like) =>
          like.user &&
          username &&
          like.user.trim().toLowerCase() === username.trim().toLowerCase()
      );

      if (userLike) {
        if (userLike) {
          await unlikePost(userLike.id);
        }
      } else {
        await likePost(postId);
      }

      // Refresh the post data
      fetchPosts();
    } catch (err) {
      console.error("Like error:", err);
      alert("Failed to like/unlike post");
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
    if (hasNext && !postsLoading) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 md:hidden">
            Explore
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover amazing artwork and talented artists from around the world
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto relative"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search artists, usernames, or artwork..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() =>
                  (searchQuery.trim() || userSearchResults.length > 0) &&
                  setShowSuggestions(true)
                }
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setShowSearchResults(false);
                    setShowSuggestions(false);
                    setUserSearchResults([]);
                    setFocusedSuggestion(-1);
                  }}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg
                    className="h-5 w-5"
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
              )}
            </div>

            {/* Search Suggestions Dropdown */}
            {(showSuggestions && searchSuggestions.length > 0) ||
            (searchQuery.length >= 2 && userSearchResults.length > 0) ? (
              <div
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-2xl shadow-xl z-50 max-h-80 overflow-y-auto"
              >
                {/* User Search Results */}
                {searchQuery.length >= 2 && userSearchResults.length > 0 && (
                  <>
                    <div className="px-4 py-2 bg-gray-50 dark:bg-dark-700 border-b border-gray-200 dark:border-dark-600">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                        Users
                      </p>
                    </div>
                    {userSearchLoading ? (
                      <div className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 dark:bg-dark-600 rounded-full animate-pulse"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 dark:bg-dark-600 rounded animate-pulse mb-1"></div>
                            <div className="h-3 bg-gray-200 dark:bg-dark-600 rounded animate-pulse w-2/3"></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      userSearchResults.map((user, index) => (
                        <div
                          key={`user-${user.id}`}
                          className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors ${
                            focusedSuggestion === index
                              ? "bg-purple-50 dark:bg-purple-900/30"
                              : ""
                          }`}
                          onClick={() => setShowSuggestions(false)}
                        >
                          <img
                            src={
                              user.avatar ||
                              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
                            }
                            alt={user.username}
                            className="w-8 h-8 rounded-full object-cover"
                            onError={(e) => {
                              e.target.src =
                                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face";
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              @{user.username}
                            </p>
                            {user.first_name && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {user.first_name} {user.last_name || ""}
                              </p>
                            )}
                            {user.bio && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {user.bio}
                              </p>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            User
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}

                {/* Original Search Suggestions */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <>
                    {userSearchResults.length > 0 && (
                      <div className="px-4 py-2 bg-gray-50 dark:bg-dark-700 border-b border-gray-200 dark:border-dark-600">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                          Other Results
                        </p>
                      </div>
                    )}
                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={`${suggestion.type}-${index}`}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors ${
                          focusedSuggestion === index + userSearchResults.length
                            ? "bg-purple-50 dark:bg-purple-900/30"
                            : ""
                        } ${
                          index === searchSuggestions.length - 1
                            ? "rounded-b-2xl"
                            : ""
                        }`}
                      >
                        {suggestion.type === "artist" && (
                          <img
                            src={suggestion.avatar}
                            alt={suggestion.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                        {suggestion.type === "category" && (
                          <span className="text-xl">{suggestion.icon}</span>
                        )}
                        {suggestion.type === "title" && (
                          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-purple-600 dark:text-purple-400"
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
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {suggestion.name}
                          </p>
                          {suggestion.username && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {suggestion.username}
                            </p>
                          )}
                          {suggestion.category && (
                            <p className="text-xs text-purple-600 dark:text-purple-400 truncate">
                              {suggestion.category}
                            </p>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                          {suggestion.type}
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </div>
            ) : null}
          </form>
        </div>

        {/* Search Results Header */}
        {showSearchResults && (
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Search Results for "{searchQuery}"
              </h2>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowSearchResults(false);
                  setUserSearchResults([]);
                  setFocusedSuggestion(-1);
                }}
                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
              >
                Clear Search
              </button>
            </div>
            {searchResults.length > 0 && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Found {searchResults.length} result
                {searchResults.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        )}
        {/* Content */}
        {loading ? (
          <div className="space-y-6">
            <SkeletonGrid cols={2} rows={4} />
          </div>
        ) : showSearchResults && searchResults.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-purple-600 dark:text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No results found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try searching with different keywords or browse trending posts
              below
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setShowSearchResults(false);
                setUserSearchResults([]);
                setFocusedSuggestion(-1);
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Browse Trending
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-2 md:gap-4">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="group relative bg-white dark:bg-dark-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                {/* Post Image */}
                <div className="aspect-square overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-center">
                      <div className="flex items-center justify-center space-x-2 sm:space-x-4 mb-1 sm:mb-2">
                        <div className="flex items-center space-x-1">
                          <svg
                            className="w-3 h-3 sm:w-5 sm:h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                          <span className="font-medium text-xs sm:text-sm">
                            {post.likes}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm font-medium hidden sm:block">
                        {post.title}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Post Info */}
                <div className="p-2 sm:p-3">
                  <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
                    <img
                      src={post.artistAvatar}
                      alt={post.artistName}
                      className="w-4 h-4 sm:w-6 sm:h-6 rounded-full object-cover"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                        {post.artistName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate hidden sm:block">
                        {post.username}
                      </p>
                    </div>
                  </div>
                  {/* Category Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-1 sm:px-2 py-0.5 sm:py-1 rounded-full ">
                      {post.category}
                    </span>
                    {post.featured && (
                      <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 px-1 sm:px-2 py-0.5 sm:py-1 rounded-full hidden sm:inline">
                        ⭐ Featured
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
