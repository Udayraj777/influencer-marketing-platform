import React from 'react';

const CollabHub = ({ onSwitchToCollab }) => {
  const features = [
    {
      icon: '📝',
      title: 'Active Collaborations',
      description: 'Track ongoing projects',
      gradient: 'from-pink-500 to-pink-600'
    },
    {
      icon: '⭐',
      title: 'Your Ratings',
      description: 'View business feedback',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      icon: '📊',
      title: 'Performance',
      description: 'Real-time analytics',
      gradient: 'from-cyan-500 to-cyan-600'
    }
  ];

  return (
    <section className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
              <span>🎯</span>
              Collaboration Hub
            </h2>
            <p className="text-gray-600 mt-1">
              Manage your collaborations, ratings, and active campaigns
            </p>
          </div>
          <button
            onClick={onSwitchToCollab}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            📊 View Collab Dashboard
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {/* Tip Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <div className="font-semibold text-blue-900 mb-2">Tip</div>
              <div className="text-blue-800 text-sm">
                Click the "Collab" tab above to access your collaboration management dashboard, 
                view your ratings, and track active campaigns.
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${feature.gradient} rounded-xl p-6 text-white text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <div className="font-semibold text-lg mb-2">{feature.title}</div>
              <div className="text-sm opacity-90">{feature.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CollabHub;