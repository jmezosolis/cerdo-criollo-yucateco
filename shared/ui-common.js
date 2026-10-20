function transicionSegura(e){if(document.startViewTransition&&!document.hidden)try{document.startViewTransition(e);return}catch{}e()}let _turnoRender=0,_ultimaRedirigidaA=null,_ultimaRedirigidaEn=0;function redirigirSeguro(e){const a=Date.now();if(_ultimaRedirigidaA===e&&a-_ultimaRedirigidaEn<1500)return;_ultimaRedirigidaA=e,_ultimaRedirigidaEn=a;const t="ggRedirectLog";let n=[];try{n=JSON.parse(sessionStorage.getItem(t)||"[]")}catch{n=[]}n=n.filter(o=>a-o.t<8e3),n.push({url:e,t:a});try{sessionStorage.setItem(t,JSON.stringify(n))}catch{}if(n.filter(o=>o.url===e).length>=3){const o=document.getElementById("app");o&&(o.innerHTML=`
      <div class="wrap"><div class="card" style="text-align:center;">
        <div style="font-size:34px;">\u{1F4F6}</div>
        <h3 style="margin-top:8px;">No se pudo confirmar tu sesi\xF3n</h3>
        <p class="small muted" style="margin-top:6px;">Probablemente sea la conexi\xF3n \u2014 prob\xE1 de nuevo.</p>
        <button class="btn btn-primary btn-block" id="btnReintentarSesion" type="button">Reintentar</button>
      </div></div>`);const i=document.getElementById("btnReintentarSesion");i&&(i.onclick=()=>{sessionStorage.removeItem(t),location.reload()});return}location.replace(e)}const SCOPE_ROLES={ganadero:["ganadero"],administracion:["admin"]};function rolPermitidoEnApp(e){return e==="admin"||(SCOPE_ROLES[APP_SCOPE]||[]).includes(e)}function emojiScope(e){return{ganadero:"",administracion:""}[e]??""}function tituloScope(e){return{ganadero:"GanaID \u2014 Ganadero",administracion:"GanaID \u2014 Administraci\xF3n"}[e]||"GanaID"}function etiquetaScope(e){return{ganadero:"Ganadero",administracion:"la Administraci\xF3n"}[e]||e}function viewAccesoRestringido(e){return`
  <div class="wrap">
    <div class="card" style="text-align:center;">
      <div style="font-size:34px;">\u{1F6AB}</div>
      <h3 style="margin-top:8px;">No ten\xE9s acceso a esta app</h3>
      <p class="small muted" style="margin-top:6px;">
        Iniciaste sesi\xF3n como <b>${esc(e.nombre)}</b>, cuenta de <b>${etiquetaRol(e.rol)}</b> \u2014
        esta es la app de <b>${etiquetaScope(APP_SCOPE)}</b>, no le corresponde.
      </p>
      <a class="btn btn-primary btn-block" href="../index.html">Ir a la app correcta</a>
      <button class="btn btn-ghost btn-block" data-logout="1">Cambiar de cuenta</button>
    </div>
  </div>`}function blockConsultarChip(e,{autoFocoEscaner:a=!1}={}){return`
    <div class="row" style="margin-top:8px;">
      <input id="chipInput_${e}" data-autofoco-escaner="${a?"1":""}" placeholder="N\xFAmero del chip \u2014 o escane\xE1 con el lector" style="flex:1;">
      <button class="btn btn-primary" data-consultar="${e}">Consultar</button>
    </div>
    <div id="resultado_${e}" style="margin-top:10px;"></div>
  `}function bindConsultarChip(e=document){e.querySelectorAll("[data-consultar]").forEach(a=>{const t=a.dataset.consultar,n=document.getElementById("chipInput_"+t);n&&(a.onclick=()=>handleConsultar(t),n.onkeydown=o=>{o.key==="Enter"&&(o.preventDefault(),handleConsultar(t))},n.dataset.autofocoEscaner==="1"&&n.focus())})}function renderResultadoChip(e){return e.existe?`<div class="card">
    <div class="row" style="justify-content:space-between;align-items:center;">
      <span class="pill pill-${e.estado}">${etiquetaEstadoChip(e.estado)}</span>
      ${e.precio_oficial!=null?`<span class="small muted">Precio oficial: $${Number(e.precio_oficial).toLocaleString("es-MX")} MXN</span>`:""}
    </div>
    ${e.proveedor?`<p class="small muted" style="margin-top:6px;">Proveedor: ${esc(e.proveedor)}</p>`:""}
    ${e.animal?`<p class="small" style="margin-top:6px;">Animal: <b>${esc(e.animal.raza)||"Raza no especificada"}</b> \u2014 estado: ${etiquetaEstadoAnimal(e.animal.estado)}</p>`:""}
  </div>`:`<div class="card" style="border-color:var(--red-card-border);">
      <span class="pill pill-rechazada">\u26A0\uFE0F No reconocido</span>
      <p class="small" style="margin-top:8px;">${e.advertencia}</p>
    </div>`}async function handleConsultar(e){const a=document.getElementById("chipInput_"+e),t=a.value.trim();if(!t)return;const n=document.getElementById("resultado_"+e);try{n.innerHTML=renderResultadoChip(await mockApi.consultarChip(t))}catch(o){toast(o.message,"\u26A0\uFE0F");return}a.value="",a.focus()}function bloqueInstalarApp(){return window.__yaInstalada?"":window.__esIOS?`
      <div class="card" style="font-size:12.5px;line-height:1.6;">
        <b style="color:var(--primary);">\u{1F4F2} Instalar en iPhone/iPad</b>
        <p class="section-sub" style="margin-top:6px;">1. Toc\xE1 <b>Compartir</b> en la barra de Safari.<br>2. Eleg\xED <b>"Agregar a pantalla de inicio"</b>.</p>
      </div>`:window.__deferredInstallPrompt?'<button class="btn btn-ghost btn-block" id="btnInstalarApp" type="button">\u{1F4F2} Instalar app</button>':""}async function intentarInstalarApp(){window.__deferredInstallPrompt&&(window.__deferredInstallPrompt.prompt(),await window.__deferredInstallPrompt.userChoice,window.__deferredInstallPrompt=null,typeof renderApp=="function"&&renderApp())}function bindInstalarApp(){const e=document.getElementById("btnInstalarApp");e&&(e.onclick=intentarInstalarApp)}window.addEventListener("ganado-instalable",()=>{typeof renderApp=="function"&&typeof _sesionListo<"u"&&_sesionListo&&renderApp()});function selectMunicipios(e,a="",t=!1){const n=typeof municipiosDeLaSesion=="function"&&municipiosDeLaSesion()||MUNICIPIOS_RESPALDO,o=`datalist-${e}`;return`
    <input name="${e}" list="${o}" ${t?"required":""} placeholder="Escrib\xED el municipio" value="${esc(a)}" autocomplete="off">
    <datalist id="${o}">
      ${n.map(i=>`<option value="${i}"></option>`).join("")}
    </datalist>`}const CATEGORIAS_LOTE_SUGERIDAS=["Lechones","Destete","Engorda","Reproductoras","Cerdas paridas","Verracos","Venta a restaurante","Descarte"];function selectCategoriaLote(e,a=""){const t=`datalist-${e}`;return`
    <input name="${e}" list="${t}" placeholder="Opcional \u2014 p. ej. Engorda" value="${esc(a)}" autocomplete="off">
    <datalist id="${t}">
      ${CATEGORIAS_LOTE_SUGERIDAS.map(n=>`<option value="${n}"></option>`).join("")}
    </datalist>`}let _accesoVista="login";function bloqueAccesoCuenta(){return _accesoVista==="registro"?`
      <div class="card">
        <h3 class="section-title">Crear mi cuenta</h3>
        <form id="formRegistro">
          <label>Nombre</label>
          <input name="nombre" required placeholder="Tu nombre">
          <label>Email</label>
          <input name="email" type="email" required placeholder="tu@email.com" autocomplete="email">
          <label>Contrase\xF1a</label>
          <input name="password" type="password" required minlength="6" placeholder="Al menos 6 caracteres" autocomplete="new-password">
          <label>Municipio</label>
          ${selectMunicipios("municipio","",!0)}
          <button class="btn btn-primary btn-block" type="submit">Crear cuenta y entrar</button>
        </form>
        <button class="btn btn-ghost btn-block" type="button" id="btnIrALogin" style="margin-top:10px;">Ya tengo cuenta</button>
      </div>`:`
    <div class="card">
      <h3 class="section-title">Entrar</h3>
      <form id="formLoginGanadero">
        <label>Email</label>
        <input name="email" type="email" required placeholder="tu@email.com" autocomplete="email">
        <label>Contrase\xF1a</label>
        <input name="password" type="password" required placeholder="Contrase\xF1a" autocomplete="current-password">
        <button class="btn btn-primary btn-block" type="submit">Entrar</button>
      </form>
      <button class="btn btn-ghost btn-block" type="button" id="btnIrARegistro" style="margin-top:10px;">Crear cuenta nueva</button>
    </div>`}function bindAccesoCuenta(){const e=document.getElementById("btnIrARegistro");e&&(e.onclick=()=>{_accesoVista="registro",renderApp()});const a=document.getElementById("btnIrALogin");a&&(a.onclick=()=>{_accesoVista="login",renderApp()});const t=document.getElementById("formLoginGanadero");t&&(t.onsubmit=async o=>{o.preventDefault();const i=new FormData(t);try{await mockApi.loginConPassword(i.get("email"),i.get("password"))}catch(l){toast(l.message,"\u26A0\uFE0F")}});const n=document.getElementById("formRegistro");n&&(n.onsubmit=async o=>{o.preventDefault();const i=new FormData(n),l=n.querySelector('button[type="submit"]');l.disabled=!0;try{(await mockApi.registrarGanadero({email:i.get("email").trim(),password:i.get("password"),nombre:i.get("nombre").trim(),municipio:i.get("municipio")||null,rancho_o_empresa:"",telefono:""})).confirmacionPendiente?toast("Cuenta creada \u2014 revis\xE1 tu email para confirmarla antes de entrar","\u{1F4E9}"):toast("Cuenta creada","\u2705")}catch(r){toast(r.message,"\u26A0\uFE0F")}finally{l.disabled=!1}})}function iconoMenuUsuario(){return`<button class="avatar-btn" id="btnMenuUsuario" type="button" aria-label="Cuenta">${typeof APP_SCOPE<"u"&&APP_SCOPE==="administracion"?'<img src="../administrador.png" alt="" style="width:100%;height:100%;object-fit:cover;display:block;">':'<img src="../ganadero.png?v=3" alt="" style="width:100%;height:100%;object-fit:contain;display:block;">'}</button>`}function bindIconoMenuUsuario(){const e=document.getElementById("btnMenuUsuario");if(!e)return;const a=typeof APP_SCOPE<"u"&&APP_SCOPE!=="administracion";e.onclick=a&&typeof currentScreen<"u"?()=>{currentScreen!=="configuracion"&&history.pushState({pantalla:currentScreen},"",location.href),currentScreen="configuracion",typeof resetearSubvistas=="function"&&resetearSubvistas(),renderApp()}:abrirMenuUsuario}function formEditarPerfil(e){return`
    <form id="formEditarPerfil" style="margin-top:8px;">
      <label>Nombre</label>
      <input name="nombre" required value="${esc(e.nombre)}">
      <label>Rancho / empresa</label>
      <input name="rancho_o_empresa" value="${esc(e.rancho_o_empresa)}">
      <label>Tel\xE9fono</label>
      <input name="telefono" value="${esc(e.telefono)}">
      ${e.rol==="ganadero"?`<label>Municipio</label>${selectMunicipios("municipio",e.municipio||"")}`:""}
      <button class="btn btn-primary btn-block" type="submit">Guardar cambios</button>
    </form>`}async function abrirMenuUsuario(){const e=mockApi.sesionActual();if(!e)return;const{data:a}=await supabaseClient.from("perfiles").select("*").eq("id",e.id).single(),t=a||e,n=document.createElement("div");n.className="modal-backdrop",n.innerHTML=`
    <div class="modal">
      <h3 class="section-title" style="margin-bottom:2px;">\u{1F464} ${esc(t.nombre)}</h3>
      <p class="small muted" style="margin-bottom:14px;">${etiquetaRol(t.rol)}${t.municipio?" \xB7 "+esc(t.municipio):""}</p>
      <button class="btn btn-ghost btn-block" id="btnMostrarEditarPerfil" type="button">\u270F\uFE0F Editar perfil</button>
      <div id="menuUsuarioEdicion"></div>
      <div style="margin-top:10px;">${bloqueInstalarApp()}</div>
      <button class="btn btn-ghost btn-block" id="btnCerrarSesionMenu" type="button" style="margin-top:8px;">\u{1F6AA} Cerrar sesi\xF3n</button>
    </div>`,document.body.appendChild(n),n.addEventListener("click",o=>{o.target===n&&n.remove()}),bindInstalarApp(),document.getElementById("btnMostrarEditarPerfil").onclick=o=>{o.target.style.display="none",document.getElementById("menuUsuarioEdicion").innerHTML=formEditarPerfil(t),document.getElementById("formEditarPerfil").onsubmit=async i=>{i.preventDefault();const l=new FormData(i.target);try{await mockApi.actualizarMiPerfil({nombre:l.get("nombre"),rancho_o_empresa:l.get("rancho_o_empresa"),telefono:l.get("telefono"),municipio:l.get("municipio")||null}),toast("Perfil actualizado","\u2705"),n.remove(),typeof renderApp=="function"&&renderApp()}catch(r){toast(r.message,"\u26A0\uFE0F")}}},document.getElementById("btnCerrarSesionMenu").onclick=()=>{mockApi.logout(),typeof currentScreen<"u"&&(currentScreen="inicio"),typeof activeTab<"u"&&(activeTab=null),typeof filtroUsuarios<"u"&&(filtroUsuarios="todos"),typeof filtroFechaAuditoriaDesde<"u"&&(filtroFechaAuditoriaDesde=""),typeof filtroFechaAuditoriaHasta<"u"&&(filtroFechaAuditoriaHasta=""),n.remove()}}function seccionForm(e,a){return`<div class="form-section-title">${e?e+" ":""}${a}</div>`}function splitRaza(e){const a=(e||"").split(/\s+x\s+/i);return a.length===2?{base:a[0],cruzada:a[1]}:{base:e||"",cruzada:""}}async function camposDatosAnimal(e={},{chipEscaneado:a=null}={}){const t=i=>e[i]!=null?e[i]:"",{base:n,cruzada:o}=splitRaza(e.raza);return`
    ${seccionForm("","Identificaci\xF3n")}
    <label>Chip${a?" (escaneado)":""}</label>
    ${a?`
    <input value="${esc(a)}" name="chip_uid" readonly style="background:transparent;font-weight:600;">
    `:`
    <input name="chip_uid" placeholder="Opcional" value="${t("chip_uid")}">
    `}
    <label>N\xB0 interno (tu propia numeraci\xF3n de rancho)</label>
    <input name="numero_interno" placeholder="Opcional" value="${t("numero_interno")}">
    <div class="row">
      <div style="flex:1;min-width:140px;">
        <label>Raza *</label>
        <input name="raza" placeholder="p. ej. Cerdo criollo yucateco" value="${n}">
      </div>
      <div style="flex:1;min-width:140px;">
        <label>Sexo *</label>
        <select name="sexo">
          <option value="">Elegir\u2026</option>
          <option value="macho" ${e.sexo==="macho"?"selected":""}>Macho</option>
          <option value="hembra" ${e.sexo==="hembra"?"selected":""}>Hembra</option>
        </select>
      </div>
    </div>
    <div class="check-row">
      <input type="checkbox" id="chkEsCruza" name="es_cruza" ${o?"checked":""}>
      <label style="margin:0;" for="chkEsCruza">Es cruza de razas distintas</label>
    </div>
    <div id="wrapRazaCruzada" style="${o?"":"display:none;"}">
      <label>Raza cruzada</label>
      <input name="raza_cruzada" placeholder="p. ej. Angus" value="${o}">
    </div>
    <div class="row">
      <div style="flex:1;min-width:140px;">
        <label>Color / pelaje</label>
        <input name="color" placeholder="p. ej. Colorado" value="${t("color")}">
      </div>
      <div style="flex:1;min-width:140px;">
        <label>Fecha de nacimiento</label>
        <input type="date" name="fecha_nacimiento" value="${t("fecha_nacimiento")}">
      </div>
    </div>
    <label>Muesca / tatuaje</label>
    <input name="marca_hierro" placeholder="Opcional" value="${t("marca_hierro")}">

    ${seccionForm("","Peso")}
    <div class="row">
      <div style="flex:1;min-width:140px;">
        <label>Peso al nacer (kg)</label>
        <input name="peso_nacimiento_kg" type="number" step="0.1" min="0" placeholder="Opcional" value="${t("peso_nacimiento_kg")}">
      </div>
      <div style="flex:1;min-width:140px;">
        <label>Peso actual (kg)</label>
        <input name="peso_actual_kg" type="number" step="0.1" min="0" placeholder="Opcional" value="${t("peso_actual_kg")}">
      </div>
    </div>
    <label>Fecha del pesaje actual</label>
    <input type="date" name="peso_actual_fecha" value="${t("peso_actual_fecha")}">

    ${seccionForm("","Ubicaci\xF3n y notas")}
    <label>Rancho / predio</label>
    <input name="ubicacion" placeholder="p. ej. Rancho El Progreso, Villaflores" value="${t("ubicacion")}">
    <label>Observaciones</label>
    <textarea name="notas" placeholder="Cualquier dato adicional">${t("notas")}</textarea>
  `}function leerDatosAnimalDeFormulario(e){const a=i=>(e.get(i)||"").trim()||null,t=e.get("raza").trim(),n=(e.get("raza_cruzada")||"").trim(),o=e.get("es_cruza")==="on";return{chip_uid:a("chip_uid"),numero_interno:a("numero_interno"),raza:o&&n?`${t} x ${n}`:t,sexo:e.get("sexo"),color:a("color"),marca_hierro:a("marca_hierro"),fecha_nacimiento:e.get("fecha_nacimiento")||null,peso_nacimiento_kg:e.get("peso_nacimiento_kg")||null,peso_actual_kg:e.get("peso_actual_kg")||null,peso_actual_fecha:e.get("peso_actual_fecha")||null,ubicacion:a("ubicacion"),notas:a("notas")}}let _sheetJsPromise=null;function cargarSheetJS(){return typeof XLSX<"u"?Promise.resolve():_sheetJsPromise||(_sheetJsPromise=new Promise((e,a)=>{const t=document.createElement("script");t.src="https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js",t.onload=e,t.onerror=()=>{_sheetJsPromise=null,a(new Error("No se pudo cargar la librer\xEDa de Excel"))},document.head.appendChild(t)}),_sheetJsPromise)}let _qrPromise=null;function cargarQR(){return typeof qrcode<"u"?Promise.resolve():_qrPromise||(_qrPromise=new Promise((e,a)=>{const t=document.createElement("script");t.src="https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js",t.onload=e,t.onerror=()=>{_qrPromise=null,a(new Error("No se pudo cargar el generador de QR"))},document.head.appendChild(t)}),_qrPromise)}function urlTrazabilidad(e){const a=/\/(ganadero|administracion)\//.test(location.pathname);return new URL(`${a?"../":"./"}trazabilidad/index.html?t=${e}`,location.href).href}function hacerQR(e){const a=qrcode(0,"M");return a.addData(e),a.make(),a}function svgQR(e){return hacerQR(e).createSvgTag({cellSize:4,margin:2,scalable:!0})}function edadTexto(e){const a=Math.floor((Date.now()-new Date(e+"T00:00:00").getTime())/864e5);if(a<0)return"";if(a<31)return`${a} ${a===1?"d\xEDa":"d\xEDas"}`;const t=Math.floor(a/30.44);return t<24?`${t} ${t===1?"mes":"meses"}`:`${Math.floor(t/12)} a\xF1os`}function lineasEtiquetaAnimal(e,a){const t=e.fecha_nacimiento?e.fecha_nacimiento.split("-").reverse().join("/"):"",n=e.sexo==="macho"?"Macho":e.sexo==="hembra"?"Hembra":"",o=e.fecha_nacimiento?categoriaPorcina(e.sexo,e.fecha_nacimiento):"";return[a||"",t?`Naci\xF3 ${t} \xB7 ${edadTexto(e.fecha_nacimiento)}`:"",[n,o,e.raza].filter(Boolean).join(" \xB7 ")].filter(Boolean)}function pngEtiquetaQR(e,a,t){const n=hacerQR(e),o=n.getModuleCount(),i=10,l=4,r=(o+l*2)*i,c=document.createElement("canvas");c.width=r,c.height=r+44+32*t.length;const s=c.getContext("2d");s.fillStyle="#fff",s.fillRect(0,0,c.width,c.height),s.fillStyle="#000";for(let p=0;p<o;p++)for(let u=0;u<o;u++)n.isDark(p,u)&&s.fillRect((u+l)*i,(p+l)*i,i,i);return s.textAlign="center",s.font="bold 34px system-ui, sans-serif",s.fillText(a,r/2,r+16,r-20),t.forEach((p,u)=>{s.fillStyle=u===0?"#000":"#444",s.font=`${u===0?"bold ":""}24px system-ui, sans-serif`,s.fillText(p,r/2,r+54+32*u,r-20)}),c.toDataURL("image/png")}let _pdfPromise=null;function cargarJsPDF(){return window.jspdf?Promise.resolve():_pdfPromise||(_pdfPromise=new Promise((e,a)=>{const t=document.createElement("script");t.src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",t.onload=e,t.onerror=()=>{_pdfPromise=null,a(new Error("No se pudo cargar el generador de PDF"))},document.head.appendChild(t)}),_pdfPromise)}async function descargarPdfEtiquetasQR(e,a){if(!e.length){toast("No hay animales para hacer etiquetas","\u26A0\uFE0F");return}toast("Preparando el PDF\u2026","\u23F3"),await Promise.all([cargarQR(),cargarJsPDF()]);const t=new window.jspdf.jsPDF({unit:"mm",format:"letter"}),n=3,o=4,i=10,l=12,r=(215.9-2*i)/n,c=(279.4-2*l)/o,s=36;e.forEach((p,u)=>{const y=u%(n*o);u&&!y&&t.addPage();const f=i+y%n*r,x=l+Math.floor(y/n)*c;t.setDrawColor(170),t.setLineDashPattern([1.5,1.5],0),t.rect(f,x,r,c),t.setLineDashPattern([],0);const v=hacerQR(urlTrazabilidad(p.token)),g=v.getModuleCount(),h=s/g,w=f+(r-s)/2,_=x+3;t.setFillColor(0);for(let m=0;m<g;m++)for(let d=0;d<g;d++){if(!v.isDark(m,d))continue;let b=d;for(;b+1<g&&v.isDark(m,b+1);)b++;t.rect(w+d*h,_+m*h,(b-d+1)*h+.02,h+.02,"F"),d=b}t.setTextColor(0),t.setFont("helvetica","bold"),t.setFontSize(13),t.text(String(p.titulo),f+r/2,_+s+6.5,{align:"center",maxWidth:r-6}),(p.lineas||[]).slice(0,4).forEach((m,d)=>{t.setFont("helvetica",d===0?"bold":"normal"),t.setFontSize(d===0?9.5:8.5),t.setTextColor(d===0?0:60),t.text(String(m),f+r/2,_+s+11.5+4.2*d,{align:"center",maxWidth:r-6})})}),t.save(a),toast("PDF descargado","\u2B07\uFE0F")}function nombreArchivoQR(e){return(e||"trazabilidad").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")||"trazabilidad"}async function abrirQrTrazabilidad(e,a,t){try{await cargarQR()}catch(i){toast(i.message+" \u2014 revis\xE1 la conexi\xF3n","\u26A0\uFE0F");return}const n=urlTrazabilidad(t),o=document.createElement("div");o.className="modal-backdrop",o.innerHTML=`
    <div class="modal" style="text-align:center;">
      <h3 class="section-title" style="margin-bottom:4px;display:flex;align-items:center;justify-content:center;gap:8px;">
        <img src="${/\/(ganadero|administracion)\//.test(location.pathname)?"../":"./"}qr.png" alt="" style="width:26px;height:26px;">${esc(e)}</h3>
      <p class="small muted">${a.map(esc).join("<br>")}</p>
      <div style="width:220px;max-width:100%;margin:12px auto;">${svgQR(n)}</div>
      <a class="btn btn-ghost btn-block" href="${esc(n)}" target="_blank" rel="noopener">\u{1F50E} Ver lo que muestra</a>
      <button class="btn btn-ghost btn-block" type="button" data-qr-descargar style="margin-top:8px;">\u2B07\uFE0F Descargar imagen</button>
      <button class="btn btn-ghost btn-block" type="button" data-qr-pdf style="margin-top:8px;">\u{1F5A8}\uFE0F Etiqueta en PDF para imprimir</button>
    </div>`,document.body.appendChild(o),o.addEventListener("click",i=>{i.target===o&&o.remove()}),o.querySelector("[data-qr-descargar]").onclick=()=>{const i=document.createElement("a");i.href=pngEtiquetaQR(n,e,a),i.download=`qr-${nombreArchivoQR(e)}.png`,i.click()},o.querySelector("[data-qr-pdf]").onclick=()=>descargarPdfEtiquetasQR([{titulo:e,lineas:a,token:t}],`qr-${nombreArchivoQR(e)}.pdf`).catch(i=>toast(i.message,"\u26A0\uFE0F"))}function armarLibroExcel(e,a){const t=XLSX.utils.book_new();for(const[n,o]of a){const i=e[n]||[],l=i.length?Object.keys(i[0]):["(sin datos todav\xEDa)"],r=XLSX.utils.json_to_sheet(i.length?i:[l.reduce((c,s)=>({...c,[s]:""}),{})]);r["!cols"]=l.map(c=>({wch:Math.min(Math.max(c.length+4,12),32)})),XLSX.utils.book_append_sheet(t,r,o)}return t}
