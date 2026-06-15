import React, { useEffect, useState } from 'react';
import { listMedia, uploadAndCreateMedia, updateMedia, deleteMedia, MediaItem } from '../lib/media';
import { Upload, X, Edit3, Trash2 } from 'lucide-react';

const MediaCard: React.FC<{ item: MediaItem; onUse?: (i: MediaItem) => void; onEdit?: (i: MediaItem) => void; onDelete?: (i: MediaItem) => void }> = ({ item, onUse, onEdit, onDelete }) => (
  <div className="border rounded-md overflow-hidden flex flex-col">
    <div className="w-full h-40 bg-gray-100">
      <img src={(item.file_url || item.image_url || item.file_url)} alt={item.title || item.alt_text || item.original_name} className="w-full h-full object-cover" />
    </div>
    <div className="p-2 flex-1 flex flex-col">
      <div className="text-sm font-semibold truncate">{item.title || item.original_name}</div>
      <div className="text-xs text-gray-500">{item.category || 'General'}</div>
      <div className="mt-2 flex items-center gap-2">
        {onUse && <button onClick={() => onUse(item)} className="text-xs px-2 py-1 rounded bg-blue-600 text-white">Use</button>}
        {onEdit && <button onClick={() => onEdit(item)} className="p-1 rounded bg-gray-100"><Edit3 size={14} /></button>}
        {onDelete && <button onClick={() => onDelete(item)} className="p-1 rounded bg-red-50"><Trash2 size={14} className="text-red-500" /></button>}
      </div>
    </div>
  </div>
);

const MediaLibrary: React.FC<{ selectable?: boolean; onSelect?: (item: MediaItem) => void }> = ({ selectable = false, onSelect }) => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const data = await listMedia(search, category, 200);
    setItems(data as MediaItem[]);
  };

  useEffect(() => { load(); }, [search, category]);

  const handleFile = async (f?: File) => {
    if (!f) return;
    setUploading(true);
    try {
      await uploadAndCreateMedia(f, 'admin', category || 'General');
      await load();
    } catch (e) {
      console.error(e);
      alert('Upload failed');
    } finally { setUploading(false); }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm('Delete this media item?')) return;
    try { await deleteMedia(id); await load(); } catch (e) { console.error(e); alert('Delete failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-2xl font-bold">Media Library</h2>
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-2 px-3 py-2 bg-white border rounded cursor-pointer">
            <Upload size={16} /> <span className="text-sm">Upload Image</span>
            <input type="file" accept="image/*" onChange={e => handleFile(e.target.files?.[0])} className="hidden" />
          </label>
        </div>
      </div>

      <div className="flex gap-2 items-center mb-4">
        <input placeholder="Search by name, title or alt text" value={search} onChange={e => setSearch(e.target.value)} className="px-3 py-2 rounded border w-full" />
        <select value={category} onChange={e => setCategory(e.target.value)} className="px-3 py-2 rounded border">
          <option value="">All</option>
          <option>Hero</option>
          <option>Training</option>
          <option>Blogs</option>
          <option>Services</option>
          <option>Brand</option>
          <option>General</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(it => (
          <MediaCard key={it.id || (it.file_url + Math.random())} item={it} onUse={selectable ? onSelect : undefined} onEdit={() => { const title = prompt('Title', it.title || '') || ''; updateMedia(it.id as string, { title }).then(load); }} onDelete={() => handleDelete(it.id)} />
        ))}
      </div>
    </div>
  );
}

export default MediaLibrary;
