import React from 'react';

const Sidebar = () => {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-blue-900 mb-4">Quick Stats</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Profile Views</span>
            <span className="font-semibold text-blue-600">247</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Applications Sent</span>
            <span className="font-semibold text-green-600">12</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Response Rate</span>
            <span className="font-semibold text-purple-600">68%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">This Month</span>
            <span className="font-semibold text-amber-600">$1,250</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-blue-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-800">New campaign invitation received</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-800">Application approved for Beauty Campaign</p>
              <p className="text-xs text-gray-500">1 day ago</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-800">Profile viewed by EcoWear</p>
              <p className="text-xs text-gray-500">2 days ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tips & Recommendations */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="text-lg font-bold text-blue-900 mb-4">💡 Pro Tip</h3>
        <p className="text-sm text-gray-700 mb-3">
          Complete your portfolio with high-quality content samples to increase your chances of getting selected.
        </p>
        <button className="text-xs bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Update Portfolio
        </button>
      </div>
    </div>
  );
};

export default Sidebar;