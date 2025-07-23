# OAuth Setup Guide

This guide explains how to set up OAuth authentication for TaskMaster UI with Google and GitHub.

## Overview

TaskMaster UI supports social authentication through OAuth 2.0 with the following providers:
- Google
- GitHub

The authentication flow is handled securely on the backend using Passport.js strategies.

## Prerequisites

1. TaskMaster UI backend running on `http://localhost:3001`
2. TaskMaster UI frontend running on `http://localhost:5174`
3. Developer accounts for OAuth providers you want to use

## Google OAuth Setup

### 1. Create Google OAuth Application

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Select "Web application" as the application type
6. Configure the following:
   - **Authorized JavaScript origins**: 
     - `http://localhost:3001` (backend)
     - `http://localhost:5174` (frontend)
   - **Authorized redirect URIs**: 
     - `http://localhost:3001/api/auth/google/callback`

### 2. Configure Environment Variables

Add to `packages/backend/.env`:
```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
```

## GitHub OAuth Setup

### 1. Create GitHub OAuth Application

1. Go to GitHub Settings → [Developer settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - **Application name**: TaskMaster UI (Development)
   - **Homepage URL**: `http://localhost:5174`
   - **Authorization callback URL**: `http://localhost:3001/api/auth/github/callback`

### 2. Configure Environment Variables

Add to `packages/backend/.env`:
```env
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:3001/api/auth/github/callback
```

## Frontend Configuration

The frontend automatically detects available OAuth providers based on backend configuration. 
To enable/disable social login buttons, update `packages/frontend/.env`:

```env
VITE_TASKMASTER_ENABLE_SOCIAL_LOGIN=true
VITE_TASKMASTER_OAUTH_PROVIDERS=google,github
```

## Testing OAuth Flow

1. Start the backend server:
   ```bash
   cd packages/backend
   pnpm run dev
   ```

2. Start the frontend server:
   ```bash
   cd packages/frontend
   pnpm run dev
   ```

3. Navigate to `http://localhost:5174/auth`

4. Click on "Continue with Google" or "Continue with GitHub"

5. You should be redirected to the OAuth provider, then back to the application

## Troubleshooting

### Common Issues

1. **"Redirect URI mismatch" error**
   - Ensure the callback URLs in your OAuth app settings match exactly with the ones in `.env`
   - Check that the protocol (http/https) matches

2. **"OAuth failed" error**
   - Check backend logs for detailed error messages
   - Verify all environment variables are set correctly
   - Ensure the backend server is running

3. **Social login buttons not appearing**
   - Check that `VITE_TASKMASTER_ENABLE_SOCIAL_LOGIN` is set to `true`
   - Verify the backend OAuth routes are accessible

### Debug Mode

Enable OAuth debug logging by setting:
```env
# Frontend
VITE_TASKMASTER_ENABLE_OAUTH_DEBUG=true

# Backend
DEBUG=passport:*
```

## Production Considerations

1. **Use HTTPS**: OAuth providers require HTTPS in production
2. **Update callback URLs**: Change all localhost URLs to your production domain
3. **Secure storage**: Never commit OAuth secrets to version control
4. **Rate limiting**: Implement rate limiting on OAuth endpoints
5. **Error handling**: Implement proper error pages for OAuth failures

## Security Best Practices

1. Always validate OAuth tokens on the backend
2. Use PKCE (Proof Key for Code Exchange) for additional security
3. Implement CSRF protection on OAuth endpoints
4. Store tokens securely (encrypted in database)
5. Implement token rotation and expiration
6. Log OAuth events for security monitoring