import { createClient } from '@/lib/supabase/server'
import { generateConversationId } from '@/lib/utils/conversation'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get all messages where user is sender or receiver
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*, profiles!sender_id(username, display_name, avatar_url), profiles!receiver_id(username, display_name, avatar_url)')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Group by conversation_id, return latest message + other user's profile + unread count
  const conversationMap = new Map<string, {
    conversation_id: string
    latest_message: typeof messages[0]
    other_user: { username: string; display_name: string | null; avatar_url: string | null }
    unread_count: number
  }>()

  for (const msg of messages ?? []) {
    const existing = conversationMap.get(msg.conversation_id)

    const isReceiver = msg.receiver_id === user.id
    const otherProfile = isReceiver
      ? msg.profiles_sender_id as { username: string; display_name: string | null; avatar_url: string | null }
      : msg.profiles_receiver_id as { username: string; display_name: string | null; avatar_url: string | null }

    if (!existing) {
      conversationMap.set(msg.conversation_id, {
        conversation_id: msg.conversation_id,
        latest_message: msg,
        other_user: otherProfile,
        unread_count: isReceiver && !msg.read ? 1 : 0,
      })
    } else {
      if (isReceiver && !msg.read) {
        existing.unread_count += 1
      }
    }
  }

  const conversations = Array.from(conversationMap.values())
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
