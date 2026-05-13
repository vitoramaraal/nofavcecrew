import { getSupabase } from './supabase'

export async function fetchActiveMembers(memberId, accessCode) {
  const client = getSupabase()

  const { data, error } = await client.rpc('list_active_members', {
    active_member_id: memberId,
    secret_code: accessCode,
  })

  if (error) {
    throw error
  }

  return data || []
}

export async function fetchMemberProfile(memberId, accessCode) {
  const client = getSupabase()

  const { data, error } = accessCode
    ? await client.rpc('validate_member_session', {
        active_member_id: memberId,
        secret_code: accessCode,
      })
    : await client.rpc('get_member_profile', {
        member_id: memberId,
      })

  if (error) {
    throw error
  }

  const member = Array.isArray(data) ? data[0] : data

  return member || null
}
