import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../contexts/DashboardContext';

const InvitationsSection = () => {
  const { invitations, actions } = useDashboard();

  const mockInvitations = [
    {
      id: 'inv_001',
      title: 'Summer Beauty Collection Campaign',
      company: 'GlowCosmetics',
      campaign: 'Summer Beauty Collection Launch',
      budget: 1200,
      message: 'Hi Sarah! We\'d love to collaborate with you on our summer campaign. Your beauty content perfectly aligns with our brand values and aesthetic.',
      type: 'collaboration',
      receivedDate: '2 days ago'
    },
    {
      id: 'inv_002',
      title: 'Tech Product Review Partnership',
      company: 'TechCorp Inc.',
      campaign: 'Latest Smartphone Review',
      budget: 1500,
      message: 'We noticed your tech content and would like to partner with you for our latest smartphone launch. Your audience engagement is impressive!',
      type: 'collaboration',
      receivedDate: '1 day ago'
    }
  ];

  useEffect(() => {
    actions.setInvitations(mockInvitations);
  }, [actions]);

  const handleAcceptInvitation = (invitation) => {
    // Transform invitation to collaboration format
    const collaboration = {
      id: invitation.id,
      title: invitation.title,
      company: invitation.company,
      campaign: invitation.campaign,
      budget: invitation.budget,
      status: 'pending-url',
      statusText: 'Pending URL',
      startDate: new Date().toISOString(),
      type: 'active'
    };

    actions.acceptInvitation(collaboration);
    
    alert(`Collaboration invite accepted!\n\nInvite: ${invitation.title}\nCompany: ${invitation.company}\n\nThis will:\n• Confirm your participation\n• Start the collaboration\n• Move to active collaborations\n• Enable content URL submission`);
  };

  const handleDeclineInvitation = (invitationId, title) => {
    actions.declineInvitation(invitationId);
    
    alert(`Collaboration invite declined!\n\nInvite: ${title}\n\nThis will:\n• Politely decline the collaboration\n• Archive the invitation\n• Keep professional relationship`);
  };

  const handleDiscussInvitation = (invitation) => {
    alert(`Opening discussion for: ${invitation.title}\n\nThis will:\n• Open direct messaging with ${invitation.company}\n• Allow you to negotiate terms\n• Ask questions about the campaign\n• Discuss timeline and requirements`);
  };

  return (
    <section className="bg-white rounded-2xl shadow-lg border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">Direct Invitations</h2>
          <p className="text-gray-600 mt-1">Collaboration invites from businesses</p>
        </div>
      </div>

      <div className="p-6">
        {invitations.length > 0 ? (
          <div className="space-y-6">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-amber-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
              >
                {/* Invitation Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-amber-800 mb-1">{invitation.title}</h3>
                    <p className="text-amber-700 text-sm">{invitation.company}</p>
                  </div>
                  <span className="bg-amber-800 text-amber-50 px-3 py-1 rounded-full text-xs font-semibold">
                    Collaboration Invite
                  </span>
                </div>

                {/* Invitation Details */}
                <div className="bg-white/70 rounded-lg p-4 mb-4 space-y-2">
                  <p className="text-sm">
                    <span className="font-semibold text-amber-900">Campaign:</span> {invitation.campaign}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold text-amber-900">Budget:</span> ${invitation.budget.toLocaleString()}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold text-amber-900">Received:</span> {invitation.receivedDate}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold text-amber-900">Message:</span> {invitation.message}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleAcceptInvitation(invitation)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Accept Invite
                  </button>
                  <button
                    onClick={() => handleDeclineInvitation(invitation.id, invitation.title)}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleDiscussInvitation(invitation)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Discuss Terms
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 opacity-50">💌</div>
            <h3 className="text-xl font-bold text-blue-900 mb-2">No invitations yet</h3>
            <p className="text-gray-600">
              Direct collaboration invites from businesses will appear here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default InvitationsSection;