'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectHandler() {
  const router = useRouter();

  useEffect(() => {
    // Get the stored return path from localStorage
    const returnTo = localStorage.getItem('auth_return_to') || '/';

    // Clean up localStorage
    localStorage.removeItem('auth_return_to');

    console.log('Redirecting to stored path:', returnTo);

    // Redirect to the stored path
    router.replace(returnTo);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
