import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase-client';

export async function GET() {
  try {
    const supabase = createClient();

    // Test basic connection
    const { data: authData } = await supabase.auth.getSession();
    console.log('Current session:', authData);

    // Test database connection
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    console.log('Profiles query result:', profiles, profilesError);

    // Test if we can insert a test profile (you might want to remove this after testing)
    if (authData?.session?.user) {
      const testProfile = {
        id: authData.session.user.id,
        username: 'test_user',
        is_moderator: false,
        is_trusted: false,
      };

      const { data: insertResult, error: insertError } = await supabase
        .from('profiles')
        .upsert(testProfile)
        .select();

      console.log('Test profile insert result:', insertResult, insertError);
    }

    return NextResponse.json({
      session: authData?.session ? 'Found' : 'Not found',
      profiles: profiles?.length ?? 0,
      profilesError: profilesError?.message,
    });
  } catch (error) {
    console.error('Test auth error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
