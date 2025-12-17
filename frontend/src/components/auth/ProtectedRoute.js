import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f6fb] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#8b1530]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User has no role assigned
  if (!user?.role) {
    return <Navigate to="/unauthorized" state={{ reason: 'no-role' }} replace />;
  }

  // Check if user has required role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" state={{ reason: 'forbidden' }} replace />;
  }

  return children;
};

export default ProtectedRoute;
