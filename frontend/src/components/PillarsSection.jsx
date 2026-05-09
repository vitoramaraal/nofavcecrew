const pillars = [
  {
    title: 'Identity',
    description: 'A collective built around anonymity, presence and visual expression.',
  },
  {
    title: 'Garage',
    description: 'Every car tells a story through setup, stance, details and evolution.',
  },
  {
    title: 'Lifestyle',
    description: 'More than cars. A visual culture shaped by night, streets and movement.',
  },
]

function PillarsSection() {
  return (
    <section 
    id="garage"
    className="relative z-10 px-6 py-32"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-[10px] uppercase tracking-[0.5em] text-zinc-600">
          Core Pillars
        </p>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="border border-zinc-900 bg-zinc-950/40 p-8 backdrop-blur-sm transition duration-300 hover:border-zinc-700"
            >
              <h3 className="text-sm uppercase tracking-[0.35em] text-zinc-200">
                {pillar.title}
              </h3>

              <p className="mt-6 text-sm leading-7 text-zinc-500">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PillarsSection