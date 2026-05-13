import { getSupabase } from './supabase'

export async function fetchChatMessages() {
  const client = getSupabase()

  const { data, error } = await client.rpc('list_chat_messages')

  if (error) {
    throw error
  }

  return (data || []).map((item) => ({
    id: item.id,
    body: item.body,
    created_at: item.created_at,
    member_id: item.member_id,
    members: {
      full_name: item.member_full_name,
      member_number: item.member_number,
      role: item.member_role,
    },
  }))
}

export async function createChatMessage(memberId, body) {
  const client = getSupabase()

  const { error } = await client.rpc('create_chat_message', {
    active_member_id: memberId,
    message_body: body.trim(),
  })

  if (error) {
    throw error
  }
}
