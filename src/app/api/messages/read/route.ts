import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { conversation_id } = body

  if (!conversation_id || typeof conversation_id !== 'string') {
    return NextResponse.json({ error: 'conversation_id is required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('conversation_id', conversation_id)
    .eq('receiver_id', user.id)
    .eq('read', false)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
