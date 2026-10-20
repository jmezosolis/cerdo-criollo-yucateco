const cliente=supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY,{auth:{persistSession:!1}}),vista=document.getElementById("vista"),ESTADO={vivo:"En el rancho",vendido:"Vendido",sacrificado:"Sacrificado",baja:"Baja"},SEXO={macho:"Macho",hembra:"Hembra"};function esc(e){return String(e??"").replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a])}function fecha(e){return e?new Date(e.slice(0,10)+"T00:00:00").toLocaleDateString("es-MX",{day:"2-digit",month:"short",year:"numeric"}):""}function edad(e){const a=Math.floor((Date.now()-new Date(e+"T00:00:00").getTime())/2630016e3);return a<24?`${a} meses`:`${Math.floor(a/12)} a\xF1os`}function kg(e){return e!=null?`${Number(e).toLocaleString("es-MX")} kg`:""}function fila(e,a){return a?`<div class="fila"><span>${esc(e)}</span><b>${esc(a)}</b></div>`:""}function aviso(e,a){return`<section class="tarjeta"><h1>${esc(e)}</h1><p class="tenue">${esc(a)}</p></section>`}function origen(e){return`<section class="tarjeta"><h2>Origen</h2>${fila("Rancho",e.rancho)}${fila("Municipio",e.municipio)}${fila("Asociaci\xF3n",e.asociacion)}</section>`}function vistaAnimal(e){const a=new Date().toISOString().slice(0,10),i=e.sanidad.find(t=>t.retiro_hasta&&t.retiro_hasta>=a),o=e.sacrificio,s=[e.fecha_nacimiento&&{f:e.fecha_nacimiento,t:"Nacimiento",x:e.peso_nacimiento_kg?`Peso al nacer ${kg(e.peso_nacimiento_kg)}`:""},...e.pesajes.map(t=>({f:t.fecha,t:"Pesaje",x:kg(t.peso_kg)})),...e.sanidad.map(t=>({f:t.fecha,t:t.tipo||"Sanidad",x:[t.producto,t.retiro_hasta&&`retiro hasta ${fecha(t.retiro_hasta)}`].filter(Boolean).join(" \xB7 ")})),...e.movilizaciones.map(t=>({f:t.fecha,t:"Movilizaci\xF3n",x:`${t.origen} \u2192 ${t.destino}${t.folio?` (gu\xEDa ${t.folio})`:""}`})),o&&{f:o.fecha,t:"Sacrificio",x:[o.rastro,o.tif&&`TIF ${o.tif}`,o.peso_canal_kg&&`canal ${kg(o.peso_canal_kg)}`].filter(Boolean).join(" \xB7 ")}].filter(Boolean).sort((t,n)=>t.f.localeCompare(n.f));return`
    <section class="tarjeta">
      <p class="etiqueta">Animal</p>
      <h1>${esc(e.numero||e.chip||"Sin identificar")}</h1>
      <p class="estado estado-${esc(e.estado)}">${esc(ESTADO[e.estado]||e.estado)}</p>
      ${i?`<p class="alerta">En per\xEDodo de retiro sanitario hasta ${fecha(i.retiro_hasta)}</p>`:""}
      ${fila("Raza",e.raza)}${fila("Sexo",SEXO[e.sexo])}${fila("Color",e.color)}
      ${fila("Nacimiento",e.fecha_nacimiento&&`${fecha(e.fecha_nacimiento)} (${edad(e.fecha_nacimiento)})`)}
      ${fila("\xDAltimo peso",e.peso_actual_kg&&`${kg(e.peso_actual_kg)}${e.peso_actual_fecha?` \xB7 ${fecha(e.peso_actual_fecha)}`:""}`)}
      ${fila("Chip",e.chip)}${fila("Padre",e.padre)}${fila("Madre",e.madre)}
    </section>
    ${origen(e)}
    <section class="tarjeta">
      <h2>Historial</h2>
      ${s.length?`<ol class="linea">${s.map(t=>`<li><span>${fecha(t.f)}</span><b>${esc(t.t)}</b>${t.x?`<small>${esc(t.x)}</small>`:""}</li>`).join("")}</ol>`:'<p class="tenue">Sin eventos registrados todav\xEDa.</p>'}
    </section>`}function vistaLote(e){const a=e.animales.length,i=e.animales.filter(n=>n.sexo==="macho").length,o=e.animales.map(n=>n.peso_actual_kg).filter(n=>n!=null).map(Number),s=o.length?o.reduce((n,c)=>n+c,0)/o.length:null,t=n=>{const c=esc(n.numero||n.chip||"Sin identificar"),r=[SEXO[n.sexo],n.raza,n.fecha_nacimiento&&`nac. ${fecha(n.fecha_nacimiento)}`,kg(n.peso_actual_kg)].filter(Boolean).join(" \xB7 ");return`<li>${n.token?`<a href="?t=${esc(n.token)}">${c}</a>`:`<b>${c}</b>`}<small>${esc(r)}</small></li>`};return`
    <section class="tarjeta">
      <p class="etiqueta">Lote</p>
      <h1>${esc(e.nombre)}</h1>
      ${fila("Categor\xEDa",e.categoria)}${fila("Animales",String(a))}
      ${a?fila("Machos / hembras",`${i} / ${a-i}`):""}
      ${fila("Peso promedio",s!=null?`${s.toFixed(1)} kg`:"")}
    </section>
    ${origen(e)}
    <section class="tarjeta">
      <h2>Animales del lote</h2>
      ${a?`<ul class="animales">${e.animales.map(t).join("")}</ul>`:'<p class="tenue">El lote no tiene animales.</p>'}
    </section>`}async function cargar(){const e=new URLSearchParams(location.search).get("t")||"";if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(e)){vista.innerHTML=aviso("C\xF3digo no v\xE1lido","Escanea de nuevo el QR.");return}const{data:a,error:i}=await cliente.rpc("trazabilidad_publica",{p_token:e});if(i){vista.innerHTML=aviso("No se pudo consultar","Revisa tu conexi\xF3n e intenta de nuevo.");return}if(!a){vista.innerHTML=aviso("No encontrado","Este c\xF3digo no est\xE1 registrado.");return}vista.innerHTML=a.tipo==="lote"?vistaLote(a):vistaAnimal(a),document.title=`${a.tipo==="lote"?a.nombre:a.numero||a.chip||"Animal"} \xB7 Trazabilidad`}cargar();
