import React, { useState, useEffect, useMemo } from 'react';
import { useDashboard } from '../../contexts/DashboardContext';
import apiService from '../../services/api';

const CampaignsSection = () => {
  const { campaigns, actions } = useDashboard();
  const [filters, setFilters] = useState({
    category: 'all',
    budget: 'all',
    platform: 'all',
    deadline: 'all'
  });

  // Fetch real campaigns from API
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        console.log('🔍 Fetching campaigns from API...');
        const result = await apiService.getCampaigns();
        
        if (result.success) {
          console.log('✅ Campaigns loaded:', result.campaigns.length);
          actions.setCampaigns(result.campaigns);
        } else {
          console.log('❌ No campaigns found');
          actions.setCampaigns([]);
        }
      } catch (error) {
        console.error('❌ Error fetching campaigns:', error);
        actions.setCampaigns([]);
      }
    };

    fetchCampaigns();
  }, [actions.setCampaigns]); // Proper dependency - now memoized so won't cause loops

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      if (filters.category !== 'all' && campaign.category !== filters.category) return false;
      if (filters.platform !== 'all' && campaign.platform !== filters.platform) return false;
      if (filters.budget !== 'all') {
        const budget = campaign.budget;
        switch (filters.budget) {
          case '100-500':
            if (budget < 100 || budget > 500) return false;
            break;
          case '500-1500':
            if (budget < 500 || budget > 1500) return false;
            break;
          case '1500+':
            if (budget < 1500) return false;
            break;
        }
      }
      return true;
    });
  }, [campaigns, filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const handleApplyCampaign = (campaignId, campaignTitle) => {
    alert(`Applying to: ${campaignTitle}\n\nThis will open the application form where you can:\n• Write a personalized proposal\n• Upload relevant portfolio samples\n• Set your collaboration terms\n• Submit your application`);
  };

  const handleViewDetails = (campaign) => {
    alert(`Viewing details for: ${campaign.title}\n\nThis will show:\n• Full campaign brief\n• Detailed requirements\n• Brand information\n• Sample content examples\n• Application timeline`);
  };

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'new':
        return 'bg-green-100 text-green-700';
      case 'urgent':
        return 'bg-yellow-100 text-yellow-700';
      case 'featured':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow-lg border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-blue-900">Available Campaigns</h2>
            <p className="text-gray-600 mt-1">Browse and apply to campaigns that match your profile</p>
          </div>
          <button className="text-blue-600 hover:text-blue-800 font-medium px-4 py-2 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
            View All
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="Fashion & Beauty">Fashion & Beauty</option>
            <option value="Lifestyle">Lifestyle</option>
            <option value="Technology">Technology</option>
            <option value="Food & Beverage">Food & Beverage</option>
          </select>

          <select
            value={filters.budget}
            onChange={(e) => handleFilterChange('budget', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Budgets</option>
            <option value="100-500">$100 - $500</option>
            <option value="500-1500">$500 - $1,500</option>
            <option value="1500+">$1,500+</option>
          </select>

          <select
            value={filters.platform}
            onChange={(e) => handleFilterChange('platform', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Platforms</option>
            <option value="Instagram">Instagram</option>
            <option value="TikTok">TikTok</option>
            <option value="YouTube">YouTube</option>
          </select>

          <select
            value={filters.deadline}
            onChange={(e) => handleFilterChange('deadline', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Deadlines</option>
            <option value="this-week">This week</option>
            <option value="this-month">This month</option>
            <option value="flexible">Flexible</option>
          </select>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="p-6 space-y-6">
        {filteredCampaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200 hover:-translate-y-1"
          >
            {/* Campaign Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-blue-900 mb-1">{campaign.title}</h3>
                <p className="text-gray-600 text-sm">
                  {campaign.company} {campaign.verified && '• Verified'}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getBadgeStyle(campaign.badge.type)}`}>
                {campaign.badge.label}
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-700 text-sm mb-4 leading-relaxed">{campaign.description}</p>

            {/* Campaign Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-white rounded-lg">
              <div className="text-center">
                <div className="font-bold text-blue-900">${campaign.budget.toLocaleString()}</div>
                <div className="text-xs text-gray-600">Budget</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-900">{campaign.platform}</div>
                <div className="text-xs text-gray-600">Platform</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-900">{campaign.deadline}</div>
                <div className="text-xs text-gray-600">Deadline</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-900">{campaign.applicants}</div>
                <div className="text-xs text-gray-600">Applicants</div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {campaign.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => handleApplyCampaign(campaign.id, campaign.title)}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Apply Now
              </button>
              <button
                onClick={() => handleViewDetails(campaign)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors"
              >
                View Details
              </button>
            </div>
          </div>
        ))}

        {filteredCampaigns.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 opacity-50">📢</div>
            <h3 className="text-xl font-bold text-blue-900 mb-2">No campaigns available yet</h3>
            <p className="text-gray-600">Campaigns will appear here when businesses post them. Check back soon!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CampaignsSection;