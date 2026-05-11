import { useState } from 'react'

import Background from '../components/Background'

function Apply() {
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')

  function handleImageChange(event) {
    const file = event.target.files[0]

    if (!file) {
      setPreview(null)
      setError('')
      return
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ]

    if (!allowedTypes.includes(file.type)) {
      setError('Formato inválido. Use JPG, PNG ou WEBP.')
      setPreview(null)
      return
    }

    const maxSize = 5 * 1024 * 1024

    if (file.size > maxSize) {
      setError('A imagem deve ter no máximo 5MB.')
      setPreview(null)
      return
    }

    setError('')
    setPreview(URL.createObjectURL(file))
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

        <a
          href="/members/login"
          className="text-[10px] uppercase tracking-[0.35em] text-white/35 transition hover:text-white"
        >
          Members
        </a>
      </header>

      <section className="relative z-10 mx-auto max-w-md px-6 py-10">
        <p className="text-[10px] uppercase tracking-[0.45em] text-white/30">
          Application
        </p>

        <h1 className="mt-4 text-5xl font-black uppercase leading-none">
          Enter the Crew
        </h1>

        <p className="mt-5 text-sm leading-6 text-white/45">
          Envie seus dados e uma foto do carro para análise da NoFvce Crew.
        </p>

        <form
          action="https://formsubmit.co/applynewmembersnofvcecrew@gmail.com"
          method="POST"
          encType="multipart/form-data"
          className="mt-8 space-y-4 rounded-[2rem] border border-white/5 bg-zinc-900/60 p-5 backdrop-blur-xl"
        >
          <input
            type="hidden"
            name="_subject"
            value="Nova inscrição - NoFvce Crew"
          />

          <input type="hidden" name="_captcha" value="false" />

          <input type="hidden" name="_template" value="table" />

          <input
            name="Nome"
            type="text"
            required
            placeholder="Seu nome"
            className="w-full rounded-2xl border border-white/5 bg-black/70 px-4 py-4 text-sm text-white outline-none placeholder:text-white/25"
          />

          <input
            name="Instagram"
            type="text"
            required
            placeholder="Instagram"
            className="w-full rounded-2xl border border-white/5 bg-black/70 px-4 py-4 text-sm text-white outline-none placeholder:text-white/25"
          />

          <input
            name="WhatsApp"
            type="text"
            required
            placeholder="WhatsApp"
            className="w-full rounded-2xl border border-white/5 bg-black/70 px-4 py-4 text-sm text-white outline-none placeholder:text-white/25"
          />

          <input
            name="Carro"
            type="text"
            required
            placeholder="Modelo do carro"
            className="w-full rounded-2xl border border-white/5 bg-black/70 px-4 py-4 text-sm text-white outline-none placeholder:text-white/25"
          />

          <input
            name="Setup"
            type="text"
            placeholder="Setup atual do carro"
            className="w-full rounded-2xl border border-white/5 bg-black/70 px-4 py-4 text-sm text-white outline-none placeholder:text-white/25"
          />

          <textarea
            name="Mensagem"
            rows="4"
            placeholder="Por que quer entrar para a NoFvce?"
            className="w-full resize-none rounded-2xl border border-white/5 bg-black/70 px-4 py-4 text-sm text-white outline-none placeholder:text-white/25"
          />

          <label className="block rounded-2xl border border-dashed border-white/10 bg-black/50 p-5 text-center">
            <span className="block text-xs font-black uppercase tracking-[0.25em] text-white/40">
              Foto do carro
            </span>

            <span className="mt-2 block text-[11px] uppercase tracking-[0.2em] text-white/25">
              JPG, PNG ou WEBP • máximo 5MB
            </span>

            <input
              name="attachment"
              type="file"
              accept="image/png, image/jpeg, image/webp"
              required
              onChange={handleImageChange}
              className="mt-4 w-full text-xs text-white/40 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:text-white/60"
            />
          </label>

          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {preview && !error && (
            <div className="overflow-hidden rounded-[1.5rem] border border-white/5 bg-black/60">
              <img
                src={preview}
                alt="Prévia do carro"
                className="h-56 w-full object-cover"
              />

              <div className="p-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">
                  Preview do carro
                </p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!!error}
            className="w-full rounded-full border border-white/10 bg-white/10 px-6 py-4 text-xs font-black uppercase tracking-[0.32em] text-white/40 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Enviar aplicação
          </button>
        </form>
      </section>
    </main>
  )
}

export default Apply