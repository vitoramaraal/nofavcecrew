import { getSupabase } from './supabase'

export async function fetchMemberEvents(memberId, accessCode) {
  const client = getSupabase()

  const { data, error } = await client.rpc('list_member_events', {
    active_member_id: memberId,
    secret_code: accessCode,
  })

  if (error) {
    throw error
  }

  return data || []
}

export async function setEventRsvp(memberId, accessCode, eventId, status) {
  const client = getSupabase()

  const { error } = await client.rpc('set_event_rsvp', {
    active_member_id: memberId,
    secret_code: accessCode,
    target_event_id: eventId,
    rsvp_status: status,
  })

  if (error) {
    throw error
  }
}

export async function checkInEventMember(eventId, memberId) {
  const client = getSupabase()

  const { error } = await client.rpc('check_in_event_member', {
    target_event_id: eventId,
    target_member_id: memberId,
  })

  if (error) {
    throw error
  }
}
