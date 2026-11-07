/* DMA COMPANY · TinkerDance ASD — Area riservata dei soci.
   Nessuna password: link personale (?k=…) oppure email + codice di 6 cifre.
   I dati arrivano dallo script Google privato, solo quelli del socio collegato. */
(function(){
"use strict";
const CONFIG={ENDPOINT:"https://script.google.com/macros/s/AKfycbyVTh6uGSNhZMPpU_dw638gtyPE472kwAbnOBf0FsIEgERznmrI2ucqh62RYxGAuiNa/exec"};   // indirizzo dell'app web Google Apps Script (vuoto = area non ancora attiva)
const WA="https://wa.me/393383787702";
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const eur=n=>(Number(n)||0).toLocaleString("it-IT",{style:"currency",currency:"EUR"});
const fd=iso=>{if(!iso)return"";const [y,m,d]=String(iso).slice(0,10).split("-");return d+"/"+m+"/"+y};
const MESI={Set:"settembre",Ott:"ottobre",Nov:"novembre",Dic:"dicembre",Gen:"gennaio",Feb:"febbraio",Mar:"marzo",Apr:"aprile",Mag:"maggio",Giu:"giugno"};
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(e){}}};
function toast(t){const d=document.createElement("div");d.className="toast";d.setAttribute("role","status");d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),3200)}
async function api(o){const r=await fetch(CONFIG.ENDPOINT,{method:"POST",body:JSON.stringify(o)});return r.json()}

const main=document.querySelector("main"),loginHtml=main.innerHTML;
const S={t:store.get("ar.t"),D:null,kid:null,view:"home",email:""};

/* ---------- accesso ---------- */
function bindLogin(){
  const f=$("#f");if(!f)return;
  f.addEventListener("submit",async e=>{e.preventDefault();
    if(!CONFIG.ENDPOINT){$("#msg").classList.remove("hidden");return}
    const em=$("#em").value.trim();if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){$("#em").classList.add("err");$("#em").focus();return}
    $("#em").classList.remove("err");S.email=em;const b=f.querySelector("button");b.disabled=true;b.textContent="Invio in corso…";
    try{const j=await api({tipo:"area_codice",email:em});if(!j.ok)throw new Error(j.errore);codeStep()}
    catch(x){b.disabled=false;b.textContent="Ricevi il codice di accesso";showMsg(x.message==="troppi"?"Hai chiesto troppi codici: riprova tra un'ora o scrivici su WhatsApp.":"Invio non riuscito. Riprova tra poco.")}});
}
function showMsg(t,ok){const m=$("#msg");if(!m)return;m.classList.remove("hidden");m.classList.toggle("ok",!!ok);m.classList.toggle("warn",!ok);m.innerHTML=t}
function codeStep(){
  const card=main.querySelector("section.card");
  card.innerHTML=`<p style="margin:0">Se <b>${esc(S.email)}</b> è l'email di un socio, ti abbiamo appena inviato un codice di 6 cifre. Vale 10 minuti: controlla anche la posta indesiderata.</p>
  <label class="f" style="margin-top:14px">Codice di accesso<input type="text" id="cd" class="code" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="••••••"></label>
  <div class="msg" id="cdErr" role="alert" style="margin-top:8px"></div>
  <div class="nav" style="margin-top:10px"><button type="button" class="btn" id="cdGo" style="width:100%">Entra</button></div>
  <div class="nav" style="margin-top:10px"><button type="button" class="btn ghost small" id="cdBack">Cambia email</button><button type="button" class="btn ghost small" id="cdRe">Rimanda il codice</button></div>
  <p class="sub" style="margin:12px 0 0;font-size:13px">Non arriva? Usa l'email che hai indicato nell'iscrizione oppure scrivici su <a href="${WA}" target="_blank" rel="noopener" style="white-space:nowrap;font-weight:700">WhatsApp</a>.</p>
  <div class="box hidden" id="msg" style="margin-top:14px" role="status"></div>`;
  const go=async()=>{const v=$("#cd").value.replace(/\D/g,"");if(v.length!==6){$("#cdErr").textContent="Il codice ha 6 cifre.";return}
    const b=$("#cdGo");b.disabled=true;b.textContent="Verifica…";
    try{const j=await api({tipo:"area_verifica",email:S.email,codice:v});if(!j.ok)throw new Error(j.errore);entra(j)}
    catch(x){b.disabled=false;b.textContent="Entra";$("#cdErr").textContent=x.message==="troppi"?"Troppi tentativi: chiedi un nuovo codice.":"Codice non corretto o scaduto."}};
  $("#cdGo").onclick=go;$("#cd").addEventListener("keydown",e=>{if(e.key==="Enter")go()});$("#cd").focus();
  $("#cdBack").onclick=()=>{main.innerHTML=loginHtml;bindLogin();$("#em").value=S.email};
  $("#cdRe").onclick=async()=>{try{const j=await api({tipo:"area_codice",email:S.email});toast(j.ok?"Nuovo codice inviato":"Troppi codici richiesti: riprova più tardi")}catch(x){toast("Invio non riuscito")}};
}
function entra(j,k){S.t=j.t;store.set("ar.t",j.t);if(j.r||k)store.set("ar.r",j.r||k);tieniLink();S.D=j.dati;S.kid=(j.dati.soci[0]||{}).id;S.view="home";render();window.scrollTo(0,0)}
/* il link personale resta nell'indirizzo: chi aggiunge la pagina alla schermata Home (anche su iPhone) apre l'app già collegato */
function tieniLink(){const r=store.get("ar.r");try{if(r&&new URLSearchParams(location.search).get("k")!==r)history.replaceState(null,"",location.pathname+"?k="+encodeURIComponent(r))}catch(x){}}
function esci(){store.set("ar.t",null);store.set("ar.r",null);S.t=null;try{history.replaceState(null,"",location.pathname)}catch(x){}S.D=null;main.innerHTML=loginHtml;bindLogin();window.scrollTo(0,0)}
async function avvio(){
  bindLogin();if(!CONFIG.ENDPOINT)return;
  const qs=new URLSearchParams(location.search),k=qs.get("k");
  if(qs.get("pagato"))setTimeout(()=>toast("Pagamento ricevuto, grazie! La ricevuta sarà disponibile entro 5 giorni"),900);else if(qs.get("annullato"))setTimeout(()=>toast("Pagamento non completato: nessun addebito"),900);
  if(qs.get("pagato")||qs.get("annullato"))try{history.replaceState(null,"",location.pathname+(k?"?k="+encodeURIComponent(k):""))}catch(x){}
  if(k){main.classList.add("wait");
    try{const j=await api({tipo:"area_link",k});if(!j.ok)throw new Error(j.errore);main.classList.remove("wait");entra(j,k);return}
    catch(x){main.classList.remove("wait");try{history.replaceState(null,"",location.pathname)}catch(y){}showMsg("<b>Questo link non è attivo.</b> Potrebbe essere stato sostituito da uno nuovo. Entra con la tua email qui sopra oppure chiedi un nuovo link su <a href='"+WA+"' style='white-space:nowrap;font-weight:700'>WhatsApp</a>.");return}}
  if(S.t){main.classList.add("wait");try{const j=await api({tipo:"area_dati",t:S.t});main.classList.remove("wait");if(!j.ok)throw 0;S.D=j.dati;S.kid=(j.dati.soci[0]||{}).id;render();return}catch(x){main.classList.remove("wait");store.set("ar.t",null);S.t=null}}
  if(store.get("ar.r")){main.classList.add("wait");const ok=await riprendi();main.classList.remove("wait");if(ok){S.kid=(S.D.soci[0]||{}).id;render()}}
}
/* accesso ricordato su questo dispositivo: nuova sessione senza rifare il login */
async function riprendi(){const r=store.get("ar.r");if(!r)return false;try{const j=await api({tipo:"area_link",k:r});if(!j.ok)throw 0;S.t=j.t;store.set("ar.t",j.t);S.D=j.dati;return true}catch(x){if(x===0)store.set("ar.r",null);return false}}
async function sess(o){let j=await api(Object.assign({t:S.t},o));if(!j.ok&&j.errore==="sessione"&&await riprendi())j=await api(Object.assign({t:S.t},o));if(!j.ok&&j.errore==="sessione"){toast("Sessione scaduta: entra di nuovo");esci();throw new Error("sessione")}return j}

/* ---------- viste ---------- */
const kid=()=>S.D.soci.find(s=>s.id===S.kid)||S.D.soci[0];
const ini=n=>String(n||"").split(" ").filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase();
const ava=(s,big)=>`<span class="av${big?" big":""}">${s.foto?`<img src="data:image/jpeg;base64,${s.foto}" alt="">`:esc(ini(s.nome))}</span>`;
const nomeP=s=>s.nomeProprio||String(s.nome||"").split(" ").slice(1).join(" ")||s.nome;
const dovuti=s=>(s.mesi||[]).filter(m=>m.s==="due");
function kidsBar(){const k=kid(),t=S.pdf&&S.pdf["T"+k.id];
  const tess=`<span class="tessbox">${t?`<a class="btn ghost small" href="${t.url}" target="_blank" rel="noopener">Apri la tessera</a>${t.share?`<button class="btn ghost small" data-a="pdfShare" data-id="T${esc(k.id)}">Condividi</button>`:`<button class="btn ghost small" data-a="pdfSave" data-id="T${esc(k.id)}">Scarica</button>`}`:`<button class="tess" data-a="tessera" title="Tessera ACSI di ${esc(nomeP(k))}"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><circle cx="8.5" cy="11" r="2.2"/><path d="M5.5 16.2c.7-1.6 1.8-2.4 3-2.4s2.3.8 3 2.4M14 10h4.5M14 13.5h3"/></svg>La mia tessera ACSI</button>`}</span>`;
  return `<div class="kids" role="group" aria-label="Allievo">${S.D.soci.length>1?S.D.soci.map(s=>`<button class="kid" data-a="kid" data-id="${esc(s.id)}" aria-pressed="${s.id===k.id}">${ava(s)}${esc(nomeP(s))}</button>`).join(""):""}${tess}</div>`}
function mesiGrid(s){return `<div class="mesi">${(s.mesi||[]).map(m=>`<div class="mese ${m.s==="ok"?"ok":m.s==="due"?"due":""}">${esc(m.m)}<i>${m.s==="ok"?"pagato":m.s==="due"?"da pagare":m.s==="n"?"—":"in arrivo"}</i></div>`).join("")}</div>`}
function certTxt(c){return c.stato==="ok"?`<span class="pill ok">valido</span>`:c.stato==="warn"?`<span class="pill warn">in scadenza</span>`:`<span class="pill bad">${c.scad?"scaduto":"mancante"}</span>`}
function vHome(){const s=kid(),av=[],dv=dovuti(s);
  if(s.daPagare>0)av.push(`<div class="alert"><b>Da pagare: ${eur(s.daPagare)}</b>${dv.length?"Quota di "+dv.map(m=>MESI[m.m]).join(", ")+(s.tess.dovuta>s.tess.pagata?" e quota associativa":"")+". ":""}<a href="#" data-a="go" data-id="pag">Paga o carica la ricevuta</a></div>`);
  if(s.cert.stato!=="ok")av.push(`<div class="alert"><b>${s.cert.scad?(s.cert.stato==="warn"?"Il certificato medico scade il ":"Il certificato medico è scaduto il ")+fd(s.cert.scad):"Certificato medico mancante"}</b>Caricalo per continuare a frequentare. <a href="#" data-a="go" data-id="doc">Carica il certificato</a></div>`);
  if(!av.length)av.push(`<div class="alert ok"><b>Tutto in regola</b>Pagamenti e certificato medico sono a posto.</div>`);
  return `<div class="stack">${av.join("")}<div class="grid2">
   <div class="card"><h2>Iscrizione di ${esc(nomeP(s))}</h2><dl><dt>Stato</dt><dd><span class="pill ok">socio · stagione ${esc(S.D.stagione)}</span></dd>${s.tessera?`<dt>Tessera ACSI</dt><dd>${esc(s.tessera)}</dd>`:""}<dt>Certificato</dt><dd>${certTxt(s.cert)}${s.cert.scad?" "+fd(s.cert.scad):""}</dd></dl></div>
   <div class="card"><h2>Corsi</h2>${(s.corsi||[]).length?s.corsi.map(c=>`<div class="row"><div class="t"><b>${esc(c.area)}</b><span>${esc(c.corso)}</span></div></div>`).join(""):`<p class="note" style="margin:0">${s.esente?"Staff: nessuna quota dovuta.":"Nessun corso registrato."}</p>`}</div></div>
   ${window.Reg?Reg.sociCard(s):""}
   ${(s.mesi||[]).some(m=>m.v)?`<div class="card"><h2>Quote della stagione</h2>${mesiGrid(s)}</div>`:""}</div>`}
function vPag(){const s=kid(),caus="Quota "+(dovuti(s).map(m=>MESI[m.m]).join(" ")||"")+" "+s.nome;
  return `<div class="stack">
  ${s.daPagare>0?`<div class="card"><h2>Da pagare</h2><div class="row"><div class="t"><b>${dovuti(s).length?"Quota di "+esc(dovuti(s).map(m=>MESI[m.m]).join(", ")):"Quota"}${s.tess.dovuta>s.tess.pagata?" e quota associativa":""}</b><span>importo aggiornato al ${esc(fd(String(S.D.agg).slice(0,10)))}</span></div><span class="num">${eur(s.daPagare)}</span></div>
   ${S.D.carta?`<div class="actions" style="margin-top:12px"><button class="btn" data-a="paga">Paga con carta · ${eur(s.daPagare)}</button></div><p class="note" style="margin:8px 0 0">Pagamento sicuro con carta di credito o debito, Apple Pay o Google Pay. È tracciabile: vale per la detrazione.</p><details class="bonif" style="margin-top:12px"><summary>Preferisci il bonifico?</summary>`:""}<div class="box" style="margin-top:10px"><dl><dt>Intestato a</dt><dd>${esc(S.D.intestatario)}</dd><dt>IBAN</dt><dd class="mono">${esc(String(S.D.iban).replace(/(.{4})/g,"$1 ").trim())}</dd><dt>Causale</dt><dd>${esc(caus.replace(/\s+/g," "))}</dd></dl>
   <div class="actions" style="margin-top:12px"><button class="btn ghost small" data-a="copy" data-t="${esc(String(S.D.iban).replace(/\s/g,""))}">Copia IBAN</button><button class="btn ghost small" data-a="copy" data-t="${esc(caus.replace(/\s+/g," "))}">Copia causale</button></div></div>${S.D.carta?"</details>":""}
   <p class="note" style="margin:10px 0 0">Puoi pagare anche in contanti in segreteria.</p></div>`:`<div class="alert ok"><b>Nessuna quota da pagare</b>${s.credito>0?"Hai già versato "+eur(s.credito)+" per i prossimi mesi.":"Sei in regola con i pagamenti."}</div>`}
  <div class="card"><h2>Hai fatto un bonifico?</h2><p class="note" style="margin:0 0 10px">Carica la ricevuta, anche uno screenshot dell'app della banca. La segreteria verifica l'accredito e la ricevuta dell'associazione compare qui entro 5 giorni.</p>
   <div class="drop"><input type="file" id="fRic" accept="image/*,application/pdf"><input type="text" id="fImp" inputmode="decimal" placeholder="Importo versato (€)"><input type="text" id="fNota" placeholder="Per quale mese (facoltativo)">
   <div class="actions" style="justify-content:center;margin-top:12px"><button class="btn small" data-a="sendRic">Invia la ricevuta</button></div></div></div>
  ${(s.mesi||[]).some(m=>m.v)?`<div class="card"><h2>Stagione ${esc(S.D.stagione)}</h2>${mesiGrid(s)}</div>`:""}
  <div class="card"><h2>Ricevute dell'associazione</h2>${(s.ricevute||[]).length?s.ricevute.map(r=>`<div class="row"><div class="t"><b>Ricevuta n. ${esc(r.n)} · ${esc(fd(r.data))}</b><span>${esc(r.descr)}</span>${r.detraibile?'<div><span class="pill n" style="margin-top:4px">detraibile 19%</span></div>':""}</div><div class="actions" style="align-items:center;justify-content:flex-end"><span class="num">${eur(r.importo)}</span>${r.file?`<button class="btn ghost small" data-a="pdf" data-id="${esc(r.n)}">PDF</button>`:'<span class="pill n">in preparazione</span>'}</div></div>`).join(""):`<p class="note" style="margin:0">Nessuna ricevuta per questa stagione.</p>`}
   <p class="note" style="margin:10px 0 0">Le ricevute pagate con mezzi tracciabili valgono per la detrazione delle spese sportive dei figli dai 5 ai 18 anni.</p></div>
  </div>`}
function vDoc(){const s=kid(),c=s.cert;
  return `<div class="stack">${vDomanda(s)}<div class="card"><h2>Certificato medico</h2><div class="row"><div class="t"><b>${esc(c.tipo)}</b><span>${c.scad?"Scadenza "+fd(c.scad):"Non ancora registrato"}</span></div>${certTxt(c)}</div>
   <div class="drop" style="margin-top:10px"><div class="note">${c.stato==="ok"?"Quando lo rinnovi, carica qui quello nuovo: foto o PDF.":"Carica il nuovo certificato: foto o PDF."}</div><input type="file" id="fCert" accept="image/*,application/pdf" style="margin-top:10px"><label class="note" style="display:block;margin-top:8px">Data di scadenza<input type="date" id="fScad"></label>
   <div class="actions" style="justify-content:center;margin-top:12px"><button class="btn small" data-a="sendCert">Invia il certificato</button></div></div></div>
  <div class="card"><h2>Altri documenti</h2><p class="note" style="margin:0">Tessera ACSI: la trovi in Panoramica. Statuto e altri documenti: chiedili in segreteria o su <a href="${WA}" target="_blank" rel="noopener">WhatsApp</a>. L'informativa privacy è <a href="/privacy/" target="_blank" rel="noopener">qui</a>.</p></div></div>`}
function stagLunga(){const m=String(S.D.stagione||"").match(/(\d{4})\D+(\d{2,4})/);return m?m[1]+"/"+(m[2].length===2?m[1].slice(0,2)+m[2]:m[2]):String(S.D.stagione||"")}
function vDomanda(s){const tit="Domanda di ammissione "+stagLunga(),d=s.domanda||{},f=S.pdf&&S.pdf["D"+s.id];
  if(d.firmata)return `<div class="card"><h2>${esc(tit)}</h2><div class="row"><div class="t"><b>Firmata il ${esc(d.data||"")}</b><span>da ${esc(d.da||"")}</span></div><span class="pill ok">firmata</span></div>
   <div class="actions" style="margin-top:10px">${f?`<a class="btn ghost small" href="${f.url}" target="_blank" rel="noopener">Apri</a>${f.share?`<button class="btn ghost small" data-a="pdfShare" data-id="D${esc(s.id)}">Condividi</button>`:`<button class="btn ghost small" data-a="pdfSave" data-id="D${esc(s.id)}">Scarica</button>`}`:`<button class="btn ghost small" data-a="domPdf">Apri il PDF</button>`}</div></div>`;
  const min=!!s.minore,chi=min?(s.genitore||""):s.nome,corsi=(s.corsiReg||[]).map(c=>c.nome).concat((s.corsiReg||[]).length?[]:(s.corsi||[]).map(c=>c.corso)).filter(Boolean);
  return `<div class="card" id="domCard"><h2>${esc(tit)}</h2><p class="note" style="margin:0 0 10px">Controlla i dati, metti le spunte e firma con il dito. Ricevi subito il PDF firmato anche per email.</p>
   <dl><dt>Allievo</dt><dd>${esc(s.nome)}</dd>${s.cf?`<dt>Codice fiscale</dt><dd class="mono">${esc(s.cf)}</dd>`:""}${s.nascita?`<dt>Nato/a</dt><dd>${esc(fd(s.nascita))}${s.luogo?" a "+esc(s.luogo):""}</dd>`:""}${s.residenza?`<dt>Residenza</dt><dd>${esc(s.residenza)}</dd>`:""}${min&&s.genitore?`<dt>Genitore</dt><dd>${esc(s.genitore)}</dd>`:""}${corsi.length?`<dt>Corsi</dt><dd>${esc(corsi.join(", "))}</dd>`:""}</dl>
   <p class="note" style="margin:8px 0 0">Dati da correggere? Scrivilo in “I miei dati” › Chiedi una modifica, poi firma.</p>
   <label class="switch"><div><b>Ho letto l'informativa privacy</b><div class="note">Obbligatorio. <a href="/privacy/" target="_blank" rel="noopener">Leggi l'informativa</a></div></div><input type="checkbox" id="dPriv"></label>
   <label class="switch"><div><b>Gruppo WhatsApp del corso</b><div class="note">Per avvisi e comunicazioni.</div></div><input type="checkbox" id="dWa" checked></label>
   <label class="switch"><div><b>Consenso a foto e video</b><div class="note">Uso su sito e social, senza nomi.</div></div><input type="checkbox" id="dImg" ${s.immagini?"checked":""}></label>
   <label class="note" style="display:block;margin-top:12px">Nome e cognome di chi firma${min?" (genitore)":""}<input id="dNome" value="${esc(chi)}" autocomplete="name"></label>
   <div class="note" style="margin:12px 0 6px">Firma qui con il dito</div>
   <div class="sigbox"><canvas id="asig"></canvas><div class="sigph" id="asigph">Firma qui</div></div>
   <div class="actions" style="justify-content:space-between;margin-top:10px"><button class="btn ghost small" data-a="sigClr">Cancella firma</button><button class="btn small" data-a="firma">Firma e invia</button></div></div>`}
let SIGA=null;
function initSig(){const c=document.getElementById("asig");if(!c){SIGA=null;return}const ph=document.getElementById("asigph"),box=c.parentNode,o={ok:false};let ctx,draw=false,last=null;
  const r=c.getBoundingClientRect(),dp=window.devicePixelRatio||1;c.width=r.width*dp;c.height=r.height*dp;ctx=c.getContext("2d");ctx.scale(dp,dp);ctx.lineWidth=2.4;ctx.lineCap="round";ctx.lineJoin="round";ctx.strokeStyle="#111";
  const pos=e=>{const q=c.getBoundingClientRect();return[e.clientX-q.left,e.clientY-q.top]};
  c.addEventListener("pointerdown",e=>{draw=true;last=pos(e);c.setPointerCapture(e.pointerId);e.preventDefault()});
  c.addEventListener("pointermove",e=>{if(!draw)return;const p=pos(e);ctx.beginPath();ctx.moveTo(last[0],last[1]);ctx.lineTo(p[0],p[1]);ctx.stroke();last=p;if(!o.ok){o.ok=true;ph.style.display="none";box.classList.remove("err")}e.preventDefault()});
  ["pointerup","pointercancel","pointerleave"].forEach(t=>c.addEventListener(t,()=>{draw=false}));
  o.clr=()=>{ctx.clearRect(0,0,c.width,c.height);o.ok=false;ph.style.display=""};
  o.png=()=>{const w=600,h=Math.round(600*c.height/c.width),t=document.createElement("canvas");t.width=w;t.height=h;const x=t.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,w,h);x.drawImage(c,0,0,w,h);return t.toDataURL("image/png").split(",")[1]};
  SIGA=o}
function pdfBlob(b64,nome,key){const bin=atob(b64),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);const blob=new Blob([u],{type:"application/pdf"});
  let share=false;try{share=!!(navigator.canShare&&navigator.canShare({files:[new File([blob],nome,{type:"application/pdf"})]}))}catch(x){}
  S.pdf=S.pdf||{};S.pdf[key]={blob,nome,url:URL.createObjectURL(blob),share}}
function vMe(){const t=S.D.titolare||{nome:S.D.nome};
  return `<div class="stack">${[kid()].map(s=>`<div class="card"><div class="fotobox">${ava(s,1)}<div><h2 style="margin:0 0 8px">${esc(s.nome)}</h2><div class="actions"><label class="btn small" for="fFoto">${s.foto?"Cambia la foto":"Metti una foto"}</label>${s.foto?`<button class="btn ghost small" data-a="fotoDel">Togli</button>`:""}</div><input type="file" id="fFoto" accept="image/*" hidden></div></div>
    
    <dl style="margin-top:14px">${s.cf?`<dt>Codice fiscale</dt><dd class="mono">${esc(s.cf)}</dd>`:""}${s.nascita?`<dt>Nato/a</dt><dd>${esc(fd(s.nascita))}${s.luogo?" a "+esc(s.luogo):""}</dd>`:""}${s.genitore?`<dt>Genitore</dt><dd>${esc(s.genitore)}</dd>`:""}${s.residenza?`<dt>Residenza</dt><dd>${esc(s.residenza)}</dd>`:""}${s.tel?`<dt>Cellulare</dt><dd>${esc(s.tel)}</dd>`:""}${s.email?`<dt>Email</dt><dd>${esc(s.email)}</dd>`:""}</dl>
    <div class="switch" style="margin-top:12px"><div><b>Consenso a foto e video</b><div class="note">Uso su sito e social di DMA COMPANY e TinkerDance, senza nomi. Puoi cambiarlo quando vuoi.</div></div><input type="checkbox" role="switch" data-a="cons" data-id="${esc(s.id)}" ${s.immagini?"checked":""} aria-label="Consenso foto e video di ${esc(s.nome)}"></div></div>`).join("")}
   <div class="card"><h2>Chiedi una modifica</h2><p class="note" style="margin:0 0 8px">Dati da correggere o aggiornare? Scrivi qui e la segreteria li sistema.</p><textarea id="fReq" placeholder="Es. nuovo indirizzo, nuovo cellulare…"></textarea><div class="actions" style="margin-top:10px"><button class="btn small" data-a="sendReq">Invia la richiesta</button></div></div>
   <div class="actions"><button class="btn ghost" data-a="esci">Esci</button></div></div>`}
const TABS=[["home","Panoramica",vHome],["pag","Pagamenti",vPag],["doc","Documenti",vDoc],["me","I miei dati",vMe]];
function render(){if(!S.D)return;if(window.Reg&&Reg.attivo()){Reg.renderStaff();return}const tit=(S.D.titolare&&S.D.titolare.nome)||S.D.nome||"",first=(S.D.titolare&&S.D.titolare.saluto)||String(tit).split(" ").slice(1).join(" ")||tit;
  if(!S.D.soci.length){main.innerHTML=`<div class="ar"><h1>Ciao ${esc(first)}</h1><div class="alert" style="margin-top:16px"><b>Nessun iscritto collegato</b>Scrivici su WhatsApp per completare l'attivazione.</div><div class="actions" style="margin-top:16px"><button class="btn ghost" data-a="esci">Esci</button></div></div>`;return}
  const v=TABS.find(t=>t[0]===S.view)||TABS[0];
  main.innerHTML=`<div class="ar"><div class="top2"><div><div class="kick">Area riservata · stagione ${esc(S.D.stagione)}</div><h1>Ciao ${esc(first)}</h1></div><div class="actions">${S.D.staff?`<button class="btn ghost small" data-r="socio">Registro</button>`:""}<button class="btn ghost small" data-a="esci">Esci</button></div></div>
  ${kidsBar()}<nav class="tabs" aria-label="Sezioni">${TABS.map(t=>`<button class="tab" data-a="go" data-id="${t[0]}" ${t[0]===v[0]?'aria-current="page"':""}>${t[1]}</button>`).join("")}</nav>${v[2]()}
  <p class="note" style="margin-top:20px;text-align:center">Dati aggiornati al ${esc(fd(String(S.D.agg).slice(0,10)))}. Per qualsiasi dubbio scrivici su <a href="${WA}" target="_blank" rel="noopener">WhatsApp 338 378 7702</a>.</p></div>`;initSig()}

/* ---------- file e invii ---------- */
function leggiFile(inp){return new Promise((ok,ko)=>{const f=inp&&inp.files&&inp.files[0];if(!f)return ok(null);if(f.size>8*1024*1024)return ko(new Error("grande"));
  const r=new FileReader();r.onload=()=>ok({name:f.name,type:f.type||"application/pdf",data:String(r.result).split(",")[1]});r.onerror=ko;r.readAsDataURL(f)})}
async function invio(b,fn,okMsg){b.disabled=true;const t=b.textContent;b.textContent="Invio…";try{await fn();toast(okMsg);render()}catch(x){if(x.message!=="sessione")toast(x.message==="grande"?"File troppo grande (massimo 8 MB)":x.message==="nofile"?"Scegli prima il file":"Invio non riuscito, riprova")}finally{b.disabled=false;b.textContent=t}}
document.addEventListener("click",async e=>{const b=e.target.closest("[data-a]");if(!b||!S.D&&b.dataset.a!=="esci")return;const a=b.dataset.a;if(b.tagName==="A")e.preventDefault();
  switch(a){
    case"go":S.view=b.dataset.id;render();window.scrollTo(0,0);break;
    case"kid":S.kid=b.dataset.id;render();break;
    case"esci":esci();break;
    case"paga":{const s=kid();b.disabled=true;b.textContent="Apertura del pagamento…";try{const j=await sess({tipo:"area_paga",socioId:s.id});if(!j.ok)throw new Error(j.errore);location.href=j.url;return}catch(x){if(x.message!=="sessione")toast(x.message==="nulla"?"Non risultano quote da pagare":"Pagamento con carta non disponibile ora: riprova o usa il bonifico")}b.disabled=false;b.textContent="Paga con carta";break}
    case"fotoDel":{const s=kid();try{const j=await sess({tipo:"area_foto",socioId:s.id,azione:"togli"});if(!j.ok)throw 0;s.foto="";s.fotoReg=false;render();toast("Foto tolta")}catch(x){toast("Non riuscito, riprova")}break}
    case"copy":try{await navigator.clipboard.writeText(b.dataset.t);toast("Copiato")}catch(x){toast(b.dataset.t)}break;
    case"pdf":{b.disabled=true;b.textContent="…";try{const j=await sess({tipo:"area_pdf",num:b.dataset.id});if(!j.ok)throw new Error(j.errore);
      const bin=atob(j.data),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
      const blob=new Blob([u],{type:"application/pdf"});S.pdf=S.pdf||{};S.pdf[b.dataset.id]={blob,nome:j.nome,url:URL.createObjectURL(blob)};
      let share=false;try{share=!!(navigator.canShare&&navigator.canShare({files:[new File([blob],j.nome,{type:"application/pdf"})]}))}catch(x){}
      const box=b.parentNode;b.remove();box.insertAdjacentHTML("beforeend",`<a class="btn ghost small" href="${S.pdf[b.dataset.id].url}" target="_blank" rel="noopener">Apri</a>${share?`<button class="btn ghost small" data-a="pdfShare" data-id="${esc(b.dataset.id)}">Condividi</button>`:`<button class="btn ghost small" data-a="pdfSave" data-id="${esc(b.dataset.id)}">Scarica</button>`}`)}
      catch(x){b.disabled=false;b.textContent="PDF";if(x.message!=="sessione")toast(x.message==="non_ancora"?"La ricevuta sarà disponibile a breve":"Ricevuta non disponibile, riprova")}break}
    case"tessera":{const k=kid();b.disabled=true;const old=b.innerHTML;b.textContent="Un momento…";try{const j=await sess({tipo:"area_tessera",socioId:k.id});if(!j.ok)throw new Error(j.errore);
      const bin=atob(j.data),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);const blob=new Blob([u],{type:"application/pdf"});
      let share=false;try{share=!!(navigator.canShare&&navigator.canShare({files:[new File([blob],j.nome,{type:"application/pdf"})]}))}catch(x){}
      S.pdf=S.pdf||{};S.pdf["T"+k.id]={blob,nome:j.nome,url:URL.createObjectURL(blob),share};render()}
      catch(x){b.disabled=false;b.innerHTML=old;if(x.message!=="sessione")toast(x.message==="non_ancora"?"La tessera di "+nomeP(k)+" non è ancora disponibile: la carichiamo appena arriva da ACSI":"Tessera non disponibile, riprova")}break}
    case"pdfShare":{const f=S.pdf&&S.pdf[b.dataset.id];if(!f)break;try{await navigator.share({files:[new File([f.blob],f.nome,{type:"application/pdf"})],title:f.nome})}catch(x){}break}
    case"pdfSave":{const f=S.pdf&&S.pdf[b.dataset.id];if(!f)break;const l=document.createElement("a");l.href=f.url;l.download=f.nome;document.body.appendChild(l);l.click();l.remove();break}
    case"sigClr":if(SIGA)SIGA.clr();break;
    case"firma":{const s=kid(),nome=$("#dNome").value.trim();
      if(!$("#dPriv").checked){toast("Spunta la presa visione dell'informativa privacy");break}
      if(nome.length<4){toast("Scrivi nome e cognome di chi firma");$("#dNome").focus();break}
      if(!SIGA||!SIGA.ok){document.querySelector("#domCard .sigbox").classList.add("err");toast("Firma nel riquadro con il dito");break}
      b.disabled=true;b.textContent="Invio…";
      try{const j=await sess({tipo:"area_firma",socioId:s.id,privacy:true,whatsapp:$("#dWa").checked,immagini:$("#dImg").checked,firma:nome,firmaImg:SIGA.png()});if(!j.ok)throw new Error(j.errore);
        s.domanda={firmata:true,data:j.data,da:nome};pdfBlob(j.pdf,j.nome,"D"+s.id);render();toast("Domanda firmata e inviata: grazie!")}
      catch(x){b.disabled=false;b.textContent="Firma e invia";if(x.message!=="sessione")toast(x.message==="firma"?"Firma non valida: rifalla più grande":"Invio non riuscito, riprova")}break}
    case"domPdf":{const s=kid();b.disabled=true;b.textContent="Un momento…";try{const j=await sess({tipo:"area_domanda",socioId:s.id});if(!j.ok)throw new Error(j.errore);pdfBlob(j.data,j.nome,"D"+s.id);render()}
      catch(x){b.disabled=false;b.textContent="Apri il PDF";if(x.message!=="sessione")toast("PDF non disponibile, riprova")}break}
    case"sendRic":invio(b,async()=>{const f=await leggiFile($("#fRic"));if(!f)throw new Error("nofile");const j=await sess({tipo:"area_file",genere:"contabile",socioId:kid().id,file:f,importo:$("#fImp").value,descr:$("#fNota").value});if(!j.ok)throw new Error(j.errore)},"Ricevuta inviata: la segreteria verifica l'accredito");break;
    case"sendCert":invio(b,async()=>{const f=await leggiFile($("#fCert"));if(!f)throw new Error("nofile");const j=await sess({tipo:"area_file",genere:"certificato",socioId:kid().id,file:f,scadenza:$("#fScad").value,descr:"Certificato medico"});if(!j.ok)throw new Error(j.errore)},"Certificato inviato alla segreteria");break;
    case"sendReq":{const t=$("#fReq").value.trim();if(!t){toast("Scrivi cosa modificare");break}invio(b,async()=>{const j=await sess({tipo:"area_richiesta",testo:t});if(!j.ok)throw new Error(j.errore)},"Richiesta inviata alla segreteria");break}
  }});
function fotoRidotta(file){return new Promise((ok,ko)=>{const u=URL.createObjectURL(file),im=new Image();im.onload=()=>{const n=320,c=document.createElement("canvas");c.width=c.height=n;const x=c.getContext("2d"),m=Math.min(im.width,im.height);x.drawImage(im,(im.width-m)/2,(im.height-m)/2,m,m,0,0,n,n);URL.revokeObjectURL(u);ok(c.toDataURL("image/jpeg",.85).split(",")[1])};im.onerror=()=>ko(new Error("img"));im.src=u})}
document.addEventListener("change",async e=>{const t=e.target;if(!S.D)return;
  if(t.id==="fFoto"&&t.files&&t.files[0]){const s=kid();try{const b=await fotoRidotta(t.files[0]);toast("Caricamento della foto…");const j=await sess({tipo:"area_foto",socioId:s.id,azione:"carica",data:b});if(!j.ok)throw new Error(j.errore);s.foto=b;render();toast("Foto aggiornata: la vede anche l'istruttore nel registro")}catch(x){if(x.message!=="sessione")toast("Foto non caricata, prova con un'altra immagine")}return}
  if(t.dataset&&t.dataset.a==="fotoReg"){const s=kid();try{const j=await sess({tipo:"area_foto",socioId:s.id,azione:"registro",registro:t.checked});if(!j.ok)throw 0;s.fotoReg=t.checked;toast(t.checked?"La foto è di nuovo visibile all'istruttore":"Foto nascosta all'istruttore")}catch(x){t.checked=!t.checked;toast("Non riuscito, riprova")}return}
});
document.addEventListener("change",async e=>{const t=e.target;if(t.dataset&&t.dataset.a==="cons"&&S.D){const s=S.D.soci.find(x=>x.id===t.dataset.id);
  try{const j=await sess({tipo:"area_richiesta",genere:"immagini",socioId:s.id,valore:t.checked});if(!j.ok)throw 0;s.immagini=t.checked;toast(t.checked?"Consenso inviato: la segreteria lo registra":"Revoca inviata: la segreteria la registra")}catch(x){t.checked=!t.checked;toast("Invio non riuscito")}}});
window.AR={S,main,sess,esc,toast,render,kid};
avvio();
})();
