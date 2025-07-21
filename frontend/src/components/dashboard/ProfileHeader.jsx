import React from 'react';

const ProfileHeader = ({ profile }) => {
  if (!profile) {
    return (
      <section className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-300 animate-pulse"></div>
          <div className="flex-1">
            <div className="h-8 bg-gray-300 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded w-64 animate-pulse"></div>
          </div>
        </div>
      </section>
    );
  }

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
  };

  const formatFollowers = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count?.toString() || '0';
  };

  return (
    <section className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Profile Avatar */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
          {profile.profilePicture ? (
            <img 
              src={profile.profilePicture} 
              alt={profile.fullName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            getInitials(profile.fullName)
          )}
        </div>

        {/* Profile Info */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">{profile.fullName}</h1>
          <p className="text-gray-600 text-lg mb-4">{profile.bio}</p>
          
          {/* Profile Meta */}
          <div className="flex flex-wrap justify-center md:justify-start gap-6">
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-lg">📸</span>
              <span className="font-medium">
                {profile.socialLinks?.primaryPlatform || 'Platform'} 
                {profile.socialLinks?.secondaryPlatform && ` • ${profile.socialLinks.secondaryPlatform}`}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-lg">👥</span>
              <span className="font-medium">{formatFollowers(profile.socialLinks?.followerCount)} followers</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-lg">📊</span>
              <span className="font-medium">{profile.contentInfo?.engagementRate || 0}% engagement</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-lg">📍</span>
              <span className="font-medium">{profile.contentInfo?.primaryLocation || 'Location'}</span>
            </div>
          </div>

          {/* Niche Tags */}
          <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {profile.socialLinks?.contentNiche || 'Content Niche'}
            </span>
            {profile.contentInfo?.categories?.slice(0, 2).map((category, index) => (
              <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                {category}
              </span>
            ))}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="flex-shrink-0 text-center">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-2xl font-bold text-blue-600">{profile.stats?.completedCampaigns || 0}</div>
              <div className="text-sm text-gray-600">Campaigns</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">${profile.stats?.totalEarnings || 0}</div>
              <div className="text-sm text-gray-600">Earned</div>
            </div>
          </div>
          <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            Edit Profile
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProfileHeader;