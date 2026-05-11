import { useState } from 'react'
import Background from '../components/Background'
import { supabase } from '../lib/supabase'

function Apply() {
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  const [formData, setFormData] = useState({
    full_name: '',
    instagram: '',
    whatsapp: '',
    car_model: '',
    car_setup: '',
    message: '',
  })

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    })
  }

  function handleImageChange(event) {
    const file = event.target.files[0]

    if (!file) {
      setPreview(null)
      setSelectedFile(null)
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
      setSelectedFile(null)
      return
    }

    const maxSize = 5 * 1024 * 1024

    if (file.size > maxSize) {
      setError('A imagem deve ter no máximo 5MB.')
      setPreview(null)
      setSelectedFile(null)
      return
    }

    setError('')
    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
  }

  async function uploadApplicationPhoto(file) {
    if (!file) {
      return {
        imageUrl: null,
        imagePath: null,
      }
    }

    const fileExtension = file.name.split('.').pop()

    const fileName =
      `application-${Date.now()}.${fileExtension}`

    const filePath = `applications/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('application-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error(uploadError)
      throw uploadError
    }

    const { data } = supabase.storage
      .from('application-photos')
      .getPublicUrl(filePath)

    return {
      imageUrl: data.publicUrl,
      imagePath: filePath,
    }
  }

  async function sendEmailNotification(data) {
    const emailFormData = new FormData()

    emailFormData.append(
      '_subject',
      'Nova inscrição - NoFvce Crew',
    )

    emailFormData.append('_captcha', 'false')
    emailFormData.append('_template', 'table')

    emailFormData.append('Nome', data.full_name)
    emailFormData.append('Instagram', data.instagram)
    emailFormData.append('WhatsApp', data.whatsapp)
    emailFormData.append('Carro', data.car_model)
    emailFormData.append('Setup', data.car_setup || '-')
    emailFormData.append('Mensagem', data.message || '-')
    emailFormData.append('Foto', data.image_url || '-')

    try {
      await fetch(
        'https://formsubmit.co/ajax/applynewmembersnofvcecrew@gmail.com',
        {
          method: 'POST',
          body: emailFormData,
        },
      )
    } catch (emailError) {
      console.error(emailError)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (loading) return

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const {
        full_name,
        instagram,
        whatsapp,
        car_model,
      } = formData

      if (
        !full_name ||
        !instagram ||
        !whatsapp ||
        !car_model
      ) {
        setError('Preencha todos os campos obrigatórios.')
        setLoading(false)
        return
      }

      if (!selectedFile) {
        setError('Envie uma foto do carro.')
        setLoading(false)
        return
      }

      const { imageUrl, imagePath } =
        await uploadApplicationPhoto(selectedFile)

      const applicationPayload = {
        ...formData,
        image_name: selectedFile.name,
        image_url: imageUrl,
        image_path: imagePath,
        status: 'pending',
      }

      const { error: supabaseError } = await supabase
        .from('applications')
        .insert([applicationPayload])

      if (supabaseError) {
        console.error(supabaseError)

        setError(
          'Erro ao salvar aplicação na plataforma.',
        )

        setLoading(false)
        return
      }

      await sendEmailNotification(applicationPayload)

      setSuccess(true)

      setFormData({
        full_name: '',
        instagram: '',
        whatsapp: '',
        car_model: '',
        car_setup: '',
        message: '',
      })

      setPreview(null)
      setSelectedFile(null)

      event.target.reset()
    } catch (err) {
      console.error(err)

      setError(
        err?.message ||
          'Erro inesperado ao enviar aplicação.',
      )
    }

    setLoading(false)
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

        {success && (
          <div className="mt-6 rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/10 px-5 py-5">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-300">
              Aplicação enviada
            </p>

            <p className="mt-2 text-sm text-emerald-100/70">
              Sua aplicação foi salva na plataforma e enviada para análise.
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="mt-8 space-y-4 rounded-[2rem] border border-white/5 bg-zinc-900/60 p-5 backdrop-blur-xl"
        >
          <input
            name="full_name"
            type="text"
            required
            value={formData.full_name}
            onChange={handleChange}
            placeholder="Seu nome"
            className="w-full rounded-2xl border border-white/5 bg-black/70 px-4 py-4 text-sm text-white outline-none placeholder:text-white/25"
          />

          <input
            name="instagram"
            type="text"
            required
            value={formData.instagram}
            onChange={handleChange}
            placeholder="Instagram"
            className="w-full rounded-2xl border border-white/5 bg-black/70 px-4 py-4 text-sm text-white outline-none placeholder:text-white/25"
          />

          <input
            name="whatsapp"
            type="text"
            required
            value={formData.whatsapp}
            onChange={handleChange}
            placeholder="WhatsApp"
            className="w-full rounded-2xl border border-white/5 bg-black/70 px-4 py-4 text-sm text-white outline-none placeholder:text-white/25"
          />

          <input
            name="car_model"
            type="text"
            required
            value={formData.car_model}
            onChange={handleChange}
            placeholder="Modelo do carro"
            className="w-full rounded-2xl border border-white/5 bg-black/70 px-4 py-4 text-sm text-white outline-none placeholder:text-white/25"
          />

          <input
            name="car_setup"
            type="text"
            value={formData.car_setup}
            onChange={handleChange}
            placeholder="Setup atual do carro"
            className="w-full rounded-2xl border border-white/5 bg-black/70 px-4 py-4 text-sm text-white outline-none placeholder:text-white/25"
          />

          <textarea
            name="message"
            rows="4"
            value={formData.message}
            onChange={handleChange}
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
            disabled={!!error || loading}
            className="w-full rounded-full border border-white/10 bg-white/10 px-6 py-4 text-xs font-black uppercase tracking-[0.32em] text-white/40 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? 'Enviando...' : 'Enviar aplicação'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default Apply