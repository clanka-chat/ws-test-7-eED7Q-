import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  // Prevent open redirect — only allow relative paths
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Safety check: ensure profile exists (trigger may not have fired)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single()

        if (!profile) {
          const meta = user.user_metadata
          await supabase.from('profiles').insert({
            id: user.id,
            username: meta.user_name ?? meta.preferred_username ?? user.id.slice(0, 8),
            display_name: meta.full_name ?? meta.name ?? null,
            avatar_url: meta.avatar_url ?? null,
            github_username: meta.user_name ?? null,
          })
        }
      }

      return NextResponse.redirect(`${origin}${safeNext}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
