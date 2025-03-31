'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from './AuthProvider';
import { FaUser, FaEnvelope } from 'react-icons/fa';
import AvatarEditor from 'react-avatar-editor';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, updateProfile } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [zoom, setZoom] = useState(1);
  const avatarEditorRef = useRef<AvatarEditor>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize form with current user data when profile changes or modal opens
  React.useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setEmail(user?.email || '');
    }
  }, [profile, user, isOpen]);

  // Create Supabase client for storage operations
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      let avatarUrl = profile?.avatar_url;

      // If a new avatar was uploaded and cropped
      if (avatar && avatarEditorRef.current) {
        try {
          setIsUploading(true);

          // Get the cropped canvas from the editor
          const canvas = avatarEditorRef.current.getImageScaledToCanvas();

          // Resize to 50x50 and convert to JPEG with 70% quality
          const resizedCanvas = document.createElement('canvas');
          resizedCanvas.width = 50;
          resizedCanvas.height = 50;
          const ctx = resizedCanvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(canvas, 0, 0, 50, 50);

            // Convert to blob
            const blob = await new Promise<Blob>((resolve) => {
              resizedCanvas.toBlob(
                (blob) => {
                  if (blob) resolve(blob);
                  else resolve(new Blob([]));
                },
                'image/jpeg',
                0.7
              );
            });

            // Create a unique filename
            const fileName = `avatar-${user?.id}-${Date.now()}.jpg`;

            // Upload to Supabase storage
            const { error: uploadError } = await supabase.storage
              .from('user-avatars')
              .upload(fileName, blob, {
                contentType: 'image/jpeg',
                upsert: true,
              });

            if (uploadError) {
              console.error('Avatar upload error:', uploadError);
              throw new Error(`Error uploading avatar: ${uploadError.message}`);
            }

            // Get the public URL
            const { data: urlData } = supabase.storage.from('user-avatars').getPublicUrl(fileName);
            avatarUrl = urlData.publicUrl;
          }
        } catch (avatarError) {
          console.error('Error processing avatar:', avatarError);
          setError(avatarError instanceof Error ? avatarError.message : 'Failed to process avatar');
          setIsSubmitting(false);
          setIsUploading(false);
          return;
        } finally {
          setIsUploading(false);
        }
      }

      // Update the profile with the new information
      try {
        await updateProfile({
          username,
          avatar_url: avatarUrl,
        });
      } catch (profileError) {
        console.error('Profile update error:', profileError);
        setError(profileError instanceof Error ? profileError.message : 'Failed to update profile');
        setIsSubmitting(false);
        return;
      }

      // Update email if it has changed
      if (email !== user?.email) {
        try {
          const { error: emailError } = await supabase.auth.updateUser({ email });
          if (emailError) {
            console.error('Email update error:', emailError);
            throw new Error(`Error updating email: ${emailError.message}`);
          }
        } catch (emailError) {
          console.error('Email update error:', emailError);
          setError(emailError instanceof Error ? emailError.message : 'Failed to update email');
          setIsSubmitting(false);
          return;
        }
      }

      onClose();
    } catch (error) {
      console.error('Error updating profile (general catch):', error);
      setError(
        error instanceof Error ? error.message : 'An error occurred while updating your profile'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !user || !profile) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Edit Profile</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="avatar" className="block mb-2 text-sm font-medium">
                Profile Picture
              </label>
              <div className="flex flex-col items-center">
                <div className="mb-4 border rounded-lg overflow-hidden">
                  {avatar ? (
                    <AvatarEditor
                      ref={avatarEditorRef}
                      image={avatar}
                      width={200}
                      height={200}
                      border={0}
                      borderRadius={100}
                      color={[255, 255, 255, 0.8]}
                      scale={zoom}
                    />
                  ) : (
                    <div className="w-200 h-200 bg-gray-200 flex items-center justify-center">
                      <img
                        src={profile.avatar_url || '/default-avatar.svg'}
                        alt="Current avatar"
                        className="max-w-full max-h-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/200?text=Avatar';
                        }}
                      />
                    </div>
                  )}
                </div>

                {avatar && (
                  <div className="w-full mb-4">
                    <label className="block text-sm font-medium mb-1">Zoom</label>
                    <input
                      type="range"
                      min="1"
                      max="2"
                      step="0.01"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                )}

                <div className="flex justify-center">
                  <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-300">
                    {avatar ? 'Change Image' : 'Select Image'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="username" className="block mb-2 text-sm font-medium">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="username"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                  placeholder="Your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="email" className="block mb-2 text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {email !== user.email && (
                <p className="mt-1 text-xs text-amber-600">
                  You will need to verify your new email address.
                </p>
              )}
            </div>

            <div className="flex justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-5 text-sm font-medium focus:outline-none rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="flex-1 text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:bg-blue-300"
              >
                {isSubmitting || isUploading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;
