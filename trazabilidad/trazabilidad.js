const cliente=supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY,{auth:{persistSession:!1}}),vista=document.getElementById("vista"),ESTADO={vivo:"En la unidad de producci\xF3n",vendido:"Vendido",sacrificado:"Sacrificado",baja:"Baja"},SEXO={macho:"Macho",hembra:"Hembra"};function esc(e){return String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function fecha(e){return e?new Date(e.slice(0,10)+"T00:00:00").toLocaleDateString("es-MX",{day:"2-digit",month:"short",year:"numeric"}):""}function edad(e){const t=Math.floor((Date.now()-new Date(e+"T00:00:00").getTime())/2630016e3);return t<24?`${t} meses`:`${Math.floor(t/12)} a\xF1os`}function kg(e){return e!=null?`${Number(e).toLocaleString("es-MX")} kg`:""}function fila(e,t){return t?`<div class="fila"><span>${esc(e)}</span><b>${esc(t)}</b></div>`:""}function aviso(e,t){return`<section class="tarjeta"><h1>${esc(e)}</h1><p class="tenue">${esc(t)}</p></section>`}function origen(e){return`<section class="tarjeta"><h2>Origen</h2>${fila("Productor",e.productor)}${fila("Comunidad",e.comunidad)}${fila("Unidad de producci\xF3n",/^mi unidad de producción$/i.test(e.rancho||"")?"":e.rancho)}${fila("Municipio",e.municipio)}${fila("Asociaci\xF3n",e.asociacion)}</section>`}function leyenda(e){return`<p class="leyenda">\u{1F33F} ${e?"Estos animales fueron criados":"Este animal fue criado"} bajo los est\xE1ndares de bienestar animal y ${e?"alimentados":"alimentado"} con harinas de \xE1rboles nativos.</p>`}function vistaAnimal(e){const t=new Date().toISOString().slice(0,10),o=e.sanidad.find(a=>a.retiro_hasta&&a.retiro_hasta>=t),n=e.sacrificio,s=e.total_pesajes??e.pesajes.length,c=[e.fecha_nacimiento&&{f:e.fecha_nacimiento,t:"Nacimiento",x:e.peso_nacimiento_kg?`Peso al nacer ${kg(e.peso_nacimiento_kg)}`:""},...pesajesResumidos(e.pesajes).map(a=>({f:a.fecha,t:"Pesaje",x:kg(a.peso_kg)})),...e.sanidad.map(a=>({f:a.fecha,t:a.tipo||"Sanidad",x:[a.producto,a.retiro_hasta&&`retiro hasta ${fecha(a.retiro_hasta)}`].filter(Boolean).join(" \xB7 ")})),...e.movilizaciones.map(a=>({f:a.fecha,t:"Movilizaci\xF3n",x:`${a.origen} \u2192 ${a.destino}${a.folio?` (gu\xEDa ${a.folio})`:""}`})),n&&{f:n.fecha,t:"Sacrificio",x:[n.rastro,n.tif&&`TIF ${n.tif}`,n.peso_canal_kg&&`canal ${kg(n.peso_canal_kg)}`].filter(Boolean).join(" \xB7 ")}].filter(Boolean).sort((a,i)=>a.f.localeCompare(i.f));return`
    <section class="tarjeta">
      <p class="etiqueta">Animal</p>
      <h1>${esc(e.numero||e.chip||"Sin identificar")}</h1>
      <p class="estado estado-${esc(e.estado)}">${esc(ESTADO[e.estado]||e.estado)}</p>
      ${o?`<p class="alerta">En per\xEDodo de retiro sanitario hasta ${fecha(o.retiro_hasta)}</p>`:""}
      ${fila("Raza",e.raza)}${fila("Sexo",SEXO[e.sexo])}${fila("Color",e.color)}
      ${fila("Nacimiento",e.fecha_nacimiento&&`${fecha(e.fecha_nacimiento)} (${edad(e.fecha_nacimiento)})`)}
      ${fila("\xDAltimo peso",e.peso_actual_kg&&`${kg(e.peso_actual_kg)}${e.peso_actual_fecha?` \xB7 ${fecha(e.peso_actual_fecha)}`:""}`)}
      ${fila("Pesajes registrados",s?String(s):"")}
      ${fila("Chip",e.chip)}${fila("Padre",e.padre)}${fila("Madre",e.madre)}
    </section>
    ${leyenda(!1)}
    ${origen(e)}
    <section class="tarjeta">
      <h2>Historial</h2>
      ${c.length?`<ol class="linea">${c.map(a=>`<li><span>${fecha(a.f)}</span><b>${esc(a.t)}</b>${a.x?`<small>${esc(a.x)}</small>`:""}</li>`).join("")}</ol>`:'<p class="tenue">Sin eventos registrados todav\xEDa.</p>'}
    </section>`}function pesajesResumidos(e){return e.length>4?[e[0],...e.slice(-3)]:e}function vistaLote(e){const t=e.animales.length,o=e.animales.filter(a=>a.sexo==="macho").length,n=e.animales.map(a=>a.peso_actual_kg).filter(a=>a!=null).map(Number),s=n.length?n.reduce((a,i)=>a+i,0)/n.length:null,c=a=>{const i=esc(a.numero||a.chip||"Sin identificar"),r=[SEXO[a.sexo],a.raza,a.fecha_nacimiento&&`nac. ${fecha(a.fecha_nacimiento)}`,kg(a.peso_actual_kg)].filter(Boolean).join(" \xB7 ");return`<li>${a.token?`<a href="?t=${esc(a.token)}">${i}</a>`:`<b>${i}</b>`}<small>${esc(r)}</small></li>`};return`
    <section class="tarjeta">
      <p class="etiqueta">Lote</p>
      <h1>${esc(e.nombre)}</h1>
      ${fila("Categor\xEDa",e.categoria)}${fila("Animales",String(t))}
      ${t?fila("Machos / hembras",`${o} / ${t-o}`):""}
      ${fila("Peso promedio",s!=null?`${s.toFixed(1)} kg`:"")}
    </section>
    ${leyenda(!0)}
    ${origen(e)}
    <section class="tarjeta">
      <h2>Animales del lote</h2>
      ${t?`<ul class="animales">${e.animales.map(c).join("")}</ul>`:'<p class="tenue">El lote no tiene animales.</p>'}
    </section>`}async function cargar(){const e=new URLSearchParams(location.search).get("t")||"";if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(e)){vista.innerHTML=aviso("C\xF3digo no v\xE1lido","Escanea de nuevo el QR.");return}const{data:t,error:o}=await cliente.rpc("trazabilidad_publica",{p_token:e});if(o){vista.innerHTML=aviso("No se pudo consultar","Revisa tu conexi\xF3n e intenta de nuevo.");return}if(!t){vista.innerHTML=aviso("No encontrado","Este c\xF3digo no est\xE1 registrado.");return}vista.innerHTML=t.tipo==="lote"?vistaLote(t):vistaAnimal(t),document.title=`${t.tipo==="lote"?t.nombre:t.numero||t.chip||"Animal"} \xB7 Trazabilidad`}cargar();
