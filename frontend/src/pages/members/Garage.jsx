import { useEffect, useState } from 'react'
import MobileAppLayout from '../../components/members/MobileAppLayout'
import PageTransition from '../../components/PageTransition'
import { fetchActiveMembers } from '../../lib/members'

function Garage() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  async function loadMembers(showLoading = true) {
    if (showLoading) {
      setLoading(true)
    }

    try {
      const data = await fetchActiveMembers()

      setMembers(data)
    } catch (error) {
      console.error(error)
      setMembers([])
    }

    setLoading(false)
  }

  useEffect(() => {
    let isMounted = true

    async function loadInitialMembers() {
      try {
        const data = await fetchActiveMembers()

        if (!isMounted) return

        setMembers(data)
      } catch (error) {
        console.error(error)

        if (!isMounted) return

        setMembers([])
      }

      if (isMounted) {
        setLoading(false)
      }
    }

    void loadInitialMembers()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <MobileAppLayout title="Garage">
      <PageTransition>
        <section className="px-5 pb-28 pt-6">
          <p className="text-[10px] uppercase tracking-[0.45em] text-white/30">
            Crew Garage
          </p>

          <h1 className="mt-4 text-4xl font-black uppercase leading-none text-white">
            Approved Cars
          </h1>

          <p className="mt-4 text-sm leading-6 text-white/45">
            Garagem oficial dos carros aprovados da NoFvce Crew.
          </p>

          <div className="mt-6">
            <button
              type="button"
              onClick={loadMembers}
              className="rounded-full border border-white/10 bg-white/10 px-5 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-white/40"
            >
              {loading ? 'Carregando...' : 'Atualizar garagem'}
            </button>
          </div>

          <div className="mt-6 space-y-5">
            {!loading && members.length === 0 && (
              <div className="rounded-[2rem] border border-white/5 bg-zinc-900/70 p-5 text-sm text-white/40 backdrop-blur-xl">
                Nenhum carro aprovado ainda.
              </div>
            )}

            {members.map((member) => (
              <article
                key={member.id}
                className="overflow-hidden rounded-[2rem] border border-white/5 bg-zinc-900/70 backdrop-blur-xl"
              >
                <div className="h-64 bg-black/60">
                  {member.image_url ? (
                    <img
                      src={member.image_url}
                      alt={member.car_model}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.3em] text-white/25">
                      Sem foto
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.35em] text-white/25">
                        {member.member_number || 'NOFVCE'}
                      </p>

                      <h2 className="mt-2 text-2xl font-black uppercase text-white">
                        {member.car_model || 'Carro não informado'}
                      </h2>

                      <p className="mt-2 text-sm text-white/45">
                        {member.full_name}
                      </p>
                    </div>

                    <span className="rounded-full border border-white/10 bg-black/40 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
                      Active
                    </span>
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/5 bg-black/40 p-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/25">
                      Setup
                    </p>

                    <p className="mt-2 text-sm leading-6 text-white/50">
                      {member.car_setup || 'Setup não informado'}
                    </p>
                  </div>

                  {member.instagram && (
                    <a
                      href={`https://instagram.com/${member.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 inline-flex rounded-full border border-white/10 bg-white/10 px-5 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-white/40 transition hover:bg-white hover:text-black"
                    >
                      Instagram
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      </PageTransition>
    </MobileAppLayout>
  )
}

export default Garage
