import { useState, useEffect } from 'react';

export const useInfluencerDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    campaigns: [],
    applications: [],
    invitations: [],
    stats: {
      profileViews: 0,
      applicationsSent: 0,
      responseRate: 0,
      earnings: 0
    },
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // TODO: Replace with actual API calls
        // const token = localStorage.getItem('authToken');
        // const headers = { Authorization: `Bearer ${token}` };
        
        // Mock data for now
        const mockData = {
          campaigns: [],
          applications: [],
          invitations: [],
          stats: {
            profileViews: 247,
            applicationsSent: 12,
            responseRate: 68,
            earnings: 1250
          }
        };

        // Simulate API delay
        setTimeout(() => {
          setDashboardData({
            ...mockData,
            loading: false,
            error: null
          });
        }, 1000);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setDashboardData(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    };

    fetchDashboardData();
  }, []);

  const refreshData = () => {
    setDashboardData(prev => ({ ...prev, loading: true }));
    // Re-fetch data logic here
  };

  return {
    ...dashboardData,
    refreshData
  };
};