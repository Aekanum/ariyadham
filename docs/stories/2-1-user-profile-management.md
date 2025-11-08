# Story 2.1: User Profile Management

**Epic**: 2 - Authentication & User Management
**Status**: ✅ DONE
**Started**: 2025-11-08
**Completed**: 2025-11-08

---

## Story

**As a** user
**I want to** view and edit my profile (name, bio, avatar, language preference)
**So that** my account reflects who I am

---

## Acceptance Criteria

### ✅ Profile Viewing and Editing

**Given** a logged-in user navigates to their profile page
**When** they edit their name and bio
**Then** changes are saved to the database
**And** profile is updated immediately in the UI

**When** they upload a new avatar
**Then** image is optimized and stored (Supabase Storage)
**And** displayed in all user interactions

**And** user can set language preference (Thai/English)
**And** preference persists across sessions

### Implementation Checklist

- [ ] Create `/app/profile` page with profile form
- [ ] Implement profile update API endpoint
- [ ] Add avatar upload functionality with Supabase Storage
- [ ] Image optimization (resize to 200x200, 400x400)
- [ ] Language preference selector
- [ ] Profile data validation
- [ ] Update user context to include avatar
- [ ] Display avatar in navigation/header
- [ ] Add loading and error states

---

## Technical Implementation

### 1. Profile Page (`app/profile/page.tsx`)

**Features:**

- Profile form with fields:
  - Display Name (required, max 50 chars)
  - Bio (optional, max 500 chars)
  - Avatar upload
  - Language preference (Thai/English)
- Real-time form validation
- Optimistic UI updates
- Loading states during save
- Error handling and display

**Route:** `/profile` (authenticated only)

### 2. Avatar Upload System

**Upload Flow:**

1. User selects image file
2. Validate file type (jpg, png, webp) and size (max 5MB)
3. Client-side image preview
4. Upload to Supabase Storage bucket
5. Generate thumbnails (200x200, 400x400)
6. Update user profile with avatar URL
7. Delete old avatar if exists

**Storage:**

- Bucket: `avatars`
- Path: `{user_id}/avatar-{timestamp}.{ext}`
- Public access for display
- RLS policies for upload (own user only)

### 3. Profile API Endpoint (`app/api/profile/route.ts`)

**POST `/api/profile`**

Updates user profile information.

**Request:**

```json
{
  "displayName": "John Doe",
  "bio": "Meditation practitioner...",
  "avatarUrl": "https://...",
  "languagePreference": "th"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "displayName": "John Doe",
    "bio": "Meditation practitioner...",
    "avatarUrl": "https://...",
    "languagePreference": "th",
    "updatedAt": "2025-11-08T..."
  }
}
```

**Validations:**

- Display name: 1-50 characters
- Bio: 0-500 characters
- Language: "th" or "en" only
- Avatar URL: valid URL format

### 4. Database Schema Updates

**Table: `user_profiles`** (extends Supabase auth.users)

```sql
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(50) NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  language_preference VARCHAR(5) DEFAULT 'th',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view all profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON user_profiles FOR SELECT
  USING (true);

-- Users can update only their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Storage Bucket:**

```sql
-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Allow authenticated users to upload own avatar
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to update own avatar
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete own avatar
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Anyone can view avatars (public bucket)
CREATE POLICY "Avatars are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
```

### 5. Image Optimization

**Client-side optimization:**

- Use browser's Canvas API for resize
- Generate 200x200 thumbnail for lists/comments
- Generate 400x400 for profile pages
- Convert to WebP format if supported

**Server-side validation:**

- File type: image/jpeg, image/png, image/webp
- Max file size: 5MB
- Max dimensions: 2000x2000

### 6. User Context Updates

**Update `src/lib/auth/user-context.tsx`:**

```typescript
interface User {
  id: string;
  email: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  languagePreference: 'th' | 'en';
  role: 'reader' | 'author' | 'admin';
}
```

**Fetch profile on auth:**

- On user login/session restore, fetch profile from `user_profiles`
- Merge with Supabase auth user data
- Provide in context for all components

### 7. UI Components

**ProfileForm Component:**

- Form with controlled inputs
- Client-side validation
- Optimistic updates
- Error display
- Save button with loading state

**AvatarUpload Component:**

- Image picker/drop zone
- Image preview
- Crop/resize interface (optional for MVP)
- Upload progress indicator
- Delete current avatar button

**LanguageSelector Component:**

- Toggle or dropdown for Thai/English
- Updates user preference
- Triggers UI language change

---

## Files to Create/Modify

```
app/
├── profile/
│   └── page.tsx                    # Profile management page
├── api/
│   └── profile/
│       └── route.ts                # Profile update API
src/
├── components/
│   ├── profile/
│   │   ├── ProfileForm.tsx         # Profile edit form
│   │   ├── AvatarUpload.tsx        # Avatar upload component
│   │   └── LanguageSelector.tsx    # Language preference selector
├── lib/
│   ├── auth/
│   │   └── user-context.tsx        # Update with profile fields
│   └── utils/
│       └── image.ts                # Image optimization utilities
supabase/
└── migrations/
    └── 006_user_profiles.sql       # Profile table and storage
```

---

## Prerequisites

- Story 1.3 ✅ (Authentication Infrastructure)
- Story 1.6 ✅ (Core Utilities)

---

## Dependencies

**Existing:**

- `@supabase/supabase-js` - Supabase client
- `react-hook-form` - Form handling
- `zod` - Validation

**New (if needed):**

- `react-dropzone` - File upload (optional)
- `browser-image-compression` - Image optimization

---

## Quality Checks

### Type Safety

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

### Format

```bash
npm run format
```

### Manual Testing

- [ ] Profile page loads for authenticated user
- [ ] Form validates input correctly
- [ ] Profile updates save to database
- [ ] Avatar upload works and displays
- [ ] Image optimization creates correct sizes
- [ ] Language preference persists across sessions
- [ ] Avatar displays in navigation
- [ ] Unauthenticated users redirected to login
- [ ] Error states display properly
- [ ] Loading states work correctly

---

## Usage Examples

### Accessing Profile Page

```typescript
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import ProfileForm from '@/components/profile/ProfileForm';

export default async function ProfilePage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      <ProfileForm initialData={profile} />
    </div>
  );
}
```

### Avatar Upload

```typescript
import { useState } from 'react';
import { createClientSupabaseClient } from '@/lib/supabase/client';
import { optimizeImage } from '@/lib/utils/image';

export function AvatarUpload({ userId, currentAvatar, onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const supabase = createClientSupabaseClient();

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);

      // Optimize image
      const optimized = await optimizeImage(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.9,
      });

      // Upload to Supabase Storage
      const fileName = `${userId}/avatar-${Date.now()}.webp`;
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, optimized, {
          contentType: 'image/webp',
          upsert: true,
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: publicUrl }),
      });

      onUploadComplete(publicUrl);
    } catch (error) {
      console.error('Avatar upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
        disabled={uploading}
      />
      {currentAvatar && (
        <img src={currentAvatar} alt="Avatar" className="w-24 h-24 rounded-full" />
      )}
    </div>
  );
}
```

---

## Benefits

### For Users

1. **Personalization**: Express identity through profile
2. **Recognition**: Avatar makes users identifiable in community
3. **Localization**: Language preference improves experience
4. **Trust**: Complete profiles build community trust

### For Platform

1. **Engagement**: Personalized profiles increase attachment
2. **Community**: Users feel more connected
3. **Quality**: Complete profiles indicate engaged users
4. **Analytics**: Profile data enables better insights

---

## Security Considerations

### Authentication

- All profile endpoints require authentication
- Users can only modify their own profiles
- RLS policies enforce data access control

### File Upload

- Validate file types (images only)
- Limit file size (5MB max)
- Scan for malicious content (future enhancement)
- Use signed URLs for sensitive operations

### Data Validation

- Sanitize all input fields
- Validate data types and lengths
- Prevent XSS in bio field
- Escape user-generated content

### Privacy

- Profile data visibility controlled by user (future)
- No sensitive information in profiles
- Avatar URLs are public by design
- Email addresses not displayed publicly

---

## Accessibility

- Proper form labels for screen readers
- Keyboard navigation support
- File input accessible
- Error messages announced
- Focus management
- Alt text for avatar images

---

## Next Steps

After completing Story 2.1:

### Story 2.2: User Roles & Permissions

Implement role-based access control (reader, author, admin).

### Story 2.3: Author Approval Workflow

Create system for users to request author status.

### Story 2.4: User Preferences & Settings

Expand settings with theme, font size, and additional preferences.

---

## References

- **Epic Definition**: `docs/epics.md` (Story 2.1, lines 245-274)
- **Architecture**: `docs/architecture.md`
- **PRD**: `docs/PRD.md`
- **Supabase Storage Docs**: https://supabase.com/docs/guides/storage
- **Image Optimization**: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API

---

## Implementation Notes

### Design Principles

1. **User-First**: Make profile editing intuitive and fast
2. **Progressive Enhancement**: Basic functionality works without JS
3. **Performance**: Optimize images for fast loading
4. **Privacy**: Users control their data
5. **Accessibility**: All users can manage profiles

### Best Practices

- Use optimistic UI updates for better UX
- Validate client and server-side
- Handle errors gracefully
- Provide clear feedback
- Test on various devices
- Consider offline state (future)

---

🙏 May this feature help users express their identity in the dharma community.
