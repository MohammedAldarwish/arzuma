import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAppState } from "./AppStateContext";
import LoadingSpinner from "./LoadingSpinner";

const RouteTransition = ({ children }) => {
  const location = useLocation();
  const { getScrollPosition, setScrollPosition } = useAppState();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayLocation, setDisplayLocation] = useState(location);

  useEffect(() => {
    if (location !== displayLocation) {
      setIsTransitioning(true);

      // Save current scroll position
      const currentRoute = displayLocation.pathname;
      const currentScrollPosition = window.scrollY;
      setScrollPosition(currentRoute, currentScrollPosition);

      // Simulate transition delay
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setIsTransitioning(false);

        // Restore scroll position for the new route
        const newRoute = location.pathname;
        const savedScrollPosition = getScrollPosition(newRoute);

        // Use requestAnimationFrame for smooth scroll restoration
        requestAnimationFrame(() => {
          window.scrollTo({
            top: savedScrollPosition,
            behavior: "smooth",
          });
        });
      }, 150); // Short transition delay

      return () => clearTimeout(timer);
    }
  }, [location, displayLocation, setScrollPosition, getScrollPosition]);

  if (isTransitioning) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return <div className="route-transition">{children}</div>;
};

export default RouteTransition;
