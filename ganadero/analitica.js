let analiticaComparar="lotes",analiticaEje="inicio",analiticaSeleccion=null,analiticaElegirAbierto=!1;const COLORES_ANALITICA=["#4C7BB0","#D4A24C","#3FA36B","#D0574B","#8E6CC8","#2BB3B1","#C77DB5","#8A9A5B"],DIA_MS=864e5;function _diaDe(a){const n=String(a),l=n.length<=10?new Date(n+"T12:00:00"):new Date(n);return Math.round(Date.UTC(l.getFullYear(),l.getMonth(),l.getDate())/DIA_MS)}function curvaAnimal(a,n,l){const d=n.filter(s=>s.animal_id===a.id&&s.peso_kg!=null).map(s=>[_diaDe(s.fecha),parseFloat(s.peso_kg)]).sort((s,i)=>s[0]-i[0]);if(!d.length)return[];const c=l==="edad"?a.fecha_nacimiento?_diaDe(a.fecha_nacimiento):null:d[0][0];return c==null?[]:d.map(([s,i])=>[s-c,i])}function gananciaDiaria(a){if(a.length<2||a[a.length-1][0]-a[0][0]<7)return null;const n=a.length,l=a.reduce((i,p)=>i+p[0],0)/n,d=a.reduce((i,p)=>i+p[1],0)/n;let c=0,s=0;return a.forEach(([i,p])=>{c+=(i-l)*(p-d),s+=(i-l)**2}),s?c/s:null}function pesoEnDia(a,n){if(!a.length||n<a[0][0]||n>a[a.length-1][0])return null;for(let l=0;l<a.length-1;l++){const[d,c]=a[l],[s,i]=a[l+1];if(n>=d&&n<=s)return s===d?i:c+(i-c)*(n-d)/(s-d)}return a[a.length-1][1]}function curvaPromedio(a){const n=a.filter(i=>i.length>=2);if(!n.length)return[];const l=Math.max(1,Math.ceil(n.length/2)),d=Math.min(...n.map(i=>i[0][0])),c=Math.max(...n.map(i=>i[i.length-1][0])),s=[];for(let i=Math.floor(d/7)*7;i<=c;i+=7){const p=n.map(m=>pesoEnDia(m,i)).filter(m=>m!=null);p.length>=l&&s.push([i,p.reduce((m,h)=>m+h,0)/p.length])}return s}function svgCurvas(a,n){const l=a.filter(t=>t.puntos.length);if(!l.length)return'<div class="empty">Todav\xEDa no hay pesajes suficientes para dibujar curvas.</div>';const d=window.innerWidth>=900,c=d?720:400,s=d?290:280,i={i:38,d:10,a:10,b:38},p=l.flatMap(t=>t.puntos.map(r=>r[0])),m=l.flatMap(t=>t.puntos.map(r=>r[1])),h=Math.floor(Math.min(...p)/7)*7,x=Math.max(...p,h+7),y=Math.floor(Math.min(...m)/5)*5,$=Math.ceil(Math.max(...m)/5)*5||5,v=t=>i.i+(t-h)/(x-h)*(c-i.i-i.d),u=t=>s-i.b-(t-y)/($-y||1)*(s-i.a-i.b),w=Math.max(5,Math.ceil(($-y)/5/5)*5),b=[7,14,28,56,91,182].find(t=>(x-h)/t<=6)||365;let f="";for(let t=y;t<=$;t+=w)f+=`<line x1="${i.i}" x2="${c-i.d}" y1="${u(t)}" y2="${u(t)}" stroke="currentColor" stroke-opacity="0.12"/><text x="${i.i-6}" y="${u(t)+4}" text-anchor="end" font-size="12" fill="currentColor" opacity="0.75">${t}</text>`;for(let t=Math.ceil(h/b)*b;t<=x;t+=b)f+=`<text x="${v(t)}" y="${s-i.b+16}" text-anchor="middle" font-size="12" fill="currentColor" opacity="0.75">${t}</text>`;f+=`<text x="${(i.i+c-i.d)/2}" y="${s-6}" text-anchor="middle" font-size="12" fill="currentColor" opacity="0.8">${esc(n)}</text>`,f+=`<text x="12" y="${(i.a+s-i.b)/2}" text-anchor="middle" font-size="12" fill="currentColor" opacity="0.8" transform="rotate(-90 12 ${(i.a+s-i.b)/2})">Peso (kg)</text>`;const e=l.map(t=>`
    <polyline fill="none" stroke="${t.color}" stroke-width="2" stroke-linejoin="round" points="${t.puntos.map(r=>`${v(r[0]).toFixed(1)},${u(r[1]).toFixed(1)}`).join(" ")}"/>
    ${t.puntos.map(r=>`<circle cx="${v(r[0]).toFixed(1)}" cy="${u(r[1]).toFixed(1)}" r="2.2" fill="${t.color}"><title>${esc(t.nombre)} \xB7 d\xEDa ${r[0]} \xB7 ${r[1].toFixed(1)} kg</title></circle>`).join("")}`).join(""),o=l.map(t=>`<span style="display:inline-flex;align-items:center;gap:5px;margin:0 12px 4px 0;font-size:13px;"><span style="width:12px;height:12px;border-radius:3px;background:${t.color};"></span>${esc(t.nombre)}</span>`).join("");return`<svg viewBox="0 0 ${c} ${s}" style="width:100%;max-width:820px;height:auto;display:block;margin:0 auto;color:var(--texto);" role="img" aria-label="Curvas de crecimiento">${f}${e}</svg>
    <div style="margin:6px auto 0;max-width:820px;">${o}</div>`}function barrasGanancia(a){if(!a.length)return'<div class="empty">Todav\xEDa no hay pesajes suficientes.</div>';const n=Math.max(...a.map(l=>l.gdp));return a.map((l,d)=>`
    <div style="margin-top:10px;">
      <div class="row" style="justify-content:space-between;font-size:14px;">
        <span>${esc(l.nombre)} <span class="muted">(${l.n} animal${l.n===1?"":"es"})</span></span>
        <b style="color:var(--texto);">${l.gdp.toFixed(3)} kg/d\xEDa</b>
      </div>
      <div style="height:8px;border-radius:4px;background:var(--barra-track);margin-top:4px;overflow:hidden;">
        <div style="height:100%;width:${n>0?Math.max(0,l.gdp/n*100).toFixed(0):0}%;background:${l.color||COLORES_ANALITICA[d%COLORES_ANALITICA.length]};"></div>
      </div>
    </div>`).join("")}async function viewAnalitica(){const[{animales:a,pesajes:n,sinRed:l},d]=await Promise.all([mockApi.pesajesParaAnalitica(),mockApi.misLotes()]),c=a.filter(e=>e.estado==="vivo"),s=a.some(e=>e.fecha_nacimiento);s||(analiticaEje="inicio");const i=analiticaEje==="edad"?"Edad (d\xEDas)":"D\xEDas desde el primer pesaje",p=new Map(a.map(e=>[e.id,curvaAnimal(e,n,analiticaEje)])),m=new Map(a.map(e=>[e.id,gananciaDiaria(curvaAnimal(e,n,"inicio"))])),h=c.filter(e=>m.get(e.id)!=null).sort((e,o)=>m.get(o.id)-m.get(e.id)),x=await Promise.all(d.map(e=>mockApi.animalesDeLote(e.id).then(o=>[e,o]).catch(()=>[e,[]]))),y=new Map;x.forEach(([e,o])=>o.forEach(t=>y.set(t.id,e.nombre)));let $;analiticaComparar==="lotes"?$=x.filter(([,e])=>e.length).map(([e,o],t)=>({nombre:e.nombre,color:COLORES_ANALITICA[t%COLORES_ANALITICA.length],puntos:curvaPromedio(o.map(r=>p.get(r.id)||[]).filter(r=>r.length))})):(analiticaSeleccion||(analiticaSeleccion=new Set(h.slice(0,5).map(e=>e.id))),$=a.filter(e=>analiticaSeleccion.has(e.id)).map((e,o)=>({nombre:etiquetaAnimal(e),color:COLORES_ANALITICA[o%COLORES_ANALITICA.length],puntos:p.get(e.id)||[]})));const v=x.filter(([,e])=>e.length).map(([e,o],t)=>{const r=o.map(g=>m.get(g.id)).filter(g=>g!=null);return{nombre:e.nombre,n:r.length,color:COLORES_ANALITICA[t%COLORES_ANALITICA.length],gdp:r.length?r.reduce((g,A)=>g+A,0)/r.length:null}}).filter(e=>e.gdp!=null).sort((e,o)=>o.gdp-e.gdp),u=new Map;a.forEach(e=>["padre_id","madre_id"].forEach(o=>{e[o]!=null&&(u.has(e[o])||u.set(e[o],[]),u.get(e[o]).push(e))}));const w=[...u.entries()].map(([e,o])=>{const t=a.find(g=>g.id===e),r=o.map(g=>m.get(g.id)).filter(g=>g!=null);return t&&{animal:t,crias:o.length,gdp:r.length?r.reduce((g,A)=>g+A,0)/r.length:null}}).filter(Boolean).sort((e,o)=>(o.gdp??-1)-(e.gdp??-1)||o.crias-e.crias).slice(0,8),b=(e,o)=>{const t=curvaAnimal(e,n,"inicio");return`<tr>
      <td>${o+1}</td><td><b>${esc(etiquetaAnimal(e))}</b><div class="small muted">${esc(y.get(e.id)||"Sin lote")}</div></td>
      <td style="text-align:right;"><b>${m.get(e.id).toFixed(3)}</b></td>
      <td style="text-align:right;" class="small">${t[0][1].toFixed(1)} \u2192 ${t[t.length-1][1].toFixed(1)} kg<div class="muted">${t[t.length-1][0]} d\xEDas</div></td>
    </tr>`},f=(e,o,t,r,g)=>`<button type="button" class="btn ${r?"btn-primary":"btn-ghost"}" data-analitica-${e}="${o}" ${g?'disabled title="Ning\xFAn animal tiene fecha de nacimiento"':""} style="flex:1;">${t}</button>`;return`
    <h3 class="section-title" style="margin-bottom:6px;">Anal\xEDtica</h3>
    ${l?'<p class="small muted" style="margin-bottom:10px;">\u{1F4F4} Sin se\xF1al: se usan los pesajes guardados en este celular.</p>':""}

    <div class="card">
      <div class="form-section-title" style="margin-top:0;">Curvas de crecimiento</div>
      <div class="row" style="gap:6px;margin-top:8px;">
        ${f("comparar","lotes","Por lote (promedio)",analiticaComparar==="lotes")}
        ${f("comparar","animales","Por animal",analiticaComparar==="animales")}
      </div>
      <div class="row" style="gap:6px;margin-top:6px;">
        ${f("eje","inicio","D\xEDas desde el 1.er pesaje",analiticaEje==="inicio")}
        ${f("eje","edad","Edad (d\xEDas)",analiticaEje==="edad",!s)}
      </div>
      ${analiticaComparar==="animales"?`
        <details style="margin-top:10px;" ${analiticaElegirAbierto?"open":""}>
          <summary class="small" style="cursor:pointer;">Elegir animales (${analiticaSeleccion.size} de ${a.length})</summary>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;max-height:200px;overflow:auto;">
            ${h.concat(a.filter(e=>!h.includes(e))).map(e=>`
              <label class="small" style="display:inline-flex;align-items:center;gap:6px;margin:0;padding:4px 10px;border:1px solid var(--borde-fuerte);border-radius:14px;white-space:nowrap;font-weight:500;">
                <input type="checkbox" style="width:auto;margin:0;" data-analitica-animal="${esc(String(e.id))}" ${analiticaSeleccion.has(e.id)?"checked":""}>${esc(etiquetaAnimal(e))}
              </label>`).join("")}
          </div>
        </details>`:""}
      <div style="margin-top:12px;">${svgCurvas($,i)}</div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:0 14px;align-items:start;">
    <div class="card">
      <div class="form-section-title" style="margin-top:0;">Ganancia diaria promedio por lote</div>
      ${barrasGanancia(v)}
    </div>

    <div class="card">
      <div class="form-section-title" style="margin-top:0;">Mejor ganancia de peso</div>
      ${h.length?`<table style="width:100%;border-collapse:collapse;margin-top:8px;font-size:14px;">
        <tr class="small muted"><th style="text-align:left;">#</th><th style="text-align:left;">Animal</th><th style="text-align:right;">kg/d\xEDa</th><th style="text-align:right;">Peso</th></tr>
        ${h.slice(0,10).map(b).join("")}
      </table>`:'<div class="empty">Hacen falta al menos dos pesajes con una semana de diferencia.</div>'}
    </div>

    <div class="card">
      <div class="form-section-title" style="margin-top:0;">Mejores reproductores</div>
      ${w.length?w.map(e=>`
        <div class="row" style="justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--borde);">
          <span><b>${esc(etiquetaAnimal(e.animal))}</b> <span class="small muted">${e.animal.sexo==="macho"?"Verraco":"Cerda"} \xB7 ${e.crias} cr\xEDa${e.crias===1?"":"s"}</span></span>
          <span class="small">${e.gdp!=null?`<b>${e.gdp.toFixed(3)}</b> kg/d\xEDa cr\xEDas`:'<span class="muted">sin pesajes de cr\xEDas</span>'}</span>
        </div>`).join(""):'<div class="empty">Registra el padre y la madre en la genealog\xEDa de cada animal para comparar a los reproductores por el crecimiento de sus cr\xEDas.</div>'}
    </div>

    <div class="card">
      <div class="form-section-title" style="margin-top:0;">Conversi\xF3n alimenticia</div>
      <p class="small muted" style="margin-top:6px;">Para calcularla (kg de alimento por kg ganado) hace falta registrar el alimento consumido por cada lote.</p>
    </div>
    </div>`}function bindAnalitica(){const a=document.getElementById("app");a.querySelectorAll("[data-analitica-comparar]").forEach(n=>n.onclick=()=>{analiticaComparar=n.dataset.analiticaComparar,renderApp()}),a.querySelectorAll("[data-analitica-eje]").forEach(n=>n.onclick=()=>{analiticaEje=n.dataset.analiticaEje,renderApp()}),a.querySelectorAll("[data-analitica-animal]").forEach(n=>n.onchange=()=>{const l=/^\d+$/.test(n.dataset.analiticaAnimal)?Number(n.dataset.analiticaAnimal):n.dataset.analiticaAnimal;n.checked?analiticaSeleccion.add(l):analiticaSeleccion.delete(l),analiticaElegirAbierto=!0,renderApp()})}
