let currentScreen="inicio",animalesSubview="lista",reproduccionSubview="registrar",sanidadSubview="registrar",loteScreenSubview="lista",loteSeleccionadoId=null,loteOrdenRanking="desc",loteDetalleSubview="grupo",loteTareaAbierta=null,configuracionAbierta=null,calendarioAnio=new Date().getFullYear(),calendarioMes=new Date().getMonth(),calendarioDiaSeleccionado=null,calendarioFormAbierto=!1,loteAnimales=[];function resetearSubvistas(){animalesSubview="lista",reproduccionSubview="registrar",sanidadSubview="registrar",loteScreenSubview="lista",loteSeleccionadoId=null,loteDetalleSubview="grupo",loteTareaAbierta=null,configuracionAbierta=null}let scanBuffer="",scanTimer=null,chipEscaneadoParaRegistro=null,_yaSincronizoChipsReservados=!1;function initials(a){return(a||"?").trim().split(/\s+/).slice(0,2).map(e=>e[0]).join("").toUpperCase()}function saludo(){const a=new Date().getHours();return a<12?"Buenos d\xEDas":a<19?"Buenas tardes":"Buenas noches"}async function renderApp(){const a=mockApi.sesionActual();if(!a){redirigirSeguro("../index.html");return}_yaSincronizoChipsReservados||(_yaSincronizoChipsReservados=!0,sincronizarChipsReservados(),sincronizarQrTrazabilidad());const e=document.getElementById("app"),o=++_turnoRender;let n;try{n=rolPermitidoEnApp(a.rol)?await viewShell(a):viewAccesoRestringido(a)}catch(r){console.error("Error al pintar la pantalla:",r),toast(r.message||"No se pudo cargar esta pantalla \u2014 prob\xE1 de nuevo","\u26A0\uFE0F");return}if(o!==_turnoRender)return;const t=()=>{const r=e.querySelector(".bottom-nav"),i=r?{left:r.scrollLeft,top:r.scrollTop}:null;try{e.innerHTML=n,bindEvents();const d=e.querySelector(".bottom-nav");d&&i&&(d.scrollLeft=i.left,d.scrollTop=i.top)}catch(d){console.error("Error al pintar la pantalla:",d),toast(d.message||"No se pudo cargar esta pantalla \u2014 prob\xE1 de nuevo","\u26A0\uFE0F")}};transicionSegura(t)}const NAV_ITEMS=[{id:"inicio",label:"Inicio",img:"../inicio.png"},{id:"animales",label:"Animales",img:"../animales.png?v=3"},{id:"lote",label:"Lote",img:"../lote.png?v=3"},{id:"sanidad",label:"Sanidad",img:"../sanidad.png"},{id:"calendario",label:"Calendario",emoji:"\u{1F4C5}"},{id:"pesaje",label:"Pesaje",img:"../pesaje.png"},{id:"reproduccion",label:"Repro",full:"Reproducci\xF3n",img:"../reproduccion.png"},{id:"excel",label:"Excel",img:"../excel.png"},{id:"configuracion",label:"Config",full:"Configuraci\xF3n",emoji:"\u2699\uFE0F"}];async function viewShell(a){let e=[];if(a.rol==="ganadero")try{e=await mockApi.misRanchos()}catch{}const o=e.find(t=>t.id===a.rancho_actual_id),n=await renderScreen(currentScreen,a);return`
  <div class="mobile-shell">
    <div class="mobile-topbar">
      <div>
        <div class="greeting">${saludo()}, ${esc(a.nombre.split(" ")[0])}</div>
        ${a.rol==="ganadero"?`<button type="button" class="rancho-switch" id="btnCambiarRancho"><img src="../inicio.png" alt="" style="width:15px;height:15px;vertical-align:-2px;"> ${esc(o?o.nombre:"Mi rancho")} <span style="opacity:.6;">\u25BE</span></button>`:`<div class="sub">${etiquetaRol(a.rol)}</div>`}
      </div>
      ${iconoMenuUsuario()}
    </div>
    <div class="screen" id="screenContent">${n}</div>
    <nav class="bottom-nav">
      ${NAV_ITEMS.map(t=>`
        <button class="nav-item ${currentScreen===t.id?"active":""}" data-nav="${t.id}">
          <span class="ico">${t.img?`<img src="${t.img}" alt="">`:t.emoji}</span><span class="nav-label-corto">${t.label}</span><span class="nav-label-completo">${t.full||t.label}</span>
        </button>`).join("")}
    </nav>
  </div>`}async function abrirSelectorRancho(){const a=mockApi.sesionActual();let e;try{e=await mockApi.misRanchos()}catch(i){toast(i.message,"\u26A0\uFE0F");return}let o=null;const n=document.createElement("div");n.className="modal-backdrop";const t=()=>{const i=o?e.find(v=>v.id===o):null,d=n.querySelector("#formRancho");if(!d)return;d.innerHTML=`
      <label>${i?`Editando "${esc(i.nombre)}"`:"Nuevo rancho"}</label>
      <input name="nombre" placeholder="Nombre \u2014 p. ej. Rancho El Progreso" value="${i?esc(i.nombre):""}">
      <div class="row" style="gap:8px;margin-top:9px;">
        <input name="municipio" placeholder="Municipio (opcional)" value="${i?esc(i.municipio||""):""}" style="flex:1;">
        <input name="ubicacion" placeholder="Ubicaci\xF3n (opcional)" value="${i?esc(i.ubicacion||""):""}" style="flex:1;">
      </div>
      <div class="row" style="gap:8px;margin-top:8px;">
        ${i?'<button class="btn btn-ghost" type="button" id="btnCancelarEdicionRancho" style="flex:1;">Cancelar</button>':""}
        <button class="btn btn-primary" type="submit" style="flex:1;">${i?"Guardar cambios":"\u2795 Agregar rancho"}</button>
      </div>`;const u=d.querySelector("#btnCancelarEdicionRancho");u&&(u.onclick=()=>{o=null,t()})};n.innerHTML=`
    <div class="modal">
      <h3 class="section-title" style="margin-bottom:14px;">Tus ranchos</h3>
      <div style="max-height:40vh;overflow-y:auto;">
        ${e.map(i=>`
        <div class="list-item" data-elegir-rancho="${i.id}" style="${i.id===a.rancho_actual_id?"background:var(--primary-soft);":""}">
          <div class="list-avatar" style="background:rgba(15,42,74,0.14);"><img src="../inicio.png" alt="" style="width:20px;height:20px;object-fit:contain;"></div>
          <div style="flex:1;min-width:0;">
            <div class="list-title">${esc(i.nombre)}${i.id===a.rancho_actual_id?" (actual)":""}</div>
            <div class="list-sub">${i.municipio?esc(i.municipio):i.ubicacion?esc(i.ubicacion):"Sin ubicaci\xF3n"}</div>
          </div>
          <button type="button" class="btn btn-ghost" data-editar-rancho="${i.id}" style="padding:4px 8px;font-size:11px;margin-top:0;">\u270F\uFE0F</button>
          ${e.length>1?`<button type="button" class="btn btn-ghost" data-archivar-rancho="${i.id}" style="padding:4px 8px;font-size:11px;margin-top:0;margin-left:4px;">\u{1F5C4}\uFE0F</button>`:""}
          ${e.length>1?`<button type="button" class="btn btn-ghost" data-eliminar-rancho="${i.id}" style="padding:4px 8px;font-size:11px;margin-top:0;margin-left:4px;">\u{1F5D1}\uFE0F</button>`:""}
        </div>`).join("")}
      </div>
      <form id="formRancho" style="margin-top:14px;border-top:1px solid var(--border);padding-top:14px;"></form>
    </div>`,document.body.appendChild(n),n.addEventListener("click",i=>{i.target===n&&n.remove()}),t(),n.querySelectorAll("[data-elegir-rancho]").forEach(i=>i.onclick=async()=>{const d=Number(i.dataset.elegirRancho);if(d===a.rancho_actual_id){n.remove();return}try{await mockApi.cambiarRanchoActual(d),n.remove(),renderApp()}catch(u){toast(u.message,"\u26A0\uFE0F")}}),n.querySelectorAll("[data-editar-rancho]").forEach(i=>i.onclick=d=>{d.stopPropagation(),o=Number(i.dataset.editarRancho),t(),n.querySelector("#formRancho").scrollIntoView({block:"nearest"})}),n.querySelectorAll("[data-archivar-rancho]").forEach(i=>i.onclick=async d=>{if(d.stopPropagation(),!!confirm("\xBFArchivar este rancho? Sus animales y lotes quedan igual, solo deja de aparecer en la lista."))try{await mockApi.archivarRancho(Number(i.dataset.archivarRancho)),n.remove(),renderApp()}catch(u){toast(u.message,"\u26A0\uFE0F")}}),n.querySelectorAll("[data-eliminar-rancho]").forEach(i=>i.onclick=async d=>{if(d.stopPropagation(),!!confirm("\xBFEliminar este rancho para siempre? Solo se puede si no tiene ning\xFAn animal ni lote cargado \u2014 si tiene datos, mejor archivalo con \u{1F5C4}\uFE0F."))try{await mockApi.eliminarRancho(Number(i.dataset.eliminarRancho)),n.remove(),toast("Rancho eliminado","\u{1F5D1}\uFE0F"),renderApp()}catch(u){toast(u.message,"\u26A0\uFE0F")}});const r=n.querySelector("#formRancho");r&&(r.onsubmit=async i=>{i.preventDefault();const d=new FormData(r),u={nombre:d.get("nombre"),ubicacion:d.get("ubicacion"),municipio:d.get("municipio")};try{o?(await mockApi.editarRancho(o,u),toast("Rancho actualizado","\u{1F3E1}")):(await mockApi.crearRancho(u),toast("Rancho creado","\u{1F3E1}")),n.remove(),renderApp()}catch(v){toast(v.message,"\u26A0\uFE0F")}})}async function renderScreen(a,e){switch(a){case"inicio":return viewInicio();case"animales":return animalesSubview==="form"?viewNuevoAnimalRegistro():viewAnimales();case"lote":return loteScreenSubview==="detalle"?viewLoteDetalle():loteScreenSubview==="form"?viewNuevoLoteForm():viewLotes();case"sanidad":return viewSanidad();case"calendario":return viewCalendario();case"pesaje":return viewPesaje();case"leche":return viewLeche();case"reproduccion":return viewReproduccion();case"excel":return viewExcel();case"configuracion":return viewConfiguracion();default:return""}}function statCard(a,e,o,n,t){return`
    <div class="stat-card">
      <div class="stat-top">
        <div class="stat-icon" style="background:${t};color:${n};">${a}</div>
        <div class="stat-value">${o}</div>
      </div>
      <div class="stat-label">${e}</div>
    </div>`}function bloqueSincronizacion(a){return a.length?`
    <div class="card" style="border-color:var(--red);">
      <div class="row" style="justify-content:space-between;align-items:center;">
        <h3 class="section-title">\u{1F504} Sincronizaci\xF3n</h3>
        <button class="btn btn-ghost" id="btnSincronizarAhora" style="padding:6px 10px;font-size:11px;" type="button">Sincronizar ahora</button>
      </div>
      <p class="small" style="margin-top:6px;color:var(--red);"><b>\u26A0\uFE0F ${a.length} no se pudo${a.length===1?"":"eron"} completar:</b></p>
      ${a.map(e=>`
        <div class="card-flat" style="border-color:var(--red);background:rgba(192,57,43,0.06);margin-top:6px;">
          <b>${esc(e.descripcion)}</b>
          <p class="small muted" style="margin-top:2px;">${esc(e.motivo)}</p>
          <button class="btn btn-ghost" data-descartar-fallo="${e.id}" style="margin-top:6px;padding:5px 10px;font-size:11px;" type="button">Entendido</button>
        </div>`).join("")}
    </div>`:""}function botonesElegirPlan(){return`
    <div class="row" style="gap:8px;margin-top:10px;">
      <button class="btn btn-primary" data-suscribirme="mensual" type="button" style="flex:1;">Mensual \u2014 $169/mes</button>
      <button class="btn btn-primary" data-suscribirme="anual" type="button" style="flex:1;">Anual \u2014 $1299/a\xF1o</button>
    </div>`}function contenidoMiPlan(a){const e=new Date().toISOString().slice(0,10),o=a.fecha_proximo_pago&&a.fecha_proximo_pago>=e,t=(a.plan_tipo==="mensual"||a.plan_tipo==="anual")&&a.plan_estado==="al_dia",r=!!a.suscripcion_cancelada;return o?t&&r?`
        <p class="small muted">Suscripci\xF3n ${a.plan_tipo} cancelada \u2014 ten\xE9s acceso completo hasta ${fmtFecha(a.fecha_proximo_pago)}, despu\xE9s no se te va a volver a cobrar.</p>
        ${botonesElegirPlan()}`:`
      <p class="small muted">
        ${t?`Suscripci\xF3n ${a.plan_tipo} al d\xEDa \u2014 pr\xF3ximo cobro ${fmtFecha(a.fecha_proximo_pago)}.`:`\u2705 Acceso completo vigente hasta ${fmtFecha(a.fecha_proximo_pago)} \u2014 sin tope de animales ni ranchos mientras tanto.`}
      </p>
      ${t?'<button class="btn btn-ghost btn-block" id="btnCancelarSuscripcion" type="button" style="margin-top:8px;color:var(--red);">Cancelar suscripci\xF3n</button>':""}
      ${t?"":botonesElegirPlan()}`:`
    <p class="small muted">\u{1F331} Versi\xF3n gratis \u2014 hasta 50 animales y 1 rancho. Canje\xE1 un c\xF3digo de promoci\xF3n o suscribite para levantar el tope.</p>
    <form id="formCanjearCodigo" style="margin-top:10px;">
      <div class="row" style="gap:8px;">
        <input name="codigo" placeholder="C\xF3digo de promoci\xF3n" style="flex:1;text-transform:uppercase;" autocomplete="off">
        <button class="btn btn-ghost" type="submit">Canjear</button>
      </div>
    </form>
    ${botonesElegirPlan()}`}function contenidoPoliticaPrivacidad(){return`
    <div class="small muted" style="line-height:1.6;">
      <p><b>\xBFQu\xE9 datos recopilamos?</b><br>
      Tus datos de contacto (nombre, correo, tel\xE9fono, municipio) y los datos de tu operaci\xF3n: ranchos, animales (identificaci\xF3n, raza, peso, sanidad, reproducci\xF3n, producci\xF3n de leche) y su historial.</p>
      <p><b>\xBFPara qu\xE9 los usamos?</b><br>
      Para que puedas registrar y consultar la informaci\xF3n de tu reba\xF1o, para contactarte sobre tu cuenta o soporte t\xE9cnico, y para generar reportes agregados (sin identificarte a vos ni a tu rancho) que ayuden a mejorar el servicio.</p>
      <p><b>\xBFLos compartimos?</b><br>
      No vendemos tus datos a terceros. Solo los compartimos cuando la ley lo exige, o con proveedores que nos ayudan a operar el servicio (por ejemplo, el hosting de la base de datos), bajo la misma obligaci\xF3n de confidencialidad.</p>
      <p><b>Tus derechos</b><br>
      Pod\xE9s pedir en cualquier momento que corrijamos o eliminemos tus datos, escribi\xE9ndonos a <b>[tu correo de contacto ac\xE1]</b>.</p>
    </div>`}function opcionConfig(a,e,o,n){const t=configuracionAbierta===a;return`
    <div class="list-item" data-config-toggle="${a}" style="cursor:pointer;">
      <div style="flex:1;"><b>${e} ${o}</b></div>
      <span class="list-chevron">${t?"\u2304":"\u203A"}</span>
    </div>
    ${t?`<div class="card-flat" style="margin-top:-4px;">${n}</div>`:""}`}function contenidoNotificacionesPush(a){return`
    <p class="small muted">Avisos de parto pr\xF3ximo y recordatorios de vacunaci\xF3n vencidos \u2014 directo al celular, todos los d\xEDas a las 7 AM, aunque no tengas la app abierta.</p>
    ${a?'<button class="btn btn-ghost btn-block" id="btnDesactivarPush" type="button" style="margin-top:8px;">Desactivar en este dispositivo</button>':'<button class="btn btn-primary btn-block" id="btnActivarPush" type="button" style="margin-top:8px;">Activar notificaciones</button>'}
  `}async function viewConfiguracion(){const a=mockApi.sesionActual(),[{data:e},o]=await Promise.all([_conTimeout(supabaseClient.from("perfiles").select("*").eq("id",a.id).single()).catch(()=>({data:null})),mockApi.tengoNotificacionesActivas().catch(()=>!1)]),n=e||a;return`
    <h3 class="section-title" style="margin-bottom:14px;">Configuraci\xF3n</h3>

    ${opcionConfig("perfil","\u{1F464}","Editar perfil",formEditarPerfil(n))}
    <div class="list-item" id="btnAbrirRanchosConfig" style="cursor:pointer;">
      <div style="flex:1;"><b>\u{1F3E1} Editar rancho</b></div>
      <span class="list-chevron">\u203A</span>
    </div>
    ${opcionConfig("notificaciones","\u{1F514}","Notificaciones",contenidoNotificacionesPush(o))}
    ${opcionConfig("privacidad","\u{1F4C4}","Pol\xEDtica de privacidad",contenidoPoliticaPrivacidad())}

    ${bloqueInstalarApp()}
    <button class="btn btn-ghost btn-block" id="btnCerrarSesionConfig" type="button" style="margin-top:8px;color:var(--red);">\u{1F6AA} Cerrar sesi\xF3n</button>
  `}async function viewInicio(){const a=mockApi.sesionActual(),[e,o,n,t,r]=await Promise.all([mockApi.misAnimales(),mockApi.misEventosAnimal("sanidad",500),mockApi.misEventosAnimal("reproduccion",500),mockApi.listarFallosSincronizacion(),mockApi.misLotes().catch(()=>[])]),i=r.filter(s=>s.activo!==!1).length,d=e.filter(s=>s.estado==="vivo"),u=d.filter(s=>s.sexo==="macho").length,v=d.filter(s=>s.sexo==="hembra").length,h=contarPrenadas(e,n),$=d.filter(s=>s.sexo==="macho"&&categoriaPorcina(s.sexo,s.fecha_nacimiento)==="Verraco").length,k=e.filter(s=>s.estado==="baja").length,A=e.map(s=>({a:s,retiro:retiroActivoHoy(o.filter(b=>b.animal_id===s.id))})).filter(s=>s.retiro),f=calcularAlertasReproduccion(e,n),y=A.length+f.length,m=f.filter(s=>s.tipo==="parto").length,p=[...A.map(s=>({tipo:"medica",urgente:!0,animal:s.a,mensaje:`En per\xEDodo de retiro hasta ${s.retiro.retiro_hasta} \u2014 no deber\xEDa venderse ni sacrificarse todav\xEDa`})),...f].sort((s,b)=>b.urgente-s.urgente).slice(0,5);return`
    <div class="stats-grid stats-inicio">
      ${statCard('<img src="../icono.png?v=3" alt="" style="width:42px;height:42px;object-fit:contain;">',"Registrados",d.length,"var(--primary)","var(--primary-soft)")}
      ${statCard("\u2642\uFE0F","Machos",u,"var(--blue)","rgba(41,128,185,0.12)")}
      ${statCard("\u2640\uFE0F","Hembras",v,"var(--pink)","rgba(194,24,91,0.1)")}
      ${statCard('<img src="../embrion.png" alt="" style="width:42px;height:42px;object-fit:contain;">',"Gestantes",h,"#8E44AD","rgba(142,68,173,0.12)")}
      ${statCard('<img src="../prenadas.png" alt="" style="width:42px;height:42px;object-fit:contain;">',"Pr\xF3ximas a parir",m,"#C0392B","rgba(192,57,43,0.08)")}
      ${statCard('<img src="../sementales.png?v=3" alt="" style="width:42px;height:42px;object-fit:contain;">',"Sementales",$,"var(--blue)","rgba(41,128,185,0.12)")}
      ${statCard('<img src="../bajas.png?v=3" alt="" style="width:42px;height:42px;object-fit:contain;">',"Bajas",k,"#6B6B6B","rgba(107,107,107,0.12)")}
      ${statCard('<img src="../lote.png?v=3" alt="" style="width:42px;height:42px;object-fit:contain;">',"Lotes",i,"#8A5A2B","rgba(201,139,90,0.16)")}
    </div>

    <div class="card">
      <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:2px;">
        <h3 class="section-title">\u26A0\uFE0F Alertas de salud y reproducci\xF3n</h3>
        ${y?`<span class="pill pill-pendiente">${y}</span>`:""}
      </div>
      ${p.length?p.map(s=>s.tipo==="medica"?`<div class="card-flat" style="border-color:var(--red);background:rgba(192,57,43,0.06);margin-top:8px;">
             <b style="color:var(--red);">\u{1F489} ${esc(etiquetaAnimal(s.animal))}</b>
             <p class="small muted" style="margin-top:2px;">${esc(s.mensaje)}</p>
           </div>`:filaAlertaReproduccion(s)).join(""):'<div class="empty">Sin alertas por ahora.</div>'}
      ${y>p.length?`<p class="small muted" style="margin-top:8px;">Y ${y-p.length} m\xE1s \u2014 revis\xE1 Sanidad y Reproducci\xF3n.</p>`:""}
    </div>

    ${bloqueSincronizacion(t)}
  `}function slugArchivo(a){return(a||"sin-nombre").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")}async function exportarMiInformacion(a=!1){let e;try{e=await mockApi.miRespaldoExcel(a)}catch(i){toast(i.message,"\u26A0\uFE0F");return}const{rancho_nombre:o,hojas:n}=e;if(Object.values(n).every(i=>!i.length)){toast("Todav\xEDa no hay informaci\xF3n guardada para exportar","\u26A0\uFE0F");return}typeof XLSX>"u"&&toast("Preparando el Excel\u2026","\u23F3");try{await cargarSheetJS()}catch(i){toast(i.message+" \u2014 revis\xE1 la conexi\xF3n","\u26A0\uFE0F");return}const t=armarLibroExcel(n,[["animales","Animales"],["pesajes","Pesajes"],["sanidad","Sanidad"],["reproduccion","Reproducci\xF3n"],["otros_eventos","Altas, traslados y bajas"],["sacrificios","Sacrificios"],["guias_movilizacion","Gu\xEDas de movilizaci\xF3n"]]);await agregarHojaTrazabilidad(t,{todosLosRanchos:a});const r=a?"todos-mis-ranchos":slugArchivo(o||"mi-rancho");XLSX.writeFile(t,`${r}-${new Date().toISOString().slice(0,10)}.xlsx`),toast("Excel descargado","\u2B07\uFE0F")}async function exportarExcelLote(a){let e;try{e=await mockApi.miRespaldoExcelLote(a)}catch(r){toast(r.message,"\u26A0\uFE0F");return}const{lote_nombre:o,hojas:n}=e;if(Object.values(n).every(r=>!r.length)){toast("Todav\xEDa no hay informaci\xF3n guardada para exportar","\u26A0\uFE0F");return}typeof XLSX>"u"&&toast("Preparando el Excel\u2026","\u23F3");try{await cargarSheetJS()}catch(r){toast(r.message+" \u2014 revis\xE1 la conexi\xF3n","\u26A0\uFE0F");return}const t=armarLibroExcel(n,[["animales","Animales"],["pesajes","Pesajes"],["sanidad","Sanidad"],["reproduccion","Reproducci\xF3n"],["otros_eventos","Altas, traslados y bajas"],["sacrificios","Sacrificios"],["guias_movilizacion","Gu\xEDas de movilizaci\xF3n"]]);await agregarHojaTrazabilidad(t,{loteId:a},o),XLSX.writeFile(t,`lote-${slugArchivo(o)}-${new Date().toISOString().slice(0,10)}.xlsx`),toast("Excel descargado","\u2B07\uFE0F")}async function pdfEtiquetas(a,e){try{const[o,n,t]=await Promise.all([mockApi.qrTrazabilidadLista(a),idbTodo("cache_animales"),mockApi.misRanchos().catch(()=>[])]),r=new Map(n.map(i=>[String(i.id),i]));await descargarPdfEtiquetasQR(o.map(i=>{const d=r.get(String(i.animal_id))||{};return{titulo:i.numero_interno||i.chip||"Sin identificar",lineas:lineasEtiquetaAnimal(d,nombreDeRancho(t,d.rancho_id)),token:i.token}}),`etiquetas-qr-${nombreArchivoQR(e)}.pdf`)}catch(o){toast(o.message,"\u26A0\uFE0F")}}function nombreDeRancho(a,e){const o=a.find(n=>String(n.id)===String(e));return o?o.nombre:a.length===1?a[0].nombre:""}async function agregarHojaTrazabilidad(a,e,o=null){let n,t=null;try{n=await mockApi.qrTrazabilidadLista(e),e.loteId&&(t=await mockApi.qrTrazabilidad({loteId:e.loteId}))}catch(u){console.warn("Excel sin hoja de trazabilidad:",u.message);return}const r="Enlace de trazabilidad (QR)",i=[];t&&i.push({"Qu\xE9 es":`Lote ${o}`,"N\xB0 interno":"",Chip:"",[r]:urlTrazabilidad(t)});for(const u of n)i.push({"Qu\xE9 es":"Animal","N\xB0 interno":u.numero_interno,Chip:u.chip,[r]:urlTrazabilidad(u.token)});if(!i.length)return;const d=XLSX.utils.json_to_sheet(i);d["!cols"]=[{wch:24},{wch:14},{wch:18},{wch:90}],i.forEach((u,v)=>{const h=d[XLSX.utils.encode_cell({r:v+1,c:3})];h&&(h.l={Target:u[r]})}),XLSX.utils.book_append_sheet(a,d,"Trazabilidad (QR)")}async function viewExcel(){const a=mockApi.sesionActual();let e=[],o=[];try{[e,o]=await Promise.all([mockApi.misRanchos(),mockApi.misLotes()])}catch{}const n=e.find(h=>h.id===a.rancho_actual_id),t=(h,$,k,A,f)=>`
    <div class="list-item" data-${h}="${$}" style="cursor:pointer;">
      <div class="list-avatar" style="background:rgba(15,42,74,0.14);">${k}</div>
      <div style="flex:1;min-width:0;">
        <div class="list-title">${esc(A)}</div>
        ${f?`<div class="list-sub">${esc(f)}</div>`:""}
      </div>
      <span class="list-chevron">\u203A</span>
    </div>`,r='<img src="../inicio.png" alt="" style="width:20px;height:20px;object-fit:contain;">',i=[t("exportar-rancho-actual","1",r,n?n.nombre:"Mi rancho"),e.length>1?t("exportar-todos-ranchos","1",r,"Todos mis ranchos"):"",...o.map(h=>t("exportar-lote",h.id,iconoTipoLote(h.tipo),h.nombre,etiquetaTipoLote(h.tipo)))].join(""),d=n?n.nombre:"Mi rancho",u='<img src="../qr.png" alt="" style="width:22px;height:22px;object-fit:contain;">',v=[t("qr-rancho-actual","1",u,d),e.length>1?t("qr-todos-ranchos","1",u,"Todos mis ranchos"):"",...o.map(h=>t("qr-lote",h.id,u,h.nombre,etiquetaTipoLote(h.tipo)))].join("");return`
    <h3 class="section-title" style="margin-bottom:14px;">Exportar a Excel</h3>
    ${i}
    <h3 class="section-title" style="margin:22px 0 4px;display:flex;align-items:center;gap:8px;">
      <img src="../qr.png" alt="" style="width:26px;height:26px;">Etiquetas QR para imprimir</h3>
    <p class="small muted" style="margin-bottom:12px;">PDF tama\xF1o carta, 12 etiquetas por hoja.</p>
    ${v}
  `}async function viewNuevoAnimalRegistro(){const a=chipEscaneadoParaRegistro;return`
    <div class="back-row">
      <button class="back-btn" data-volver-animales="1">\u2190</button>
      <h3 class="section-title">Registrar un animal</h3>
    </div>
    <form id="formAnimalRegistro">
      ${await camposDatosAnimal({},{chipEscaneado:a})}
      <button class="btn btn-primary btn-block" type="submit">Registrar</button>
    </form>
  `}async function viewAnimales(){const a=await mockApi.misAnimales();return`
    <h3 class="section-title" style="margin-bottom:14px;">Mis animales</h3>
    <div class="list-with-fab">
      ${a.length?`
      <input id="buscarMisAnimales" placeholder="Chip o N\xB0 interno \u2014 escane\xE1 para abrir la ficha" style="margin-bottom:14px;">
      <div id="listaAnimalesCertificados" class="grid-cards">
        ${a.map(e=>`
        <div class="list-item" data-ver-animal="${e.id}" data-buscar="${esc(((e.chip_uid||"")+" "+(e.numero_interno||"")).toLowerCase())}">
          <div class="list-avatar" style="background:${e.sexo==="macho"?"rgba(41,128,185,0.1)":"rgba(194,24,91,0.1)"};">${e.sexo==="macho"?"\u2642\uFE0F":"\u2640\uFE0F"}</div>
          <div style="flex:1;min-width:0;">
            <div class="list-title">${esc(etiquetaAnimal(e))} \u2014 ${esc(e.raza)}</div>
            <div class="list-sub">${e.chip_uid?"Chip: "+esc(e.chip_uid):"Sin chip oficial todav\xEDa"}</div>
          </div>
          <span class="pill pill-${e.estado}">${etiquetaEstadoAnimal(e.estado)}</span>
        </div>`).join("")}
      </div>
      <p id="sinResultadosMisAnimales" class="small muted" style="display:none;text-align:center;margin-top:8px;">Sin resultados.</p>
      `:'<div class="empty">Todav\xEDa no ten\xE9s ning\xFAn animal registrado.<br>Toc\xE1 el bot\xF3n "+" para registrar el primero.</div>'}
    </div>
    <button class="fab" id="fabRegistrarAnimal" aria-label="Registrar animal">+</button>
  `}const TIPOS_LOTE=[{value:"manejo",label:"Manejo (Cr\xEDa, Engorda\u2026)"},{value:"protocolo_reproductivo",label:"Protocolo reproductivo"},{value:"campa\xF1a_sanitaria",label:"Campa\xF1a sanitaria"},{value:"otro",label:"Otro"}];function selectTipoLote(a="manejo"){return`<select name="tipo">
    ${TIPOS_LOTE.map(e=>`<option value="${e.value}" ${e.value===a?"selected":""}>${esc(e.label)}</option>`).join("")}
  </select>`}function etiquetaTipoLote(a){return(TIPOS_LOTE.find(e=>e.value===a)||{}).label||a}function iconoTipoLote(a){return`<img src="${a==="manejo"?"../animales.png?v=3":a==="protocolo_reproductivo"?"../reproduccion.png":a==="campa\xF1a_sanitaria"?"../sanidad.png":"../lote.png?v=3"}" alt="" style="width:20px;height:20px;object-fit:contain;">`}async function viewLotes(){const a=await mockApi.misLotes();return`
    <h3 class="section-title" style="margin-bottom:4px;">Lotes</h3>
    <div class="list-with-fab">
      ${a.length?a.map(e=>`
      <div class="list-item" data-ver-lote="${e.id}">
        <div class="list-avatar" style="background:rgba(15,42,74,0.14);">${iconoTipoLote(e.tipo)}</div>
        <div style="flex:1;min-width:0;">
          <div class="list-title">${esc(e.nombre)}</div>
          <div class="list-sub">${esc(etiquetaTipoLote(e.tipo))}${e.categoria?" \xB7 "+esc(e.categoria):""}</div>
        </div>
        <span class="list-chevron">\u203A</span>
      </div>`).join(""):'<div class="empty">Todav\xEDa no armaste ning\xFAn lote.<br>Toc\xE1 el bot\xF3n "+" para crear el primero.</div>'}
    </div>
    <button class="fab" id="fabNuevoLote" aria-label="Nuevo lote">+</button>
  `}async function viewNuevoLoteForm(){return`
    <div class="back-row">
      <button class="back-btn" data-volver-lotes="1">\u2190</button>
      <h3 class="section-title">Nuevo lote</h3>
    </div>
    <form id="formNuevoLote">
      <label>Nombre *</label>
      <input name="nombre" placeholder="p. ej. Engorda Verano 2026" required>
      <label>Funci\xF3n</label>
      ${selectTipoLote()}
      <label>Categor\xEDa</label>
      ${selectCategoriaLote("categoria")}
      <label>Notas</label>
      <textarea name="notas" placeholder="Opcional"></textarea>
      <button class="btn btn-primary btn-block" type="submit">Crear lote</button>
    </form>
  `}async function viewLoteDetalle(){const e=(await mockApi.misLotes()).find(s=>s.id===loteSeleccionadoId);if(!e)return loteScreenSubview="lista",await viewLotes();let o;try{o=await mockApi.resumenLote(e.id)}catch(s){return toast(s.message,"\u26A0\uFE0F"),loteScreenSubview="lista",await viewLotes()}const n=[...o.animales].sort((s,b)=>s.ganancia_diaria_kg==null&&b.ganancia_diaria_kg==null?0:s.ganancia_diaria_kg==null?1:b.ganancia_diaria_kg==null?-1:loteOrdenRanking==="desc"?b.ganancia_diaria_kg-s.ganancia_diaria_kg:s.ganancia_diaria_kg-b.ganancia_diaria_kg),t=o.reproduccion,r=t.pre\u00F1adas+t.vacias,i=r>0?Math.round(t.pre\u00F1adas/r*100):null,d=n.filter(s=>s.ganancia_diaria_kg!=null),u=d.length?d.reduce((s,b)=>s+b.ganancia_diaria_kg,0)/d.length:null,v=d.length?d.reduce((s,b)=>b.ganancia_diaria_kg>s.ganancia_diaria_kg?b:s):null,h=d.length?d.reduce((s,b)=>b.ganancia_diaria_kg<s.ganancia_diaria_kg?b:s):null,$=n.filter(s=>s.peso_actual_kg!=null).sort((s,b)=>b.peso_actual_kg-s.peso_actual_kg),k=$.length?Math.round($.reduce((s,b)=>s+Number(b.peso_actual_kg),0)/$.length):null,A=$.length?$[0].peso_actual_kg:0,f=$.length?`
    <div style="margin-top:12px;max-height:220px;overflow-y:auto;">
      ${$.map(s=>`
        <div style="margin-top:8px;">
          <div class="row" style="justify-content:space-between;font-size:12px;">
            <span class="muted">${esc(s.numero_interno||s.chip_uid||"(sin identificar)")}</span>
            <b>${s.peso_actual_kg} kg</b>
          </div>
          <div class="barra"><div style="width:${A?(s.peso_actual_kg/A*100).toFixed(0):0}%;"></div></div>
        </div>`).join("")}
    </div>`:"",y=t.pre\u00F1adas+t.vacias+t.pendientes,m=y>0?`
    <div style="display:flex;height:14px;border-radius:7px;overflow:hidden;margin-top:10px;">
      ${t.pre\u00F1adas?`<div style="width:${t.pre\u00F1adas/y*100}%;background:#2E7D32;" title="Pre\xF1adas: ${t.pre\u00F1adas}"></div>`:""}
      ${t.vacias?`<div style="width:${t.vacias/y*100}%;background:#C0392B;" title="Vac\xEDas: ${t.vacias}"></div>`:""}
      ${t.pendientes?`<div style="width:${t.pendientes/y*100}%;background:#8FA0B8;" title="Pendientes: ${t.pendientes}"></div>`:""}
    </div>`:"",p=loteTareaAbierta==="sumar"||loteAnimales.length>0;return`
    <div class="back-row" style="justify-content:space-between;">
      <div class="row" style="align-items:center;gap:6px;min-width:0;">
        <button class="back-btn" data-volver-lotes="1">\u2190</button>
        <h3 class="section-title" style="margin-bottom:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(e.nombre)}</h3>
        <button class="btn btn-ghost" type="button" id="btnEditarLote" style="padding:3px 8px;font-size:13px;flex-shrink:0;">\u270F\uFE0F</button>
      </div>
      <button class="btn btn-ghost" type="button" id="btnMasOpcionesLote" style="padding:3px 10px;font-size:16px;flex-shrink:0;">\u22EE</button>
    </div>
    <p class="section-sub">${esc(etiquetaTipoLote(e.tipo))}${e.categoria?" \xB7 "+esc(e.categoria):""}${e.notas?" \xB7 "+esc(e.notas):""}</p>

    <div class="ficha-tabs">
      <button type="button" class="ficha-tab ${loteDetalleSubview==="grupo"?"active":""}" data-lote-detalle-tab="grupo">Grupo</button>
      <button type="button" class="ficha-tab ${loteDetalleSubview==="tareas"?"active":""}" data-lote-detalle-tab="tareas">\u2705 Tareas${loteAnimales.length?` (${loteAnimales.length})`:""}</button>
    </div>

    ${loteDetalleSubview==="grupo"?`
    <div class="card">
      <h4 class="section-title" style="font-size:14px;">C\xF3mo va el grupo</h4>
      <div class="stats-grid" style="grid-template-columns:repeat(2,1fr);margin-top:8px;">
        ${statCard('<img src="../animales.png?v=3" alt="" style="width:22px;height:22px;object-fit:contain;">',"Animales",o.total_animales,"#0F2A4A","rgba(15,42,74,0.14)")}
        ${statCard("\u2696\uFE0F","Peso promedio",k!=null?`${k} kg`:"\u2014","#8E44AD","rgba(142,68,173,0.1)")}
      </div>
      ${u!=null?`
      <p style="margin-top:10px;font-weight:800;font-size:15px;">Ganancia promedio: ${u.toFixed(3)} kg/d\xEDa</p>
      <p class="small muted" style="margin-top:2px;">Mejor: ${esc(v.numero_interno||v.chip_uid||"(sin identificar)")} (${v.ganancia_diaria_kg} kg/d\xEDa) \xB7 Peor: ${esc(h.numero_interno||h.chip_uid||"(sin identificar)")} (${h.ganancia_diaria_kg} kg/d\xEDa)</p>
      `:""}
      ${f}

      ${t.con_protocolo>0?`
      <div class="stats-grid" style="grid-template-columns:repeat(3,1fr);margin-top:12px;">
        ${statCard('<img src="../prenadas.png" alt="" style="width:22px;height:22px;">',"Pre\xF1adas",t.pre\u00F1adas,"#2E7D32","rgba(46,125,50,0.1)")}
        ${statCard("\u{1F534}","Vac\xEDas",t.vacias,"#C0392B","rgba(192,57,43,0.08)")}
        ${statCard("\u23F3","Pendientes",t.pendientes,"#8FA0B8","rgba(143,160,184,0.12)")}
      </div>
      ${m}
      ${i!==null?`<p style="margin-top:10px;font-weight:800;font-size:15px;">% de pre\xF1ez (sobre diagnosticadas): ${i}%</p>`:""}
      `:""}
    </div>

    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
        <h4 class="section-title" style="font-size:14px;margin-bottom:0;">Cada animal en el grupo (${o.total_animales})</h4>
        ${n.length?`
        <button type="button" class="btn btn-ghost" id="btnOrdenRankingLote" style="padding:4px 10px;font-size:11px;margin-top:0;white-space:nowrap;">
          ${loteOrdenRanking==="desc"?"\u2B07\uFE0F Mejores primero":"\u2B06\uFE0F Peores primero"}
        </button>`:""}
      </div>
      ${n.length?`
      <div style="margin-top:8px;">
        ${n.map(s=>`
        <div class="list-item" style="cursor:default;">
          <div style="flex:1;min-width:0;cursor:pointer;" data-ver-animal="${s.animal_id}">
            <div class="list-title">${esc(s.numero_interno||s.chip_uid||"(sin identificar)")}</div>
            <div class="list-sub">
              ${s.peso_entrada_kg!=null?`Entrada: ${s.peso_entrada_kg} kg`:"Sin pesaje previo"} \u2192 Actual: ${s.peso_actual_kg!=null?`${s.peso_actual_kg} kg`:"sin dato"}
              ${s.resultado_reproductivo?` \xB7 ${esc(s.resultado_reproductivo)}`:""}
            </div>
          </div>
          <div style="text-align:right;font-weight:800;font-size:13px;${s.ganancia_diaria_kg==null?"color:var(--text-3);":s.ganancia_diaria_kg>=0?"color:#2E7D32;":"color:#C0392B;"}">
            ${s.ganancia_diaria_kg!=null?`${s.ganancia_diaria_kg} kg/d\xEDa`:"Sin datos"}
          </div>
          <button type="button" class="btn btn-ghost" data-quitar-de-lote="${s.animal_id}" style="padding:4px 8px;font-size:11px;margin-top:0;margin-left:6px;">\u2715</button>
        </div>`).join("")}
      </div>`:'<div class="empty">Todav\xEDa no hay ning\xFAn animal en este lote \u2014 sumalo desde la pesta\xF1a "Tareas".</div>'}
    </div>
    `:""}

    ${loteDetalleSubview==="tareas"?`
    <div class="row scroll-row" style="margin-top:0;margin-bottom:14px;">
      <button class="btn ${p?"btn-primary":"btn-ghost"}" type="button" data-lote-tarea="sumar" style="font-size:11px;padding:4px 10px;"><span class="btn-ico">\u2795</span> Sumar animal</button>
      <button class="btn ${loteTareaAbierta==="reproduccion"?"btn-primary":"btn-ghost"}" type="button" data-lote-tarea="reproduccion" style="font-size:11px;padding:4px 10px;"><span class="btn-ico"><img src="../reproduccion.png" alt="" style="width:13px;height:13px;object-fit:contain;vertical-align:-2px;"></span> Reproducci\xF3n</button>
      <button class="btn ${loteTareaAbierta==="sanidad"?"btn-primary":"btn-ghost"}" type="button" data-lote-tarea="sanidad" style="font-size:11px;padding:4px 10px;"><span class="btn-ico"><img src="../sanidad.png" alt="" style="width:13px;height:13px;object-fit:contain;vertical-align:-2px;"></span> Sanidad</button>
    </div>

    ${p?`
    <div class="card">
      <h4 class="section-title" style="font-size:14px;">Sumar animales</h4>
      <label>Escane\xE1 el chip de cada animal</label>
      <input id="loteEscaner" placeholder="Chip ya registrado o disponible \u2014 se agrega solo">
      <button class="btn btn-ghost btn-block" type="button" id="btnAbrirSeleccionGuardados" style="margin-top:10px;">\u{1F4CB} Elegir de mis animales guardados</button>
      <div class="row" style="gap:8px;margin-top:10px;">
        <button class="btn btn-ghost" type="button" id="btnLoteAgregarMacho" style="flex:1;">\u2642\uFE0F Macho sin chip</button>
        <button class="btn btn-ghost" type="button" id="btnLoteAgregarHembra" style="flex:1;">\u2640\uFE0F Hembra sin chip</button>
      </div>
    </div>

    <div class="card" id="loteDatosNuevos" style="${loteAnimales.length?"":"display:none;"}">
      <h4 class="section-title" style="font-size:14px;">Datos de los animales nuevos que vas a sumar</h4>
      <label>Raza *</label>
      <input id="loteRaza" placeholder="p. ej. Cerdo criollo yucateco">
      <div class="row">
        <div style="flex:1;min-width:140px;">
          <label>Color / pelaje</label>
          <input id="loteColor" placeholder="Opcional">
        </div>
        <div style="flex:1;min-width:140px;">
          <label>Fecha de nacimiento</label>
          <input type="date" id="loteFechaNacimiento">
        </div>
      </div>
      <label>Muesca / tatuaje</label>
      <input id="loteMarcaHierro" placeholder="Opcional">
      <label>Rancho / predio</label>
      <input id="loteUbicacion" placeholder="p. ej. Rancho El Progreso, Villaflores">
      <label>Observaciones</label>
      <textarea id="loteNotas" placeholder="p. ej. Compra a Rancho Los \xC1lamos, 17/08/2026"></textarea>
      <div id="loteFilas">${loteAnimales.map((s,b)=>filaLoteHtml(s,b)).join("")}</div>
      <button class="btn btn-primary btn-block" type="button" id="btnGuardarLote">Registrar y sumar al lote (<span id="loteContador">${loteAnimales.length}</span>)</button>
    </div>
    `:""}

    ${loteTareaAbierta==="reproduccion"?`
    <div class="card">
      <h4 class="section-title" style="font-size:14px;">Aplicar protocolo reproductivo al grupo</h4>
      <form id="formReproduccionLote">
        <label>Tipo de evento</label>
        <select name="tipo" required>
          <option value="Monta natural">Monta natural</option>
          <option value="Inseminaci\xF3n artificial">Inseminaci\xF3n artificial</option>
          <option value="Otro">Otro</option>
        </select>
        <div class="row" style="gap:8px;margin-top:9px;">
          <input name="semental" placeholder="Verraco / dosis seminal (opcional)" style="flex:1;">
          <input name="fecha" type="date" value="${new Date().toISOString().slice(0,10)}" style="flex:1;">
        </div>
        <label>Veterinario responsable</label>
        <input name="veterinario" placeholder="Opcional, si no sos vos">
        <label>Notas</label>
        <input name="notas" placeholder="Opcional">
        <button class="btn btn-primary btn-block" type="submit" style="margin-top:8px;">Aplicar a ${o.total_animales} animal(es)</button>
      </form>
    </div>
    `:""}

    ${loteTareaAbierta==="sanidad"?`
    <div class="card">
      <h4 class="section-title" style="font-size:14px;">Aplicar sanidad al grupo</h4>
      <form id="formSanidadLote">
        <label>Tipo de intervenci\xF3n</label>
        <select name="tipo" required>
          <option value="Vacuna">Vacuna</option>
          <option value="Desparasitaci\xF3n">Desparasitaci\xF3n</option>
          <option value="Tratamiento">Tratamiento</option>
          <option value="Revisi\xF3n veterinaria">Revisi\xF3n veterinaria</option>
          <option value="Otro">Otro</option>
        </select>
        <div class="row" style="gap:8px;margin-top:9px;">
          <input name="notas" placeholder="Notas (opcional)" style="flex:2;">
          <input name="fecha" type="date" value="${new Date().toISOString().slice(0,10)}" style="flex:1;">
        </div>
        <label>Producto / marca</label>
        <input name="producto" placeholder="Opcional">
        <div class="row" style="gap:8px;margin-top:9px;">
          <input name="lote_producto" placeholder="N\xB0 de lote (opcional)" style="flex:1;">
          <input name="dosis" placeholder="Dosis (opcional)" style="flex:1;">
        </div>
        <label>Veterinario responsable</label>
        <input name="veterinario" placeholder="Opcional, si no sos vos">
        <label>D\xEDas de retiro</label>
        <input name="dias_retiro" type="number" min="0" placeholder="Antes de vender o sacrificar (opcional)">
        <button class="btn btn-primary btn-block" type="submit" style="margin-top:8px;">Aplicar a ${o.total_animales} animal(es)</button>
      </form>
    </div>
    `:""}
    `:""}
  `}function abrirMasOpcionesLote(a){const e=document.createElement("div");e.className="modal-backdrop",e.innerHTML=`
    <div class="modal">
      <h3 class="section-title" style="margin-bottom:14px;">${esc(a.nombre)}</h3>
      <button class="btn btn-ghost btn-block" type="button" id="btnExportarExcelLote">\u2B07\uFE0F Exportar Excel</button>
      <button class="btn btn-ghost btn-block" type="button" id="btnQrLote" style="margin-top:8px;"><img src="../qr.png" alt="" style="width:20px;height:20px;vertical-align:-4px;margin-right:6px;">QR del lote</button>
      <button class="btn btn-ghost btn-block" type="button" id="btnEtiquetasQrLote" style="margin-top:8px;"><img src="../qr.png" alt="" style="width:20px;height:20px;vertical-align:-4px;margin-right:6px;">Etiquetas QR de sus animales (PDF)</button>
      <button class="btn btn-ghost btn-block" type="button" id="btnArchivarLote" style="margin-top:8px;">\u{1F5C4}\uFE0F Archivar lote</button>
      <button class="btn btn-ghost btn-block" type="button" id="btnEliminarLote" style="margin-top:8px;color:var(--red);">\u{1F5D1}\uFE0F Eliminar lote</button>
    </div>`,document.body.appendChild(e),e.addEventListener("click",o=>{o.target===e&&e.remove()}),document.getElementById("btnExportarExcelLote").onclick=()=>{e.remove(),exportarExcelLote(a.id)},document.getElementById("btnQrLote").onclick=async()=>{e.remove();try{const[o,n]=await Promise.all([mockApi.qrTrazabilidad({loteId:a.id}),mockApi.misRanchos().catch(()=>[])]);abrirQrTrazabilidad(a.nombre,["Lote",nombreDeRancho(n,a.rancho_id)].filter(Boolean),o)}catch(o){toast(o.message,"\u26A0\uFE0F")}},document.getElementById("btnEtiquetasQrLote").onclick=()=>{e.remove(),pdfEtiquetas({loteId:a.id},a.nombre)},document.getElementById("btnArchivarLote").onclick=async()=>{if(confirm("\xBFArchivar este lote? Los animales que tiene adentro no se tocan, solo deja de aparecer en la lista."))try{await mockApi.archivarLote(a.id),toast("Lote archivado","\u{1F5C4}\uFE0F"),e.remove(),loteAnimales=[],loteSeleccionadoId=null,loteScreenSubview="lista",renderApp()}catch(o){toast(o.message,"\u26A0\uFE0F")}},document.getElementById("btnEliminarLote").onclick=async()=>{if(confirm("\xBFEliminar este lote? A diferencia de archivar, esto NO se puede deshacer \u2014 el lote desaparece del todo (los animales y su historial de eventos no se tocan, solo pierden la referencia a este lote)."))try{await mockApi.eliminarLote(a.id),toast("Lote eliminado","\u{1F5D1}\uFE0F"),e.remove(),loteAnimales=[],loteSeleccionadoId=null,loteScreenSubview="lista",renderApp()}catch(o){toast(o.message,"\u26A0\uFE0F")}}}function abrirEditorLote(a){const e=document.createElement("div");e.className="modal-backdrop",e.innerHTML=`
    <div class="modal">
      <h3 class="section-title" style="margin-bottom:14px;">Editar lote</h3>
      <form id="formEditarLote">
        <label>Nombre *</label>
        <input name="nombre" value="${esc(a.nombre)}" required>
        <label>Funci\xF3n</label>
        ${selectTipoLote(a.tipo)}
        <label>Categor\xEDa</label>
        ${selectCategoriaLote("categoria",a.categoria||"")}
        <label>Notas</label>
        <textarea name="notas" placeholder="Opcional">${a.notas?esc(a.notas):""}</textarea>
        <button class="btn btn-primary btn-block" type="submit">Guardar cambios</button>
      </form>
    </div>`,document.body.appendChild(e),e.addEventListener("click",n=>{n.target===e&&e.remove()});const o=document.getElementById("formEditarLote");o.onsubmit=async n=>{n.preventDefault();const t=new FormData(o);try{await mockApi.editarLote(a.id,{nombre:t.get("nombre"),tipo:t.get("tipo"),categoria:t.get("categoria"),notas:t.get("notas")}),toast("Lote actualizado","\u270F\uFE0F"),e.remove(),renderApp()}catch(r){toast(r.message,"\u26A0\uFE0F")}}}function abrirSelectorAnimalesGuardados(a,e){const o=document.createElement("div");o.className="modal-backdrop",o.innerHTML=`
    <div class="modal">
      <h3 class="section-title" style="margin-bottom:2px;">Sumar animales</h3>
      <p class="small muted" style="margin-bottom:14px;">Eleg\xED cu\xE1les sumar a "${esc(a.nombre)}".</p>
      ${e.length?`
      <div style="max-height:50vh;overflow-y:auto;">
        ${e.map(t=>`
        <label class="check-row" style="padding:8px 0;border-bottom:1px solid var(--border);">
          <input type="checkbox" value="${t.id}" data-check-animal="${t.id}">
          <span style="flex:1;">${esc(etiquetaAnimal(t))} \u2014 ${esc(t.raza)}</span>
        </label>`).join("")}
      </div>
      <button class="btn btn-primary btn-block" type="button" id="btnConfirmarSeleccionGuardados">Sumar seleccionados</button>
      `:'<div class="empty">No ten\xE9s otros animales guardados para sumar.</div>'}
    </div>`,document.body.appendChild(o),o.addEventListener("click",t=>{t.target===o&&o.remove()});const n=document.getElementById("btnConfirmarSeleccionGuardados");n&&(n.onclick=async()=>{const t=Array.from(o.querySelectorAll("[data-check-animal]:checked")).map(r=>idPropio(r.value));if(!t.length){toast("No seleccionaste ning\xFAn animal","\u26A0\uFE0F");return}try{await mockApi.agregarAnimalesALote(a.id,t),toast(`${t.length} animal(es) sumado(s) al lote`,"\u2705"),o.remove(),renderApp()}catch(r){toast(r.message,"\u26A0\uFE0F")}})}function filaLoteHtml(a,e){return`
    <div class="card-flat" data-lote-fila="${e}">
      <div class="row" style="justify-content:space-between;align-items:center;">
        <b class="small">Animal nuevo</b>
        <button type="button" class="btn btn-ghost" data-lote-quitar="${e}" style="padding:4px 10px;font-size:11px;margin-top:0;">Quitar</button>
      </div>
      ${a.chip_uid?`
      <label style="margin-top:6px;">Chip</label>
      <input value="${esc(a.chip_uid)}" readonly style="background:transparent;font-weight:600;">
      `:""}
      <div class="row" style="margin-top:6px;">
        <div style="flex:1;min-width:100px;">
          <label style="margin-top:0;">Sexo</label>
          <select data-lote-campo="sexo" data-lote-idx="${e}">
            <option value="macho" ${a.sexo==="macho"?"selected":""}>Macho</option>
            <option value="hembra" ${a.sexo==="hembra"?"selected":""}>Hembra</option>
          </select>
        </div>
        <div style="flex:1;min-width:100px;">
          <label style="margin-top:0;">N\xB0 interno</label>
          <input data-lote-campo="numero_interno" data-lote-idx="${e}" value="${esc(a.numero_interno||"")}" placeholder="${a.chip_uid?"Opcional":"Obligatorio \u2014 no tiene chip"}">
        </div>
        <div style="flex:1;min-width:100px;">
          <label style="margin-top:0;">Peso (kg)</label>
          <input data-lote-campo="peso_actual_kg" data-lote-idx="${e}" type="number" step="0.1" min="0" value="${esc(a.peso_actual_kg||"")}" placeholder="Opcional">
        </div>
      </div>
    </div>`}function renderFilasLote(){const a=document.getElementById("loteFilas");if(!a)return;a.innerHTML=loteAnimales.map((n,t)=>filaLoteHtml(n,t)).join("");const e=document.getElementById("loteDatosNuevos"),o=document.getElementById("loteContador");o&&(o.textContent=String(loteAnimales.length)),e&&(e.style.display=loteAnimales.length?"":"none")}async function agregarChipALote(a){const e=(a||"").trim();if(!e)return;if(loteAnimales.some(t=>t.chip_uid===e)){toast("Ese chip ya est\xE1 en la lista del lote","\u26A0\uFE0F");return}let o;try{o=await mockApi.consultarChip(e)}catch(t){if(!_pareceErrorDeConexion(t)){toast(t.message,"\u26A0\uFE0F");return}loteAnimales.push({chip_uid:e,sexo:"macho",numero_interno:"",peso_actual_kg:""}),renderFilasLote();const r=document.getElementById("loteEscaner");r&&(r.value="",r.focus()),toast("Sin conexi\xF3n \u2014 el chip se agrega igual, se confirma cuando vuelva la se\xF1al","\u{1F4F4}");return}if(!o.existe){toast(o.advertencia||"Ese n\xFAmero no est\xE1 en el inventario","\u26A0\uFE0F");return}if(o.estado!=="en_stock"){toast(o.estado==="invalidado"?"Ese chip est\xE1 invalidado \u2014 no se puede usar":"Ese chip ya est\xE1 asignado a un animal","\u26A0\uFE0F");return}loteAnimales.push({chip_uid:e,sexo:"macho",numero_interno:"",peso_actual_kg:""}),renderFilasLote();const n=document.getElementById("loteEscaner");n&&(n.value="",n.focus()),toast("Animal agregado al lote","\u2795")}async function buscarMiAnimalPorIdentificador(a){const e=(a||"").trim().toLowerCase();return e&&(await mockApi.misAnimales()).find(n=>(n.chip_uid||"").toLowerCase()===e||(n.numero_interno||"").toLowerCase()===e)||null}async function dashboardAnimalHtml(a){const e=await mockApi.eventosDeAnimal(a.id),o=e.filter(i=>i.tipo==="pesaje").sort((i,d)=>i.fecha.localeCompare(d.fecha)),n=o.length?Math.max(...o.map(i=>i.peso_kg)):1,t=e.filter(i=>i.tipo==="sanidad").sort((i,d)=>d.fecha.localeCompare(i.fecha)),r=retiroActivoHoy(t);return`
    <div class="card" style="margin-top:10px;">
      <div class="row" style="justify-content:space-between;align-items:center;">
        <b>${esc(etiquetaAnimal(a))}</b>
        <span class="pill pill-${a.estado}">${etiquetaEstadoAnimal(a.estado)}</span>
      </div>
      <div class="small muted" style="margin-top:2px;">${a.chip_uid?"Chip: "+esc(a.chip_uid):"Sin chip oficial todav\xEDa"}</div>
      ${r?`
      <div style="margin-top:8px;padding:8px 10px;background:rgba(192,57,43,0.08);border-radius:10px;">
        <b style="color:var(--red);font-size:12.5px;">\u26A0\uFE0F En per\xEDodo de retiro hasta ${r.retiro_hasta}</b>
      </div>`:""}
      <div class="form-section-title">Peso</div>
      ${o.length?`<div class="timeline">${o.map(i=>filaPesaje(i,n)).join("")}</div>`:'<p class="small muted" style="margin-top:8px;">Todav\xEDa no hay pesajes cargados.</p>'}
      <div class="form-section-title">Sanidad</div>
      ${t.length?`<div class="timeline">${t.map(filaSanidad).join("")}</div>`:'<p class="small muted" style="margin-top:8px;">Todav\xEDa no hay sanidad cargada.</p>'}
    </div>`}function bindLookupAnimalRapido(a,e){const o=document.getElementById(a),n=document.getElementById(e);if(!o||!n)return;const t=async()=>{const r=await buscarMiAnimalPorIdentificador(o.value);n.innerHTML=r?await dashboardAnimalHtml(r):""};o.oninput=t,t()}function animalPorId(a,e){return e?a.find(o=>String(o.id)===String(e)):null}function celdaGenealogia(a,e,o){const n=a?etiquetaAnimal(a):e||null;return`<div class="${"pedigree-cel"+(o?" "+o:"")+(n?"":" pedigree-cel-vacio")}">${n?esc(n):"Sin cargar"}</div>`}function genealogiaHtml(a,e){const o=animalPorId(e,a.padre_id),n=animalPorId(e,a.madre_id),t=o?animalPorId(e,o.padre_id):null,r=o?animalPorId(e,o.madre_id):null,i=n?animalPorId(e,n.padre_id):null,d=n?animalPorId(e,n.madre_id):null;return`
    <div class="pedigree">
      <div>
        <div class="pedigree-label">Rama paterna</div>
        <div class="pedigree-branch">
          <div class="pedigree-grands">
            ${celdaGenealogia(t,o?o.padre_texto:null)}
            ${celdaGenealogia(r,o?o.madre_texto:null)}
          </div>
          ${celdaGenealogia(o,a.padre_texto,"pedigree-cel-padre")}
        </div>
      </div>
      <div>
        <div class="pedigree-label">Rama materna</div>
        <div class="pedigree-branch">
          <div class="pedigree-grands">
            ${celdaGenealogia(i,n?n.padre_texto:null)}
            ${celdaGenealogia(d,n?n.madre_texto:null)}
          </div>
          ${celdaGenealogia(n,a.madre_texto,"pedigree-cel-padre")}
        </div>
      </div>
    </div>`}function resumenProductividadHtml(a,e,o,n){const t=a.peso_nacimiento_kg?parseFloat(a.peso_nacimiento_kg):null,r=e.length?e[e.length-1]:null,i=r?r.peso_kg:a.peso_actual_kg?parseFloat(a.peso_actual_kg):null;let d=null,u=null;if(t!=null&&i!=null&&a.fecha_nacimiento){const p=r?r.fecha:a.peso_actual_fecha||new Date().toISOString().slice(0,10),s=Math.max(1,Math.round((new Date(p)-new Date(a.fecha_nacimiento))/864e5));d=i-t,u=d/s}let v=null;if(e.length>=2&&r){const p=new Date(r.fecha);p.setDate(p.getDate()-30);const s=[...e].reverse().find(w=>w!==r&&new Date(w.fecha)<=p)||e[0],b=Math.round((new Date(r.fecha)-new Date(s.fecha))/864e5);s!==r&&b>0&&(v=(r.peso_kg-s.peso_kg)/b)}const h=a.fecha_nacimiento?Math.max(0,Math.round((new Date-new Date(a.fecha_nacimiento))/864e5)):null,$=h==null?null:h<60?`${h} d\xEDa${h===1?"":"s"}`:h<730?`${Math.floor(h/30)} mes${Math.floor(h/30)===1?"":"es"}`:`${(h/365).toFixed(1)} a\xF1os`,k=r&&r.condicion_corporal?etiquetaCondicionCorporal(r.condicion_corporal):null,A=(o||[]).reduce((p,s)=>p+(parseFloat(s.litros_leche)||0),0),f=o&&o.length?A/o.length:null,y=(p,s)=>s==null?"":`
    <div class="card-flat" style="text-align:center;flex:1;min-width:110px;">
      <div style="font-size:1.1rem;font-weight:800;color:var(--primary);">${s}</div>
      <div class="small muted" style="margin-top:2px;">${p}</div>
    </div>`,m=[y("Edad",$),y("Peso al nacer",t!=null?t+" kg":null),y("Peso actual",i!=null?i+" kg":null),y("Ganancia total",d!=null?d.toFixed(1)+" kg":null),y("Ganancia diaria (hist\xF3rica)",u!=null?u.toFixed(2)+" kg/d\xEDa":null),y("Ganancia diaria (\xFAltimos 30 d\xEDas)",v!=null?v.toFixed(2)+" kg/d\xEDa":null),y("Pesajes cargados",e.length?String(e.length):null),y("Condici\xF3n actual",k),y("Intervenciones de sanidad",n&&n.length?String(n.length):null),y("Total de leche",o&&o.length?A.toFixed(1)+" L":null),y("Promedio por orde\xF1a",f!=null?f.toFixed(1)+" L":null)].join("");return`
    <div class="form-section-title" style="margin-top:0;">Productividad</div>
    ${m?`<div class="row" style="gap:8px;flex-wrap:wrap;margin-top:8px;">${m}</div>`:'<p class="small muted" style="margin-top:8px;">Todav\xEDa no hay suficientes datos de peso para calcular productividad.</p>'}
  `}const SUGERENCIAS_RESULTADO_REPRODUCCION=["Pre\xF1ada","Vac\xEDa","Positivo","Negativo","Aborto espont\xE1neo"];function camposReproduccion(a){return`
    <label>Tipo de evento</label>
    <select name="tipo" class="selectTipoReproduccion" data-sufijo="${a}" required>
      <option value="Monta natural">Monta natural</option>
      <option value="Inseminaci\xF3n artificial">Inseminaci\xF3n artificial</option>
      <option value="Diagn\xF3stico de gestaci\xF3n">Diagn\xF3stico de gestaci\xF3n</option>
      <option value="Parto">Parto</option>
      <option value="Aborto">Aborto</option>
      <option value="Destete">Destete</option>
      <option value="Otro">Otro</option>
    </select>
    <div class="row" style="gap:8px;margin-top:9px;">
      <input name="semental" placeholder="Verraco / dosis seminal (opcional)" style="flex:1;">
      <input name="fecha" type="date" class="inputFechaReproduccion" data-sufijo="${a}" value="${new Date().toISOString().slice(0,10)}" style="flex:1;">
    </div>
    <label>Veterinario responsable</label>
    <input name="veterinario" placeholder="Opcional, si no sos vos">
    <label>Resultado / observaci\xF3n</label>
    <input name="resultado" list="datalist-resultado-${a}" placeholder="Opcional" autocomplete="off">
    <datalist id="datalist-resultado-${a}">
      ${SUGERENCIAS_RESULTADO_REPRODUCCION.map(e=>`<option value="${e}"></option>`).join("")}
    </datalist>
    <div id="wrapParto_${a}" style="display:none;">
      <label>Fecha probable de parto</label>
      <input name="fecha_probable_parto" type="date">
    </div>
    <div id="wrapCria_${a}" style="display:none;">
      <div class="form-section-title" style="font-size:11px;">Datos de la cr\xEDa</div>
      <div class="row" style="gap:8px;margin-top:8px;">
        <select name="sexo_cria" style="flex:1;">
          <option value="">Sexo \u2014 sin especificar</option>
          <option value="macho">Macho</option>
          <option value="hembra">Hembra</option>
        </select>
        <input name="peso_cria_kg" type="number" step="0.1" min="0" placeholder="Peso al nacer (kg)" style="flex:1;">
      </div>
    </div>
    <label>Notas</label>
    <input name="notas" placeholder="Opcional">`}function bindCamposReproduccion(a){const e=document.querySelector(`.selectTipoReproduccion[data-sufijo="${a}"]`);if(!e)return;const o=document.querySelector(`.inputFechaReproduccion[data-sufijo="${a}"]`),n=document.getElementById(`wrapParto_${a}`),t=document.getElementById(`wrapCria_${a}`),r=n?n.querySelector('input[name="fecha_probable_parto"]'):null;let i=!1;r&&(r.oninput=()=>{i=!0});const d=()=>{const u=e.value==="Monta natural"||e.value==="Inseminaci\xF3n artificial",v=u||e.value==="Diagn\xF3stico de gestaci\xF3n";if(n&&(n.style.display=v?"":"none"),t&&(t.style.display=e.value==="Parto"?"":"none"),u&&r&&!i&&o&&o.value){const h=new Date(o.value+"T00:00:00");h.setDate(h.getDate()+DIAS_GESTACION),r.value=h.toISOString().slice(0,10)}};e.onchange=d,o&&(o.oninput=d),d()}function leerDatosReproduccionDeFormulario(a){return{tipo:a.get("tipo"),semental:a.get("semental").trim()||null,veterinario:a.get("veterinario").trim()||null,fecha:a.get("fecha")||null,resultado:a.get("resultado").trim()||null,fecha_probable_parto:a.get("fecha_probable_parto")||null,sexo_cria:a.get("sexo_cria")||null,peso_cria_kg:a.get("peso_cria_kg")||null,notas:a.get("notas").trim()||null}}function filaLineaDeTiempo(a,e,o){return`
    <div class="timeline-item">
      <div class="fecha">${fmtFechaEvento(a)}</div>
      <div class="titulo">${esc(e)}</div>
      ${o?`<div class="detalle">${o}</div>`:""}
    </div>`}function filaPesaje(a,e){const o=`
    ${a.condicion_corporal?`<div style="margin-bottom:4px;">${etiquetaCondicionCorporal(a.condicion_corporal)}</div>`:""}
    <div class="barra"><div style="width:${(a.peso_kg/e*100).toFixed(0)}%;"></div></div>`;return filaLineaDeTiempo(a.fecha,`${a.peso_kg} kg`,o)}function filaLeche(a){const e=a.notas?esc(a.notas):"";return filaLineaDeTiempo(a.fecha,`${a.litros_leche} L${a.descripcion?" \xB7 "+esc(a.descripcion):""}`,e)}function detalleSanidad(a){return[a.producto?`Producto: ${esc(a.producto)}`:null,a.lote_producto?`Lote ${esc(a.lote_producto)}`:null,a.retiro_hasta?`Retiro hasta ${fmtFechaEvento(a.retiro_hasta)}`:null,a.notas?esc(a.notas):null].filter(Boolean).join(" \xB7 ")}function filaSanidad(a){return filaLineaDeTiempo(a.fecha,a.descripcion,detalleSanidad(a))}function detalleReproduccion(a){return[a.producto,a.veterinario,a.resultado,a.fecha_probable_parto?`parto probable ${fmtFechaEvento(a.fecha_probable_parto)}`:null,a.sexo_cria?`cr\xEDa ${a.sexo_cria==="macho"?"macho":"hembra"}`:null,a.peso_cria_kg?`${a.peso_cria_kg} kg al nacer`:null,a.notas].filter(Boolean).map(esc).join(" \xB7 ")}function filaReproduccion(a){return filaLineaDeTiempo(a.fecha,a.descripcion,detalleReproduccion(a))}const DIAS_GESTACION=114,DIAS_AVISO_PARTO=14,DIAS_CICLO_ESTRAL=21,DIAS_CELO_POSDESTETE=7,DIAS_LACTANCIA=56;function ultimoEventoReproduccionPorHembra(a,e){const o=new Map(a.map(t=>[t.id,t])),n=new Map;return e.forEach(t=>{const r=o.get(t.animal_id);if(!r||r.sexo!=="hembra"||r.estado!=="vivo")return;const i=n.get(t.animal_id);(!i||t.fecha>i.evento.fecha)&&n.set(t.animal_id,{animal:r,evento:t})}),n}function calcularGestantes(a,e){const o=ultimoEventoReproduccionPorHembra(a,e),n=[];return o.forEach(({animal:t,evento:r})=>{const i=(r.descripcion||"").toLowerCase();r.fecha_probable_parto&&i!=="parto"&&n.push({animal:t,evento:r})}),n}function contarPrenadas(a,e){return calcularGestantes(a,e).length}function calcularAlertasReproduccion(a,e){const o=new Date;o.setHours(0,0,0,0);const n=(i,d)=>Math.round((d-i)/864e5),t=ultimoEventoReproduccionPorHembra(a,e),r=[];return t.forEach(({animal:i,evento:d})=>{const u=n(new Date(d.fecha),o),v=(d.descripcion||"").toLowerCase(),h=(d.resultado||"").toLowerCase();if(d.fecha_probable_parto&&v!=="parto"){const f=n(o,new Date(d.fecha_probable_parto+"T00:00:00"));f<=DIAS_AVISO_PARTO&&r.push({animal:i,tipo:"parto",urgente:f<=0,mensaje:f>0?`Parto esperado en ${f} d\xEDa${f===1?"":"s"} (${fmtFechaEvento(d.fecha_probable_parto)})`:`Parto atrasado por ${Math.abs(f)} d\xEDa${Math.abs(f)===1?"":"s"} \u2014 esperado el ${fmtFechaEvento(d.fecha_probable_parto)}`});return}const $=v==="monta natural"||v==="inseminaci\xF3n artificial",k=v==="diagn\xF3stico de gestaci\xF3n"&&(h.includes("vac")||h.includes("negativ")),A=v==="aborto";$&&u>=DIAS_CICLO_ESTRAL-3?r.push({animal:i,tipo:"celo",urgente:!1,mensaje:`Podr\xEDa estar en celo de nuevo \u2014 pasaron ${u} d\xEDas de su \xFAltima monta/inseminaci\xF3n sin diagn\xF3stico cargado`}):(k||A)&&u>=DIAS_CICLO_ESTRAL-5?r.push({animal:i,tipo:"celo",urgente:!1,mensaje:A?`Aborto hace ${u} d\xEDas \u2014 podr\xEDa estar volviendo a estar en celo`:`Diagn\xF3stico negativo hace ${u} d\xEDas \u2014 podr\xEDa estar volviendo a estar en celo`}):v==="destete"&&u>=DIAS_CELO_POSDESTETE?r.push({animal:i,tipo:"celo",urgente:!1,mensaje:`Pasaron ${u} d\xEDas del destete sin una nueva monta \u2014 la cerda suele volver a celo entre 4 y 7 d\xEDas despu\xE9s`}):v==="parto"&&u>=DIAS_LACTANCIA&&r.push({animal:i,tipo:"destete",urgente:!1,mensaje:`Lleva ${u} d\xEDas de lactancia \u2014 considera destetar la camada`})}),r.sort((i,d)=>d.urgente-i.urgente||esc(etiquetaAnimal(i.animal)).localeCompare(esc(etiquetaAnimal(d.animal))))}function filaAlertaReproduccion(a){return`
    <div class="card-flat" style="${a.urgente?"border-color:var(--red);background:rgba(192,57,43,0.06);":""}margin-top:8px;">
      <b style="${a.urgente?"color:var(--red);":""}">${a.tipo==="parto"?"\u{1F423}":"\u{1F501}"} ${esc(etiquetaAnimal(a.animal))}</b>
      <p class="small muted" style="margin-top:2px;">${esc(a.mensaje)}</p>
    </div>`}async function abrirFichaAnimal(a){let e,o,n;try{[e,o,n]=await Promise.all([mockApi.obtenerAnimal(a),mockApi.eventosDeAnimal(a),mockApi.misAnimales()])}catch(p){toast(p.message,"\u26A0\uFE0F");return}if(!e)return;const t=(p,s)=>s?`<div class="ficha-row"><span class="k">${p}</span><span class="v">${esc(s)}</span></div>`:"",r=o.filter(p=>p.tipo==="pesaje").sort((p,s)=>p.fecha.localeCompare(s.fecha)),i=r.length?Math.max(...r.map(p=>p.peso_kg)):1,d=o.filter(p=>p.tipo==="produccion_leche").sort((p,s)=>s.fecha.localeCompare(p.fecha)),u=o.filter(p=>p.tipo==="sanidad").sort((p,s)=>s.fecha.localeCompare(p.fecha)),v=o.filter(p=>p.tipo==="reproduccion").sort((p,s)=>s.fecha.localeCompare(p.fecha)),h=retiroActivoHoy(u),$=animalPorId(n,e.padre_id),k=animalPorId(n,e.madre_id),A=$||k||e.padre_texto||e.madre_texto?"\u270F\uFE0F Editar genealog\xEDa":"\u2795 Agregar genealog\xEDa",f=document.createElement("div");f.className="modal-backdrop modal-backdrop-full",f.innerHTML=`
    <div class="modal modal-full">
      <div class="back-row" style="justify-content:space-between;">
        <div class="row" style="align-items:center;gap:8px;">
          <button class="back-btn" id="btnCerrarFicha">\u2190</button>
          <h3 class="section-title" style="margin-bottom:0;">${esc(etiquetaAnimal(e))}</h3>
        </div>
        <span class="pill pill-${e.estado}">${etiquetaEstadoAnimal(e.estado)}</span>
      </div>
      ${h?`
      <div class="card-flat" style="background:rgba(192,57,43,0.08);">
        <b style="color:var(--red);">\u26A0\uFE0F En per\xEDodo de retiro hasta ${h.retiro_hasta}</b>
        <p class="small muted" style="margin-top:4px;">No deber\xEDa venderse ni sacrificarse todav\xEDa.</p>
      </div>`:""}

      <!-- Historial primero \u2014 es lo que m\xE1s se consulta d\xEDa a d\xEDa, no
           hace falta pasar por los datos fijos del animal para verlo. -->
      <div class="ficha-tabs">
        <button type="button" class="ficha-tab active" data-ficha-tab="resumen">Resumen</button>
        <button type="button" class="ficha-tab" data-ficha-tab="pesajes">Pesajes</button>
        <button type="button" class="ficha-tab" data-ficha-tab="sanidad">Sanidad</button>
        <button type="button" class="ficha-tab" data-ficha-tab="genealogia">Genealog\xEDa</button>
        <button type="button" class="ficha-tab" data-ficha-tab="reproduccion">Reproducci\xF3n</button>
      </div>

      <div class="card-flat ficha-tab-panel" data-ficha-panel="resumen">
        ${resumenProductividadHtml(e,r,d,u)}
        <div class="form-section-title">Identificaci\xF3n</div>
        ${t("Chip",e.chip_uid)}
        ${t("N\xB0 interno",e.numero_interno)}
        ${t("Raza",e.raza)}
        ${t("Color",e.color)}
        ${t("Sexo",e.sexo==="macho"?"Macho":"Hembra")}
        ${t("Categor\xEDa",categoriaPorcina(e.sexo,e.fecha_nacimiento))}
        ${t("Fecha de nacimiento",e.fecha_nacimiento)}
        ${t("Muesca / tatuaje",e.marca_hierro)}
        <div class="form-section-title">Ubicaci\xF3n</div>
        ${t("Rancho / predio",e.ubicacion_actual)}
        ${t("Notas",e.notas)}
      </div>

      <div class="card-flat ficha-tab-panel" data-ficha-panel="pesajes" style="display:none;">
        ${t("Al nacer",e.peso_nacimiento_kg?e.peso_nacimiento_kg+" kg":null)}
        ${r.length?`<div class="timeline">${r.map(p=>filaPesaje(p,i)).join("")}</div>`:'<p class="small muted" style="margin-top:8px;">Todav\xEDa no hay pesajes cargados.</p>'}
        <button class="btn btn-ghost btn-block" type="button" id="btnToggleFormPesajeFicha" style="margin-top:12px;">\u2795 Registrar pesaje</button>
        <form id="formPesajeFicha" style="margin-top:12px;display:none;">
          <div class="row" style="gap:8px;">
            <input name="peso_kg" type="number" step="0.1" min="0" required placeholder="Peso (kg)" style="flex:1;">
            <input name="fecha" type="date" value="${new Date().toISOString().slice(0,10)}" style="flex:1;">
          </div>
          <select name="condicion_corporal" style="margin-top:9px;">
            <option value="">Condici\xF3n corporal \u2014 sin evaluar (opcional)</option>
            <option value="1">1 \xB7 Muy flaco</option>
            <option value="2">2 \xB7 Flaco</option>
            <option value="3">3 \xB7 \xD3ptimo</option>
            <option value="4">4 \xB7 Gordo</option>
            <option value="5">5 \xB7 Muy gordo</option>
          </select>
          <input name="notas" placeholder="Notas (opcional)" style="margin-top:9px;">
          <button class="btn btn-primary btn-block" type="submit" style="margin-top:8px;">Registrar pesaje</button>
        </form>
      </div>

      <div class="card-flat ficha-tab-panel" data-ficha-panel="sanidad" style="display:none;">
        ${u.length?`<div class="timeline">${u.map(filaSanidad).join("")}</div>`:'<p class="small muted" style="margin-top:8px;">Todav\xEDa no hay sanidad cargada.</p>'}
        <button class="btn btn-ghost btn-block" type="button" id="btnToggleFormSanidadFicha" style="margin-top:12px;">\u2795 Registrar sanidad</button>
        <form id="formSanidadFicha" style="margin-top:12px;display:none;">
          <label>Tipo de intervenci\xF3n</label>
          <select name="tipo" required>
            <option value="Vacuna">Vacuna</option>
            <option value="Desparasitaci\xF3n">Desparasitaci\xF3n</option>
            <option value="Tratamiento">Tratamiento</option>
            <option value="Revisi\xF3n veterinaria">Revisi\xF3n veterinaria</option>
            <option value="Otro">Otro</option>
          </select>
          <div class="row" style="gap:8px;margin-top:9px;">
            <input name="notas" placeholder="Notas (opcional)" style="flex:2;">
            <input name="fecha" type="date" value="${new Date().toISOString().slice(0,10)}" style="flex:1;">
          </div>
          <div style="margin-top:8px;">
            <label>Producto / marca</label>
            <input name="producto" placeholder="Opcional">
            <div class="row" style="gap:8px;margin-top:9px;">
              <input name="lote_producto" placeholder="N\xB0 de lote (opcional)" style="flex:1;">
              <input name="dosis" placeholder="Dosis (opcional)" style="flex:1;">
            </div>
            <label>Veterinario responsable</label>
            <input name="veterinario" placeholder="Opcional, si no sos vos">
            <label>D\xEDas de retiro</label>
            <input name="dias_retiro" type="number" min="0" placeholder="Antes de vender o sacrificar (opcional)">
          </div>
          <button class="btn btn-primary btn-block" type="submit" style="margin-top:8px;">Registrar sanidad</button>
        </form>
      </div>

      <div class="card-flat ficha-tab-panel" data-ficha-panel="genealogia" style="display:none;">
        ${genealogiaHtml(e,n)}
        <button class="btn btn-ghost btn-block" type="button" id="btnToggleFormGenealogiaFicha" style="margin-top:12px;">${A}</button>
        <form id="formGenealogiaFicha" style="margin-top:12px;display:none;">
          <label>Padre \u2014 N\xB0 interno/chip del propio reba\xF1o, o un nombre si no est\xE1 en el sistema</label>
          <input name="padre" placeholder="Busc\xE1 por N\xB0 interno o chip, o escrib\xED un nombre" list="sugerenciasPadreFicha" autocomplete="off" value="${$?esc(etiquetaAnimal($)):esc(e.padre_texto||"")}">
          <datalist id="sugerenciasPadreFicha">${opcionesIdentificadorAnimales(n.filter(p=>p.sexo==="macho"&&p.id!==e.id))}</datalist>
          <label>Madre \u2014 N\xB0 interno/chip del propio reba\xF1o, o un nombre si no est\xE1 en el sistema</label>
          <input name="madre" placeholder="Busc\xE1 por N\xB0 interno o chip, o escrib\xED un nombre" list="sugerenciasMadreFicha" autocomplete="off" value="${k?esc(etiquetaAnimal(k)):esc(e.madre_texto||"")}">
          <datalist id="sugerenciasMadreFicha">${opcionesIdentificadorAnimales(n.filter(p=>p.sexo==="hembra"&&p.id!==e.id))}</datalist>
          <button class="btn btn-primary btn-block" type="submit" style="margin-top:8px;">Guardar genealog\xEDa</button>
        </form>
      </div>

      <div class="card-flat ficha-tab-panel" data-ficha-panel="reproduccion" style="display:none;">
        ${v.length?`<div class="timeline">${v.map(filaReproduccion).join("")}</div>`:'<p class="small muted" style="margin-top:8px;">Todav\xEDa no hay eventos de reproducci\xF3n cargados.</p>'}
        <button class="btn btn-ghost btn-block" type="button" id="btnToggleFormReproduccionFicha" style="margin-top:12px;">\u2795 Registrar evento</button>
        <form id="formReproduccionFicha" style="margin-top:12px;display:none;">
          ${camposReproduccion("ficha")}
          <button class="btn btn-primary btn-block" type="submit" style="margin-top:8px;">Registrar evento</button>
        </form>
      </div>

      <button class="btn btn-ghost btn-block" type="button" id="btnQrAnimal"><img src="../qr.png" alt="" style="width:20px;height:20px;vertical-align:-4px;margin-right:6px;">QR de trazabilidad</button>
      ${e.estado==="vivo"?`
      <button class="btn btn-ghost btn-block" id="btnDarDeBaja" style="color:var(--red);">Dar de baja (muri\xF3 / se perdi\xF3)</button>
      `:""}
    </div>`,document.body.appendChild(f),document.getElementById("btnCerrarFicha").onclick=()=>f.remove(),f.querySelectorAll(".ficha-tab").forEach(p=>{p.onclick=()=>{f.querySelectorAll(".ficha-tab").forEach(b=>b.classList.remove("active")),p.classList.add("active");const s=p.dataset.fichaTab;f.querySelectorAll(".ficha-tab-panel").forEach(b=>{b.style.display=b.dataset.fichaPanel===s?"":"none"})}});const y=(p,s,b)=>{const w=document.getElementById(p),S=document.getElementById(s);!w||!S||(w.onclick=()=>{const R=S.style.display==="none";S.style.display=R?"":"none",w.textContent=R?"\u25B2 Ocultar":b})};y("btnToggleFormPesajeFicha","formPesajeFicha","\u2795 Registrar pesaje"),y("btnToggleFormSanidadFicha","formSanidadFicha","\u2795 Registrar sanidad"),y("btnToggleFormGenealogiaFicha","formGenealogiaFicha",A),y("btnToggleFormReproduccionFicha","formReproduccionFicha","\u2795 Registrar evento"),bindCamposReproduccion("ficha"),document.getElementById("formPesajeFicha").onsubmit=async p=>{p.preventDefault();const s=new FormData(p.target);try{await mockApi.registrarPesaje(e.id,{peso_kg:s.get("peso_kg"),fecha:s.get("fecha")||null,condicion_corporal:s.get("condicion_corporal")||null,notas:s.get("notas").trim()||null}),toast("Pesaje guardado","\u2696\uFE0F"),f.remove(),abrirFichaAnimal(e.id)}catch(b){toast(b.message,"\u26A0\uFE0F")}},document.getElementById("formSanidadFicha").onsubmit=async p=>{p.preventDefault();const s=new FormData(p.target);try{await mockApi.registrarSanidad(e.id,{tipo:s.get("tipo"),notas:s.get("notas").trim()||null,fecha:s.get("fecha")||null,producto:s.get("producto").trim()||null,lote_producto:s.get("lote_producto").trim()||null,dosis:s.get("dosis").trim()||null,veterinario:s.get("veterinario").trim()||null,dias_retiro:s.get("dias_retiro")||null}),toast("Sanidad registrada","\u{1F489}"),f.remove(),abrirFichaAnimal(e.id)}catch(b){toast(b.message,"\u26A0\uFE0F")}},document.getElementById("formReproduccionFicha").onsubmit=async p=>{p.preventDefault();const s=new FormData(p.target);try{await mockApi.registrarReproduccion(e.id,leerDatosReproduccionDeFormulario(s)),toast("Evento de reproducci\xF3n registrado","\u{1F404}"),f.remove(),abrirFichaAnimal(e.id)}catch(b){toast(b.message,"\u26A0\uFE0F")}},document.getElementById("formGenealogiaFicha").onsubmit=async p=>{p.preventDefault();const s=new FormData(p.target),b=(s.get("padre")||"").trim(),w=(s.get("madre")||"").trim(),S=b?await buscarMiAnimalPorIdentificador(b):null,R=w?await buscarMiAnimalPorIdentificador(w):null;try{await mockApi.editarGenealogiaAnimal(e.id,{padre_id:S?S.id:null,padre_texto:S?null:b||null,madre_id:R?R.id:null,madre_texto:R?null:w||null}),toast("Genealog\xEDa guardada","\u{1F333}"),f.remove(),abrirFichaAnimal(e.id)}catch(j){toast(j.message,"\u26A0\uFE0F")}},document.getElementById("btnQrAnimal").onclick=async()=>{try{const[p,s]=await Promise.all([mockApi.qrTrazabilidad({animalId:e.id}),mockApi.misRanchos().catch(()=>[])]);abrirQrTrazabilidad(etiquetaAnimal(e),lineasEtiquetaAnimal(e,nombreDeRancho(s,e.rancho_id)),p)}catch(p){toast(p.message,"\u26A0\uFE0F")}};const m=document.getElementById("btnDarDeBaja");m&&(m.onclick=async()=>{const p=prompt("\xBFPor qu\xE9 se da de baja? (muri\xF3, se perdi\xF3, robo, etc.)");if(p!==null){if(!p.trim()){toast("Falta el motivo","\u26A0\uFE0F");return}try{await mockApi.darDeBajaAnimal(e.id,p.trim()),toast("Animal dado de baja","\u2620\uFE0F"),f.remove()}catch(s){toast(s.message,"\u26A0\uFE0F")}}})}function opcionesIdentificadorAnimales(a){const e=[],o=(n,t)=>{n&&e.push(`<option value="${esc(n)}">${esc(etiquetaAnimal(t))} \u2014 ${esc(t.raza||"")}</option>`)};return a.forEach(n=>{o(n.numero_interno,n),o(n.chip_uid,n)}),e.join("")}async function viewSanidad(){const[a,e]=await Promise.all([mockApi.misAnimales(),mockApi.misEventosAnimal("sanidad",200)]),o={};a.forEach(i=>{o[i.id]=i});const n=i=>o[i.animal_id],t=e.slice(0,30),r=a.map(i=>({a:i,retiro:retiroActivoHoy(e.filter(d=>d.animal_id===i.id))})).filter(i=>i.retiro);return`
    <h3 class="section-title" style="margin-bottom:4px;">Sanidad</h3>
    <div class="ficha-tabs">
      <button type="button" class="ficha-tab ${sanidadSubview==="registrar"?"active":""}" data-sanidad-tab="registrar">Registrar evento</button>
      <button type="button" class="ficha-tab ${sanidadSubview==="alertas"?"active":""}" data-sanidad-tab="alertas">Alertas${r.length?` (${r.length})`:""}</button>
      <button type="button" class="ficha-tab ${sanidadSubview==="historial"?"active":""}" data-sanidad-tab="historial">Historial</button>
    </div>

    ${sanidadSubview==="registrar"?`
    <div class="card">
      <h3 class="section-title">Registrar sanidad</h3>
      ${a.length?"":'<p class="small muted" style="margin-bottom:8px;">Todav\xEDa no ten\xE9s ning\xFAn animal registrado.</p>'}
      <form id="formSanidadRapida">
        <label>N\xFAmero de animal o chip</label>
        <input id="identificadorSanidad" name="identificador" required placeholder="N\xB0 interno o chip \u2014 o escane\xE1 con el lector" list="sugerenciasIdentificadorSanidad" autocomplete="off">
        <datalist id="sugerenciasIdentificadorSanidad">${opcionesIdentificadorAnimales(a)}</datalist>
        <div id="historialAnimalSanidad"></div>
        <label>Tipo de intervenci\xF3n</label>
        <select name="tipo" required>
          <option value="Vacuna">Vacuna</option>
          <option value="Desparasitaci\xF3n">Desparasitaci\xF3n</option>
          <option value="Tratamiento">Tratamiento</option>
          <option value="Revisi\xF3n veterinaria">Revisi\xF3n veterinaria</option>
          <option value="Otro">Otro</option>
        </select>
        <div class="row" style="gap:8px;margin-top:9px;">
          <input name="notas" placeholder="Notas (opcional)" style="flex:2;">
          <input name="fecha" type="date" value="${new Date().toISOString().slice(0,10)}" style="flex:1;">
        </div>
        <div style="margin-top:8px;">
          <label>Producto / marca</label>
          <input name="producto" placeholder="Opcional">
          <div class="row" style="gap:8px;margin-top:9px;">
            <input name="lote_producto" placeholder="N\xB0 de lote (opcional)" style="flex:1;">
            <input name="dosis" placeholder="Dosis (opcional)" style="flex:1;">
          </div>
          <label>Veterinario responsable</label>
          <input name="veterinario" placeholder="Opcional, si no sos vos">
          <label>D\xEDas de retiro</label>
          <input name="dias_retiro" type="number" min="0" placeholder="Antes de vender o sacrificar (opcional)">
        </div>
        <button class="btn btn-primary btn-block" type="submit" style="margin-top:8px;">Guardar</button>
      </form>
    </div>
    `:""}

    ${sanidadSubview==="alertas"?`
    <div class="card" style="${r.length?"border-color:var(--red);background:rgba(192,57,43,0.06);":""}">
      <b style="${r.length?"color:var(--red);":""}">\u26A0\uFE0F En per\xEDodo de retiro</b>
      <p class="small muted" style="margin-top:4px;">No deber\xEDan venderse ni sacrificarse todav\xEDa.</p>
      ${r.length?r.map(i=>`<p class="small" style="margin-top:6px;">${esc(etiquetaAnimal(i.a))} \u2014 hasta ${i.retiro.retiro_hasta}</p>`).join(""):'<div class="empty">Sin alertas por ahora.</div>'}
    </div>
    `:""}

    ${sanidadSubview==="historial"?`
    <div class="card">
      <h3 class="section-title">Historial</h3>
      ${t.length?t.map(i=>`
        <div class="ficha-row">
          <span class="k">${fmtFechaEvento(i.fecha)} \xB7 ${esc(etiquetaAnimal(n(i)))}${i.producto?" \xB7 "+esc(i.producto):""}${i.lote_producto?` (lote ${esc(i.lote_producto)})`:""}${i.notas?" \xB7 "+esc(i.notas):""}${i.retiro_hasta?` \xB7 retiro hasta ${i.retiro_hasta}`:""}</span>
          <span class="v">${esc(i.descripcion)}</span>
        </div>`).join(""):'<div class="empty">Todav\xEDa no cargaste sanidad.</div>'}
    </div>
    `:""}
  `}function diasHastaFecha(a){const e=new Date;e.setHours(0,0,0,0);const o=new Date(a+"T00:00:00");return Math.round((o-e)/864e5)}function fechaISO(a,e,o){return`${a}-${String(e+1).padStart(2,"0")}-${String(o).padStart(2,"0")}`}const NOMBRES_MES=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"],ICONO_TIPO_EVENTO_CALENDARIO={pesaje:"../pesaje.png",sanidad:"../sanidad.png",reproduccion:"../reproduccion.png",leche:"../leche.png"},PLANTILLA_VACUNACION_POR_EDAD=[{nombre:"Aplicaci\xF3n de hierro",dias:3},{nombre:"Castraci\xF3n (si no se queda como verraco)",dias:14,soloMachos:!0},{nombre:"Desparasitaci\xF3n al destete",dias:56},{nombre:"Vacunaci\xF3n (seg\xFAn indicaci\xF3n del MVZ)",dias:60},{nombre:"Segunda desparasitaci\xF3n",meses:4},{nombre:"Revisi\xF3n de aptitud reproductiva",meses:7}];async function generarRecordatoriosVacunacion(a,e,o){const n=new Date().toISOString().slice(0,10),t=new Date(e+"T00:00:00");let r=0;for(const i of PLANTILLA_VACUNACION_POR_EDAD){if(i.soloHembras&&o!=="hembra"||i.soloMachos&&o!=="macho")continue;const d=new Date(t);i.dias?d.setDate(d.getDate()+i.dias):d.setMonth(d.getMonth()+i.meses);const u=d.toISOString().slice(0,10);if(!(u<n))try{await mockApi.crearRecordatorioSanitario({nombre:`${a} \u2014 ${i.nombre}`,proximaFecha:u}),r++}catch{}}return r}async function viewCalendario(){const a=new Date().toISOString().slice(0,10),[e,o,n,t,r,i]=await Promise.all([mockApi.misAnimales(),mockApi.misEventosAnimal("pesaje",500),mockApi.misEventosAnimal("sanidad",500),mockApi.misEventosAnimal("reproduccion",500),mockApi.misEventosAnimal("produccion_leche",500),mockApi.listarRecordatoriosSanitarios()]),d=new Map(e.map(m=>[m.id,m])),u=new Map,v=(m,p)=>{const s=m.slice(0,10);u.has(s)||u.set(s,[]),u.get(s).push(p)};o.forEach(m=>v(m.fecha,{tipo:"pesaje",animal:d.get(m.animal_id),detalle:`${m.peso_kg} kg`})),n.forEach(m=>v(m.fecha,{tipo:"sanidad",animal:d.get(m.animal_id),detalle:m.descripcion})),t.forEach(m=>v(m.fecha,{tipo:"reproduccion",animal:d.get(m.animal_id),detalle:m.descripcion})),r.forEach(m=>v(m.fecha,{tipo:"leche",animal:d.get(m.animal_id),detalle:`${m.litros_leche} L`})),i.forEach(m=>v(m.proxima_fecha,{tipo:"recordatorio",animal:null,detalle:m.nombre,recordatorio:m}));const h=new Date(calendarioAnio,calendarioMes,1),$=new Date(calendarioAnio,calendarioMes+1,0).getDate(),k=[];for(let m=0;m<h.getDay();m++)k.push(null);for(let m=1;m<=$;m++)k.push(m);const A=m=>{if(m==null)return'<div class="calendario-dia calendario-dia-vacia"></div>';const p=fechaISO(calendarioAnio,calendarioMes,m),s=u.get(p)||[],b=s.some(S=>S.tipo==="recordatorio"&&p<a),w=["calendario-dia"];return p===a&&w.push("calendario-dia-hoy"),p===calendarioDiaSeleccionado&&w.push("calendario-dia-activa"),`
      <div class="${w.join(" ")}" data-cal-dia="${p}">
        <span class="calendario-num">${m}</span>
        ${s.length?`<span class="calendario-punto${b?" calendario-punto-alerta":""}"></span>`:""}
      </div>`},f=calendarioDiaSeleccionado?u.get(calendarioDiaSeleccionado)||[]:null,y=calendarioDiaSeleccionado?`
    <div class="card">
      <h3 class="section-title">${fmtFechaEvento(calendarioDiaSeleccionado)}</h3>
      ${f.length?f.map(m=>m.tipo==="recordatorio"?`
        <div class="ficha-row" style="align-items:center;">
          <span class="k">\u{1F4C5} ${esc(m.detalle)}</span>
          <div class="row" style="gap:6px;">
            <button class="btn btn-ghost" style="padding:4px 8px;font-size:11px;" data-recordatorio-hecho="${m.recordatorio.id}" type="button">Hecho</button>
            <button class="btn btn-ghost" style="padding:4px 8px;font-size:11px;" data-recordatorio-eliminar="${m.recordatorio.id}" type="button">\u2715</button>
          </div>
        </div>`:`
        <div class="ficha-row" ${m.animal?`style="cursor:pointer;" data-ver-animal="${m.animal.id}"`:""}>
          <span class="k"><img src="${ICONO_TIPO_EVENTO_CALENDARIO[m.tipo]}" alt="" style="width:15px;height:15px;object-fit:contain;vertical-align:-3px;"> ${esc(m.animal?etiquetaAnimal(m.animal):"(animal eliminado)")}${m.detalle?" \xB7 "+esc(m.detalle):""}</span>
        </div>`).join(""):'<p class="small muted">Nada registrado ni programado este d\xEDa.</p>'}
    </div>`:"";return`
    <h3 class="section-title" style="margin-bottom:14px;">Calendario</h3>

    <div class="card">
      <div class="row" style="justify-content:space-between;align-items:center;">
        <button class="btn btn-ghost" type="button" data-cal-mes="-1" style="padding:6px 12px;">\u2039</button>
        <b>${NOMBRES_MES[calendarioMes]} ${calendarioAnio}</b>
        <button class="btn btn-ghost" type="button" data-cal-mes="1" style="padding:6px 12px;">\u203A</button>
      </div>
      <div class="calendario-grid" style="margin-top:10px;">
        <div class="calendario-dow">D</div><div class="calendario-dow">L</div><div class="calendario-dow">M</div>
        <div class="calendario-dow">M</div><div class="calendario-dow">J</div><div class="calendario-dow">V</div><div class="calendario-dow">S</div>
        ${k.map(A).join("")}
      </div>
    </div>

    ${y}

    <button class="btn btn-ghost btn-block" type="button" id="btnToggleFormRecordatorio">${calendarioFormAbierto?"\u25B2 Ocultar":"\u2795 Nuevo recordatorio"}</button>
    ${calendarioFormAbierto?`
    <div class="card">
      <form id="formRecordatorioSanitario">
        <label>Nombre \u2014 p. ej. Aftosa, Desparasitaci\xF3n</label>
        <input name="nombre" required placeholder="Nombre">
        <div class="row" style="gap:8px;margin-top:9px;">
          <input name="proxima_fecha" type="date" required value="${new Date().toISOString().slice(0,10)}" style="flex:1;">
          <select name="frecuencia_meses" style="flex:1;">
            <option value="">Una sola vez</option>
            <option value="1">Cada mes</option>
            <option value="3">Cada 3 meses</option>
            <option value="6">Cada 6 meses</option>
            <option value="12">Cada 12 meses</option>
          </select>
        </div>
        <input name="notas" placeholder="Notas (opcional)" style="margin-top:9px;">
        <button class="btn btn-primary btn-block" type="submit" style="margin-top:8px;">Agregar</button>
      </form>
    </div>
    `:""}
  `}async function viewPesaje(){const[a,e]=await Promise.all([mockApi.misAnimales(),mockApi.misEventosAnimal("pesaje",30)]),o={};a.forEach(t=>{o[t.id]=t});const n=t=>o[t.animal_id];return`
    <h3 class="section-title" style="margin-bottom:14px;">Pesaje</h3>
    <div class="card">
      <h3 class="section-title">Registrar pesaje</h3>
      ${a.length?"":'<p class="small muted" style="margin-bottom:8px;">Todav\xEDa no ten\xE9s ning\xFAn animal registrado.</p>'}
      <form id="formPesajeRapido">
        <label>N\xFAmero de animal o chip</label>
        <input id="identificadorPesaje" name="identificador" required placeholder="N\xB0 interno o chip \u2014 o escane\xE1 con el lector" list="sugerenciasIdentificadorPesaje" autocomplete="off">
        <datalist id="sugerenciasIdentificadorPesaje">${opcionesIdentificadorAnimales(a)}</datalist>
        <div id="historialAnimalPesaje"></div>
        <div class="row" style="gap:8px;margin-top:9px;">
          <input name="peso_kg" type="number" step="0.1" min="0" required placeholder="Peso (kg)" style="flex:1;">
          <input name="fecha" type="date" value="${new Date().toISOString().slice(0,10)}" style="flex:1;">
        </div>
        <label>Condici\xF3n corporal</label>
        <select name="condicion_corporal">
          <option value="">Sin evaluar (opcional)</option>
          <option value="1">1 \xB7 Muy flaco</option>
          <option value="2">2 \xB7 Flaco</option>
          <option value="3">3 \xB7 \xD3ptimo</option>
          <option value="4">4 \xB7 Gordo</option>
          <option value="5">5 \xB7 Muy gordo</option>
        </select>
        <label>Notas</label>
        <input name="notas" placeholder="Opcional">
        <button class="btn btn-primary btn-block" type="submit" style="margin-top:8px;">Guardar</button>
      </form>
    </div>
    <div class="card">
      <h3 class="section-title">Historial</h3>
      ${e.length?e.map(t=>`
        <div class="ficha-row">
          <span class="k">${fmtFechaEvento(t.fecha)} \xB7 ${esc(etiquetaAnimal(n(t)))}${t.condicion_corporal?" \xB7 "+etiquetaCondicionCorporal(t.condicion_corporal):""}${t.notas?" \xB7 "+esc(t.notas):""}</span>
          <span class="v">${t.peso_kg} kg</span>
        </div>`).join(""):'<div class="empty">Todav\xEDa no cargaste pesajes.</div>'}
    </div>
  `}async function viewLeche(){const[a,e]=await Promise.all([mockApi.misAnimales(),mockApi.misEventosAnimal("produccion_leche",30)]),o={};a.forEach(t=>{o[t.id]=t});const n=t=>o[t.animal_id];return`
    <h3 class="section-title" style="margin-bottom:14px;">Producci\xF3n de leche</h3>
    <div class="card">
      <h3 class="section-title">Registrar orde\xF1a</h3>
      ${a.length?"":'<p class="small muted" style="margin-bottom:8px;">Todav\xEDa no ten\xE9s ning\xFAn animal registrado.</p>'}
      <form id="formLecheRapido">
        <label>N\xFAmero de animal o chip</label>
        <input id="identificadorLeche" name="identificador" required placeholder="N\xB0 interno o chip \u2014 o escane\xE1 con el lector" list="sugerenciasIdentificadorLeche" autocomplete="off">
        <datalist id="sugerenciasIdentificadorLeche">${opcionesIdentificadorAnimales(a)}</datalist>
        <div id="historialAnimalLeche"></div>
        <div class="row" style="gap:8px;margin-top:9px;">
          <input name="litros" type="number" step="0.1" min="0" required placeholder="Litros" style="flex:1;">
          <input name="fecha" type="date" value="${new Date().toISOString().slice(0,10)}" style="flex:1;">
        </div>
        <select name="turno" style="margin-top:9px;">
          <option value="">Turno \u2014 sin especificar (opcional)</option>
          <option value="Ma\xF1ana">Ma\xF1ana</option>
          <option value="Tarde">Tarde</option>
        </select>
        <label>Notas</label>
        <input name="notas" placeholder="Opcional">
        <button class="btn btn-primary btn-block" type="submit" style="margin-top:8px;">Guardar</button>
      </form>
    </div>
    <div class="card">
      <h3 class="section-title">Historial</h3>
      ${e.length?e.map(t=>`
        <div class="ficha-row">
          <span class="k">${fmtFechaEvento(t.fecha)} \xB7 ${esc(etiquetaAnimal(n(t)))}${t.descripcion?" \xB7 "+esc(t.descripcion):""}${t.notas?" \xB7 "+esc(t.notas):""}</span>
          <span class="v">${t.litros_leche} L</span>
        </div>`).join(""):'<div class="empty">Todav\xEDa no cargaste orde\xF1as.</div>'}
    </div>
  `}async function viewReproduccion(){const[a,e]=await Promise.all([mockApi.misAnimales(),mockApi.misEventosAnimal("reproduccion",500)]),o={};a.forEach(i=>{o[i.id]=i});const n=i=>o[i.animal_id],t=calcularAlertasReproduccion(a,e),r=e.slice(0,30);return`
    <h3 class="section-title" style="margin-bottom:14px;">Reproducci\xF3n</h3>
    <div class="ficha-tabs">
      <button type="button" class="ficha-tab ${reproduccionSubview==="registrar"?"active":""}" data-reproduccion-tab="registrar">Registrar evento</button>
      <button type="button" class="ficha-tab ${reproduccionSubview==="alertas"?"active":""}" data-reproduccion-tab="alertas">Alertas${t.length?` (${t.length})`:""}</button>
      <button type="button" class="ficha-tab ${reproduccionSubview==="historial"?"active":""}" data-reproduccion-tab="historial">Historial</button>
    </div>

    ${reproduccionSubview==="registrar"?`
    <div class="card">
      <h3 class="section-title">Registrar evento</h3>
      ${a.length?"":'<p class="small muted" style="margin-bottom:8px;">Todav\xEDa no ten\xE9s ning\xFAn animal registrado.</p>'}
      <form id="formReproduccionRapida">
        <label>N\xFAmero de animal o chip</label>
        <input id="identificadorReproduccion" name="identificador" required placeholder="N\xB0 interno o chip \u2014 o escane\xE1 con el lector" list="sugerenciasIdentificadorReproduccion" autocomplete="off">
        <datalist id="sugerenciasIdentificadorReproduccion">${opcionesIdentificadorAnimales(a)}</datalist>
        <div id="historialAnimalReproduccion"></div>
        ${camposReproduccion("rapida")}
        <button class="btn btn-primary btn-block" type="submit" style="margin-top:8px;">Guardar</button>
      </form>
    </div>
    `:""}

    ${reproduccionSubview==="alertas"?`
    <div class="card">
      <h3 class="section-title">\u26A0\uFE0F Alertas de celo y parto</h3>
      ${t.length?t.map(filaAlertaReproduccion).join(""):'<div class="empty">Sin alertas por ahora.</div>'}
    </div>
    `:""}

    ${reproduccionSubview==="historial"?`
    <div class="card">
      <h3 class="section-title">Historial</h3>
      ${r.length?r.map(i=>{const d=[esc(etiquetaAnimal(n(i))),detalleReproduccion(i)].filter(Boolean).join(" \xB7 ");return`
        <div class="ficha-row">
          <span class="k">${fmtFechaEvento(i.fecha)}${d?" \xB7 "+d:""}</span>
          <span class="v">${esc(i.descripcion)}</span>
        </div>`}).join(""):'<div class="empty">Todav\xEDa no cargaste eventos de reproducci\xF3n.</div>'}
      ${e.length>r.length?`<p class="small muted" style="margin-top:8px;">Y ${e.length-r.length} m\xE1s \u2014 solo se muestran los \xFAltimos 30.</p>`:""}
    </div>
    `:""}
  `}async function procesarChipEscaneado(a){if(currentScreen==="lote"&&loteScreenSubview==="detalle"&&loteSeleccionadoId){const n=await buscarMiAnimalPorIdentificador(a);if(n){try{await mockApi.agregarAnimalesALote(loteSeleccionadoId,[n.id]),toast("Animal sumado al lote","\u2705"),renderApp()}catch(t){toast(t.message,"\u26A0\uFE0F")}return}await agregarChipALote(a);return}const e=await buscarMiAnimalPorIdentificador(a);if(e){document.querySelectorAll(".modal-backdrop").forEach(n=>n.remove()),abrirFichaAnimal(e.id);return}let o;try{o=await mockApi.consultarChip(a)}catch(n){if(!_pareceErrorDeConexion(n)){toast(n.message,"\u26A0\uFE0F");return}const t=await idbTodo("cache_chips_reservados"),r=a.trim(),i=t.some(d=>d.chip_uid===r);toast(i?"Sin conexi\xF3n \u2014 chip reservado disponible, complet\xE1 el registro":"Sin conexi\xF3n \u2014 el chip se guarda igual, se confirma contra el inventario cuando vuelva la se\xF1al","\u{1F4F4}"),document.querySelectorAll(".modal-backdrop").forEach(d=>d.remove()),chipEscaneadoParaRegistro=r,animalesSubview="form",currentScreen="animales",renderApp();return}if(!o.existe){toast(o.advertencia||"Ese n\xFAmero no est\xE1 en el inventario","\u26A0\uFE0F");return}if(o.estado==="en_stock"){toast("Chip disponible \u2014 complet\xE1 el registro del animal","\u{1FAAA}"),document.querySelectorAll(".modal-backdrop").forEach(n=>n.remove()),chipEscaneadoParaRegistro=a.trim(),animalesSubview="form",currentScreen="animales",renderApp();return}toast(o.estado==="invalidado"?"Ese chip est\xE1 invalidado \u2014 no se puede usar":"Ese chip ya est\xE1 asignado a un animal que no es tuyo","\u26A0\uFE0F")}function bindEscaneoGlobal(){window.__scanGlobalBound||(window.__scanGlobalBound=!0,document.addEventListener("keydown",async a=>{if(!mockApi.sesionActual()){scanBuffer="";return}const e=document.activeElement;if(e&&(e.tagName==="INPUT"||e.tagName==="TEXTAREA")){scanBuffer="";return}if(a.key==="Enter"){a.preventDefault();const o=scanBuffer.trim();if(scanBuffer="",!o)return;await procesarChipEscaneado(o);return}a.key.length===1&&(scanBuffer+=a.key,clearTimeout(scanTimer),scanTimer=setTimeout(()=>{scanBuffer=""},800))}))}function bindEvents(){const a=document.getElementById("app");a.querySelectorAll("[data-nav]").forEach(c=>c.onclick=()=>{c.blur();const l=c.dataset.nav;l!==currentScreen&&history.pushState({pantalla:currentScreen},"",location.href),currentScreen=l,resetearSubvistas(),renderApp()});const e=a.querySelector("[data-logout]");e&&(e.onclick=()=>{currentScreen="inicio",mockApi.logout()}),bindConsultarChip(a),a.querySelectorAll("[data-ver-animal]").forEach(c=>c.onclick=()=>abrirFichaAnimal(idPropio(c.dataset.verAnimal))),bindLookupAnimalRapido("identificadorSanidad","historialAnimalSanidad"),bindLookupAnimalRapido("identificadorPesaje","historialAnimalPesaje"),bindLookupAnimalRapido("identificadorLeche","historialAnimalLeche"),bindLookupAnimalRapido("identificadorReproduccion","historialAnimalReproduccion");const o=document.getElementById("formSanidadRapida");o&&(o.onsubmit=async c=>{c.preventDefault();const l=new FormData(o),g=await buscarMiAnimalPorIdentificador(l.get("identificador"));if(!g){toast("Ese N\xB0 interno o chip no es de ninguno de tus animales","\u26A0\uFE0F");return}const x={tipo:l.get("tipo"),notas:l.get("notas").trim()||null,fecha:l.get("fecha")||null,producto:l.get("producto").trim()||null,lote_producto:l.get("lote_producto").trim()||null,dosis:l.get("dosis").trim()||null,veterinario:l.get("veterinario").trim()||null,dias_retiro:l.get("dias_retiro")||null};try{await mockApi.registrarSanidad(g.id,x),toast("Sanidad registrada","\u{1F489}"),renderApp()}catch(_){toast(_.message,"\u26A0\uFE0F")}});const n=document.getElementById("formPesajeRapido");n&&(n.onsubmit=async c=>{c.preventDefault();const l=new FormData(n),g=await buscarMiAnimalPorIdentificador(l.get("identificador"));if(!g){toast("Ese N\xB0 interno o chip no es de ninguno de tus animales","\u26A0\uFE0F");return}const x={peso_kg:l.get("peso_kg"),fecha:l.get("fecha")||null,condicion_corporal:l.get("condicion_corporal")||null,notas:l.get("notas").trim()||null};try{await mockApi.registrarPesaje(g.id,x),toast("Pesaje guardado","\u2696\uFE0F"),renderApp()}catch(_){toast(_.message,"\u26A0\uFE0F")}});const t=document.getElementById("formLecheRapido");t&&(t.onsubmit=async c=>{c.preventDefault();const l=new FormData(t),g=await buscarMiAnimalPorIdentificador(l.get("identificador"));if(!g){toast("Ese N\xB0 interno o chip no es de ninguno de tus animales","\u26A0\uFE0F");return}const x={litros:l.get("litros"),fecha:l.get("fecha")||null,turno:l.get("turno")||null,notas:l.get("notas").trim()||null};try{await mockApi.registrarProduccionLeche(g.id,x),toast("Orde\xF1a guardada","\u{1F95B}"),renderApp()}catch(_){toast(_.message,"\u26A0\uFE0F")}}),a.querySelectorAll("[data-reproduccion-tab]").forEach(c=>c.onclick=()=>{reproduccionSubview=c.dataset.reproduccionTab,renderApp()}),a.querySelectorAll("[data-sanidad-tab]").forEach(c=>c.onclick=()=>{sanidadSubview=c.dataset.sanidadTab,renderApp()}),bindCamposReproduccion("rapida");const r=document.getElementById("formReproduccionRapida");r&&(r.onsubmit=async c=>{c.preventDefault();const l=new FormData(r),g=await buscarMiAnimalPorIdentificador(l.get("identificador"));if(!g){toast("Ese N\xB0 interno o chip no es de ninguno de tus animales","\u26A0\uFE0F");return}const x=leerDatosReproduccionDeFormulario(l);try{await mockApi.registrarReproduccion(g.id,x),toast("Evento de reproducci\xF3n registrado","\u{1F404}"),renderApp()}catch(_){toast(_.message,"\u26A0\uFE0F")}});const i=document.getElementById("buscarMisAnimales");i&&(i.oninput=()=>{const c=i.value.trim().toLowerCase();let l=0;document.querySelectorAll("#listaAnimalesCertificados [data-buscar]").forEach(x=>{const _=x.dataset.buscar.includes(c);x.style.display=_?"":"none",_&&l++});const g=document.getElementById("sinResultadosMisAnimales");g&&(g.style.display=l===0?"":"none")}),i&&(i.onkeydown=async c=>{if(c.key!=="Enter")return;c.preventDefault();const l=i.value.trim();l&&(i.value="",i.dispatchEvent(new Event("input")),await procesarChipEscaneado(l))}),bindEscaneoGlobal();const d=a.querySelector("[data-exportar-rancho-actual]");d&&(d.onclick=()=>exportarMiInformacion(!1));const u=a.querySelector("[data-exportar-todos-ranchos]");u&&(u.onclick=()=>exportarMiInformacion(!0)),a.querySelectorAll("[data-exportar-lote]").forEach(c=>c.onclick=()=>exportarExcelLote(idPropio(c.dataset.exportarLote)));const v=a.querySelector("[data-qr-rancho-actual]");v&&(v.onclick=()=>pdfEtiquetas({},v.querySelector(".list-title").textContent));const h=a.querySelector("[data-qr-todos-ranchos]");h&&(h.onclick=()=>pdfEtiquetas({todosLosRanchos:!0},"Todos mis ranchos")),a.querySelectorAll("[data-qr-lote]").forEach(c=>c.onclick=()=>pdfEtiquetas({loteId:idPropio(c.dataset.qrLote)},c.querySelector(".list-title").textContent)),a.querySelectorAll("[data-suscribirme]").forEach(c=>c.onclick=async()=>{const l=getSession(),g=new Date().toISOString().slice(0,10);if(l&&l.fecha_proximo_pago&&l.fecha_proximo_pago>=g&&!(l.plan_tipo==="mensual"||l.plan_tipo==="anual")&&l.plan_estado!=="al_dia"&&!confirm(`Ya ten\xE9s acceso completo hasta ${fmtFecha(l.fecha_proximo_pago)} (c\xF3digo de promoci\xF3n o cr\xE9dito). Si te suscrib\xEDs ahora vas a empezar a pagar de una, sin esperar a que eso se termine. \xBFSuscribirte igual?`))return;const _=a.querySelectorAll("[data-suscribirme]"),E=c.textContent;_.forEach(L=>L.disabled=!0),c.textContent="Redirigiendo a Mercado Pago\u2026";try{const L=await mockApi.crearSuscripcionMercadoPago(c.dataset.suscribirme);location.href=L}catch(L){toast(L.message,"\u26A0\uFE0F"),_.forEach(U=>U.disabled=!1),c.textContent=E}});const $=document.getElementById("formCanjearCodigo");$&&($.onsubmit=async c=>{c.preventDefault();const g=(new FormData($).get("codigo")||"").trim();if(!g){toast("Escrib\xED un c\xF3digo","\u26A0\uFE0F");return}try{const x=await mockApi.canjearCodigoPromocional(g);toast(`\xA1Canjeado! ${x.meses} mes(es) de acceso completo`,"\u{1F39F}\uFE0F"),renderApp()}catch(x){toast(x.message,"\u26A0\uFE0F")}});const k=document.getElementById("btnToggleFormRecordatorio");k&&(k.onclick=()=>{calendarioFormAbierto=!calendarioFormAbierto,renderApp()});const A=document.getElementById("formRecordatorioSanitario");A&&(A.onsubmit=async c=>{c.preventDefault();const l=new FormData(A);try{await mockApi.crearRecordatorioSanitario({nombre:l.get("nombre").trim(),proximaFecha:l.get("proxima_fecha"),frecuenciaMeses:l.get("frecuencia_meses")?parseInt(l.get("frecuencia_meses"),10):null,notas:l.get("notas").trim()||null}),toast("Recordatorio agregado","\u{1F4C5}"),calendarioFormAbierto=!1,renderApp()}catch(g){toast(g.message,"\u26A0\uFE0F")}}),a.querySelectorAll("[data-recordatorio-hecho]").forEach(c=>c.onclick=async()=>{try{await mockApi.marcarRecordatorioHecho(Number(c.dataset.recordatorioHecho)),toast("Recordatorio actualizado","\u2705"),renderApp()}catch(l){toast(l.message,"\u26A0\uFE0F")}}),a.querySelectorAll("[data-recordatorio-eliminar]").forEach(c=>c.onclick=async()=>{if(confirm("\xBFEliminar este recordatorio?"))try{await mockApi.eliminarRecordatorioSanitario(Number(c.dataset.recordatorioEliminar)),toast("Recordatorio eliminado","\u{1F5D1}\uFE0F"),renderApp()}catch(l){toast(l.message,"\u26A0\uFE0F")}}),a.querySelectorAll("[data-cal-mes]").forEach(c=>c.onclick=()=>{calendarioMes+=Number(c.dataset.calMes),calendarioMes<0?(calendarioMes=11,calendarioAnio--):calendarioMes>11&&(calendarioMes=0,calendarioAnio++),calendarioDiaSeleccionado=null,renderApp()}),a.querySelectorAll("[data-cal-dia]").forEach(c=>c.onclick=()=>{const l=c.dataset.calDia;calendarioDiaSeleccionado=calendarioDiaSeleccionado===l?null:l,renderApp()}),a.querySelectorAll("[data-config-toggle]").forEach(c=>c.onclick=()=>{configuracionAbierta=configuracionAbierta===c.dataset.configToggle?null:c.dataset.configToggle,renderApp()});const f=document.getElementById("formEditarPerfil");f&&(f.onsubmit=async c=>{c.preventDefault();const l=new FormData(f);try{await mockApi.actualizarMiPerfil({nombre:l.get("nombre"),rancho_o_empresa:l.get("rancho_o_empresa"),telefono:l.get("telefono"),municipio:l.get("municipio")||null}),toast("Perfil actualizado","\u2705"),renderApp()}catch(g){toast(g.message,"\u26A0\uFE0F")}});const y=document.getElementById("btnAbrirRanchosConfig");y&&(y.onclick=abrirSelectorRancho);const m=document.getElementById("btnCancelarSuscripcion");m&&(m.onclick=async()=>{if(confirm("\xBFCancelar la suscripci\xF3n? Vas a seguir con acceso completo hasta la fecha ya pagada \u2014 despu\xE9s de eso no se te va a volver a cobrar y volv\xE9s al l\xEDmite gratis (50 animales, 1 rancho).")){m.disabled=!0;try{await mockApi.cancelarSuscripcionMercadoPago(),toast("Suscripci\xF3n cancelada \u2014 ten\xE9s acceso hasta la fecha ya pagada","\u2705"),renderApp()}catch(c){toast(c.message,"\u26A0\uFE0F"),m.disabled=!1}}});const p=document.getElementById("btnActivarPush");p&&(p.onclick=async()=>{try{await activarNotificacionesPush(),toast("Notificaciones activadas en este dispositivo","\u{1F514}"),renderApp()}catch(c){toast(c.message,"\u26A0\uFE0F")}});const s=document.getElementById("btnDesactivarPush");s&&(s.onclick=async()=>{try{await desactivarNotificacionesPush(),toast("Notificaciones desactivadas en este dispositivo","\u2705"),renderApp()}catch(c){toast(c.message,"\u26A0\uFE0F")}});const b=document.getElementById("btnCerrarSesionConfig");b&&(b.onclick=()=>{currentScreen="inicio",mockApi.logout()});const w=document.getElementById("btnSincronizarAhora");w&&(w.onclick=async()=>{try{await mockApi.sincronizarAhora(),toast("Sincronizado","\u2705"),renderApp()}catch(c){toast(c.message,"\u{1F4F6}")}}),a.querySelectorAll("[data-descartar-fallo]").forEach(c=>c.onclick=async()=>{await mockApi.descartarFalloSincronizacion(parseInt(c.dataset.descartarFallo,10)),renderApp()}),bindInstalarApp(),bindIconoMenuUsuario();const S=document.getElementById("btnCambiarRancho");S&&(S.onclick=()=>abrirSelectorRancho());const R=document.getElementById("chkEsCruza");R&&(R.onchange=()=>{const c=document.getElementById("wrapRazaCruzada");c&&(c.style.display=R.checked?"":"none")});const j=document.getElementById("fabRegistrarAnimal");j&&(j.onclick=()=>{chipEscaneadoParaRegistro=null,animalesSubview="form",renderApp()});const N=a.querySelector("[data-volver-animales]");N&&(N.onclick=()=>{chipEscaneadoParaRegistro=null,animalesSubview="lista",renderApp()});const M=document.getElementById("fabNuevoLote");M&&(M.onclick=()=>{loteScreenSubview="form",renderApp()});const C=document.getElementById("formNuevoLote");C&&(C.onsubmit=async c=>{c.preventDefault();const l=new FormData(C);try{const g=await mockApi.crearLote({nombre:l.get("nombre"),tipo:l.get("tipo"),categoria:l.get("categoria"),notas:l.get("notas")});toast("Lote creado","\u2705"),loteAnimales=[],loteDetalleSubview="grupo",loteTareaAbierta=null,loteSeleccionadoId=g.id,loteScreenSubview="detalle",renderApp()}catch(g){toast(g.message,"\u26A0\uFE0F")}}),a.querySelectorAll("[data-ver-lote]").forEach(c=>c.onclick=()=>{loteAnimales=[],loteDetalleSubview="grupo",loteTareaAbierta=null,loteSeleccionadoId=idPropio(c.dataset.verLote),loteScreenSubview="detalle",renderApp()});const B=a.querySelector("[data-volver-lotes]");B&&(B.onclick=()=>{loteAnimales.length&&!confirm("\xBFSalir sin guardar? Se va a perder la lista de animales nuevos que armaste para este lote.")||(loteAnimales=[],loteDetalleSubview="grupo",loteTareaAbierta=null,loteSeleccionadoId=null,loteScreenSubview="lista",renderApp())}),a.querySelectorAll("[data-lote-detalle-tab]").forEach(c=>c.onclick=()=>{loteDetalleSubview=c.dataset.loteDetalleTab,renderApp()}),a.querySelectorAll("[data-lote-tarea]").forEach(c=>c.onclick=()=>{const l=c.dataset.loteTarea;loteTareaAbierta=loteTareaAbierta===l?null:l,renderApp()});const O=document.getElementById("btnMasOpcionesLote");O&&(O.onclick=async()=>{const l=(await mockApi.misLotes()).find(g=>g.id===loteSeleccionadoId);l&&abrirMasOpcionesLote(l)});const z=document.getElementById("btnEditarLote");z&&(z.onclick=async()=>{const l=(await mockApi.misLotes()).find(g=>g.id===loteSeleccionadoId);l&&abrirEditorLote(l)});const G=document.getElementById("btnAbrirSeleccionGuardados");G&&(G.onclick=async()=>{const[c,l,g]=await Promise.all([mockApi.misLotes(),mockApi.misAnimales(),mockApi.animalesDeLote(loteSeleccionadoId)]),x=c.find(E=>E.id===loteSeleccionadoId);if(!x)return;const _=new Set(g.map(E=>E.id));abrirSelectorAnimalesGuardados(x,l.filter(E=>!_.has(E.id)))}),a.querySelectorAll("[data-quitar-de-lote]").forEach(c=>c.onclick=async()=>{try{await mockApi.quitarAnimalDeLote(loteSeleccionadoId,idPropio(c.dataset.quitarDeLote)),toast("Animal sacado del lote","\u2796"),renderApp()}catch(l){toast(l.message,"\u26A0\uFE0F")}});const q=document.getElementById("formReproduccionLote");q&&(q.onsubmit=async c=>{c.preventDefault();const l=new FormData(q);try{const g=await mockApi.registrarReproduccionLote(loteSeleccionadoId,{tipo:l.get("tipo"),semental:l.get("semental"),veterinario:l.get("veterinario"),fecha:l.get("fecha"),notas:l.get("notas")});toast(`Aplicado a ${g.animales} animal(es)`,"\u{1F3AF}"),renderApp()}catch(g){toast(g.message,"\u26A0\uFE0F")}});const I=document.getElementById("formSanidadLote");I&&(I.onsubmit=async c=>{c.preventDefault();const l=new FormData(I);try{const g=await mockApi.registrarSanidadLote(loteSeleccionadoId,{tipo:l.get("tipo"),producto:l.get("producto"),lote_producto:l.get("lote_producto"),dosis:l.get("dosis"),veterinario:l.get("veterinario"),dias_retiro:l.get("dias_retiro")||null,fecha:l.get("fecha"),notas:l.get("notas")});toast(`Aplicado a ${g.animales} animal(es)`,"\u{1F489}"),renderApp()}catch(g){toast(g.message,"\u26A0\uFE0F")}});const H=document.getElementById("btnOrdenRankingLote");H&&(H.onclick=()=>{loteOrdenRanking=loteOrdenRanking==="desc"?"asc":"desc",renderApp()});const T=document.getElementById("loteEscaner");T&&(T.onkeydown=async c=>{if(c.key!=="Enter")return;c.preventDefault();const l=T.value.trim();l&&await procesarChipEscaneado(l)});const V=document.getElementById("btnLoteAgregarMacho");V&&(V.onclick=()=>{loteAnimales.push({chip_uid:null,sexo:"macho",numero_interno:"",peso_actual_kg:""}),renderFilasLote()});const Q=document.getElementById("btnLoteAgregarHembra");Q&&(Q.onclick=()=>{loteAnimales.push({chip_uid:null,sexo:"hembra",numero_interno:"",peso_actual_kg:""}),renderFilasLote()});const P=document.getElementById("loteFilas");P&&(P.oninput=c=>{const l=c.target.closest("[data-lote-campo]");if(!l)return;const g=loteAnimales[Number(l.dataset.loteIdx)];g&&(g[l.dataset.loteCampo]=l.value)},P.onchange=P.oninput,P.onclick=c=>{const l=c.target.closest("[data-lote-quitar]");l&&(loteAnimales.splice(Number(l.dataset.loteQuitar),1),renderFilasLote())});const D=document.getElementById("btnGuardarLote");D&&(D.onclick=async()=>{const c=(document.getElementById("loteRaza").value||"").trim();if(!c){toast("Falta la raza","\u26A0\uFE0F");return}if(!loteAnimales.length){toast("Todav\xEDa no agregaste ning\xFAn animal nuevo","\u26A0\uFE0F");return}const l={raza:c,color:(document.getElementById("loteColor").value||"").trim()||null,marca_hierro:(document.getElementById("loteMarcaHierro").value||"").trim()||null,fecha_nacimiento:document.getElementById("loteFechaNacimiento").value||null,ubicacion:(document.getElementById("loteUbicacion").value||"").trim()||null,notas:(document.getElementById("loteNotas").value||"").trim()||null};D.disabled=!0,D.textContent="Registrando\u2026";let g=0;const x=[];for(const _ of loteAnimales)try{const E=await mockApi.registrarAnimalDirecto({...l,sexo:_.sexo,chip_uid:_.chip_uid,numero_interno:_.numero_interno||null,peso_actual_kg:_.peso_actual_kg||null});await mockApi.agregarAnimalesALote(loteSeleccionadoId,[E.animal_id]),g++}catch(E){x.push(`${_.chip_uid||_.numero_interno||"(sin identificar)"}: ${E.message}`)}D.disabled=!1,D.textContent="Registrar y sumar al lote",x.length?(console.warn("Errores registrando el lote:",x),toast(`${g} registrados, ${x.length} con error (${x[0]}${x.length>1?"\u2026":""})`,"\u26A0\uFE0F")):toast(`${g} animal(es) registrados y sumados al lote`,"\u2705"),loteAnimales=[],renderApp()});const F=document.getElementById("formAnimalRegistro");F&&(F.onsubmit=async c=>{c.preventDefault();const l=leerDatosAnimalDeFormulario(new FormData(F));try{const g=await mockApi.registrarAnimalDirecto(l),x=g.chip_uid?g.chip_es_oficial?`chip ${g.chip_uid} asignado`:`chip propio ${g.chip_uid} (sin inventario oficial)`:`N\xB0 interno ${g.numero_interno}`;let _="";if(l.fecha_nacimiento){const E=g.numero_interno||g.chip_uid||x,L=await generarRecordatoriosVacunacion(E,l.fecha_nacimiento,l.sexo);L&&(_=` \u2014 ${L} recordatorio(s) de vacunaci\xF3n programado(s)`)}toast(`Registrado \u2014 ${x}${_}`,"\u{1FAAA}"),chipEscaneadoParaRegistro=null,animalesSubview="lista",renderApp()}catch(g){toast(g.message,"\u26A0\uFE0F")}})}esperarSesionInicial().then(renderApp),new MutationObserver(a=>{for(const e of a)for(const o of e.addedNodes)if(o.nodeType===1&&o.classList&&o.classList.contains("modal-backdrop")){history.pushState({modal:!0},"",location.href);return}}).observe(document.body,{childList:!0}),window.addEventListener("popstate",a=>{const e=document.querySelectorAll(".modal-backdrop");if(e.length){e[e.length-1].remove();return}let o=a.state&&a.state.pantalla||"inicio";NAV_ITEMS.some(n=>n.id===o)||(o="inicio"),o!==currentScreen&&(currentScreen=o,resetearSubvistas(),renderApp())});
