import MobileAppLayout from '../../components/members/MobileAppLayout'
import PageTransition from '../../components/PageTransition'

import { useCrew } from '../../context/CrewContext'

function Events() {
  const { crewEvents } = useCrew()

  return (
    <MobileAppLayout title="Events">
      <PageTransition>
        <section className="rounded-[2rem] border border-white/5 bg-zinc-900/60 p-6 backdrop-blur-xl">
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/30">
            Private Events
          </p>

          <h2 className="mt-3 text-4xl font-black uppercase leading-none">
            Meets
          </h2>

          <p className="mt-4 text-sm leading-6 text-white/50">
            Eventos privados, sessões de foto e rolês oficiais da NoFvce.
          </p>
        </section>

        <section className="mt-6 space-y-5">
          {crewEvents.map((event) => (
            <article
              key={event.id}
              className="rounded-[2rem] border border-white/5 bg-zinc-900/60 p-5 backdrop-blur-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-white/30">
                    {event.date}
                  </p>

                  <h3 className="mt-3 text-2xl font-black uppercase">
                    {event.title}
                  </h3>
                </div>

                <span className="rounded-full border border-white/10 bg-black/40 px-3 py-2 text-[9px] uppercase tracking-[0.2em] text-white/45">
                  {event.status}
                </span>
              </div>

              <p className="mt-4 text-xs uppercase tracking-[0.25em] text-white/30">
                {event.location}
              </p>

              <p className="mt-4 text-sm leading-6 text-white/50">
                {event.description}
              </p>

              <button className="mt-5 w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-[10px] font-black uppercase tracking-[0.28em] text-white/40 transition hover:bg-white/10 hover:text-white">
                Event Details
              </button>
            </article>
          ))}
        </section>
      </PageTransition>
    </MobileAppLayout>
  )
}

export default Events