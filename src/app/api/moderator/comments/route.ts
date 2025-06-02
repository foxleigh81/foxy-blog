import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabase-server';
import { sanityClient } from '@/sanity/lib/client';

interface PostData {
  _id: string;
  title: string;
  slug: string;
  category: string;
}

/**
 * GET endpoint to fetch unapproved comments for moderation
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

    // Fetch unapproved comments (pending and rejected)
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select(
        `
        id,
        content,
        created_at,
        status,
        post_id,
        profiles:user_id (
          id,
          username,
          avatar_url
        )
      `
      )
      .in('status', ['pending', 'rejected'])
      .order('created_at', { ascending: false });

    if (commentsError) {
      console.error('Error fetching unapproved comments:', commentsError);
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }

    // Get unique post IDs to fetch post information from Sanity
    const postIds = [...new Set(comments?.map((comment) => comment.post_id) || [])];

    // Fetch post information from Sanity
    const postsQuery = `*[_id in $postIds] {
      _id,
      title,
      "slug": slug.current,
      "category": categories[0]->slug.current
    }`;

    const posts = await sanityClient.fetch<PostData[]>(postsQuery, { postIds });

    // Create a map for quick post lookup
    const postsMap = new Map(posts.map((post: PostData) => [post._id, post]));

    // Transform the data to match the expected format
    const transformedComments =
      comments?.map((comment) => {
        const post = postsMap.get(comment.post_id);

        return {
          id: comment.id,
          content: comment.content,
          created_at: comment.created_at,
          status: comment.status,
          post_id: comment.post_id,
          user: {
            id: comment.profiles?.id || '',
            username: comment.profiles?.username || null,
            avatar_url: comment.profiles?.avatar_url || null,
          },
          post: post
            ? {
                title: post.title,
                slug: post.slug,
                category: post.category,
                url: `/${post.category}/${post.slug}`,
              }
            : null,
        };
      }) || [];

    return NextResponse.json({
      success: true,
      comments: transformedComments,
      total: transformedComments.length,
    });
  } catch (error) {
    console.error('Error in moderator comments endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
