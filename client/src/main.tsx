import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const APP_VERSION = 'v23-textarea-250px';

async function clearAllCachesAndReload() {
  if ('caches' in window) {
    const names = await caches.keys();
    await Promise.all(names.map(name => caches.delete(name)));
    console.log('All caches cleared');
  }
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map(r => r.unregister()));
    console.log('All service workers unregistered');
  }
}

const storedVersion = localStorage.getItem('app_version');
if (storedVersion !== APP_VERSION) {
  console.log('Version mismatch, clearing caches...');
  clearAllCachesAndReload().then(() => {
    localStorage.setItem('app_version', APP_VERSION);
    if (storedVersion) {
      window.location.reload();
    }
  });
} else {
  localStorage.setItem('app_version', APP_VERSION);
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'SW_UPDATED') {
      console.log('Service worker updated, reloading...');
      window.location.reload();
    }
  });
}

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('ServiceWorker registered:', registration.scope);
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated') {
                window.location.reload();
              }
            });
          }
        });
      })
      .catch((error) => {
        console.log('ServiceWorker registration failed:', error);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
