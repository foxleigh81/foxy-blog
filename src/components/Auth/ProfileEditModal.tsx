import React, { useState, useEffect } from 'react';
import { FaTimes, FaUser, FaImage, FaSave } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile } = useAuth();
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Initialize form with current profile data
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  const resetForm = () => {
    setUsername(profile?.username || '');
    setAvatarUrl(profile?.avatar_url || '');
    setError('');
    setMessage('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await updateProfile({
        username: username.trim(),
        avatar_url: avatarUrl.trim() || null,
      });

      setMessage('Profile updated successfully!');

      // Close modal after a short delay to show success message
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleClose} />

      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FaTimes size={20} />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Edit Profile</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Avatar URL (optional)
              </label>
              <div className="relative">
                <FaImage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="url"
                  id="avatarUrl"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Leave empty to use Gravatar or initials</p>
            </div>

            {/* Avatar preview */}
            {avatarUrl && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                <div className="flex items-center space-x-3">
                  <img
                    src={avatarUrl}
                    alt="Avatar preview"
                    className="w-16 h-16 rounded-full border-2 border-gray-200"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="text-sm text-gray-600">Avatar preview</span>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                {message}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-2 px-4 rounded-lg text-white font-medium transition-colors flex items-center justify-center ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  'Saving...'
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;
