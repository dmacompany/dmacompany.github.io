/* Area soci come app: installazione sul telefono e accesso che resta attivo. */
(function () {
  var standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  if (standalone) document.documentElement.classList.add("app");
  if ("serviceWorker" in navigator) window.addEventListener("load", function () { navigator.serviceWorker.register("/area/sw.js", { scope: "/area/" }).catch(function () {}); });
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
    txt.innerHTML = "<b>Installa l'app DMA Soci</b> sul telefono: si apre con un tocco, senza rientrare ogni volta.";
    go.hidden = false; bar.hidden = false;
  });
  go.addEventListener("click", function () { if (!ev) return; ev.prompt(); ev.userChoice.then(function () { ev = null; bar.hidden = true }) });
  window.addEventListener("appinstalled", function () { bar.hidden = true });
  if (ios) {
    var safari = /safari/i.test(ua) && !/crios|fxios|edgios|gsa\//i.test(ua);
    txt.innerHTML = safari
      ? "<b>Metti l'app DMA Soci sul telefono:</b> tocca <span class='sh' aria-label='Condividi'>&#xFEFF;<svg viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M12 3v12M7 8l5-5 5 5'/><path d='M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7'/></svg></span> in basso e poi <b>«Aggiungi alla schermata Home»</b>. Nell'app entrerai con la tua email."
      : "<b>Metti l'app DMA Soci sul telefono:</b> apri questa pagina con <b>Safari</b>, tocca Condividi e poi <b>«Aggiungi alla schermata Home»</b>.";
    bar.hidden = false;
  }
})();
