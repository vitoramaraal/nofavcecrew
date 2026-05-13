import { getSupabase } from './supabase'

const galleryBucket = 'application-photos'
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp']
const maxImageSize = 5 * 1024 * 1024

export async function updateMemberProfile(memberId, accessCode, profile) {
  const client = getSupabase()

  const { data, error } = await client.rpc('update_member_profile', {
    active_member_id: memberId,
    secret_code: accessCode,
    profile_bio: profile.bio || '',
    profile_instagram: profile.instagram || '',
    profile_car_model: profile.car_model || '',
    profile_car_setup: profile.car_setup || '',
    profile_car_specs: profile.car_specs || '',
    profile_car_mods: profile.car_mods || '',
    profile_gallery_urls: profile.gallery_urls || [],
  })

  if (error) {
    throw error
  }

  const member = Array.isArray(data) ? data[0] : data

  if (!member) {
    throw new Error('Perfil nao encontrado.')
  }

  return member
}

export async function uploadMemberGalleryImage(memberId, file) {
  const imageError = validateGalleryImage(file)

  if (imageError) {
    throw new Error(imageError)
  }

  const client = getSupabase()
  const fileExtension = file.name.split('.').pop()
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExtension}`
  const filePath = `member-gallery/${memberId}/${fileName}`

  const { error } = await client.storage
    .from(galleryBucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw error
  }

  const { data } = client.storage.from(galleryBucket).getPublicUrl(filePath)

  return data.publicUrl
}

function validateGalleryImage(file) {
  if (!file) return 'Selecione uma imagem.'

  if (!allowedImageTypes.includes(file.type)) {
    return 'Formato invalido. Use JPG, PNG ou WEBP.'
  }

  if (file.size > maxImageSize) {
    return 'A imagem deve ter no maximo 5MB.'
  }

  return ''
}
