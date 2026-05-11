import Background from '../components/Background'
import PageTransition from '../components/PageTransition'

import { useCrew } from '../context/CrewContext'

function Admin() {
  const {
    crewApplications,
    approveApplication,
    rejectApplication,
  } = useCrew()

  const pending = crewApplications.filter(
    (item) => item.status === 'Pending',
  ).length

  const approved = crewApplications.filter(
    (item) => item.status === 'Approved',
  ).length

  const rejected = crewApplications.filter(
    (item) => item.status === 'Rejected',
  ).length

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <Background />

      <header className="relative z-20 flex w-full items-center justify-between border-b border-white/5 px-6 py-4">
        <a
          href="/"
          className="text-[10px] font-bold uppercase tracking-[0.45em] text-white/35 transition hover:text-white"
        >
          NOFVCE
        </a>

        <a
          href="/members/dashboard"
          className="text-[10px] uppercase tracking-[0.35em] text-white/35 transition hover:text-white"
        >
          App
        </a>
      </header>

      <section className="relative z-10 mx-auto max-w-md px-6 py-10">
        <PageTransition>
          <p className="text-[10px] uppercase tracking-[0.45em] text-white/30">
            Admin Panel
          </p>

          <h1 className="mt-4 text-5xl font-black uppercase leading-none">
            Applications
          </h1>

          <p className="mt-5 text-sm leading-6 text-white/45">
            Área administrativa para análise de novos membros.
          </p>

          <section className="mt-8 grid grid-cols-3 gap-3">
            <StatCard label="Pending" value={pending} />
            <StatCard label="Approved" value={approved} />
            <StatCard label="Rejected" value={rejected} />
          </section>

          <section className="mt-8 space-y-5">
            {crewApplications.map((item) => (
              <article
                key={item.id}
                className="rounded-[2rem] border border-white/5 bg-zinc-900/60 p-5 backdrop-blur-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.35em] text-white/30">
                      Candidate
                    </p>

                    <h2 className="mt-2 text-2xl font-black uppercase">
                      {item.name}
                    </h2>

                    <p className="mt-1 text-xs uppercase tracking-[0.25em] text-white/35">
                      {item.instagram}
                    </p>
                  </div>

                  <span className="rounded-full border border-white/10 bg-black/40 px-3 py-2 text-[9px] uppercase tracking-[0.2em] text-white/45">
                    {item.status}
                  </span>
                </div>

                <div className="mt-5 rounded-2xl border border-white/5 bg-black/40 p-4">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/25">
                    Car
                  </p>

                  <h3 className="mt-2 text-xl font-black uppercase">
                    {item.car}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-white/45">
                    {item.setup}
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => approveApplication(item.id)}
                    className="rounded-full border border-white/10 bg-white/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-white/50 transition hover:bg-white hover:text-black"
                  >
                    Approve
                  </button>

                  <button
                    type="button"
                    onClick={() => rejectApplication(item.id)}
                    className="rounded-full border border-white/10 bg-black/40 px-4 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-white/35 transition hover:bg-white/10 hover:text-white"
                  >
                    Reject
                  </button>
                </div>
              </article>
            ))}
          </section>
        </PageTransition>
      </section>
    </main>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-white/5 bg-zinc-900/60 p-4 text-center backdrop-blur-xl">
      <p className="text-[9px] uppercase tracking-[0.2em] text-white/30">
        {label}
      </p>

      <h3 className="mt-3 text-3xl font-black">{value}</h3>
    </div>
  )
}

export default Admin