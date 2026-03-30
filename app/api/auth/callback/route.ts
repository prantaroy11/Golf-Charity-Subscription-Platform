import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Fire-and-forget: send welcome email after successful confirmation
      if (data?.user) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? origin;
        fetch(`${siteUrl}/api/email/welcome`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: data.user.id,
            email: data.user.email,
            fullName: data.user.user_metadata?.full_name,
          }),
        }).catch((err) => console.error('Welcome email trigger failed:', err));
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with some instructions
  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`);
}
