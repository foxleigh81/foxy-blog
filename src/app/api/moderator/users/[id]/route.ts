import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabase-server';

/**
 * PATCH endpoint to update user status (trust, ban, suspend)
 * Only accessible to users with moderator privileges
 */
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: userId } = await context.params;

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

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

    // Parse the request body
    const body = await req.json();
    const { is_trusted, is_banned, suspended_until } = body;

    // Validate that at least one field is being updated
    if (is_trusted === undefined && is_banned === undefined && suspended_until === undefined) {
      return NextResponse.json(
        { error: 'At least one field must be provided for update' },
        { status: 400 }
      );
    }

    // Check if target user exists and get their current status
    const { data: targetUser, error: targetUserError } = await supabase
      .from('profiles')
      .select('is_moderator, username')
      .eq('id', userId)
      .single();

    if (targetUserError) {
      console.error('Error fetching target user:', targetUserError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (targetUser.is_moderator) {
      return NextResponse.json({ error: 'Cannot modify moderator accounts' }, { status: 403 });
    }

    // Prepare update data
    const updateData: {
      is_trusted?: boolean;
      is_banned?: boolean;
      suspended_until?: string | null;
    } = {};

    if (is_trusted !== undefined) {
      updateData.is_trusted = is_trusted;
    }

    if (is_banned !== undefined) {
      updateData.is_banned = is_banned;
    }

    if (suspended_until !== undefined) {
      // Handle suspension date - convert date string to DATE format (YYYY-MM-DD)
      if (suspended_until === null || suspended_until === '') {
        updateData.suspended_until = null;
      } else {
        // Ensure it's in YYYY-MM-DD format for the date column
        updateData.suspended_until = suspended_until;
      }
    }

    console.log('Attempting to update user:', userId);
    console.log('Update data:', updateData);
    console.log('Current user (moderator):', user.id);

    // Update the user using service role to bypass RLS
    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select();

    if (error) {
      console.error('Error updating user profile:', error);
      console.error('Update data:', updateData);
      console.error('User ID:', userId);

      // Check if it's an RLS policy issue
      if (
        error.code === 'PGRST301' ||
        error.message.includes('new row violates row-level security policy')
      ) {
        return NextResponse.json(
          {
            error:
              'Database policy prevents this update. Please ensure moderator permissions are set up correctly.',
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: `Failed to update user: ${error.message}` },
        { status: 500 }
      );
    }

    // Check if any rows were actually updated
    if (!data || data.length === 0) {
      return NextResponse.json(
        {
          error:
            'No rows were updated. This may be due to database policies preventing moderator updates.',
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: data[0], // Return the first (and should be only) updated user
    });
  } catch (error) {
    console.error('Error in update user endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
