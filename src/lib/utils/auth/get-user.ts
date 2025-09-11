import { createClient } from '@/lib/utils/supabase/server';
import { cookies } from 'next/headers';

export async function getUser() {
  try {
    // Debug: Log cookie information
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    console.log('🔍 Server-side cookies:', allCookies.map(c => ({ name: c.name, value: c.value.substring(0, 50) + '...' })));

    const supabase = await createClient();

    // Try to get session first (more reliable than getUser)
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log('🔍 Session data:', {
      hasSession: !!sessionData.session,
      sessionError: sessionError?.message,
      userId: sessionData.session?.user?.id
    });

    // Also try getUser as backup
    const { data: userData, error: userError } = await supabase.auth.getUser();
    console.log('🔍 User data:', {
      hasUser: !!userData.user,
      userError: userError?.message,
      userId: userData.user?.id
    });

    // Return user from session if available, otherwise from getUser
    const user = sessionData.session?.user || userData.user;

    if (!user) {
      console.log('❌ No user found on server-side');
      return null;
    }

    console.log('✅ User found on server-side:', { id: user.id, email: user.email });
    return user;
  } catch (error) {
    console.error('❌ Error in getUser:', error);
    return null;
  }
}
