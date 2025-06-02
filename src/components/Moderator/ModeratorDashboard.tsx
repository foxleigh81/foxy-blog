'use client';

import React, { useState } from 'react';
import { FaComments, FaUsers } from 'react-icons/fa';
import ModerationQueue from './ModerationQueue';

/**
 * Main moderator dashboard with tabbed interface
 * Contains moderation queue and user management sections
 */
const ModeratorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'queue' | 'users'>('queue');

  const tabs = [
    {
      id: 'queue' as const,
      label: 'Moderation Queue',
      icon: <FaComments className="mr-2" />,
      component: <ModerationQueue />,
    },
    {
      id: 'users' as const,
      label: 'Manage Users',
      icon: <FaUsers className="mr-2" />,
      component: (
        <div className="text-center py-12">
          <FaUsers className="mx-auto text-6xl text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">User Management</h3>
          <p className="text-gray-500">Coming soon - Suspend and ban users</p>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">{tabs.find((tab) => tab.id === activeTab)?.component}</div>
    </div>
  );
};

export default ModeratorDashboard;
