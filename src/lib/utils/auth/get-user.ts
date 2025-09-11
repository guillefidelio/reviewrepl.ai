import { createClient } from '@/lib/utils/supabase/server';

export async function getUser() {
  try {
    const supabase = await createClient();

    // Get session from cookies
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

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
