import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY or SUPABASE_URL and SUPABASE_ANON_KEY in your environment.');
  process.exit(1);
}

// Prefer a service role key for server-side migrations so RLS doesn't block inserts.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
if (!supabaseKey) {
  console.error('Missing Supabase key. Set SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function collectUrls() {
  const urlSet = new Map<string, Array<{ table: string; column: string; id: string }>>();

  const push = (url: string | null | undefined, table: string, column: string, id: any) => {
    if (!url) return;
    const u = String(url).trim();
    if (!u) return;
    if (!urlSet.has(u)) urlSet.set(u, []);
    urlSet.get(u)!.push({ table, column, id: String(id) });
  };

  // hero_banners
  try {
    const { data: heroes } = await supabase.from('hero_banners').select('id, image_url, mobile_image_url');
    (heroes || []).forEach((h: any) => {
      push(h.image_url, 'hero_banners', 'image_url', h.id);
      push(h.mobile_image_url, 'hero_banners', 'mobile_image_url', h.id);
    });
  } catch (e) { console.error('hero_banners error', e); }

  // trainings
  try {
    const { data: trainings } = await supabase.from('trainings').select('id, image_url');
    (trainings || []).forEach((t: any) => push(t.image_url, 'trainings', 'image_url', t.id));
  } catch (e) { console.error('trainings error', e); }

  // blogs
  try {
    const { data: blogs } = await supabase.from('blogs').select('id, featured_image_url');
    (blogs || []).forEach((b: any) => push(b.featured_image_url, 'blogs', 'featured_image_url', b.id));
  } catch (e) { console.error('blogs error', e); }

  // team_members
  try {
    const { data: team } = await supabase.from('team_members').select('id, image_url');
    (team || []).forEach((m: any) => push(m.image_url, 'team_members', 'image_url', m.id));
  } catch (e) { /* table may not exist */ }

  // content_blocks
  try {
    const { data: blocks } = await supabase.from('content_blocks').select('id, image_url');
    (blocks || []).forEach((c: any) => push(c.image_url, 'content_blocks', 'image_url', c.id));
  } catch (e) { /* ignore */ }

  // media table (existing) — include default media entries
  try {
    const { data: media } = await supabase.from('media_library').select('id, file_url');
    (media || []).forEach((m: any) => push(m.file_url, 'media_library', 'file_url', m.id));
  } catch (e) { /* ignore */ }

  // site_settings entries that look like image urls
  try {
    const { data: settings } = await supabase.from('site_settings').select('id, key, value');
    (settings || []).forEach((s: any) => {
      const v = typeof s.value === 'string' ? s.value : JSON.stringify(s.value);
      if (!v) return;
      if (v.startsWith('http') || v.startsWith('/') || v.match(/\.png|\.jpg|\.jpeg|\.webp|\.svg/)) {
        push(v, 'site_settings', 'value', s.id || s.key);
      }
    });
  } catch (e) { console.error('site_settings error', e); }

  return urlSet;
}

async function ensureMediaForUrl(url: string) {
  // check existing
  try {
    const { data: existing } = await supabase.from('media_library').select('*').eq('file_url', url).limit(1).single();
    if (existing && existing.id) return existing;
  } catch (e) {
    // continue to insert if query failed to find existing
  }

  const filename = url.split('/').pop() || url;
  const item = {
    filename: filename.replace(/\?.*$/, ''),
    original_name: filename.replace(/\?.*$/, ''),
    file_path: url,
    file_url: url,
    mime_type: null,
    file_size: null,
    title: filename.replace(/\.[^.]+$/, ''),
    alt_text: filename.replace(/\.[^.]+$/, ''),
    description: 'Imported from legacy image fields',
    category: 'Imported',
    uploaded_by: 'migration',
    created_at: new Date().toISOString(),
  };
  const { data, error } = await supabase.from('media_library').insert(item).select().single();
  if (error) {
    console.error('insert media error', error);
    return null;
  }
  return data;
}

async function run() {
  console.log('Collecting image URLs...');
  const urlSet = await collectUrls();
  console.log(`Found ${urlSet.size} unique URLs`);

  for (const [url, usages] of urlSet.entries()) {
    try {
      const media = await ensureMediaForUrl(url);
      if (!media || !media.id) continue;
      // insert usages
      for (const u of usages) {
        await supabase.from('media_usages').insert({ media_id: media.id, table_name: u.table, column_name: u.column, row_id: u.id, context: null }).catch(e => { /* ignore */ });
      }
      console.log('Imported', url, '->', media.id);
    } catch (e) {
      console.error('Error processing', url, e);
    }
  }

  console.log('Done.');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
