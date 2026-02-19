# Deployment Guide

## Backend Deployment
Your backend is deployed at: **https://backend-ride-share.onrender.com**

## Frontend Deployment to Vercel

### Prerequisites
- Vercel account (sign up at https://vercel.com)
- Git repository with your code

### Environment Variables
The application uses the following environment variables:

- `VITE_API_BASE_URL` - Backend API URL
- `VITE_SOCKET_URL` - WebSocket server URL

These are already configured in:
- `.env` - Local development
- `.env.production` - Production deployment
- `vercel.json` - Vercel-specific configuration

### Deployment Steps

#### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
pnpm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy to production:
```bash
vercel --prod
```

4. Set up custom domain:
   - Go to Vercel Dashboard → Your Project → Settings → Domains
   - Add `rideshare.geniushackers.guru`
   - Follow the DNS configuration instructions

#### Option 2: Deploy via Vercel Dashboard

1. Push your code to GitHub/GitLab/Bitbucket

2. Go to https://vercel.com/new

3. Import your repository

4. Configure the project:
   - Framework Preset: **Vite**
   - Build Command: `pnpm build`
   - Output Directory: `dist`
   - Install Command: `pnpm install`

5. Add Environment Variables:
   - `VITE_API_BASE_URL` = `https://backend-ride-share.onrender.com`
   - `VITE_SOCKET_URL` = `https://backend-ride-share.onrender.com`

6. Click "Deploy"

7. After deployment, add custom domain:
   - Go to Project Settings → Domains
   - Add `rideshare.geniushackers.guru`
   - Configure DNS as instructed

### DNS Configuration for Custom Domain

Add the following DNS records to your domain provider for `rideshare.geniushackers.guru`:

**For Apex Domain (geniushackers.guru):**
- Type: A
- Name: @
- Value: 76.76.21.21 (Vercel IPv4)

**For Subdomain (rideshare.geniushackers.guru):**
- Type: CNAME
- Name: rideshare
- Value: cname.vercel-dns.com

### Verification

After deployment, test your application:

1. Visit https://rideshare.geniushackers.guru
2. Try logging in
3. Check that API calls are going to https://backend-ride-share.onrender.com
4. Test core features

### Troubleshooting

**If API calls fail:**
1. Check Vercel environment variables are set correctly
2. Verify backend is running at https://backend-ride-share.onrender.com
3. Check browser console for CORS errors
4. Ensure backend allows requests from your Vercel domain

**If build fails:**
1. Check that all dependencies are listed in package.json
2. Verify build script runs locally: `pnpm build`
3. Review Vercel build logs for specific errors

### Environment Files

- `.env` - Local development (not committed to git)
- `.env.example` - Template for environment variables
- `.env.production` - Production values (not committed to git)
- `vercel.json` - Vercel configuration with environment variables

### Important Notes

1. The `.env` and `.env.production` files are git-ignored for security
2. Environment variables in Vercel Dashboard will override `.env.production`
3. Always use environment variables for API URLs, never hardcode them
4. Test locally before deploying: `pnpm build && pnpm serve`

### CORS Configuration

Make sure your backend (https://backend-ride-share.onrender.com) allows requests from:
- `https://rideshare.geniushackers.guru`
- `https://*.vercel.app` (for preview deployments)

Add these origins to your backend CORS configuration.

### Continuous Deployment

Once connected to Git:
- Push to main branch → Auto-deploys to production
- Push to other branches → Creates preview deployments
- Pull requests → Creates preview deployments

## Support

If you encounter issues during deployment, check:
1. Vercel build logs
2. Browser console for errors
3. Network tab for failed API calls
4. Backend logs on Render
