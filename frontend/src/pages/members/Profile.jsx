import MobileAppLayout from '../../components/members/MobileAppLayout'

function Profile() {
  const info = [
    { label: 'Car', value: 'New Beetle' },
    { label: 'Build', value: 'Paddflush' },
    { label: 'Status', value: 'Active' },
    { label: 'Access', value: 'Founder' },
  ]

  return (
    <MobileAppLayout title="Profile">
      <section className="rounded-[2rem] border border-white/5 bg-zinc-900/60 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-black/50 text-2xl font-black text-white/60">
            V
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-white/30">
              Founder
            </p>

            <h2 className="mt-2 text-3xl font-black uppercase">
              Vitor
            </h2>

            <p className="mt-1 text-xs uppercase tracking-[0.25em] text-white/35">
              NoFvce Crew
            </p>
          </div>
        </div>

        <p className="mt-6 text-sm leading-6 text-white/50">
          Perfil interno do membro. Aqui ficam os dados da build, status dentro
          da crew, participação em eventos e identidade oficial.
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
          NFC-001
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
          O carro principal está aprovado para aparecer na garagem oficial e nos
          conteúdos da NoFvce.
        </p>
      </section>
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