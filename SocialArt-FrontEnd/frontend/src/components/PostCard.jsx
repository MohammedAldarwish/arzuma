import React, { useState } from "react";
import { useLazyImage } from "../hooks/usePerformance";
import { Skeleton } from "./Skeleton";

const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);

  // Lazy load the main post image
  const [imageSrc, setImageRef] = useLazyImage(post.image);

  const handleLike = () => {
    setLiked(!liked);
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      console.log("Adding comment:", comment);
      setComment("");
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-700 overflow-hidden transition-colors duration-200">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <img
            src={post.artistAvatar}
            alt={post.artistName}
            className="w-10 h-10 rounded-full object-cover"
            loading="lazy"
          />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {post.artistName}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <svg
                className="w-3 h-3 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              {post.location}
            </p>
          </div>
        </div>
        <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {/* Post Image with Lazy Loading */}
      <div className="relative">
        {!imageLoaded && (
          <div className="w-full h-80 bg-gray-200 dark:bg-dark-600 animate-pulse" />
        )}
        <img
          ref={setImageRef}
          src={imageSrc}
          alt={post.title}
          className={`w-full h-80 object-cover transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={handleImageLoad}
          loading="lazy"
        />
        <div className="absolute top-4 right-4">
          <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            {post.category}
          </span>
        </div>
      </div>

      {/* Post Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 transition-colors ${
                liked
                  ? "text-red-500"
                  : "text-gray-600 dark:text-gray-400 hover:text-red-500"
              }`}
            >
              <svg
                className="w-6 h-6"
                fill={liked ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span className="text-sm font-medium">
                {liked ? post.likes + 1 : post.likes}
              </span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span className="text-sm font-medium">{post.comments}</span>
            </button>

            <button className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
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
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                />
              </svg>
            </button>
          </div>

          <button className="text-gray-600 dark:text-gray-400 hover:text-yellow-500 transition-colors">
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
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </button>
        </div>

        {/* Post Content */}
        <div className="mb-3">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
            {post.title}
          </h4>
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
            {post.description}
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
            {post.timeAgo}
          </p>
        </div>

        {/* Top Comments Preview */}
        {post.topComments && post.topComments.length > 0 && (
          <div className="space-y-2 mb-3">
            {post.topComments.slice(0, 2).map((topComment, index) => (
              <div key={index} className="flex items-start space-x-2">
                <img
                  src={topComment.avatar}
                  alt={topComment.username}
                  className="w-6 h-6 rounded-full object-cover"
                  loading="lazy"
                />
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {topComment.username}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 ml-2">
                      {topComment.text}
                    </span>
                  </p>
                </div>
              </div>
            ))}
            {post.comments > 2 && (
              <button
                onClick={() => setShowComments(!showComments)}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                View all {post.comments} comments
              </button>
            )}
          </div>
        )}

        {/* Comments Section */}
        {showComments && (
          <div className="border-t border-gray-100 dark:border-dark-700 pt-3">
            <form onSubmit={handleComment} className="mb-3">
              <div className="flex items-center space-x-2">
                <img
                  src="https://images.unsplash.com/photo-1695927521717-a0ad39d93505"
                  alt="Your avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!comment.trim()}
                  className="text-purple-600 dark:text-purple-400 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Post
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
