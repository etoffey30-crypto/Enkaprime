import { supabase } from './supabase';

export async function uploadImageToStorage(file: File, bucket = 'media', folder = 'uploads') {
  const ext = (file.name || '').split('.').pop() || 'jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
  const path = `${folder}/${filename}`;

  // upload
  const { error } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;

  // build public url
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl || `/${path}`;
}
