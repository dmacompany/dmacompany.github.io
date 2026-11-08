/* Area soci DMA COMPANY – service worker: apre l'app anche con rete lenta.
   I dati personali non vengono mai salvati qui: passano solo le pagine e la grafica. */
const BASE = self.registration.scope.replace(location.origin, "");   // "/area/" oppure "/registro/"
const V = "dma-" + BASE.replace(/\//g, "") + "-v24";
const SHELL = [BASE, "/area/area.js?v=22", "/area/area.css?v=17", "/area/registro.js?v=7", "/area/app.js?v=4", "/fonts/montserrat.css",
  "/fonts/montserrat-latin-400-normal.woff2", "/fonts/montserrat-latin-600-normal.woff2", "/fonts/montserrat-latin-700-normal.woff2",
  BASE + "icon-192.png", BASE + "apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin) return;          // dati e Google: sempre dalla rete
  if (!(u.pathname.startsWith("/area/") || u.pathname.startsWith("/registro/") || u.pathname.startsWith("/fonts/"))) return;
  const key = u.pathname === BASE || u.pathname === BASE + "index.html" ? BASE : r;
  e.respondWith(fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(key, cp)); } return res; })
    .catch(() => caches.match(key)));
});
