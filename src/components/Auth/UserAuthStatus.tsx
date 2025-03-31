'use client';

import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import AuthModal from './AuthModal';

export function UserAuthStatus() {
  const { user, profile, signOut } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  if (!user) {
    return (
      <>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Sign In
        </button>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <img
          src={
            profile?.avatar_url ||
            `https://www.gravatar.com/avatar/${user.email?.toLowerCase().trim()}`
          }
          alt={profile?.username || 'User avatar'}
          className="h-8 w-8 rounded-full"
        />
        <span className="text-sm font-medium text-gray-700">
          {profile?.username || 'Anonymous'}
        </span>
      </div>
      <button
        onClick={() => signOut()}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Sign Out
      </button>
    </div>
  );
}

export default UserAuthStatus;
