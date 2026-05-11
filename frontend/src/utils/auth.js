export function login() {
  localStorage.setItem('nofvce-auth', 'true')
}

export function logout() {
  localStorage.removeItem('nofvce-auth')
}

export function isAuthenticated() {
  return localStorage.getItem('nofvce-auth') === 'true'
}