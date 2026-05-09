function Navbar() {
  return (
    <header className="absolute top-0 left-0 z-20 w-full">
      <div className="flex items-center justify-between px-6 py-6 md:px-10">
        <h1 className="text-sm uppercase tracking-[0.35em] text-zinc-300">
          NOFVCE
        </h1>

        <nav className="hidden md:flex items-center gap-8 text-[10px] uppercase tracking-[0.3em] text-zinc-500">
          <a href="#" className="transition hover:text-white">
            Members
          </a>

          <a href="#" className="transition hover:text-white">
            Garage
          </a>

          <a href="#" className="transition hover:text-white">
            Events
          </a>
        </nav>
      </div>
    </header>
  )
}

export default Navbar