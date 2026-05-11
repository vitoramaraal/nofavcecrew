import { useState } from 'react'

function LoginScreen({ onLogin }) {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <a href="/" className="text-sm font-bold tracking-[0.4em]">
            NOFVCE
          </a>

          <a
            href="/"
            className="rounded-full border border-white/20 px-5 py-2 text-xs uppercase tracking-[0.25em] text-white/70 transition hover:border-white hover:text-white"
          >
            Voltar
          </a>
        </header>

        <section className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[1fr_420px]">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.5em] text-white/40">
              Private Members Area
            </p>

            <h1 className="max-w-3xl text-5xl font-black uppercase leading-none tracking-tight md:text-7xl">
              Enter the Crew
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-white/60">
              Área privada da NoFvce Crew. Acesso reservado para membros
              aprovados, garagem oficial, eventos, drops e regras internas.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <InfoCard number="01" label="Garagem" />
              <InfoCard number="02" label="Eventos" />
              <InfoCard number="03" label="Drops" />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl">
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">
              Access Code
            </p>

            <h2 className="mt-4 text-2xl font-black uppercase">
              Login privado
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/50">
              Por enquanto o acesso é visual. Depois vamos conectar com login
              real, banco de dados e painel administrativo.
            </p>

            <form className="mt-8 space-y-4">
              <input
                type="text"
                placeholder="Nome do membro"
                className="w-full rounded-2xl border border-white/10 bg-black px-4 py-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/40"
              />

              <input
                type="password"
                placeholder="Código de convite"
                className="w-full rounded-2xl border border-white/10 bg-black px-4 py-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/40"
              />

              <button
                type="button"
                onClick={onLogin}
                className="w-full rounded-full bg-white px-5 py-4 text-xs font-black uppercase tracking-[0.25em] text-black transition hover:scale-[1.02] hover:bg-white/80"
              >
                Acessar
              </button>
            </form>

            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="text-xs uppercase tracking-[0.3em] text-white/30">
                Invite Only
              </p>
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}

function Dashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard')

  const membersCars = [
    { name: 'Vitor', car: 'New Beetle', status: 'ACTIVE' },
    { name: 'Régis', car: 'Polo', status: 'ACTIVE' },
    { name: 'Luis', car: 'Gol', status: 'COMING' },
  ]

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-white/10 bg-white/[0.02] p-8 lg:flex lg:flex-col">
          <p className="text-xs uppercase tracking-[0.5em] text-white/30">
            NOFVCE
          </p>

          <h1 className="mt-4 text-3xl font-black uppercase leading-none">
            Crew Panel
          </h1>

          <nav className="mt-14 flex flex-col gap-4">
            <MenuButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>
              Dashboard
            </MenuButton>

            <MenuButton active={activeTab === 'garage'} onClick={() => setActiveTab('garage')}>
              Garage
            </MenuButton>

            <MenuButton active={activeTab === 'events'} onClick={() => setActiveTab('events')}>
              Events
            </MenuButton>

            <MenuButton active={activeTab === 'drops'} onClick={() => setActiveTab('drops')}>
              Drops
            </MenuButton>

            <MenuButton active={activeTab === 'members'} onClick={() => setActiveTab('members')}>
              Members
            </MenuButton>
          </nav>

          <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-white/30">
              STATUS
            </p>

            <h2 className="mt-3 text-2xl font-black">INVITE ONLY</h2>

            <p className="mt-3 text-sm leading-6 text-white/50">
              Área privada exclusiva para membros aprovados pela crew.
            </p>
          </div>
        </aside>

        <section className="flex-1 p-6 lg:p-10">
          <header className="flex items-center justify-between border-b border-white/10 pb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/30">
                Welcome Back
              </p>

              <h2 className="mt-2 text-3xl font-black uppercase">Vitor</h2>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="rounded-full border border-white/10 px-6 py-3 text-xs uppercase tracking-[0.3em] text-white/60 transition hover:border-white hover:text-white"
            >
              Sair
            </button>
          </header>

          {activeTab === 'dashboard' && (
            <>
              <section className="mt-10 grid gap-6 md:grid-cols-3">
                <StatCard label="Members" value="12" />
                <StatCard label="Events" value="04" />
                <StatCard label="Drops" value="02" />
              </section>

              <section className="mt-12 rounded-3xl border border-white/10 bg-white/[0.03] p-8">
                <p className="text-xs uppercase tracking-[0.4em] text-white/30">
                  Crew Status
                </p>

                <h2 className="mt-4 text-4xl font-black uppercase">
                  Private Season Open
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/50">
                  A NoFvce está em fase inicial de formação. O painel será usado
                  para organizar membros, carros, encontros, drops oficiais e
                  regras internas da crew.
                </p>
              </section>
            </>
          )}

          {activeTab === 'garage' && (
            <section className="mt-10">
              <SectionTitle eyebrow="Crew Garage" title="Members Cars" />

              <div className="mt-8 grid gap-6 xl:grid-cols-3">
                {membersCars.map((member) => (
                  <CarCard key={member.name} member={member} />
                ))}
              </div>
            </section>
          )}

          {activeTab === 'events' && (
            <section className="mt-10">
              <SectionTitle eyebrow="Private Events" title="Next Meetings" />

              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <EventCard
                  date="Soon"
                  title="Night Meet"
                  description="Encontro noturno fechado, fotos low light e lineup dos carros da crew."
                />

                <EventCard
                  date="Soon"
                  title="Photo Session"
                  description="Sessão oficial para gerar conteúdo da NoFvce com estética dark/grunge."
                />
              </div>
            </section>
          )}

          {activeTab === 'drops' && (
            <section className="mt-10">
              <SectionTitle eyebrow="Official Drops" title="Uniforms & Pieces" />

              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <DropCard title="Oversized Tee" status="First Drop" />
                <DropCard title="Puff Jacket" status="Prototype" />
              </div>
            </section>
          )}

          {activeTab === 'members' && (
            <section className="mt-10">
              <SectionTitle eyebrow="Crew Members" title="Approved Members" />

              <div className="mt-8 grid gap-4">
                {membersCars.map((member) => (
                  <div
                    key={member.name}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                  >
                    <div>
                      <h3 className="text-xl font-black uppercase">
                        {member.name}
                      </h3>

                      <p className="mt-1 text-xs uppercase tracking-[0.25em] text-white/40">
                        {member.car}
                      </p>
                    </div>

                    <span className="rounded-full border border-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-white/50">
                      {member.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </section>
      </div>
    </main>
  )
}

function InfoCard({ number, label }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-2xl font-black">{number}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.25em] text-white/40">
        {label}
      </p>
    </div>
  )
}

function MenuButton({ children, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? 'rounded-xl border border-white/10 bg-white px-5 py-4 text-left text-sm font-black uppercase tracking-[0.2em] text-black'
          : 'rounded-xl border border-white/10 px-5 py-4 text-left text-sm uppercase tracking-[0.2em] text-white/60 transition hover:border-white/30 hover:text-white'
      }
    >
      {children}
    </button>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <p className="text-xs uppercase tracking-[0.3em] text-white/30">
        {label}
      </p>

      <h3 className="mt-4 text-5xl font-black">{value}</h3>
    </div>
  )
}

function SectionTitle({ eyebrow, title }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.4em] text-white/30">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-3xl font-black uppercase">{title}</h2>
    </div>
  )
}

function CarCard({ member }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
      <div className="h-52 bg-gradient-to-b from-white/10 to-black" />

      <div className="p-6">
        <h3 className="text-2xl font-black uppercase">{member.car}</h3>

        <p className="mt-2 text-sm uppercase tracking-[0.25em] text-white/40">
          {member.name}
        </p>

        <div className="mt-5 inline-flex rounded-full border border-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-white/50">
          {member.status}
        </div>
      </div>
    </div>
  )
}

function EventCard({ date, title, description }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <p className="text-xs uppercase tracking-[0.3em] text-white/30">
        {date}
      </p>

      <h3 className="mt-4 text-2xl font-black uppercase">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-white/50">{description}</p>
    </div>
  )
}

function DropCard({ title, status }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <div className="h-56 rounded-2xl bg-gradient-to-b from-white/10 to-black" />

      <p className="mt-5 text-xs uppercase tracking-[0.3em] text-white/30">
        {status}
      </p>

      <h3 className="mt-3 text-2xl font-black uppercase">{title}</h3>
    </div>
  )
}

function MemberArea() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  if (isLoggedIn) {
    return <Dashboard onLogout={() => setIsLoggedIn(false)} />
  }

  return <LoginScreen onLogin={() => setIsLoggedIn(true)} />
}

export default MemberArea