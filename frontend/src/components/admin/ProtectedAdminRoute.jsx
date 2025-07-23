import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";

const ProtectedAdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [delayedLoading, setDelayedLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDelayedLoading(false);
    }, 300); // throttle redirect by 300ms
    return () => clearTimeout(timer);
  }, [loading]);

  if (loading || delayedLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 text-lg font-medium text-gray-600">
        جاري التحقق من الصلاحيات...
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
