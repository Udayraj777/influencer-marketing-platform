import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

const BusinessDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [influencers, setInfluencers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [businessProfile, setBusinessProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    title: '',
    description: '',
    budgetRange: '',
    platform: '',
    categories: [],
    deliverables: [],
    startDate: '',
    endDate: ''
  });
  const [submittingCampaign, setSubmittingCampaign] = useState(false);
  
  const handleCampaignFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'categories' || name === 'deliverables') {
        setCampaignForm(prev => ({
          ...prev,
          [name]: checked 
            ? [...prev[name], value]
            : prev[name].filter(item => item !== value)
        }));
      }
    } else {
      setCampaignForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    
    if (!businessProfile) {
      alert('Please complete your business profile first');
      return;
    }
    
    setSubmittingCampaign(true);
    
    try {
      const campaignData = {
        title: campaignForm.title,
        description: campaignForm.description,
        budget: campaignForm.budgetRange,
        platform: campaignForm.platform,
        categories: campaignForm.categories,
        deliverables: campaignForm.deliverables,
        timeline: {
          startDate: campaignForm.startDate,
          endDate: campaignForm.endDate
        },
        companyName: businessProfile.companyName,
        companyIndustry: businessProfile.industry
      };
      
      console.log('🚀 Creating campaign:', campaignData);
      
      const result = await apiService.createCampaign(campaignData);
      
      if (result.success) {
        console.log('✅ Campaign created successfully:', result.campaign);
        alert('Campaign created successfully!');
        
        // Reset form and close modal
        setCampaignForm({
          title: '',
          description: '',
          budgetRange: '',
          platform: '',
          categories: [],
          deliverables: [],
          startDate: '',
          endDate: ''
        });
        setShowCampaignModal(false);
        
        // Refresh campaigns list
        const campaignsData = await apiService.getBusinessCampaigns();
        setCampaigns(campaignsData.campaigns || []);
        
      } else {
        console.error('❌ Campaign creation failed:', result);
        alert('Failed to create campaign: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('💥 Campaign creation error:', error);
      alert('Failed to create campaign: ' + error.message);
    } finally {
      setSubmittingCampaign(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log('🏢 Fetching business dashboard data...');
        
        // Fetch business profile
        try {
          const profileData = await apiService.getBusinessProfile();
          console.log('✅ Business profile loaded:', profileData);
          setBusinessProfile(profileData.profile);
        } catch (error) {
          console.error('❌ Error fetching business profile:', error);
        }
        
        // Fetch recommended influencers from backend
        try {
          const influencersData = await apiService.getInfluencerMatches();
          setInfluencers(influencersData.influencers || []);
        } catch (error) {
          console.error('Error fetching influencers:', error);
          // Keep default empty array
        }
        
        // Fetch user's campaigns
        try {
          const campaignsData = await apiService.getBusinessCampaigns();
          setCampaigns(campaignsData.campaigns || []);
        } catch (error) {
          console.error('Error fetching campaigns:', error);
          // Keep default empty array
        }
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold">Upsaleit</div>
            <nav className="flex space-x-6">
              <button 
                onClick={() => setCurrentSection('dashboard')}
                className={`px-4 py-2 rounded-lg transition-all ${currentSection === 'dashboard' ? 'bg-white/20' : 'hover:bg-white/10'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setCurrentSection('influencers')}
                className={`px-4 py-2 rounded-lg transition-all ${currentSection === 'influencers' ? 'bg-white/20' : 'hover:bg-white/10'}`}
              >
                Find Influencers
              </button>
              <button 
                onClick={() => setCurrentSection('campaigns')}
                className={`px-4 py-2 rounded-lg transition-all ${currentSection === 'campaigns' ? 'bg-white/20' : 'hover:bg-white/10'}`}
              >
                My Campaigns
              </button>
              <button 
                onClick={() => setCurrentSection('messages')}
                className={`px-4 py-2 rounded-lg transition-all ${currentSection === 'messages' ? 'bg-white/20' : 'hover:bg-white/10'}`}
              >
                Messages
              </button>
            </nav>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 rounded-full hover:bg-white/10 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4h16c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                </svg>
                <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">0</span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-semibold">{businessProfile?.companyName || user?.name || 'Business User'}</p>
                  <p className="text-xs opacity-75">{businessProfile?.industry || 'Business'}</p>
                </div>
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold">{businessProfile?.companyName?.[0] || 'B'}</span>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="px-3 py-1 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentSection === 'dashboard' && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h1 className="text-3xl font-bold text-blue-900 mb-2">
                Welcome, {businessProfile?.companyName || user?.name || 'Business User'}!
              </h1>
              <p className="text-gray-600 text-lg">Discover and connect with authentic influencers to grow your brand</p>
              
              {businessProfile && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-3">Company Profile</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p><strong>Industry:</strong> {businessProfile.industry}</p>
                      <p><strong>Company Size:</strong> {businessProfile.companySize}</p>
                    </div>
                    <div>
                      <p><strong>Budget Range:</strong> {businessProfile.campaignPreferences?.typicalBudget || 'Not specified'}</p>
                      <p><strong>Platforms:</strong> {businessProfile.campaignPreferences?.preferredPlatforms?.join(', ') || 'Not specified'}</p>
                    </div>
                    <div>
                      <p><strong>Website:</strong> {businessProfile.website ? (
                        <a href={businessProfile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {businessProfile.website}
                        </a>
                      ) : 'Not provided'}</p>
                      <p><strong>Target Audience:</strong> {businessProfile.campaignPreferences?.targetAudience ? 
                        JSON.parse(businessProfile.campaignPreferences.targetAudience).ageRange || 'Not specified' : 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                    <p className="text-3xl font-bold text-blue-600">{businessProfile?.stats?.activeCampaigns || 0}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Reach</p>
                    <p className="text-3xl font-bold text-green-600">{businessProfile?.stats?.totalInfluencersWorkedWith || 0}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Applications</p>
                    <p className="text-3xl font-bold text-amber-600">{campaigns?.length || 0}</p>
                  </div>
                  <div className="bg-amber-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Investment</p>
                    <p className="text-3xl font-bold text-purple-600">${businessProfile?.stats?.totalSpent || 0}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-4">
                  <button 
                    onClick={() => setCurrentSection('campaigns')}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Create New Campaign
                  </button>
                  <button 
                    onClick={() => setCurrentSection('influencers')}
                    className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Browse Influencers
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="text-center text-gray-500 py-8">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                    <p>No recent activity</p>
                    <p className="text-sm">Start your first campaign to see activity here</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentSection === 'influencers' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-900">Discover Influencers</h2>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Advanced Filters
                </button>
              </div>
              
              {/* Quick Filters */}
              <div className="flex flex-wrap gap-4 mb-8">
                <button className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-medium">All Categories</button>
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">Fashion</button>
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">Beauty</button>
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">Lifestyle</button>
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">Fitness</button>
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">Food</button>
              </div>

              {/* Mock Influencer Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    id: 1,
                    name: 'Sarah Chen',
                    username: '@sarahbeauty',
                    platform: 'Instagram',
                    followers: '25.3K',
                    engagement: '4.2%',
                    niche: 'Beauty & Skincare',
                    location: 'Los Angeles, CA',
                    avatar: 'SC',
                    verified: true,
                    matchScore: 95
                  },
                  {
                    id: 2,
                    name: 'Alex Rodriguez',
                    username: '@fitwithalex',
                    platform: 'TikTok',
                    followers: '42.1K',
                    engagement: '6.8%',
                    niche: 'Fitness & Wellness',
                    location: 'Miami, FL',
                    avatar: 'AR',
                    verified: true,
                    matchScore: 89
                  },
                  {
                    id: 3,
                    name: 'Emma Thompson',
                    username: '@emmastyle',
                    platform: 'Instagram',
                    followers: '18.7K',
                    engagement: '5.1%',
                    niche: 'Fashion & Style',
                    location: 'New York, NY',
                    avatar: 'ET',
                    verified: false,
                    matchScore: 87
                  }
                ].map((influencer) => (
                  <div key={influencer.id} className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                          {influencer.avatar}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900">{influencer.name}</h3>
                            {influencer.verified && (
                              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                              </svg>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{influencer.username}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          {influencer.matchScore}% Match
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Platform:</span>
                        <span className="font-medium">{influencer.platform}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Followers:</span>
                        <span className="font-medium">{influencer.followers}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Engagement:</span>
                        <span className="font-medium">{influencer.engagement}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Niche:</span>
                        <span className="font-medium">{influencer.niche}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                        Connect
                      </button>
                      <button className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium">
                        View Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-8">
                <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Load More Influencers
                </button>
              </div>
            </div>
          </div>
        )}

        {currentSection === 'campaigns' && (
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-900">My Campaigns</h2>
              <button 
                onClick={() => setShowCampaignModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create Campaign
              </button>
            </div>
            
            {campaigns && campaigns.length > 0 ? (
              <div className="space-y-6">
                {campaigns.map((campaign) => (
                  <div key={campaign._id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-blue-900 mb-1">{campaign.title}</h3>
                        <p className="text-gray-600 text-sm">
                          {campaign.category} • {campaign.platforms?.join(', ') || 'Multiple Platforms'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          campaign.status === 'active' ? 'bg-green-100 text-green-700' :
                          campaign.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                          campaign.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {campaign.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 text-sm mb-4 leading-relaxed">{campaign.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-white rounded-lg">
                      <div className="text-center">
                        <div className="font-bold text-blue-900">${campaign.budget?.total?.toLocaleString() || 'N/A'}</div>
                        <div className="text-xs text-gray-600">Total Budget</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-blue-900">${campaign.budget?.perInfluencer?.toLocaleString() || 'N/A'}</div>
                        <div className="text-xs text-gray-600">Per Influencer</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-blue-900">{campaign.applicationsCount || 0}</div>
                        <div className="text-xs text-gray-600">Applications</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-blue-900">{campaign.maxInfluencers || 'N/A'}</div>
                        <div className="text-xs text-gray-600">Max Influencers</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        <span>Created: {new Date(campaign.createdAt).toLocaleDateString()}</span>
                        {campaign.timeline?.campaignStart && (
                          <span className="ml-4">Starts: {new Date(campaign.timeline.campaignStart).toLocaleDateString()}</span>
                        )}
                      </div>
                      
                      <div className="flex space-x-3">
                        <button className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium">
                          View Applications
                        </button>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                          Edit Campaign
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                <p className="text-lg font-medium">No campaigns yet</p>
                <p>Create your first campaign to start connecting with influencers</p>
              </div>
            )}
          </div>
        )}

        {/* Campaign Creation Modal */}
        {showCampaignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-blue-900">Create New Campaign</h3>
                <button 
                  onClick={() => setShowCampaignModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <form className="space-y-6" onSubmit={handleCreateCampaign}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Title</label>
                  <input 
                    type="text" 
                    name="title"
                    value={campaignForm.title}
                    onChange={handleCampaignFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter campaign title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea 
                    name="description"
                    value={campaignForm.description}
                    onChange={handleCampaignFormChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe your campaign goals and requirements"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
                    <select 
                      name="budgetRange"
                      value={campaignForm.budgetRange}
                      onChange={handleCampaignFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select budget range</option>
                      <option value="500-1000">$500 - $1,000</option>
                      <option value="1000-2500">$1,000 - $2,500</option>
                      <option value="2500-5000">$2,500 - $5,000</option>
                      <option value="5000-10000">$5,000 - $10,000</option>
                      <option value="10000+">$10,000+</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                    <select 
                      name="platform"
                      value={campaignForm.platform}
                      onChange={handleCampaignFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select platform</option>
                      <option value="Instagram">Instagram</option>
                      <option value="TikTok">TikTok</option>
                      <option value="YouTube">YouTube</option>
                      <option value="Twitter">Twitter</option>
                      <option value="Multiple">Multiple Platforms</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content Categories</label>
                  <div className="flex flex-wrap gap-3">
                    {['Fashion', 'Beauty', 'Lifestyle', 'Fitness', 'Food', 'Tech', 'Travel', 'Gaming'].map((category) => (
                      <label key={category} className="flex items-center">
                        <input 
                          type="checkbox" 
                          name="categories"
                          value={category}
                          checked={campaignForm.categories.includes(category)}
                          onChange={handleCampaignFormChange}
                          className="mr-2" 
                        />
                        <span className="text-sm">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deliverables</label>
                  <div className="space-y-2">
                    {['Instagram Post', 'Instagram Story', 'Video Content', 'Product Review'].map((deliverable) => (
                      <label key={deliverable} className="flex items-center">
                        <input 
                          type="checkbox" 
                          name="deliverables"
                          value={deliverable}
                          checked={campaignForm.deliverables.includes(deliverable)}
                          onChange={handleCampaignFormChange}
                          className="mr-2" 
                        />
                        <span className="text-sm">{deliverable}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Timeline</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      type="date" 
                      name="startDate"
                      value={campaignForm.startDate}
                      onChange={handleCampaignFormChange}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Start Date"
                      required
                    />
                    <input 
                      type="date" 
                      name="endDate"
                      value={campaignForm.endDate}
                      onChange={handleCampaignFormChange}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="End Date"
                      required
                    />
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowCampaignModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submittingCampaign}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    {submittingCampaign ? 'Creating Campaign...' : 'Create Campaign'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {currentSection === 'messages' && (
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">Messages</h2>
            <div className="text-center text-gray-500 py-12">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
              <p className="text-lg font-medium">No messages yet</p>
              <p>Start conversations with influencers to see messages here</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BusinessDashboard;