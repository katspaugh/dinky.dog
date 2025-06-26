import { supabase } from './supabase.js'

const MAX_SIZE = 1 * 1024 * 1024 // 1MB

export async function uploadImage(file: File) {
  if (file.size > MAX_SIZE) {
    throw new Error('Max file size is 1MB')
  }

  const fileName = Date.now() + '-' + file.name
  const { error } = await supabase.storage.from('images').upload(fileName, file)

  if (error) {
    throw error
  }

  const { data } = supabase.storage.from('images').getPublicUrl(fileName)
  return data.publicUrl
}
