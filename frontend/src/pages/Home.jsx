import Background from '../components/Background'
import Logo from '../components/Logo'
import PrimaryButton from '../components/PrimaryButton'

function Home() {
  return (
    <main className="relative h-screen bg-black text-white flex items-center justify-center overflow-hidden">
      <Background />

      <section className="relative z-10 -mt-10 flex flex-col items-center justify-center px-6 text-center">
        <Logo />
        <PrimaryButton>Enter the Crew</PrimaryButton>
      </section>
    </main>
  )
}

export default Home