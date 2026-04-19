import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabase-server';
import { isUserSuspended, MAX_COMMENT_LENGTH } from '@/utils/comment-utils';

type DBProfile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  is_moderator: boolean;
  is_trusted: boolean;
  is_banned: boolean;
  suspended_until: string | null;
};

type DBComment = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  post_id: string;
  parent_id: string | null;
  status: 'pending' | 'approved' | 'rejected';
  mentions: string[] | null;
};

type Comment = {
  id: string;
  content: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
  user: {
    id: string;
    username: string | null;
    avatar_url: string | null;
    is_moderator: boolean;
    is_trusted: boolean;
  };
  parent_id: string | null;
};

// GET function to fetch comments
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('postId');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  if (!postId) {
    return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
  }

  const offset = (page - 1) * limit;

  try {
    const supabase = await createSupabaseServerClient();

    // Derive permissions from the authenticated user, not from query params
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let authenticatedUserId: string | null = null;
    let isModerator = false;

    if (user) {
      authenticatedUserId = user.id;
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_moderator')
        .eq('id', user.id)
        .single();
      isModerator = !!profile?.is_moderator;
    }

    // Build query for comments
    let query = supabase
      .from('comments')
      .select(
        `
        *,
        profiles:user_id (
          id,
          username,
          avatar_url,
          is_moderator,
          is_trusted
        )
      `,
        { count: 'exact' }
      )
      .eq('post_id', postId);

    // Filter comments based on the authenticated user's role:
    // 1. Moderators see all comments (including pending/rejected)
    // 2. Authenticated users see approved comments + their own pending comments
    // 3. Unauthenticated users see only approved comments
    if (isModerator) {
      // No status filter — moderators see everything
    } else if (authenticatedUserId) {
      query = query.or(
        `status.eq.approved,and(status.eq.pending,user_id.eq.${authenticatedUserId})`
      );
    } else {
      query = query.eq('status', 'approved');
    }

    const {
      data: comments,
      count,
      error,
    } = await query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    if (!comments) {
      return NextResponse.json({ comments: [], total: 0, page, limit });
    }

    const safeComments = comments as unknown as DBComment[];

    // Get user profiles for all comments
    const userIds = safeComments.map((comment) => comment.user_id);
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, is_moderator, is_trusted')
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    if (!profiles) {
      return NextResponse.json({ error: 'Failed to fetch user profiles' }, { status: 500 });
    }

    const safeProfiles = profiles as unknown as DBProfile[];

    const profilesMap: Record<string, DBProfile> = {};
    for (const profile of safeProfiles) {
      profilesMap[profile.id] = profile;
    }

    const transformedComments: Comment[] = safeComments.map((comment) => {
      const profile = profilesMap[comment.user_id];
      if (!profile) {
        return {
          id: comment.id,
          content: comment.content,
          created_at: comment.created_at,
          status: comment.status,
          parent_id: comment.parent_id,
          user: {
            id: comment.user_id,
            username: null,
            avatar_url: null,
            is_moderator: false,
            is_trusted: false,
          },
        };
      }
      return {
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        status: comment.status,
        parent_id: comment.parent_id,
        user: {
          id: profile.id,
          username: profile.username || 'Anonymous',
          avatar_url: profile.avatar_url,
          is_moderator: profile.is_moderator,
          is_trusted: profile.is_trusted,
        },
      };
    });

    return NextResponse.json({
      comments: transformedComments,
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST function to create a new comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // NOTE: status is deliberately NOT accepted from the client
    const { content, postId, parentId, mentions } = body;

    const supabase = await createSupabaseServerClient();

    // Authenticate
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Validate required fields
    if (!content || !postId) {
      return NextResponse.json(
        { error: 'Missing required fields: content and postId are required' },
        { status: 400 }
      );
    }

    if (typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 });
    }

    if (content.length > MAX_COMMENT_LENGTH) {
      return NextResponse.json(
        { error: `Comment cannot exceed ${MAX_COMMENT_LENGTH} characters` },
        { status: 400 }
      );
    }

    // Get or create profile (single code path)
    let profile: DBProfile;

    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code === 'PGRST116') {
      // Profile doesn't exist — create one via upsert to handle race conditions
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            username:
              user.user_metadata?.username ||
              user.user_metadata?.name ||
              user.email?.split('@')[0] ||
              'Anonymous',
            is_moderator: false,
            is_trusted: false,
          },
          { onConflict: 'id', ignoreDuplicates: false }
        )
        .select()
        .single();

      if (createError || !newProfile) {
        // Race condition: another request created the profile first — fetch it
        const { data: fallbackProfile, error: fallbackError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (fallbackError || !fallbackProfile) {
          return NextResponse.json(
            { error: 'Failed to create or fetch user profile' },
            { status: 500 }
          );
        }
        profile = fallbackProfile as unknown as DBProfile;
      } else {
        profile = newProfile as unknown as DBProfile;
      }
    } else if (profileError) {
      return NextResponse.json({ error: 'Error fetching user profile' }, { status: 500 });
    } else if (!existingProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    } else {
      profile = existingProfile as unknown as DBProfile;
    }

    // Check ban / suspension
    if (profile.is_banned) {
      return NextResponse.json(
        { error: 'Your account has been banned and you cannot post comments.' },
        { status: 403 }
      );
    }

    if (isUserSuspended(profile.suspended_until)) {
      const suspensionEndDate = new Date(profile.suspended_until!).toLocaleDateString();
      return NextResponse.json(
        {
          error: `Your account is suspended until ${suspensionEndDate}. You cannot post comments during this time.`,
        },
        { status: 403 }
      );
    }

    // Determine status — NEVER trust client-supplied status
    const commentStatus = profile.is_moderator || profile.is_trusted ? 'approved' : 'pending';

    // Insert comment
    const { data: comment, error: insertError } = await supabase
      .from('comments')
      .insert({
        content: content.trim(),
        post_id: postId,
        user_id: user.id,
        parent_id: parentId || null,
        mentions: mentions || null,
        status: commentStatus,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting comment:', insertError);
      return NextResponse.json({ error: 'Failed to save comment' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      comment: comment as unknown as DBComment,
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create comment' },
      { status: 500 }
    );
  }
}
