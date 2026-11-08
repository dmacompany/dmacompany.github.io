/* Area soci come app: installazione sul telefono e accesso che resta attivo. */
(function () {
  var BASE = location.pathname.indexOf("/registro/") === 0 ? "/registro/" : "/area/";
  var NOME = (document.querySelector('meta[name="apple-mobile-web-app-title"]') || {}).content || "DMA";
  var standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  if (standalone) document.documentElement.classList.add("app");
  if ("serviceWorker" in navigator) window.addEventListener("load", function () { navigator.serviceWorker.register(BASE + "sw.js", { scope: BASE }).catch(function () {}); });
  // L'app riaperta dopo un po' si ricarica da sola: prende sempre l'ultima versione del sito e dati freschi.
  var nasc = 0;
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { nasc = Date.now(); return; }
    if (nasc && Date.now() - nasc > 15 * 60e3 && !document.querySelector("textarea:focus,input:focus")) location.reload();
  });
  if (standalone) return;
  var bar = document.getElementById("inst"); if (!bar) return;
  var get = function (k) { try { return localStorage.getItem(k) } catch (e) { return null } };
  var set = function (k, v) { try { localStorage.setItem(k, v) } catch (e) {} };
  if (get("ar.instNo") && Date.now() - Number(get("ar.instNo")) < 14 * 864e5) return;
  var ua = navigator.userAgent, ios = /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
  var txt = bar.querySelector(".it"), go = bar.querySelector(".ib"), no = bar.querySelector(".ix"), ev = null;
  no.addEventListener("click", function () { bar.hidden = true; set("ar.instNo", String(Date.now())) });
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault(); ev = e;
    txt.innerHTML = "<b>Installa l'app " + NOME + "</b> sul telefono: si apre con un tocco, senza rientrare ogni volta.";
    go.hidden = false; bar.hidden = false;
  });
  go.addEventListener("click", function () { if (!ev) return; ev.prompt(); ev.userChoice.then(function () { ev = null; bar.hidden = true }) });
  window.addEventListener("appinstalled", function () { bar.hidden = true });
  if (ios) {
    var safari = /safari/i.test(ua) && !/crios|fxios|edgios|gsa\//i.test(ua);
    txt.innerHTML = safari
      ? "<b>Metti l'app " + NOME + " sul telefono:</b> tocca <span class='sh' aria-label='Condividi'>&#xFEFF;<svg viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M12 3v12M7 8l5-5 5 5'/><path d='M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7'/></svg></span> in basso e poi <b>«Aggiungi alla schermata Home»</b>. L'app si aprirà già collegata."
      : "<b>Metti l'app " + NOME + " sul telefono:</b> apri questa pagina con <b>Safari</b>, tocca Condividi e poi <b>«Aggiungi alla schermata Home»</b>.";
    bar.hidden = false;
  }
})();
