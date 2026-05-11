import Background from '../components/Background'
import Logo from '../components/Logo'

function Home() {
  return (
    <main className="relative h-screen overflow-hidden bg-black text-white">
      <Background />

      <header className="absolute left-0 top-0 z-20 flex w-full items-center justify-between border-b border-white/5 px-6 py-4">
        <a
          href="/"
          className="text-[10px] font-bold uppercase tracking-[0.45em] text-white/35 transition hover:text-white"
        >
          NOFVCE
        </a>

        <a
          href="/members/login"
          className="text-[10px] uppercase tracking-[0.35em] text-white/35 transition hover:text-white"
        >
          Members
        </a>
      </header>

      <section className="relative z-10 flex h-screen items-center justify-center px-6">
        <div className="-mt-8 flex scale-[0.82] flex-col items-center text-center">
          <Logo />

          <a
            href="/apply"
            className="mt-5 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/10 px-10 py-3.5 text-[10px] font-black uppercase tracking-[0.32em] text-white/35 backdrop-blur-xl transition duration-300 hover:border-white/20 hover:bg-white/15 hover:text-white"
          >
            Enter the Crew
          </a>
        </div>
      </section>
    </main>
  )
}

export default Home