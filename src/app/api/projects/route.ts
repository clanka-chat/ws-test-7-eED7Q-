import { createClient } from '@/lib/supabase/server'
import { generateSlug } from '@/lib/utils/slug'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = request.nextUrl

  const mine = searchParams.get('mine') === 'true'
  const stage = searchParams.get('stage')
  const search = searchParams.get('search')

  if (mine) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let query = supabase
      .from('projects')
      .select('*, project_roles(*)')
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false })

    if (stage) query = query.eq('stage', stage)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  let query = supabase
    .from('projects')
    .select('*, project_roles(*), profiles!creator_id(username, display_name, avatar_url)')
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  if (stage) query = query.eq('stage', stage)
  if (search) query = query.ilike('name', `%${search}%`)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, description, stage, tech_stack, business_model, domain_plan, time_commitment, timezone, is_public } = body

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const slug = generateSlug(name)

  const { data, error } = await supabase
    .from('projects')
    .insert({
      slug,
      creator_id: user.id,
      name: name.trim(),
      description: description ?? null,
      stage: stage ?? 'idea',
      tech_stack: tech_stack ?? [],
      business_model: business_model ?? null,
      domain_plan: domain_plan ?? null,
      time_commitment: time_commitment ?? null,
      timezone: timezone ?? null,
      is_public: is_public ?? true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
