const membersPreview = [
  {
    name: 'Founder',
    car: 'NoFvce Crew',
    tag: 'Member 001',
  },
  {
    name: 'Garage',
    car: 'Build Showcase',
    tag: 'Coming Soon',
  },
  {
    name: 'Crew',
    car: 'Private Members',
    tag: 'Invite Only',
  },
]

function MembersSection() {
  return (
    <section id="members" className="relative z-10 px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-[10px] uppercase tracking-[0.5em] text-zinc-600">
          Members
        </p>

        <h2 className="mt-8 text-center text-3xl font-light uppercase tracking-[0.18em] text-zinc-100 md:text-5xl">
          Built by the ones who belong.
        </h2>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {membersPreview.map((member) => (
            <div
              key={member.name}
              className="border border-zinc-900 bg-zinc-950/40 p-8 backdrop-blur-sm transition duration-300 hover:border-zinc-700"
            >
              <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-600">
                {member.tag}
              </p>

              <h3 className="mt-8 text-xl uppercase tracking-[0.25em] text-zinc-100">
                {member.name}
              </h3>

              <p className="mt-4 text-sm leading-7 text-zinc-500">
                {member.car}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default MembersSection