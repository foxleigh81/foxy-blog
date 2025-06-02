import React, { useState, useRef, useEffect } from 'react';
import { FaSignOutAlt, FaEdit, FaShieldAlt, FaStar } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';

interface UserAvatarProps {
  onEditProfile: () => void;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ onEditProfile }) => {
  const { user, profile, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Generate initials from username or email
  const getInitials = (name?: string | null, email?: string): string => {
    if (name) {
      return name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }

    if (email) {
      return email[0].toUpperCase();
    }

    return 'U';
  };

  // Get avatar URL - only use custom avatar, no Gravatar fallback
  const getAvatarUrl = (): string | null => {
    if (profile?.avatar_url) {
      return profile.avatar_url;
    }
    return null;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setDropdownOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const avatarUrl = getAvatarUrl();
  const initials = getInitials(profile?.username, user?.email);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center space-x-2 text-white hover:bg-white/10 rounded-lg p-2 transition-colors"
      >
        <div className="relative">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={profile?.username || 'User avatar'}
              className="w-8 h-8 rounded-full border-2 border-white/20"
              onError={(e) => {
                // If custom avatar fails, hide the image and show initials
                e.currentTarget.style.display = 'none';
                const initialsDiv = e.currentTarget.nextElementSibling as HTMLElement;
                if (initialsDiv) {
                  initialsDiv.style.display = 'flex';
                }
              }}
            />
          ) : null}

          {/* Initials - shown when no avatar URL or when image fails to load */}
          <div
            className={`w-8 h-8 rounded-full border-2 border-white/20 bg-white/20 flex items-center justify-center text-sm font-semibold ${avatarUrl ? 'absolute inset-0' : ''}`}
            style={{ display: avatarUrl ? 'none' : 'flex' }}
          >
            {initials}
          </div>
        </div>

        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium">
            {profile?.username || user?.email?.split('@')[0] || 'User'}
          </div>
          {(profile?.is_moderator || profile?.is_trusted) && (
            <div className="flex items-center space-x-1 text-xs">
              {profile.is_moderator && (
                <span className="flex items-center">
                  <FaShieldAlt className="mr-1" />
                  Mod
                </span>
              )}
              {!profile.is_moderator && profile.is_trusted && (
                <span className="flex items-center">
                  <FaStar className="mr-1" />
                  Trusted
                </span>
              )}
            </div>
          )}
        </div>
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="text-sm font-medium text-gray-900">{profile?.username || 'User'}</div>
            <div className="text-xs text-gray-500">{user?.email}</div>
          </div>

          <button
            onClick={() => {
              onEditProfile();
              setDropdownOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          >
            <FaEdit className="mr-2" />
            Edit Profile
          </button>

          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          >
            <FaSignOutAlt className="mr-2" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
