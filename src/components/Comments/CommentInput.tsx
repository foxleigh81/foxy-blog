'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../Auth/AuthProvider';
import AuthModal from '../Auth/AuthModal';
import { FaPaperPlane } from 'react-icons/fa';

interface CommentInputProps {
  postId: string;
  parentId?: string | null;
  onCommentSubmitted: () => void;
  replyToUser?: string;
  onCancelReply?: () => void;
  className?: string;
}

const CommentInput: React.FC<CommentInputProps> = ({
  postId,
  parentId = null,
  onCommentSubmitted,
  replyToUser,
  onCancelReply,
  className = '',
}) => {
  const [comment, setComment] = useState(replyToUser ? `@${replyToUser} ` : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user, profile } = useAuth();

  useEffect(() => {
    // When replyToUser changes, update the comment text
    if (replyToUser) {
      setComment(`@${replyToUser} `);
      // Focus on textarea and set cursor at the end
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = textareaRef.current.value.length;
        textareaRef.current.selectionEnd = textareaRef.current.value.length;
      }
    }
  }, [replyToUser]);

  // Function to extract mentions from comment
  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }

    return mentions;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !profile) {
      setIsModalOpen(true);
      return;
    }

    if (!comment.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Extract mentions from the comment
      const mentions = extractMentions(comment);

      // Determine comment status based on moderator status
      const status = profile.is_moderator ? 'approved' : 'pending';

      // Create new comment in Supabase
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: comment.trim(),
          postId,
          parentId,
          mentions: mentions.length > 0 ? mentions : null,
          status,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit comment');
      }

      // Clear input and notify parent
      setComment('');
      onCommentSubmitted();

      // If this was a reply, also call onCancelReply
      if (parentId && onCancelReply) {
        onCancelReply();
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to submit comment. Please try again.');
      }
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user is not logged in, show prompt
  if (!user) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 text-center ${className}`}>
        <p className="text-gray-700 mb-3">Please sign in to leave a comment</p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Sign In
        </button>

        <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="mb-3">
        <textarea
          ref={textareaRef}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          rows={3}
          placeholder="Write a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        />
        {error && <p className="mt-1 text-red-600 text-sm">{error}</p>}
        <p className="mt-1 text-xs text-gray-500">Use @ to mention someone (e.g. @username)</p>
      </div>

      <div className="flex justify-between">
        {parentId && onCancelReply && (
          <button
            type="button"
            onClick={onCancelReply}
            className="text-gray-700 hover:text-gray-900"
          >
            Cancel Reply
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
            isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
          } ${parentId ? '' : 'ml-auto'}`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
          {!isSubmitting && <FaPaperPlane />}
        </button>
      </div>
    </form>
  );
};

export default CommentInput;
