import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/utils/supabase-server';

/**
 * Moderator-only page that displays a welcome message
 * Only accessible to users with moderator privileges
 */
export default async function ModeratorPage() {
  const supabase = await createSupabaseServerClient();

  // Get the current user session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // Redirect to home if not authenticated
  if (userError || !user) {
    redirect('/?auth=required');
  }

  // Get the user's profile to check moderator status
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('username, is_moderator')
    .eq('id', user.id)
    .single();

  // Redirect to home if profile not found or not a moderator
  if (profileError || !profile || !profile.is_moderator) {
    redirect('/?auth=unauthorized');
  }

  // Get display name (fallback to email prefix if no username)
  const displayName = profile.username || user.email?.split('@')[0] || 'Moderator';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-blue-900 mb-4">Welcome, {displayName}</h1>
          <p className="text-blue-700">You have successfully accessed the moderator dashboard.</p>
        </div>
      </div>
    </div>
  );
}
