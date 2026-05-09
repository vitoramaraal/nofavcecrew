import AboutSection from '../components/AboutSection'
import Background from '../components/Background'
import Logo from '../components/Logo'
import Navbar from '../components/Navbar'
import PrimaryButton from '../components/PrimaryButton'
import PillarsSection from '../components/PillarsSection'

function Home() {
  return (
    <main className="relative bg-black text-white overflow-hidden">
      <Background />

      <Navbar />

      <section className="relative flex h-screen items-center justify-center">
        <div className="-mt-10 flex flex-col items-center justify-center px-6 text-center">
          <Logo />
          <PrimaryButton>Enter the Crew</PrimaryButton>
        </div>
      </section>

      <AboutSection />
      <PillarsSection />
    </main>
  )
}

export default Home