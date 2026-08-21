document.addEventListener('DOMContentLoaded', () => {
    renderizarSesionNav();
    adaptarMenuSegunRol();
    inicializarMenuDesplegable();
    marcarEnlaceActivo();
    inicializarFormularioLogin();
});

/* ==========================================
   1. GESTIÓN DE SESIÓN Y ROLES
   ========================================== */

/**
 * Obtiene el usuario actual desde localStorage y normaliza el rol.
 * Si no hay sesión, por defecto se asigna rol de "Egresado" (no admin).
 */
function obtenerUsuarioActual() {
    const usuarioGuardado = localStorage.getItem('usuarioActual');

    // Si no hay sesión guardada, se retorna rol de Egresado (Usuario Normal)
    if (!usuarioGuardado) {
        return {
            nombre: 'Egresado',
            rol: 'egresado',
            rolLimpio: 'Egresado',
            esAdmin: false
        };
    }

    try {
        const usuario = JSON.parse(usuarioGuardado);

        // Mapeo estricto: 'bienestar' o 'admin' -> Bienestar (Admin)
        const esBienestar = usuario.rol === 'bienestar' || usuario.rol === 'admin';
        const rolLimpio = esBienestar ? 'Bienestar' : 'Egresado';

        return {
            ...usuario,
            rolLimpio: rolLimpio,
            esAdmin: esBienestar
        };
    } catch (e) {
        console.error('Error al leer datos de sesión:', e);
        return { nombre: 'Egresado', rol: 'egresado', rolLimpio: 'Egresado', esAdmin: false };
    }
}

/**
 * Guarda la sesión activa en localStorage.
 */
function guardarSesionActiva(usuario) {
    localStorage.setItem('usuarioActual', JSON.stringify(usuario));
}

/**
 * Renderiza en el contenedor #infoSesionNav el rol limpio y el botón de cerrar sesión.
 */
function renderizarSesionNav() {
    const contenedorSesion = document.getElementById('infoSesionNav');
    if (!contenedorSesion) return;

    const usuario = obtenerUsuarioActual();

    contenedorSesion.innerHTML = `
        <span class="rol-tag">${usuario.rolLimpio}</span>
        <button type="button" class="btn-logout" id="btnCerrarSesion">Cerrar Sesión</button>
    `;

    const btnLogout = document.getElementById('btnCerrarSesion');
    if (btnLogout) {
        btnLogout.addEventListener('click', cerrarSesion);
    }
}

/**
 * Borra la sesión local y redirige a la página principal.
 */
function cerrarSesion() {
    localStorage.removeItem('usuarioActual');
    sessionStorage.clear();
    window.location.href = 'inicio.html';
}

/**
 * Adapta los enlaces de navegación según si es Administrador o Egresado.
 */
function adaptarMenuSegunRol() {
    const usuario = obtenerUsuarioActual();
    const enlaces = document.querySelectorAll('header nav a');

    enlaces.forEach(enlace => {
        let href = enlace.getAttribute('href');
        if (!href) return;

        if (usuario.esAdmin) {
            // Si es admin, convierte rutas de usuario a admin si existen
            if (href.includes('_user.html')) {
                enlace.setAttribute('href', href.replace('_user.html', '.html'));
            } else if (href.includes('-user.html')) {
                enlace.setAttribute('href', href.replace('-user.html', '.html'));
            }
        }
    });
}

/* ==========================================
   2. INTERACCIÓN DE MENÚS DESPLEGABLES (.mnu-btn)
   ========================================== */

function inicializarMenuDesplegable() {
    const botonesMenu = document.querySelectorAll('.mnu-btn');

    botonesMenu.forEach(boton => {
        boton.addEventListener('click', (e) => {
            e.stopPropagation();
            const submenu = boton.nextElementSibling;

            if (submenu && submenu.tagName === 'UL') {
                // Cierra otros submenús abiertos
                document.querySelectorAll('header nav ul ul').forEach(ul => {
                    if (ul !== submenu) {
                        ul.style.display = '';
                    }
                });

                // Alterna la visibilidad del submenú actual
                const estaVisible = window.getComputedStyle(submenu).display === 'block';
                submenu.style.display = estaVisible ? 'none' : 'block';
            }
        });
    });

    // Oculta submenús si se hace clic fuera del header
    document.addEventListener('click', (e) => {
        if (!e.target.closest('header nav')) {
            document.querySelectorAll('header nav ul ul').forEach(submenu => {
                submenu.style.display = '';
            });
        }
    });
}

/* ==========================================
   3. HIGHLIGHT DE PÁGINA ACTIVA
   ========================================== */

function marcarEnlaceActivo() {
    const rutaActual = window.location.pathname.split('/').pop() || 'inicio.html';
    const enlacesNav = document.querySelectorAll('header nav a');

    enlacesNav.forEach(enlace => {
        const href = enlace.getAttribute('href');
        if (href === rutaActual) {
            enlace.classList.add('active');
        }
    });
}

/* ==========================================
   4. MANEJO DEL FORMULARIO DE LOGIN
   ========================================== */

function inicializarFormularioLogin() {
    const formLogin = document.getElementById("formularioLogin");
    if (!formLogin) return;

    formLogin.addEventListener("submit", function (e) {
        e.preventDefault();

        const usuarioInput = document.getElementById("usuario").value.trim().toLowerCase();
        const claveInput = document.getElementById("contrasena").value.trim();
        const mensajeEl = document.getElementById("mensajeLogin");

        if (mensajeEl) {
            mensajeEl.textContent = "";
            mensajeEl.style.display = "none";
        }

        if (!usuarioInput || !claveInput) {
            if (mensajeEl) {
                mensajeEl.textContent = "Por favor completa todos los campos.";
                mensajeEl.style.display = "block";
            }
            return;
        }

        // Obtiene usuarios desde datos.js o usa respaldo
        const usuarios = typeof obtenerColeccion === "function" 
            ? obtenerColeccion("usuarios") 
            : [
                { email: "bienestar@cenfotec.ac.cr", rol: "bienestar", clave: "123456" },
                { email: "egresado@cenfotec.ac.cr", rol: "egresado", clave: "123456" }
            ];

        // Coincidencia por correo o por nombre de rol
        const usuarioEncontrado = usuarios.find(u => 
            (u.email.toLowerCase() === usuarioInput || u.rol.toLowerCase() === usuarioInput) && 
            u.clave === claveInput
        );

        if (usuarioEncontrado) {
            guardarSesionActiva(usuarioEncontrado);

            const esAdmin = usuarioEncontrado.rol === 'bienestar' || usuarioEncontrado.rol === 'admin';
            
            if (esAdmin) {
                // Administrador -> va a la gestión de egresados
                window.location.href = "gestion_egresados.html";
            } else {
                // Egresado -> va a la página principal de usuario
                window.location.href = "inicio.html";
            }
        } else {
            if (mensajeEl) {
                mensajeEl.textContent = "Usuario o contraseña incorrectos.";
                mensajeEl.style.display = "block";
            }
        }
    });
}