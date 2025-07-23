import React, { useRef } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedClientRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const isThrottled = useRef(false);

  if (loading) {
    return (
      <div className="min-h-[30vh] flex items-center justify-center text-gray-500">
        ⏳ جاري التحقق من الصلاحيات...
      </div>
    );
  }

  if (!user || user.role !== "client") {
    // Prevent unnecessary redirects (throttling)
    if (isThrottled.current) return null;
    isThrottled.current = true;

    setTimeout(() => {
      isThrottled.current = false;
    }, 800); // throttle duration

    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedClientRoute;
