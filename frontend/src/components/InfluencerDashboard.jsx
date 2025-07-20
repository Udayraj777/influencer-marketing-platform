import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './dashboard/Header';
import ProfileHeader from './dashboard/ProfileHeader';
import CollabHub from './dashboard/CollabHub';
import CampaignsSection from './dashboard/CampaignsSection';
import ApplicationsSection from './dashboard/ApplicationsSection';
import InvitationsSection from './dashboard/InvitationsSection';
import CollabSection from './dashboard/CollabSection';
import Sidebar from './dashboard/Sidebar';
import { useInfluencerDashboard } from '../hooks/useInfluencerDashboard';
import { DashboardProvider } from '../contexts/DashboardContext';

const InfluencerDashboard = () => {
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate initial data loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSectionChange = useCallback((section) => {
    setCurrentSection(section);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
        <Header currentSection={currentSection} onSectionChange={handleSectionChange} />
        
        <main className="max-w-7xl mx-auto px-4 py-8">
          <ProfileHeader />
          
          {currentSection === 'dashboard' && (
            <div className="space-y-8">
              <CollabHub onSwitchToCollab={() => handleSectionChange('collab')} />
              
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                <div className="xl:col-span-3 space-y-8">
                  <CampaignsSection />
                  <ApplicationsSection />
                  <InvitationsSection />
                </div>
                <div className="xl:col-span-1">
                  <Sidebar />
                </div>
              </div>
            </div>
          )}
          
          {currentSection === 'collab' && <CollabSection />}
          
          {currentSection === 'messages' && (
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">Messages</h2>
              <p className="text-gray-600">Messages section coming soon!</p>
            </div>
          )}
        </main>
      </div>
    </DashboardProvider>
  );
};

export default InfluencerDashboard;