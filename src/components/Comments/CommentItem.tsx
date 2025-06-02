'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  FaUser,
  FaReply,
  FaCheck,
  FaTimes,
  FaEdit,
  FaTrash,
  FaShieldAlt,
  FaClock,
  FaStar,
  FaEllipsisV,
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import CommentInput from './CommentInput';

type CommentStatus = 'pending' | 'approved' | 'rejected';

interface CommentItemProps {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    displayName: string;
    avatarUrl?: string | null;
    isModerator: boolean;
    isTrusted?: boolean;
  };
  status: CommentStatus;
  postId: string;
  onStatusChange?: (id: string, status: CommentStatus) => Promise<void>;
  onReplySubmitted: () => void;
  onDelete?: (id: string) => Promise<void>;
  onEdit?: (id: string, newContent: string) => Promise<void>;
  highlightMentions?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({
  id,
  content,
  createdAt,
  user,
  status,
  postId,
  onStatusChange,
  onReplySubmitted,
  onDelete,
  onEdit,
  highlightMentions = true,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { profile } = useAuth();

  const isPending = status === 'pending';
  const isCurrentUserModerator = profile?.is_moderator === true;
  const isCommentOwner = profile?.id === user.id;

  // Use current user's profile data for their own comments
  const displayUser = useMemo(() => {
    if (isCommentOwner && profile) {
      return {
        ...user,
        displayName: profile.username || user.displayName,
        avatarUrl: profile.avatar_url || user.avatarUrl,
      };
    }
    return user;
  }, [user, profile, isCommentOwner]);

  // Either approved comments or the user's own pending comments should be visible
  const isVisible = status === 'approved' || (isPending && isCommentOwner);

  // Format comment content to highlight mentions
  const formatCommentWithMentions = useCallback(
    (text: string) => {
      if (!highlightMentions) return text;

      // Split by spaces to handle full names
      return text.split(/(\s+)/).map((part, index) => {
        if (part.startsWith('@')) {
          // Remove the @ symbol and trim
          const mentionName = part.slice(1).trim();
          return (
            <span key={index} className="font-bold">
              @{mentionName}
            </span>
          );
        }
        return part;
      });
    },
    [highlightMentions]
  );

  const handleStatusChange = useCallback(
    async (newStatus: CommentStatus) => {
      if (!onStatusChange || !isCurrentUserModerator) return;

      setIsSubmitting(true);
      try {
        await onStatusChange(id, newStatus);
      } catch (error) {
        console.error('Error updating comment status:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [onStatusChange, isCurrentUserModerator, id]
  );

  const handleDelete = useCallback(async () => {
    if (!onDelete || (!isCommentOwner && !isCurrentUserModerator)) return;

    setIsSubmitting(true);
    try {
      await onDelete(id);
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [onDelete, isCommentOwner, isCurrentUserModerator, id]);

  const handleEdit = useCallback(async () => {
    if (!onEdit || !isCommentOwner) return;

    setIsSubmitting(true);
    try {
      await onEdit(id, editedContent);
      setIsEditing(false);
    } catch (error) {
      console.error('Error editing comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [onEdit, isCommentOwner, id, editedContent]);

  const toggleReply = useCallback(() => {
    setIsReplying((prev) => !prev);
  }, []);

  const handleReplySubmitted = useCallback(() => {
    setIsReplying(false);
    onReplySubmitted();
  }, [onReplySubmitted]);

  // Calculate the container class only when status changes
  const containerClass = useMemo(
    () =>
      `p-4 border rounded-lg mb-4 ${
        isPending
          ? isCommentOwner
            ? 'border-amber-300 border-dashed bg-amber-50 opacity-75'
            : 'border-red-300 border-dashed bg-red-50'
          : 'border-gray-200'
      }`,
    [isPending, isCommentOwner]
  );

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  // If comment is not visible based on status and ownership, don't render it
  if (!isVisible && !isCurrentUserModerator) {
    return null;
  }

  return (
    <div className={containerClass}>
      <div className="flex items-start space-x-3">
        {displayUser.avatarUrl ? (
          <img
            src={displayUser.avatarUrl}
            alt={displayUser.displayName}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <div className="w-10 h-10 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center">
            <FaUser className="w-5 h-5" />
          </div>
        )}

        <div className="flex-1">
          <div className="flex flex-wrap items-center mb-2">
            <span className="font-semibold mr-2">{displayUser.displayName}</span>
            {displayUser.isModerator && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded mr-2 flex items-center">
                <FaShieldAlt className="mr-1" />
                Moderator
              </span>
            )}
            {!displayUser.isModerator && displayUser.isTrusted && (
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded mr-2 flex items-center">
                <FaStar className="mr-1" />
                Top Contributor
              </span>
            )}
            {isPending && isCommentOwner && (
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded mr-2 flex items-center">
                <FaClock className="mr-1" />
                Awaiting Approval
              </span>
            )}
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </span>

            <div className="ml-auto flex space-x-2">
              {isPending && isCurrentUserModerator && (
                <>
                  <button
                    onClick={() => handleStatusChange('approved')}
                    disabled={isSubmitting}
                    className="flex items-center text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                  >
                    <FaCheck className="mr-1" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusChange('rejected')}
                    disabled={isSubmitting}
                    className="flex items-center text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                  >
                    <FaTimes className="mr-1" />
                    Reject
                  </button>
                </>
              )}

              {/* Replace edit/delete buttons with dropdown menu */}
              {(isCommentOwner || isCurrentUserModerator) && !isEditing && (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={toggleMenu}
                    className="p-1 text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100"
                  >
                    <FaEllipsisV />
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                      <div className="py-1">
                        {isCommentOwner && !isEditing && (
                          <button
                            onClick={() => {
                              setIsEditing(true);
                              setIsMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <FaEdit className="mr-2" />
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => {
                            handleDelete();
                            setIsMenuOpen(false);
                          }}
                          disabled={isSubmitting}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                        >
                          <FaTrash className="mr-2" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="mb-3">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={handleEdit}
                  disabled={isSubmitting}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-800 mb-3">
              {formatCommentWithMentions(content)}
              {isPending && isCommentOwner && (
                <p className="text-amber-600 text-xs mt-2 italic">
                  Your comment is awaiting moderation. It will be visible to others once approved.
                </p>
              )}
            </div>
          )}

          {/* Show reply button only for approved comments or to moderators */}
          {(!isPending || isCurrentUserModerator) && profile && (
            <div className="flex">
              <button
                onClick={toggleReply}
                className="flex items-center text-xs text-gray-600 hover:text-blue-600"
              >
                <FaReply className="mr-1" />
                {isReplying ? 'Cancel' : 'Reply'}
              </button>
            </div>
          )}

          {isReplying && (
            <div className="mt-3">
              <CommentInput
                postId={postId}
                parentId={id}
                replyToUser={displayUser.displayName}
                onCancelReply={() => setIsReplying(false)}
                onCommentSubmitted={handleReplySubmitted}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(CommentItem);
