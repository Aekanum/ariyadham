# Supabase Authentication Setup Guide

This document provides step-by-step instructions for configuring Supabase Authentication for the Ariyadham project.

## Prerequisites

- A Supabase account (create at https://supabase.com)
- Project database already created (Story 1.2)

## 1. Create Supabase Project (if not done)

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in:
   - **Name**: Ariyadham (or preferred name)
   - **Database Password**: (choose a strong password)
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait for project to be provisioned (~2 minutes)

## 2. Get API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: (starts with `eyJ...`)
   - **service_role key**: (starts with `eyJ...`) - **Keep this secret!**

3. Create `.env.local` file in project root:

```bash
# Copy from .env.example and fill in your values
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 3. Run Database Migrations

Apply the database schema from Story 1.2:

```bash
# In Supabase Dashboard → SQL Editor
# Copy and paste content from migrations/001_create_base_tables.sql
# Click "Run" to execute
```

## 4. Configure Email Authentication

1. Go to **Authentication** → **Settings** in Supabase dashboard
2. Under **Auth Providers**, enable **Email**
3. Configure email settings:
   - **Enable email confirmations**: Toggle ON (recommended for production)
   - **Disable email confirmations**: Toggle ON for development (optional)
   - **Secure email change**: Keep enabled
   - **Email templates**: Customize if needed

### Email Templates

You can customize the following templates under **Authentication** → **Email Templates**:

- **Confirm signup**: Sent when user signs up
- **Magic Link**: Sent for passwordless login
- **Change Email Address**: Sent when user changes email
- **Reset Password**: Sent when user requests password reset

**Recommended customization:**
- Add your logo
- Update branding colors
- Adjust wording to match Ariyadham's tone

## 5. Configure Google OAuth (Recommended)

### 5.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Configure OAuth consent screen if prompted:
   - User Type: External
   - App name: Ariyadham
   - User support email: your email
   - Developer contact: your email
6. Select **Web application**
7. Add authorized redirect URIs:
   ```
   https://xxxxx.supabase.co/auth/v1/callback
   ```
   Replace `xxxxx` with your Supabase project ID
8. Click **Create**
9. Copy the **Client ID** and **Client Secret**

### 5.2 Enable Google in Supabase

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Google** and click to expand
3. Toggle **Enable Sign in with Google**
4. Paste your **Client ID** and **Client Secret**
5. Click **Save**

## 6. Configure Facebook OAuth (Optional)

### 6.1 Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Select **Consumer** as app type
4. Fill in app details:
   - App name: Ariyadham
   - App contact email: your email
5. In app dashboard, add **Facebook Login** product
6. Configure **Facebook Login** settings:
   - Valid OAuth Redirect URIs:
     ```
     https://xxxxx.supabase.co/auth/v1/callback
     ```
7. Copy **App ID** and **App Secret** from Settings → Basic

### 6.2 Enable Facebook in Supabase

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Facebook** and click to expand
3. Toggle **Enable Sign in with Facebook**
4. Paste your **App ID** and **App Secret**
5. Click **Save**

## 7. Configure URL Settings

1. Go to **Authentication** → **URL Configuration**
2. Set the following URLs:

   - **Site URL**: `http://localhost:3000` (dev) or `https://ariyadham.com` (prod)
   - **Redirect URLs**: Add all allowed redirect URLs:
     ```
     http://localhost:3000/**
     https://ariyadham.com/**
     ```

## 8. Configure Session Settings

1. Go to **Authentication** → **Settings**
2. Configure session timeouts:
   - **JWT expiry**: 3600 (1 hour) - default
   - **Refresh token expiry**: 604800 (7 days) - default
   - **Minimum password length**: 6 characters

## 9. Row Level Security (RLS) Policies

RLS policies are already included in the database migration (`migrations/001_create_base_tables.sql`). Verify they're active:

1. Go to **Database** → **Tables**
2. Select any table (e.g., `users`, `articles`)
3. Click **RLS** tab
4. Ensure **RLS is enabled** and policies are listed

## 10. Test Authentication

### Test Email/Password Signup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3000/signup

3. Create a test account:
   - Email: test@example.com
   - Password: test123

4. Check Supabase dashboard → **Authentication** → **Users**
   - You should see the new user

5. Try logging in at http://localhost:3000/login

### Test Google OAuth

1. Navigate to http://localhost:3000/login
2. Click "Sign in with Google"
3. Complete Google OAuth flow
4. Verify user appears in Supabase dashboard

### Test Password Reset

1. Navigate to http://localhost:3000/forgot-password
2. Enter your email
3. Check your email for reset link
4. Click link and set new password
5. Try logging in with new password

## 11. Production Checklist

Before deploying to production:

- [ ] Enable email confirmations in Supabase
- [ ] Update Site URL to production domain
- [ ] Add production domain to Redirect URLs
- [ ] Update OAuth redirect URIs in Google/Facebook
- [ ] Verify RLS policies are active on all tables
- [ ] Test all auth flows in production environment
- [ ] Enable rate limiting (if available)
- [ ] Configure SMTP for custom email sending (optional)
- [ ] Review and customize email templates
- [ ] Set up monitoring for auth failures

## Troubleshooting

### "Invalid API key"
- Verify `.env.local` has correct values
- Restart development server after changing `.env.local`
- Check that keys match Supabase dashboard

### "Signup failed"
- Check browser console for errors
- Verify Supabase project is not paused
- Check RLS policies allow INSERT on users table
- Verify email provider is enabled

### "OAuth redirect failed"
- Verify redirect URI in OAuth provider matches Supabase
- Check that provider is enabled in Supabase
- Ensure Site URL is configured correctly

### "Session expired too quickly"
- Check JWT expiry settings in Supabase
- Verify refresh token is being used correctly
- Check browser localStorage for session data

## Security Best Practices

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Use service role key only on server** - Never expose to client
3. **Enable RLS on all tables** - Already done in migrations
4. **Validate input on server** - Always validate in API routes
5. **Use HTTPS in production** - Required for OAuth
6. **Rotate keys periodically** - Especially if compromised
7. **Monitor auth logs** - Check for suspicious activity
8. **Limit failed login attempts** - Configure in Supabase (future)

## Support Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Supabase Discord](https://discord.supabase.com)

---

**Story 1.3 Complete**: Authentication infrastructure is now fully configured and ready for development.
