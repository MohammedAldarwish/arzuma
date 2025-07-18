import React, { useState } from "react";

const PostCard = ({
  post,
  onLike,
  onComment,
  onToggleComments,
  commentText,
  setCommentText,
  showComments,
  likeLoading,
  isUserLiked,
  userPreferences,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleLike = () => {
    if (onLike && !likeLoading) {
      onLike(post.id);
    }
  };

  const handleComment = () => {
    if (onComment && commentText?.trim()) {
      onComment(post.id);
    }
  };

  const handleToggleComments = () => {
    if (onToggleComments) {
      onToggleComments(post.id);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
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
              className="text-gray-600 font-semibold text-sm"
              style={{ display: post.user?.avatar ? "none" : "flex" }}
            >
              {post.user?.username?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {post.user?.username || "Unknown Artist"}
            </h3>
            <p className="text-sm text-gray-500">
              {new Date(post.posted_at).toLocaleDateString("ar-SA")}
            </p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {/* Post Images */}
      {post.images && post.images.length > 0 && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-1 gap-4">
            {post.images.map((image, index) => (
              <div key={index} className="relative">
                {!imageLoaded && (
                  <div className="w-full h-80 bg-gray-200 animate-pulse rounded-xl" />
                )}
                <img
                  src={
                    image.image.startsWith("http")
                      ? image.image
                      : `http://127.0.0.1:8000${image.image}`
                  }
                  alt={`Art ${index + 1}`}
                  className={`w-full h-80 object-cover rounded-xl transition-opacity duration-300 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  onLoad={handleImageLoad}
                  loading="lazy"
                />
              </div>
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
                className="px-3 py-1 bg-orange-100 text-orange-600 text-xs rounded-full border border-orange-200"
              >
                {category.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              disabled={likeLoading}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-200 hover:scale-105 ${
                isUserLiked
                  ? "bg-red-100 text-red-600 border border-red-300"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
              }`}
            >
              <span className="text-lg">{isUserLiked ? "❤️" : "🤍"}</span>
              <span className="font-medium">{post.like_count || 0}</span>
            </button>

            <button
              onClick={handleToggleComments}
              className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200 transition-all duration-200 hover:scale-105"
            >
              <span>💬</span>
              <span>{post.comment_count || 0}</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 space-y-3">
            {/* Comment Input */}
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="اكتب تعليقاً..."
                value={commentText || ""}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900"
              />
              <button
                onClick={handleComment}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                نشر
              </button>
            </div>

            {/* Comments List */}
            <div className="space-y-2">
              {post.comments?.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-white p-3 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-sm text-gray-900">
                      {comment.user}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString("ar-SA")}
                    </span>
                  </div>
                  <p className="text-gray-800 text-sm">{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
