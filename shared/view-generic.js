let activeTab=null;async function renderApp(){const a=mockApi.sesionActual();if(!a){redirigirSeguro("../index.html");return}const t=document.getElementById("app"),e=++_turnoRender;let o;try{o=rolPermitidoEnApp(a.rol)?await viewShell(a):viewAccesoRestringido(a)}catch(r){console.error("Error al pintar la pantalla:",r),toast(r.message||"No se pudo cargar esta pantalla \u2014 intenta de nuevo","\u26A0\uFE0F");return}if(e!==_turnoRender)return;const n=()=>{t.innerHTML=o,bindEvents()};transicionSegura(n)}function defaultTabFor(a){return a==="admin"?"resumen":"consulta"}let mostrarLimite={usuarios:20,clientes:20,auditoria:20},filtroUsuarios="todos";function tabsFor(a){return a==="admin"?[{id:"resumen",label:"Resumen"},{id:"mapa",label:"Mapa"},{id:"productividad",label:"Productividad"},{id:"monitoreo",label:"Monitoreo"},{id:"inventario",label:"Inventario de chips"},{id:"pedidos_ganaid",label:"Pedidos"},{id:"usuarios",label:"Usuarios"},{id:"clientes",label:"Clientes"},{id:"auditoria",label:"Auditor\xEDa"},{id:"consulta",label:"Consultar chip"}]:[{id:"consulta",label:"Consultar chip"}]}async function viewShell(a){activeTab||(activeTab=defaultTabFor(a.rol));const t=tabsFor(a.rol),e=a.rol==="admin"?"aprobada":"pendiente",o=await renderTab(activeTab,a);return`
  <div class="wrap wrap-ancho">
    <div class="app-layout">
      <aside class="sidebar">
        <div class="row" style="align-items:center;justify-content:space-between;">
          <div class="who">${emojiScope(APP_SCOPE)?emojiScope(APP_SCOPE)+" ":""}Sesi\xF3n: <b>${esc(a.nombre)}</b></div>
          ${iconoMenuUsuario()}
        </div>
        <span class="pill pill-${e}" style="width:fit-content;">${etiquetaRol(a.rol)}</span>
        <nav class="tabs">
          ${t.map(n=>`<div class="tab ${activeTab===n.id?"active":""}" data-tab="${n.id}">${n.label}</div>`).join("")}
        </nav>
      </aside>
      <main class="main-content">
        <div id="tabContent">${o}</div>
      </main>
    </div>
  </div>`}async function renderTab(a,t){switch(a){case"resumen":return viewResumen();case"mapa":return viewMapa();case"productividad":return viewProductividad();case"monitoreo":return viewMonitoreo();case"inventario":return viewInventario(t);case"pedidos_ganaid":return viewPedidosGanaID();case"usuarios":return viewUsuarios(t);case"clientes":return viewClientes();case"auditoria":return viewAuditoria();case"consulta":return`<div class="card"><h3>\u{1F50E} Verificar un chip</h3>${blockConsultarChip("tab",{autoFocoEscaner:!0})}</div>`;default:return""}}async function datosResumenAdmin(){const[a,t,e,o]=await Promise.all([supabaseClient.from("animales").select("estado, raza, sexo, fecha_nacimiento"),supabaseClient.from("perfiles").select("rol, activo, municipio"),supabaseClient.from("inventario_chips").select("estado"),supabaseClient.from("lotes_chips").select("id")]);for(const n of[a,t,e,o])if(n.error)throw new Error(n.error.message);return{animales:a.data,perfiles:t.data,inventarioChips:e.data,lotesChips:o.data}}async function viewResumen(){const{animales:a,perfiles:t,inventarioChips:e,lotesChips:o}=await datosResumenAdmin(),n={vivo:0,vendido:0,sacrificado:0,baja:0};a.forEach(d=>{n[d.estado]=(n[d.estado]||0)+1});const r={};a.forEach(d=>{const f=d.raza||"Sin especificar";r[f]=(r[f]||0)+1});const l=Object.entries(r).sort((d,f)=>f[1]-d[1]).slice(0,6),p=l.length?l[0][1]:1,c=a.filter(d=>d.estado==="vivo"),m={Lech\u00F3n:0,Lechona:0,Crecimiento:0,Primeriza:0,Verraco:0,Cerda:0,"Sin clasificar":0};let v=0,g=0;c.forEach(d=>{m[categoriaPorcina(d.sexo,d.fecha_nacimiento)]++,d.sexo==="macho"?v++:d.sexo==="hembra"&&g++});const s=Object.entries(m).filter(([,d])=>d>0),i=s.length?Math.max(...s.map(([,d])=>d)):1,u=t.filter(d=>d.rol==="ganadero"&&d.activo!==!1),h={};u.forEach(d=>{const f=d.municipio||"Sin especificar";h[f]=(h[f]||0)+1});const b=Object.entries(h).sort((d,f)=>f[1]-d[1]),x=u.length,$=e.filter(d=>d.estado==="en_stock").length,_=e.filter(d=>d.estado==="asignado").length,y=(d,f,w)=>`
    <div class="card" style="flex:1;min-width:130px;text-align:center;">
      <div style="font-size:1.5rem;font-weight:900;color:${w};">${f}</div>
      <div class="small muted" style="margin-top:4px;">${d}</div>
    </div>`;return`
    <div class="row" style="gap:10px;column-span:all;">
      ${y("Animales vivos",n.vivo,"var(--verde)")}
      ${y("Ganaderos",x,"var(--dorado)")}
      ${y("Chips en stock",$,"var(--dorado)")}
    </div>
    <div class="card">
      <h3>Inventario de chips</h3>
      <p class="small muted" style="margin-top:8px;">
        En stock: <b style="color:var(--texto);">${$}</b> \xB7
        Asignados: <b style="color:var(--texto);">${_}</b> \xB7
        Lotes cargados: <b style="color:var(--texto);">${o.length}</b>
      </p>
    </div>
    <div class="card">
      <h3>Animales por raza</h3>
      ${l.length?l.map(([d,f])=>`
        <div style="margin-top:10px;">
          <div class="row" style="justify-content:space-between;font-size:14px;"><span>${esc(d)}</span><b style="color:var(--texto);">${f}</b></div>
          <div style="height:8px;border-radius:4px;background:var(--barra-track);margin-top:4px;overflow:hidden;">
            <div style="height:100%;width:${(f/p*100).toFixed(0)}%;background:var(--dorado);"></div>
          </div>
        </div>`).join(""):'<div class="empty">Todav\xEDa no hay animales identificados.</div>'}
    </div>
    <div class="card">
      <h3>Animales por categor\xEDa</h3>
      <p class="small muted" style="margin-top:2px;margin-bottom:8px;">Sobre los ${c.length} animales vivos \u2014 en general: ${v} macho${v===1?"":"s"} \xB7 ${g} hembra${g===1?"":"s"}.</p>
      ${s.length?s.map(([d,f])=>`
        <div style="margin-top:10px;">
          <div class="row" style="justify-content:space-between;font-size:14px;"><span>${d}</span><b style="color:var(--texto);">${f}</b></div>
          <div style="height:8px;border-radius:4px;background:var(--barra-track);margin-top:4px;overflow:hidden;">
            <div style="height:100%;width:${(f/i*100).toFixed(0)}%;background:var(--dorado);"></div>
          </div>
        </div>`).join(""):'<div class="empty">Todav\xEDa no hay animales vivos identificados.</div>'}
    </div>
    <div class="card">
      <h3>\u{1F5FA}\uFE0F Usuarios por municipio</h3>
      ${bloqueTablaBuscable({inputId:"buscarMunicipioResumen",cuerpoId:"cuerpoMunicipioResumen",sinResultadosId:"sinResultadosMunicipio",columnas:["Municipio","Ganaderos"],placeholder:"Buscar municipio\u2026",vacio:"Todav\xEDa no hay ganaderos registrados con municipio.",filas:b.map(([d,f])=>`
          <tr data-buscar="${d.toLowerCase()}" data-ver-municipio="${d}" style="cursor:pointer;">
            <td>${d}</td>
            <td style="text-align:right;font-weight:800;">${f}</td>
          </tr>`).join("")})}
    </div>
    <div class="card">
      <h3>Estado de los animales</h3>
      <div class="row" style="gap:8px;flex-wrap:wrap;margin-top:10px;">
        <span class="pill pill-vivo">Vivos: ${n.vivo}</span>
        <span class="pill pill-aprobada">Vendidos: ${n.vendido}</span>
        <span class="pill pill-asignado">Sacrificados: ${n.sacrificado}</span>
        <span class="pill pill-baja">Baja: ${n.baja}</span>
      </div>
    </div>
    <div class="card">
      <h3>\u{1F4CA} Respaldo</h3>
      <button class="btn btn-primary btn-block" id="btnExportarRespaldo" type="button" style="margin-top:8px;">\u2B07\uFE0F Exportar toda la informaci\xF3n (Excel)</button>
    </div>
  `}async function datosMapaAdmin(){const{data:a,error:t}=await supabaseClient.from("perfiles").select("rol, activo, municipio");if(t)throw new Error(t.message);const e={};return a.filter(o=>o.rol==="ganadero"&&o.activo!==!1&&o.municipio).forEach(o=>{e[o.municipio]=(e[o.municipio]||0)+1}),{ganaderosPorMunicipio:e}}let _leafletPromise=null;function cargarLeaflet(){return typeof L<"u"?Promise.resolve():_leafletPromise||(_leafletPromise=new Promise((a,t)=>{const e=document.createElement("link");e.rel="stylesheet",e.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",document.head.appendChild(e);const o=document.createElement("style");o.textContent=`
      .leaflet-control-layers{ font-size:11.5px; }
      .leaflet-control-layers-expanded{ padding:6px 10px 6px 8px; }
      .leaflet-control-layers-list label{ margin-bottom:3px; }
      .leaflet-control-layers-toggle{ width:30px; height:30px; }
    `,document.head.appendChild(o);const n=document.createElement("script");n.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",n.onload=a,n.onerror=()=>{_leafletPromise=null,t(new Error("No se pudo cargar la librer\xEDa del mapa"))},document.head.appendChild(n)}),_leafletPromise)}async function coordenadasMunicipio(a){const t="coords_municipio_"+a,e=localStorage.getItem(t);if(e)try{return JSON.parse(e)}catch{}try{const o=typeof estadoDeLaSesion=="function"&&estadoDeLaSesion()||"",n=[a,o,"M\xE9xico"].filter(Boolean).join(", "),r=`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(n)}`,l=await fetch(r,{headers:{"Accept-Language":"es"}});if(!l.ok)return null;const p=await l.json();if(!p.length)return null;const c=[parseFloat(p[0].lat),parseFloat(p[0].lon)];return localStorage.setItem(t,JSON.stringify(c)),c}catch{return null}}let _mapaAdminInstance=null;async function iniciarMapaAdmin(){const a=document.getElementById("mapaAdministracion");if(!a)return;let t;try{({ganaderosPorMunicipio:t}=await datosMapaAdmin())}catch(m){a.innerHTML=`<p class="small muted">${esc(m.message)}</p>`;return}const e=Object.keys(t);if(!e.length){a.innerHTML='<div class="empty">Todav\xEDa no hay ganaderos con municipio cargado.</div>';return}try{await cargarLeaflet()}catch(m){a.innerHTML=`<p class="small muted">${esc(m.message)}</p>`;return}a.innerHTML=`<p class="small muted" style="padding:12px;">Ubicando ${e.length} municipio${e.length===1?"":"s"}\u2026</p>`;const o=[];for(const m of e){const v=await coordenadasMunicipio(m);v&&o.push({municipio:m,coords:v,ganaderos:t[m]||0})}const n=document.createElement("div");n.className="mapa-leyenda",n.innerHTML=`
    <label class="mapa-leyenda-item">
      <input type="checkbox" id="capaGanaderosToggle" checked>
      <img src="../animales.png?v=3" alt="" style="width:15px;height:15px;">
      <span>Ganaderos por municipio</span>
    </label>
  `;const r=document.createElement("div");if(r.id="mapaAdministracionLeaflet",r.style.cssText="height:min(75vh,760px);border-radius:12px;overflow:hidden;",a.innerHTML="",a.style.position="relative",a.appendChild(r),a.appendChild(n),!o.length){a.innerHTML='<p class="small muted">No se pudo ubicar ning\xFAn municipio \u2014 revisa la conexi\xF3n e intenta de nuevo entrando a esta pesta\xF1a otra vez.</p>';return}_mapaAdminInstance&&(_mapaAdminInstance.remove(),_mapaAdminInstance=null);const l=L.map(r.id);_mapaAdminInstance=l,L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',maxZoom:18}).addTo(l);const p=Math.max(1,...o.map(m=>m.ganaderos)),c=L.layerGroup();o.forEach(m=>{m.ganaderos&&L.circleMarker(m.coords,{radius:5+m.ganaderos/p*13,color:"#0F2A4A",weight:1,opacity:.55,fillColor:"#0F2A4A",fillOpacity:.22}).bindPopup(`<b>${esc(m.municipio)}</b><br>${m.ganaderos} ganadero${m.ganaderos===1?"":"s"}`).addTo(c)}),c.addTo(l),document.getElementById("capaGanaderosToggle").onchange=m=>{m.target.checked?c.addTo(l):l.removeLayer(c)},l.fitBounds(L.latLngBounds(o.map(m=>m.coords)),{padding:[24,24]})}async function viewMapa(){return`
    <div class="card" style="column-span:all;">
      <h3>Mapa</h3>
      <p class="small muted" style="margin-top:4px;">Ganaderos activos, ubicados por municipio.</p>
      <div id="mapaAdministracion" style="margin-top:10px;">
        <p class="small muted" style="padding:12px;">Cargando mapa\u2026</p>
      </div>
    </div>`}function barraProductividad(a,t){return a.length?a.map(e=>`
    <div style="margin-top:10px;">
      <div class="row" style="justify-content:space-between;font-size:14px;">
        <span>${esc(e.etiqueta)} <span class="muted">(${e.animales} animal${e.animales===1?"":"es"})</span></span>
        <b style="color:var(--texto);">${e.gdp_promedio} kg/d\xEDa</b>
      </div>
      <div style="height:8px;border-radius:4px;background:var(--barra-track);margin-top:4px;overflow:hidden;">
        <div style="height:100%;width:${t>0?(e.gdp_promedio/t*100).toFixed(0):0}%;background:var(--dorado);"></div>
      </div>
    </div>`).join(""):'<div class="empty">Todav\xEDa no hay suficientes pesajes cargados para calcular esto.</div>'}async function viewProductividad(){let a;try{a=await mockApi.benchmarkProductividad()}catch(o){return`<div class="card"><p class="small muted">${esc(o.message)}</p></div>`}const t=a.por_raza.length?Math.max(...a.por_raza.map(o=>o.gdp_promedio)):0,e=a.por_municipio.length?Math.max(...a.por_municipio.map(o=>o.gdp_promedio)):0;return`
    <div class="card">
      <h3>Productividad</h3>
      <p class="small muted" style="margin-top:4px;">Ganancia diaria promedio (GDP, kg/d\xEDa) de los animales identificados.</p>
    </div>
    <div class="card">
      <h3>Por raza</h3>
      ${barraProductividad(a.por_raza,t)}
    </div>
    <div class="card">
      <h3>Por municipio</h3>
      ${barraProductividad(a.por_municipio,e)}
    </div>
  `}async function exportarRespaldoExcel(){let a;try{a=await mockApi.datosRespaldoCompleto()}catch(e){toast(e.message,"\u26A0\uFE0F");return}if(Object.values(a).every(e=>!e.length)){toast("Todav\xEDa no hay informaci\xF3n guardada para exportar","\u26A0\uFE0F");return}typeof XLSX>"u"&&toast("Preparando el Excel\u2026","\u23F3");try{await cargarSheetJS()}catch(e){toast(e.message+" \u2014 revisa la conexi\xF3n","\u26A0\uFE0F");return}const t=armarLibroExcel(a,[["animales","Animales"],["pesajes","Pesajes"],["sanidad","Sanidad"],["reproduccion","Reproducci\xF3n"],["otros_eventos","Altas, traslados y bajas"],["sacrificios","Sacrificios"],["guias_movilizacion","Gu\xEDas de movilizaci\xF3n"],["usuarios","Usuarios"],["inventario_chips","Inventario de chips"],["lotes_chips","Lotes de chips"]]);XLSX.writeFile(t,`respaldo-completo-${new Date().toISOString().slice(0,10)}.xlsx`),toast("Excel descargado","\u2B07\uFE0F")}function botonCargarMas(a,t,e){return e>=t?"":`<button class="btn btn-ghost btn-block" data-cargar-mas="${a}">Cargar m\xE1s (${t-e} restantes)</button>`}async function mapaNombresPerfiles(){const{data:a,error:t}=await supabaseClient.from("perfiles").select("id, nombre");if(t)throw new Error(t.message);return new Map(a.map(e=>[e.id,e.nombre]))}let monitoreoQueryActual="";function viewMonitoreo(){return`
    <div class="card">
      <h3>\u{1F50E} Monitoreo</h3>
      <p class="small muted" style="margin-top:4px;">Busca un animal por chip o N\xB0 interno \u2014 o escanea el chip con el lector \u2014 y mira su historia completa: altas, traslados, sanidad y evoluci\xF3n de peso.</p>
      <div class="row" style="margin-top:8px;">
        <input id="monitoreoInput" placeholder="Chip o N\xB0 interno \u2014 o escanea con el lector" style="flex:1;">
        <button class="btn btn-primary" id="btnBuscarMonitoreo">Buscar</button>
      </div>
    </div>
    <div id="resultadoMonitoreo"></div>
  `}async function renderResultadoMonitoreo(a,t){if(!a)return`<div class="card" style="border-color:var(--red-card-border);">
      <span class="pill pill-rechazada">\u26A0\uFE0F No encontrado</span>
      <p class="small" style="margin-top:8px;">Ning\xFAn animal identificado tiene "${esc(t)}" como chip o N\xB0 interno.</p>
    </div>`;const{animal:e,due\u00F1o:o,eventos:n}=a,r=(i,u)=>u?`<p class="small muted" style="margin-top:4px;">${i}: <b style="color:var(--texto);">${esc(u)}</b></p>`:"",l=n.filter(i=>i.tipo==="pesaje").slice().reverse(),p=l.length?Math.max(...l.map(i=>i.peso_kg)):1,c=retiroActivoHoy(n),v=mockApi.sesionActual()?.rol==="admin";let g=null,s=[];if(v)try{[g,s]=await Promise.all([mockApi.historialAdministrativo(e.id),mockApi.listarRastros()])}catch(i){toast(i.message,"\u26A0\uFE0F")}return`
    <div class="card">
      <div class="row" style="justify-content:space-between;align-items:center;">
        <h3>${esc(etiquetaAnimal(e))} \u2014 ${esc(e.raza)||"Raza no especificada"}</h3>
        <span class="pill pill-${e.estado}">${etiquetaEstadoAnimal(e.estado)}</span>
      </div>
      ${r("Chip",e.chip_uid)}
      ${r("Sexo",e.sexo==="macho"?"Macho":"Hembra")}
      ${r("Categor\xEDa",categoriaPorcina(e.sexo,e.fecha_nacimiento))}
      ${r("Due\xF1o actual",o?`${o.nombre}${o.municipio?" \xB7 "+o.municipio:""}`:null)}
      ${r("Tel\xE9fono",o?o.telefono:null)}
    </div>
    ${c?`
    <div class="card" style="border-color:var(--red-card-border);background:var(--red-soft-bg);">
      <b style="color:var(--red);">\u26A0\uFE0F En per\xEDodo de retiro hasta ${c.retiro_hasta}</b>
      <p class="small muted" style="margin-top:4px;">No deber\xEDa venderse ni sacrificarse todav\xEDa \u2014 ${esc(c.descripcion)}${c.producto?" ("+esc(c.producto)+")":""}.</p>
    </div>`:""}
    <div class="card">
      <h3>\u2696\uFE0F Peso</h3>
      ${r("Al nacer",e.peso_nacimiento_kg?e.peso_nacimiento_kg+" kg":null)}
      ${l.length?l.map(i=>`
        <div style="margin-top:10px;">
          <div class="row" style="justify-content:space-between;font-size:14px;"><span>${fmtFechaEvento(i.fecha)}${i.condicion_corporal?" \xB7 "+etiquetaCondicionCorporal(i.condicion_corporal):""}</span><b style="color:var(--texto);">${i.peso_kg} kg</b></div>
          <div style="height:8px;border-radius:4px;background:var(--barra-track);margin-top:4px;overflow:hidden;">
            <div style="height:100%;width:${(i.peso_kg/p*100).toFixed(0)}%;background:var(--dorado);"></div>
          </div>
        </div>`).join(""):'<p class="small muted" style="margin-top:8px;">Todav\xEDa no hay pesajes cargados.</p>'}
    </div>
    <div class="card">
      <h3>\u{1F4DC} Historial</h3>
      <p class="small muted" style="margin-top:2px;margin-bottom:8px;">Sanidad y pesajes los carga el propio ganadero desde su app \u2014 aqu\xED solo se consultan.</p>
      ${n.length?n.map(i=>`
        <p class="small muted" style="margin-top:4px;">${fmtFechaEvento(i.fecha)} \u2014 <b style="color:var(--texto);">${etiquetaTipoEvento(i.tipo)}</b>${i.tipo==="pesaje"?` (${i.peso_kg} kg${i.condicion_corporal?", "+etiquetaCondicionCorporal(i.condicion_corporal):""})`:""}${i.tipo==="sanidad"&&i.descripcion?` (${esc(i.descripcion)}${i.producto?" \xB7 "+esc(i.producto):""}${i.lote_producto?" \xB7 lote "+esc(i.lote_producto):""})`:""}${i.notas?` \xB7 ${esc(i.notas)}`:""}${i.retiro_hasta?` \xB7 retiro hasta ${i.retiro_hasta}`:""}</p>
      `).join(""):'<div class="empty">Todav\xEDa no hay eventos registrados.</div>'}
    </div>
    ${v&&g?`
    <div class="card">
      <h3>\u{1F969} Sacrificio</h3>
      ${g.sacrificio?`
        ${r("Fecha",fmtFechaEvento(g.sacrificio.fecha))}
        ${r("Rastro",g.sacrificio.rastro+(g.sacrificio.numero_tif?` (TIF ${g.sacrificio.numero_tif})`:""))}
        ${r("Folio oficial",g.sacrificio.folio_oficial)}
        ${r("Peso en canal",g.sacrificio.peso_canal_kg?g.sacrificio.peso_canal_kg+" kg":null)}
      `:e.estado==="sacrificado"?'<p class="small muted" style="margin-top:4px;">Marcado como sacrificado, sin detalle de rastro cargado.</p>':`
      <form id="formSacrificioMonitoreo" style="margin-top:8px;">
        <label>Rastro</label>
        <select name="rastro_id">
          <option value="">Elegir uno ya cargado\u2026</option>
          ${s.map(i=>`<option value="${i.id}">${esc(i.nombre)}${i.numero_tif?" (TIF "+esc(i.numero_tif)+")":""}</option>`).join("")}
        </select>
        <div class="form-section-title" style="font-size:12.5px;">o carga uno nuevo</div>
        <div class="row" style="gap:8px;margin-top:8px;">
          <input name="rastro_nombre" placeholder="Nombre del rastro" style="flex:2;">
          <input name="rastro_tif" placeholder="N\xB0 TIF (opcional)" style="flex:1;">
        </div>
        <div class="row" style="gap:8px;margin-top:9px;">
          <input name="folio_oficial" placeholder="Folio oficial (opcional)" style="flex:1;">
          <input name="peso_canal_kg" type="number" step="0.1" min="0" placeholder="Peso en canal (kg)" style="flex:1;">
        </div>
        <button class="btn btn-primary btn-block" type="submit" style="margin-top:8px;">Registrar sacrificio</button>
      </form>`}
    </div>
    <div class="card">
      <h3>\u{1F69A} Gu\xEDa de movilizaci\xF3n</h3>
      ${g.guias.length?g.guias.map(i=>`
        <p class="small muted" style="margin-top:4px;">${fmtFechaEvento(i.fecha)} \u2014 <b style="color:var(--texto);">${esc(i.folio)}</b>: ${esc(i.origen)} \u2192 ${esc(i.destino)}${i.transportista?" \xB7 "+esc(i.transportista):""}${i.motivo?" \xB7 "+esc(i.motivo):""}</p>
      `).join(""):'<p class="small muted" style="margin-top:4px;">Sin gu\xEDas emitidas.</p>'}
      ${e.estado==="vivo"||e.estado==="vendido"?`
      <form id="formGuiaMonitoreo" style="margin-top:12px;">
        <div class="row" style="gap:8px;">
          <input name="origen" placeholder="Origen${e.ubicacion_actual?" ("+esc(e.ubicacion_actual)+")":""}" style="flex:1;">
          <input name="destino" required placeholder="Destino" style="flex:1;">
        </div>
        <div class="row" style="gap:8px;margin-top:9px;">
          <input name="transportista" placeholder="Transportista (opcional)" style="flex:1;">
          <input name="folio" placeholder="N\xB0 de folio (opcional)" style="flex:1;">
        </div>
        <input name="motivo" placeholder="Motivo (opcional)" style="margin-top:9px;">
        <button class="btn btn-primary btn-block" type="submit" style="margin-top:8px;">Emitir gu\xEDa</button>
      </form>`:""}
    </div>
    `:""}
  `}function bindAccionesMonitoreoStaff(a){const t=document.getElementById("formSacrificioMonitoreo");t&&(t.onsubmit=async o=>{o.preventDefault();const n=new FormData(t);try{let r=n.get("rastro_id")?Number(n.get("rastro_id")):null;const l=n.get("rastro_nombre").trim();if(l&&(r=(await mockApi.crearRastro({nombre:l,numero_tif:n.get("rastro_tif").trim()||null})).id),!r)throw new Error("Elige un rastro ya cargado o completa el nombre de uno nuevo");await mockApi.registrarSacrificio({animal_id:a,rastro_id:r,folio_oficial:n.get("folio_oficial").trim()||null,peso_canal_kg:n.get("peso_canal_kg")||null}),toast("Sacrificio registrado","\u{1F969}"),ejecutarBusquedaMonitoreo()}catch(r){toast(r.message,"\u26A0\uFE0F")}});const e=document.getElementById("formGuiaMonitoreo");e&&(e.onsubmit=async o=>{o.preventDefault();const n=new FormData(e);try{await mockApi.registrarGuiaMovilizacion({animal_id:a,destino:n.get("destino").trim(),origen:n.get("origen").trim()||null,transportista:n.get("transportista").trim()||null,folio:n.get("folio").trim()||null,motivo:n.get("motivo").trim()||null}),toast("Gu\xEDa emitida","\u{1F69A}"),ejecutarBusquedaMonitoreo()}catch(r){toast(r.message,"\u26A0\uFE0F")}})}async function ejecutarBusquedaMonitoreo(){const a=document.getElementById("monitoreoInput"),t=document.getElementById("resultadoMonitoreo");if(!a||!t)return;const e=a.value.trim();if(!e){t.innerHTML="";return}let o;try{o=await mockApi.buscarAnimalMonitoreo(e)}catch(n){toast(n.message,"\u26A0\uFE0F");return}monitoreoQueryActual=e,t.innerHTML=await renderResultadoMonitoreo(o,e),o&&bindAccionesMonitoreoStaff(o.animal.id)}function distribucionChipsPorLote(a){return a.lotes_chips.map(t=>{const e=a.inventario_chips.filter(o=>o.lote_id===t.id);return{lote:t,cantidad:e.length,enStock:e.filter(o=>o.estado==="en_stock").length,asignados:e.filter(o=>o.estado==="asignado").length}}).sort((t,e)=>e.cantidad-t.cantidad)}function distribucionChipsPorMunicipio(a){const t={};return a.animales.forEach(e=>{const o=a.perfiles.find(r=>r.id===e.propietario_actual_id),n=o&&o.municipio||"Sin especificar";t[n]=(t[n]||0)+1}),Object.entries(t).sort((e,o)=>o[1]-e[1])}function bloqueTablaBuscable({inputId:a,cuerpoId:t,sinResultadosId:e,columnas:o,filas:n,placeholder:r="Buscar\u2026",vacio:l="Todav\xEDa no hay datos para mostrar aqu\xED."}){return n.length?`
    <input id="${a}" placeholder="${r}" style="margin-top:10px;">
    <div class="tabla-scroll" style="margin-top:8px;">
      <table class="tabla-simple">
        <thead><tr>${o.map((p,c)=>`<th ${c>0?'style="text-align:right;"':""}>${p}</th>`).join("")}</tr></thead>
        <tbody id="${t}">${n}</tbody>
      </table>
    </div>
    <p id="${e}" class="small muted" style="display:none;margin-top:8px;text-align:center;">Sin resultados.</p>`:`<div class="empty">${l}</div>`}function chipsDelIntervalo(a,t){if(!a&&!t)return null;if(!a||!t)throw new Error('Para cargar por intervalo hay que completar "Desde" y "Hasta"');if(!/^\d+$/.test(a)||!/^\d+$/.test(t))throw new Error("El intervalo de chips debe ser num\xE9rico");const e=BigInt(a),o=BigInt(t);if(o<e)throw new Error('El chip "Hasta" no puede ser menor que el chip "Desde"');if(o-e+1n>5000n)throw new Error("El intervalo es demasiado grande (m\xE1ximo 5000 chips por lote)");const r=a.length,l=[];for(let p=e;p<=o;p++)l.push(p.toString().padStart(r,"0"));return l}async function viewInventario(a){const[t,e,o,n]=await Promise.all([supabaseClient.from("inventario_chips").select("*"),supabaseClient.from("lotes_chips").select("*"),supabaseClient.from("animales").select("id, propietario_actual_id"),supabaseClient.from("perfiles").select("id, municipio")]);for(const s of[t,e,o,n])if(s.error)throw new Error(s.error.message);const r={inventario_chips:t.data,lotes_chips:e.data,animales:o.data,perfiles:n.data},l=r.inventario_chips.filter(s=>s.estado==="en_stock").length,p=r.inventario_chips.filter(s=>s.estado==="asignado").length,c=r.inventario_chips.filter(s=>s.estado==="invalidado").length,m=distribucionChipsPorLote(r).map(({lote:s,cantidad:i,enStock:u,asignados:h})=>`
    <tr data-buscar="${esc((s.proveedor+" "+(s.numero_lote||"")).toLowerCase())}">
      <td>${esc(s.proveedor)}${s.numero_lote?` <span class="small muted">\xB7 ${esc(s.numero_lote)}</span>`:""}</td>
      <td style="text-align:right;">${i}</td>
      <td style="text-align:right;">${u}</td>
      <td style="text-align:right;font-weight:800;">${h}</td>
    </tr>`).join(""),v=distribucionChipsPorMunicipio(r).map(([s,i])=>`
    <tr data-buscar="${s.toLowerCase()}" data-ver-municipio="${s}" style="cursor:pointer;">
      <td>${s}</td>
      <td style="text-align:right;font-weight:800;">${i}</td>
    </tr>`).join(""),g=a.rol==="admin"?`
    <div class="card">
      <h3>Cargar lote nuevo</h3>
      <form id="formLote">
        <label>Proveedor</label>
        <input name="proveedor" required placeholder="p. ej. Datamars M\xE9xico">
        <label>N\xFAmero de lote</label>
        <input name="numero_lote" placeholder="Opcional">
        <label>Precio oficial por chip (MXN)</label>
        <input name="precio_oficial" type="number" step="0.01" required>
        <label>Intervalo de chips</label>
        <div class="row" style="gap:8px;">
          <input name="chip_inicial" placeholder="Desde \u2014 p. ej. 484000000000001" style="flex:1;">
          <input name="chip_final" placeholder="Hasta \u2014 p. ej. 484000000000050" style="flex:1;">
        </div>
        <label>N\xFAmeros de chip (uno por l\xEDnea)</label>
        <textarea name="chip_uids" placeholder="484000000000001&#10;484000000000002"></textarea>
        <button class="btn btn-primary btn-block" type="submit">Cargar lote</button>
      </form>
    </div>`:`
    <div class="card">
      <p class="small muted">Solo un admin puede cargar lotes nuevos de chips. Si hace falta stock, avisale a Administraci\xF3n.</p>
    </div>`;return`
    <div class="card">
      <div class="row" style="justify-content:space-around;text-align:center;">
        <div><b style="font-size:1.3rem;">${l}</b><div class="small muted">En stock</div></div>
        <div><b style="font-size:1.3rem;">${p}</b><div class="small muted">Asignados</div></div>
        ${c?`<div><b style="font-size:1.3rem;">${c}</b><div class="small muted">Invalidados</div></div>`:""}
        <div><b style="font-size:1.3rem;">${r.lotes_chips.length}</b><div class="small muted">Lotes cargados</div></div>
      </div>
    </div>
    <div class="card">
      <h3>\u{1F4E6} Distribuci\xF3n por lote</h3>
      <p class="small muted" style="margin-top:4px;">De qu\xE9 proveedor vino cada chip y cu\xE1ntos de ese lote ya se asignaron \u2014 clave para auditar si algo se est\xE1 revendiendo por fuera del canal oficial.</p>
      ${bloqueTablaBuscable({inputId:"buscarLoteInventario",cuerpoId:"cuerpoLoteInventario",sinResultadosId:"sinResultadosLoteInventario",columnas:["Proveedor / lote","Cargados","En stock","Asignados"],filas:m,placeholder:"Buscar proveedor o N\xB0 de lote\u2026",vacio:"Todav\xEDa no se carg\xF3 ning\xFAn lote de chips."})}
    </div>
    <div class="card">
      <h3>\u{1F5FA}\uFE0F Chips asignados por municipio</h3>
      ${bloqueTablaBuscable({inputId:"buscarMunicipioChips",cuerpoId:"cuerpoMunicipioChips",sinResultadosId:"sinResultadosMunicipioChips",columnas:["Municipio","Chips asignados"],filas:v,placeholder:"Buscar municipio\u2026",vacio:"Todav\xEDa no hay ning\xFAn chip asignado."})}
    </div>
    ${g}`}function tarjetaCuenta(a,t){const e=a.activo===!1,o=e?"baja":a.rol==="admin"?"aprobada":"pendiente",n=a.id===t.id,r=e?`<button class="btn btn-ghost" data-reactivar-btn="${a.id}" style="margin-top:8px;">\u267B\uFE0F Reactivar cuenta</button>`:n?"":`<button class="btn btn-danger" data-eliminar-btn="${a.id}" style="margin-top:8px;">\u{1F5D1}\uFE0F Eliminar cuenta</button>`;return`
    <div class="card" style="${e?"opacity:.6;":""}">
      <div class="row" style="justify-content:space-between;align-items:center;">
        <div><b>${esc(a.nombre)}</b>${n?' <span class="small muted">(t\xFA)</span>':""}<div class="small muted">${esc(a.rancho_o_empresa)||"\u2014"}${a.municipio?" \xB7 "+esc(a.municipio):""}</div></div>
        <span class="pill pill-${o}">${e?"Desactivada":etiquetaRol(a.rol)}</span>
      </div>
      ${e?"":`
      <div class="row" style="margin-top:10px;">
        <select data-promover-select="${a.id}" style="flex:1;">
          <option value="ganadero" ${a.rol==="ganadero"?"selected":""}>Ganadero</option>
          <option value="admin" ${a.rol==="admin"?"selected":""}>Admin</option>
        </select>
        <button class="btn btn-ghost" data-promover-btn="${a.id}">Guardar</button>
      </div>`}
      ${r}
    </div>`}async function viewPedidosGanaID(){const[a,t,e]=await Promise.all([mockApi.listarPedidosExternos(),mockApi.listarClientes(),mockApi.listarCodigosPromocionales()]),o=new Map(t.map(c=>[c.id,c.nombre])),n=a.filter(c=>c.estado==="pendiente"),r=a.filter(c=>c.estado!=="pendiente"),l=n.length?n.map(c=>tarjetaPedidoExterno(c,o)).join(""):'<div class="empty">No hay pedidos pendientes por resolver.</div>',p=r.length?`
    <details style="margin-top:14px;">
      <summary class="small muted" style="cursor:pointer;">Ver ${r.length} pedido${r.length===1?"":"s"} ya resuelto${r.length===1?"":"s"}</summary>
      <div style="margin-top:10px;">${r.map(c=>tarjetaPedidoExterno(c,o)).join("")}</div>
    </details>`:"";return bloqueCodigosPromocionales(e)+'<div class="form-section-title">Pedidos</div>'+l+p}function bloqueCodigosPromocionales(a){const t=a.filter(o=>o.activo),e=a.filter(o=>!o.activo);return`
    <div class="card">
      <h3 class="section-title">\u{1F39F}\uFE0F C\xF3digos de promoci\xF3n</h3>
      <form id="formCrearCodigoPromo" style="margin-top:8px;">
        <div class="row" style="gap:8px;">
          <input name="codigo" placeholder="C\xF3digo \u2014 p. ej. LANZAMIENTO2026" style="flex:2;text-transform:uppercase;" required>
          <select name="meses" style="flex:1;">
            <option value="3">3 meses</option>
            <option value="6" selected>6 meses</option>
            <option value="9">9 meses</option>
          </select>
        </div>
        <div class="row" style="gap:8px;margin-top:9px;">
          <input name="descripcion" placeholder="Descripci\xF3n (opcional)" style="flex:1;">
          <input name="max_usos" type="number" min="1" placeholder="Tope de usos (opcional)" style="flex:1;">
          <input name="vence" type="date" title="Vence (opcional)" style="flex:1;">
        </div>
        <button class="btn btn-primary btn-block" type="submit" style="margin-top:9px;">\u2795 Crear c\xF3digo</button>
      </form>
      ${t.length?`
      <div style="margin-top:14px;">
        ${t.map(tarjetaCodigoPromocional).join("")}
      </div>`:""}
      ${e.length?`
      <details style="margin-top:10px;">
        <summary class="small muted" style="cursor:pointer;">Ver ${e.length} c\xF3digo${e.length===1?"":"s"} desactivado${e.length===1?"":"s"}</summary>
        <div style="margin-top:10px;">${e.map(tarjetaCodigoPromocional).join("")}</div>
      </details>`:""}
    </div>`}function tarjetaCodigoPromocional(a){const t=a.max_usos?`${a.usos_actuales}/${a.max_usos} uso(s)`:`${a.usos_actuales} uso(s)`;return`
    <div class="card-flat" style="margin-top:8px;${a.activo?"":"opacity:.6;"}">
      <div class="row" style="justify-content:space-between;align-items:center;">
        <b>${esc(a.codigo)}</b>
        <span class="pill pill-${a.activo?"aprobada":"rechazada"}">${a.activo?"Activo":"Desactivado"}</span>
      </div>
      <div class="small muted" style="margin-top:2px;">${a.meses} mes(es) \xB7 ${t}${a.vence?" \xB7 vence "+fmtFecha(a.vence):""}</div>
      ${a.descripcion?`<div class="small muted">${esc(a.descripcion)}</div>`:""}
      ${a.activo?`<button class="btn btn-ghost" data-desactivar-codigo="${a.id}" style="margin-top:8px;padding:5px 10px;font-size:11px;">Desactivar</button>`:""}
    </div>`}function tarjetaPedidoExterno(a,t){const e=a.tipo==="chip_lote",o=a.estado==="pendiente",n=a.estado==="pendiente"?"pendiente":a.estado==="aplicado"?"aprobada":"rechazada",r=a.estado==="pendiente"?"Pendiente":a.estado==="aplicado"?"Aplicado":"Descartado",l=a.perfil_id?t.get(a.perfil_id)||"(cuenta sin nombre)":null;return`
    <div class="card">
      <div class="row" style="justify-content:space-between;align-items:center;">
        <b>${e?"\u{1F4E6} Lote de chips":"\u{1F4B3} Cr\xE9dito de suscripci\xF3n"}</b>
        <span class="pill pill-${n}">${r}</span>
      </div>
      <div class="small muted" style="margin-top:6px;">
        ${esc(a.comprador_nombre)||"(sin nombre)"} ${a.comprador_email?"\xB7 \u{1F4E7} "+esc(a.comprador_email):""}
      </div>
      <div class="small muted">
        ${e?`${a.cantidad||"?"} chip(s)`:`${a.meses||"?"} mes(es)`} \xB7 SKU: ${esc(a.sku)||"\u2014"} \xB7 Pago MP #${esc(a.mp_payment_id)}
      </div>
      <div class="small muted">${fmtFecha(a.created_at)}</div>
      ${o?"":`<div class="small muted" style="margin-top:4px;">${a.lote_id?`Vinculado al lote #${a.lote_id}`:l?`Aplicado a ${esc(l)}`:""}</div>`}

      ${o&&e?`
      <div class="row" style="margin-top:10px;">
        <input type="number" min="1" placeholder="ID del lote ya cargado (opcional)" data-pedido-lote="${a.id}" style="flex:1;">
        <button class="btn btn-ghost" data-pedido-aplicar-chip="${a.id}">Marcar aplicado</button>
        <button class="btn btn-ghost" data-pedido-descartar="${a.id}">Descartar</button>
      </div>
      <p class="small muted" style="margin-top:4px;">Primero carga el lote real en "Inventario de chips" (con los UID f\xEDsicos) \u2014 aqu\xED solo queda anotado cu\xE1l, si quieres.</p>
      `:""}

      ${o&&!e?`
      <div class="row" style="margin-top:10px;">
        ${a.perfil_id?`<button class="btn btn-ghost" style="flex:1;" data-pedido-aplicar-credito="${a.id}" data-pedido-credito-perfil="${a.perfil_id}">Aplicar a ${esc(l)}</button>`:`<input placeholder="Email del ganadero ya registrado" data-pedido-credito-email="${a.id}" style="flex:1;">
             <button class="btn btn-ghost" data-pedido-buscar-y-aplicar-credito="${a.id}">Aplicar cr\xE9dito</button>`}
        <button class="btn btn-ghost" data-pedido-descartar="${a.id}">Descartar</button>
      </div>
      `:""}
    </div>`}async function viewUsuarios(a){const t=await mockApi.listarUsuarios(),e=`
    <div class="card">
      <h3>Invitar una cuenta directo</h3>
      <form id="formCrearStaff">
        <label>Email</label>
        <input name="email" type="email" required placeholder="email@ejemplo.com">
        <label>Nombre (sugerido)</label>
        <input name="nombre" required placeholder="Nombre completo">
        <label>Rol</label>
        <select name="rol" required>
          <option value="ganadero">Ganadero</option>
          <option value="admin">Admin</option>
        </select>
        <label>Municipio</label>
        ${selectMunicipios("municipio")}
        <label>Rancho / empresa</label>
        <input name="rancho_o_empresa" placeholder="Opcional">
        <button class="btn btn-primary btn-block" type="submit">Invitar</button>
      </form>
    </div>`,o={todos:t.length,ganadero:0,admin:0};t.forEach(v=>{o[v.rol]=(o[v.rol]||0)+1});const r=`<div class="row" style="gap:6px;flex-wrap:wrap;margin:4px 0 10px;column-span:all;">${[["todos","Todos"],["ganadero","Ganaderos"],["admin","Admins"]].map(([v,g])=>`
    <button class="btn ${filtroUsuarios===v?"btn-primary":"btn-ghost"}" data-filtro-usuarios="${v}" style="padding:6px 12px;font-size:13.5px;">
      ${g} (${o[v]||0})
    </button>`).join("")}</div>`,l=filtroUsuarios==="todos"?t:t.filter(v=>v.rol===filtroUsuarios),p=l.slice(0,mostrarLimite.usuarios),c=p.map(v=>tarjetaCuenta(v,a)).join(""),m=filtroUsuarios==="todos"?'<div class="empty">Todav\xEDa no hay ninguna cuenta.</div>':`<div class="empty">No hay cuentas de ${etiquetaRol(filtroUsuarios).toLowerCase()}.</div>`;return e+r+(c||m)+botonCargarMas("usuarios",l.length,p.length)}async function viewClientes(){const a=await mockApi.listarClientes(),t=a.slice(0,mostrarLimite.clientes);return(t.map(tarjetaCliente).join("")||'<div class="empty">Todav\xEDa no hay ning\xFAn cliente registrado.</div>')+botonCargarMas("clientes",a.length,t.length)}function tarjetaCliente(a){const t=a.plan_estado==="al_dia",e=a.plan_tipo==="gratis"?"\u{1F331} Gratis":a.plan_tipo==="anual"?"\u{1F4B3} Anual":"\u{1F4B3} Mensual";return`
    <div class="card">
      <div class="row" style="justify-content:space-between;align-items:center;">
        <div>
          <b>${esc(a.nombre)}</b>${a.activo===!1?' <span class="small muted">(cuenta desactivada)</span>':""}
          <div class="small muted">${esc(a.rancho_o_empresa)||"\u2014"}</div>
        </div>
        <div style="text-align:right;">
          <span class="pill pill-${a.plan_tipo==="gratis"?"invalidado":t?"aprobada":"rechazada"}">${a.plan_tipo==="gratis"?e:t?"Al d\xEDa":"Vencido"}</span>
          ${a.plan_tipo!=="gratis"?`<div class="small muted" style="margin-top:2px;">${e}</div>`:""}
        </div>
      </div>
      <div class="small muted" style="margin-top:6px;">
        \u{1F4E7} ${esc(a.correo)||"\u2014"} ${a.telefono?"\xB7 \u{1F4F1} "+esc(a.telefono):""}
      </div>
      <div class="small muted">\u{1FAAA} ${a.total_chips} chip${a.total_chips===1?"":"s"} comprado${a.total_chips===1?"":"s"} \xB7 \u{1F3E1} ${a.total_ranchos} rancho${a.total_ranchos===1?"":"s"}</div>
      <div class="row" style="margin-top:10px;">
        <select data-plan-select="${a.id}" style="flex:1;">
          <option value="al_dia" ${t?"selected":""}>Al d\xEDa</option>
          <option value="vencido" ${t?"":"selected"}>Vencido</option>
        </select>
        <input type="date" data-plan-fecha="${a.id}" value="${a.fecha_proximo_pago||""}" title="Pr\xF3ximo pago" style="flex:1;">
        <button class="btn btn-ghost" data-plan-btn="${a.id}">Guardar</button>
      </div>
      <details style="margin-top:10px;">
        <summary class="small muted" style="cursor:pointer;">
          \u{1F4F4} ${a.chips_reservados} chip${a.chips_reservados===1?"":"s"} listo${a.chips_reservados===1?"":"s"} para usar sin se\xF1al
        </summary>
        <p class="small muted" style="margin-top:6px;">
          Reservale un lotecito de chips \u2014 su celular los descarga para poder identificar animales nuevos aunque no tenga se\xF1al en el momento.
        </p>
        <div class="row" style="margin-top:6px;">
          <input type="number" min="1" data-reservar-cantidad="${a.id}" placeholder="Cantidad" style="flex:1;">
          <button class="btn btn-ghost" data-reservar-btn="${a.id}">Reservar</button>
          ${a.chips_reservados>0?`<button class="btn btn-ghost" data-liberar-btn="${a.id}">Liberar todos</button>`:""}
        </div>
      </details>
    </div>`}function etiquetaAccionAuditoria(a){return{bootstrap_admin:"\u{1F464} Arranque de admin",crear_cuenta:"\u2795 Cuenta creada",promover_usuario:"\u{1F504} Rol actualizado",cargar_lote:"\u{1F4E6} Lote de chips cargado",registrar_animal_directo:"\u{1FAAA} Animal identificado",dar_de_baja_animal:"\u2620\uFE0F Animal dado de baja",eliminar_usuario:"\u{1F5D1}\uFE0F Cuenta eliminada",desactivar_usuario:"\u{1F6AB} Cuenta desactivada",reactivar_usuario:"\u267B\uFE0F Cuenta reactivada",actualizar_plan_cliente:"\u{1F4B3} Plan actualizado",reservar_chips:"\u{1F4F4} Chips reservados para uso sin se\xF1al",marcar_pedido_externo_aplicado:"\u{1F4E6} Pedido externo aplicado",descartar_pedido_externo:"\u{1F5D1}\uFE0F Pedido externo descartado",aplicar_credito_suscripcion:"\u{1F4B3} Cr\xE9dito de suscripci\xF3n aplicado",crear_codigo_promocional:"\u{1F39F}\uFE0F C\xF3digo de promoci\xF3n creado",desactivar_codigo_promocional:"\u{1F39F}\uFE0F C\xF3digo de promoci\xF3n desactivado",canjear_codigo_promocional:"\u{1F39F}\uFE0F C\xF3digo de promoci\xF3n canjeado"}[a]||a}let filtroFechaAuditoriaDesde="",filtroFechaAuditoriaHasta="";async function viewAuditoria(){const a=await mockApi.listarAuditoria();if(!a.length)return'<div class="empty">Todav\xEDa no hay actividad registrada.</div>';const e=`
    <div class="card">
      <h3>\u{1F4C5} Filtrar por fecha</h3>
      <div class="row" style="gap:8px;margin-top:8px;">
        <div style="flex:1;min-width:130px;">
          <label style="margin:0 0 4px;">Desde</label>
          <input type="date" id="filtroFechaAuditoriaDesde" value="${filtroFechaAuditoriaDesde}">
        </div>
        <div style="flex:1;min-width:130px;">
          <label style="margin:0 0 4px;">Hasta</label>
          <input type="date" id="filtroFechaAuditoriaHasta" value="${filtroFechaAuditoriaHasta}">
        </div>
      </div>
      ${filtroFechaAuditoriaDesde||filtroFechaAuditoriaHasta?'<button class="btn btn-ghost btn-block" id="btnLimpiarFiltroFechaAuditoria" type="button" style="margin-top:8px;">\u2715 Limpiar filtro</button>':""}
    </div>`,o=a.filter(l=>!filtroFechaAuditoriaDesde||l.created_at.slice(0,10)>=filtroFechaAuditoriaDesde).filter(l=>!filtroFechaAuditoriaHasta||l.created_at.slice(0,10)<=filtroFechaAuditoriaHasta);if(!o.length)return e+'<div class="empty">Nada registrado en ese rango de fechas.</div>';const n=o.slice(0,mostrarLimite.auditoria),r=n.map(l=>`
    <div class="card">
      <div class="row" style="justify-content:space-between;">
        <b>${etiquetaAccionAuditoria(l.accion)}</b>
        <span class="small muted">${fmtFecha(l.created_at)}</span>
      </div>
      <p class="small muted" style="margin-top:4px;">${esc(l.detalle)}</p>
      <p class="small muted" style="margin-top:2px;">Por: ${esc(l.actor_nombre)}</p>
    </div>`).join("");return e+r+botonCargarMas("auditoria",o.length,n.length)}async function abrirModalMunicipio(a){let t;try{t=await mockApi.resumenMunicipio(a)}catch(c){toast(c.message,"\u26A0\uFE0F");return}const e=c=>`
    <tr>
      <td>${esc(c.nombre)}</td>
      <td>${esc(c.rancho_o_empresa)||"\u2014"}</td>
      <td>${esc(c.telefono)||"\u2014"}</td>
    </tr>`,o=t.animales.porRaza.length?t.animales.porRaza[0][1]:1,n=([c,m])=>`
    <div style="margin-top:8px;">
      <div class="row" style="justify-content:space-between;font-size:13.5px;"><span>${esc(c)}</span><b>${m}</b></div>
      <div style="height:6px;border-radius:3px;background:var(--barra-track);margin-top:3px;overflow:hidden;">
        <div style="height:100%;width:${(m/o*100).toFixed(0)}%;background:var(--dorado);"></div>
      </div>
    </div>`,r=c=>etiquetaTipoEvento(c.subtipo),l=c=>`
    <div class="row" style="justify-content:space-between;margin-top:6px;">
      <span class="small">${r(c)} <span class="muted">\u2014 ${esc(c.detalle)}</span></span>
      <span class="small muted" style="white-space:nowrap;">${fmtFecha(c.fecha)}</span>
    </div>`,p=document.createElement("div");p.className="modal-backdrop",p.innerHTML=`
    <div class="modal" style="max-width:520px;">
      <div class="row" style="justify-content:space-between;align-items:center;">
        <h3 style="margin:0;">\u{1F5FA}\uFE0F ${esc(t.municipio)}</h3>
        <span class="pill pill-vivo">${t.ganaderos.length} ganadero${t.ganaderos.length===1?"":"s"}</span>
      </div>

      <div class="row" style="gap:8px;margin-top:12px;">
        <div class="card" style="flex:1;text-align:center;padding:10px;margin:0;"><b style="font-size:1.2rem;">${t.animales.total}</b><div class="small muted">Animales</div></div>
        <div class="card" style="flex:1;text-align:center;padding:10px;margin:0;"><b style="font-size:1.2rem;">${t.animales.porEstado.vivo||0}</b><div class="small muted">Vivos</div></div>
        <div class="card" style="flex:1;text-align:center;padding:10px;margin:0;"><b style="font-size:1.2rem;">${t.animales.porEstado.baja||0}</b><div class="small muted">Baja</div></div>
      </div>

      <div class="form-section-title">\u{1F464} Ganaderos</div>
      ${t.ganaderos.length?`
      <div class="tabla-scroll" style="max-height:160px;">
        <table class="tabla-simple">
          <thead><tr><th>Nombre</th><th>Rancho / empresa</th><th>Tel\xE9fono</th></tr></thead>
          <tbody>${t.ganaderos.map(e).join("")}</tbody>
        </table>
      </div>`:'<div class="empty">Sin ganaderos activos aqu\xED.</div>'}

      <div class="form-section-title">Animales por raza</div>
      ${t.animales.porRaza.length?t.animales.porRaza.map(n).join(""):'<div class="empty">Todav\xEDa no hay animales identificados.</div>'}

      <div class="form-section-title">\u{1F4CB} Movimientos recientes</div>
      ${t.movimientos.length?`<div style="max-height:180px;overflow-y:auto;">${t.movimientos.map(l).join("")}</div>`:'<div class="empty">Sin movimientos todav\xEDa.</div>'}

      <button class="btn btn-ghost btn-block" id="btnCerrarModalMunicipio" style="margin-top:14px;">Cerrar</button>
    </div>`,document.body.appendChild(p),document.getElementById("btnCerrarModalMunicipio").onclick=()=>p.remove(),p.addEventListener("click",c=>{c.target===p&&p.remove()})}function bindEvents(){const a=document.getElementById("app"),t=a.querySelector("[data-logout]");t&&(t.onclick=()=>{activeTab=null,filtroUsuarios="todos",filtroFechaAuditoriaDesde="",filtroFechaAuditoriaHasta="",mockApi.logout()}),bindInstalarApp(),bindIconoMenuUsuario();const e=document.getElementById("btnExportarRespaldo");e&&(e.onclick=exportarRespaldoExcel),a.querySelectorAll("[data-tab]").forEach(s=>s.onclick=()=>{activeTab=s.dataset.tab,renderApp()}),activeTab==="mapa"&&iniciarMapaAdmin(),a.querySelectorAll("[data-filtro-usuarios]").forEach(s=>s.onclick=()=>{filtroUsuarios=s.dataset.filtroUsuarios,mostrarLimite.usuarios=20,renderApp()});const o=document.getElementById("filtroFechaAuditoriaDesde");o&&(o.onchange=()=>{filtroFechaAuditoriaDesde=o.value,mostrarLimite.auditoria=20,renderApp()});const n=document.getElementById("filtroFechaAuditoriaHasta");n&&(n.onchange=()=>{filtroFechaAuditoriaHasta=n.value,mostrarLimite.auditoria=20,renderApp()});const r=document.getElementById("btnLimpiarFiltroFechaAuditoria");r&&(r.onclick=()=>{filtroFechaAuditoriaDesde="",filtroFechaAuditoriaHasta="",mostrarLimite.auditoria=20,renderApp()});function l(s,i,u){const h=document.getElementById(s);h&&(h.oninput=()=>{const b=h.value.trim().toLowerCase();let x=0;document.querySelectorAll(`#${i} tr`).forEach(_=>{const y=(_.dataset.buscar||"").includes(b);_.style.display=y?"":"none",y&&x++});const $=document.getElementById(u);$&&($.style.display=x===0?"":"none")})}l("buscarMunicipioResumen","cuerpoMunicipioResumen","sinResultadosMunicipio"),l("buscarLoteInventario","cuerpoLoteInventario","sinResultadosLoteInventario"),l("buscarMunicipioChips","cuerpoMunicipioChips","sinResultadosMunicipioChips"),a.querySelectorAll("[data-ver-municipio]").forEach(s=>s.onclick=()=>abrirModalMunicipio(s.dataset.verMunicipio)),bindConsultarChip(a);const p=document.getElementById("monitoreoInput");p&&(p.value=monitoreoQueryActual,p.focus(),p.onkeydown=s=>{s.key==="Enter"&&(s.preventDefault(),ejecutarBusquedaMonitoreo())},monitoreoQueryActual&&ejecutarBusquedaMonitoreo());const c=document.getElementById("btnBuscarMonitoreo");c&&(c.onclick=ejecutarBusquedaMonitoreo),a.querySelectorAll("[data-cargar-mas]").forEach(s=>s.onclick=()=>{mostrarLimite[s.dataset.cargarMas]+=20,renderApp()});const m=document.getElementById("formCrearStaff");m&&(m.onsubmit=async s=>{s.preventDefault();const i=new FormData(m);try{await mockApi.crearCuentaStaff({email:i.get("email").trim(),rol:i.get("rol"),nombre_sugerido:i.get("nombre").trim(),rancho_sugerido:i.get("rancho_o_empresa").trim(),municipio_sugerido:i.get("municipio")||null}),toast("Invitaci\xF3n enviada \u2014 queda pendiente hasta que se registre con ese email","\u2705"),m.reset(),renderApp()}catch(u){toast(u.message,"\u26A0\uFE0F")}});const v=document.getElementById("formLote");v&&(v.onsubmit=async s=>{s.preventDefault();const i=new FormData(v);try{const u=chipsDelIntervalo(i.get("chip_inicial").trim(),i.get("chip_final").trim())||(i.get("chip_uids")||"").split(`
`).map(b=>b.trim()).filter(Boolean),h=await mockApi.registrarLoteChips(i.get("proveedor").trim(),i.get("numero_lote").trim()||null,parseFloat(i.get("precio_oficial")),null,u);toast(`Lote cargado: ${h.chips_cargados} chips`,"\u{1F4E6}"),renderApp()}catch(u){toast(u.message,"\u26A0\uFE0F")}}),a.querySelectorAll("[data-promover-btn]").forEach(s=>s.onclick=async()=>{const i=s.dataset.promoverBtn,u=a.querySelector(`[data-promover-select="${i}"]`);try{await mockApi.promoverUsuario(i,u.value),toast("Rol actualizado","\u2705"),renderApp()}catch(h){toast(h.message,"\u26A0\uFE0F")}}),a.querySelectorAll("[data-eliminar-btn]").forEach(s=>s.onclick=async()=>{if(confirm("\xBFEliminar esta cuenta? Si tiene animales o eventos a su nombre, se desactiva en vez de borrarse (para no perder la trazabilidad)."))try{const i=await mockApi.eliminarUsuario(s.dataset.eliminarBtn);toast(i.eliminado?"Cuenta eliminada":"Ten\xEDa historial asociado \u2014 se desactiv\xF3 en vez de borrarse",i.eliminado?"\u{1F5D1}\uFE0F":"\u{1F6AB}"),renderApp()}catch(i){toast(i.message,"\u26A0\uFE0F")}}),a.querySelectorAll("[data-reactivar-btn]").forEach(s=>s.onclick=async()=>{try{await mockApi.reactivarUsuario(s.dataset.reactivarBtn),toast("Cuenta reactivada","\u267B\uFE0F"),renderApp()}catch(i){toast(i.message,"\u26A0\uFE0F")}}),a.querySelectorAll("[data-plan-btn]").forEach(s=>s.onclick=async()=>{const i=s.dataset.planBtn,u=a.querySelector(`[data-plan-select="${i}"]`),h=a.querySelector(`[data-plan-fecha="${i}"]`);try{await mockApi.actualizarPlanCliente(i,u.value,h.value),toast("Plan actualizado","\u2705"),renderApp()}catch(b){toast(b.message,"\u26A0\uFE0F")}}),a.querySelectorAll("[data-reservar-btn]").forEach(s=>s.onclick=async()=>{const i=s.dataset.reservarBtn,u=a.querySelector(`[data-reservar-cantidad="${i}"]`),h=parseInt(u.value,10);if(!h||h<=0){toast("Escribe una cantidad v\xE1lida","\u26A0\uFE0F");return}try{const b=await mockApi.reservarChipsCliente(i,h);toast(`Reservados \u2014 ahora tiene ${b.reservados} chip(s) listos para usar sin se\xF1al`,"\u{1F4F4}"),renderApp()}catch(b){toast(b.message,"\u26A0\uFE0F")}}),a.querySelectorAll("[data-liberar-btn]").forEach(s=>s.onclick=async()=>{if(confirm("\xBFLiberar todos los chips reservados de este cliente? Vuelven al pool general."))try{await mockApi.liberarChipsCliente(s.dataset.liberarBtn),toast("Chips liberados","\u267B\uFE0F"),renderApp()}catch(i){toast(i.message,"\u26A0\uFE0F")}});const g=document.getElementById("formCrearCodigoPromo");g&&(g.onsubmit=async s=>{s.preventDefault();const i=new FormData(g);try{await mockApi.crearCodigoPromocional({codigo:i.get("codigo").trim(),meses:parseInt(i.get("meses"),10),descripcion:i.get("descripcion").trim()||null,maxUsos:i.get("max_usos")?parseInt(i.get("max_usos"),10):null,vence:i.get("vence")||null}),toast("C\xF3digo creado","\u{1F39F}\uFE0F"),renderApp()}catch(u){toast(u.message,"\u26A0\uFE0F")}}),a.querySelectorAll("[data-desactivar-codigo]").forEach(s=>s.onclick=async()=>{if(confirm("\xBFDesactivar este c\xF3digo? Nadie m\xE1s va a poder canjearlo."))try{await mockApi.desactivarCodigoPromocional(Number(s.dataset.desactivarCodigo)),toast("C\xF3digo desactivado","\u2705"),renderApp()}catch(i){toast(i.message,"\u26A0\uFE0F")}}),a.querySelectorAll("[data-pedido-aplicar-chip]").forEach(s=>s.onclick=async()=>{const i=Number(s.dataset.pedidoAplicarChip),u=a.querySelector(`[data-pedido-lote="${i}"]`),h=u&&u.value?Number(u.value):null;try{await mockApi.marcarPedidoExternoAplicado(i,h),toast("Pedido marcado como aplicado","\u2705"),renderApp()}catch(b){toast(b.message,"\u26A0\uFE0F")}}),a.querySelectorAll("[data-pedido-descartar]").forEach(s=>s.onclick=async()=>{if(confirm("\xBFDescartar este pedido? No se puede deshacer."))try{await mockApi.descartarPedidoExterno(Number(s.dataset.pedidoDescartar)),toast("Pedido descartado","\u{1F5D1}\uFE0F"),renderApp()}catch(i){toast(i.message,"\u26A0\uFE0F")}}),a.querySelectorAll("[data-pedido-aplicar-credito]").forEach(s=>s.onclick=async()=>{if(confirm("\xBFAplicar este cr\xE9dito de suscripci\xF3n a esa cuenta?"))try{await mockApi.aplicarCreditoSuscripcion(Number(s.dataset.pedidoAplicarCredito),s.dataset.pedidoCreditoPerfil),toast("Cr\xE9dito aplicado","\u{1F4B3}"),renderApp()}catch(i){toast(i.message,"\u26A0\uFE0F")}}),a.querySelectorAll("[data-pedido-buscar-y-aplicar-credito]").forEach(s=>s.onclick=async()=>{const i=Number(s.dataset.pedidoBuscarYAplicarCredito),u=a.querySelector(`[data-pedido-credito-email="${i}"]`),h=(u?u.value:"").trim();if(!h){toast("Escribe el email del ganadero","\u26A0\uFE0F");return}try{const b=await mockApi.buscarPerfilPorEmail(h);if(!b){toast("No hay ninguna cuenta de ganadero registrada con ese email todav\xEDa","\u26A0\uFE0F");return}if(!confirm("\xBFAplicar este cr\xE9dito de suscripci\xF3n a esa cuenta?"))return;await mockApi.aplicarCreditoSuscripcion(i,b),toast("Cr\xE9dito aplicado","\u{1F4B3}"),renderApp()}catch(b){toast(b.message,"\u26A0\uFE0F")}})}esperarSesionInicial().then(renderApp);
