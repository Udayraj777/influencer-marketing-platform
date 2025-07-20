import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BusinessDashboard from './BusinessDashboard';
import InfluencerDashboard from './InfluencerDashboard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual auth check and user role fetch from backend
    // For now, check localStorage or make API call to get user role
    const checkUserRole = async () => {
      try {
        // Simulate API call to get user data
        // In real implementation, this would be:
        // const response = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
        // const userData = await response.json();
        // setUserRole(userData.role);
        
        // For now, check if we have user data in localStorage from onboarding
        const userData = localStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          setUserRole(user.role);
        } else {
          // If no user data, redirect to login
          navigate('/register');
          return;
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        navigate('/register');
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Render appropriate dashboard based on user role
  if (userRole === 'business') {
    return <BusinessDashboard />;
  } else if (userRole === 'influencer') {
    return <InfluencerDashboard />;
  } else {
    // If role is not recognized, redirect to register
    navigate('/register');
    return null;
  }
};

export default Dashboard;