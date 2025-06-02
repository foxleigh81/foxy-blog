import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ModerationNotification {
  hasPendingItems: boolean;
  pendingCount: number;
  loading: boolean;
}

/**
 * Custom hook to check for pending moderation items
 * Only fetches data for moderators
 */
export const useModerationNotification = (): ModerationNotification => {
  const [hasPendingItems, setHasPendingItems] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();

  const fetchPendingCount = async () => {
    if (!profile?.is_moderator) {
      setHasPendingItems(false);
      setPendingCount(0);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/moderator/pending-count');

      if (response.ok) {
        const data = await response.json();
        setHasPendingItems(data.hasPendingItems || false);
        setPendingCount(data.pendingCount || 0);
      } else {
        setHasPendingItems(false);
        setPendingCount(0);
      }
    } catch (error) {
      console.error('Error fetching pending count:', error);
      setHasPendingItems(false);
      setPendingCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchPendingCount();

    // Set up interval to check every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000);

    // Listen for comment status changes to refresh count
    const handleCommentStatusChange = () => {
      fetchPendingCount();
    };

    window.addEventListener('comment-status-changed', handleCommentStatusChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('comment-status-changed', handleCommentStatusChange);
    };
  }, [profile?.is_moderator]);

  return {
    hasPendingItems,
    pendingCount,
    loading,
  };
};
