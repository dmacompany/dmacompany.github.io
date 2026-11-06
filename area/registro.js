/* Registro presenze (istruttori) e presenze/assenze nell'area soci.
   Usa le funzioni di area.js: S, main, sess, esc, toast, render, kid. */
(function () {
  const { S, main, sess, esc, toast, render, kid } = window.AR;
  const MESI_N = ["gennaio","febbraio","marzo","aprile","maggio","giugno","luglio","agosto","settembre","ottobre","novembre","dicembre"];
  const GG = ["dom","lun","mar","mer","gio","ven","sab"];
  const oggi = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  const fdata = iso => { const [y, m, d] = String(iso).split("-"); const dt = new Date(+y, m - 1, +d); return GG[dt.getDay()] + " " + (+d) + " " + MESI_N[m - 1]; };
  const stagioneMesi = () => { const t = new Date(), y = t.getMonth() >= 8 ? t.getFullYear() : t.getFullYear() - 1, out = [];
    for (let i = 0; i < 10; i++) { const m = (8 + i) % 12, yy = m >= 8 ? y : y + 1; out.push(yy + "-" + String(m + 1).padStart(2, "0")); } return out; };
  const meseNome = ym => { const [y, m] = ym.split("-"); return MESI_N[m - 1] + " " + y; };
  const R = { vista: "reg", corso: null, data: oggi(), stato: {}, extra: [], carico: false, salvato: false, mese: oggi().slice(0, 7), riep: null, socio: false, pres: null, ass: false };
  S.reg = R;

  /* ---------------- vista istruttore ---------------- */
  function corsi() { return (S.D.staff && S.D.staff.corsi) || []; }
  function corso() { return corsi().find(c => c.id === R.corso) || corsi()[0]; }

  async function carica() {
    const c = corso(); if (!c) return; R.corso = c.id; R.carico = false; R.stato = {}; R.extra = []; render();
    try {
      const j = await sess({ tipo: "staff_registro", corso: c.id, data: R.data });
      if (!j.ok) throw new Error(j.errore);
      const ids = new Set((c.allievi || []).map(a => a.id || "n:" + a.nome));
      j.righe.forEach(r => {
        const key = r.socio || "n:" + r.nominativo;
        if (ids.has(key)) R.stato[key] = { s: r.stato, nota: r.nota };
        else R.extra.push({ nome: r.nominativo, s: r.stato, nota: r.nota });
      });
      R.salvato = j.salvato; R.carico = true;
    } catch (x) { if (x.message !== "sessione") toast("Registro non caricato, riprova"); }
    render();
  }

  function rigaAllievo(a) {
    const key = a.id || "n:" + a.nome, st = R.stato[key] || {}, s = st.s || "";
    const b = (v, l) => `<button type="button" class="pb ${v}${s === v ? " on" : ""}" data-r="set" data-k="${esc(key)}" data-v="${v}" aria-pressed="${s === v}">${l}</button>`;
    return `<div class="prow"><div class="t"><b>${esc(a.nome)}</b>${s === "G" && st.nota ? `<span class="gnota">Avvisato: ${esc(st.nota)}</span>` : ""}${!a.id ? `<span>non in anagrafica</span>` : ""}</div>
      <div class="pbs">${b("P", "Presente")}${b("A", "Assente")}${b("G", "Giustif.")}</div></div>`;
  }
  function rigaExtra(e, i) {
    const s = e.s || "";
    return `<div class="prow extra"><div class="t"><input type="text" placeholder="Nome e cognome (prova o nuovo allievo)" value="${esc(e.nome || "")}" data-r="nome" data-i="${i}" aria-label="Nome allievo riga ${i + 1}"></div>
      <div class="pbs"><button type="button" class="pb P${s === "P" ? " on" : ""}" data-r="xset" data-i="${i}" data-v="P">Presente</button><button type="button" class="pb A${s === "A" ? " on" : ""}" data-r="xset" data-i="${i}" data-v="A">Assente</button></div></div>`;
  }
  function vReg() {
    const c = corso(); if (!c) return `<div class="alert">Nessun corso assegnato. Scrivi alla segreteria.</div>`;
    while (R.extra.filter(e => !e.nome).length < 3) R.extra.push({ nome: "", s: "" });
    const pres = Object.values(R.stato).filter(x => x.s === "P").length + R.extra.filter(e => e.nome && e.s === "P").length;
    return `<div class="stack">
      <div class="cchips">${corsi().map(x => `<button type="button" class="kid" data-r="corso" data-id="${esc(x.id)}" aria-pressed="${x.id === c.id}">${esc(x.nome)}</button>`).join("")}</div>
      <div class="card"><div class="top2"><div><h2 style="margin:0">${esc(c.nome)}</h2><p class="note" style="margin:2px 0 0">${esc([c.orario, c.ins, c.ass && "assistente " + c.ass].filter(Boolean).join(" · "))}</p></div>
        <label class="dsel">Giorno <input type="date" value="${R.data}" max="${oggi()}" data-r="data"></label></div>
        ${R.salvato ? `<p class="note" style="margin:10px 0 0">Registro di ${fdata(R.data)} già salvato: puoi correggerlo.</p>` : ""}
        <div class="plist" ${R.carico ? "" : 'aria-busy="true"'}>${R.carico ? (c.allievi || []).map(rigaAllievo).join("") + R.extra.map(rigaExtra).join("") : `<p class="note">Caricamento…</p>`}</div>
        ${R.carico ? `<div class="actions" style="margin-top:10px"><button type="button" class="btn ghost small" data-r="riga">+ Altra riga</button><button type="button" class="btn ghost small" data-r="tutti">Tutti presenti</button></div>` : ""}
      </div>
      ${R.carico ? `<div class="savebar"><span><b>${pres}</b> present${pres === 1 ? "e" : "i"}</span><button type="button" class="btn" data-r="salva">Salva presenze</button></div>` : ""}
    </div>`;
  }

  async function caricaRiep() {
    R.riep = null; render();
    try { const j = await sess({ tipo: "staff_riepilogo", mese: R.mese }); if (!j.ok) throw new Error(j.errore); R.riep = j.righe; }
    catch (x) { R.riep = []; if (x.message !== "sessione") toast("Riepilogo non caricato"); }
    render();
  }
  function vRiep() {
    const sel = `<label class="dsel">Mese <select data-r="mese">${stagioneMesi().map(m => `<option value="${m}"${m === R.mese ? " selected" : ""}>${meseNome(m)}</option>`).join("")}</select></label>`;
    if (!R.riep) return `<div class="card"><div class="top2"><h2 style="margin:0">Riepilogo</h2>${sel}</div><p class="note">Caricamento…</p></div>`;
    const admin = S.D.staff.ruolo === "admin", rows = R.riep, cards = [], perIns = {};
    corsi().forEach(c => {
      const mine = rows.filter(r => r.corso === c.id), lez = [...new Set(mine.filter(r => r.stato === "L").map(r => r.data))].sort();
      if (!lez.length && !mine.length) return;
      lez.forEach(d => { [c.ins, c.ass].filter(Boolean).forEach(n => { perIns[n] = perIns[n] || { n: 0, corsi: {} }; perIns[n].n++; perIns[n].corsi[c.nome] = (perIns[n].corsi[c.nome] || 0) + 1; }); });
      const al = {};
      mine.filter(r => r.stato !== "L").forEach(r => { const k = r.nominativo; al[k] = al[k] || { P: 0, A: 0, G: 0, socio: r.socio }; al[k][r.stato] = (al[k][r.stato] || 0) + 1; });
      const lst = Object.keys(al).sort((a, b) => a.localeCompare(b));
      cards.push(`<div class="card"><h2>${esc(c.nome)}</h2><p class="note" style="margin:-6px 0 10px">Lezioni tenute: <b>${lez.length}</b>${lez.length ? " · " + lez.map(d => +d.slice(8)).join(", ") : ""}</p>
        <div class="tw"><table class="ptab"><thead><tr><th>Allievo</th><th>Presenze</th><th>Assenze</th><th>Giustif.</th></tr></thead><tbody>
        ${lst.map(k => `<tr><td>${esc(k)}${al[k].socio ? "" : ' <span class="pill n">extra</span>'}</td><td class="num">${al[k].P}</td><td class="num">${al[k].A}</td><td class="num">${al[k].G}</td></tr>`).join("") || `<tr><td colspan="4" class="note">Nessuna presenza segnata</td></tr>`}
        </tbody></table></div></div>`);
    });
    const ins = Object.keys(perIns).sort();
    return `<div class="stack"><div class="card"><div class="top2"><h2 style="margin:0">Riepilogo di ${meseNome(R.mese)}</h2>${sel}</div>
      ${ins.length ? `<div class="tw" style="margin-top:12px"><table class="ptab"><thead><tr><th>Docente</th><th>Lezioni</th><th>Dettaglio</th></tr></thead><tbody>
        ${ins.map(n => `<tr><td>${esc(n)}</td><td class="num">${perIns[n].n}</td><td class="note">${Object.entries(perIns[n].corsi).map(([k, v]) => esc(k) + " " + v).join(" · ")}</td></tr>`).join("")}</tbody></table></div>`
        : `<p class="note">Nessuna lezione registrata in questo mese.</p>`}</div>${cards.join("")}</div>`;
  }

  function renderStaff() {
    const nome = S.D.nome || "", first = String(nome).split(" ")[0];
    const tabs = [["reg", "Registro"], ["riep", "Riepilogo"]];
    main.innerHTML = `<div class="ar"><div class="top2"><div><div class="kick">${S.D.staff.ruolo === "admin" ? "Segreteria" : "Area istruttori"} · stagione ${esc(S.D.stagione)}</div><h1>Ciao ${esc(first)}</h1></div>
      <div class="actions">${S.D.soci.length ? `<button class="btn ghost small" data-r="socio">Area socio</button>` : ""}<button class="btn ghost small" data-a="esci">Esci</button></div></div>
      <nav class="tabs" aria-label="Sezioni">${tabs.map(t => `<button class="tab" data-r="vista" data-id="${t[0]}" ${t[0] === R.vista ? 'aria-current="page"' : ""}>${t[1]}</button>`).join("")}</nav>
      ${R.vista === "riep" ? vRiep() : vReg()}</div>`;
    if (R.vista === "reg" && !R.carico && !R._loading) { R._loading = true; carica().finally(() => R._loading = false); }
    if (R.vista === "riep" && R.riep === null && !R._rl) { R._rl = true; caricaRiep().finally(() => R._rl = false); }
  }

  /* ---------------- area soci: presenze e avviso assenza ---------------- */
  async function caricaPres() {
    try { const j = await sess({ tipo: "area_presenze" }); if (!j.ok) throw new Error(j.errore); R.pres = j.righe; }
    catch (x) { R.pres = []; }
    render();
  }
  function sociCard(s) {
    if (!s || !(s.corsiReg || []).length) return "";
    if (R.pres === null && !R._pl) { R._pl = true; caricaPres().finally(() => R._pl = false); }
    const mie = (R.pres || []).filter(r => r.socio === s.id), per = {};
    mie.forEach(r => { const m = r.data.slice(0, 7); per[m] = per[m] || { P: 0, A: 0, G: 0 }; per[m][r.stato]++; });
    const mesi = stagioneMesi().filter(m => per[m]);
    const ultime = mie.slice().sort((a, b) => b.data.localeCompare(a.data)).slice(0, 6);
    const form = R.ass ? `<form class="assf" data-r="assform"><label>Corso<select name="corso"><option value="">Tutti i suoi corsi</option>${s.corsiReg.map(c => `<option value="${esc(c.id)}">${esc(c.nome)}</option>`).join("")}</select></label>
        <label>Giorno<input type="date" name="data" value="${oggi()}" min="${oggi()}" required></label>
        <label class="full">Nota per l'istruttore (facoltativa)<input type="text" name="nota" maxlength="200" placeholder="Es. febbre, impegno scolastico, arriva in ritardo"></label>
        <div class="actions full"><button class="btn small" type="submit">Invia l'avviso</button><button class="btn ghost small" type="button" data-r="assno">Annulla</button></div></form>` : "";
    return `<div class="card"><div class="top2"><h2 style="margin:0">Presenze</h2>${R.ass ? "" : `<button type="button" class="btn small" data-r="ass">Avvisa un'assenza</button>`}</div>${form}
      ${R.pres === null ? `<p class="note">Caricamento…</p>` : mesi.length ? `<div class="pm">${mesi.map(m => `<div class="mese ok"><span>${MESI_N[+m.slice(5) - 1].slice(0, 3)}</span><b>${per[m].P}</b><i>${per[m].A + per[m].G ? (per[m].A + per[m].G) + " ass." : "presenze"}</i></div>`).join("")}</div>
        <div style="margin-top:10px">${ultime.map(r => `<div class="row"><div class="t"><b>${fdata(r.data)}</b><span>${esc(r.corso)}</span></div><span class="pill ${r.stato === "P" ? "ok" : r.stato === "G" ? "warn" : "bad"}">${r.stato === "P" ? "presente" : r.stato === "G" ? "assenza avvisata" : "assente"}</span></div>`).join("")}</div>`
        : `<p class="note" style="margin:10px 0 0">Le presenze compariranno qui man mano che gli istruttori compilano il registro.</p>`}</div>`;
  }

  /* ---------------- eventi ---------------- */
  document.addEventListener("click", async e => {
    const b = e.target.closest("[data-r]"); if (!b || !S.D) return;
    const a = b.dataset.r;
    if (a === "set") { const k = b.dataset.k, cur = R.stato[k] || {}; R.stato[k] = { s: cur.s === b.dataset.v ? "" : b.dataset.v, nota: cur.nota || "" }; render(); }
    else if (a === "xset") { const x = R.extra[+b.dataset.i]; x.s = x.s === b.dataset.v ? "" : b.dataset.v; render(); }
    else if (a === "riga") { R.extra.push({ nome: "", s: "" }); render(); }
    else if (a === "tutti") { (corso().allievi || []).forEach(al => { const k = al.id || "n:" + al.nome; if (!R.stato[k] || !R.stato[k].s) R.stato[k] = { s: "P", nota: "" }; }); render(); }
    else if (a === "corso") { R.corso = b.dataset.id; R.carico = false; render(); }
    else if (a === "vista") { R.vista = b.dataset.id; if (R.vista === "riep") R.riep = null; render(); }
    else if (a === "socio") { R.socio = !R.socio; S.kid = (S.D.soci[0] || {}).id; render(); }
    else if (a === "ass") { R.ass = true; render(); }
    else if (a === "assno") { R.ass = false; render(); }
    else if (a === "salva") {
      const c = corso(), righe = [];
      (c.allievi || []).forEach(al => { const k = al.id || "n:" + al.nome, st = R.stato[k]; if (st && st.s) righe.push({ socio: al.id || "", nominativo: al.nome, stato: st.s, nota: st.nota || "" }); });
      R.extra.filter(x => x.nome && x.s).forEach(x => righe.push({ socio: "", nominativo: x.nome, stato: x.s, nota: x.nota || "" }));
      b.disabled = true; b.textContent = "Salvataggio…";
      try { const j = await sess({ tipo: "staff_salva", corso: c.id, data: R.data, righe }); if (!j.ok) throw new Error(j.errore); toast("Presenze salvate: " + j.presenti + " presenti"); R.salvato = true; }
      catch (x) { if (x.message !== "sessione") toast("Salvataggio non riuscito, riprova"); }
      b.disabled = false; b.textContent = "Salva presenze"; render();
    }
  });
  document.addEventListener("change", e => {
    const t = e.target; if (!t.dataset || !t.dataset.r || !S.D) return;
    if (t.dataset.r === "data" && t.value) { R.data = t.value; R.carico = false; render(); }
    else if (t.dataset.r === "mese") { R.mese = t.value; R.riep = null; render(); }
  });
  document.addEventListener("input", e => { const t = e.target; if (t.dataset && t.dataset.r === "nome") R.extra[+t.dataset.i].nome = t.value; });
  document.addEventListener("submit", async e => {
    const f = e.target; if (!f.dataset || f.dataset.r !== "assform") return; e.preventDefault();
    const s = kid(), fd = new FormData(f), btn = f.querySelector("[type=submit]"); btn.disabled = true; btn.textContent = "Invio…";
    try { const j = await sess({ tipo: "area_assenza", socioId: s.id, corso: fd.get("corso"), data: fd.get("data"), nota: fd.get("nota") });
      if (!j.ok) throw new Error(j.errore); toast("Avviso inviato all'istruttore"); R.ass = false; R.pres = null; }
    catch (x) { if (x.message !== "sessione") toast("Invio non riuscito, riprova"); }
    render();
  });

  window.Reg = { renderStaff, sociCard, attivo: () => !!(S.D && S.D.staff && !R.socio) };
})();
