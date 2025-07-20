import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../contexts/DashboardContext';

const ApplicationsSection = () => {
  const { applications, actions } = useDashboard();
  const [activeTab, setActiveTab] = useState('applied');

  const mockApplications = {
    applied: [
      {
        id: 'app_001',
        title: 'Tech Product Review Campaign',
        company: 'TechCorp Inc.',
        appliedDate: '2 days ago',
        budget: 1500,
        status: 'pending',
        statusText: 'Pending',
        description: 'Waiting for brand response • You\'re in the top 5 candidates • Expected response: 3 days'
      },
      {
        id: 'app_002',
        title: 'Holiday Lifestyle Campaign',
        company: 'LifeStyle Hub',
        appliedDate: '4 days ago',
        budget: 950,
        status: 'under-review',
        statusText: 'Under Review',
        description: 'Brand is reviewing applications • 12 total applicants • Interview may be required'
      },
      {
        id: 'app_003',
        title: 'Fitness Equipment Review',
        company: 'FitLife Gear',
        appliedDate: '3 days ago',
        budget: 750,
        status: 'rejected',
        statusText: 'Not Selected',
        description: 'Brand chose other candidates • Feedback: Great portfolio, looking for fitness-focused creators next time'
      }
    ],
    progress: [
      {
        id: 'prog_001',
        title: 'Fashion Week Coverage',
        company: 'Fashion Nova',
        startDate: '3 days ago',
        budget: 1800,
        status: 'in-progress',
        statusText: 'In Progress',
        description: 'Content creation deadline: 5 days remaining • Phase 2 of 3'
      },
      {
        id: 'prog_002',
        title: 'Eco-Friendly Product Launch',
        company: 'GreenLife Co.',
        startDate: '1 week ago',
        budget: 1200,
        status: 'in-progress',
        statusText: 'In Progress',
        description: 'Final review stage • Awaiting brand approval on submitted content'
      }
    ],
    completed: [
      {
        id: 'comp_001',
        title: 'Summer Fitness Challenge',
        company: 'FitLife',
        completedDate: '2 weeks ago',
        earned: 850,
        status: 'completed',
        statusText: 'Completed',
        performance: '15.2K reach, 1,240 engagements',
        rating: 5
      },
      {
        id: 'comp_002',
        title: 'Tech Product Unboxing',
        company: 'TechReviews',
        completedDate: '1 month ago',
        earned: 1200,
        status: 'completed',
        statusText: 'Completed',
        performance: '28.5K reach, 2,890 engagements',
        rating: 4.8
      },
      {
        id: 'comp_003',
        title: 'Beauty Product Review Series',
        company: 'GlowUp Beauty',
        completedDate: '6 weeks ago',
        earned: 2100,
        status: 'completed',
        statusText: 'Completed',
        performance: '42.1K reach, 4,750 engagements',
        rating: 5
      }
    ]
  };

  useEffect(() => {
    actions.setApplications(mockApplications);
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

  const renderApplicationCard = (application, type) => (
    <div
      key={application.id}
      className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-blue-900 mb-1">{application.title}</h3>
          <p className="text-gray-600 text-sm">
            {type === 'applied' && `Applied ${application.appliedDate} • ${application.company}`}
            {type === 'progress' && `Started ${application.startDate} • ${application.company}`}
            {type === 'completed' && `Completed ${application.completedDate} • ${application.company}`}
            {(type === 'applied' || type === 'progress') && ` • $${application.budget.toLocaleString()} budget`}
            {type === 'completed' && ` • $${application.earned.toLocaleString()} earned`}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(application.status)}`}>
          {application.statusText}
        </span>
      </div>

      <p className="text-gray-700 text-sm mb-4">
        {application.description}
        {type === 'completed' && application.performance && (
          <span className="block mt-1">Campaign performance: {application.performance} • Rating: {application.rating}/5 stars</span>
        )}
      </p>

      <div className="flex flex-wrap gap-2">
        {type === 'applied' && (
          <>
            <button
              onClick={() => handleAction('view', application.id)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              View Application
            </button>
            <button
              onClick={() => handleAction('edit', application.id)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Edit Proposal
            </button>
            <button
              onClick={() => handleAction('withdraw', application.id)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Withdraw
            </button>
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
    { id: 'applied', label: 'Applied', count: mockApplications.applied.length },
    { id: 'progress', label: 'In Progress', count: mockApplications.progress.length },
    { id: 'completed', label: 'Completed', count: mockApplications.completed.length }
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
        <div className="space-y-4">
          {activeTab === 'applied' && mockApplications.applied.map(app => renderApplicationCard(app, 'applied'))}
          {activeTab === 'progress' && mockApplications.progress.map(app => renderApplicationCard(app, 'progress'))}
          {activeTab === 'completed' && mockApplications.completed.map(app => renderApplicationCard(app, 'completed'))}
        </div>

        {mockApplications[activeTab].length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 opacity-50">📋</div>
            <h3 className="text-xl font-bold text-blue-900 mb-2">No applications yet</h3>
            <p className="text-gray-600">
              {activeTab === 'applied' && 'Start applying to campaigns to see them here.'}
              {activeTab === 'progress' && 'Applications in progress will appear here.'}
              {activeTab === 'completed' && 'Completed campaigns will be shown here.'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ApplicationsSection;