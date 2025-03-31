'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { AuthProvider } from '../Auth/AuthProvider';
import UserAuthStatus from '../Auth/UserAuthStatus';
import CommentInput from './CommentInput';
import CommentsList from './CommentsList';

interface CommentsProps {
  postId: string;
  className?: string;
}

/**
 * Comments component that provides a complete commenting system
 *
 * Features:
 * - User authentication via Supabase
 * - Comment submission with @mentions support
 * - Moderation features for users with moderator privileges
 * - Threaded replies
 * - Pagination (15 comments per page)
 */
const Comments: React.FC<CommentsProps> = ({ postId, className = '' }) => {
  const [refreshComments, setRefreshComments] = useState(false);

  const handleCommentSubmitted = useCallback(() => {
    setRefreshComments((prev) => !prev);
  }, []);

  // Memoize the components to prevent unnecessary re-renders
  const userAuthStatusComponent = useMemo(() => <UserAuthStatus />, []);

  const commentInputComponent = useMemo(
    () => (
      <CommentInput postId={postId} onCommentSubmitted={handleCommentSubmitted} className="mb-8" />
    ),
    [postId, handleCommentSubmitted]
  );

  // We use the key prop to force a re-render when refreshComments changes
  const commentsListComponent = useMemo(
    () => <CommentsList postId={postId} key={`comments-list-${refreshComments}`} />,
    [postId, refreshComments]
  );

  return (
    <AuthProvider>
      <div className={`space-y-6 ${className}`}>
        {userAuthStatusComponent}
        {commentInputComponent}
        {commentsListComponent}
      </div>
    </AuthProvider>
  );
};

export default React.memo(Comments);
