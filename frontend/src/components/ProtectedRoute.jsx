import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Loading spinner component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

// Access denied component
const AccessDenied = ({ requiredRole }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="text-6xl mb-4">🚫</div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
      <p className="text-gray-600 mb-4">
        {requiredRole 
          ? `This page is only accessible to ${requiredRole}s.`
          : 'You do not have permission to access this page.'
        }
      </p>
      <button
        onClick={() => window.history.back()}
        className="bg-blue-800 text-white px-6 py-2 rounded-lg hover:bg-blue-900 transition-colors"
      >
        Go Back
      </button>
    </div>
  </div>
);

// Profile completion required component
const ProfileRequired = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Complete Your Profile</h1>
        <p className="text-gray-600 mb-6">
          Please complete your profile setup to access this feature.
        </p>
        <div className="space-y-3">
          {!user.isEmailVerified && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-yellow-800 text-sm">📧 Email verification required</p>
            </div>
          )}
          {!user.profileId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-800 text-sm">📝 Profile setup required</p>
            </div>
          )}
        </div>
        <button
          onClick={() => window.location.href = '/onboarding'}
          className="mt-6 bg-blue-800 text-white px-6 py-3 rounded-lg hover:bg-blue-900 transition-colors"
        >
          Complete Profile
        </button>
      </div>
    </div>
  );
};

// Main ProtectedRoute component
const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  requireRole = null, 
  requireCompleteProfile = false,
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, isLoading, user, hasRole, isProfileComplete } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If authentication is required and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If user is authenticated but role requirement is not met
  if (requireAuth && isAuthenticated && requireRole && !hasRole(requireRole)) {
    return <AccessDenied requiredRole={requireRole} />;
  }

  // If complete profile is required but user profile is incomplete
  if (requireAuth && isAuthenticated && requireCompleteProfile && !isProfileComplete()) {
    return <ProfileRequired />;
  }

  // If user is authenticated and trying to access public auth pages (login/register)
  if (!requireAuth && isAuthenticated) {
    // Redirect to appropriate dashboard based on role
    const dashboardPath = user?.role === 'business' ? '/business/dashboard' : '/influencer/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  // All checks passed, render the children
  return children;
};

// Convenience components for specific use cases
export const BusinessRoute = ({ children, requireCompleteProfile = true }) => (
  <ProtectedRoute 
    requireAuth={true} 
    requireRole="business" 
    requireCompleteProfile={requireCompleteProfile}
  >
    {children}
  </ProtectedRoute>
);

export const InfluencerRoute = ({ children, requireCompleteProfile = true }) => (
  <ProtectedRoute 
    requireAuth={true} 
    requireRole="influencer" 
    requireCompleteProfile={requireCompleteProfile}
  >
    {children}
  </ProtectedRoute>
);

export const PublicRoute = ({ children }) => (
  <ProtectedRoute requireAuth={false}>
    {children}
  </ProtectedRoute>
);

export const AuthRoute = ({ children }) => (
  <ProtectedRoute requireAuth={true}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;