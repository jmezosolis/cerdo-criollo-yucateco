async function renderApp(){const e=mockApi.sesionActual();if(e){redirigirSeguro(e.rol==="admin"?"./administracion/index.html":"./ganadero/index.html");return}document.getElementById("app").innerHTML=`
    <div class="wrap">
      <div class="brand">
        <div class="brand-logo-badge">
          <!-- "?v=2" fuerza a que el navegador/CDN de Hostinger lo traten
               como un archivo distinto al de antes, sin esperar a que
               venza el cach\xE9 de 7 d\xEDas (ver frontend/.htaccess) \u2014 subir
               este n\xFAmero cada vez que se reemplace el logo. -->
          <img src="./ganadero.png?v=3" alt="" class="brand-logo">
        </div>
      </div>
      ${bloqueAccesoCuenta()}
    </div>`,bindAccesoCuenta()}esperarSesionInicial().then(renderApp);
