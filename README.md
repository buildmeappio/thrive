This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Environment Setup

1. Create a `.env.local` file in the root directory with the following variables:

```bash
# Google Maps API Configuration
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_maps_api_key_here

# Database Configuration
DATABASE_URL=your_database_url_here

# AWS Configuration (if using AWS services)
AWS_REGION=your_aws_region
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET_NAME=your_s3_bucket_name

# OAuth Configuration (if using Google OAuth)
OAUTH_CLIENT_ID=your_oauth_client_id
OAUTH_CLIENT_SECRET=your_oauth_client_secret
OAUTH_REFRESH_TOKEN=your_oauth_refresh_token
OAUTH_USERNAME=your_oauth_username

# JWT Secrets
JWT_OTP_TOKEN_SECRET=your_JWT_OTP_TOKEN_secret
JWT_OTP_TOKEN_SECRET_EXPIRY=your_JWT_OTP_TOKEN_secret_expiry
JWT_SET_PASSWORD_TOKEN_SECRET=your_JWT_SET_PASSWORD_TOKEN_secret
JWT_SET_PASSWORD_TOKEN_SECRET_EXPIRY=your_JWT_SET_PASSWORD_TOKEN_secret_expiry
JWT_FORGET_PASSWORD_TOKEN_SECRET=your_JWT_FORGET_PASSWORD_TOKEN_secret
JWT_FORGET_PASSWORD_TOKEN_EXPIRY=your_JWT_FORGET_PASSWORD_TOKEN_secret_expiry
JWT_EXAMINER_INFO_REQUEST_TOKEN_SECRET=your_JWT_EXAMINER_INFO_REQUEST_TOKEN_SECRET
JWT_EXAMINER_INFO_REQUEST_TOKEN_SECRET_EXPIRY=your_JWT_EXAMINER_INFO_REQUEST_TOKEN_SECRET_expiry

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CDN_URL=your_cdn_url
```

2. **Google Maps API Setup:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create a new project or select an existing one
   - Enable the following APIs:
     - Maps JavaScript API
     - Places API
   - Create credentials (API Key)
   - Add the API key to your `.env.local` file as `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY`

### Development Server

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
