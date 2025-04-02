import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Initialize Supabase client with service role key to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('API: Missing Supabase URL or service role key');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Create an admin client that bypasses RLS
    const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { userId, username, avatarUrl } = await request.json();

    if (!userId || !username) {
      return NextResponse.json({ error: 'User ID and username are required' }, { status: 400 });
    }

    // First check if the profile already exists
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('API: Error checking for existing profile:', checkError);
      return NextResponse.json(
        { error: `Error checking for existing profile: ${checkError.message}` },
        { status: 500 }
      );
    }

    // If profile already exists, just return success
    if (existingProfile) {
      return NextResponse.json({
        success: true,
        message: 'Profile already exists',
        profile: existingProfile,
      });
    }

    // Create profile record using admin client which bypasses RLS
    const profileData = {
      id: userId,
      username,
      avatar_url: avatarUrl,
      is_moderator: false,
    };

    const { data: newProfile, error: insertError } = await supabaseAdmin
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (insertError) {
      console.error('API: Error creating profile:', insertError);
      return NextResponse.json(
        { error: `Failed to create profile: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: newProfile,
    });
  } catch (error) {
    console.error('API: Error in create-profile route:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create profile',
      },
      { status: 500 }
    );
  }
}
