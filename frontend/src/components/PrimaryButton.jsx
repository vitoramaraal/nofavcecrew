function PrimaryButton({ children }) {
  return (
    <button className="mt-6 rounded-full border border-zinc-800 bg-black/40 px-7 py-3 text-[10px] uppercase tracking-[0.35em] text-zinc-300 backdrop-blur-sm transition-all duration-300 hover:border-zinc-500 hover:text-white hover:shadow-[0_0_30px_rgba(255,255,255,0.08)]">
      {children}
    </button>
  )
}

export default PrimaryButton