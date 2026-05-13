import { getSupabase } from './supabase'

const feedBucket = 'application-photos'
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp']
const maxImageSize = 5 * 1024 * 1024

export async function fetchFeedPosts(memberId, accessCode) {
  const client = getSupabase()

  const { data, error } = await client.rpc('list_feed_posts', {
    active_member_id: memberId,
    secret_code: accessCode,
  })

  if (error) {
    throw error
  }

  return data || []
}

export async function createFeedPost(memberId, accessCode, body, imageUrls) {
  const client = getSupabase()

  const { error } = await client.rpc('create_feed_post', {
    active_member_id: memberId,
    secret_code: accessCode,
    post_body: body.trim(),
    post_image_urls: imageUrls || [],
  })

  if (error) {
    throw error
  }
}

export async function toggleFeedPostLike(memberId, accessCode, postId) {
  const client = getSupabase()

  const { error } = await client.rpc('toggle_feed_like', {
    active_member_id: memberId,
    secret_code: accessCode,
    target_post_id: postId,
  })

  if (error) {
    throw error
  }
}

export async function createFeedPostComment(
  memberId,
  accessCode,
  postId,
  body,
) {
  const client = getSupabase()

  const { error } = await client.rpc('create_feed_comment', {
    active_member_id: memberId,
    secret_code: accessCode,
    target_post_id: postId,
    comment_body: body.trim(),
  })

  if (error) {
    throw error
  }
}

export async function uploadFeedImage(memberId, file) {
  const imageError = validateFeedImage(file)

  if (imageError) {
    throw new Error(imageError)
  }

  const client = getSupabase()
  const fileExtension = file.name.split('.').pop()
  const randomId =
    globalThis.crypto?.randomUUID?.() ||
    Math.random().toString(36).slice(2)
  const fileName = `${Date.now()}-${randomId}.${fileExtension}`
  const filePath = `feed/${memberId}/${fileName}`

  const { error } = await client.storage.from(feedBucket).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) {
    throw error
  }

  const { data } = client.storage.from(feedBucket).getPublicUrl(filePath)

  return data.publicUrl
}

export function validateFeedImage(file) {
  if (!file) return 'Selecione uma imagem.'

  if (!allowedImageTypes.includes(file.type)) {
    return 'Formato invalido. Use JPG, PNG ou WEBP.'
  }

  if (file.size > maxImageSize) {
    return 'A imagem deve ter no maximo 5MB.'
  }

  return ''
}
