This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Environment Variables Setup

**Important**: The build succeeds locally because it reads from `.env.local`, but Vercel needs environment variables configured in its dashboard for runtime.

#### Required Vercel Environment Variables:
```
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=your_paddle_client_token
NEXT_PUBLIC_PADDLE_ENV=sandbox
PADDLE_API_KEY=your_paddle_api_key
PADDLE_NOTIFICATION_WEBHOOK_SECRET=your_webhook_secret
```

#### How to Set in Vercel:
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable with the exact same names
4. **Important**: Use `NEXT_PUBLIC_` prefix for client-side variables
5. Redeploy after adding variables

#### Why This Matters:
- ✅ **Build time**: Reads from local `.env.local`
- ✅ **Runtime**: Reads from Vercel's environment variables
- ❌ **Client-side**: Only sees `NEXT_PUBLIC_*` variables from Vercel

**If you're seeing "All Paddle environments are set" in build but errors in browser, check Vercel env vars!**

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
