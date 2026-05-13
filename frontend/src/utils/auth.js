import { getSupabase } from '../lib/supabase'

const authKey = 'nofvce-auth'
const memberKey = 'nofvce-member'

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

  localStorage.setItem(authKey, 'true')
  localStorage.setItem(memberKey, JSON.stringify(member))

  return member
}

export function logout() {
  localStorage.removeItem(authKey)
  localStorage.removeItem(memberKey)
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
