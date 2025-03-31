'use client';

import React, { useState, useEffect } from 'react';
import { FaRegCommentAlt } from 'react-icons/fa';
import { useSearchParams } from 'next/navigation';
import CommentItem from './CommentItem';
import Pagination from '../Pagination';
import { useAuth } from '../Auth/AuthProvider';
import { Database } from '@/types/supabase';

type Comment = {
  id: string;
  content: string;
  created_at: string;
  status: Database['public']['Tables']['comments']['Row']['status'];
  user: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    is_moderator: boolean;
  };
  parent_id: string | null;
};

interface CommentsListProps {
  postId: string;
  commentsPerPage?: number;
  className?: string;
}

const CommentsList: React.FC<CommentsListProps> = ({
  postId,
  commentsPerPage = 15,
  className = '',
}) => {
  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page');
  const currentPage = pageParam ? parseInt(pageParam) : 1;

  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalComments, setTotalComments] = useState(0);
  const { profile } = useAuth();

  const totalPages = Math.ceil(totalComments / commentsPerPage);
  const isUserModerator = !!profile?.is_moderator;

  const fetchComments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch comments from the API
      const response = await fetch(
        `/api/comments?postId=${postId}&page=${currentPage}&limit=${commentsPerPage}${
          isUserModerator ? '&includePending=true' : ''
        }`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch comments');
      }

      const data = await response.json();
      console.log('Fetched comments:', data);
      setComments(data.comments);
      setTotalComments(data.total);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments. Please try again later.');
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId, currentPage, isUserModerator]);

  const handleStatusChange = async (
    commentId: string,
    newStatus: 'pending' | 'approved' | 'rejected'
  ) => {
    if (!isUserModerator) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update comment status');
      }

      // Update the comment in the local state
      setComments(
        comments.map((comment) =>
          comment.id === commentId ? { ...comment, status: newStatus } : comment
        )
      );

      // If the comment was rejected, we might want to refetch to get updated counts
      if (newStatus === 'rejected') {
        fetchComments();
      }
    } catch (error) {
      console.error('Error updating comment status:', error);
      throw error;
    }
  };

  const renderComments = () => {
    if (isLoading) {
      return Array(3)
        .fill(0)
        .map((_, index) => (
          <div
            key={`skeleton-${index}`}
            className="animate-pulse p-4 border border-gray-200 rounded-lg mb-4"
          >
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2 w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded mb-3 w-1/6"></div>
                <div className="h-4 bg-gray-200 rounded mb-1 w-full"></div>
                <div className="h-4 bg-gray-200 rounded mb-1 w-4/5"></div>
                <div className="h-4 bg-gray-200 rounded w-3/5"></div>
              </div>
            </div>
          </div>
        ));
    }

    if (error) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">{error}</div>
      );
    }

    if (comments.length === 0) {
      return (
        <div className="p-6 text-center text-gray-500">
          <FaRegCommentAlt className="mx-auto mb-3 h-8 w-8 text-gray-400" />
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      );
    }

    // Group comments by parent_id for threaded view
    const commentsByParent: Record<string, Comment[]> = {};
    const topLevelComments: Comment[] = [];

    comments.forEach((comment) => {
      if (comment.parent_id) {
        if (!commentsByParent[comment.parent_id]) {
          commentsByParent[comment.parent_id] = [];
        }
        commentsByParent[comment.parent_id].push(comment);
      } else {
        topLevelComments.push(comment);
      }
    });

    // Render a comment and its replies
    const renderCommentWithReplies = (comment: Comment, depth = 0) => {
      const replies = commentsByParent[comment.id] || [];

      return (
        <div key={comment.id} style={{ marginLeft: depth > 0 ? `${depth * 20}px` : '0' }}>
          <CommentItem
            id={comment.id}
            content={comment.content}
            createdAt={comment.created_at}
            user={{
              id: comment.user.id,
              displayName: comment.user.display_name,
              avatarUrl: comment.user.avatar_url,
              isModerator: comment.user.is_moderator,
            }}
            status={comment.status}
            postId={postId}
            onStatusChange={handleStatusChange}
            onReplySubmitted={fetchComments}
          />

          {/* Render replies */}
          {replies.map((reply) => renderCommentWithReplies(reply, depth + 1))}
        </div>
      );
    };

    return topLevelComments.map((comment) => renderCommentWithReplies(comment));
  };

  return (
    <div className={className}>
      <div className="mb-6">
        <h3 className="text-xl font-bold">Comments</h3>
        <p className="text-sm text-gray-600">
          Showing {totalComments} comment{totalComments !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-4">{renderComments()}</div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath=""
          searchParams={{ postId }}
        />
      )}
    </div>
  );
};

export default CommentsList;
