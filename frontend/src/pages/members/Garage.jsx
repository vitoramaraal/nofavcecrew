import MobileAppLayout from '../../components/members/MobileAppLayout'

function Garage() {
  const cars = [
    {
      owner: 'Vitor',
      car: 'New Beetle',
      setup: 'Air suspension • Work Meister S1 • Paddflush',
      status: 'Active',
      tag: 'Founder Build',
    },
    {
      owner: 'Régis',
      car: 'Golf MK4',
      setup: 'Clean fitment • Street build',
      status: 'Review',
      tag: 'Candidate',
    },
    {
      owner: 'Gabriel',
      car: 'Jetta GLI',
      setup: 'OEM+ • Low stance • Daily build',
      status: 'Coming',
      tag: 'Pending',
    },
  ]

  return (
    <MobileAppLayout title="Garage">
      <section className="rounded-[2rem] border border-white/5 bg-zinc-900/60 p-6 backdrop-blur-xl">
        <p className="text-[10px] uppercase tracking-[0.35em] text-white/30">
          Crew Garage
        </p>

        <h2 className="mt-3 text-4xl font-black uppercase leading-none">
          Approved Cars
        </h2>

        <p className="mt-4 text-sm leading-6 text-white/50">
          Garagem oficial dos carros da NoFvce. Cada build representa a estética
          e a identidade da crew.
        </p>
      </section>

      <section className="mt-6 space-y-5">
        {cars.map((item) => (
          <article
            key={item.owner}
            className="overflow-hidden rounded-[2rem] border border-white/5 bg-zinc-900/60 backdrop-blur-xl"
          >
            <div className="relative h-52 bg-gradient-to-b from-white/10 to-black">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_60%)]" />

              <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/50 px-3 py-2 text-[9px] uppercase tracking-[0.2em] text-white/45 backdrop-blur-xl">
                {item.tag}
              </span>

              <span className="absolute bottom-4 right-4 text-[10px] uppercase tracking-[0.35em] text-white/20">
                NOFVCE
              </span>
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black uppercase">
                    {item.car}
                  </h3>

                  <p className="mt-1 text-xs uppercase tracking-[0.25em] text-white/35">
                    {item.owner}
                  </p>
                </div>

                <span className="rounded-full border border-white/10 px-3 py-2 text-[9px] uppercase tracking-[0.2em] text-white/50">
                  {item.status}
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-white/50">
                {item.setup}
              </p>

              <button className="mt-5 w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-[10px] font-black uppercase tracking-[0.28em] text-white/40 transition hover:bg-white/10 hover:text-white">
                View Build
              </button>
            </div>
          </article>
        ))}
      </section>
    </MobileAppLayout>
  )
}

export default Garage