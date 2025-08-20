# Firebase Configuration Setup

## Required Environment Variables

You need to create a `.env.local` file in the root of your project (`/website/web/.env.local`) with the following variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## How to Get These Values

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on the gear icon (Project Settings)
4. Scroll down to "Your apps" section
5. If you don't have a web app, click "Add app" and select the web icon (`</>`)
6. Copy the configuration values from the Firebase SDK snippet

## Important Notes

- All variables MUST start with `NEXT_PUBLIC_` to be available in the browser
- The `.env.local` file should be in the same directory as your `package.json`
- Never commit the `.env.local` file to version control (it's already in .gitignore)

## Current Issue

The error you're seeing is because the `.env.local` file is missing or the environment variables are not properly set. Please create this file with your actual Firebase credentials to resolve the authentication error.
