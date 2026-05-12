import { useEffect, useState } from 'react'
import MobileAppLayout from '../../components/members/MobileAppLayout'
import PageTransition from '../../components/PageTransition'
import { supabase } from '../../lib/supabase'
import MemberCard from '../../components/members/MemberCard'

function Profile() {
  const [members, setMembers] = useState([])
  const [selectedMember, setSelectedMember] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadMembers() {
    setLoading(true)

    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      setMembers([])
      setSelectedMember(null)
      setLoading(false)
      return
    }

    setMembers(data || [])
    setSelectedMember(data?.[0] || null)
    setLoading(false)
  }

  useEffect(() => {
    loadMembers()
  }, [])

  if (loading) {
    return (
      <MobileAppLayout title="Profile">
        <PageTransition>
          <section className="rounded-[2rem] border border-white/5 bg-zinc-900/60 p-6 text-sm text-white/40 backdrop-blur-xl">
            Carregando carteirinhas...
          </section>
        </PageTransition>
      </MobileAppLayout>
    )
  }

  if (!selectedMember) {
    return (
      <MobileAppLayout title="Profile">
        <PageTransition>
          <section className="rounded-[2rem] border border-white/5 bg-zinc-900/60 p-6 text-sm text-white/40 backdrop-blur-xl">
            Nenhum membro aprovado encontrado.
          </section>
        </PageTransition>
      </MobileAppLayout>
    )
  }

  return (
    <MobileAppLayout title="Profile">
      <PageTransition>
        <section>
          <p className="text-[10px] uppercase tracking-[0.45em] text-white/30">
            Carteirinha NFC
          </p>

          <h1 className="mt-3 text-4xl font-black uppercase leading-none text-white">
            Member ID
          </h1>

          <p className="mt-4 text-sm leading-6 text-white/45">
            Identificação privada da NoFvce Crew inspirada no universo automotivo,
            gerada automaticamente para cada membro aprovado.
          </p>
        </section>

        <section className="mt-6">
          <MemberCard member={selectedMember} />
        </section>

        <section className="mt-6 rounded-[2rem] border border-white/5 bg-zinc-900/60 p-5 backdrop-blur-xl">
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/30">
            Todos os membros
          </p>

          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {members.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => setSelectedMember(member)}
                className={`min-w-[150px] rounded-2xl border p-3 text-left transition ${
                  selectedMember.id === member.id
                    ? 'border-red-500/50 bg-red-500/10'
                    : 'border-white/5 bg-black/40'
                }`}
              >
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-red-400">
                  {member.member_number || 'NFC'}
                </p>

                <h3 className="mt-2 text-sm font-black uppercase text-white">
                  {member.full_name}
                </h3>

                <p className="mt-1 text-xs text-white/35">
                  {member.car_model || '-'}
                </p>
              </button>
            ))}
          </div>
        </section>
      </PageTransition>
    </MobileAppLayout>
  )
}

export default Profile