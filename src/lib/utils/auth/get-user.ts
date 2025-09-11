import { createClient } from '@/lib/utils/supabase/server';

export async function getUser() {
  try {
    const supabase = await createClient();

    // Get session from cookies - this should work with middleware
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    console.log('🔍 Server-side auth check:', {
      hasSession: !!sessionData.session,
      hasUser: !!sessionData.session?.user,
      sessionError: sessionError?.message,
      userId: sessionData.session?.user?.id,
      userEmail: sessionData.session?.user?.email
    });

    if (sessionError) {
      console.error('❌ Session error:', sessionError.message);
      return null;
    }

    if (!sessionData.session?.user) {
      console.log('❌ No session/user found on server-side');
      return null;
    }

    console.log('✅ User found on server-side:', {
      id: sessionData.session.user.id,
      email: sessionData.session.user.email
    });

    return sessionData.session.user;
  } catch (error) {
    console.error('❌ Error in getUser:', error);
    return null;
  }
}
