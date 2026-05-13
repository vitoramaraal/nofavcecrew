import { useCallback, useEffect, useState } from 'react'
import Background from '../components/Background'
import MemberCard from '../components/members/MemberCard'
import { getSupabase } from '../lib/supabase'

const adminRoles = ['founder', 'admin', 'moderator', 'member']
const panelRoles = ['founder', 'admin', 'moderator']
const managerRoles = ['founder', 'admin']

function createMemberNumber() {
  return `NFC-${String(Date.now()).slice(-6)}`
}

function createAccessCode() {
  const randomValue = crypto.getRandomValues(new Uint32Array(1))[0]

  return `NFV-${randomValue.toString(36).toUpperCase().slice(0, 8)}`
}

function createWhatsAppUrl(member) {
  const phone = normalizePhone(member.whatsapp)

  if (!phone || !member.access_code) return ''

  const message = [
    `Salve, ${member.full_name}.`,
    '',
    'Sua entrada na NoFvce Crew foi aprovada.',
    `Codigo secreto: ${member.access_code}`,
    '',
    'Use esse codigo na area de membros. Nao compartilhe.',
  ].join('\n')

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

function normalizePhone(phone = '') {
  const digits = phone.replace(/\D/g, '')

  if (!digits) return ''
  if (digits.startsWith('55')) return digits

  return `55${digits}`
}

function Admin() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  })
  const [session, setSession] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [applications, setApplications] = useState([])
  const [members, setMembers] = useState([])
  const [adminRole, setAdminRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const isUnlocked = Boolean(session)
  const pending = applications.filter((item) => item.status === 'pending').length
  const approved = applications.filter((item) => item.status === 'approved').length
  const rejected = applications.filter((item) => item.status === 'rejected').length
  const canReviewApplications = panelRoles.includes(adminRole)
  const canManageMembers = managerRoles.includes(adminRole)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const client = getSupabase()
      const { data: role, error: adminError } = await client.rpc(
        'current_admin_role',
      )

      if (adminError) {
        throw adminError
      }

      if (!panelRoles.includes(role)) {
        setApplications([])
        setMembers([])
        setAdminRole('')
        setError(
          'Usuario autenticado, mas ainda nao liberado em public.admin_users.',
        )
        return
      }

      setAdminRole(role)

      const [
        { data: applicationsData, error: applicationsError },
        { data: membersData, error: membersError },
      ] = await Promise.all([
        client
          .from('applications')
          .select('*')
          .order('created_at', { ascending: false }),
        client
          .from('members')
          .select('*')
          .order('created_at', { ascending: false }),
      ])

      if (applicationsError) {
        throw applicationsError
      }

      if (membersError) {
        throw membersError
      }

      setApplications(applicationsData || [])
      setMembers(membersData || [])
    } catch (loadError) {
      console.error(loadError)
      setError(
        loadError?.message ||
          'Erro ao carregar dados admin. Rode o schema atualizado no Supabase.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function restoreSession() {
      try {
        const client = getSupabase()
        const { data, error: sessionError } = await client.auth.getSession()

        if (sessionError) {
          throw sessionError
        }

        if (!isMounted) return

        setSession(data.session || null)

        if (data.session) {
          await loadData()
        }
      } catch (sessionError) {
        console.error(sessionError)

        if (isMounted) {
          setError(
            sessionError?.message ||
              'Nao foi possivel restaurar a sessao admin.',
          )
        }
      } finally {
        if (isMounted) {
          setCheckingSession(false)
        }
      }
    }

    void restoreSession()

    return () => {
      isMounted = false
    }
  }, [loadData])

  function handleCredentialChange(event) {
    const { name, value } = event.target

    setCredentials((current) => ({
      ...current,
      [name]: value,
    }))

    if (error) {
      setError('')
    }
  }

  async function loginAdmin(event) {
    event.preventDefault()

    const email = credentials.email.trim()

    if (!email || !credentials.password) {
      setError('Informe email e senha admin.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const client = getSupabase()
      const { data, error: loginError } = await client.auth.signInWithPassword({
        email,
        password: credentials.password,
      })

      if (loginError) {
        throw loginError
      }

      setSession(data.session || null)
      setCredentials({ email: '', password: '' })
      await loadData()
    } catch (loginError) {
      console.error(loginError)
      setError('Nao foi possivel entrar. Confira email, senha e admin_users.')
    } finally {
      setLoading(false)
    }
  }

  async function logoutAdmin() {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const client = getSupabase()
      const { error: logoutError } = await client.auth.signOut()

      if (logoutError) {
        throw logoutError
      }

      setSession(null)
      setApplications([])
      setMembers([])
      setAdminRole('')
    } catch (logoutError) {
      console.error(logoutError)
      setError('Nao foi possivel sair da sessao admin.')
    } finally {
      setLoading(false)
    }
  }

  async function approveApplication(application) {
    if (!canReviewApplications) {
      setError('Seu cargo nao permite revisar candidaturas.')
      return
    }

    if (!application.identity_rule_confirmed) {
      setError('A candidatura precisa confirmar a regra da carteirinha.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    const client = getSupabase()

    const existingMember = members.find(
      (member) => member.application_id === application.id,
    )

    if (existingMember) {
      const { error: updateError } = await client
        .from('applications')
        .update({ status: 'approved' })
        .eq('id', application.id)

      if (updateError) {
        console.error(updateError)
        setError('Erro ao atualizar candidatura.')
        setLoading(false)
        return
      }

      setSuccess('Essa candidatura ja possui membro criado.')
      await loadData()
      setLoading(false)
      return
    }

    const memberNumber = createMemberNumber()

    const { error: memberError } = await client.from('members').insert([
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
        access_code: createAccessCode(),
        role: 'member',
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

    const { error: updateError } = await client
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
    if (!canReviewApplications) {
      setError('Seu cargo nao permite revisar candidaturas.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    const client = getSupabase()

    const relatedMember = members.find(
      (member) => member.application_id === application.id,
    )

    if (relatedMember && !canManageMembers) {
      setError(
        'Moderador pode rejeitar candidaturas pendentes, mas nao remover membro ja criado.',
      )
      setLoading(false)
      return
    }

    if (relatedMember) {
      const { error: memberDeleteError } = await client
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

    const { error: updateError } = await client
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

  async function updateMemberRole(member, role) {
    if (!canManageMembers) {
      setError('Seu cargo nao permite mudar cargo de membro.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    const client = getSupabase()

    const { error: updateError } = await client
      .from('members')
      .update({ role })
      .eq('id', member.id)

    if (updateError) {
      console.error(updateError)
      setError('Erro ao atualizar cargo.')
      setLoading(false)
      return
    }

    setSuccess('Cargo atualizado.')
    await loadData()
    setLoading(false)
  }

  async function deleteApplication(application) {
    if (!canManageMembers) {
      setError('Seu cargo nao permite apagar candidaturas.')
      return
    }

    const confirmed = window.confirm(
      `Deseja apagar a candidatura de ${application.full_name}?`,
    )

    if (!confirmed) return

    setLoading(true)
    setError('')
    setSuccess('')

    const client = getSupabase()

    const relatedMember = members.find(
      (member) => member.application_id === application.id,
    )

    if (relatedMember) {
      const { error: memberDeleteError } = await client
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

    const { error: applicationDeleteError } = await client
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
    if (!canManageMembers) {
      setError('Seu cargo nao permite apagar membros.')
      return
    }

    const confirmed = window.confirm(
      `Deseja apagar o membro ${member.full_name}?`,
    )

    if (!confirmed) return

    setLoading(true)
    setError('')
    setSuccess('')

    const client = getSupabase()

    const { error: memberDeleteError } = await client
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
      await client
        .from('applications')
        .update({ status: 'rejected' })
        .eq('id', member.application_id)
    }

    setSuccess('Membro apagado com sucesso.')
    await loadData()
    setLoading(false)
  }

  if (checkingSession) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-black text-white">
        <Background />

        <section className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
          <p className="text-[10px] uppercase tracking-[0.45em] text-white/30">
            NoFvce Admin
          </p>

          <h1 className="mt-4 text-5xl font-black uppercase leading-none">
            Checking
          </h1>

          <p className="mt-5 text-sm leading-6 text-white/45">
            Restaurando sessao administrativa.
          </p>
        </section>
      </main>
    )
  }

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
            Entre com o usuario criado no Supabase Auth e liberado em
            public.admin_users.
          </p>

          <form
            onSubmit={loginAdmin}
            className="mt-8 space-y-4 rounded-[2rem] border border-white/5 bg-zinc-900/60 p-5 backdrop-blur-xl"
          >
            <input
              name="email"
              type="email"
              value={credentials.email}
              onChange={handleCredentialChange}
              placeholder="Email admin"
              autoComplete="email"
              className="w-full rounded-2xl border border-white/5 bg-black/70 px-4 py-4 text-sm text-white outline-none placeholder:text-white/25"
            />

            <input
              name="password"
              type="password"
              value={credentials.password}
              onChange={handleCredentialChange}
              placeholder="Senha admin"
              autoComplete="current-password"
              className="w-full rounded-2xl border border-white/5 bg-black/70 px-4 py-4 text-sm text-white outline-none placeholder:text-white/25"
            />

            {error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full border border-white/10 bg-white/10 px-6 py-4 text-xs font-black uppercase tracking-[0.32em] text-white/40 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </section>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <Background />

      <header className="relative z-20 flex w-full items-center justify-between gap-4 border-b border-white/5 px-6 py-4">
        <a
          href="/"
          className="text-[10px] font-bold uppercase tracking-[0.45em] text-white/35 transition hover:text-white"
        >
          NOFVCE
        </a>

        <div className="flex items-center gap-4">
          <span className="hidden text-[10px] uppercase tracking-[0.25em] text-white/25 sm:inline">
            {session?.user?.email || 'Admin'} / {adminRole || 'sem cargo'}
          </span>

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="text-[10px] uppercase tracking-[0.35em] text-white/35 transition hover:text-white disabled:opacity-40"
          >
            {loading ? 'Syncing' : 'Sync'}
          </button>

          <button
            type="button"
            onClick={logoutAdmin}
            disabled={loading}
            className="text-[10px] uppercase tracking-[0.35em] text-white/35 transition hover:text-white disabled:opacity-40"
          >
            Sair
          </button>
        </div>
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

        <h2 className="mt-10 text-2xl font-black uppercase">Candidaturas</h2>

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
                      {item.instagram} - {item.whatsapp}
                    </p>
                  </div>

                  <StatusBadge status={item.status} />
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <InfoBlock label="Carro" value={item.car_model} />
                  <InfoBlock label="Setup" value={item.car_setup || '-'} />
                  <InfoBlock
                    label="Regra da carteirinha"
                    value={
                      item.identity_rule_confirmed
                        ? 'Confirmada'
                        : 'Nao confirmada'
                    }
                  />
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
                    disabled={
                      loading ||
                      item.status === 'rejected' ||
                      (!canManageMembers && item.status === 'approved')
                    }
                    className="rounded-full border border-white/10 bg-black/40 px-4 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-white/35 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Rejeitar
                  </button>

                  {canManageMembers && (
                    <button
                      type="button"
                      onClick={() => deleteApplication(item)}
                      disabled={loading}
                      className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      Apagar
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        <h2 className="mt-12 text-2xl font-black uppercase">Membros</h2>

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

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <InfoBlock label="Cargo" value={member.role || 'member'} />
                  <InfoBlock
                    label="Codigo secreto"
                    value={member.access_code || '-'}
                  />
                  <InfoBlock label="WhatsApp" value={member.whatsapp || '-'} />
                  <InfoBlock label="Instagram" value={member.instagram || '-'} />
                  <InfoBlock label="Status" value={member.status || '-'} />
                  <InfoBlock
                    label="Entrada"
                    value={
                      member.created_at
                        ? new Date(member.created_at).toLocaleDateString(
                            'pt-BR',
                          )
                        : '-'
                    }
                  />
                </div>

                <div className="mt-6 rounded-[1.5rem] border border-white/5 bg-black/40 p-4">
                  <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-white/25">
                    Carteirinha
                  </p>

                  <MemberCard member={member} />
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  {canManageMembers && (
                    <select
                      value={member.role || 'member'}
                      onChange={(event) =>
                        updateMemberRole(member, event.target.value)
                      }
                      disabled={loading}
                      className="rounded-full border border-white/10 bg-black/40 px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/45 outline-none disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      {adminRoles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  )}

                  {createWhatsAppUrl(member) && (
                    <a
                      href={createWhatsAppUrl(member)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-300 transition hover:bg-emerald-500/20"
                    >
                      Enviar codigo
                    </a>
                  )}

                  {canManageMembers && (
                    <button
                      type="button"
                      onClick={() => deleteMember(member)}
                      disabled={loading}
                      className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      Apagar membro
                    </button>
                  )}
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

  const label =
    {
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
