import { login } from '../../utils/auth'

function Login() {
  function handleLogin() {
    login()

    window.location.href = '/members/dashboard'
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
          Área privada para membros aprovados da NoFvce Crew.
        </p>

        <div className="mt-10 rounded-[2rem] border border-white/5 bg-zinc-900/60 p-5 backdrop-blur-xl">
          <input
            type="text"
            placeholder="Member name"
            className="w-full rounded-2xl border border-white/5 bg-black/70 px-4 py-4 text-sm outline-none placeholder:text-white/25"
          />

          <input
            type="password"
            placeholder="Access code"
            className="mt-4 w-full rounded-2xl border border-white/5 bg-black/70 px-4 py-4 text-sm outline-none placeholder:text-white/25"
          />

          <button
            onClick={handleLogin}
            className="mt-5 flex w-full items-center justify-center rounded-full border border-white/10 bg-white/10 px-5 py-4 text-xs font-black uppercase tracking-[0.25em] text-white/40 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/15 hover:text-white"
          >
            Access Crew
          </button>
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