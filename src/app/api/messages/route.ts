import { createClient } from '@/lib/supabase/server'
import { generateConversationId } from '@/lib/utils/conversation'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get recent messages where user is sender or receiver (bounded)
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Group by conversation_id, track latest message + other user ID + unread count
  const conversationMap = new Map<string, {
    conversation_id: string
    latest_message: typeof messages[0]
    other_user_id: string
    unread_count: number
  }>()

  for (const msg of messages ?? []) {
    const existing = conversationMap.get(msg.conversation_id)
    const isReceiver = msg.receiver_id === user.id
    const otherUserId = isReceiver ? msg.sender_id : msg.receiver_id

    if (!existing) {
      conversationMap.set(msg.conversation_id, {
        conversation_id: msg.conversation_id,
        latest_message: msg,
        other_user_id: otherUserId,
        unread_count: isReceiver && !msg.read ? 1 : 0,
      })
    } else {
      if (isReceiver && !msg.read) {
        existing.unread_count += 1
      }
    }
  }

  const grouped = Array.from(conversationMap.values())

  // Fetch other users' profiles in one query
  const otherUserIds = [...new Set(grouped.map(c => c.other_user_id))]
  const { data: profiles } = otherUserIds.length > 0
    ? await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', otherUserIds)
    : { data: [] }

  const profileMap = new Map((profiles ?? []).map(p => [p.id, p]))

  const conversations = grouped.map(c => ({
    conversation_id: c.conversation_id,
    latest_message: c.latest_message,
    other_user: profileMap.get(c.other_user_id) ?? null,
    unread_count: c.unread_count,
  }))

  return NextResponse.json(conversations)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { receiver_id, content, project_id } = body

  if (!receiver_id || typeof receiver_id !== 'string') {
    return NextResponse.json({ error: 'receiver_id is required' }, { status: 400 })
  }

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return NextResponse.json({ error: 'content is required' }, { status: 400 })
  }

  if (receiver_id === user.id) {
    return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 })
  }

  const conversation_id = generateConversationId(user.id, receiver_id)

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id,
      sender_id: user.id,
      receiver_id,
      content: content.trim(),
      project_id: project_id ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
