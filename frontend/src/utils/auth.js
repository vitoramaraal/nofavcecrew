import { getSupabase } from '../lib/supabase'

const authKey = 'nofvce-auth'
const memberKey = 'nofvce-member'
const memberAccessCodeKey = 'nofvce-member-access-code'

export async function loginWithAccessCode(accessCode) {
  const client = getSupabase()

  const { data, error } = await client.rpc('authenticate_member', {
    secret_code: accessCode.trim(),
  })

  if (error) {
    throw error
  }

  const member = Array.isArray(data) ? data[0] : data

  if (!member) {
    throw new Error('Codigo de acesso invalido.')
  }

  saveMemberSession(member, accessCode.trim())

  return member
}

export async function validateStoredMemberSession() {
  const currentMember = getCurrentMember()
  const accessCode = getStoredAccessCode()

  if (
    !currentMember?.id ||
    !accessCode ||
    localStorage.getItem(authKey) !== 'true'
  ) {
    logout()
    return null
  }

  const client = getSupabase()

  const { data, error } = await client.rpc('validate_member_session', {
    active_member_id: currentMember.id,
    secret_code: accessCode,
  })

  if (error) {
    throw error
  }

  const member = Array.isArray(data) ? data[0] : data

  if (!member) {
    logout()
    return null
  }

  saveMemberSession(member, accessCode)

  return member
}

export function updateStoredMember(member) {
  const accessCode = getStoredAccessCode()

  saveMemberSession(member, accessCode)
}

export function getStoredAccessCode() {
  return localStorage.getItem(memberAccessCodeKey) || ''
}

function saveMemberSession(member, accessCode) {
  localStorage.setItem(authKey, 'true')
  localStorage.setItem(memberKey, JSON.stringify(member))

  if (accessCode) {
    localStorage.setItem(memberAccessCodeKey, accessCode)
  }
}

export function logout() {
  localStorage.removeItem(authKey)
  localStorage.removeItem(memberKey)
  localStorage.removeItem(memberAccessCodeKey)
}

export function isAuthenticated() {
  return localStorage.getItem(authKey) === 'true' && Boolean(getCurrentMember())
}

export function getCurrentMember() {
  const storedMember = localStorage.getItem(memberKey)

  if (!storedMember) return null

  try {
    return JSON.parse(storedMember)
  } catch {
    logout()
    return null
  }
}

export function getMemberName() {
  return getCurrentMember()?.full_name || 'NoFvce'
}

export function getCurrentMemberRole() {
  return getCurrentMember()?.role || 'member'
}
