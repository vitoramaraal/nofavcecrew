import AboutSection from '../components/AboutSection'
import Background from '../components/Background'
import EventsSection from '../components/EventsSection'
import Footer from '../components/Footer'
import JoinSection from '../components/JoinSection'
import Logo from '../components/Logo'
import MembersSection from '../components/MembersSection'
import Navbar from '../components/Navbar'
import PillarsSection from '../components/PillarsSection'
import PrimaryButton from '../components/PrimaryButton'

function Home() {
  return (
    <main className="relative bg-black text-white overflow-hidden">
      <Background />

      <Navbar />

      <section
        id="home"
        className="relative flex h-screen items-center justify-center"
      >
        <div className="-mt-10 flex flex-col items-center justify-center px-6 text-center">
          <Logo />
          <PrimaryButton>Enter the Crew</PrimaryButton>
        </div>
      </section>

      <AboutSection />
      <PillarsSection />
      <EventsSection />
      <MembersSection />
      <JoinSection />
      <Footer />
    </main>
  )
}

export default Home