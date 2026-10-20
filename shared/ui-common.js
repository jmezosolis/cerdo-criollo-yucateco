function transicionSegura(e){if(document.startViewTransition&&!document.hidden)try{document.startViewTransition(e);return}catch{}e()}let _ultimaRedirigidaA=null,_ultimaRedirigidaEn=0;function redirigirSeguro(e){const t=Date.now();if(_ultimaRedirigidaA===e&&t-_ultimaRedirigidaEn<1500)return;_ultimaRedirigidaA=e,_ultimaRedirigidaEn=t;const a="ggRedirectLog";let o=[];try{o=JSON.parse(sessionStorage.getItem(a)||"[]")}catch{o=[]}o=o.filter(n=>t-n.t<8e3),o.push({url:e,t});try{sessionStorage.setItem(a,JSON.stringify(o))}catch{}if(o.filter(n=>n.url===e).length>=3){const n=document.getElementById("app");n&&(n.innerHTML=`
      <div class="wrap"><div class="card" style="text-align:center;">
        <div style="font-size:34px;">\u{1F4F6}</div>
        <h3 style="margin-top:8px;">No se pudo confirmar tu sesi\xF3n</h3>
        <p class="small muted" style="margin-top:6px;">Probablemente sea la conexi\xF3n \u2014 prob\xE1 de nuevo.</p>
        <button class="btn btn-primary btn-block" id="btnReintentarSesion" type="button">Reintentar</button>
      </div></div>`);const i=document.getElementById("btnReintentarSesion");i&&(i.onclick=()=>{sessionStorage.removeItem(a),location.reload()});return}location.replace(e)}const SCOPE_ROLES={ganadero:["ganadero"],administracion:["admin"]};function rolPermitidoEnApp(e){return e==="admin"||(SCOPE_ROLES[APP_SCOPE]||[]).includes(e)}function emojiScope(e){return{ganadero:"",administracion:""}[e]??""}function tituloScope(e){return{ganadero:"GanaID \u2014 Ganadero",administracion:"GanaID \u2014 Administraci\xF3n"}[e]||"GanaID"}function etiquetaScope(e){return{ganadero:"Ganadero",administracion:"la Administraci\xF3n"}[e]||e}function viewAccesoRestringido(e){return`
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
  </div>`}function blockConsultarChip(e,{autoFocoEscaner:t=!1}={}){return`
    <div class="row" style="margin-top:8px;">
      <input id="chipInput_${e}" data-autofoco-escaner="${t?"1":""}" placeholder="N\xFAmero del chip \u2014 o escane\xE1 con el lector" style="flex:1;">
      <button class="btn btn-primary" data-consultar="${e}">Consultar</button>
    </div>
    <div id="resultado_${e}" style="margin-top:10px;"></div>
  `}function bindConsultarChip(e=document){e.querySelectorAll("[data-consultar]").forEach(t=>{const a=t.dataset.consultar,o=document.getElementById("chipInput_"+a);o&&(t.onclick=()=>handleConsultar(a),o.onkeydown=n=>{n.key==="Enter"&&(n.preventDefault(),handleConsultar(a))},o.dataset.autofocoEscaner==="1"&&o.focus())})}function renderResultadoChip(e){return e.existe?`<div class="card">
    <div class="row" style="justify-content:space-between;align-items:center;">
      <span class="pill pill-${e.estado}">${etiquetaEstadoChip(e.estado)}</span>
      ${e.precio_oficial!=null?`<span class="small muted">Precio oficial: $${Number(e.precio_oficial).toLocaleString("es-MX")} MXN</span>`:""}
    </div>
    ${e.proveedor?`<p class="small muted" style="margin-top:6px;">Proveedor: ${esc(e.proveedor)}</p>`:""}
    ${e.animal?`<p class="small" style="margin-top:6px;">Animal: <b>${esc(e.animal.raza)||"Raza no especificada"}</b> \u2014 estado: ${etiquetaEstadoAnimal(e.animal.estado)}</p>`:""}
  </div>`:`<div class="card" style="border-color:var(--red-card-border);">
      <span class="pill pill-rechazada">\u26A0\uFE0F No reconocido</span>
      <p class="small" style="margin-top:8px;">${e.advertencia}</p>
    </div>`}async function handleConsultar(e){const t=document.getElementById("chipInput_"+e),a=t.value.trim();if(!a)return;const o=document.getElementById("resultado_"+e);try{o.innerHTML=renderResultadoChip(await mockApi.consultarChip(a))}catch(n){toast(n.message,"\u26A0\uFE0F");return}t.value="",t.focus()}function bloqueInstalarApp(){return window.__yaInstalada?"":window.__esIOS?`
      <div class="card" style="font-size:12.5px;line-height:1.6;">
        <b style="color:var(--primary);">\u{1F4F2} Instalar en iPhone/iPad</b>
        <p class="section-sub" style="margin-top:6px;">1. Toc\xE1 <b>Compartir</b> en la barra de Safari.<br>2. Eleg\xED <b>"Agregar a pantalla de inicio"</b>.</p>
      </div>`:window.__deferredInstallPrompt?'<button class="btn btn-ghost btn-block" id="btnInstalarApp" type="button">\u{1F4F2} Instalar app</button>':""}async function intentarInstalarApp(){window.__deferredInstallPrompt&&(window.__deferredInstallPrompt.prompt(),await window.__deferredInstallPrompt.userChoice,window.__deferredInstallPrompt=null,typeof renderApp=="function"&&renderApp())}function bindInstalarApp(){const e=document.getElementById("btnInstalarApp");e&&(e.onclick=intentarInstalarApp)}window.addEventListener("ganado-instalable",()=>{typeof renderApp=="function"&&typeof _sesionListo<"u"&&_sesionListo&&renderApp()});function selectMunicipios(e,t="",a=!1){const o=typeof municipiosDeLaSesion=="function"&&municipiosDeLaSesion()||MUNICIPIOS_RESPALDO,n=`datalist-${e}`;return`
    <input name="${e}" list="${n}" ${a?"required":""} placeholder="Escrib\xED el municipio" value="${esc(t)}" autocomplete="off">
    <datalist id="${n}">
      ${o.map(i=>`<option value="${i}"></option>`).join("")}
    </datalist>`}const CATEGORIAS_LOTE_SUGERIDAS=["Lechones","Destete","Engorda","Reproductoras","Cerdas paridas","Verracos","Venta a restaurante","Descarte"];function selectCategoriaLote(e,t=""){const a=`datalist-${e}`;return`
    <input name="${e}" list="${a}" placeholder="Opcional \u2014 p. ej. Engorda" value="${esc(t)}" autocomplete="off">
    <datalist id="${a}">
      ${CATEGORIAS_LOTE_SUGERIDAS.map(o=>`<option value="${o}"></option>`).join("")}
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
    </div>`}function bindAccesoCuenta(){const e=document.getElementById("btnIrARegistro");e&&(e.onclick=()=>{_accesoVista="registro",renderApp()});const t=document.getElementById("btnIrALogin");t&&(t.onclick=()=>{_accesoVista="login",renderApp()});const a=document.getElementById("formLoginGanadero");a&&(a.onsubmit=async n=>{n.preventDefault();const i=new FormData(a);try{await mockApi.loginConPassword(i.get("email"),i.get("password"))}catch(r){toast(r.message,"\u26A0\uFE0F")}});const o=document.getElementById("formRegistro");o&&(o.onsubmit=async n=>{n.preventDefault();const i=new FormData(o),r=o.querySelector('button[type="submit"]');r.disabled=!0;try{(await mockApi.registrarGanadero({email:i.get("email").trim(),password:i.get("password"),nombre:i.get("nombre").trim(),municipio:i.get("municipio")||null,rancho_o_empresa:"",telefono:""})).confirmacionPendiente?toast("Cuenta creada \u2014 revis\xE1 tu email para confirmarla antes de entrar","\u{1F4E9}"):toast("Cuenta creada","\u2705")}catch(l){toast(l.message,"\u26A0\uFE0F")}finally{r.disabled=!1}})}function iconoMenuUsuario(){return`<button class="avatar-btn" id="btnMenuUsuario" type="button" aria-label="Cuenta">${typeof APP_SCOPE<"u"&&APP_SCOPE==="administracion"?'<img src="../administrador.png" alt="" style="width:100%;height:100%;object-fit:cover;display:block;">':'<img src="../ganadero.png?v=3" alt="" style="width:100%;height:100%;object-fit:contain;display:block;">'}</button>`}function bindIconoMenuUsuario(){const e=document.getElementById("btnMenuUsuario");if(!e)return;const t=typeof APP_SCOPE<"u"&&APP_SCOPE!=="administracion";e.onclick=t&&typeof currentScreen<"u"?()=>{currentScreen!=="configuracion"&&history.pushState({pantalla:currentScreen},"",location.href),currentScreen="configuracion",typeof resetearSubvistas=="function"&&resetearSubvistas(),renderApp()}:abrirMenuUsuario}function formEditarPerfil(e){return`
    <form id="formEditarPerfil" style="margin-top:8px;">
      <label>Nombre</label>
      <input name="nombre" required value="${esc(e.nombre)}">
      <label>Rancho / empresa</label>
      <input name="rancho_o_empresa" value="${esc(e.rancho_o_empresa)}">
      <label>Tel\xE9fono</label>
      <input name="telefono" value="${esc(e.telefono)}">
      ${e.rol==="ganadero"?`<label>Municipio</label>${selectMunicipios("municipio",e.municipio||"")}`:""}
      <button class="btn btn-primary btn-block" type="submit">Guardar cambios</button>
    </form>`}async function abrirMenuUsuario(){const e=mockApi.sesionActual();if(!e)return;const{data:t}=await supabaseClient.from("perfiles").select("*").eq("id",e.id).single(),a=t||e,o=document.createElement("div");o.className="modal-backdrop",o.innerHTML=`
    <div class="modal">
      <h3 class="section-title" style="margin-bottom:2px;">\u{1F464} ${esc(a.nombre)}</h3>
      <p class="small muted" style="margin-bottom:14px;">${etiquetaRol(a.rol)}${a.municipio?" \xB7 "+esc(a.municipio):""}</p>
      <button class="btn btn-ghost btn-block" id="btnMostrarEditarPerfil" type="button">\u270F\uFE0F Editar perfil</button>
      <div id="menuUsuarioEdicion"></div>
      <div style="margin-top:10px;">${bloqueInstalarApp()}</div>
      <button class="btn btn-ghost btn-block" id="btnCerrarSesionMenu" type="button" style="margin-top:8px;">\u{1F6AA} Cerrar sesi\xF3n</button>
    </div>`,document.body.appendChild(o),o.addEventListener("click",n=>{n.target===o&&o.remove()}),bindInstalarApp(),document.getElementById("btnMostrarEditarPerfil").onclick=n=>{n.target.style.display="none",document.getElementById("menuUsuarioEdicion").innerHTML=formEditarPerfil(a),document.getElementById("formEditarPerfil").onsubmit=async i=>{i.preventDefault();const r=new FormData(i.target);try{await mockApi.actualizarMiPerfil({nombre:r.get("nombre"),rancho_o_empresa:r.get("rancho_o_empresa"),telefono:r.get("telefono"),municipio:r.get("municipio")||null}),toast("Perfil actualizado","\u2705"),o.remove(),typeof renderApp=="function"&&renderApp()}catch(l){toast(l.message,"\u26A0\uFE0F")}}},document.getElementById("btnCerrarSesionMenu").onclick=()=>{mockApi.logout(),typeof currentScreen<"u"&&(currentScreen="inicio"),typeof activeTab<"u"&&(activeTab=null),typeof filtroUsuarios<"u"&&(filtroUsuarios="todos"),typeof filtroFechaAuditoriaDesde<"u"&&(filtroFechaAuditoriaDesde=""),typeof filtroFechaAuditoriaHasta<"u"&&(filtroFechaAuditoriaHasta=""),o.remove()}}function seccionForm(e,t){return`<div class="form-section-title">${e?e+" ":""}${t}</div>`}function splitRaza(e){const t=(e||"").split(/\s+x\s+/i);return t.length===2?{base:t[0],cruzada:t[1]}:{base:e||"",cruzada:""}}async function camposDatosAnimal(e={},{chipEscaneado:t=null}={}){const a=i=>e[i]!=null?e[i]:"",{base:o,cruzada:n}=splitRaza(e.raza);return`
    ${seccionForm("","Identificaci\xF3n")}
    <label>Chip${t?" (escaneado)":""}</label>
    ${t?`
    <input value="${esc(t)}" name="chip_uid" readonly style="background:transparent;font-weight:600;">
    `:`
    <input name="chip_uid" placeholder="Opcional" value="${a("chip_uid")}">
    `}
    <label>N\xB0 interno (tu propia numeraci\xF3n de rancho)</label>
    <input name="numero_interno" placeholder="Opcional" value="${a("numero_interno")}">
    <div class="row">
      <div style="flex:1;min-width:140px;">
        <label>Raza *</label>
        <input name="raza" placeholder="p. ej. Cerdo criollo yucateco" value="${o}">
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
      <input type="checkbox" id="chkEsCruza" name="es_cruza" ${n?"checked":""}>
      <label style="margin:0;" for="chkEsCruza">Es cruza de razas distintas</label>
    </div>
    <div id="wrapRazaCruzada" style="${n?"":"display:none;"}">
      <label>Raza cruzada</label>
      <input name="raza_cruzada" placeholder="p. ej. Angus" value="${n}">
    </div>
    <div class="row">
      <div style="flex:1;min-width:140px;">
        <label>Color / pelaje</label>
        <input name="color" placeholder="p. ej. Colorado" value="${a("color")}">
      </div>
      <div style="flex:1;min-width:140px;">
        <label>Fecha de nacimiento</label>
        <input type="date" name="fecha_nacimiento" value="${a("fecha_nacimiento")}">
      </div>
    </div>
    <label>Muesca / tatuaje</label>
    <input name="marca_hierro" placeholder="Opcional" value="${a("marca_hierro")}">

    ${seccionForm("","Peso")}
    <div class="row">
      <div style="flex:1;min-width:140px;">
        <label>Peso al nacer (kg)</label>
        <input name="peso_nacimiento_kg" type="number" step="0.1" min="0" placeholder="Opcional" value="${a("peso_nacimiento_kg")}">
      </div>
      <div style="flex:1;min-width:140px;">
        <label>Peso actual (kg)</label>
        <input name="peso_actual_kg" type="number" step="0.1" min="0" placeholder="Opcional" value="${a("peso_actual_kg")}">
      </div>
    </div>
    <label>Fecha del pesaje actual</label>
    <input type="date" name="peso_actual_fecha" value="${a("peso_actual_fecha")}">

    ${seccionForm("","Ubicaci\xF3n y notas")}
    <label>Rancho / predio</label>
    <input name="ubicacion" placeholder="p. ej. Rancho El Progreso, Villaflores" value="${a("ubicacion")}">
    <label>Observaciones</label>
    <textarea name="notas" placeholder="Cualquier dato adicional">${a("notas")}</textarea>
  `}function leerDatosAnimalDeFormulario(e){const t=i=>(e.get(i)||"").trim()||null,a=e.get("raza").trim(),o=(e.get("raza_cruzada")||"").trim(),n=e.get("es_cruza")==="on";return{chip_uid:t("chip_uid"),numero_interno:t("numero_interno"),raza:n&&o?`${a} x ${o}`:a,sexo:e.get("sexo"),color:t("color"),marca_hierro:t("marca_hierro"),fecha_nacimiento:e.get("fecha_nacimiento")||null,peso_nacimiento_kg:e.get("peso_nacimiento_kg")||null,peso_actual_kg:e.get("peso_actual_kg")||null,peso_actual_fecha:e.get("peso_actual_fecha")||null,ubicacion:t("ubicacion"),notas:t("notas")}}let _sheetJsPromise=null;function cargarSheetJS(){return typeof XLSX<"u"?Promise.resolve():_sheetJsPromise||(_sheetJsPromise=new Promise((e,t)=>{const a=document.createElement("script");a.src="https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js",a.onload=e,a.onerror=()=>{_sheetJsPromise=null,t(new Error("No se pudo cargar la librer\xEDa de Excel"))},document.head.appendChild(a)}),_sheetJsPromise)}let _qrPromise=null;function cargarQR(){return typeof qrcode<"u"?Promise.resolve():_qrPromise||(_qrPromise=new Promise((e,t)=>{const a=document.createElement("script");a.src="https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js",a.onload=e,a.onerror=()=>{_qrPromise=null,t(new Error("No se pudo cargar el generador de QR"))},document.head.appendChild(a)}),_qrPromise)}function urlTrazabilidad(e){const t=/\/(ganadero|administracion)\//.test(location.pathname);return new URL(`${t?"../":"./"}trazabilidad/index.html?t=${e}`,location.href).href}function hacerQR(e){const t=qrcode(0,"M");return t.addData(e),t.make(),t}function svgQR(e){return hacerQR(e).createSvgTag({cellSize:4,margin:2,scalable:!0})}function pngEtiquetaQR(e,t,a){const o=hacerQR(e),n=o.getModuleCount(),i=10,r=4,l=(n+r*2)*i,c=document.createElement("canvas");c.width=l,c.height=l+80;const s=c.getContext("2d");s.fillStyle="#fff",s.fillRect(0,0,c.width,c.height),s.fillStyle="#000";for(let d=0;d<n;d++)for(let u=0;u<n;u++)o.isDark(d,u)&&s.fillRect((u+r)*i,(d+r)*i,i,i);return s.textAlign="center",s.font="bold 30px system-ui, sans-serif",s.fillText(t,l/2,l+20,l-20),s.fillStyle="#555",s.font="22px system-ui, sans-serif",s.fillText(a,l/2,l+56,l-20),c.toDataURL("image/png")}function imprimirEtiquetasQR(e,t,a=window.open("","_blank")){if(!a){toast("El navegador bloque\xF3 la ventana para imprimir","\u26A0\uFE0F");return}const o=e.map(n=>`
    <div class="et">${svgQR(urlTrazabilidad(n.token))}<b>${esc(n.titulo)}</b><span>${esc(n.subtitulo||"")}</span></div>`).join("");a.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${esc(t)}</title>
<style>
body{font-family:system-ui,sans-serif;margin:10mm}
.hoja{display:grid;grid-template-columns:repeat(3,1fr);gap:6mm}
.et{border:1px dashed #bbb;border-radius:3mm;padding:3mm;text-align:center;break-inside:avoid}
.et svg{width:100%;height:auto}
.et b{display:block;font-size:12pt;margin-top:1mm}
.et span{display:block;font-size:9pt;color:#555}
</style></head><body><div class="hoja">${o}</div>
<script>window.onload = () => window.print();<\/script></body></html>`),a.document.close()}async function abrirQrTrazabilidad(e,t,a){try{await cargarQR()}catch(i){toast(i.message+" \u2014 revis\xE1 la conexi\xF3n","\u26A0\uFE0F");return}const o=urlTrazabilidad(a),n=document.createElement("div");n.className="modal-backdrop",n.innerHTML=`
    <div class="modal" style="text-align:center;">
      <h3 class="section-title" style="margin-bottom:4px;">${esc(e)}</h3>
      <p class="small muted">${esc(t)}</p>
      <div style="width:220px;max-width:100%;margin:12px auto;">${svgQR(o)}</div>
      <a class="btn btn-ghost btn-block" href="${esc(o)}" target="_blank" rel="noopener">\u{1F50E} Ver lo que muestra</a>
      <button class="btn btn-ghost btn-block" type="button" data-qr-descargar style="margin-top:8px;">\u2B07\uFE0F Descargar imagen</button>
      <button class="btn btn-ghost btn-block" type="button" data-qr-imprimir style="margin-top:8px;">\u{1F5A8}\uFE0F Imprimir etiqueta</button>
    </div>`,document.body.appendChild(n),n.addEventListener("click",i=>{i.target===n&&n.remove()}),n.querySelector("[data-qr-descargar]").onclick=()=>{const i=document.createElement("a");i.href=pngEtiquetaQR(o,e,t),i.download=`qr-${e.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")||"trazabilidad"}.png`,i.click()},n.querySelector("[data-qr-imprimir]").onclick=()=>imprimirEtiquetasQR([{titulo:e,subtitulo:t,token:a}],e)}function armarLibroExcel(e,t){const a=XLSX.utils.book_new();for(const[o,n]of t){const i=e[o]||[],r=i.length?Object.keys(i[0]):["(sin datos todav\xEDa)"],l=XLSX.utils.json_to_sheet(i.length?i:[r.reduce((c,s)=>({...c,[s]:""}),{})]);l["!cols"]=r.map(c=>({wch:Math.min(Math.max(c.length+4,12),32)})),XLSX.utils.book_append_sheet(a,l,n)}return a}
