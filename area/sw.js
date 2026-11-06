/* Area soci DMA COMPANY – service worker: apre l'app anche con rete lenta.
   I dati personali non vengono mai salvati qui: passano solo le pagine e la grafica. */
const V = "dma-area-v1";
const SHELL = ["/area/", "/area/area.js?v=8", "/area/area.css?v=8", "/area/app.js?v=1", "/fonts/montserrat.css",
  "/fonts/montserrat-latin-400-normal.woff2", "/fonts/montserrat-latin-600-normal.woff2", "/fonts/montserrat-latin-700-normal.woff2",
  "/area/icon-192.png", "/area/apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin) return;          // dati e Google: sempre dalla rete
  if (!(u.pathname.startsWith("/area/") || u.pathname.startsWith("/fonts/"))) return;
  const key = u.pathname === "/area/" || u.pathname === "/area/index.html" ? "/area/" : r;
  e.respondWith(fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(key, cp)); } return res; })
    .catch(() => caches.match(key)));
});
