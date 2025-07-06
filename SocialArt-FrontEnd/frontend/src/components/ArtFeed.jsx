import React, { useState, useEffect } from "react";
import {
  getArtPosts,
  likePost,
  unlikePost,
  createComment,
  getComments,
  hasUserLikedPost,
} from "../api";
import { getAccessToken } from "../api";

const ArtFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(true);
  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await getArtPosts(page);
      if (page === 1) {
        setPosts(data.results || data);
      } else {
        setPosts((prev) => [...prev, ...(data.results || data)]);
      }
      setHasNext(!!data.next);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const token = getAccessToken();
      if (!token) {
        alert("Please login to like posts");
        return;
      }

      const post = posts.find((p) => p.id === postId);
      const userLiked = post.likes.some((like) => like.user === post.user);

      if (userLiked) {
        // Find the like ID to unlike
        const like = post.likes.find((like) => like.user === post.user);
        if (like) {
          await unlikePost(like.id);
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
    if (hasNext && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Art Feed
      </h1>

      <div className="space-y-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            {/* Post Header */}
            <div className="p-4 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-semibold">
                    {post.user?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{post.user}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(post.posted_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Post Images */}
            {post.images && post.images.length > 0 && (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {post.images.map((image, index) => (
                    <img
                      key={index}
                      src={`http://127.0.0.1:8000${image.image}`}
                      alt={`Art ${index + 1}`}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Post Description */}
            <div className="px-4 pb-4">
              <p className="text-gray-800 mb-3">{post.description}</p>

              {/* Categories */}
              {post.categories && post.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.categories.map((category) => (
                    <span
                      key={category.id}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Post Actions */}
            <div className="px-4 py-3 border-t bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-colors ${
                      post.likes?.some((like) => like.user === post.user)
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <span>❤️</span>
                    <span>{post.like_count || 0}</span>
                  </button>

                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center space-x-1 px-3 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
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
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleComment(post.id)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Post
                    </button>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-2">
                    {post.comments?.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-white p-3 rounded-lg border"
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-sm">
                            {comment.user}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-800 text-sm">
                          {comment.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasNext && (
        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      {loading && posts.length === 0 && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading posts...</p>
        </div>
      )}
    </div>
  );
};

export default ArtFeed;
