function Logo() {
  return (
    <div className="flex flex-col items-center justify-center">
      <img
        src="/logo-nofvce.png"
        alt="NoFvce Crew"
        className="w-[85vw] max-w-[820px] opacity-90 drop-shadow-[0_0_35px_rgba(255,255,255,0.12)]"
      />

      <p className="mt-10 text-xs md:text-sm uppercase tracking-[0.45em] text-zinc-500">
        Underground Automotive Lifestyle
      </p>

      <div className="mt-8 h-px w-40 bg-gradient-to-r from-transparent via-zinc-600 to-transparent" />
    </div>
  )
}

export default Logo