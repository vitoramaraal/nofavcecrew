function Navbar() {
  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b border-white/5 bg-black/30 backdrop-blur-xl">
      <div className="flex items-center justify-between px-6 py-5 md:px-10">
        <h1 className="text-[11px] uppercase tracking-[0.45em] text-zinc-200">
          NOFVCE
        </h1>

        <nav className="hidden md:flex items-center gap-8 text-[10px] uppercase tracking-[0.35em] text-zinc-500">
          <a href="#" className="transition duration-300 hover:text-white">
            Members
          </a>

          <a href="#" className="transition duration-300 hover:text-white">
            Garage
          </a>

          <a href="#" className="transition duration-300 hover:text-white">
            Events
          </a>
        </nav>
      </div>
    </header>
  )
}

export default Navbar