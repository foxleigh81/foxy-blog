'use client';

import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
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
} from 'react-icons/fa';
import { useAuth } from '../Auth/AuthProvider';
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
  const { profile } = useAuth();

  const isPending = status === 'pending';
  const isCurrentUserModerator = profile?.is_moderator === true;
  const isCommentOwner = profile?.id === user.id;
  // Either approved comments or the user's own pending comments should be visible
  const isVisible = status === 'approved' || (isPending && isCommentOwner);

  // Format comment content to highlight mentions
  const formatCommentWithMentions = (text: string) => {
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
  };

  const handleStatusChange = async (newStatus: CommentStatus) => {
    if (!onStatusChange || !isCurrentUserModerator) return;

    setIsSubmitting(true);
    try {
      await onStatusChange(id, newStatus);
    } catch (error) {
      console.error('Error updating comment status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || (!isCommentOwner && !isCurrentUserModerator)) return;

    setIsSubmitting(true);
    try {
      await onDelete(id);
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
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
  };

  const toggleReply = () => {
    setIsReplying(!isReplying);
  };

  const handleReplySubmitted = () => {
    setIsReplying(false);
    onReplySubmitted();
  };

  // If comment is not visible based on status and ownership, don't render it
  if (!isVisible && !isCurrentUserModerator) {
    return null;
  }

  return (
    <div
      className={`p-4 border rounded-lg mb-4 ${
        isPending
          ? isCommentOwner
            ? 'border-amber-300 border-dashed bg-amber-50 opacity-75'
            : 'border-red-300 border-dashed bg-red-50'
          : 'border-gray-200'
      }`}
    >
      <div className="flex items-start space-x-3">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.displayName} className="w-10 h-10 rounded-full" />
        ) : (
          <div className="w-10 h-10 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center">
            <FaUser className="w-5 h-5" />
          </div>
        )}

        <div className="flex-1">
          <div className="flex flex-wrap items-center mb-2">
            <span className="font-semibold mr-2">{user.displayName}</span>
            {user.isModerator && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded mr-2 flex items-center">
                <FaShieldAlt className="mr-1" />
                Moderator
              </span>
            )}
            {!user.isModerator && user.isTrusted && (
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

              {/* Allow comment owners to edit/delete their pending comments too */}
              {(isCommentOwner || isCurrentUserModerator) && (
                <>
                  {isCommentOwner && (
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center text-xs text-gray-600 hover:text-blue-600"
                    >
                      <FaEdit className="mr-1" />
                      {isEditing ? 'Cancel' : 'Edit'}
                    </button>
                  )}
                  <button
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    className="flex items-center text-xs text-red-600 hover:text-red-700"
                  >
                    <FaTrash className="mr-1" />
                    Delete
                  </button>
                </>
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
              <button
                onClick={handleEdit}
                disabled={isSubmitting}
                className="mt-2 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
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
                replyToUser={user.displayName}
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

export default CommentItem;
