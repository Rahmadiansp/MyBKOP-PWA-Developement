import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// ...existing code...

createRoot(document.getElementById("root")!).render(<App />);

// Register service worker (only in production and if file exists)
if ('serviceWorker' in navigator) {
  // If using Vite, import.meta.env.PROD is true in production builds
  const isProd = typeof import.meta !== 'undefined' && Boolean((import.meta as any).env?.PROD);

  if (isProd) {
    window.addEventListener('load', async () => {
      const swUrl = new URL('/service-worker.js', import.meta.url).href;
      try {
        // Verify file exists to avoid 404 registration errors
        const resp = await fetch(swUrl, { method: 'GET', cache: 'no-store' });
        if (!resp.ok) {
          console.warn(`Service worker not found at ${swUrl} (status ${resp.status}). Skipping registration.`);
          return;
        }

        const registration = await navigator.serviceWorker.register(swUrl);
        console.log('Service Worker registered with scope:', registration.scope);

        // Optional: listen for updates
        registration.addEventListener('updatefound', () => {
          const installing = registration.installing;
          if (installing) {
            installing.addEventListener('statechange', () => {
              console.log('Service worker state:', installing.state);
            });
          }
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    });
  } else {
    console.info('Skipping service worker registration in development.');
  }
}
// ...existing code...