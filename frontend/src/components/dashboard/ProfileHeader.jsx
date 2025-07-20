import React from 'react';
import { useDashboard } from '../../contexts/DashboardContext';

const ProfileHeader = () => {
  const { user } = useDashboard();

  return (
    <section className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Profile Avatar */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
          {user.avatar}
        </div>

        {/* Profile Info */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">{user.name}</h1>
          <p className="text-gray-600 text-lg mb-4">{user.bio}</p>
          
          {/* Profile Meta */}
          <div className="flex flex-wrap justify-center md:justify-start gap-6">
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-lg">📸</span>
              <span className="font-medium">{user.platforms.join(' • ')}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-lg">👥</span>
              <span className="font-medium">{user.followers} followers</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-lg">📊</span>
              <span className="font-medium">{user.engagement} engagement</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-lg">📍</span>
              <span className="font-medium">{user.location}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0">
          <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            Edit Profile
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProfileHeader;