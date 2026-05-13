import { useEffect, useState } from 'react'
import Background from '../components/Background'
import { verifyMember } from '../lib/verification'

function Verify() {
  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const memberId = window.location.pathname.replace('/verify/', '')

  useEffect(() => {
    let isMounted = true

    async function loadVerification() {
      try {
        const data = await verifyMember(memberId)

        if (!isMounted) return

        setMember(data)
      } catch (verifyError) {
        console.error(verifyError)

        if (!isMounted) return

        setError('Nao foi possivel validar este membro.')
      }

      if (isMounted) {
        setLoading(false)
      }
    }

    void loadVerification()

    return () => {
      isMounted = false
    }
  }, [memberId])

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <Background />

      <section className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
        <p className="text-[10px] uppercase tracking-[0.45em] text-white/30">
          NoFvce Verify
        </p>

        <h1 className="mt-4 text-5xl font-black uppercase leading-none">
          Member Check
        </h1>

        {loading && (
          <p className="mt-6 text-sm leading-6 text-white/45">
            Validando carteirinha...
          </p>
        )}

        {!loading && member && (
          <section className="mt-8 rounded-[2rem] border border-emerald-500/20 bg-emerald-500/10 p-6 backdrop-blur-xl">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-300">
              Valid Member
            </p>

            <h2 className="mt-4 text-3xl font-black uppercase">
              {member.full_name}
            </h2>

            <p className="mt-3 text-sm text-emerald-100/70">
              {member.member_number} / {member.role}
            </p>

            <p className="mt-2 text-sm text-emerald-100/60">
              {member.car_model || 'Carro nao informado'}
            </p>
          </section>
        )}

        {!loading && !member && (
          <section className="mt-8 rounded-[2rem] border border-red-500/20 bg-red-500/10 p-6 backdrop-blur-xl">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-300">
              Invalid
            </p>

            <p className="mt-4 text-sm leading-6 text-red-100/70">
              Esta carteirinha nao foi encontrada ou nao esta ativa.
            </p>
          </section>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-300">
            {error}
          </div>
        )}
      </section>
    </main>
  )
}

export default Verify
