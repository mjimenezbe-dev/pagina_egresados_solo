// sitio.js
// Se carga en TODAS las páginas excepto en iniciar_sesion.html.
// Su única tarea es leer el rol que main.js guardó en sessionStorage
// (al iniciar sesión) y mostrar una etiqueta con ese rol junto al
// logo del encabezado, para que la persona sepa como quién está
// navegando (Egresado o Administrador).
//
// También acepta ?rol=user o ?rol=admin en la URL como método
// alternativo (útil si alguien abre una página directamente sin
// pasar por el formulario de login).

(function () {
    const ETIQUETAS_ROL = {
        admin: "Administrador",
        user: "Egresado"
    };

    // 1. Si la URL trae ?rol=user o ?rol=admin, lo guardamos como el rol activo.
    const parametros = new URLSearchParams(window.location.search);
    const rolEnUrl = parametros.get("rol");
    if (rolEnUrl && ETIQUETAS_ROL[rolEnUrl]) {
        sessionStorage.setItem("rolActivo", rolEnUrl);
    }

    // 2. Leemos el rol activo guardado (si existe).
    const rolActivo = sessionStorage.getItem("rolActivo");

    // 3. Si hay un rol activo, mostramos la etiqueta en el header.
    if (rolActivo && ETIQUETAS_ROL[rolActivo]) {
        const logo = document.querySelector("header .logo");
        if (logo && !document.getElementById("rol-badge")) {
            const badge = document.createElement("span");
            badge.id = "rol-badge";
            badge.className = "rol-badge";
            badge.textContent = ETIQUETAS_ROL[rolActivo];
            logo.insertAdjacentElement("afterend", badge);
        }
    }
})();
