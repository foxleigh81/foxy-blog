import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from './AuthModal';
import { FaBan, FaClock } from 'react-icons/fa';

// Utility function to check if user is currently suspended
const isUserSuspended = (suspendedUntil: string | null): boolean => {
  if (!suspendedUntil) return false;
  return new Date(suspendedUntil) > new Date();
};

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

  // Check user status
  const isBanned = profile?.is_banned === true;
  const isSuspended = isUserSuspended(profile?.suspended_until || null);

  // Show banned status
  if (isBanned) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <FaBan className="text-red-500 mr-2" />
          <div>
            <p className="text-red-800 font-medium">Account Banned</p>
            <p className="text-red-700 text-sm">
              Your account has been banned. You cannot participate in discussions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show suspended status
  if (isSuspended && profile?.suspended_until) {
    const suspensionEndDate = new Date(profile.suspended_until).toLocaleDateString();
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <FaClock className="text-orange-500 mr-2" />
          <div>
            <p className="text-orange-800 font-medium">Account Suspended</p>
            <p className="text-orange-700 text-sm">
              Your account is suspended until {suspensionEndDate}. You cannot comment during this
              time.
            </p>
          </div>
        </div>
      </div>
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
