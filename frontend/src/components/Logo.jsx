function Logo() {
  return (
    <div className="flex flex-col items-center">
      <img
        src="/logo-nofvce.png"
        alt="NoFvce Crew"
        className="w-[78vw] max-w-[500px] opacity-95 select-none pointer-events-none drop-shadow-[0_0_45px_rgba(255,255,255,0.08)]"
      />

      <p className="-mt-4 text-[10px] md:text-xs uppercase tracking-[0.55em] text-zinc-500">
        Underground Automotive Lifestyle
      </p>
    </div>
  )
}

export default Logo