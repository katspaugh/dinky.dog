import { supabase } from './supabase.js'

export type LinkPreview = {
  charset: string
  url: string
  title: string
  description?: string
  image?: string
}

export async function fetchPreview(url: string): Promise<LinkPreview> {
  const { data, error } = await supabase.functions.invoke('generate-link-preview', {
    body: { url },
  })

  if (error) {
    throw error
  }

  return data as LinkPreview
}
