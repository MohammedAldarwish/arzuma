import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUsername } from "../utils/auth";

const STORY_DURATION = 5000; // 5 seconds per story (for images only)

const StoryViewer = ({
  stories,
  initialUserIndex = 0,
  initialStoryIndex = 0,
  onClose,
}) => {
  const navigate = useNavigate();
  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const timerRef = useRef(null);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const touchStartTime = useRef(null);

  // Add null check for stories
  if (!stories || !Array.isArray(stories) || stories.length === 0) {
    console.warn("StoryViewer: stories prop is undefined, null, or empty");
    return null;
  }

  const currentUser = stories[currentUserIndex];
  const currentStory = currentUser?.stories[currentStoryIndex];
  const totalUsers = stories.length;
  const totalStoriesInCurrentUser = currentUser?.stories?.length || 0;

  // Validate indices
  if (currentUserIndex >= totalUsers || currentUserIndex < 0) {
    console.warn(
      `StoryViewer: Invalid currentUserIndex: ${currentUserIndex}, totalUsers: ${totalUsers}`
    );
    return null;
  }

  if (currentStoryIndex >= totalStoriesInCurrentUser || currentStoryIndex < 0) {
    console.warn(
      `StoryViewer: Invalid currentStoryIndex: ${currentStoryIndex}, totalStoriesInCurrentUser: ${totalStoriesInCurrentUser}`
    );
    return null;
  }

  // Get current logged-in user's username
  const currentLoggedInUsername = getCurrentUsername();

  // Check if the story owner is the current logged-in user
  const isOwnStory = currentUser?.user?.username === currentLoggedInUsername;

  // Auto-advance story (only for images)
  useEffect(() => {
    if (!currentStory || isPaused || currentStory.media_type === "video")
      return;

    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(1, elapsed / STORY_DURATION);
      setProgress(newProgress);

      if (newProgress >= 1) {
        handleNextStory();
      }
    }, 50);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentUserIndex, currentStoryIndex, isPaused, currentStory?.media_type]);

  // Reset progress when story changes
  useEffect(() => {
    setProgress(0);
    // Reset mute state when story changes
    setIsMuted(false);
  }, [currentUserIndex, currentStoryIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case "ArrowRight":
        case " ":
          e.preventDefault();
          handleNextStory();
          break;
        case "ArrowLeft":
          e.preventDefault();
          handlePrevStory();
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentUserIndex, currentStoryIndex]);

  // Touch handlers
  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    setIsPaused(true);
  }, []);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleTouchEnd = useCallback(
    (e) => {
      if (
        !touchStartX.current ||
        !touchStartY.current ||
        !touchStartTime.current
      )
        return;

      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      const deltaY = e.changedTouches[0].clientY - touchStartY.current;
      const deltaTime = Date.now() - touchStartTime.current;
      const minSwipeDistance = 50;
      const maxTapTime = 200;

      // Reset touch state
      touchStartX.current = null;
      touchStartY.current = null;
      touchStartTime.current = null;
      setIsPaused(false);

      // Handle tap vs swipe
      if (
        deltaTime < maxTapTime &&
        Math.abs(deltaX) < minSwipeDistance &&
        Math.abs(deltaY) < minSwipeDistance
      ) {
        // Tap - pause/resume or navigate to profile
        const tapX = e.changedTouches[0].clientX;
        const screenWidth = window.innerWidth;

        if (tapX < screenWidth / 3) {
          // Left third - previous story
          handlePrevStory();
        } else if (tapX > (screenWidth * 2) / 3) {
          // Right third - next story
          handleNextStory();
        } else {
          // Middle third - pause/resume
          setIsPaused(!isPaused);
        }
        return;
      }

      // Handle swipe
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance) {
          if (deltaX > 0) {
            handlePrevStory();
          } else {
            handleNextStory();
          }
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipeDistance) {
          if (deltaY > 0) {
            // Swipe down - close
            onClose();
          }
        }
      }
    },
    [currentUserIndex, currentStoryIndex, isPaused]
  );

  const handleNextStory = useCallback(() => {
    if (currentStoryIndex < totalStoriesInCurrentUser - 1) {
      // Next story in same user
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else if (currentUserIndex < totalUsers - 1) {
      // Next user
      setCurrentUserIndex(currentUserIndex + 1);
      setCurrentStoryIndex(0);
    } else {
      // Last story of last user - close
      onClose();
    }
  }, [
    currentUserIndex,
    currentStoryIndex,
    totalStoriesInCurrentUser,
    totalUsers,
    onClose,
  ]);

  const handlePrevStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      // Previous story in same user
      setCurrentStoryIndex(currentStoryIndex - 1);
    } else if (currentUserIndex > 0) {
      // Previous user
      setCurrentUserIndex(currentUserIndex - 1);
      setCurrentStoryIndex(
        stories[currentUserIndex - 1]?.stories?.length - 1 || 0
      );
    } else {
      // First story of first user - close
      onClose();
    }
  }, [currentUserIndex, currentStoryIndex, stories, onClose]);

  const handleUserProfileClick = useCallback(() => {
    if (currentUser?.user?.username) {
      if (isOwnStory) {
        // Navigate to own profile (My Profile)
        navigate("/profile");
      } else {
        // Navigate to other user's profile (Public Profile)
        navigate(`/profile/${currentUser.user.username}`);
      }
      onClose();
    }
  }, [currentUser, navigate, onClose, isOwnStory]);

  if (!currentUser || !currentStory) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Touch handlers */}
      <div
        className="absolute inset-0"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* Header with user info */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        {/* Progress bars for all stories in current user */}
        <div className="flex space-x-1 mb-4">
          {currentUser.stories.map((_, index) => (
            <div
              key={index}
              className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-white transition-all duration-100"
                style={{
                  width:
                    index < currentStoryIndex
                      ? "100%"
                      : index === currentStoryIndex
                      ? `${progress * 100}%`
                      : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* User info */}
        <div className="flex items-center space-x-3">
          <div
            className="w-10 h-10 rounded-full overflow-hidden cursor-pointer"
            onClick={handleUserProfileClick}
          >
            {currentUser.user?.avatar ? (
              <img
                src={
                  currentUser.user.avatar.startsWith("http")
                    ? currentUser.user.avatar
                    : `http://127.0.0.1:8000${currentUser.user.avatar}`
                }
                alt={currentUser.user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white font-semibold">
                {currentUser.user?.username?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
          </div>

          <div className="flex-1">
            <div
              className="text-white font-semibold cursor-pointer hover:underline"
              onClick={handleUserProfileClick}
            >
              {currentUser.user?.username || "Unknown User"}
            </div>
            <div className="text-white/70 text-sm">
              {new Date(currentStory.created_at).toLocaleTimeString()}
            </div>
          </div>

          {/* Sound control button (only for video stories) */}
          {currentStory.media_type === "video" && (
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors mr-2"
            >
              {isMuted ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    clipRule="evenodd"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  />
                </svg>
              )}
            </button>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <svg
              className="w-5 h-5"
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
        </div>
      </div>

      {/* Story content */}
      <div className="flex items-center justify-center h-full">
        <div className="relative w-full h-full max-w-md max-h-[80vh] mx-auto">
          {currentStory.media_type === "image" ? (
            <img
              src={
                currentStory.file.startsWith("http")
                  ? currentStory.file
                  : `http://127.0.0.1:8000${currentStory.file}`
              }
              alt="Story"
              className="w-full h-full object-contain"
            />
          ) : currentStory.media_type === "video" ? (
            <video
              src={
                currentStory.file.startsWith("http")
                  ? currentStory.file
                  : `http://127.0.0.1:8000${currentStory.file}`
              }
              className="w-full h-full object-contain"
              autoPlay
              muted={isMuted}
              loop={false}
              onEnded={handleNextStory}
            />
          ) : null}
        </div>
      </div>

      {/* Navigation hints */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/50 text-sm text-center">
        <div>{isPaused ? "متوقف مؤقتاً" : "اضغط للإيقاف المؤقت"}</div>
        <div className="text-xs mt-1 opacity-70">← اضغط يسار | اضغط يمين →</div>
        <div className="text-xs mt-1 opacity-50">
          {Math.ceil((1 - progress) * 60)} ثانية متبقية
        </div>
      </div>

      {/* Debug info (remove in production) */}
      <div className="absolute top-20 left-4 text-white/50 text-xs">
        User: {currentUserIndex + 1}/{totalUsers} | Story:{" "}
        {currentStoryIndex + 1}/{totalStoriesInCurrentUser}
      </div>
    </div>
  );
};

export default StoryViewer;
