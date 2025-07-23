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
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [applicationData, setApplicationData] = useState({
    proposedRate: '',
    message: '',
    portfolioLinks: []
  });
  const [submitting, setSubmitting] = useState(false);

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
    const campaign = campaigns.find(c => c.id === campaignId);
    setSelectedCampaign(campaign);
    setShowApplicationModal(true);
    setApplicationData({
      proposedRate: '',
      message: '',
      portfolioLinks: []
    });
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    
    if (!selectedCampaign || !applicationData.message.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    
    try {
      const result = await apiService.applyToCampaign(selectedCampaign.id, {
        proposedRate: parseFloat(applicationData.proposedRate) || 0,
        message: applicationData.message,
        portfolioLinks: applicationData.portfolioLinks.filter(link => link.trim())
      });

      if (result.success) {
        alert('Application submitted successfully!');
        setShowApplicationModal(false);
        setSelectedCampaign(null);
        // Refresh campaigns to update application count
        const refreshResult = await apiService.getCampaigns();
        if (refreshResult.success) {
          actions.setCampaigns(refreshResult.campaigns);
        }
      } else {
        alert(result.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Application error:', error);
      alert(error.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplicationInputChange = (e) => {
    const { name, value } = e.target;
    setApplicationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addPortfolioLink = () => {
    setApplicationData(prev => ({
      ...prev,
      portfolioLinks: [...prev.portfolioLinks, '']
    }));
  };

  const updatePortfolioLink = (index, value) => {
    setApplicationData(prev => ({
      ...prev,
      portfolioLinks: prev.portfolioLinks.map((link, i) => i === index ? value : link)
    }));
  };

  const removePortfolioLink = (index) => {
    setApplicationData(prev => ({
      ...prev,
      portfolioLinks: prev.portfolioLinks.filter((_, i) => i !== index)
    }));
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

      {/* Application Modal */}
      {showApplicationModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-blue-900">Apply to Campaign</h3>
              <button 
                onClick={() => setShowApplicationModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Campaign Info */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h4 className="font-bold text-blue-900 mb-2">{selectedCampaign.title}</h4>
              <p className="text-blue-700 text-sm mb-2">{selectedCampaign.company}</p>
              <div className="flex gap-4 text-sm">
                <span><strong>Budget:</strong> ${selectedCampaign.budget?.toLocaleString()}</span>
                <span><strong>Platform:</strong> {selectedCampaign.platform}</span>
                <span><strong>Deadline:</strong> {selectedCampaign.deadline}</span>
              </div>
            </div>

            <form onSubmit={handleSubmitApplication} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proposed Rate (Optional)
                </label>
                <input
                  type="number"
                  name="proposedRate"
                  value={applicationData.proposedRate}
                  onChange={handleApplicationInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your proposed rate in USD"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Message *
                </label>
                <textarea
                  name="message"
                  value={applicationData.message}
                  onChange={handleApplicationInputChange}
                  rows="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tell the business why you're perfect for this campaign. Include your experience, content style, and how you'll approach this collaboration..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Portfolio Links (Optional)
                </label>
                {applicationData.portfolioLinks.map((link, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => updatePortfolioLink(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://instagram.com/p/example or https://tiktok.com/@user/video"
                    />
                    <button
                      type="button"
                      onClick={() => removePortfolioLink(index)}
                      className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addPortfolioLink}
                  className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50"
                >
                  + Add Portfolio Link
                </button>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowApplicationModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-green-400 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default CampaignsSection;