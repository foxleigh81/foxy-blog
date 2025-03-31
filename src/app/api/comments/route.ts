import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

// Define simple types that avoid the complex Supabase generics
type DBProfile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  is_moderator: boolean;
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
    display_name: string;
    avatar_url: string | null;
    is_moderator: boolean;
  };
  parent_id: string | null;
};

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

    const cookieStore = await cookies();
    // @ts-expect-error - cookies() returns Promise in Next.js 15
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

    // Get the session first
    const {
      data: { session },
    } = await supabase.auth.getSession();
    console.log('Session in GET:', { hasSession: !!session, userId: session?.user?.id });

    // Start building query for comments
    let query = supabase
      .from('comments')
      .select('*', { count: 'exact' })
      // @ts-expect-error - post_id is a string
      .eq('post_id', postId);

    // Only include approved comments if includePending is false
    if (!includePending) {
      // @ts-expect-error - status is a string
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

    if (!comments) {
      return NextResponse.json({ comments: [], total: 0, page, limit });
    }

    // Type assertion to make TypeScript happy
    const safeComments = comments as unknown as DBComment[];

    // Get user profiles for all comments
    const userIds = safeComments.map((comment) => comment.user_id);
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, is_moderator')
      // @ts-expect-error - userIds is an array of strings
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    if (!profiles) {
      return NextResponse.json({ error: 'Failed to fetch user profiles' }, { status: 500 });
    }

    // Type assertion for profiles
    const safeProfiles = profiles as unknown as DBProfile[];

    // Create a map of user profiles
    const profilesMap: Record<string, DBProfile> = {};
    for (const profile of safeProfiles) {
      profilesMap[profile.id] = profile;
    }

    // Transform the response to match the expected format
    const transformedComments: Comment[] = safeComments.map((comment) => {
      const profile = profilesMap[comment.user_id];
      if (!profile) {
        // Handle missing profile gracefully
        return {
          id: comment.id,
          content: comment.content,
          created_at: comment.created_at,
          status: comment.status,
          parent_id: comment.parent_id,
          user: {
            id: comment.user_id,
            display_name: 'Anonymous',
            avatar_url: null,
            is_moderator: false,
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
          display_name: profile.display_name || 'Anonymous',
          avatar_url: profile.avatar_url,
          is_moderator: profile.is_moderator,
        },
      };
    });

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
    /* @next-codemod-ignore */
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({
      // @ts-expect-error - cookies() returns Promise in Next.js 15
      cookies: () => cookieStore,
    });

    // Get the session using the auth client
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error('Error getting session:', error);
      return NextResponse.json({ error: 'Authentication error' }, { status: 401 });
    }

    if (!session) {
      console.error('No session found');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

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
      // @ts-expect-error - id is a string
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json({ error: 'Error fetching user profile' }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Type assertion for profile
    const safeProfile = profile as unknown as DBProfile;

    // Determine the comment status based on user's moderator status
    const commentStatus = safeProfile.is_moderator ? 'approved' : status || 'pending';

    // Create comment data with proper type
    const commentData = {
      content,
      post_id: postId,
      user_id: user.id,
      parent_id: parentId || null,
      mentions,
      status: commentStatus,
    };

    // Insert the comment
    const { data: comment, error: insertError } = await supabase
      .from('comments')
      // @ts-expect-error - commentData is an object
      .insert(commentData)
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting comment:', insertError);
      return NextResponse.json({ error: 'Failed to save comment' }, { status: 500 });
    }

    // Type assertion for the returned comment
    const safeComment = comment as unknown as DBComment;

    console.log('Comment created successfully:', {
      commentId: safeComment.id,
      status: commentStatus,
    });

    return NextResponse.json({
      success: true,
      comment: safeComment,
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create comment' },
      { status: 500 }
    );
  }
}
