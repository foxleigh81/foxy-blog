import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabase-server';

/**
 * GET endpoint to fetch all users for moderation
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

    // Fetch all users
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select(
        `
        id,
        username,
        avatar_url,
        created_at,
        is_moderator,
        is_trusted,
        is_banned,
        suspended_until
      `
      )
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      users: users || [],
      total: users?.length || 0,
    });
  } catch (error) {
    console.error('Error in moderator users endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
