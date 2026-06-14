import React from 'react';
import MediaLibrary from './MediaLibrary';
import { MediaItem } from '../lib/media';

const MediaPicker: React.FC<{ open: boolean; onClose: () => void; onSelect: (item: MediaItem) => void }> = ({ open, onClose, onSelect }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Select Image</h3>
          <button onClick={onClose} className="text-sm text-gray-600">Close</button>
        </div>
        <MediaLibrary selectable onSelect={(item) => { onSelect(item); onClose(); }} />
      </div>
    </div>
  );
}

export default MediaPicker;
