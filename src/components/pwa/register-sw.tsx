"use client";

import { useEffect } from "react";

/**
 * Composant qui enregistre le Service Worker.
 * À placer dans le layout racine.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[SW] Enregistré:", registration.scope);
        })
        .catch((error) => {
          console.warn("[SW] Erreur:", error);
        });
    }
  }, []);

  return null;
}
