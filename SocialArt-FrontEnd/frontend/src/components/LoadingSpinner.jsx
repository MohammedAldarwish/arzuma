import React from "react";
import { useTheme } from "./ThemeContext";

const LoadingSpinner = ({
  size = "md",
  text = "Loading...",
  fullScreen = false,
}) => {
  const { isDark } = useTheme();

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`${sizeClasses[size]} relative`}>
        <div
          className={`${sizeClasses[size]} border-2 border-gray-200 dark:border-dark-600 rounded-full animate-pulse`}
        ></div>
        <div
          className={`${sizeClasses[size]} border-2 border-transparent border-t-purple-600 dark:border-t-purple-400 rounded-full animate-spin absolute top-0 left-0`}
        ></div>
      </div>
      {text && (
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-dark-900 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">{spinner}</div>
  );
};

export default LoadingSpinner;
