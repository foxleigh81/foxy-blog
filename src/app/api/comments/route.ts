import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

// GET function to fetch comments
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('postId');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '15');
  const includePending = searchParams.get('includePending') === 'true';

  if (!postId) {
    return NextResponse.json({ error: 'Missing required parameter: postId' }, { status: 400 });
  }

  // Calculate offset for pagination
  const offset = (page - 1) * limit;

  try {
    console.log('Fetching comments with params:', { postId, page, limit, includePending });

    // Create a Supabase client with the route handler
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

    // Start building query for comments
    let query = supabase.from('comments').select('*', { count: 'exact' }).eq('post_id', postId);

    // Only include approved comments if includePending is false
    if (!includePending) {
      query = query.eq('status', 'approved');
    }

    // Get comments with pagination
    const {
      data: comments,
      count,
      error,
    } = await query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    // Get user profiles for all comments
    const userIds = comments?.map((comment) => comment.user_id) || [];
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, is_moderator')
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    // Create a map of user profiles
    const profilesMap =
      profiles?.reduce(
        (acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        },
        {} as Record<string, (typeof profiles)[0]>
      ) || {};

    // Transform the response to match the expected format
    const transformedComments =
      comments?.map((comment) => ({
        ...comment,
        user: profilesMap[comment.user_id],
      })) || [];

    console.log('Successfully fetched comments:', { count: transformedComments.length });
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
    const { content, postId, parentId, mentions, status } = body;

    // Log request information
    console.log('POST /api/comments - Request received:', {
      postId,
      hasParentId: !!parentId,
      contentLength: content?.length || 0,
    });

    // Debug: Check request headers
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    console.log('Request headers:', {
      hasAuthHeader: !!authHeader,
      hasCookieHeader: !!cookieHeader,
      cookieHeaderLength: cookieHeader?.length || 0,
    });

    // Create Supabase client with route handler
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({
      cookies: () => cookieStore,
    });

    // Get the session using the auth client
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error getting session:', error);
      return NextResponse.json({ error: 'Authentication error' }, { status: 401 });
    }

    if (!data.session) {
      console.error('No session found');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { session } = data;
    const user = session.user;

    console.log('Authenticated user found:', {
      id: user.id,
      email: user.email,
    });

    // Validate required fields
    if (!content || !postId) {
      return NextResponse.json(
        { error: 'Missing required fields: content and postId are required' },
        { status: 400 }
      );
    }

    // Check if user has a profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json({ error: 'Error fetching user profile' }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Determine the comment status based on user's moderator status
    const commentStatus = profile.is_moderator ? 'approved' : status || 'pending';

    // Insert the comment
    const { data: comment, error: insertError } = await supabase
      .from('comments')
      .insert({
        content,
        post_id: postId,
        user_id: user.id,
        parent_id: parentId || null,
        mentions,
        status: commentStatus,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting comment:', insertError);
      return NextResponse.json({ error: 'Failed to save comment' }, { status: 500 });
    }

    console.log('Comment created successfully:', {
      commentId: comment?.id,
    });

    return NextResponse.json({
      success: true,
      comment,
    });
  } catch (error) {
    console.error('Error in POST /api/comments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
