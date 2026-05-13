import { useEffect, useRef, useState } from 'react'
import MobileAppLayout from '../../components/members/MobileAppLayout'
import PageTransition from '../../components/PageTransition'
import MemberCard from '../../components/members/MemberCard'
import { fetchMemberProfile } from '../../lib/members'
import { getCurrentMember } from '../../utils/auth'
import {
  exportMemberCardAsPng,
} from '../../utils/exportMemberCard'

function Profile() {
  const [profileMember, setProfileMember] = useState(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState('')
  const cardSvgRef = useRef(null)

  async function handleExportCard() {
    if (exporting) return

    setExporting(true)
    setExportError('')

    try {
      const fileName = createCardFileName(profileMember)
      await exportMemberCardAsPng(
        cardSvgRef.current,
        fileName,
      )
    } catch (error) {
      console.error(error)
      setExportError(
        'Nao foi possivel gerar a carteirinha. Tente novamente ou verifique se as fotos estao acessiveis.',
      )
    }

    setExporting(false)
  }

  useEffect(() => {
    let isMounted = true

    async function loadInitialMembers() {
      try {
        const currentMember = getCurrentMember()

        if (!isMounted) return

        if (!currentMember?.id) {
          setProfileMember(null)
          setLoading(false)
          return
        }

        const data = await fetchMemberProfile(currentMember.id)

        if (!isMounted) return

        setProfileMember(data)
      } catch (error) {
        console.error(error)

        if (!isMounted) return

        setProfileMember(null)
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

  if (!profileMember) {
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
          <MemberCard member={profileMember} svgRef={cardSvgRef} />
        </section>

        <section className="mt-5 rounded-[2rem] border border-white/5 bg-zinc-900/60 p-5 backdrop-blur-xl">
          <button
            type="button"
            onClick={handleExportCard}
            disabled={exporting}
            className="w-full rounded-full border border-white/10 bg-white/10 px-5 py-4 text-[10px] font-black uppercase tracking-[0.25em] text-white/45 transition hover:border-white/20 hover:bg-white/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {exporting ? 'Gerando...' : 'Baixar carteirinha'}
          </button>

          {exportError && (
            <p className="mt-4 text-sm leading-6 text-red-300">
              {exportError}
            </p>
          )}

        </section>

      </PageTransition>
    </MobileAppLayout>
  )
}

function createCardFileName(member) {
  const memberNumber = member?.member_number || 'nofvce'
  const safeName = memberNumber.toLowerCase().replace(/[^a-z0-9-]/g, '-')

  return `nofvce-card-${safeName}.png`
}

export default Profile
