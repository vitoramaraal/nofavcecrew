import { useEffect, useState } from 'react'
import MobileAppLayout from '../../components/members/MobileAppLayout'
import PageTransition from '../../components/PageTransition'
import { fetchMemberEvents, setEventRsvp } from '../../lib/events'
import { getCurrentMember, getStoredAccessCode } from '../../utils/auth'

function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyEventId, setBusyEventId] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const currentMember = getCurrentMember()
  const accessCode = getStoredAccessCode()

  async function loadEvents(showLoading = true) {
    if (!currentMember?.id || !accessCode) {
      setError('Sessao de membro invalida.')
      setLoading(false)
      return
    }

    if (showLoading) {
      setLoading(true)
    }

    setError('')

    try {
      const data = await fetchMemberEvents(currentMember.id, accessCode)

      setEvents(data)
    } catch (eventsError) {
      console.error(eventsError)
      setError('Nao foi possivel carregar os eventos.')
    }

    setLoading(false)
  }

  async function handleRsvp(eventId, nextStatus) {
    if (busyEventId || !currentMember?.id || !accessCode) return

    setBusyEventId(eventId)
    setError('')
    setSuccess('')

    try {
      await setEventRsvp(currentMember.id, accessCode, eventId, nextStatus)
      setSuccess(
        nextStatus === 'going'
          ? 'Presenca confirmada.'
          : 'Presenca removida.',
      )
      await loadEvents(false)
    } catch (rsvpError) {
      console.error(rsvpError)
      setError(rsvpError?.message || 'Nao foi possivel atualizar presenca.')
    }

    setBusyEventId('')
  }

  useEffect(() => {
    let isMounted = true

    async function loadInitialEvents() {
      if (!currentMember?.id || !accessCode) {
        if (isMounted) {
          setError('Sessao de membro invalida.')
          setLoading(false)
        }

        return
      }

      try {
        const data = await fetchMemberEvents(currentMember.id, accessCode)

        if (!isMounted) return

        setEvents(data)
      } catch (eventsError) {
        console.error(eventsError)

        if (!isMounted) return

        setError('Nao foi possivel carregar os eventos.')
      }

      if (isMounted) {
        setLoading(false)
      }
    }

    void loadInitialEvents()

    return () => {
      isMounted = false
    }
  }, [accessCode, currentMember?.id])

  return (
    <MobileAppLayout title="Events">
      <PageTransition>
        <section className="px-5 pb-28 pt-6">
          <p className="text-[10px] uppercase tracking-[0.45em] text-white/30">
            Private Events
          </p>

          <h1 className="mt-4 text-4xl font-black uppercase leading-none text-white">
            Meets
          </h1>

          <p className="mt-4 text-sm leading-6 text-white/45">
            Eventos privados, presenca confirmada e check-in oficial da crew.
          </p>

          <button
            type="button"
            onClick={() => loadEvents()}
            disabled={loading}
            className="mt-6 rounded-full border border-white/10 bg-white/10 px-5 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-white/40 disabled:opacity-40"
          >
            {loading ? 'Carregando...' : 'Atualizar'}
          </button>

          {success && (
            <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-300">
              {success}
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="mt-6 space-y-5">
            {!loading && events.length === 0 && (
              <article className="rounded-[2rem] border border-white/5 bg-zinc-900/70 p-5 text-sm text-white/40 backdrop-blur-xl">
                Nenhum evento liberado ainda.
              </article>
            )}

            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                busy={busyEventId === event.id}
                onRsvp={(nextStatus) => handleRsvp(event.id, nextStatus)}
              />
            ))}
          </div>
        </section>
      </PageTransition>
    </MobileAppLayout>
  )
}

function EventCard({ event, busy, onRsvp }) {
  const isGoing = event.current_member_rsvp_status === 'going'
  const canRsvp = event.status === 'open'
  const remainingSpots =
    event.capacity && event.attendee_count !== null
      ? Math.max(event.capacity - Number(event.attendee_count || 0), 0)
      : null

  return (
    <article className="rounded-[2rem] border border-white/5 bg-zinc-900/70 p-5 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/30">
            {formatEventDate(event.starts_at)}
          </p>

          <h2 className="mt-3 text-2xl font-black uppercase text-white">
            {event.title}
          </h2>
        </div>

        <StatusBadge status={event.status} />
      </div>

      <p className="mt-4 text-xs uppercase tracking-[0.25em] text-white/30">
        {event.location || 'Local secreto'}
      </p>

      <p className="mt-4 text-sm leading-6 text-white/50">
        {event.description || 'Detalhes liberados somente para membros.'}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Metric label="Confirmados" value={event.attendee_count || 0} />
        <Metric label="Check-in" value={event.checked_in_count || 0} />
      </div>

      {remainingSpots !== null && (
        <p className="mt-4 text-xs uppercase tracking-[0.25em] text-white/25">
          {remainingSpots} vagas restantes
        </p>
      )}

      {event.current_member_checked_in_at && (
        <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-300">
          Check-in confirmado em {formatEventDate(event.current_member_checked_in_at)}
        </div>
      )}

      <button
        type="button"
        onClick={() => onRsvp(isGoing ? 'not_going' : 'going')}
        disabled={busy || !canRsvp}
        className={
          isGoing
            ? 'mt-5 w-full rounded-full border border-emerald-500/20 bg-emerald-500/10 px-5 py-3 text-[10px] font-black uppercase tracking-[0.24em] text-emerald-300 disabled:cursor-not-allowed disabled:opacity-40'
            : 'mt-5 w-full rounded-full border border-white/10 bg-white/10 px-5 py-3 text-[10px] font-black uppercase tracking-[0.24em] text-white/45 transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-40'
        }
      >
        {getRsvpLabel({ busy, canRsvp, isGoing })}
      </button>
    </article>
  )
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-black/40 p-4">
      <p className="text-[10px] uppercase tracking-[0.25em] text-white/25">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  )
}

function StatusBadge({ status }) {
  const label =
    {
      draft: 'Rascunho',
      open: 'Aberto',
      closed: 'Fechado',
      completed: 'Finalizado',
      cancelled: 'Cancelado',
    }[status] || status

  return (
    <span className="shrink-0 rounded-full border border-white/10 bg-black/40 px-3 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/45">
      {label}
    </span>
  )
}

function getRsvpLabel({ busy, canRsvp, isGoing }) {
  if (busy) return 'Atualizando...'
  if (!canRsvp) return 'RSVP fechado'
  if (isGoing) return 'Cancelar presenca'
  return 'Confirmar presenca'
}

function formatEventDate(value) {
  if (!value) return 'Data em breve'

  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default Events
