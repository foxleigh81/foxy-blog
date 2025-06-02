import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/utils/supabase-server';
import ModeratorDashboard from '@/components/Moderator/ModeratorDashboard';

/**
 * Moderator-only page that displays the moderator dashboard
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {displayName}</h1>
          <p className="text-gray-600">Moderator Dashboard - Manage comments and users</p>
        </div>

        <ModeratorDashboard />
      </div>
    </div>
  );
}
