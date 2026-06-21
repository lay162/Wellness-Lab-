import { supabase } from './supabase'

export async function uploadContentImage(file, bucket) {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from(bucket).upload(path, file)
  if (error) throw error
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export const CONTENT_BUCKETS = {
  blog_posts: 'blog-images',
  reviews: 'review-images',
  success_stories: 'success-story-images',
}
