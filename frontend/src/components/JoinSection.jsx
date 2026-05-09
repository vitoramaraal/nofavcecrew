function JoinSection() {
  return (
    <section id="join" className="relative z-10 flex min-h-screen items-center justify-center px-6 py-32">
      <div className="max-w-4xl text-center">
        <p className="text-[10px] uppercase tracking-[0.5em] text-zinc-600">
          Join the Crew
        </p>

        <h2 className="mt-8 text-4xl font-light uppercase leading-[1.3] tracking-[0.18em] text-zinc-100 md:text-6xl">
          No face.
          <br />
          Just presence.
        </h2>

        <p className="mx-auto mt-10 max-w-2xl text-sm leading-8 text-zinc-500 md:text-base">
          NoFvce will be an invite-based automotive collective focused on identity,
          aesthetics, community and lifestyle.
        </p>

        <button className="mt-12 rounded-full border border-zinc-800 bg-black/40 px-8 py-4 text-[10px] uppercase tracking-[0.35em] text-zinc-300 backdrop-blur-sm transition-all duration-300 hover:border-zinc-500 hover:text-white hover:shadow-[0_0_30px_rgba(255,255,255,0.08)]">
          Apply Soon
        </button>
      </div>
    </section>
  )
}

export default JoinSection