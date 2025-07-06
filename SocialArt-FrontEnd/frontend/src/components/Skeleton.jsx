import React from "react";

// Skeleton components for different UI elements
export const Skeleton = ({ className = "", ...props }) => (
  <div
    className={`animate-pulse bg-gray-200 dark:bg-dark-600 rounded ${className}`}
    {...props}
  />
);

export const SkeletonText = ({ lines = 1, className = "" }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={`h-4 ${i === lines - 1 ? "w-3/4" : "w-full"}`}
      />
    ))}
  </div>
);

export const SkeletonAvatar = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  return (
    <Skeleton className={`${sizeClasses[size]} rounded-full ${className}`} />
  );
};

export const SkeletonCard = ({ className = "" }) => (
  <div
    className={`bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-700 p-4 ${className}`}
  >
    <div className="flex items-center space-x-3 mb-4">
      <SkeletonAvatar />
      <div className="flex-1">
        <Skeleton className="h-4 w-1/3 mb-2" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
    <Skeleton className="h-80 rounded-xl mb-4" />
    <SkeletonText lines={2} />
  </div>
);

export const SkeletonPost = () => <SkeletonCard className="mb-6" />;

export const SkeletonFeed = ({ count = 3 }) => (
  <div className="space-y-6">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonPost key={i} />
    ))}
  </div>
);

export const SkeletonGrid = ({ cols = 3, rows = 2, className = "" }) => (
  <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-6 ${className}`}>
    {Array.from({ length: cols * rows }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export const SkeletonList = ({ items = 5, className = "" }) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: items }).map((_, i) => (
      <div
        key={i}
        className="flex items-center space-x-3 p-3 bg-white dark:bg-dark-800 rounded-xl"
      >
        <SkeletonAvatar />
        <div className="flex-1">
          <Skeleton className="h-4 w-1/2 mb-1" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonButton = ({ className = "" }) => (
  <Skeleton className={`h-10 w-24 rounded-xl ${className}`} />
);

export const SkeletonInput = ({ className = "" }) => (
  <Skeleton className={`h-12 w-full rounded-xl ${className}`} />
);

export const SkeletonProfile = () => (
  <div className="space-y-6">
    {/* Profile Header */}
    <div className="bg-white dark:bg-dark-800 rounded-2xl p-6">
      <div className="flex items-center space-x-4 mb-4">
        <SkeletonAvatar size="xl" />
        <div className="flex-1">
          <Skeleton className="h-6 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>

    {/* Stats */}
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-dark-800 rounded-xl p-4 text-center"
        >
          <Skeleton className="h-6 w-16 mx-auto mb-2" />
          <Skeleton className="h-4 w-12 mx-auto" />
        </div>
      ))}
    </div>

    {/* Gallery Grid */}
    <SkeletonGrid cols={3} rows={3} />
  </div>
);

export default Skeleton;
