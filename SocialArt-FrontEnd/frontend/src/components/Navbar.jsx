import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isInstructor, setIsInstructor] = React.useState(false);

  React.useEffect(() => {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (userStr && token) {
      const userObj = JSON.parse(userStr);
      setUser(userObj);
      setIsAuthenticated(true);
      setIsInstructor(!!userObj.stripe_account_id);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setIsAuthenticated(false);
    setIsInstructor(false);
    window.location.href = "/";
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Desktop Navbar - Top */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-dark-800/90 backdrop-blur-md border-b border-gray-100 dark:border-dark-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="text-xl lg:text-2xl font-bold bg-[#FFA726] bg-clip-text text-transparent"
            >
              ArtConnect
            </Link>

            <div className="flex items-center space-x-2 lg:space-x-4 xl:space-x-6 absolute left-1/2 transform -translate-x-1/2">
              <Link
                to="/"
                className={`flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-2 rounded-xl transition-all ${
                  isActive("/")
                    ? "bg-orange-100 text-[#FFA726]"
                    : "text-gray-600 dark:text-gray-300 hover:text-[#FFA726]"
                }`}
              >
                <svg
                  className="w-4 h-4 lg:w-5 lg:h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span className="text-xs lg:text-sm font-medium">Home</span>
              </Link>

              <Link
                to="/explore"
                className={`flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-2 rounded-xl transition-all ${
                  isActive("/explore")
                    ? "bg-orange-100 text-[#FFA726]"
                    : "text-gray-600 dark:text-gray-300 hover:text-[#FFA726]"
                }`}
              >
                <svg
                  className="w-4 h-4 lg:w-5 lg:h-5"
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
                <span className="text-xs lg:text-sm font-medium">Explore</span>
              </Link>

              <Link
                to="/courses"
                className={`flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-2 rounded-xl transition-all ${
                  isActive("/courses")
                    ? "bg-orange-100 text-[#FFA726]"
                    : "text-gray-600 dark:text-gray-300 hover:text-[#FFA726]"
                }`}
              >
                <svg
                  className="w-4 h-4 lg:w-5 lg:h-5"
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
                <span className="text-xs lg:text-sm font-medium">Courses</span>
              </Link>

              <Link
                to="/notifications"
                className={`flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-2 rounded-xl transition-all relative ${
                  isActive("/notifications")
                    ? "bg-orange-100 text-[#FFA726]"
                    : "text-gray-600 dark:text-gray-300 hover:text-[#FFA726]"
                }`}
              >
                <svg
                  className="w-4 h-4 lg:w-5 lg:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="text-xs lg:text-sm font-medium">
                  Notifications
                </span>
                <div className="absolute -top-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 bg-[#FFA726] text-white text-xs rounded-full flex items-center justify-center">
                  5
                </div>
              </Link>

              {isInstructor && (
                <>
                  <Link
                    to="/create-course"
                    className="bg-green-600 text-white px-2 lg:px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition-all flex items-center space-x-1 lg:space-x-2"
                  >
                    <svg
                      className="w-4 h-4 lg:w-5 lg:h-5"
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
                    <span className="text-xs lg:text-sm">Create Course</span>
                  </Link>

                  <Link
                    to="/stripe-connect"
                    className="bg-blue-600 text-white px-2 lg:px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-all flex items-center space-x-1 lg:space-x-2"
                  >
                    <svg
                      className="w-4 h-4 lg:w-5 lg:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                    <span className="text-xs lg:text-sm">Stripe</span>
                  </Link>
                </>
              )}

              <button
                onClick={() => {
                  // Open upload modal or navigate to upload page
                  window.location.href = "/upload";
                }}
                className="bg-[#FFA726] text-white px-2 lg:px-4 py-2 rounded-xl font-medium hover:bg-orange-400 transition-all flex items-center space-x-1 lg:space-x-2"
              >
                <svg
                  className="w-4 h-4 lg:w-5 lg:h-5"
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
                <span className="text-xs lg:text-sm">Upload</span>
              </button>

              {isAuthenticated ? (
                <Link
                  to="/profile"
                  className="flex items-center justify-center w-12 h-12 rounded-full transition-all text-gray-600 dark:text-gray-300"
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center justify-center w-12 h-12 rounded-full transition-all text-gray-600 dark:text-gray-300"
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </Link>
              )}
            </div>

            {/* Spacer div to balance the layout */}
            <div className="w-12 h-12"></div>
          </div>
        </div>
      </nav>

      {/* Mobile Floating Buttons - Top Right */}
      <div className="md:hidden fixed top-4 right-4 z-50 flex items-center space-x-3">
        {/* User Button */}
        <Link
          to="/profile"
          className="flex items-center justify-center w-12 h-12 rounded-full bg-white/80 dark:bg-dark-800/80 backdrop-blur-md shadow-lg border border-gray-100 dark:border-dark-700 transition-all text-gray-600 dark:text-gray-300 hover:text-[#FFA726] dark:hover:text-[#FFA726]"
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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </Link>
      </div>

      {/* Mobile Navbar - Bottom */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-dark-800/95 backdrop-blur-md border-t border-gray-100 dark:border-dark-700 transition-colors duration-200">
        <div className="grid grid-cols-5 gap-1 py-2 px-2">
          <Link
            to="/"
            className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all ${
              isActive("/")
                ? "text-[#FFA726]"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <svg
              className="w-6 h-6 mb-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className="text-xs">Home</span>
          </Link>

          <Link
            to="/explore"
            className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all ${
              isActive("/explore")
                ? "text-[#FFA726]"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <svg
              className="w-6 h-6 mb-1"
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
            <span className="text-xs">Explore</span>
          </Link>

          <Link
            to="/courses"
            className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all ${
              isActive("/courses")
                ? "text-[#FFA726]"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <svg
              className="w-6 h-6 mb-1"
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
            <span className="text-xs">Courses</span>
          </Link>

          <Link
            to="/upload"
            className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all ${
              isActive("/upload")
                ? "text-[#FFA726]"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <svg
              className="w-6 h-6 mb-1"
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
            <span className="text-xs">Upload</span>
          </Link>

          <Link
            to="/notifications"
            className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all relative ${
              isActive("/notifications")
                ? "text-[#FFA726]"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <svg
              className="w-6 h-6 mb-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="text-xs">Alerts</span>
            <div className="absolute top-1 right-1 w-4 h-4 bg-[#FFA726] text-white text-xs rounded-full flex items-center justify-center">
              5
            </div>
          </Link>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
