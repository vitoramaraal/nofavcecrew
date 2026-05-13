import { useEffect, useRef, useState } from 'react'

function EventCheckInScanner({
  events,
  members,
  disabled,
  canScan,
  onCheckIn,
}) {
  const [selectedEventId, setSelectedEventId] = useState('')
  const [manualCode, setManualCode] = useState('')
  const [scanning, setScanning] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const frameRef = useRef(0)
  const scanningRef = useRef(false)
  const lastScanRef = useRef('')

  const availableEvents = events.filter((event) =>
    ['open', 'closed', 'completed'].includes(event.status),
  )
  const activeEventId = selectedEventId || availableEvents[0]?.id || ''
  const activeEvent = availableEvents.find((event) => event.id === activeEventId)
  const canUseCamera =
    typeof window !== 'undefined' &&
    'BarcodeDetector' in window &&
    Boolean(navigator.mediaDevices?.getUserMedia)

  useEffect(
    () => () => {
      scanningRef.current = false

      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    },
    [],
  )

  async function startScanner() {
    if (!canScan || disabled) return

    if (!activeEvent) {
      setError('Selecione um evento para iniciar o scanner.')
      return
    }

    if (!canUseCamera) {
      setError(
        'Este navegador nao suporta scanner por camera. Use o campo manual.',
      )
      return
    }

    setError('')
    setStatus('Aponte a camera para o QR da carteirinha.')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
        },
        audio: false,
      })

      streamRef.current = stream
      videoRef.current.srcObject = stream
      await videoRef.current.play()

      scanningRef.current = true
      setScanning(true)
      scanNextFrame(new window.BarcodeDetector({ formats: ['qr_code'] }))
    } catch (cameraError) {
      console.error(cameraError)
      setError('Nao foi possivel acessar a camera.')
      stopScanner()
    }
  }

  function stopScanner() {
    scanningRef.current = false
    setScanning(false)

    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = 0
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  async function scanNextFrame(detector) {
    if (!scanningRef.current) return

    const video = videoRef.current

    if (video?.readyState >= 2) {
      try {
        const codes = await detector.detect(video)
        const value = codes[0]?.rawValue

        if (value) {
          await handleScannedValue(value)
        }
      } catch (scanError) {
        console.error(scanError)
      }
    }

    frameRef.current = requestAnimationFrame(() => scanNextFrame(detector))
  }

  async function handleManualSubmit(event) {
    event.preventDefault()

    await handleScannedValue(manualCode)
  }

  async function handleScannedValue(value) {
    const memberId = extractMemberId(value)

    if (!memberId || !activeEvent) {
      setError('QR invalido ou evento nao selecionado.')
      return
    }

    if (lastScanRef.current === memberId) {
      return
    }

    const member = members.find(
      (item) => item.id === memberId || item.member_number === memberId,
    )

    if (!member) {
      setError('QR lido, mas membro nao encontrado no painel.')
      return
    }

    lastScanRef.current = memberId
    setError('')
    setStatus(`Validando ${member.full_name}...`)

    try {
      await onCheckIn(activeEvent, member)
      setManualCode('')
      setStatus(`Check-in confirmado: ${member.full_name}.`)
    } catch (checkInError) {
      console.error(checkInError)
      setError('Nao foi possivel concluir o check-in.')
    } finally {
      setTimeout(() => {
        lastScanRef.current = ''
      }, 2500)
    }
  }

  return (
    <section className="mt-6 rounded-[2rem] border border-white/5 bg-zinc-900/60 p-5 backdrop-blur-xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/25">
            Scanner
          </p>

          <h3 className="mt-2 text-2xl font-black uppercase">
            Event Check-in
          </h3>
        </div>

        <span className="rounded-full border border-white/10 bg-black/40 px-3 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
          QR Card
        </span>
      </div>

      {!canScan && (
        <p className="mt-4 text-sm leading-6 text-white/40">
          Seu cargo nao permite usar o scanner.
        </p>
      )}

      {canScan && (
        <>
          <select
            value={activeEventId}
            onChange={(event) => setSelectedEventId(event.target.value)}
            disabled={disabled || availableEvents.length === 0}
            className="mt-5 w-full rounded-2xl border border-white/5 bg-black/70 px-4 py-4 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-40"
          >
            {availableEvents.length === 0 && (
              <option value="">Nenhum evento para check-in</option>
            )}

            {availableEvents.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>

          <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-white/5 bg-black/60">
            <video
              ref={videoRef}
              muted
              playsInline
              className="aspect-video w-full object-cover"
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {!scanning ? (
              <button
                type="button"
                onClick={startScanner}
                disabled={disabled || !activeEvent}
                className="rounded-full border border-white/10 bg-white/10 px-5 py-3 text-[10px] font-black uppercase tracking-[0.24em] text-white/45 transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-35"
              >
                Abrir camera
              </button>
            ) : (
              <button
                type="button"
                onClick={stopScanner}
                className="rounded-full border border-red-500/20 bg-red-500/10 px-5 py-3 text-[10px] font-black uppercase tracking-[0.24em] text-red-300"
              >
                Parar scanner
              </button>
            )}
          </div>

          <form onSubmit={handleManualSubmit} className="mt-5 flex gap-3">
            <input
              value={manualCode}
              onChange={(event) => setManualCode(event.target.value)}
              placeholder="/verify/... ou UUID do membro"
              className="min-w-0 flex-1 rounded-full border border-white/5 bg-black/60 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25"
            />

            <button
              type="submit"
              disabled={disabled || !manualCode.trim() || !activeEvent}
              className="rounded-full border border-white/10 bg-white/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-white/45 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Check
            </button>
          </form>

          {status && (
            <p className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-300">
              {status}
            </p>
          )}

          {error && (
            <p className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-300">
              {error}
            </p>
          )}
        </>
      )}
    </section>
  )
}

function extractMemberId(value) {
  const cleanValue = String(value || '').trim()

  if (!cleanValue) return ''

  try {
    const parsedUrl = new URL(cleanValue)
    const [, memberId] = parsedUrl.pathname.match(/\/verify\/([^/?#]+)/) || []

    if (memberId) {
      return decodeURIComponent(memberId)
    }
  } catch {
    const [, memberId] = cleanValue.match(/\/verify\/([^/?#]+)/) || []

    if (memberId) {
      return decodeURIComponent(memberId)
    }
  }

  return cleanValue
}

export default EventCheckInScanner
