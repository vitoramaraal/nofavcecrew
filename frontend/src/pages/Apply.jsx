import { useState } from 'react'
import Background from '../components/Background'
import { supabase } from '../lib/supabase'

function Apply() {
  const [carPreview, setCarPreview] = useState(null)
  const [memberPreview, setMemberPreview] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [carFile, setCarFile] = useState(null)
  const [memberFile, setMemberFile] = useState(null)

  const [formData, setFormData] = useState({
    full_name: '',
    instagram: '',
    whatsapp: '',
    car_model: '',
    message: '',
  })

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    })
  }

  function validateImage(file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    const maxSize = 5 * 1024 * 1024

    if (!allowedTypes.includes(file.type)) {
      return 'Formato inválido. Use JPG, PNG ou WEBP.'
    }

    if (file.size > maxSize) {
      return 'A imagem deve ter no máximo 5MB.'
    }

    return ''
  }

  function handleMemberImageChange(event) {
    const file = event.target.files[0]

    if (!file) {
      setMemberPreview(null)
      setMemberFile(null)
      setError('')
      return
    }

    const imageError = validateImage(file)

    if (imageError) {
      setError(imageError)
      setMemberPreview(null)
      setMemberFile(null)
      return
    }

    setError('')
    setMemberFile(file)
    setMemberPreview(URL.createObjectURL(file))
  }

  function handleCarImageChange(event) {
    const file = event.target.files[0]

    if (!file) {
      setCarPreview(null)
      setCarFile(null)
      setError('')
      return
    }

    const imageError = validateImage(file)

    if (imageError) {
      setError(imageError)
      setCarPreview(null)
      setCarFile(null)
      return
    }

    setError('')
    setCarFile(file)
    setCarPreview(URL.createObjectURL(file))
  }

  async function uploadPhoto(file, folder) {
    const fileExtension = file.name.split('.').pop()
    const fileName = `${folder}-${Date.now()}.${fileExtension}`
    const filePath = `${folder}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('application-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      throw uploadError
    }

    const { data } = supabase.storage
      .from('application-photos')
      .getPublicUrl(filePath)

    return {
      url: data.publicUrl,
      path: filePath,
    }
  }

  async function sendEmailNotification(data) {
    const emailFormData = new FormData()

    emailFormData.append('_subject', 'Nova inscrição - NoFvce Crew')
    emailFormData.append('_captcha', 'false')
    emailFormData.append('_template', 'table')
    emailFormData.append('Nome', data.full_name)
    emailFormData.append('Instagram', data.instagram)
    emailFormData.append('WhatsApp', data.whatsapp)
    emailFormData.append('Carro', data.car_model)
    emailFormData.append('Mensagem', data.message || '-')
    emailFormData.append('Foto do membro', data.member_photo_url || '-')
    emailFormData.append('Foto do carro', data.image_url || '-')

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
      const { full_name, instagram, whatsapp, car_model } = formData

      if (!full_name || !instagram || !whatsapp || !car_model) {
        setError('Preencha todos os campos obrigatórios.')
        setLoading(false)
        return
      }

      if (!memberFile) {
        setError('Envie uma foto sua para a carteirinha.')
        setLoading(false)
        return
      }

      if (!carFile) {
        setError('Envie uma foto do carro.')
        setLoading(false)
        return
      }

      const memberPhoto = await uploadPhoto(memberFile, 'member-photos')
      const carPhoto = await uploadPhoto(carFile, 'applications')

      const applicationPayload = {
        ...formData,
        car_setup: null,
        image_name: carFile.name,
        image_url: carPhoto.url,
        image_path: carPhoto.path,
        member_photo_url: memberPhoto.url,
        member_photo_path: memberPhoto.path,
        status: 'pending',
      }

      const { error: supabaseError } = await supabase
        .from('applications')
        .insert([applicationPayload])

      if (supabaseError) {
        console.error(supabaseError)
        setError('Erro ao salvar aplicação na plataforma.')
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
        message: '',
      })

      setCarPreview(null)
      setMemberPreview(null)
      setCarFile(null)
      setMemberFile(null)

      event.target.reset()
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Erro inesperado ao enviar aplicação.')
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
          Envie seus dados, uma foto sua para a carteirinha e uma foto do carro
          para análise da NoFvce Crew.
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

          <textarea
            name="message"
            rows="4"
            value={formData.message}
            onChange={handleChange}
            placeholder="Por que quer entrar para a NoFvce?"
            className="w-full resize-none rounded-2xl border border-white/5 bg-black/70 px-4 py-4 text-sm text-white outline-none placeholder:text-white/25"
          />

          <ImageInput
            title="Foto para carteirinha"
            description="Foto da pessoa • JPG, PNG ou WEBP • máximo 5MB"
            name="member_photo"
            onChange={handleMemberImageChange}
          />

          {memberPreview && !error && (
            <PreviewImage src={memberPreview} label="Preview da foto do membro" />
          )}

          <ImageInput
            title="Foto do carro"
            description="Foto do carro • JPG, PNG ou WEBP • máximo 5MB"
            name="car_photo"
            onChange={handleCarImageChange}
          />

          {carPreview && !error && (
            <PreviewImage src={carPreview} label="Preview do carro" />
          )}

          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-300">
              {error}
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

function ImageInput({ title, description, name, onChange }) {
  return (
    <label className="block rounded-2xl border border-dashed border-white/10 bg-black/50 p-5 text-center">
      <span className="block text-xs font-black uppercase tracking-[0.25em] text-white/40">
        {title}
      </span>

      <span className="mt-2 block text-[11px] uppercase tracking-[0.2em] text-white/25">
        {description}
      </span>

      <input
        name={name}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        required
        onChange={onChange}
        className="mt-4 w-full text-xs text-white/40 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:text-white/60"
      />
    </label>
  )
}

function PreviewImage({ src, label }) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-white/5 bg-black/60">
      <img src={src} alt={label} className="h-56 w-full object-cover" />

      <div className="p-4">
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">
          {label}
        </p>
      </div>
    </div>
  )
}

export default Apply