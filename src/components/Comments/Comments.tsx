'use client';

import React, { useState } from 'react';
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

  const handleCommentSubmitted = () => {
    setRefreshComments((prev) => !prev);
  };

  return (
    <AuthProvider>
      <div className={`space-y-6 ${className}`}>
        <UserAuthStatus />

        <CommentInput
          postId={postId}
          onCommentSubmitted={handleCommentSubmitted}
          className="mb-8"
        />

        <CommentsList postId={postId} key={`comments-list-${refreshComments}`} />
      </div>
    </AuthProvider>
  );
};

export default Comments;
