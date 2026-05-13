import { getSupabase } from './supabase'

export async function verifyMember(memberId) {
  const client = getSupabase()

  const { data, error } = await client.rpc('verify_member', {
    member_id: memberId,
  })

  if (error) {
    throw error
  }

  const member = Array.isArray(data) ? data[0] : data

  return member || null
}
