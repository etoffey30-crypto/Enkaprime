import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Clear any stale localStorage settings that override code changes
// Remove this block once you have a proper CMS save flow
const SETTINGS_VERSION = '5';
if (localStorage.getItem('enka_settings_version') !== SETTINGS_VERSION) {
  localStorage.removeItem('local_settings');
  localStorage.removeItem('local_settings_map');
  localStorage.removeItem('local_heroes');
  localStorage.removeItem('local_services');
  localStorage.removeItem('admin_authed');
  localStorage.removeItem('admin_mock_mode');
  localStorage.setItem('enka_settings_version', SETTINGS_VERSION);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
