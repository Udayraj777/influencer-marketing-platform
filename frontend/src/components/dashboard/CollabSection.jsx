import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../contexts/DashboardContext';

const CollabSection = () => {
  const { collaborations, actions } = useDashboard();
  const [activeTab, setActiveTab] = useState('ratings');

  const mockCollaborationData = {
    stats: {
      overallRating: 4.9,
      totalReviews: 23,
      completionRate: 100,
      totalEarned: 4250,
      recommendationRate: 95,
      detailedRatings: {
        communication: 4.8,
        contentQuality: 5.0,
        timeliness: 4.9,
        professionalism: 4.7
      }
    },
    active: [
      {
        id: 'active_001',
        title: 'Fashion Week Coverage',
        company: 'GlowCosmetics',
        budget: 1200,
        startDate: '3 days ago',
        status: 'active',
        contentUrl: 'https://youtube.com/watch?v=example1',
        postedDate: '2 days ago',
        liveStats: {
          views: 2847,
          likes: 234,
          comments: 18,
          engagement: 8.2
        }
      },
      {
        id: 'active_002',
        title: 'Tech Product Review',
        company: 'TechCorp Inc.',
        budget: 1500,
        startDate: '1 week ago',
        status: 'pending-url',
        contentUrl: null,
        message: 'Upload your content and submit the YouTube URL to start tracking'
      }
    ],
    completed: [
      {
        id: 'comp_001',
        title: 'Summer Beauty Collection',
        company: 'GlowUp Beauty',
        completedDate: '2 weeks ago',
        earned: 2100,
        performance: {
          totalViews: 42100,
          engagements: 4750,
          engagementRate: 11.3,
          rating: 5
        }
      },
      {
        id: 'comp_002',
        title: 'Tech Product Unboxing',
        company: 'TechReviews',
        completedDate: '1 month ago',
        earned: 1200,
        performance: {
          totalViews: 28500,
          engagements: 2890,
          engagementRate: 10.1,
          rating: 4.8
        }
      }
    ]
  };

  useEffect(() => {
    actions.setCollaborations(mockCollaborationData);
  }, [actions]);

  const handleLiveTracking = (collabId) => {
    alert(`Live Tracking for ${collabId}!\n\n🔴 Real-time YouTube Analytics:\n• Views: 2,847 (+127 in last hour)\n• Likes: 234 (+12 in last hour)\n• Comments: 18 (+3 in last hour)\n• Watch Time: 1.2K hours\n• CTR: 8.2%\n\nUpdates every 10 seconds`);
  };

  const handleUpdateUrl = (collabId) => {
    const newUrl = prompt('Enter new YouTube URL:', 'https://youtube.com/watch?v=');
    if (newUrl) {
      alert(`URL updated for ${collabId}!\n\nNew URL: ${newUrl}\n\nTracking will restart with new video data.`);
    }
  };

  const handleSubmitUrl = (collabId) => {
    const url = document.querySelector(`#url-input-${collabId}`)?.value;
    if (url) {
      alert(`Content URL submitted for ${collabId}!\n\nURL: ${url}\n\nLive tracking will begin shortly.\nBoth you and the business can now monitor performance in real-time.`);
    } else {
      alert('Please enter a valid YouTube URL');
    }
  };

  const handleEndCollaboration = (collabId) => {
    if (confirm('Are you sure you want to end this collaboration?\n\nThis will:\n• Stop live tracking\n• Generate final report\n• Request rating from business\n• Move to completed campaigns')) {
      alert(`Collaboration ${collabId} ended!\n\n📊 Final report generated\n⭐ Business rating requested\n✅ Moved to completed campaigns`);
    }
  };

  const renderRatingsOverview = () => (
    <div className="space-y-8">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-6 text-white text-center">
          <div className="text-4xl font-bold mb-2">{collaborations.stats?.overallRating || 4.9}</div>
          <div className="text-yellow-100 mb-2">⭐⭐⭐⭐⭐</div>
          <div className="text-sm opacity-90">Overall Rating</div>
          <div className="text-xs opacity-80 mt-1">Based on {collaborations.stats?.totalReviews || 23} reviews</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white text-center">
          <div className="text-3xl font-bold mb-2">{collaborations.stats?.completionRate || 100}%</div>
          <div className="text-green-100 mb-2">✅</div>
          <div className="text-sm opacity-90">Completion Rate</div>
          <div className="text-xs opacity-80 mt-1">All campaigns delivered</div>
        </div>

        <div className="bg-gradient-to-br from-blue-800 to-blue-600 rounded-xl p-6 text-white text-center">
          <div className="text-3xl font-bold mb-2">${(collaborations.stats?.totalEarned || 4250).toLocaleString()}</div>
          <div className="text-blue-100 mb-2">💰</div>
          <div className="text-sm opacity-90">Total Earned</div>
          <div className="text-xs opacity-80 mt-1">Across {collaborations.stats?.totalReviews || 23} campaigns</div>
        </div>

        <div className="bg-gradient-to-br from-red-600 to-red-500 rounded-xl p-6 text-white text-center">
          <div className="text-3xl font-bold mb-2">{collaborations.stats?.recommendationRate || 95}%</div>
          <div className="text-red-100 mb-2">👍</div>
          <div className="text-sm opacity-90">Recommended</div>
          <div className="text-xs opacity-80 mt-1">By businesses</div>
        </div>
      </div>

      {/* Detailed Ratings */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-blue-900 mb-6">Detailed Ratings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(collaborations.stats?.detailedRatings || {
            communication: 4.8,
            contentQuality: 5.0,
            timeliness: 4.9,
            professionalism: 4.7
          }).map(([category, rating]) => (
            <div key={category} className="text-center">
              <div className="text-xl font-bold text-blue-900">{rating}</div>
              <div className="text-yellow-500 my-1">⭐⭐⭐⭐⭐</div>
              <div className="text-sm text-gray-600 capitalize">
                {category.replace(/([A-Z])/g, ' $1').trim()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderActiveCollaborations = () => (
    <div className="space-y-6">
      {collaborations.active?.map((collab) => (
        <div
          key={collab.id}
          className={`rounded-xl p-6 border-2 ${
            collab.status === 'active'
              ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-300'
              : 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className={`text-lg font-bold ${collab.status === 'active' ? 'text-green-800' : 'text-yellow-800'}`}>
                {collab.title}
              </h3>
              <p className={`text-sm ${collab.status === 'active' ? 'text-green-700' : 'text-yellow-700'}`}>
                {collab.company} • Started {collab.startDate} • ${collab.budget.toLocaleString()}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              collab.status === 'active' ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
            }`}>
              {collab.status === 'active' ? 'Active' : 'Pending URL'}
            </span>
          </div>

          {collab.status === 'active' && collab.contentUrl && (
            <>
              <div className="bg-white/70 rounded-lg p-4 mb-4">
                <p className="text-sm mb-2">
                  <span className="font-semibold">Content URL:</span>{' '}
                  <a href={collab.contentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {collab.contentUrl}
                  </a>
                </p>
                <p className="text-sm mb-2"><span className="font-semibold">Posted:</span> {collab.postedDate}</p>
                <p className="text-sm"><span className="font-semibold">Status:</span> Live tracking active</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-white/80 rounded-lg">
                <div className="text-center">
                  <div className="font-bold text-green-700">{collab.liveStats.views.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Views</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-700">{collab.liveStats.likes}</div>
                  <div className="text-xs text-gray-600">Likes</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-700">{collab.liveStats.comments}</div>
                  <div className="text-xs text-gray-600">Comments</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-700">{collab.liveStats.engagement}%</div>
                  <div className="text-xs text-gray-600">Engagement</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleLiveTracking(collab.id)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
                >
                  🔴 Live Tracking
                </button>
                <button
                  onClick={() => handleUpdateUrl(collab.id)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
                >
                  📝 Update URL
                </button>
                <button
                  onClick={() => handleEndCollaboration(collab.id)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700"
                >
                  🏁 End Campaign
                </button>
              </div>
            </>
          )}

          {collab.status === 'pending-url' && (
            <div className="bg-white/70 rounded-lg p-4 mb-4">
              <p className="text-yellow-800 mb-4">
                <span className="font-semibold">Next Step:</span> {collab.message}
              </p>
              <div className="flex gap-2">
                <input
                  id={`url-input-${collab.id}`}
                  type="url"
                  placeholder="https://youtube.com/watch?v="
                  className="flex-1 px-3 py-2 border-2 border-yellow-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
                <button
                  onClick={() => handleSubmitUrl(collab.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  📤 Submit URL
                </button>
              </div>
            </div>
          )}
        </div>
      )) || (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-50">🚀</div>
          <h3 className="text-xl font-bold text-blue-900 mb-2">No active collaborations</h3>
          <p className="text-gray-600">Accepted invitations and ongoing campaigns will appear here.</p>
        </div>
      )}
    </div>
  );

  const renderCompletedCollaborations = () => (
    <div className="space-y-6">
      {collaborations.completed?.map((collab) => (
        <div key={collab.id} className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-blue-900">{collab.title}</h3>
              <p className="text-gray-600 text-sm">
                {collab.company} • Completed {collab.completedDate} • ${collab.earned.toLocaleString()} earned
              </p>
            </div>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
              Completed
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-white rounded-lg">
            <div className="text-center">
              <div className="font-bold text-blue-900">{(collab.performance.totalViews / 1000).toFixed(1)}K</div>
              <div className="text-xs text-gray-600">Total Views</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-blue-900">{collab.performance.engagements.toLocaleString()}</div>
              <div className="text-xs text-gray-600">Engagements</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-blue-900">{collab.performance.engagementRate}%</div>
              <div className="text-xs text-gray-600">Engagement Rate</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-blue-900">{collab.performance.rating}/5 ⭐</div>
              <div className="text-xs text-gray-600">Rating</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
              📊 Full Report
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
              📜 Certificate
            </button>
            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700">
              💬 Request Testimonial
            </button>
          </div>
        </div>
      )) || (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-50">🏆</div>
          <h3 className="text-xl font-bold text-blue-900 mb-2">No completed collaborations yet</h3>
          <p className="text-gray-600">Finished campaigns and their performance reports will appear here.</p>
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: 'ratings', label: 'Performance & Ratings', icon: '⭐' },
    { id: 'active', label: 'Active Collaborations', icon: '🚀' },
    { id: 'completed', label: 'Completed', icon: '🏆' }
  ];

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-4 text-center font-medium transition-all duration-200 border-b-2 ${
                activeTab === tab.id
                  ? 'text-blue-900 border-blue-900 bg-gray-50'
                  : 'text-gray-600 border-transparent hover:text-blue-900 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'ratings' && renderRatingsOverview()}
          {activeTab === 'active' && renderActiveCollaborations()}
          {activeTab === 'completed' && renderCompletedCollaborations()}
        </div>
      </div>
    </div>
  );
};

export default CollabSection;