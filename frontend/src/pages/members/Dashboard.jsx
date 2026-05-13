import { useEffect, useState } from 'react'
import MobileAppLayout from '../../components/members/MobileAppLayout'
import PageTransition from '../../components/PageTransition'
import { fetchActiveMembers } from '../../lib/members'
import {
  getCurrentMember,
  getMemberName,
  getStoredAccessCode,
} from '../../utils/auth'

function Dashboard() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const currentMember = getCurrentMember()
  const accessCode = getStoredAccessCode()

  async function loadMembers(showLoading = true) {
    if (showLoading) {
      setLoading(true)
    }

    try {
      const data = await fetchActiveMembers(currentMember?.id, accessCode)

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
        const data = await fetchActiveMembers(currentMember?.id, accessCode)

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
  }, [accessCode, currentMember?.id])

  const totalMembers = members.length
  const totalCars = members.filter((member) => member.car_model).length
  const memberName = getMemberName()

  return (
    <MobileAppLayout title="Home">
      <PageTransition>
        <section className="px-5 pb-28 pt-6">
          <p className="text-[10px] uppercase tracking-[0.45em] text-white/30">
            Welcome Back
          </p>

          <h1 className="mt-4 text-4xl font-black uppercase leading-none text-white">
            {memberName}
          </h1>

          <p className="mt-3 text-[10px] font-black uppercase tracking-[0.3em] text-red-400/80">
            {currentMember?.role || 'member'} / {currentMember?.member_number || 'NOFVCE'}
          </p>

          <p className="mt-4 text-sm leading-6 text-white/45">
            Central privada da NoFvce Crew.
          </p>

          <div className="mt-6 rounded-[2rem] border border-white/5 bg-zinc-900/70 p-5 backdrop-blur-xl">
            <p className="text-[10px] uppercase tracking-[0.35em] text-white/25">
              Private Access
            </p>

            <h2 className="mt-3 text-2xl font-black uppercase text-white">
              Formation Season
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/45">
              A NoFvce está em fase de formação. Os membros aprovados já aparecem automaticamente na área interna.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <StatCard label="Membros" value={loading ? '...' : totalMembers} />
            <StatCard label="Carros" value={loading ? '...' : totalCars} />
          </div>

          <div className="mt-5 rounded-[2rem] border border-white/5 bg-zinc-900/70 p-5 backdrop-blur-xl">
            <p className="text-[10px] uppercase tracking-[0.35em] text-white/25">
              Next Step
            </p>

            <h3 className="mt-3 text-xl font-black uppercase text-white">
              Member Cards
            </h3>

            <p className="mt-3 text-sm leading-6 text-white/45">
              Próximo módulo: gerar carteirinha digital oficial para cada membro aprovado.
            </p>
          </div>

          <div className="mt-5 rounded-[2rem] border border-white/5 bg-zinc-900/70 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-white/25">
                  Latest Members
                </p>

                <h3 className="mt-3 text-xl font-black uppercase text-white">
                  Crew List
                </h3>
              </div>

              <button
                type="button"
                onClick={loadMembers}
                className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40"
              >
                Sync
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {!loading && members.length === 0 && (
                <p className="text-sm text-white/35">
                  Nenhum membro aprovado ainda.
                </p>
              )}

              {members.slice(0, 5).map((member) => (
                <div
                  key={member.id}
                  className="rounded-2xl border border-white/5 bg-black/40 p-4"
                >
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-white/35">
                    {member.member_number || 'NOFVCE'}
                  </p>

                  <h4 className="mt-2 text-lg font-black uppercase text-white">
                    {member.full_name}
                  </h4>

                  <p className="mt-1 text-sm text-white/40">
                    {member.car_model || 'Carro não informado'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </PageTransition>
    </MobileAppLayout>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-[1.5rem] border border-white/5 bg-zinc-900/70 p-5 backdrop-blur-xl">
      <p className="text-[10px] uppercase tracking-[0.3em] text-white/25">
        {label}
      </p>

      <h3 className="mt-3 text-3xl font-black text-white">{value}</h3>
    </div>
  )
}

export default Dashboard
