import { useEffect, useState } from 'react'
import MobileAppLayout from '../../components/members/MobileAppLayout'
import PageTransition from '../../components/PageTransition'
import { createChatMessage, fetchChatMessages } from '../../lib/chat'
import { getCurrentMember, getStoredAccessCode } from '../../utils/auth'

function Chat() {
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const currentMember = getCurrentMember()
  const accessCode = getStoredAccessCode()

  async function loadMessages() {
    setError('')

    try {
      const data = await fetchChatMessages(currentMember?.id, accessCode)

      setMessages(data)
    } catch (chatError) {
      console.error(chatError)
      setError('Nao foi possivel carregar o chat.')
    }

    setLoading(false)
  }

  async function sendMessage(event) {
    event.preventDefault()

    const text = message.trim()

    if (!text || sending) return

    if (!currentMember?.id || !accessCode) {
      setError('Sessao de membro invalida.')
      return
    }

    setSending(true)
    setError('')

    try {
      await createChatMessage(currentMember.id, accessCode, text)
      setMessage('')
      await loadMessages()
    } catch (chatError) {
      console.error(chatError)
      setError('Nao foi possivel enviar a mensagem.')
    }

    setSending(false)
  }

  useEffect(() => {
    let isMounted = true

    async function loadInitialMessages() {
      try {
        const data = await fetchChatMessages(currentMember?.id, accessCode)

        if (!isMounted) return

        setMessages(data)
      } catch (chatError) {
        console.error(chatError)

        if (!isMounted) return

        setError('Nao foi possivel carregar o chat.')
      }

      if (isMounted) {
        setLoading(false)
      }
    }

    void loadInitialMessages()

    return () => {
      isMounted = false
    }
  }, [accessCode, currentMember?.id])

  return (
    <MobileAppLayout title="Chat">
      <PageTransition>
        <section className="flex min-h-[calc(100vh-180px)] flex-col rounded-[2rem] border border-white/5 bg-zinc-900/60 p-5 backdrop-blur-xl">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-white/30">
              Crew Channel
            </p>

            <h1 className="mt-3 text-4xl font-black uppercase leading-none">
              Internal
            </h1>

            <button
              type="button"
              onClick={loadMessages}
              className="mt-4 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40"
            >
              Sync
            </button>
          </div>

          <div className="mt-6 flex-1 space-y-3 overflow-y-auto">
            {loading && (
              <p className="text-sm text-white/35">Carregando mensagens...</p>
            )}

            {!loading && messages.length === 0 && (
              <article className="rounded-2xl border border-white/5 bg-black/40 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-400">
                  NoFvce
                </p>

                <p className="mt-2 text-sm leading-6 text-white/55">
                  Canal interno reservado para comunicados e conversa da crew.
                </p>
              </article>
            )}

            {messages.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-white/5 bg-black/40 p-4"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-400">
                  {item.members?.full_name || 'NoFvce'}
                </p>

                <p className="mt-2 text-sm leading-6 text-white/55">
                  {item.body}
                </p>
              </article>
            ))}
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={sendMessage} className="mt-4 flex gap-3">
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Mensagem"
              className="min-w-0 flex-1 rounded-full border border-white/5 bg-black/60 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25"
            />

            <button
              type="submit"
              disabled={sending}
              className="rounded-full border border-white/10 bg-white/10 px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/45"
            >
              {sending ? '...' : 'Send'}
            </button>
          </form>
        </section>
      </PageTransition>
    </MobileAppLayout>
  )
}

export default Chat
