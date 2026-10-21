let analiticaComparar="lotes",analiticaEje="inicio",analiticaSeleccion=null,analiticaElegirAbierto=!1;const COLORES_ANALITICA=["#4C7BB0","#D4A24C","#3FA36B","#D0574B","#8E6CC8","#2BB3B1","#C77DB5","#8A9A5B"],DIA_MS=864e5;function _diaDe(a){return Math.floor(new Date(String(a).slice(0,10)+"T12:00:00").getTime()/DIA_MS)}function curvaAnimal(a,n,s){const o=n.filter(i=>i.animal_id===a.id&&i.peso_kg!=null).map(i=>[_diaDe(i.fecha),parseFloat(i.peso_kg)]).sort((i,c)=>i[0]-c[0]);if(!o.length)return[];const r=s==="edad"?a.fecha_nacimiento?_diaDe(a.fecha_nacimiento):null:o[0][0];return r==null?[]:o.map(([i,c])=>[i-r,c])}function gananciaDiaria(a){if(a.length<2||a[a.length-1][0]-a[0][0]<7)return null;const n=a.length,s=a.reduce((c,g)=>c+g[0],0)/n,o=a.reduce((c,g)=>c+g[1],0)/n;let r=0,i=0;return a.forEach(([c,g])=>{r+=(c-s)*(g-o),i+=(c-s)**2}),i?r/i:null}function curvaPromedio(a){const n=new Map;a.forEach(o=>o.forEach(([r,i])=>{const c=Math.round(r/7)*7;n.has(c)||n.set(c,[]),n.get(c).push(i)}));const s=a.length>=3?2:1;return[...n.entries()].filter(([,o])=>o.length>=s).map(([o,r])=>[o,r.reduce((i,c)=>i+c,0)/r.length]).sort((o,r)=>o[0]-r[0])}function svgCurvas(a,n){const s=a.filter(t=>t.puntos.length);if(!s.length)return'<div class="empty">Todav\xEDa no hay pesajes suficientes para dibujar curvas.</div>';const o=400,r=280,i={i:38,d:10,a:10,b:38},c=s.flatMap(t=>t.puntos.map(l=>l[0])),g=s.flatMap(t=>t.puntos.map(l=>l[1])),m=Math.min(0,...c),u=Math.max(...c,m+7),h=Math.floor(Math.min(...g)/5)*5,$=Math.ceil(Math.max(...g)/5)*5||5,f=t=>i.i+(t-m)/(u-m)*(o-i.i-i.d),x=t=>r-i.b-(t-h)/($-h||1)*(r-i.a-i.b),v=Math.max(5,Math.ceil(($-h)/5/5)*5),b=[7,14,28,56,91,182].find(t=>(u-m)/t<=6)||365;let y="";for(let t=h;t<=$;t+=v)y+=`<line x1="${i.i}" x2="${o-i.d}" y1="${x(t)}" y2="${x(t)}" stroke="currentColor" stroke-opacity="0.12"/><text x="${i.i-6}" y="${x(t)+4}" text-anchor="end" font-size="12" fill="currentColor" opacity="0.75">${t}</text>`;for(let t=Math.ceil(m/b)*b;t<=u;t+=b)y+=`<text x="${f(t)}" y="${r-i.b+16}" text-anchor="middle" font-size="12" fill="currentColor" opacity="0.75">${t}</text>`;y+=`<text x="${(i.i+o-i.d)/2}" y="${r-6}" text-anchor="middle" font-size="12" fill="currentColor" opacity="0.8">${esc(n)}</text>`,y+=`<text x="12" y="${(i.a+r-i.b)/2}" text-anchor="middle" font-size="12" fill="currentColor" opacity="0.8" transform="rotate(-90 12 ${(i.a+r-i.b)/2})">Peso (kg)</text>`;const A=s.map(t=>`
    <polyline fill="none" stroke="${t.color}" stroke-width="2" stroke-linejoin="round" points="${t.puntos.map(l=>`${f(l[0]).toFixed(1)},${x(l[1]).toFixed(1)}`).join(" ")}"/>
    ${t.puntos.map(l=>`<circle cx="${f(l[0]).toFixed(1)}" cy="${x(l[1]).toFixed(1)}" r="2.2" fill="${t.color}"><title>${esc(t.nombre)} \xB7 d\xEDa ${l[0]} \xB7 ${l[1].toFixed(1)} kg</title></circle>`).join("")}`).join(""),e=s.map(t=>`<span style="display:inline-flex;align-items:center;gap:5px;margin:0 12px 4px 0;font-size:13px;"><span style="width:12px;height:12px;border-radius:3px;background:${t.color};"></span>${esc(t.nombre)}</span>`).join("");return`<svg viewBox="0 0 ${o} ${r}" style="width:100%;height:auto;display:block;color:var(--texto);" role="img" aria-label="Curvas de crecimiento">${y}${A}</svg>
    <div style="margin-top:6px;">${e}</div>`}function barrasGanancia(a){if(!a.length)return'<div class="empty">Todav\xEDa no hay pesajes suficientes.</div>';const n=Math.max(...a.map(s=>s.gdp));return a.map((s,o)=>`
    <div style="margin-top:10px;">
      <div class="row" style="justify-content:space-between;font-size:14px;">
        <span>${esc(s.nombre)} <span class="muted">(${s.n} animal${s.n===1?"":"es"})</span></span>
        <b style="color:var(--texto);">${s.gdp.toFixed(3)} kg/d\xEDa</b>
      </div>
      <div style="height:8px;border-radius:4px;background:var(--barra-track);margin-top:4px;overflow:hidden;">
        <div style="height:100%;width:${n>0?Math.max(0,s.gdp/n*100).toFixed(0):0}%;background:${s.color||COLORES_ANALITICA[o%COLORES_ANALITICA.length]};"></div>
      </div>
    </div>`).join("")}async function viewAnalitica(){const[{animales:a,pesajes:n,sinRed:s},o]=await Promise.all([mockApi.pesajesParaAnalitica(),mockApi.misLotes()]),r=a.filter(e=>e.estado==="vivo"),i=a.some(e=>e.fecha_nacimiento);i||(analiticaEje="inicio");const c=analiticaEje==="edad"?"Edad (d\xEDas)":"D\xEDas desde el primer pesaje",g=new Map(a.map(e=>[e.id,curvaAnimal(e,n,analiticaEje)])),m=new Map(a.map(e=>[e.id,gananciaDiaria(curvaAnimal(e,n,"inicio"))])),u=r.filter(e=>m.get(e.id)!=null).sort((e,t)=>m.get(t.id)-m.get(e.id)),h=await Promise.all(o.map(e=>mockApi.animalesDeLote(e.id).then(t=>[e,t]).catch(()=>[e,[]]))),$=new Map;h.forEach(([e,t])=>t.forEach(l=>$.set(l.id,e.nombre)));let f;analiticaComparar==="lotes"?f=h.filter(([,e])=>e.length).map(([e,t],l)=>({nombre:e.nombre,color:COLORES_ANALITICA[l%COLORES_ANALITICA.length],puntos:curvaPromedio(t.map(p=>g.get(p.id)||[]).filter(p=>p.length))})):(analiticaSeleccion||(analiticaSeleccion=new Set(u.slice(0,5).map(e=>e.id))),f=a.filter(e=>analiticaSeleccion.has(e.id)).map((e,t)=>({nombre:etiquetaAnimal(e),color:COLORES_ANALITICA[t%COLORES_ANALITICA.length],puntos:g.get(e.id)||[]})));const x=h.filter(([,e])=>e.length).map(([e,t],l)=>{const p=t.map(d=>m.get(d.id)).filter(d=>d!=null);return{nombre:e.nombre,n:p.length,color:COLORES_ANALITICA[l%COLORES_ANALITICA.length],gdp:p.length?p.reduce((d,w)=>d+w,0)/p.length:null}}).filter(e=>e.gdp!=null).sort((e,t)=>t.gdp-e.gdp),v=new Map;a.forEach(e=>["padre_id","madre_id"].forEach(t=>{e[t]!=null&&(v.has(e[t])||v.set(e[t],[]),v.get(e[t]).push(e))}));const b=[...v.entries()].map(([e,t])=>{const l=a.find(d=>d.id===e),p=t.map(d=>m.get(d.id)).filter(d=>d!=null);return l&&{animal:l,crias:t.length,gdp:p.length?p.reduce((d,w)=>d+w,0)/p.length:null}}).filter(Boolean).sort((e,t)=>(t.gdp??-1)-(e.gdp??-1)||t.crias-e.crias).slice(0,8),y=(e,t)=>{const l=curvaAnimal(e,n,"inicio");return`<tr>
      <td>${t+1}</td><td><b>${esc(etiquetaAnimal(e))}</b><div class="small muted">${esc($.get(e.id)||"Sin lote")}</div></td>
      <td style="text-align:right;"><b>${m.get(e.id).toFixed(3)}</b></td>
      <td style="text-align:right;" class="small">${l[0][1].toFixed(1)} \u2192 ${l[l.length-1][1].toFixed(1)} kg<div class="muted">${l[l.length-1][0]} d\xEDas</div></td>
    </tr>`},A=(e,t,l,p,d)=>`<button type="button" class="btn ${p?"btn-primary":"btn-ghost"}" data-analitica-${e}="${t}" ${d?'disabled title="Ning\xFAn animal tiene fecha de nacimiento"':""} style="flex:1;">${l}</button>`;return`
    <h3 class="section-title" style="margin-bottom:6px;">Anal\xEDtica</h3>
    ${s?'<p class="small muted" style="margin-bottom:10px;">\u{1F4F4} Sin se\xF1al: se usan los pesajes guardados en este celular.</p>':""}

    <div class="card">
      <div class="form-section-title" style="margin-top:0;">Curvas de crecimiento</div>
      <div class="row" style="gap:6px;margin-top:8px;">
        ${A("comparar","lotes","Por lote (promedio)",analiticaComparar==="lotes")}
        ${A("comparar","animales","Por animal",analiticaComparar==="animales")}
      </div>
      <div class="row" style="gap:6px;margin-top:6px;">
        ${A("eje","inicio","D\xEDas desde el 1.er pesaje",analiticaEje==="inicio")}
        ${A("eje","edad","Edad (d\xEDas)",analiticaEje==="edad",!i)}
      </div>
      ${analiticaComparar==="animales"?`
        <details style="margin-top:10px;" ${analiticaElegirAbierto?"open":""}>
          <summary class="small" style="cursor:pointer;">Elegir animales (${analiticaSeleccion.size} de ${a.length})</summary>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;max-height:200px;overflow:auto;">
            ${u.concat(a.filter(e=>!u.includes(e))).map(e=>`
              <label class="small" style="display:inline-flex;align-items:center;gap:6px;margin:0;padding:4px 10px;border:1px solid var(--borde-fuerte);border-radius:14px;white-space:nowrap;font-weight:500;">
                <input type="checkbox" style="width:auto;margin:0;" data-analitica-animal="${esc(String(e.id))}" ${analiticaSeleccion.has(e.id)?"checked":""}>${esc(etiquetaAnimal(e))}
              </label>`).join("")}
          </div>
        </details>`:""}
      <div style="margin-top:12px;">${svgCurvas(f,c)}</div>
    </div>

    <div class="card">
      <div class="form-section-title" style="margin-top:0;">Ganancia diaria promedio por lote</div>
      ${barrasGanancia(x)}
    </div>

    <div class="card">
      <div class="form-section-title" style="margin-top:0;">Mejor ganancia de peso</div>
      ${u.length?`<table style="width:100%;border-collapse:collapse;margin-top:8px;font-size:14px;">
        <tr class="small muted"><th style="text-align:left;">#</th><th style="text-align:left;">Animal</th><th style="text-align:right;">kg/d\xEDa</th><th style="text-align:right;">Peso</th></tr>
        ${u.slice(0,10).map(y).join("")}
      </table>`:'<div class="empty">Hacen falta al menos dos pesajes con una semana de diferencia.</div>'}
    </div>

    <div class="card">
      <div class="form-section-title" style="margin-top:0;">Mejores reproductores</div>
      ${b.length?b.map(e=>`
        <div class="row" style="justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--borde);">
          <span><b>${esc(etiquetaAnimal(e.animal))}</b> <span class="small muted">${e.animal.sexo==="macho"?"Verraco":"Cerda"} \xB7 ${e.crias} cr\xEDa${e.crias===1?"":"s"}</span></span>
          <span class="small">${e.gdp!=null?`<b>${e.gdp.toFixed(3)}</b> kg/d\xEDa cr\xEDas`:'<span class="muted">sin pesajes de cr\xEDas</span>'}</span>
        </div>`).join(""):'<div class="empty">Registra el padre y la madre en la genealog\xEDa de cada animal para comparar a los reproductores por el crecimiento de sus cr\xEDas.</div>'}
    </div>

    <div class="card">
      <div class="form-section-title" style="margin-top:0;">Conversi\xF3n alimenticia</div>
      <p class="small muted" style="margin-top:6px;">Para calcularla (kg de alimento por kg ganado) hace falta registrar el alimento consumido por cada lote.</p>
    </div>`}function bindAnalitica(){const a=document.getElementById("app");a.querySelectorAll("[data-analitica-comparar]").forEach(n=>n.onclick=()=>{analiticaComparar=n.dataset.analiticaComparar,renderApp()}),a.querySelectorAll("[data-analitica-eje]").forEach(n=>n.onclick=()=>{analiticaEje=n.dataset.analiticaEje,renderApp()}),a.querySelectorAll("[data-analitica-animal]").forEach(n=>n.onchange=()=>{const s=/^\d+$/.test(n.dataset.analiticaAnimal)?Number(n.dataset.analiticaAnimal):n.dataset.analiticaAnimal;n.checked?analiticaSeleccion.add(s):analiticaSeleccion.delete(s),analiticaElegirAbierto=!0,renderApp()})}
