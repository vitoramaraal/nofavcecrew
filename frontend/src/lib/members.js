import { getSupabase } from './supabase'

export async function fetchActiveMembers() {
  const client = getSupabase()

  const { data, error } = await client.rpc('list_active_members')

  if (error) {
    throw error
  }

  return data || []
}

export async function fetchMemberProfile(memberId) {
  const client = getSupabase()

  const { data, error } = await client.rpc('get_member_profile', {
    member_id: memberId,
  })

  if (error) {
    throw error
  }

  const member = Array.isArray(data) ? data[0] : data

  return member || null
}
