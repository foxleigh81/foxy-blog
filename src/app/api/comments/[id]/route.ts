import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabase-server';

// PATCH function to update a comment (for moderation or editing content)
export async function PATCH(
  req: NextRequest,
  // Using 'any' type here because Next.js 15 requires a specific type structure that conflicts with TypeScript's type checking
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  const { id: commentId } = await context.params;

  if (!commentId) {
    return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { status, content } = body;

    // Initialize update data object
    const updateData: { status?: string; content?: string } = {};

    // Check if this is a status update
    if (status) {
      // Validate status
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
      }
      updateData.status = status;
    }

    // Check if this is a content update
    if (content !== undefined) {
      if (typeof content !== 'string' || content.trim().length === 0) {
        return NextResponse.json({ error: 'Content cannot be empty' }, { status: 400 });
      }
      updateData.content = content.trim();
    }

    // Ensure we have something to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid update fields provided' }, { status: 400 });
    }

    // Get authenticated user
    const supabase = await createSupabaseServerClient();

    // First authenticate the user with getUser (secure)
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = userData.user.id;

    // Then get profile data using the authenticated user ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_moderator')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // For status updates, only moderators can perform them
    if (updateData.status && !profile.is_moderator) {
      return NextResponse.json(
        { error: 'Unauthorized: Only moderators can update comment status' },
        { status: 403 }
      );
    }

    // For content updates, get the comment to check ownership
    if (updateData.content) {
      const { data: comment, error: commentError } = await supabase
        .from('comments')
        .select('user_id')
        .eq('id', commentId)
        .single();

      if (commentError || !comment) {
        return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
      }

      // Only comment owners can edit their comments
      if (comment.user_id !== userId && !profile.is_moderator) {
        return NextResponse.json(
          { error: 'Unauthorized: Only the comment owner can edit this comment' },
          { status: 403 }
        );
      }
    }

    // Update the comment
    const { data, error } = await supabase
      .from('comments')
      .update(updateData)
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

// DELETE function to delete a comment
export async function DELETE(
  req: NextRequest,
  // Using 'any' type here because Next.js 15 requires a specific type structure that conflicts with TypeScript's type checking
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  const { id: commentId } = await context.params;

  if (!commentId) {
    return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
  }

  try {
    // Get authenticated user
    const supabase = await createSupabaseServerClient();

    // First authenticate the user with getUser (secure)
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = userData.user.id;

    // Then get profile data using the authenticated user ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_moderator')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Get the comment to check ownership
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', commentId)
      .single();

    if (commentError || !comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Only comment owners or moderators can delete comments
    if (comment.user_id !== userId && !profile.is_moderator) {
      return NextResponse.json(
        { error: 'Unauthorized: Only the comment owner or moderators can delete this comment' },
        { status: 403 }
      );
    }

    // Delete the comment
    const { error: deleteError } = await supabase.from('comments').delete().eq('id', commentId);

    if (deleteError) throw deleteError;

    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
