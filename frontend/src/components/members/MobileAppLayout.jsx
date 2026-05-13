import { logout } from '../../utils/auth'

function MobileAppLayout({ children, title }) {
  function handleLogout() {
    logout()

    window.location.href = '/members/login'
  }

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <div className="fixed inset-0">
        <div className="absolute left-[-120px] top-[-120px] h-72 w-72 rounded-full bg-white/[0.03] blur-3xl" />

        <div className="absolute bottom-[-150px] right-[-120px] h-80 w-80 rounded-full bg-white/[0.02] blur-3xl" />
      </div>

      <section className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col px-5 pb-24 pt-6">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/30">
              NOFVCE
            </p>

            <h1 className="mt-1 text-2xl font-black uppercase">
              {title}
            </h1>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-full border border-white/5 bg-zinc-900/60 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-white/50 backdrop-blur-xl"
          >
            Sair
          </button>
        </header>

        <div className="flex-1">{children}</div>

        <nav className="fixed bottom-4 left-1/2 z-50 grid w-[calc(100%-32px)] max-w-md -translate-x-1/2 grid-cols-6 rounded-full border border-white/5 bg-zinc-950/95 p-2 backdrop-blur-xl">
          <NavItem href="/members/dashboard" label="Home" />
          <NavItem href="/members/garage" label="Garage" />
          <NavItem href="/members/events" label="Events" />
          <NavItem href="/members/drops" label="Drops" />
          <NavItem href="/members/chat" label="Chat" />
          <NavItem href="/members/profile" label="Perfil" />
        </nav>
      </section>
    </main>
  )
}

function NavItem({ href, label }) {
  const active = window.location.pathname === href

  return (
    <a
      href={href}
      className={
        active
          ? 'rounded-full bg-white px-1 py-3 text-center text-[8px] font-black uppercase tracking-[0.06em] text-black'
          : 'rounded-full px-1 py-3 text-center text-[8px] uppercase tracking-[0.06em] text-white/45'
      }
    >
      {label}
    </a>
  )
}

export default MobileAppLayout
