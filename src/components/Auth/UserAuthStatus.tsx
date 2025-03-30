'use client';

import React, { useState } from 'react';
import { FaUser } from 'react-icons/fa';
import { useAuth } from './AuthProvider';
import AuthModal from './AuthModal';

interface UserAuthStatusProps {
  className?: string;
}

const UserAuthStatus: React.FC<UserAuthStatusProps> = ({ className = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, profile, signOut, isLoading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Don't show anything while loading
  if (isLoading) {
    return <div className={`h-8 w-full bg-gray-100 animate-pulse rounded ${className}`} />;
  }

  // User is logged in
  if (user && profile) {
    return (
      <div
        className={`flex items-center justify-between p-2 bg-gray-50 rounded-lg shadow-sm ${className}`}
      >
        <div className="flex items-center space-x-2">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <FaUser className="w-4 h-4" />
            </div>
          )}
          <div>
            <p className="text-sm font-medium">{profile.display_name}</p>
            {profile.is_moderator && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                Moderator
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="text-xs text-gray-700 hover:text-red-600 transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  // User is not logged in
  return (
    <>
      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default UserAuthStatus;
