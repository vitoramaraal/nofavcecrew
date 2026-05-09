function App() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1a1a1a_0%,#050505_45%,#000000_100%)]" />

      <section className="relative z-10 flex flex-col items-center justify-center px-6 text-center">
        <img
          src="/logo-nofvce.png"
          alt="NoFvce Crew"
          className="w-[85vw] max-w-[820px] opacity-90 drop-shadow-[0_0_35px_rgba(255,255,255,0.12)]"
        />

        <div className="mt-8 h-px w-40 bg-gradient-to-r from-transparent via-zinc-600 to-transparent" />
      </section>
    </main>
  )
}

export default App