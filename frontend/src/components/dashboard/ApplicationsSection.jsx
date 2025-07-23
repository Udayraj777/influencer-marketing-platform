import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../contexts/DashboardContext';
import apiService from '../../services/api';

const ApplicationsSection = () => {
  const { applications, actions } = useDashboard();
  const [activeTab, setActiveTab] = useState('applied');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching applied campaigns...');
        const result = await apiService.getMyApplications();
        
        if (result.success) {
          console.log('✅ Applications loaded:', result.applications.length);
          
          // Organize applications by status
          const organizedApplications = {
            applied: result.applications.filter(app => app.application.status === 'pending'),
            progress: result.applications.filter(app => app.application.status === 'accepted'),
            completed: result.applications.filter(app => app.application.status === 'completed' || app.status === 'completed')
          };
          
          actions.setApplications(organizedApplications);
        } else {
          console.log('❌ No applications found');
          actions.setApplications({ applied: [], progress: [], completed: [] });
        }
      } catch (error) {
        console.error('❌ Error fetching applications:', error);
        actions.setApplications({ applied: [], progress: [], completed: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [actions]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':
      case 'under-review':
        return 'bg-yellow-100 text-yellow-700';
      case 'accepted':
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleAction = (action, applicationId) => {
    switch (action) {
      case 'view':
        alert(`Viewing application ${applicationId} details!\n\nThis shows:\n• Application status\n• Proposal submitted\n• Brand feedback\n• Next steps`);
        break;
      case 'edit':
        alert(`Editing application ${applicationId}!\n\nThis allows you to:\n• Update your proposal\n• Modify your terms\n• Add portfolio items\n• Resubmit application`);
        break;
      case 'withdraw':
        alert(`Withdrawing application ${applicationId}!\n\nThis will:\n• Remove your application\n• Notify the brand\n• Free up the spot for others`);
        break;
      case 'message':
        alert(`Messaging brand for ${applicationId}!\n\nThis opens direct communication with the brand.`);
        break;
      case 'download':
        alert(`Downloading assets for ${applicationId}!\n\nThis includes:\n• Brand guidelines\n• Content templates\n• Required assets`);
        break;
      case 'upload':
        alert(`Uploading content for ${applicationId}!\n\nThis allows you to:\n• Upload final content\n• Submit for review\n• Track progress`);
        break;
      case 'report':
        alert(`Viewing performance report for ${applicationId}!\n\nThis shows detailed analytics and metrics.`);
        break;
      case 'certificate':
        alert(`Downloading certificate for ${applicationId}!\n\nThis includes your completion certificate and portfolio evidence.`);
        break;
      case 'review':
        alert(`Leaving review for ${applicationId}!\n\nThis allows you to rate the brand and collaboration experience.`);
        break;
      default:
        alert(`Action ${action} for ${applicationId} coming soon!`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const renderApplicationCard = (application, type) => (
    <div
      key={application._id}
      className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-blue-900 mb-1">{application.title}</h3>
          <p className="text-gray-600 text-sm">
            {type === 'applied' && `Applied ${formatDate(application.application?.appliedAt)} • ${application.business?.name}`}
            {type === 'progress' && `Started ${formatDate(application.application?.reviewedAt)} • ${application.business?.name}`}
            {type === 'completed' && `Completed ${formatDate(application.application?.reviewedAt)} • ${application.business?.name}`}
            {application.budget && ` • $${application.budget.total?.toLocaleString() || 'TBD'} budget`}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(application.application?.status)}`}>
          {application.application?.status === 'pending' ? 'Under Review' : 
           application.application?.status === 'accepted' ? 'Accepted' :
           application.application?.status === 'rejected' ? 'Rejected' : 
           application.application?.status || 'Unknown'}
        </span>
      </div>

      <p className="text-gray-700 text-sm mb-4">
        {application.description}
        {application.application?.proposedRate && (
          <span className="block mt-2 text-blue-600">
            <strong>Your proposed rate:</strong> ${application.application.proposedRate}
          </span>
        )}
        {application.application?.businessNotes && (
          <span className="block mt-2 text-orange-600">
            <strong>Business notes:</strong> {application.application.businessNotes}
          </span>
        )}
      </p>

      <div className="flex flex-wrap gap-2">
        {type === 'applied' && (
          <>
            <button
              onClick={() => handleAction('view', application._id)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              View Application
            </button>
            {application.application?.message && (
              <div className="px-4 py-2 bg-blue-50 rounded-lg text-sm">
                <strong>Your message:</strong> {application.application.message.length > 100 ? 
                  `${application.application.message.substring(0, 100)}...` : 
                  application.application.message}
              </div>
            )}
          </>
        )}

        {type === 'progress' && (
          <>
            <button
              onClick={() => handleAction('view', application.id)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              View Brief
            </button>
            <button
              onClick={() => handleAction('download', application.id)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Download Assets
            </button>
            <button
              onClick={() => handleAction('upload', application.id)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Upload Content
            </button>
          </>
        )}

        {type === 'completed' && (
          <>
            <button
              onClick={() => handleAction('report', application.id)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              View Report
            </button>
            <button
              onClick={() => handleAction('certificate', application.id)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Download Certificate
            </button>
            <button
              onClick={() => handleAction('review', application.id)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Leave Review
            </button>
          </>
        )}
      </div>
    </div>
  );

  const tabs = [
    { id: 'applied', label: 'Applied', count: applications.applied?.length || 0 },
    { id: 'progress', label: 'In Progress', count: applications.progress?.length || 0 },
    { id: 'completed', label: 'Completed', count: applications.completed?.length || 0 }
  ];

  return (
    <section className="bg-white rounded-2xl shadow-lg border border-gray-100">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`flex-1 px-6 py-4 text-center font-medium transition-all duration-200 border-b-2 ${
              activeTab === tab.id
                ? 'text-blue-900 border-blue-900 bg-gray-50'
                : 'text-gray-600 border-transparent hover:text-blue-900 hover:border-gray-300'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className="ml-2 px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your applications...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === 'applied' && applications.applied?.map(app => renderApplicationCard(app, 'applied'))}
            {activeTab === 'progress' && applications.progress?.map(app => renderApplicationCard(app, 'progress'))}
            {activeTab === 'completed' && applications.completed?.map(app => renderApplicationCard(app, 'completed'))}
            
            {/* Empty states */}
            {activeTab === 'applied' && applications.applied?.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 opacity-50">📝</div>
                <h3 className="text-xl font-bold text-blue-900 mb-2">No applications yet</h3>
                <p className="text-gray-600">When you apply to campaigns, they'll appear here for tracking.</p>
              </div>
            )}
            
            {activeTab === 'progress' && applications.progress?.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 opacity-50">⏳</div>
                <h3 className="text-xl font-bold text-blue-900 mb-2">No campaigns in progress</h3>
                <p className="text-gray-600">Accepted campaigns will appear here for management.</p>
              </div>
            )}
            
            {activeTab === 'completed' && applications.completed?.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 opacity-50">✅</div>
                <h3 className="text-xl font-bold text-blue-900 mb-2">No completed campaigns</h3>
                <p className="text-gray-600">Finished campaigns will appear here with performance data.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ApplicationsSection;