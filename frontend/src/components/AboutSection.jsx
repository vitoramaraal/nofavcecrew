function AboutSection() {
  return (
    <section 
    id="about"
    className="relative z-10 flex min-h-screen items-center justify-center px-6 py-32"
    >
      <div className="max-w-4xl text-center">
        <p className="text-[10px] uppercase tracking-[0.5em] text-zinc-600">
          NoFvce Manifest
        </p>

        <h2 className="mt-8 text-3xl font-light uppercase leading-[1.4] tracking-[0.15em] text-zinc-100 md:text-5xl">
          NoFvce is not a car club.
          <br />
          It is an underground automotive movement.
        </h2>

        <p className="mx-auto mt-10 max-w-2xl text-sm leading-8 text-zinc-500 md:text-base">
          Built around identity, aesthetics and lifestyle,
          NoFvce connects people through automotive culture,
          premium visuals and community experience.
        </p>
      </div>
    </section>
  )
}

export default AboutSection