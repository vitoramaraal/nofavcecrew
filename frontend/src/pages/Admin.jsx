import { useEffect, useState } from 'react'
import Background from '../components/Background'
import { supabase } from '../lib/supabase'

function Admin() {
  const [password, setPassword] = useState('')
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [applications, setApplications] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD

  const pending = applications.filter((item) => item.status === 'pending').length
  const approved = applications.filter((item) => item.status === 'approved').length
  const rejected = applications.filter((item) => item.status === 'rejected').length

  function unlockAdmin(event) {
    event.preventDefault()

    if (!adminPassword) {
      setError('Senha admin não configurada no .env.')
      return
    }

    if (password !== adminPassword) {
      setError('Senha incorreta.')
      return
    }

    setError('')
    setIsUnlocked(true)
  }

  async function loadData() {
    setLoading(true)
    setError('')

    const { data: applicationsData, error: applicationsError } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false })

    if (applicationsError) {
      console.error(applicationsError)
      setError('Erro ao carregar candidaturas.')
      setLoading(false)
      return
    }

    const { data: membersData, error: membersError } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false })

    if (membersError) {
      console.error(membersError)
      setError('Erro ao carregar membros.')
      setLoading(false)
      return
    }

    setApplications(applicationsData || [])
    setMembers(membersData || [])
    setLoading(false)
  }

  async function approveApplication(application) {
    setLoading(true)
    setError('')
    setSuccess('')

    const existingMember = members.find(
      (member) => member.application_id === application.id,
    )

    if (existingMember) {
      const { error: updateError } = await supabase
        .from('applications')
        .update({ status: 'approved' })
        .eq('id', application.id)

      if (updateError) {
        console.error(updateError)
        setError('Erro ao atualizar candidatura.')
        setLoading(false)
        return
      }

      setSuccess('Essa candidatura já possui membro criado.')
      await loadData()
      setLoading(false)
      return
    }

    const memberNumber = `NFC-${String(Date.now()).slice(-6)}`

    const { error: memberError } = await supabase
      .from('members')
      .insert([
        {
          application_id: application.id,
          full_name: application.full_name,
          instagram: application.instagram,
          whatsapp: application.whatsapp,
          car_model: application.car_model,
          car_setup: application.car_setup,
          image_url: application.image_url,
          member_photo_url: application.member_photo_url,
          member_photo_path: application.member_photo_path,
          status: 'active',
          member_number: memberNumber,
        },
      ])

    if (memberError) {
      console.error(memberError)
      setError('Erro ao criar membro.')
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase
      .from('applications')
      .update({ status: 'approved' })
      .eq('id', application.id)

    if (updateError) {
      console.error(updateError)
      setError('Membro criado, mas erro ao atualizar candidatura.')
      setLoading(false)
      return
    }

    setSuccess('Candidatura aprovada e membro criado.')
    await loadData()
    setLoading(false)
  }

  async function rejectApplication(application) {
    setLoading(true)
    setError('')
    setSuccess('')

    const relatedMember = members.find(
      (member) => member.application_id === application.id,
    )

    if (relatedMember) {
      const { error: memberDeleteError } = await supabase
        .from('members')
        .delete()
        .eq('id', relatedMember.id)

      if (memberDeleteError) {
        console.error(memberDeleteError)
        setError('Erro ao remover membro relacionado.')
        setLoading(false)
        return
      }
    }

    const { error: updateError } = await supabase
      .from('applications')
      .update({ status: 'rejected' })
      .eq('id', application.id)

    if (updateError) {
      console.error(updateError)
      setError('Erro ao rejeitar candidatura.')
      setLoading(false)
      return
    }

    setSuccess('Candidatura rejeitada e membro relacionado removido.')
    await loadData()
    setLoading(false)
  }

  async function deleteApplication(application) {
    const confirmed = window.confirm(
      `Deseja apagar a candidatura de ${application.full_name}?`,
    )

    if (!confirmed) return

    setLoading(true)
    setError('')
    setSuccess('')

    const relatedMember = members.find(
      (member) => member.application_id === application.id,
    )

    if (relatedMember) {
      const { error: memberDeleteError } = await supabase
        .from('members')
        .delete()
        .eq('id', relatedMember.id)

      if (memberDeleteError) {
        console.error(memberDeleteError)
        setError('Erro ao apagar membro relacionado.')
        setLoading(false)
        return
      }
    }

    const { error: applicationDeleteError } = await supabase
      .from('applications')
      .delete()
      .eq('id', application.id)

    if (applicationDeleteError) {
      console.error(applicationDeleteError)
      setError('Erro ao apagar candidatura.')
      setLoading(false)
      return
    }

    setSuccess('Candidatura apagada com sucesso.')
    await loadData()
    setLoading(false)
  }

  async function deleteMember(member) {
    const confirmed = window.confirm(
      `Deseja apagar o membro ${member.full_name}?`,
    )

    if (!confirmed) return

    setLoading(true)
    setError('')
    setSuccess('')

    const { error: memberDeleteError } = await supabase
      .from('members')
      .delete()
      .eq('id', member.id)

    if (memberDeleteError) {
      console.error(memberDeleteError)
      setError('Erro ao apagar membro.')
      setLoading(false)
      return
    }

    if (member.application_id) {
      await supabase
        .from('applications')
        .update({ status: 'rejected' })
        .eq('id', member.application_id)
    }

    setSuccess('Membro apagado com sucesso.')
    await loadData()
    setLoading(false)
  }

  useEffect(() => {
    if (isUnlocked) {
      loadData()
    }
  }, [isUnlocked])

  if (!isUnlocked) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-black text-white">
        <Background />

        <section className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
          <p className="text-[10px] uppercase tracking-[0.45em] text-white/30">
            NoFvce Admin
          </p>

          <h1 className="mt-4 text-5xl font-black uppercase leading-none">
            Restricted
          </h1>

          <p className="mt-5 text-sm leading-6 text-white/45">
            Área administrativa da NoFvce Crew.
          </p>

          <form
            onSubmit={unlockAdmin}
            className="mt-8 space-y-4 rounded-[2rem] border border-white/5 bg-zinc-900/60 p-5 backdrop-blur-xl"
          >
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Senha admin"
              className="w-full rounded-2xl border border-white/5 bg-black/70 px-4 py-4 text-sm text-white outline-none placeholder:text-white/25"
            />

            {error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-full border border-white/10 bg-white/10 px-6 py-4 text-xs font-black uppercase tracking-[0.32em] text-white/40 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/15 hover:text-white"
            >
              Entrar
            </button>
          </form>
        </section>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <Background />

      <header className="relative z-20 flex w-full items-center justify-between border-b border-white/5 px-6 py-4">
        <a
          href="/"
          className="text-[10px] font-bold uppercase tracking-[0.45em] text-white/35 transition hover:text-white"
        >
          NOFVCE
        </a>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="text-[10px] uppercase tracking-[0.35em] text-white/35 transition hover:text-white disabled:opacity-40"
        >
          {loading ? 'Syncing' : 'Sync'}
        </button>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-6 py-10">
        <p className="text-[10px] uppercase tracking-[0.45em] text-white/30">
          Admin Panel
        </p>

        <h1 className="mt-4 text-5xl font-black uppercase leading-none">
          Applications
        </h1>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <StatCard label="Pendentes" value={pending} />
          <StatCard label="Aprovadas" value={approved} />
          <StatCard label="Rejeitadas" value={rejected} />
          <StatCard label="Membros" value={members.length} />
        </div>

        {success && (
          <div className="mt-6 rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/10 px-5 py-5 text-sm text-emerald-300">
            {success}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-[1.5rem] border border-red-500/20 bg-red-500/10 px-5 py-5 text-sm text-red-300">
            {error}
          </div>
        )}

        <h2 className="mt-10 text-2xl font-black uppercase">
          Candidaturas
        </h2>

        <div className="mt-6 grid gap-5">
          {applications.length === 0 && !loading && (
            <div className="rounded-[2rem] border border-white/5 bg-zinc-900/60 p-6 text-sm text-white/40">
              Nenhuma candidatura encontrada.
            </div>
          )}

          {applications.map((item) => (
            <article
              key={item.id}
              className="grid gap-5 rounded-[2rem] border border-white/5 bg-zinc-900/60 p-5 backdrop-blur-xl md:grid-cols-[220px_1fr]"
            >
              <div className="overflow-hidden rounded-[1.5rem] border border-white/5 bg-black/60">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.car_model}
                    className="h-56 w-full object-cover md:h-full"
                  />
                ) : (
                  <div className="flex h-56 items-center justify-center text-xs uppercase tracking-[0.25em] text-white/25">
                    Sem foto
                  </div>
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.35em] text-white/25">
                      Candidate
                    </p>

                    <h2 className="mt-2 text-3xl font-black uppercase">
                      {item.full_name}
                    </h2>

                    <p className="mt-2 text-sm text-white/40">
                      {item.instagram} • {item.whatsapp}
                    </p>
                  </div>

                  <StatusBadge status={item.status} />
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <InfoBlock label="Carro" value={item.car_model} />
                  <InfoBlock label="Setup" value={item.car_setup || '-'} />
                </div>

                <div className="mt-5 rounded-2xl border border-white/5 bg-black/40 p-4">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/25">
                    Mensagem
                  </p>

                  <p className="mt-3 text-sm leading-6 text-white/50">
                    {item.message || '-'}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  {item.image_url && (
                    <a
                      href={item.image_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/10 bg-black/40 px-4 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-white/35 transition hover:bg-white/10 hover:text-white"
                    >
                      Ver foto
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => approveApplication(item)}
                    disabled={loading || item.status === 'approved'}
                    className="rounded-full border border-white/10 bg-white/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-white/50 transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Aprovar
                  </button>

                  <button
                    type="button"
                    onClick={() => rejectApplication(item)}
                    disabled={loading || item.status === 'rejected'}
                    className="rounded-full border border-white/10 bg-black/40 px-4 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-white/35 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Rejeitar
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteApplication(item)}
                    disabled={loading}
                    className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Apagar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <h2 className="mt-12 text-2xl font-black uppercase">
          Membros
        </h2>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {members.length === 0 && !loading && (
            <div className="rounded-[2rem] border border-white/5 bg-zinc-900/60 p-6 text-sm text-white/40">
              Nenhum membro encontrado.
            </div>
          )}

          {members.map((member) => (
            <article
              key={member.id}
              className="overflow-hidden rounded-[2rem] border border-white/5 bg-zinc-900/60 backdrop-blur-xl"
            >
              {member.image_url && (
                <img
                  src={member.image_url}
                  alt={member.car_model}
                  className="h-56 w-full object-cover"
                />
              )}

              <div className="p-5">
                <p className="text-[10px] uppercase tracking-[0.35em] text-white/25">
                  {member.member_number || 'NOFVCE'}
                </p>

                <h3 className="mt-2 text-2xl font-black uppercase">
                  {member.full_name}
                </h3>

                <p className="mt-2 text-sm text-white/40">
                  {member.car_model || '-'}
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => deleteMember(member)}
                    disabled={loading}
                    className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Apagar membro
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-[2rem] border border-white/5 bg-zinc-900/60 p-5 backdrop-blur-xl">
      <p className="text-[10px] uppercase tracking-[0.35em] text-white/25">
        {label}
      </p>

      <h3 className="mt-3 text-4xl font-black">{value}</h3>
    </div>
  )
}

function InfoBlock({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-black/40 p-4">
      <p className="text-[10px] uppercase tracking-[0.3em] text-white/25">
        {label}
      </p>

      <p className="mt-2 text-sm text-white/55">{value}</p>
    </div>
  )
}

function StatusBadge({ status }) {
  const normalizedStatus = status || 'pending'

  const label = {
    pending: 'Pendente',
    approved: 'Aprovado',
    rejected: 'Rejeitado',
  }[normalizedStatus] || normalizedStatus

  return (
    <span className="rounded-full border border-white/10 bg-black/50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-white/40">
      {label}
    </span>
  )
}

export default Admin