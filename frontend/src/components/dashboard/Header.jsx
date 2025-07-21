import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../../contexts/DashboardContext';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ currentSection, onSectionChange }) => {
  const { user, stats } = useDashboard();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'collab', label: 'Collab', icon: '🤝' },
    { id: 'messages', label: 'Messages', icon: '💬' }
  ];

  const notifications = [
    { id: 1, text: 'New collaboration invite from GlowCosmetics', type: 'invite' },
    { id: 2, text: 'Application update: Fashion Week', type: 'update' },
    { id: 3, text: 'Message from TechCorp Inc.', type: 'message' },
    { id: 4, text: 'Profile view by Lifestyle Co.', type: 'view' }
  ];

  return (
    <header className="bg-gradient-to-r from-blue-800 to-blue-600 text-white shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="#" className="text-2xl font-bold hover:text-blue-200 transition-colors">
              Upsaleit
            </a>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentSection === item.id
                    ? 'bg-white/20 backdrop-blur-sm'
                    : 'hover:bg-white/10'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Header Actions */}
          <div className="flex items-center space-x-4">
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Logout
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <span className="text-xl">🔔</span>
                {stats.newInvitations > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {stats.newInvitations}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                      >
                        <p className="text-sm text-gray-800">{notification.text}</p>
                        <span className="text-xs text-gray-500 capitalize">{notification.type}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 text-center border-t">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View All
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-3 cursor-pointer hover:bg-white/10 rounded-lg p-2 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center font-bold border-2 border-white/20">
                {user.avatar}
              </div>
              <div className="hidden sm:block">
                <p className="font-medium">{user.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-white/20">
        <div className="flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`flex-1 flex items-center justify-center space-x-1 py-3 ${
                currentSection === item.id
                  ? 'bg-white/20'
                  : 'hover:bg-white/10'
              }`}
            >
              <span>{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;