import MobileAppLayout from '../../components/members/MobileAppLayout'
import PageTransition from '../../components/PageTransition'

import { useCrew } from '../../context/CrewContext'

function Dashboard() {
  const { stats, crewMembers, crewEvents } = useCrew()

  const founder = crewMembers[0]
  const nextEvent = crewEvents[0]

  const nextActions = [
    'Finalizar perfil do membro',
    'Cadastrar carro principal',
    'Confirmar presença no próximo meet',
  ]

  return (
    <MobileAppLayout title="Dashboard">
      <PageTransition>
        <section className="rounded-[2rem] border border-white/5 bg-zinc-900/60 p-6 backdrop-blur-xl">
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/30">
            Welcome Back
          </p>

          <h2 className="mt-3 text-4xl font-black uppercase leading-none">
            {founder.name}
          </h2>

          <p className="mt-4 text-sm leading-6 text-white/50">
            Central privada da NoFvce Crew.
          </p>

          <div className="mt-6 rounded-full border border-white/5 bg-black/40 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.35em] text-white/35">
              Private Access • Invite Only
            </p>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-3 gap-3">
          <StatCard label="Members" value={stats.members} />
          <StatCard label="Cars" value={stats.cars} />
          <StatCard label="Meets" value={stats.meets} />
        </section>

        <section className="mt-6 rounded-[2rem] border border-white/5 bg-zinc-900/60 p-5 backdrop-blur-xl">
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/30">
            Crew Status
          </p>

          <h3 className="mt-3 text-2xl font-black uppercase">
            Formation Season
          </h3>

          <p className="mt-3 text-sm leading-6 text-white/50">
            A NoFvce está em fase de formação.
          </p>
        </section>

        <section className="mt-6 rounded-[2rem] border border-white/5 bg-zinc-900/60 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-white/30">
                Next Meet
              </p>

              <h3 className="mt-2 text-2xl font-black uppercase">
                {nextEvent.title}
              </h3>
            </div>

            <span className="rounded-full border border-white/10 px-3 py-2 text-[9px] uppercase tracking-[0.2em] text-white/40">
              {nextEvent.status}
            </span>
          </div>

          <p className="mt-4 text-sm leading-6 text-white/50">
            {nextEvent.description}
          </p>
        </section>

        <section className="mt-6">
          <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-white/30">
            To Do
          </p>

          <div className="space-y-3">
            {nextActions.map((item, index) => (
              <div
                key={item}
                className="flex items-center gap-4 rounded-2xl border border-white/5 bg-zinc-900/60 p-4 backdrop-blur-xl"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[10px] font-black text-white/40">
                  {index + 1}
                </span>

                <p className="text-sm text-white/55">{item}</p>
              </div>
            ))}
          </div>
        </section>
      </PageTransition>
    </MobileAppLayout>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-white/5 bg-zinc-900/60 p-4 backdrop-blur-xl">
      <p className="text-[9px] uppercase tracking-[0.2em] text-white/30">
        {label}
      </p>

      <h3 className="mt-3 text-3xl font-black">{value}</h3>
    </div>
  )
}

export default Dashboard