# Supabase authentication setup

The authentication routes are implemented with Supabase Auth and `@supabase/ssr`. Live authentication needs a Supabase project and provider settings; no credentials belong in this repository.

## Local environment

Create `.env.local` in the project root with:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable-or-anon-key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Use either the project's publishable/anon key. Never use a service-role key in a `NEXT_PUBLIC_` variable. `.env.local` is ignored by Git.

## Supabase Auth settings

1. In **Authentication → URL Configuration**, set the local Site URL to `http://localhost:3000`.
2. Add `http://localhost:3000/auth/callback` to the allowed redirect URLs.
3. Enable email confirmations and verify that confirmation links return to `/auth/callback`.
4. In production, set `NEXT_PUBLIC_SITE_URL` to the deployed HTTPS origin and add its `/auth/callback` URL to the allowlist.
5. Verify the email confirmation and password recovery templates use Supabase's confirmation URL so the callback can exchange the one-time authorization code.

## Google OAuth

1. Configure a Google OAuth consent screen and web client in Google Cloud.
2. Use the callback URL shown in the Supabase Google provider settings as Google's authorized redirect URI. This is the Supabase Auth callback, not the StudyBench callback.
3. Add the Google client ID and secret in **Supabase → Authentication → Providers → Google**. Keep the secret in Supabase only.
4. Keep the StudyBench `/auth/callback` URL in Supabase's allowed redirect URLs. StudyBench exchanges the authorization code and establishes the cookie session there.

## Phase 1 acceptance checks

After configuration, verify manually that:

- Signup rejects invalid email, weak or mismatched passwords, and missing terms consent.
- Signup sends a confirmation email; following it establishes a session and opens `/dashboard`.
- Login rejects incorrect credentials and preserves a safe local `next` destination.
- Google login succeeds, while denied consent and invalid callbacks return a readable error.
- A logged-out visit to `/dashboard` redirects to login; a logged-in visit to `/login` or `/signup` redirects to the dashboard.
- Forgot password sends a non-enumerating response; the recovery callback allows a new password and the new password can log in.
- Logout clears the session and returns to the public landing page.

The current workspace has no Supabase project credentials, so these provider-backed checks cannot run here. Phase 1 itself needs no migration. Before testing profile creation and onboarding, apply `supabase/migrations/20261108000000_identity_and_onboarding.sql`; it creates the profile and student-role records when an auth user is created and backfills existing auth users.
