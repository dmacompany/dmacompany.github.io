/* DMA COMPANY · TinkerDance ASD — Area riservata dei soci.
   Nessuna password: link personale (?k=…) oppure email + codice di 6 cifre.
   I dati arrivano dallo script Google privato, solo quelli del socio collegato. */
(function(){
"use strict";
const CONFIG={ENDPOINT:"https://script.google.com/macros/s/AKfycbw5jpPOWk_QB-QDwX8xCz6-DWgdfYBJA68MVEhk05PDaB1mAT3UTFEvldAj0hI49ojU/exec"};   // indirizzo dell'app web Google Apps Script (vuoto = area non ancora attiva)
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
function entra(j){S.t=j.t;store.set("ar.t",j.t);S.D=j.dati;S.kid=(j.dati.soci[0]||{}).id;S.view="home";render();window.scrollTo(0,0)}
function esci(){store.set("ar.t",null);S.t=null;S.D=null;main.innerHTML=loginHtml;bindLogin();window.scrollTo(0,0)}
async function avvio(){
  bindLogin();if(!CONFIG.ENDPOINT)return;
  const qs=new URLSearchParams(location.search),k=qs.get("k");
  if(k){history.replaceState(null,"",location.pathname);main.classList.add("wait");
    try{const j=await api({tipo:"area_link",k});if(!j.ok)throw new Error(j.errore);main.classList.remove("wait");entra(j);return}
    catch(x){main.classList.remove("wait");showMsg("<b>Questo link non è attivo.</b> Potrebbe essere stato sostituito da uno nuovo. Entra con la tua email qui sopra oppure chiedi un nuovo link su <a href='"+WA+"' style='white-space:nowrap;font-weight:700'>WhatsApp</a>.");return}}
  if(S.t){main.classList.add("wait");try{const j=await api({tipo:"area_dati",t:S.t});main.classList.remove("wait");if(!j.ok)throw 0;S.D=j.dati;S.kid=(j.dati.soci[0]||{}).id;render()}catch(x){main.classList.remove("wait");store.set("ar.t",null);S.t=null}}
}
async function sess(o){const j=await api(Object.assign({t:S.t},o));if(!j.ok&&j.errore==="sessione"){toast("Sessione scaduta: entra di nuovo");esci();throw new Error("sessione")}return j}

/* ---------- viste ---------- */
const kid=()=>S.D.soci.find(s=>s.id===S.kid)||S.D.soci[0];
const ini=n=>String(n||"").split(" ").filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase();
const nomeP=s=>s.nomeProprio||String(s.nome||"").split(" ").slice(1).join(" ")||s.nome;
const dovuti=s=>(s.mesi||[]).filter(m=>m.s==="due");
function kidsBar(){return S.D.soci.length>1?`<div class="kids" role="group" aria-label="Allievo">${S.D.soci.map(s=>`<button class="kid" data-a="kid" data-id="${esc(s.id)}" aria-pressed="${s.id===kid().id}"><span class="av">${esc(ini(s.nome))}</span>${esc(nomeP(s))}</button>`).join("")}</div>`:`<div style="height:14px"></div>`}
function mesiGrid(s){return `<div class="mesi">${(s.mesi||[]).map(m=>`<div class="mese ${m.s==="ok"?"ok":m.s==="due"?"due":""}">${esc(m.m)}<i>${m.s==="ok"?"pagato":m.s==="due"?"da pagare":m.s==="n"?"—":"in arrivo"}</i></div>`).join("")}</div>`}
function certTxt(c){return c.stato==="ok"?`<span class="pill ok">valido</span>`:c.stato==="warn"?`<span class="pill warn">in scadenza</span>`:`<span class="pill bad">${c.scad?"scaduto":"mancante"}</span>`}
function vHome(){const s=kid(),av=[],dv=dovuti(s);
  if(s.daPagare>0)av.push(`<div class="alert"><b>Da pagare: ${eur(s.daPagare)}</b>${dv.length?"Quota di "+dv.map(m=>MESI[m.m]).join(", ")+(s.tess.dovuta>s.tess.pagata?" e quota associativa":"")+". ":""}<a href="#" data-a="go" data-id="pag">Paga o carica la ricevuta</a></div>`);
  if(s.cert.stato!=="ok")av.push(`<div class="alert"><b>${s.cert.scad?(s.cert.stato==="warn"?"Il certificato medico scade il ":"Il certificato medico è scaduto il ")+fd(s.cert.scad):"Certificato medico mancante"}</b>Caricalo per continuare a frequentare. <a href="#" data-a="go" data-id="doc">Carica il certificato</a></div>`);
  if(!av.length)av.push(`<div class="alert ok"><b>Tutto in regola</b>Pagamenti e certificato medico sono a posto.</div>`);
  return `<div class="stack">${av.join("")}<div class="grid2">
   <div class="card"><h2>Iscrizione di ${esc(nomeP(s))}</h2><dl><dt>Stato</dt><dd><span class="pill ok">socio · stagione ${esc(S.D.stagione)}</span></dd>${s.tessera?`<dt>Tessera ACSI</dt><dd>${esc(s.tessera)}</dd>`:""}<dt>Certificato</dt><dd>${certTxt(s.cert)}${s.cert.scad?" "+fd(s.cert.scad):""}</dd></dl></div>
   <div class="card"><h2>Corsi</h2>${(s.corsi||[]).length?s.corsi.map(c=>`<div class="row"><div class="t"><b>${esc(c.area)}</b><span>${esc(c.corso)}</span></div></div>`).join(""):`<p class="note" style="margin:0">${s.esente?"Staff: nessuna quota dovuta.":"Nessun corso registrato."}</p>`}</div></div>
   ${(s.mesi||[]).some(m=>m.v)?`<div class="card"><h2>Quote della stagione</h2>${mesiGrid(s)}</div>`:""}</div>`}
function vPag(){const s=kid(),caus="Quota "+(dovuti(s).map(m=>MESI[m.m]).join(" ")||"")+" "+s.nome;
  return `<div class="stack">
  ${s.daPagare>0?`<div class="card"><h2>Da pagare</h2><div class="row"><div class="t"><b>${dovuti(s).length?"Quota di "+esc(dovuti(s).map(m=>MESI[m.m]).join(", ")):"Quota"}${s.tess.dovuta>s.tess.pagata?" e quota associativa":""}</b><span>importo aggiornato al ${esc(fd(String(S.D.agg).slice(0,10)))}</span></div><span class="num">${eur(s.daPagare)}</span></div>
   <div class="box" style="margin-top:10px"><dl><dt>Intestato a</dt><dd>${esc(S.D.intestatario)}</dd><dt>IBAN</dt><dd class="mono">${esc(String(S.D.iban).replace(/(.{4})/g,"$1 ").trim())}</dd><dt>Causale</dt><dd>${esc(caus.replace(/\s+/g," "))}</dd></dl>
   <div class="actions" style="margin-top:12px"><button class="btn ghost small" data-a="copy" data-t="${esc(String(S.D.iban).replace(/\s/g,""))}">Copia IBAN</button><button class="btn ghost small" data-a="copy" data-t="${esc(caus.replace(/\s+/g," "))}">Copia causale</button></div></div>
   <p class="note" style="margin:10px 0 0">Puoi pagare anche in contanti in segreteria.</p></div>`:`<div class="alert ok"><b>Nessuna quota da pagare</b>${s.credito>0?"Hai già versato "+eur(s.credito)+" per i prossimi mesi.":"Sei in regola con i pagamenti."}</div>`}
  <div class="card"><h2>Hai fatto un bonifico?</h2><p class="note" style="margin:0 0 10px">Carica la ricevuta, anche uno screenshot dell'app della banca. La segreteria verifica l'accredito e la ricevuta dell'associazione compare qui entro 5 giorni.</p>
   <div class="drop"><input type="file" id="fRic" accept="image/*,application/pdf"><input type="text" id="fImp" inputmode="decimal" placeholder="Importo versato (€)"><input type="text" id="fNota" placeholder="Per quale mese (facoltativo)">
   <div class="actions" style="justify-content:center;margin-top:12px"><button class="btn small" data-a="sendRic">Invia la ricevuta</button></div></div></div>
  ${(s.mesi||[]).some(m=>m.v)?`<div class="card"><h2>Stagione ${esc(S.D.stagione)}</h2>${mesiGrid(s)}</div>`:""}
  <div class="card"><h2>Ricevute dell'associazione</h2>${(s.ricevute||[]).length?s.ricevute.map(r=>`<div class="row"><div class="t"><b>Ricevuta n. ${esc(r.n)} · ${esc(fd(r.data))}</b><span>${esc(r.descr)}</span>${r.detraibile?'<div><span class="pill n" style="margin-top:4px">detraibile 19%</span></div>':""}</div><div class="actions" style="align-items:center;flex-wrap:nowrap"><span class="num">${eur(r.importo)}</span>${r.file?`<button class="btn ghost small" data-a="pdf" data-id="${esc(r.n)}">PDF</button>`:'<span class="pill n">in preparazione</span>'}</div></div>`).join(""):`<p class="note" style="margin:0">Nessuna ricevuta per questa stagione.</p>`}
   <p class="note" style="margin:10px 0 0">Le ricevute pagate con mezzi tracciabili valgono per la detrazione delle spese sportive dei figli dai 5 ai 18 anni.</p></div>
  </div>`}
function vDoc(){const s=kid(),c=s.cert;
  return `<div class="stack"><div class="card"><h2>Certificato medico</h2><div class="row"><div class="t"><b>${esc(c.tipo)}</b><span>${c.scad?"Scadenza "+fd(c.scad):"Non ancora registrato"}</span></div>${certTxt(c)}</div>
   <div class="drop" style="margin-top:10px"><div class="note">${c.stato==="ok"?"Quando lo rinnovi, carica qui quello nuovo: foto o PDF.":"Carica il nuovo certificato: foto o PDF."}</div><input type="file" id="fCert" accept="image/*,application/pdf" style="margin-top:10px"><label class="note" style="display:block;margin-top:8px">Data di scadenza<input type="date" id="fScad"></label>
   <div class="actions" style="justify-content:center;margin-top:12px"><button class="btn small" data-a="sendCert">Invia il certificato</button></div></div></div>
  <div class="card"><h2>Documenti</h2><p class="note" style="margin:0">Domanda di ammissione, tessera ACSI, statuto e informativa privacy: chiedili in segreteria o su <a href="${WA}" target="_blank" rel="noopener">WhatsApp</a>. Presto li troverai anche qui.</p></div></div>`}
function vMe(){const t=S.D.titolare||{nome:S.D.nome};
  return `<div class="stack">${S.D.soci.map(s=>`<div class="card"><h2>${esc(s.nome)}</h2><dl>${s.cf?`<dt>Codice fiscale</dt><dd class="mono">${esc(s.cf)}</dd>`:""}${s.nascita?`<dt>Nato/a</dt><dd>${esc(fd(s.nascita))}${s.luogo?" a "+esc(s.luogo):""}</dd>`:""}${s.genitore?`<dt>Genitore</dt><dd>${esc(s.genitore)}</dd>`:""}${s.residenza?`<dt>Residenza</dt><dd>${esc(s.residenza)}</dd>`:""}${s.tel?`<dt>Cellulare</dt><dd>${esc(s.tel)}</dd>`:""}${s.email?`<dt>Email</dt><dd>${esc(s.email)}</dd>`:""}</dl>
    <div class="switch" style="margin-top:12px"><div><b>Consenso a foto e video</b><div class="note">Uso su sito e social di DMA COMPANY e TinkerDance, senza nomi. Puoi cambiarlo quando vuoi.</div></div><input type="checkbox" role="switch" data-a="cons" data-id="${esc(s.id)}" ${s.immagini?"checked":""} aria-label="Consenso foto e video di ${esc(s.nome)}"></div></div>`).join("")}
   <div class="card"><h2>Chiedi una modifica</h2><p class="note" style="margin:0 0 8px">Dati da correggere o aggiornare? Scrivi qui e la segreteria li sistema.</p><textarea id="fReq" placeholder="Es. nuovo indirizzo, nuovo cellulare…"></textarea><div class="actions" style="margin-top:10px"><button class="btn small" data-a="sendReq">Invia la richiesta</button></div></div>
   <div class="actions"><button class="btn ghost" data-a="esci">Esci</button></div></div>`}
const TABS=[["home","Panoramica",vHome],["pag","Pagamenti",vPag],["doc","Documenti",vDoc],["me","I miei dati",vMe]];
function render(){if(!S.D)return;const tit=(S.D.titolare&&S.D.titolare.nome)||S.D.nome||"",first=String(tit).split(" ").slice(1).join(" ")||tit;
  if(!S.D.soci.length){main.innerHTML=`<div class="ar"><h1>Ciao ${esc(first)}</h1><div class="alert" style="margin-top:16px"><b>Nessun iscritto collegato</b>Scrivici su WhatsApp per completare l'attivazione.</div><div class="actions" style="margin-top:16px"><button class="btn ghost" data-a="esci">Esci</button></div></div>`;return}
  const v=TABS.find(t=>t[0]===S.view)||TABS[0];
  main.innerHTML=`<div class="ar"><div class="top2"><div><div class="kick">Area riservata · stagione ${esc(S.D.stagione)}</div><h1>Ciao ${esc(first)}</h1></div><button class="btn ghost small" data-a="esci">Esci</button></div>
  ${kidsBar()}<nav class="tabs" aria-label="Sezioni">${TABS.map(t=>`<button class="tab" data-a="go" data-id="${t[0]}" ${t[0]===v[0]?'aria-current="page"':""}>${t[1]}</button>`).join("")}</nav>${v[2]()}
  <p class="note" style="margin-top:20px;text-align:center">Dati aggiornati al ${esc(fd(String(S.D.agg).slice(0,10)))}. Per qualsiasi dubbio scrivici su <a href="${WA}" target="_blank" rel="noopener">WhatsApp 338 378 7702</a>.</p></div>`}

/* ---------- file e invii ---------- */
function leggiFile(inp){return new Promise((ok,ko)=>{const f=inp&&inp.files&&inp.files[0];if(!f)return ok(null);if(f.size>8*1024*1024)return ko(new Error("grande"));
  const r=new FileReader();r.onload=()=>ok({name:f.name,type:f.type||"application/pdf",data:String(r.result).split(",")[1]});r.onerror=ko;r.readAsDataURL(f)})}
async function invio(b,fn,okMsg){b.disabled=true;const t=b.textContent;b.textContent="Invio…";try{await fn();toast(okMsg);render()}catch(x){if(x.message!=="sessione")toast(x.message==="grande"?"File troppo grande (massimo 8 MB)":x.message==="nofile"?"Scegli prima il file":"Invio non riuscito, riprova")}finally{b.disabled=false;b.textContent=t}}
document.addEventListener("click",async e=>{const b=e.target.closest("[data-a]");if(!b||!S.D&&b.dataset.a!=="esci")return;const a=b.dataset.a;if(b.tagName==="A")e.preventDefault();
  switch(a){
    case"go":S.view=b.dataset.id;render();window.scrollTo(0,0);break;
    case"kid":S.kid=b.dataset.id;render();break;
    case"esci":esci();break;
    case"copy":try{await navigator.clipboard.writeText(b.dataset.t);toast("Copiato")}catch(x){toast(b.dataset.t)}break;
    case"pdf":{b.disabled=true;try{const j=await sess({tipo:"area_pdf",num:b.dataset.id});if(!j.ok)throw new Error(j.errore);
      const bin=atob(j.data),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
      const url=URL.createObjectURL(new Blob([u],{type:"application/pdf"})),l=document.createElement("a");l.href=url;l.download=j.nome;document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(url),4000)}
      catch(x){if(x.message!=="sessione")toast(x.message==="non_ancora"?"La ricevuta sarà disponibile a breve":"Download non riuscito")}finally{b.disabled=false}break}
    case"sendRic":invio(b,async()=>{const f=await leggiFile($("#fRic"));if(!f)throw new Error("nofile");const j=await sess({tipo:"area_file",genere:"contabile",socioId:kid().id,file:f,importo:$("#fImp").value,descr:$("#fNota").value});if(!j.ok)throw new Error(j.errore)},"Ricevuta inviata: la segreteria verifica l'accredito");break;
    case"sendCert":invio(b,async()=>{const f=await leggiFile($("#fCert"));if(!f)throw new Error("nofile");const j=await sess({tipo:"area_file",genere:"certificato",socioId:kid().id,file:f,scadenza:$("#fScad").value,descr:"Certificato medico"});if(!j.ok)throw new Error(j.errore)},"Certificato inviato alla segreteria");break;
    case"sendReq":{const t=$("#fReq").value.trim();if(!t){toast("Scrivi cosa modificare");break}invio(b,async()=>{const j=await sess({tipo:"area_richiesta",testo:t});if(!j.ok)throw new Error(j.errore)},"Richiesta inviata alla segreteria");break}
  }});
document.addEventListener("change",async e=>{const t=e.target;if(t.dataset&&t.dataset.a==="cons"&&S.D){const s=S.D.soci.find(x=>x.id===t.dataset.id);
  try{const j=await sess({tipo:"area_richiesta",genere:"immagini",socioId:s.id,valore:t.checked});if(!j.ok)throw 0;s.immagini=t.checked;toast(t.checked?"Consenso inviato: la segreteria lo registra":"Revoca inviata: la segreteria la registra")}catch(x){t.checked=!t.checked;toast("Invio non riuscito")}}});
avvio();
})();
