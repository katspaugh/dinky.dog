import { supabase } from './supabase.js'

export type LinkPreview = {
  charset: string
  url: string
  title: string
  description?: string
  image?: string
}

export async function fetchPreview(url: string): Promise<LinkPreview> {
  const { data, error } = await supabase.functions.invoke('link-preview', {
    body: { url },
  })

  if (error) {
    throw error
  }

  return data as LinkPreview
}
