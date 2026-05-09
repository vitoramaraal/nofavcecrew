function Background() {
  return (
    <>
      <div className="absolute inset-0 bg-black" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1a1a1a_0%,#050505_45%,#000000_100%)]" />

      <div className="absolute left-1/2 top-[20%] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-white/[0.03] blur-3xl" />

      <div className="absolute bottom-[-200px] left-[-100px] h-[400px] w-[400px] rounded-full bg-zinc-700/[0.04] blur-3xl" />

      <div className="absolute right-[-100px] top-[40%] h-[300px] w-[300px] rounded-full bg-zinc-500/[0.03] blur-3xl" />

      <div className="absolute inset-0 opacity-[0.03] mix-blend-soft-light">
        <div className="h-full w-full bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:120px_120px]" />
      </div>
    </>
  )
}

export default Background