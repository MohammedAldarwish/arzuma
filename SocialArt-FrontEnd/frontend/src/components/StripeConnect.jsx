import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const StripeConnect = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Since we removed payment functionality, this component is no longer needed
  // You can either remove this component entirely or show a message

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Setup</h2>
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Payment System Disabled
        </h3>
        <p className="text-gray-600">
          Payment functionality has been removed from this platform. All courses
          are now free.
        </p>
      </div>
    </div>
  );
};

export default StripeConnect;
