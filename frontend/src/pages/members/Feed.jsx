import { useEffect, useMemo, useState } from 'react'
import MobileAppLayout from '../../components/members/MobileAppLayout'
import PageTransition from '../../components/PageTransition'
import {
  createFeedPost,
  createFeedPostComment,
  fetchFeedPosts,
  toggleFeedPostLike,
  uploadFeedImage,
  validateFeedImage,
} from '../../lib/feed'
import { getCurrentMember, getStoredAccessCode } from '../../utils/auth'

const maxPostImages = 4

function Feed() {
  const [posts, setPosts] = useState([])
  const [postBody, setPostBody] = useState('')
  const [postFiles, setPostFiles] = useState([])
  const [comments, setComments] = useState({})
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [busyPostId, setBusyPostId] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const currentMember = getCurrentMember()
  const accessCode = getStoredAccessCode()
  const previews = useMemo(
    () =>
      postFiles.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    [postFiles],
  )

  async function loadFeed(showLoading = true) {
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
      const data = await fetchFeedPosts(currentMember.id, accessCode)

      setPosts(data)
    } catch (feedError) {
      console.error(feedError)
      setError('Nao foi possivel carregar o feed.')
    }

    setLoading(false)
  }

  function handleFileChange(event) {
    const selectedFiles = Array.from(event.target.files || [])

    event.target.value = ''

    if (selectedFiles.length === 0) return

    const nextFiles = [...postFiles, ...selectedFiles].slice(0, maxPostImages)
    const imageError = nextFiles.map(validateFeedImage).find(Boolean)

    if (imageError) {
      setError(imageError)
      return
    }

    setError('')
    setSuccess('')
    setPostFiles(nextFiles)
  }

  function removePostFile(fileName) {
    setPostFiles((current) => current.filter((file) => file.name !== fileName))
  }

  async function handleCreatePost(event) {
    event.preventDefault()

    const body = postBody.trim()

    if (posting) return

    if (!body && postFiles.length === 0) {
      setError('Escreva uma legenda ou adicione uma foto.')
      return
    }

    if (!currentMember?.id || !accessCode) {
      setError('Sessao de membro invalida.')
      return
    }

    setPosting(true)
    setError('')
    setSuccess('')

    try {
      const imageUrls = []

      for (const file of postFiles) {
        imageUrls.push(await uploadFeedImage(currentMember.id, file))
      }

      await createFeedPost(currentMember.id, accessCode, body, imageUrls)
      setPostBody('')
      setPostFiles([])
      setSuccess('Post publicado.')
      await loadFeed(false)
    } catch (postError) {
      console.error(postError)
      setError(postError?.message || 'Nao foi possivel publicar.')
    }

    setPosting(false)
  }

  async function handleToggleLike(postId) {
    if (busyPostId || !currentMember?.id || !accessCode) return

    setBusyPostId(postId)
    setError('')

    try {
      await toggleFeedPostLike(currentMember.id, accessCode, postId)
      await loadFeed(false)
    } catch (likeError) {
      console.error(likeError)
      setError('Nao foi possivel atualizar a curtida.')
    }

    setBusyPostId('')
  }

  async function handleCreateComment(event, postId) {
    event.preventDefault()

    const body = (comments[postId] || '').trim()

    if (!body || busyPostId || !currentMember?.id || !accessCode) return

    setBusyPostId(postId)
    setError('')

    try {
      await createFeedPostComment(currentMember.id, accessCode, postId, body)
      setComments((current) => ({ ...current, [postId]: '' }))
      await loadFeed(false)
    } catch (commentError) {
      console.error(commentError)
      setError('Nao foi possivel comentar.')
    }

    setBusyPostId('')
  }

  useEffect(() => {
    let isMounted = true

    async function loadInitialFeed() {
      if (!currentMember?.id || !accessCode) {
        if (isMounted) {
          setError('Sessao de membro invalida.')
          setLoading(false)
        }

        return
      }

      try {
        const data = await fetchFeedPosts(currentMember.id, accessCode)

        if (!isMounted) return

        setPosts(data)
      } catch (feedError) {
        console.error(feedError)

        if (!isMounted) return

        setError('Nao foi possivel carregar o feed.')
      }

      if (isMounted) {
        setLoading(false)
      }
    }

    void loadInitialFeed()

    return () => {
      isMounted = false
    }
  }, [accessCode, currentMember?.id])

  useEffect(
    () => () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url))
    },
    [previews],
  )

  return (
    <MobileAppLayout title="Feed">
      <PageTransition>
        <section className="px-5 pb-28 pt-6">
          <p className="text-[10px] uppercase tracking-[0.45em] text-white/30">
            Crew Feed
          </p>

          <h1 className="mt-4 text-4xl font-black uppercase leading-none text-white">
            Private Drop
          </h1>

          <p className="mt-4 text-sm leading-6 text-white/45">
            Fotos, atualizacoes e conversa visual da NoFvce Crew.
          </p>

          <form
            onSubmit={handleCreatePost}
            className="mt-6 space-y-4 rounded-[2rem] border border-white/5 bg-zinc-900/70 p-5 backdrop-blur-xl"
          >
            <textarea
              value={postBody}
              onChange={(event) => {
                setPostBody(event.target.value.slice(0, 700))
                setError('')
                setSuccess('')
              }}
              placeholder="Legenda"
              rows="4"
              maxLength="700"
              className="w-full resize-none rounded-2xl border border-white/5 bg-black/60 px-4 py-4 text-sm leading-6 text-white outline-none placeholder:text-white/25"
            />

            {previews.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {previews.map((preview) => (
                  <div
                    key={preview.url}
                    className="overflow-hidden rounded-2xl border border-white/5 bg-black/60"
                  >
                    <img
                      src={preview.url}
                      alt={preview.name}
                      className="aspect-square w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => removePostFile(preview.name)}
                      className="w-full bg-red-500/10 px-3 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-red-300"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <label className="rounded-full border border-white/10 bg-white/10 px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/45">
                Foto
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  multiple
                  onChange={handleFileChange}
                  disabled={posting || postFiles.length >= maxPostImages}
                  className="hidden"
                />
              </label>

              <button
                type="submit"
                disabled={posting}
                className="rounded-full border border-white/10 bg-white/10 px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/45 transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                {posting ? 'Postando...' : 'Publicar'}
              </button>

              <button
                type="button"
                onClick={() => loadFeed()}
                disabled={loading}
                className="rounded-full border border-white/10 bg-black/40 px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/35 disabled:opacity-40"
              >
                Sync
              </button>
            </div>

            <p className="text-xs text-white/25">
              {postFiles.length}/{maxPostImages} fotos
            </p>

            {success && (
              <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-300">
                {success}
              </p>
            )}

            {error && (
              <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-300">
                {error}
              </p>
            )}
          </form>

          <div className="mt-6 space-y-5">
            {loading && (
              <p className="text-sm text-white/35">Carregando feed...</p>
            )}

            {!loading && posts.length === 0 && (
              <article className="rounded-[2rem] border border-white/5 bg-zinc-900/70 p-5 text-sm text-white/40 backdrop-blur-xl">
                Nenhum post ainda.
              </article>
            )}

            {posts.map((post) => (
              <FeedPost
                key={post.id}
                post={post}
                commentValue={comments[post.id] || ''}
                busy={busyPostId === post.id}
                onLike={() => handleToggleLike(post.id)}
                onCommentChange={(value) =>
                  setComments((current) => ({ ...current, [post.id]: value }))
                }
                onCommentSubmit={(event) =>
                  handleCreateComment(event, post.id)
                }
              />
            ))}
          </div>
        </section>
      </PageTransition>
    </MobileAppLayout>
  )
}

function FeedPost({
  post,
  commentValue,
  busy,
  onLike,
  onCommentChange,
  onCommentSubmit,
}) {
  const images = Array.isArray(post.image_urls) ? post.image_urls : []
  const comments = Array.isArray(post.comments) ? post.comments : []

  return (
    <article className="overflow-hidden rounded-[2rem] border border-white/5 bg-zinc-900/70 backdrop-blur-xl">
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-full border border-white/10 bg-black/50">
            {post.author_member_photo_url ? (
              <img
                src={post.author_member_photo_url}
                alt={post.author_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] font-black uppercase text-white/25">
                NFC
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black uppercase text-white">
              {post.author_name || 'NoFvce'}
            </p>

            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/25">
              {post.author_member_number || 'NOFVCE'} / {post.author_role || 'member'}
            </p>
          </div>
        </div>

        {post.body && (
          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-white/60">
            {post.body}
          </p>
        )}
      </div>

      {images.length > 0 && (
        <div
          className={
            images.length === 1
              ? 'grid gap-1'
              : 'grid grid-cols-2 gap-1'
          }
        >
          {images.map((imageUrl) => (
            <img
              key={imageUrl}
              src={imageUrl}
              alt="Post"
              className="aspect-square w-full object-cover"
            />
          ))}
        </div>
      )}

      <div className="p-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onLike}
            disabled={busy}
            className={
              post.liked_by_current_member
                ? 'rounded-full border border-red-500/30 bg-red-500/15 px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-red-300 disabled:opacity-40'
                : 'rounded-full border border-white/10 bg-white/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/45 disabled:opacity-40'
            }
          >
            {post.liked_by_current_member ? 'Curtido' : 'Curtir'}
          </button>

          <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
            {post.like_count || 0} likes / {post.comment_count || 0} comments
          </p>
        </div>

        {comments.length > 0 && (
          <div className="mt-4 space-y-3">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-2xl border border-white/5 bg-black/40 p-4"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400">
                  {comment.author_name || 'NoFvce'}
                </p>

                <p className="mt-2 text-sm leading-6 text-white/55">
                  {comment.body}
                </p>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={onCommentSubmit} className="mt-4 flex gap-3">
          <input
            value={commentValue}
            onChange={(event) => onCommentChange(event.target.value)}
            placeholder="Comentar"
            maxLength="400"
            className="min-w-0 flex-1 rounded-full border border-white/5 bg-black/60 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25"
          />

          <button
            type="submit"
            disabled={busy || !commentValue.trim()}
            className="rounded-full border border-white/10 bg-white/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-white/45 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Send
          </button>
        </form>
      </div>
    </article>
  )
}

export default Feed
