'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FaCheck,
  FaTimes,
  FaUser,
  FaClock,
  FaExclamationTriangle,
  FaExternalLinkAlt,
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  status: 'pending' | 'rejected';
  post_id: string;
  user: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  };
  post: {
    title: string;
    slug: string;
    category: string;
    url: string;
  } | null;
}

/**
 * Moderation queue showing unapproved comments
 * Allows moderators to approve or deny comments
 */
const ModerationQueue: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const fetchUnapprovedComments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/moderator/comments');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch comments');
      }

      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error fetching unapproved comments:', error);
      setError('Failed to load moderation queue. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnapprovedComments();
  }, [fetchUnapprovedComments]);

  const handleStatusChange = async (commentId: string, newStatus: 'approved' | 'rejected') => {
    setProcessingIds((prev) => new Set(prev).add(commentId));

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update comment');
      }

      // Remove the comment from the list since it's no longer unapproved
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    } catch (error) {
      console.error('Error updating comment status:', error);
      setError('Failed to update comment. Please try again.');
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading moderation queue...</p>
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
          onClick={fetchUnapprovedComments}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-12">
        <FaCheck className="mx-auto text-6xl text-green-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">All Clear!</h3>
        <p className="text-gray-500">No comments awaiting moderation</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Moderation Queue ({comments.length})
        </h2>
        <button
          onClick={fetchUnapprovedComments}
          className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {comments.map((comment) => {
          const isProcessing = processingIds.has(comment.id);

          return (
            <div
              key={comment.id}
              className={`bg-gray-50 border rounded-lg p-4 ${
                comment.status === 'rejected' ? 'border-red-200 bg-red-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start space-x-3">
                {comment.user.avatar_url ? (
                  <Image
                    src={comment.user.avatar_url}
                    alt={comment.user.username || 'User'}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center">
                    <FaUser className="w-5 h-5" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-2">
                    <span className="font-medium text-gray-900">
                      {comment.user.username || 'Anonymous User'}
                    </span>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="text-sm text-gray-500 flex items-center">
                      <FaClock className="mr-1" />
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                    <span className="mx-2 text-gray-300">•</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        comment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {comment.status === 'pending' ? 'Pending' : 'Rejected'}
                    </span>
                  </div>

                  {/* Post information */}
                  {comment.post && (
                    <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded">
                      <div className="flex items-center">
                        <span className="text-sm text-blue-700 font-medium">Article:</span>
                        <Link
                          href={comment.post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-sm text-blue-600 hover:text-blue-800 flex items-center transition-colors"
                        >
                          {comment.post.title}
                          <FaExternalLinkAlt className="ml-1 text-xs" />
                        </Link>
                      </div>
                    </div>
                  )}

                  <div className="text-gray-900 mb-3 whitespace-pre-wrap">{comment.content}</div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleStatusChange(comment.id, 'approved')}
                      disabled={isProcessing}
                      className={`flex items-center px-3 py-1 rounded text-sm font-medium transition-colors ${
                        isProcessing
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      <FaCheck className="mr-1" />
                      {isProcessing ? 'Processing...' : 'Approve'}
                    </button>

                    <button
                      onClick={() => handleStatusChange(comment.id, 'rejected')}
                      disabled={isProcessing}
                      className={`flex items-center px-3 py-1 rounded text-sm font-medium transition-colors ${
                        isProcessing
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      <FaTimes className="mr-1" />
                      {isProcessing ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ModerationQueue;
