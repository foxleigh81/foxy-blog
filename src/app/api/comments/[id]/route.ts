import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

// PATCH function to update a comment (primarily for moderation)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const commentId = params.id;

  if (!commentId) {
    return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { status } = body;

    // Validate status
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    // Get the session from the request cookie
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = session.user;

    // Check if user is a moderator
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_moderator')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Only moderators can update comment status
    if (!profile.is_moderator) {
      return NextResponse.json(
        { error: 'Unauthorized: Only moderators can update comment status' },
        { status: 403 }
      );
    }

    // Update the comment
    const { data, error } = await supabase
      .from('comments')
      .update({ status })
      .eq('id', commentId)
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      comment: data ? data[0] : null,
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
  }
}
