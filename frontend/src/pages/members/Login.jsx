import { useState } from 'react'
import { loginWithAccessCode } from '../../utils/auth'

function Login() {
  const [accessCode, setAccessCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(event) {
    event.preventDefault()

    if (!accessCode.trim()) {
      setError('Codigo de acesso invalido.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await loginWithAccessCode(accessCode)

      window.location.href = '/members/dashboard'
    } catch (loginError) {
      console.error(loginError)
      setError(loginError?.message || 'Codigo de acesso invalido.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
        <p className="text-xs uppercase tracking-[0.5em] text-white/30">
          NOFVCE
        </p>

        <h1 className="mt-5 text-5xl font-black uppercase leading-none">
          Members Access
        </h1>

        <p className="mt-5 text-sm leading-6 text-white/50">
          Area privada para membros aprovados. Use o codigo secreto enviado
          pela NoFvce apos a aprovacao.
        </p>

        <div className="mt-10 rounded-[2rem] border border-white/5 bg-zinc-900/60 p-5 backdrop-blur-xl">
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={accessCode}
              onChange={(event) => setAccessCode(event.target.value)}
              placeholder="Secret member code"
              className="w-full rounded-2xl border border-white/5 bg-black/70 px-4 py-4 text-sm outline-none placeholder:text-white/25"
            />

            {error && (
              <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-5 flex w-full items-center justify-center rounded-full border border-white/10 bg-white/10 px-5 py-4 text-xs font-black uppercase tracking-[0.25em] text-white/40 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? 'Validando...' : 'Access Crew'}
            </button>
          </form>
        </div>

        <a
          href="/"
          className="mt-8 text-center text-xs uppercase tracking-[0.25em] text-white/40"
        >
          Back to Home
        </a>
      </section>
    </main>
  )
}

export default Login
