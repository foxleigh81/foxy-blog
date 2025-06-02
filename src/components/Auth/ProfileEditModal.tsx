import React, { useState, useEffect } from 'react';
import { FaTimes, FaUser, FaUpload, FaSave, FaTrash } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase-client';
import Image from 'next/image';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, updateProfile } = useAuth();
  const [username, setUsername] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const supabase = createClient();

  // Initialize form with current profile data
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setAvatarPreview(profile.avatar_url || '');
    }
  }, [profile]);

  const resetForm = () => {
    setUsername(profile?.username || '');
    setAvatarFile(null);
    setAvatarPreview(profile?.avatar_url || '');
    setError('');
    setMessage('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be smaller than 5MB');
        return;
      }

      setAvatarFile(file);
      setError('');

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!user) return null;

    setUploading(true);
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from('user-avatars').getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = async () => {
    if (!profile?.avatar_url) return;

    try {
      // Extract filename from URL for deletion
      const urlParts = profile.avatar_url.split('/');
      const fileName = urlParts[urlParts.length - 1];

      // Delete from storage
      await supabase.storage.from('user-avatars').remove([fileName]);

      // Update profile
      await updateProfile({
        avatar_url: null,
      });

      setAvatarPreview('');
      setMessage('Avatar removed successfully!');

      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      console.error('Error removing avatar:', err);
      setError('Failed to remove avatar');
    }
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
      let avatarUrl = profile?.avatar_url;

      // Upload new avatar if file is selected
      if (avatarFile) {
        // Delete old avatar if it exists
        if (profile?.avatar_url) {
          const urlParts = profile.avatar_url.split('/');
          const oldFileName = urlParts[urlParts.length - 1];
          await supabase.storage.from('user-avatars').remove([oldFileName]);
        }

        // Upload new avatar
        avatarUrl = await uploadAvatar(avatarFile);
      }

      await updateProfile({
        username: username.trim(),
        avatar_url: avatarUrl,
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
          <h2 className="text-2xl font-bold mb-6 text-center text-black">Edit Profile</h2>

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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-2">
                Avatar Image
              </label>
              <div className="space-y-3">
                <div className="relative">
                  <FaUpload className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="file"
                    id="avatar"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500">Upload an image file (max 5MB)</p>
              </div>
            </div>

            {/* Avatar preview */}
            {avatarPreview && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                <div className="flex items-center space-x-3">
                  <Image
                    src={avatarPreview}
                    alt="Avatar preview"
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full border-2 border-gray-200 object-cover"
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiNmM2Y0ZjYiLz4KPHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxNiIgeT0iMTYiPgo8cGF0aCBkPSJNMTYgMTJDMjAuNDE4MyAxMiAyNCA4LjQxODMgMjQgNEMyNCA0LjQxODMgMjAuNDE4MyAwIDE2IDBDMTEuNTgxNyAwIDggLTQuNDE4MyA4IDRDOCA4LjQxODMgMTEuNTgxNyAxMiAxNiAxMloiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI4IDI4SDRDMi44OTU0MyAyNy45OTk2IDIuMDIyMjggMjcuNDA1MiAyIDI2LjM2QzEuOTk5NjMgMjUuMzE1MiAzLjg5NTc5IDE4LjAwMSAxNiAxOC4wMDFDMjguMTA0MiAxOC4wMDEgMzAuMDAwNCAyNS4zMTUyIDMwIDI2LjM2QzI5Ljk5NzggMjcuNDA1MiAyOS4xMDQ1IDI3Ljk5OTYgMjggMjhaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo8L3N2Zz4="
                    priority
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="flex-1">
                    <span className="text-sm text-gray-600">Current avatar</span>
                    {profile?.avatar_url && (
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="block mt-1 text-xs text-red-600 hover:text-red-800 flex items-center"
                      >
                        <FaTrash className="mr-1" />
                        Remove avatar
                      </button>
                    )}
                  </div>
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
                disabled={loading || uploading}
                className={`flex-1 py-2 px-4 rounded-lg text-white font-medium transition-colors flex items-center justify-center ${
                  loading || uploading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading || uploading ? (
                  uploading ? (
                    'Uploading...'
                  ) : (
                    'Saving...'
                  )
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
