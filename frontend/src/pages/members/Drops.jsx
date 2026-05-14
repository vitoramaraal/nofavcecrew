import { useState } from 'react'
import MobileAppLayout from '../../components/members/MobileAppLayout'
import PageTransition from '../../components/PageTransition'

import { useCrew } from '../../context/crew'

function Drops() {
  const { crewDrops } = useCrew()
  const [selectedSizes, setSelectedSizes] = useState({})

  function selectSize(dropId, size) {
    setSelectedSizes((current) => ({
      ...current,
      [dropId]: size,
    }))
  }

  return (
    <MobileAppLayout title="Drops">
      <PageTransition>
        <section className="rounded-[2rem] border border-white/5 bg-zinc-900/60 p-6 backdrop-blur-xl">
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/30">
            Official Drops
          </p>

          <h2 className="mt-3 text-4xl font-black uppercase leading-none">
            Uniforms
          </h2>

          <p className="mt-4 text-sm leading-6 text-white/50">
            Pecas oficiais, adesivos e itens exclusivos para membros.
          </p>
        </section>

        <section className="mt-6 space-y-5">
          {crewDrops.map((drop) => (
            <DropCard
              key={drop.id}
              drop={drop}
              selectedSize={selectedSizes[drop.id] || ''}
              onSelectSize={(size) => selectSize(drop.id, size)}
            />
          ))}
        </section>
      </PageTransition>
    </MobileAppLayout>
  )
}

function DropCard({ drop, onSelectSize, selectedSize }) {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-white/5 bg-zinc-900/60 backdrop-blur-xl">
      <div className="relative h-56 bg-black">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.16),transparent_38%,rgba(239,68,68,0.18)_100%)]" />
        <div className="absolute inset-x-8 top-1/2 h-px bg-white/10" />
        <div className="absolute bottom-8 left-8 right-8 h-px bg-white/10" />

        <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/50 px-3 py-2 text-[9px] uppercase tracking-[0.2em] text-white/45 backdrop-blur-xl">
          {drop.status}
        </span>

        <span className="absolute bottom-4 right-4 text-[10px] uppercase tracking-[0.35em] text-white/20">
          NOFVCE
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-red-400">
              {drop.type || 'Drop'}
            </p>

            <h3 className="mt-2 text-2xl font-black uppercase">
              {drop.title}
            </h3>
          </div>

          <span className="rounded-full border border-white/10 bg-black/40 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
            {drop.price || 'TBD'}
          </span>
        </div>

        <p className="mt-3 text-sm leading-6 text-white/50">
          {drop.description}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <DropInfo label="Estoque" value={drop.stock || 'TBD'} />
          <DropInfo label="Release" value={drop.eta || 'Soon'} />
        </div>

        <div className="mt-5">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/25">
            Tamanho
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {(drop.sizes || []).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onSelectSize(size)}
                className={
                  selectedSize === size
                    ? 'rounded-full border border-white bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-black'
                    : 'rounded-full border border-white/10 bg-black/40 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/35'
                }
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          disabled
          className="mt-5 w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-[10px] font-black uppercase tracking-[0.28em] text-white/30 disabled:cursor-not-allowed"
        >
          Reserva em breve
        </button>
      </div>
    </article>
  )
}

function DropInfo({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-black/40 p-4">
      <p className="text-[10px] uppercase tracking-[0.25em] text-white/25">
        {label}
      </p>

      <p className="mt-2 text-sm font-black uppercase text-white/50">
        {value}
      </p>
    </div>
  )
}

export default Drops
