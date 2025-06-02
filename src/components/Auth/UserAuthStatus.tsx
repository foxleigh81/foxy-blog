import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from './AuthModal';

const UserAuthStatus: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 mb-3">
            <strong>Join the conversation!</strong> Sign in to share your thoughts and engage with
            other readers.
          </p>
          <button
            onClick={() => setAuthModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Sign In to Comment
          </button>
        </div>

        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <p className="text-green-800">
        <strong>Welcome back, {profile?.username || user.email?.split('@')[0]}!</strong>
        {profile?.is_moderator && ' You have moderator privileges.'}
        {!profile?.is_moderator && profile?.is_trusted && ' You are a trusted contributor.'}
      </p>
    </div>
  );
};

export default UserAuthStatus;
