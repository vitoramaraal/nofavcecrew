const svgNamespace = 'http://www.w3.org/2000/svg'
const xlinkNamespace = 'http://www.w3.org/1999/xlink'

export async function exportMemberCardAsPng(svgElement, fileName) {
  if (!svgElement) {
    throw new Error('Carteirinha nao encontrada para exportacao.')
  }

  const svgClone = svgElement.cloneNode(true)

  svgClone.setAttribute('xmlns', svgNamespace)
  svgClone.setAttribute('width', '1600')
  svgClone.setAttribute('height', '1000')

  await inlineImages(svgClone)

  const svgMarkup = new XMLSerializer().serializeToString(svgClone)
  const svgBlob = new Blob([svgMarkup], {
    type: 'image/svg+xml;charset=utf-8',
  })
  const svgUrl = URL.createObjectURL(svgBlob)

  try {
    const image = await loadImage(svgUrl)
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    canvas.width = 1600
    canvas.height = 1000

    context.drawImage(image, 0, 0, canvas.width, canvas.height)

    const pngBlob = await canvasToBlob(canvas)

    downloadBlob(pngBlob, fileName)
  } finally {
    URL.revokeObjectURL(svgUrl)
  }
}

async function inlineImages(svgElement) {
  const images = Array.from(svgElement.querySelectorAll('image'))

  await Promise.all(
    images.map(async (image) => {
      const href =
        image.getAttribute('href') ||
        image.getAttributeNS(xlinkNamespace, 'href')

      if (!href || href.startsWith('data:')) return

      const absoluteUrl = new URL(href, window.location.origin).href
      const dataUrl = await imageUrlToDataUrl(absoluteUrl)

      image.setAttribute('href', dataUrl)
      image.setAttributeNS(xlinkNamespace, 'href', dataUrl)
    }),
  )
}

async function imageUrlToDataUrl(url) {
  const response = await fetch(url, {
    cache: 'force-cache',
    mode: 'cors',
  })

  if (!response.ok) {
    throw new Error('Nao foi possivel carregar uma imagem da carteirinha.')
  }

  const blob = await response.blob()

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onloadend = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image()

    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Falha ao gerar imagem PNG.'))
    image.src = url
  })
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
        return
      }

      reject(new Error('Nao foi possivel criar o arquivo PNG.'))
    }, 'image/png')
  })
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(url)
}
