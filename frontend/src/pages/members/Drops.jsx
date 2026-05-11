import MobileAppLayout from '../../components/members/MobileAppLayout'

function Drops() {
  const drops = [
    {
      title: 'Oversized Tee',
      status: 'First Drop',
      description: 'Camiseta oversized preta com logo NoFvce nas costas.',
    },
    {
      title: 'Puff Jacket',
      status: 'Prototype',
      description: 'Jaqueta preta com logo minimalista no peito.',
    },
    {
      title: 'Crew Sticker',
      status: 'Coming',
      description: 'Adesivo oficial para carros aprovados da crew.',
    },
  ]

  return (
    <MobileAppLayout title="Drops">
      <section className="rounded-[2rem] border border-white/5 bg-zinc-900/60 p-6 backdrop-blur-xl">
        <p className="text-[10px] uppercase tracking-[0.35em] text-white/30">
          Official Drops
        </p>

        <h2 className="mt-3 text-4xl font-black uppercase leading-none">
          Uniforms
        </h2>

        <p className="mt-4 text-sm leading-6 text-white/50">
          Peças oficiais da NoFvce Crew. Uniformes, adesivos e itens exclusivos
          para membros.
        </p>
      </section>

      <section className="mt-6 space-y-5">
        {drops.map((drop) => (
          <article
            key={drop.title}
            className="overflow-hidden rounded-[2rem] border border-white/5 bg-zinc-900/60 backdrop-blur-xl"
          >
            <div className="relative h-56 bg-gradient-to-b from-white/10 to-black">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_60%)]" />

              <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/50 px-3 py-2 text-[9px] uppercase tracking-[0.2em] text-white/45 backdrop-blur-xl">
                {drop.status}
              </span>

              <span className="absolute bottom-4 right-4 text-[10px] uppercase tracking-[0.35em] text-white/20">
                NOFVCE
              </span>
            </div>

            <div className="p-5">
              <h3 className="text-2xl font-black uppercase">
                {drop.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-white/50">
                {drop.description}
              </p>

              <button className="mt-5 w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-[10px] font-black uppercase tracking-[0.28em] text-white/40 transition hover:bg-white/10 hover:text-white">
                View Drop
              </button>
            </div>
          </article>
        ))}
      </section>
    </MobileAppLayout>
  )
}

export default Drops