'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FaUser,
  FaShieldAlt,
  FaStar,
  FaBan,
  FaClock,
  FaExclamationTriangle,
  FaTimes,
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

interface User {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  is_moderator: boolean;
  is_trusted: boolean;
  is_banned: boolean;
  suspended_until: string | null;
}

interface SuspendModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSuspend: (userId: string, suspendedUntil: string) => Promise<void>;
}

/**
 * Modal for setting suspension date
 */
const SuspendModal: React.FC<SuspendModalProps> = ({ user, isOpen, onClose, onSuspend }) => {
  const [suspendedUntil, setSuspendedUntil] = useState('');
  const [loading, setLoading] = useState(false);

  // Set default date to 7 days from now
  useEffect(() => {
    if (isOpen) {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      setSuspendedUntil(defaultDate.toISOString().split('T')[0]);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspendedUntil) return;

    setLoading(true);
    try {
      await onSuspend(user.id, suspendedUntil);
      onClose();
    } catch (error) {
      console.error('Error suspending user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FaTimes size={20} />
        </button>

        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Suspend User: {user.username || 'Anonymous User'}
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="suspendedUntil"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Suspended Until
              </label>
              <input
                type="date"
                id="suspendedUntil"
                value={suspendedUntil}
                onChange={(e) => setSuspendedUntil(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || !suspendedUntil}
                className={`flex-1 py-2 px-4 rounded-lg text-white font-medium transition-colors ${
                  loading || !suspendedUntil
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {loading ? 'Suspending...' : 'Suspend User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

/**
 * User management component for moderators
 * Allows trusting, suspending, and banning users
 */
const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [suspendModal, setSuspendModal] = useState<{ isOpen: boolean; user: User | null }>({
    isOpen: false,
    user: null,
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/moderator/users');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUserStatus = async (userId: string, updates: Partial<User>) => {
    setProcessingIds((prev) => new Set(prev).add(userId));

    try {
      const response = await fetch(`/api/moderator/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }

      // Update the user in the list
      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, ...updates } : user)));
    } catch (error) {
      console.error('Error updating user status:', error);
      setError('Failed to update user. Please try again.');
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleTrust = (userId: string) => {
    updateUserStatus(userId, { is_trusted: true });
  };

  const handleBan = (userId: string) => {
    updateUserStatus(userId, { is_banned: true });
  };

  const handleSuspend = async (userId: string, suspendedUntil: string) => {
    await updateUserStatus(userId, { suspended_until: suspendedUntil });
  };

  const handleUnsuspend = (userId: string) => {
    updateUserStatus(userId, { suspended_until: null });
  };

  const handleUnban = (userId: string) => {
    updateUserStatus(userId, { is_banned: false });
  };

  const handleUntrust = (userId: string) => {
    updateUserStatus(userId, { is_trusted: false });
  };

  const openSuspendModal = (user: User) => {
    setSuspendModal({ isOpen: true, user });
  };

  const closeSuspendModal = () => {
    setSuspendModal({ isOpen: false, user: null });
  };

  const getUserStatus = (user: User) => {
    if (user.is_banned) return 'banned';
    if (user.suspended_until && new Date(user.suspended_until) > new Date()) return 'suspended';
    if (user.is_trusted) return 'trusted';
    return 'normal';
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <FaExclamationTriangle className="mx-auto text-6xl text-red-300 mb-4" />
        <h3 className="text-xl font-semibold text-red-600 mb-2">Error</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={fetchUsers}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">User Management ({users.length})</h2>
        <button
          onClick={fetchUsers}
          className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => {
                const isProcessing = processingIds.has(user.id);
                const status = getUserStatus(user);

                return (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.avatar_url ? (
                          <Image
                            src={user.avatar_url}
                            alt={user.username || 'User'}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full object-cover mr-3"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center mr-3">
                            <FaUser className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.username || 'Anonymous User'}
                          </div>
                          <div className="text-sm text-gray-500">{user.id.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {user.is_moderator && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <FaShieldAlt className="mr-1" />
                            Moderator
                          </span>
                        )}
                        {status === 'trusted' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <FaStar className="mr-1" />
                            Trusted
                          </span>
                        )}
                        {status === 'banned' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <FaBan className="mr-1" />
                            Banned
                          </span>
                        )}
                        {status === 'suspended' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <FaClock className="mr-1" />
                            Suspended until {new Date(user.suspended_until!).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {!user.is_moderator && (
                          <>
                            {status === 'normal' && (
                              <>
                                <button
                                  onClick={() => handleTrust(user.id)}
                                  disabled={isProcessing}
                                  className={`flex items-center px-3 py-1 rounded text-sm font-medium transition-colors ${
                                    isProcessing
                                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                                  }`}
                                >
                                  <FaStar className="mr-1" />
                                  Trust
                                </button>
                                <button
                                  onClick={() => openSuspendModal(user)}
                                  disabled={isProcessing}
                                  className={`flex items-center px-3 py-1 rounded text-sm font-medium transition-colors ${
                                    isProcessing
                                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                      : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                  }`}
                                >
                                  <FaClock className="mr-1" />
                                  Suspend
                                </button>
                                <button
                                  onClick={() => handleBan(user.id)}
                                  disabled={isProcessing}
                                  className={`flex items-center px-3 py-1 rounded text-sm font-medium transition-colors ${
                                    isProcessing
                                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                                  }`}
                                >
                                  <FaBan className="mr-1" />
                                  Ban
                                </button>
                              </>
                            )}
                            {status === 'trusted' && (
                              <>
                                <button
                                  onClick={() => handleUntrust(user.id)}
                                  disabled={isProcessing}
                                  className={`flex items-center px-3 py-1 rounded text-sm font-medium transition-colors ${
                                    isProcessing
                                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >
                                  Untrust
                                </button>
                                <button
                                  onClick={() => openSuspendModal(user)}
                                  disabled={isProcessing}
                                  className={`flex items-center px-3 py-1 rounded text-sm font-medium transition-colors ${
                                    isProcessing
                                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                      : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                  }`}
                                >
                                  <FaClock className="mr-1" />
                                  Suspend
                                </button>
                                <button
                                  onClick={() => handleBan(user.id)}
                                  disabled={isProcessing}
                                  className={`flex items-center px-3 py-1 rounded text-sm font-medium transition-colors ${
                                    isProcessing
                                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                                  }`}
                                >
                                  <FaBan className="mr-1" />
                                  Ban
                                </button>
                              </>
                            )}
                            {status === 'suspended' && (
                              <>
                                <button
                                  onClick={() => handleUnsuspend(user.id)}
                                  disabled={isProcessing}
                                  className={`flex items-center px-3 py-1 rounded text-sm font-medium transition-colors ${
                                    isProcessing
                                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                  }`}
                                >
                                  Unsuspend
                                </button>
                                <button
                                  onClick={() => handleBan(user.id)}
                                  disabled={isProcessing}
                                  className={`flex items-center px-3 py-1 rounded text-sm font-medium transition-colors ${
                                    isProcessing
                                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                                  }`}
                                >
                                  <FaBan className="mr-1" />
                                  Ban
                                </button>
                              </>
                            )}
                            {status === 'banned' && (
                              <button
                                onClick={() => handleUnban(user.id)}
                                disabled={isProcessing}
                                className={`flex items-center px-3 py-1 rounded text-sm font-medium transition-colors ${
                                  isProcessing
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                }`}
                              >
                                Unban
                              </button>
                            )}
                          </>
                        )}
                        {user.is_moderator && (
                          <span className="text-gray-500 text-sm">Moderator</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <SuspendModal
        user={suspendModal.user!}
        isOpen={suspendModal.isOpen}
        onClose={closeSuspendModal}
        onSuspend={handleSuspend}
      />
    </div>
  );
};

export default UserManagement;
