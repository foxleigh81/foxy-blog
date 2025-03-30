'use client';

import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FaUser, FaReply, FaCheck, FaTimes } from 'react-icons/fa';
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
  };
  status: CommentStatus;
  postId: string;
  onStatusChange?: (id: string, status: CommentStatus) => Promise<void>;
  onReplySubmitted: () => void;
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
  highlightMentions = true,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { profile } = useAuth();

  const isPending = status === 'pending';
  const isCurrentUserModerator = profile?.is_moderator === true;

  // Format comment content to highlight mentions
  const formatCommentWithMentions = (text: string) => {
    if (!highlightMentions) return text;

    return text.split(/(@[a-zA-Z0-9_-]+)/).map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span key={index} className="text-blue-600 font-medium">
            {part}
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

  const toggleReply = () => {
    setIsReplying(!isReplying);
  };

  const handleReplySubmitted = () => {
    setIsReplying(false);
    onReplySubmitted();
  };

  return (
    <div
      className={`p-4 border rounded-lg mb-4 ${
        isPending ? 'border-red-300 border-dashed bg-red-50' : 'border-gray-200'
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
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded mr-2">
                Moderator
              </span>
            )}
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </span>

            {isPending && isCurrentUserModerator && (
              <div className="ml-auto flex space-x-2">
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
              </div>
            )}
          </div>

          <div className="text-gray-800 mb-3">{formatCommentWithMentions(content)}</div>

          {/* Show reply button only for approved comments */}
          {!isPending && profile && (
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
