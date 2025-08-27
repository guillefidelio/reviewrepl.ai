# Supabase Migration Setup Guide

## 🚀 What's Been Created

Your project now has a complete Supabase setup alongside your existing Firebase configuration:

### New Files Created:
- `src/lib/supabase.ts` - Supabase client configuration with TypeScript types
- `src/components/auth/SupabaseAuthProvider.tsx` - New authentication provider using Supabase
- `src/app/supabase-login/page.tsx` - New login/signup page with Supabase auth
- `src/app/supabase-test/page.tsx` - Test page to verify Supabase connection
- `env-example.txt` - Environment variables template

### Updated Files:
- `src/app/layout.tsx` - Now uses SupabaseAuthProvider
- `src/app/page.tsx` - Added links to new Supabase pages

## 📋 Setup Steps

### 1. Environment Variables
Create a `.env.local` file in your project root with:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://aailoyciqgopysfowtso.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**To get your anon key:**
1. Go to your Supabase project: https://aailoyciqgopysfowtso.supabase.co
2. Navigate to **Settings** → **API**
3. Copy the **anon public** key

### 2. Test the Setup
1. **Start your development server**: `npm run dev`
2. **Visit the test page**: http://localhost:3000/supabase-test
3. **Check the connection status** - it should show "Ready" and "No Session"

### 3. Test User Creation
1. **Go to the login page**: http://localhost:3000/supabase-login
2. **Click "Don't have an account? Sign up"**
3. **Fill out the form** with test data
4. **Submit** - this will create a user in Supabase

### 4. Test User Login
1. **After signup**, you'll be redirected to dashboard
2. **Sign out** and go back to login
3. **Sign in** with the same credentials

## 🔧 How It Works

### Authentication Flow:
1. **Sign Up**: Creates user in Supabase Auth + profile in `users` table
2. **Sign In**: Authenticates with Supabase Auth
3. **Session Management**: Automatically handles auth state changes
4. **Profile Creation**: Automatically creates user profile on first signup

### Database Structure:
- **`users`** table: User profiles with credits and preferences
- **`business_profiles`** table: Business information and AI settings
- **`prompts`** table: Custom AI prompts for review responses
- **Row Level Security**: Users can only access their own data

## 🧪 Testing Checklist

- [ ] Supabase connection test page loads without errors
- [ ] Can create a new user account
- [ ] User profile is created in database
- [ ] Can sign in with created account
- [ ] Session persists across page refreshes
- [ ] Can sign out successfully

## 🚨 Troubleshooting

### Common Issues:

1. **"Missing Supabase configuration"**
   - Check your `.env.local` file has the correct variables
   - Restart your dev server after adding environment variables

2. **"Invalid API key"**
   - Verify you copied the correct anon key from Supabase dashboard
   - Make sure there are no extra spaces or characters

3. **"Database connection failed"**
   - Check that your Supabase project is active
   - Verify the database schema was created successfully

4. **"User profile creation failed"**
   - Check the browser console for detailed error messages
   - Verify the `users` table exists in your Supabase database

## 🔄 Next Steps

Once basic authentication is working:

1. **Test the complete user flow** (signup → login → dashboard)
2. **Verify data persistence** in Supabase dashboard
3. **Test Google OAuth** (requires additional Supabase configuration)
4. **Migrate existing user data** (if needed)
5. **Update other components** to use Supabase instead of Firebase

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 🆘 Need Help?

If you encounter issues:
1. Check the browser console for error messages
2. Verify your environment variables are correct
3. Check the Supabase dashboard for any error logs
4. Ensure your database schema was created successfully
