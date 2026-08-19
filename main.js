// ============================================================
// main.js
// Lógica del formulario de inicio de sesión.
//
// IMPORTANTE (léelo antes de usar esto en un sitio real):
// Este login es solo una SIMULACIÓN para fines de práctica/demo.
// Las contraseñas están escritas directamente en este archivo,
// que cualquiera puede ver abriendo las herramientas de
// desarrollador del navegador. Un login real necesita un
// servidor (backend) que verifique las credenciales de forma
// segura. Aquí lo hacemos así solo para poder mostrar el flujo
// de "detectar rol -> mensaje de bienvenida -> redirigir".
// ============================================================


// ------------------------------------------------------------
// 1. "Base de datos" de usuarios de prueba.
//    Es un objeto (como un diccionario) donde cada clave es el
//    nombre de usuario, y el valor es otro objeto con su
//    contraseña, su rol y a qué página debe ir.
// ------------------------------------------------------------
const USUARIOS_DEMO = {
    admin: {
        contrasena: "admin123",
        rol: "admin",
        nombreRol: "Administrador",
        paginaDestino: "gestion_egresados.html"
    },
    egresado: {
        contrasena: "egresado123",
        rol: "user",
        nombreRol: "Egresado",
        paginaDestino: "perfil_egresado.html"
    }
};


// ------------------------------------------------------------
// 2. Función que busca las credenciales que la persona escribió
//    dentro de USUARIOS_DEMO y decide si son correctas.
//
//    Recibe: el texto de usuario y el texto de contraseña.
//    Devuelve: los datos del usuario (rol, página, etc.) si la
//              combinación es correcta, o "null" si no lo es.
// ------------------------------------------------------------
function verificarCredenciales(usuarioEscrito, contrasenaEscrita) {
    // Buscamos si existe un usuario con ese nombre en nuestro objeto.
    const usuarioEncontrado = USUARIOS_DEMO[usuarioEscrito.toLowerCase().trim()];

    // Si no existe ningún usuario con ese nombre, no hay acceso.
    if (!usuarioEncontrado) {
        return null;
    }

    // Si existe, comparamos la contraseña escrita con la guardada.
    if (usuarioEncontrado.contrasena !== contrasenaEscrita) {
        return null; // La contraseña no coincide: acceso denegado.
    }

    // Si llegamos aquí, el usuario y la contraseña son correctos.
    return usuarioEncontrado;
}


// ------------------------------------------------------------
// 3. Función que guarda el rol activo en el navegador.
//    Usamos sessionStorage, que es una memoria temporal del
//    navegador: se borra sola cuando la persona cierra la
//    pestaña, pero se mantiene mientras navega entre páginas.
//    Así, cualquier otra página del sitio puede leer quién
//    entró (user o admin) sin necesidad de un servidor.
// ------------------------------------------------------------
function guardarRolActivo(rol) {
    sessionStorage.setItem("rolActivo", rol);
}


// ------------------------------------------------------------
// 4. Función que muestra el mensaje de bienvenida en pantalla.
//    Recibe el elemento HTML donde escribir el mensaje y el
//    nombre del rol ("Administrador" o "Egresado").
// ------------------------------------------------------------
function mostrarMensajeBienvenida(elementoMensaje, nombreRol) {
    // Escribimos el texto de bienvenida dentro del elemento.
    elementoMensaje.textContent = "¡Bienvenido/a! Ingresando como " + nombreRol + "...";

    // Le quitamos la clase "error" (por si había un mensaje de error antes).
    elementoMensaje.classList.remove("error");

    // Le agregamos la clase "exito" para que se vea en verde.
    elementoMensaje.classList.add("exito");

    // Le agregamos la clase "visible" para que el mensaje se muestre
    // (en el CSS, los mensajes están ocultos por defecto).
    elementoMensaje.classList.add("visible");
}


// ------------------------------------------------------------
// 5. Función que muestra un mensaje de error cuando el usuario
//    o la contraseña están mal escritos.
// ------------------------------------------------------------
function mostrarMensajeError(elementoMensaje, texto) {
    elementoMensaje.textContent = texto;
    elementoMensaje.classList.remove("exito");
    elementoMensaje.classList.add("error");
    elementoMensaje.classList.add("visible");
}


// ------------------------------------------------------------
// 6. Función que espera un momento (para que la persona alcance
//    a leer el mensaje de bienvenida) y luego redirige a la
//    página que corresponde según el rol.
// ------------------------------------------------------------
function redirigirAlPerfil(paginaDestino) {
    // setTimeout ejecuta el código de adentro después de esperar
    // la cantidad de milisegundos indicada (1200 ms = 1.2 segundos).
    setTimeout(function () {
        window.location.href = paginaDestino;
    }, 1200);
}


// ------------------------------------------------------------
// 7. Función principal: se ejecuta cuando la persona envía el
//    formulario (hace clic en "Iniciar sesión" o presiona Enter).
// ------------------------------------------------------------
function manejarEnvioDeFormulario(evento) {
    // Evitamos que el formulario recargue la página, que es su
    // comportamiento por defecto.
    evento.preventDefault();

    // Buscamos los campos de usuario, contraseña y el elemento
    // donde vamos a escribir los mensajes.
    const campoUsuario = document.getElementById("usuario");
    const campoContrasena = document.getElementById("contrasena");
    const elementoMensaje = document.getElementById("mensajeLogin");

    // Leemos lo que la persona escribió en cada campo.
    const usuarioEscrito = campoUsuario.value;
    const contrasenaEscrita = campoContrasena.value;

    // Verificamos las credenciales usando la función que ya definimos.
    const usuarioValido = verificarCredenciales(usuarioEscrito, contrasenaEscrita);

    // Si "usuarioValido" es null, las credenciales estaban mal.
    if (!usuarioValido) {
        mostrarMensajeError(elementoMensaje, "Usuario o contraseña incorrectos. Intenta de nuevo.");
        return; // Cortamos la función aquí: no seguimos ni redirigimos.
    }

    // Si llegamos aquí, el usuario y la contraseña son correctos.
    // 1) Guardamos el rol en sessionStorage para que otras páginas lo lean.
    guardarRolActivo(usuarioValido.rol);

    // 2) Mostramos el mensaje de bienvenida con el nombre del rol.
    mostrarMensajeBienvenida(elementoMensaje, usuarioValido.nombreRol);

    // 3) Después de un momento, redirigimos a la página que le
    //    corresponde a ese rol (perfil de egresado o de admin).
    redirigirAlPerfil(usuarioValido.paginaDestino);
}


// ------------------------------------------------------------
// 8. Función de inicio: conecta el formulario con la función
//    que maneja el envío. Se llama una sola vez, cuando el HTML
//    ya terminó de cargar.
// ------------------------------------------------------------
function iniciar() {
    // Buscamos el formulario de login por su id.
    const formularioLogin = document.getElementById("formularioLogin");

    // Si esta página no tiene formulario de login, no hacemos nada
    // (esto evita errores si main.js se carga en otra página distinta).
    if (!formularioLogin) {
        return;
    }

    // Le decimos al formulario: "cuando te envíen, ejecuta esta función".
    formularioLogin.addEventListener("submit", manejarEnvioDeFormulario);
}


// ------------------------------------------------------------
// 9. Ejecutamos "iniciar" apenas el navegador termina de armar
//    la página (así nos aseguramos de que el formulario ya existe
//    en el HTML antes de intentar buscarlo).
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", iniciar);
