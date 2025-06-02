import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabase-server';

/**
 * GET endpoint to fetch count of pending moderation items
 * Only accessible to users with moderator privileges
 */
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    // Get the current user session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if user is a moderator
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_moderator')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || !profile.is_moderator) {
      return NextResponse.json(
        { error: 'Unauthorized: Moderator access required' },
        { status: 403 }
      );
    }

    // Get count of pending comments
    const { count: pendingCommentsCount, error: commentsError } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (commentsError) {
      console.error('Error fetching pending comments count:', commentsError);
      return NextResponse.json({ error: 'Failed to fetch pending comments' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      pendingCount: pendingCommentsCount || 0,
      hasPendingItems: (pendingCommentsCount || 0) > 0,
    });
  } catch (error) {
    console.error('Error in pending count endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
