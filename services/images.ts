export const API_URL = 'https://images.dinky.dog/'

const MAX_SIZE = 1 * 1024 * 1024 // 1MB

function getImageUrl(id: string) {
  return `${API_URL}${id}`
}

export async function uploadImage(file: File) {
  if (file.size > MAX_SIZE) {
    throw new Error('Max file size is 1MB')
  }

  const formData = new FormData()
  formData.append('file', file)

  const resp = await fetch(API_URL, {
    method: 'POST',
    body: formData,
  })
  const data = await resp.json()
  return getImageUrl(data.fileName)
}
