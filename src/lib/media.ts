import { supabase } from './supabase';
import { uploadImageToStorage } from './storage';

export interface MediaItem {
  id?: string;
  filename?: string;
  original_name?: string;
  file_path?: string;
  file_url?: string;
  mime_type?: string;
  file_size?: number;
  width?: number;
  height?: number;
  title?: string;
  alt_text?: string;
  description?: string;
  category?: string;
  uploaded_by?: string;
  created_at?: string;
  updated_at?: string;
}

export async function listMedia(search = '', category = '', limit = 48, offset = 0, order = 'created_at.desc') {
  try {
    let query = supabase.from('media_library').select('*').order('created_at', { ascending: false }).limit(limit).offset(offset);
    if (category) query = query.eq('category', category);
    if (search) query = query.ilike('name', `%${search}%`);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('listMedia error', e);
    return [];
  }
}

export async function uploadAndCreateMedia(file: File, uploadedBy = 'system', category = 'General') {
  // upload to storage and create media record
  const url = await uploadImageToStorage(file);
  const item: MediaItem = {
    filename: file.name.replace(/\..+$/, ''),
    original_name: file.name,
    file_path: url.replace(/^https?:\/\//, ''),
    file_url: url,
    mime_type: file.type,
    file_size: file.size,
    title: file.name.replace(/\.[^.]+$/, ''),
    alt_text: file.name.replace(/\.[^.]+$/, ''),
    description: '',
    category,
    uploaded_by: uploadedBy,
    created_at: new Date().toISOString(),
  };
  try {
    const { error } = await supabase.from('media_library').insert(item);
    if (error) throw error;
    return item;
  } catch (e) {
    console.error('uploadAndCreateMedia error', e);
    throw e;
  }
}

export async function updateMedia(id: string, payload: Partial<MediaItem>) {
  const { error } = await supabase.from('media_library').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
  return true;
}

export async function deleteMedia(id: string) {
  const { error } = await supabase.from('media_library').delete().eq('id', id);
  if (error) throw error;
  return true;
}
