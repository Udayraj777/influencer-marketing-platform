import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BusinessDashboard from './BusinessDashboard';
import InfluencerDashboard from './InfluencerDashboard';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading } = useAuth();

  useEffect(() => {
    console.log('🏠 Dashboard loading...');
    console.log('🔄 isLoading:', isLoading);
    console.log('🔐 isAuthenticated:', isAuthenticated);
    console.log('👤 user:', user);
    console.log('🗄️ authToken in localStorage:', localStorage.getItem('authToken'));
    console.log('📁 user in localStorage:', localStorage.getItem('user'));
    
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        console.log('🚫 Not authenticated, redirecting to login');
        navigate('/login');
      } else {
        console.log('✅ User authenticated, showing dashboard for role:', user.role);
      }
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render anything (useEffect will handle redirect)
  if (!isAuthenticated || !user) {
    return null;
  }

  // Render appropriate dashboard based on user role
  if (user.role === 'business') {
    return <BusinessDashboard />;
  } else if (user.role === 'influencer') {
    return <InfluencerDashboard />;
  } else {
    // If role is not recognized, redirect to login
    navigate('/login');
    return null;
  }
};

export default Dashboard;