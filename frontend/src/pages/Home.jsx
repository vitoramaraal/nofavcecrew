import Background from '../components/Background'
import Logo from '../components/Logo'

function Home() {
  return (
    <main className="relative min-h-screen bg-black text-white flex items-center justify-center overflow-hidden">
      <Background />

      <section className="relative z-10 px-6 text-center">
        <Logo />
      </section>
    </main>
  )
}

export default Home