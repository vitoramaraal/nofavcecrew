import MobileAppLayout from '../../components/members/MobileAppLayout'
import PageTransition from '../../components/PageTransition'

import { useCrew } from '../../context/CrewContext'

function Profile() {
  const { crewMembers } = useCrew()

  const member = crewMembers[0]

  const info = [
    { label: 'Car', value: member.car },
    { label: 'Build', value: member.build },
    { label: 'Status', value: member.status },
    { label: 'Access', value: member.role },
  ]

  return (
    <MobileAppLayout title="Profile">
      <PageTransition>
        <section className="rounded-[2rem] border border-white/5 bg-zinc-900/60 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-black/50 text-2xl font-black text-white/60">
              {member.name[0]}
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-white/30">
                {member.role}
              </p>

              <h2 className="mt-2 text-3xl font-black uppercase">
                {member.name}
              </h2>

              <p className="mt-1 text-xs uppercase tracking-[0.25em] text-white/35">
                NoFvce Crew
              </p>
            </div>
          </div>

          <p className="mt-6 text-sm leading-6 text-white/50">
            Perfil interno do membro, build principal e identificação oficial.
          </p>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-3">
          {info.map((item) => (
            <InfoCard key={item.label} label={item.label} value={item.value} />
          ))}
        </section>

        <section className="mt-6 rounded-[2rem] border border-white/5 bg-zinc-900/60 p-5 backdrop-blur-xl">
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/30">
            Member Code
          </p>

          <h3 className="mt-3 text-3xl font-black uppercase">
            {member.code}
          </h3>

          <p className="mt-3 text-sm leading-6 text-white/50">
            Código interno do membro para identificação dentro da crew.
          </p>
        </section>

        <section className="mt-6 rounded-[2rem] border border-white/5 bg-zinc-900/60 p-5 backdrop-blur-xl">
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/30">
            Garage Status
          </p>

          <h3 className="mt-3 text-2xl font-black uppercase">
            Main Build Approved
          </h3>

          <p className="mt-3 text-sm leading-6 text-white/50">
            O carro principal está aprovado para aparecer na garagem oficial.
          </p>
        </section>
      </PageTransition>
    </MobileAppLayout>
  )
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-white/5 bg-zinc-900/60 p-4 backdrop-blur-xl">
      <p className="text-[9px] uppercase tracking-[0.25em] text-white/30">
        {label}
      </p>

      <h3 className="mt-3 text-lg font-black uppercase text-white/70">
        {value}
      </h3>
    </div>
  )
}

export default Profile