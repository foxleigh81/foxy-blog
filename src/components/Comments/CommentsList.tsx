'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaRegCommentAlt } from 'react-icons/fa';
import { useSearchParams } from 'next/navigation';
import CommentItem from './CommentItem';
import Pagination from '../Pagination';
import { useAuth } from '../Auth/AuthProvider';
import { Database } from '@/types/supabase';

type CommentStatus = 'pending' | 'approved' | 'rejected';

type Comment = {
  id: string;
  content: string;
  created_at: string;
  status: Database['public']['Tables']['comments']['Row']['status'];
  user: {
    id: string;
    username: string | null;
    avatar_url: string | null;
    is_moderator: boolean;
    is_trusted: boolean;
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
  const userId = profile?.id;

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Include a new parameter to fetch the user's own pending comments
      const queryParams = new URLSearchParams({
        postId: postId,
        page: currentPage.toString(),
        limit: commentsPerPage.toString(),
      });

      // Add includePending for moderators
      if (isUserModerator) {
        queryParams.append('includePending', 'true');
      }

      // Add new parameter to include the current user's pending comments
      if (userId) {
        queryParams.append('userId', userId);
      }

      // Fetch comments from the API
      const response = await fetch(`/api/comments?${queryParams.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch comments');
      }

      const data = await response.json();
      setComments(data.comments);
      setTotalComments(data.total);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments. Please try again later.');
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  }, [postId, currentPage, commentsPerPage, isUserModerator, userId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Listen for profile updates and refresh comments
  useEffect(() => {
    const handleProfileUpdate = () => {
      fetchComments();
    };

    const handleCommentAdded = () => {
      fetchComments();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    window.addEventListener('comment-added', handleCommentAdded);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      window.removeEventListener('comment-added', handleCommentAdded);
    };
  }, [fetchComments]);

  const handleStatusChange = useCallback(
    async (commentId: string, newStatus: 'pending' | 'approved' | 'rejected') => {
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
        setComments((prevComments) =>
          prevComments.map((comment) =>
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
    },
    [isUserModerator, fetchComments]
  );

  const handleDelete = useCallback(
    async (commentId: string) => {
      if (!profile) return;

      try {
        const response = await fetch(`/api/comments/${commentId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete comment');
        }

        // Remove the comment from state
        setComments((prevComments) => prevComments.filter((comment) => comment.id !== commentId));

        // If deleting a parent comment, also filter out all replies to that comment
        setComments((prevComments) =>
          prevComments.filter((comment) => comment.parent_id !== commentId)
        );

        // Update total count
        setTotalComments((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error deleting comment:', error);
        throw error;
      }
    },
    [profile]
  );

  const handleEdit = useCallback(
    async (commentId: string, newContent: string) => {
      if (!profile) return;

      try {
        const response = await fetch(`/api/comments/${commentId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: newContent }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update comment');
        }

        await response.json();

        // Update the comment in state
        setComments((prevComments) =>
          prevComments.map((c) => (c.id === commentId ? { ...c, content: newContent } : c))
        );
      } catch (error) {
        console.error('Error editing comment:', error);
        throw error;
      }
    },
    [profile]
  );

  // Memoize the grouped and sorted comments structure to prevent recalculations on every render
  const { commentsByParent, topLevelComments } = useMemo(() => {
    const commentsByParent: Record<string, Comment[]> = {};
    const topLevelComments: Comment[] = [];
    const topLevelParentMap: Record<string, string> = {};

    // First pass: find all top-level comments and create a map of comment IDs to their top-level parent
    comments.forEach((comment) => {
      if (comment.parent_id) {
        let topLevelParentId = comment.parent_id;
        let parentComment = comments.find((c) => c.id === comment.parent_id);
        while (parentComment?.parent_id) {
          topLevelParentId = parentComment.parent_id;
          parentComment = comments.find((c) => c.id === parentComment?.parent_id);
        }
        topLevelParentMap[comment.id] = topLevelParentId;
      }
    });

    // Second pass: group comments by their top-level parent
    comments.forEach((comment) => {
      if (comment.parent_id) {
        const topLevelParentId = topLevelParentMap[comment.id];
        if (!commentsByParent[topLevelParentId]) {
          commentsByParent[topLevelParentId] = [];
        }
        // Create a new comment object with the top-level parent_id
        commentsByParent[topLevelParentId].push({
          ...comment,
          parent_id: topLevelParentId,
        });
      } else {
        topLevelComments.push(comment);
      }
    });

    // Sort replies by timestamp within each group
    Object.keys(commentsByParent).forEach((parentId) => {
      commentsByParent[parentId].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });

    return { commentsByParent, topLevelComments };
  }, [comments]);

  // Memoize the skeleton loader to prevent recreation on each render when loading
  const skeletonLoader = useMemo(() => {
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
  }, []);

  // Memoize the renderCommentWithReplies function
  const renderCommentWithReplies = useCallback(
    (comment: Comment) => {
      const replies = commentsByParent[comment.id] || [];

      return (
        <div key={`comment-${comment.id}`}>
          <CommentItem
            id={comment.id}
            content={comment.content}
            createdAt={comment.created_at}
            user={{
              id: comment.user.id,
              displayName: comment.user.username || 'Anonymous',
              avatarUrl: comment.user.avatar_url,
              isModerator: comment.user.is_moderator,
              isTrusted: comment.user.is_trusted,
            }}
            status={comment.status as CommentStatus}
            postId={postId}
            onStatusChange={handleStatusChange}
            onReplySubmitted={fetchComments}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />

          {/* Render all replies in a container with margin */}
          {replies.length > 0 && (
            <div className="ml-6">
              {replies.map((reply) => (
                <div key={`reply-${reply.id}`}>
                  <CommentItem
                    id={reply.id}
                    content={reply.content}
                    createdAt={reply.created_at}
                    user={{
                      id: reply.user.id,
                      displayName: reply.user.username || 'Anonymous',
                      avatarUrl: reply.user.avatar_url,
                      isModerator: reply.user.is_moderator,
                      isTrusted: reply.user.is_trusted,
                    }}
                    status={reply.status as CommentStatus}
                    postId={postId}
                    onStatusChange={handleStatusChange}
                    onReplySubmitted={fetchComments}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      );
    },
    [commentsByParent, postId, handleStatusChange, fetchComments, handleDelete, handleEdit]
  );

  // Memoize the rendered comments to prevent recreation
  const renderedComments = useMemo(() => {
    if (isLoading) {
      return skeletonLoader;
    }

    if (error) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">{error}</div>
      );
    }

    if (comments.length === 0) {
      return (
        <div className="p-6 text-center text-gray-700">
          <FaRegCommentAlt className="mx-auto mb-3 h-8 w-8 text-gray-700" />
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      );
    }

    return topLevelComments.map(renderCommentWithReplies);
  }, [
    isLoading,
    error,
    comments.length,
    topLevelComments,
    skeletonLoader,
    renderCommentWithReplies,
  ]);

  // Memoize the header text
  const headerText = useMemo(
    () => (
      <div className="mb-6">
        <h3 className="text-xl font-bold">Comments</h3>
        <p className="text-sm text-gray-600">
          Showing {totalComments} comment{totalComments !== 1 ? 's' : ''}
        </p>
      </div>
    ),
    [totalComments]
  );

  // Memoize the pagination component
  const paginationComponent = useMemo(
    () =>
      totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath=""
          searchParams={{ postId }}
        />
      ),
    [totalPages, currentPage, postId]
  );

  return (
    <div className={className}>
      {headerText}
      <div className="space-y-4">{renderedComments}</div>
      {paginationComponent}
    </div>
  );
};

export default CommentsList;
