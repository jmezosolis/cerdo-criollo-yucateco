let analiticaComparar="lotes",analiticaEje="inicio",analiticaSeleccion=null,analiticaElegirAbierto=!1;const COLORES_ANALITICA=["#4C7BB0","#D4A24C","#3FA36B","#D0574B","#8E6CC8","#2BB3B1","#C77DB5","#8A9A5B"],DIA_MS=864e5;function _diaDe(a){const l=String(a),n=l.length<=10?new Date(l+"T12:00:00"):new Date(l);return Math.round(Date.UTC(n.getFullYear(),n.getMonth(),n.getDate())/DIA_MS)}function curvaAnimal(a,l,n){const r=l.filter(s=>s.animal_id===a.id&&s.peso_kg!=null).map(s=>[_diaDe(s.fecha),parseFloat(s.peso_kg)]).sort((s,i)=>s[0]-i[0]);if(!r.length)return[];const d=n==="edad"?a.fecha_nacimiento?_diaDe(a.fecha_nacimiento):null:r[0][0];return d==null?[]:r.map(([s,i])=>[s-d,i])}function gananciaDiaria(a){if(a.length<2||a[a.length-1][0]-a[0][0]<7)return null;const l=a.length,n=a.reduce((i,c)=>i+c[0],0)/l,r=a.reduce((i,c)=>i+c[1],0)/l;let d=0,s=0;return a.forEach(([i,c])=>{d+=(i-n)*(c-r),s+=(i-n)**2}),s?d/s:null}function pesoEnDia(a,l){if(!a.length||l<a[0][0]||l>a[a.length-1][0])return null;for(let n=0;n<a.length-1;n++){const[r,d]=a[n],[s,i]=a[n+1];if(l>=r&&l<=s)return s===r?i:d+(i-d)*(l-r)/(s-r)}return a[a.length-1][1]}function curvaPromedio(a){const l=a.filter(i=>i.length>=2);if(!l.length)return[];const n=Math.max(1,Math.ceil(l.length/2)),r=Math.min(...l.map(i=>i[0][0])),d=Math.max(...l.map(i=>i[i.length-1][0])),s=[];for(let i=Math.floor(r/7)*7;i<=d;i+=7){const c=l.map(p=>pesoEnDia(p,i)).filter(p=>p!=null);c.length>=n&&s.push([i,c.reduce((p,m)=>p+m,0)/c.length])}return s}function svgCurvas(a,l){const n=a.filter(t=>t.puntos.length);if(!n.length)return'<div class="empty">Todav\xEDa no hay pesajes suficientes para dibujar curvas.</div>';const r=window.innerWidth>=900,d=r?720:400,s=r?290:280,i={i:38,d:10,a:10,b:38},c=n.flatMap(t=>t.puntos.map(o=>o[0])),p=n.flatMap(t=>t.puntos.map(o=>o[1])),m=Math.floor(Math.min(...c)/7)*7,f=Math.max(...c,m+7),x=Math.floor(Math.min(...p)/5)*5,$=Math.ceil(Math.max(...p)/5)*5||5,v=t=>i.i+(t-m)/(f-m)*(d-i.i-i.d),u=t=>s-i.b-(t-x)/($-x||1)*(s-i.a-i.b),w=Math.max(5,Math.ceil(($-x)/5/5)*5),b=[7,14,28,56,91,182].find(t=>(f-m)/t<=6)||365;let y="";for(let t=x;t<=$;t+=w)y+=`<line x1="${i.i}" x2="${d-i.d}" y1="${u(t)}" y2="${u(t)}" stroke="currentColor" stroke-opacity="0.12"/><text x="${i.i-6}" y="${u(t)+4}" text-anchor="end" font-size="12" fill="currentColor" opacity="0.75">${t}</text>`;for(let t=Math.ceil(m/b)*b;t<=f;t+=b)y+=`<text x="${v(t)}" y="${s-i.b+16}" text-anchor="middle" font-size="12" fill="currentColor" opacity="0.75">${t}</text>`;y+=`<text x="${(i.i+d-i.d)/2}" y="${s-6}" text-anchor="middle" font-size="12" fill="currentColor" opacity="0.8">${esc(l)}</text>`,y+=`<text x="12" y="${(i.a+s-i.b)/2}" text-anchor="middle" font-size="12" fill="currentColor" opacity="0.8" transform="rotate(-90 12 ${(i.a+s-i.b)/2})">Peso (kg)</text>`;const A=n.map(t=>`
    <polyline fill="none" stroke="${t.color}" stroke-width="2" stroke-linejoin="round" points="${t.puntos.map(o=>`${v(o[0]).toFixed(1)},${u(o[1]).toFixed(1)}`).join(" ")}"/>
    ${t.puntos.map(o=>`<circle cx="${v(o[0]).toFixed(1)}" cy="${u(o[1]).toFixed(1)}" r="2.2" fill="${t.color}"><title>${esc(t.nombre)} \xB7 d\xEDa ${o[0]} \xB7 ${o[1].toFixed(1)} kg</title></circle>`).join("")}`).join(""),e=n.map(t=>`<span style="display:inline-flex;align-items:center;gap:5px;margin:0 12px 4px 0;font-size:13px;"><span style="width:12px;height:12px;border-radius:3px;background:${t.color};"></span>${esc(t.nombre)}</span>`).join("");return`<svg viewBox="0 0 ${d} ${s}" style="width:100%;max-width:820px;height:auto;display:block;margin:0 auto;color:var(--texto);" role="img" aria-label="Curvas de crecimiento">${y}${A}</svg>
    <div style="margin:6px auto 0;max-width:820px;">${e}</div>`}function barrasGanancia(a){if(!a.length)return'<div class="empty">Todav\xEDa no hay pesajes suficientes.</div>';const l=Math.max(...a.map(n=>n.gdp));return a.map((n,r)=>`
    <div style="margin-top:10px;">
      <div class="row" style="justify-content:space-between;font-size:14px;">
        <span>${esc(n.nombre)} <span class="muted">(${n.n} animal${n.n===1?"":"es"})</span></span>
        <b style="color:var(--texto);">${n.gdp.toFixed(3)} kg/d\xEDa</b>
      </div>
      <div style="height:8px;border-radius:4px;background:var(--barra-track);margin-top:4px;overflow:hidden;">
        <div style="height:100%;width:${l>0?Math.max(0,n.gdp/l*100).toFixed(0):0}%;background:${n.color||COLORES_ANALITICA[r%COLORES_ANALITICA.length]};"></div>
      </div>
    </div>`).join("")}async function viewAnalitica(){const[{animales:a,pesajes:l,sinRed:n},r]=await Promise.all([mockApi.pesajesParaAnalitica(),mockApi.misLotes()]),d=a.filter(e=>e.estado==="vivo"),s=a.some(e=>e.fecha_nacimiento);s||(analiticaEje="inicio");const i=analiticaEje==="edad"?"Edad (d\xEDas)":"D\xEDas desde el primer pesaje",c=new Map(a.map(e=>[e.id,curvaAnimal(e,l,analiticaEje)])),p=new Map(a.map(e=>[e.id,gananciaDiaria(curvaAnimal(e,l,"inicio"))])),m=d.filter(e=>p.get(e.id)!=null).sort((e,t)=>p.get(t.id)-p.get(e.id)),f=await Promise.all(r.map(e=>mockApi.animalesDeLote(e.id).then(t=>[e,t]).catch(()=>[e,[]]))),x=new Map;f.forEach(([e,t])=>t.forEach(o=>x.set(o.id,e.nombre)));let $;analiticaComparar==="lotes"?$=f.filter(([,e])=>e.length).map(([e,t],o)=>({nombre:e.nombre,color:COLORES_ANALITICA[o%COLORES_ANALITICA.length],puntos:curvaPromedio(t.map(h=>c.get(h.id)||[]).filter(h=>h.length))})):(analiticaSeleccion||(analiticaSeleccion=new Set(m.slice(0,5).map(e=>e.id))),$=a.filter(e=>analiticaSeleccion.has(e.id)).map((e,t)=>({nombre:etiquetaAnimal(e),color:COLORES_ANALITICA[t%COLORES_ANALITICA.length],puntos:c.get(e.id)||[]})));const v=f.filter(([,e])=>e.length).map(([e,t],o)=>{const h=t.map(g=>p.get(g.id)).filter(g=>g!=null);return{nombre:e.nombre,n:h.length,color:COLORES_ANALITICA[o%COLORES_ANALITICA.length],gdp:h.length?h.reduce((g,M)=>g+M,0)/h.length:null}}).filter(e=>e.gdp!=null).sort((e,t)=>t.gdp-e.gdp),u=new Map;a.forEach(e=>["padre_id","madre_id"].forEach(t=>{e[t]!=null&&(u.has(e[t])||u.set(e[t],[]),u.get(e[t]).push(e))}));const w=[...u.entries()].map(([e,t])=>{const o=a.find(g=>g.id===e),h=t.map(g=>p.get(g.id)).filter(g=>g!=null);return o&&{animal:o,crias:t.length,gdp:h.length?h.reduce((g,M)=>g+M,0)/h.length:null}}).filter(Boolean).sort((e,t)=>(t.gdp??-1)-(e.gdp??-1)||t.crias-e.crias).slice(0,8),b=(e,t)=>{const o=curvaAnimal(e,l,"inicio");return`<tr>
      <td>${t+1}</td><td><b>${esc(etiquetaAnimal(e))}</b><div class="small muted">${esc(x.get(e.id)||"Sin lote")}</div></td>
      <td style="text-align:right;"><b>${p.get(e.id).toFixed(3)}</b></td>
      <td style="text-align:right;" class="small">${o[0][1].toFixed(1)} \u2192 ${o[o.length-1][1].toFixed(1)} kg<div class="muted">${o[o.length-1][0]} d\xEDas</div></td>
    </tr>`},y=[["lotes|inicio","Por lote \xB7 d\xEDas desde el 1.er pesaje"],["lotes|edad","Por lote \xB7 edad (d\xEDas)"],["animales|inicio","Por animal \xB7 d\xEDas desde el 1.er pesaje"],["animales|edad","Por animal \xB7 edad (d\xEDas)"]],A=`${analiticaComparar}|${analiticaEje}`;return`
    <h3 class="section-title" style="margin-bottom:6px;">Anal\xEDtica</h3>
    ${n?'<p class="small muted" style="margin-bottom:10px;">\u{1F4F4} Sin se\xF1al: se usan los pesajes guardados en este celular.</p>':""}

    <div class="card">
      <div class="form-section-title" style="margin-top:0;">Curvas de crecimiento</div>
      <select id="analiticaTipoCurva" style="margin-top:8px;max-width:420px;">
        ${y.map(([e,t])=>{const o=e.endsWith("|edad")&&!s;return`<option value="${e}" ${e===A?"selected":""} ${o?"disabled":""}>${t}${o?" \u2014 falta fecha de nacimiento":""}</option>`}).join("")}
      </select>
      ${analiticaComparar==="animales"?`
        <details style="margin-top:10px;" ${analiticaElegirAbierto?"open":""}>
          <summary class="small" style="cursor:pointer;">Elegir animales (${analiticaSeleccion.size} de ${a.length})</summary>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;max-height:200px;overflow:auto;">
            ${m.concat(a.filter(e=>!m.includes(e))).map(e=>`
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
      ${m.length?`<table style="width:100%;border-collapse:collapse;margin-top:8px;font-size:14px;">
        <tr class="small muted"><th style="text-align:left;">#</th><th style="text-align:left;">Animal</th><th style="text-align:right;">kg/d\xEDa</th><th style="text-align:right;">Peso</th></tr>
        ${m.slice(0,10).map(b).join("")}
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
    </div>`}function bindAnalitica(){const a=document.getElementById("app"),l=document.getElementById("analiticaTipoCurva");l&&(l.onchange=()=>{[analiticaComparar,analiticaEje]=l.value.split("|"),renderApp()}),a.querySelectorAll("[data-analitica-animal]").forEach(n=>n.onchange=()=>{const r=/^\d+$/.test(n.dataset.analiticaAnimal)?Number(n.dataset.analiticaAnimal):n.dataset.analiticaAnimal;n.checked?analiticaSeleccion.add(r):analiticaSeleccion.delete(r),analiticaElegirAbierto=!0,renderApp()})}
