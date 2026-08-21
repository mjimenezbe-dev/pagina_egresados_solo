// ============================================================
// escuelas.js
// Lógica del módulo "Gestión de Escuelas".
// Depende de datos.js
// ============================================================

const NOMBRE_COLECCION = "escuelas";

// ------------------------------------------------------------
// 1. Construir el HTML de una fila de la tabla para una escuela.
// ------------------------------------------------------------
function crearFilaHTML(escuela) {
    return `
        <tr data-id="${escuela.id}">
            <td>${escuela.nombre}</td>
            <td>${escuela.director}</td>
            <td>${escuela.carrera}</td>
            <td>
                <div class="acciones-tabla">
                    <button type="button" class="view" data-accion="ver" data-id="${escuela.id}"><i class="fa-solid fa-eye"></i></button>
                    <button type="button" class="edit" data-accion="editar" data-id="${escuela.id}"><i class="fa-solid fa-pencil"></i></button>
                    <button type="button" class="delete" data-accion="eliminar" data-id="${escuela.id}"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `;
}

// ------------------------------------------------------------
// 2. Dibujar la tabla completa a partir de una lista.
// ------------------------------------------------------------
function renderizarTabla(listaEscuelas) {
    const cuerpoTabla = document.getElementById("cuerpoTablaEscuelas");
    if (!cuerpoTabla) return;

    if (listaEscuelas.length === 0) {
        cuerpoTabla.innerHTML = '<tr><td colspan="4" style="text-align:center;">No se encontraron escuelas.</td></tr>';
        return;
    }

    const filasHTML = listaEscuelas.map(crearFilaHTML).join("");
    cuerpoTabla.innerHTML = filasHTML;
}

// ------------------------------------------------------------
// 3. Volver a leer los datos de Local Storage y redibujar.
// ------------------------------------------------------------
function actualizarVista() {
    let listaCompleta = obtenerColeccion(NOMBRE_COLECCION);
    
    // Datos iniciales en caso de que esté vacío
    if (listaCompleta.length === 0) {
        const datosIniciales = [
            { nombre: "Administración de Empresas", director: "María Isabel Losilla Barrientos", carrera: "300" },
            { nombre: "Ciberseguridad", director: "Edgar Zamora Gatgens", carrera: "1500" },
            { nombre: "Fundamentos", director: "Christian Sibaja F", carrera: "700" },
            { nombre: "Ingeniería del Software", director: "Sergio Oviedo Seas", carrera: "400" },
            { nombre: "Sistemas Industriales", director: "Sergio Oviedo Seas", carrera: "350" },
            { nombre: "Sistemas de Información", director: "María Isabel Losilla Barrientos", carrera: "1234" },
            { nombre: "Sistemas Inteligentes", director: "Tomás de Camino Beck", carrera: "1230" },
            { nombre: "Tecnologías de Información", director: "Jason Ulloa Hernández", carrera: "900" }
        ];
        datosIniciales.forEach(function(escuela) {
            agregarElemento(NOMBRE_COLECCION, escuela);
        });
        listaCompleta = obtenerColeccion(NOMBRE_COLECCION);
    }

    renderizarTabla(listaCompleta);
}

// ------------------------------------------------------------
// 4. Formulario: Cargar datos para editar.
// ------------------------------------------------------------
function cargarEscuelaEnFormulario(id) {
    const escuela = buscarPorId(NOMBRE_COLECCION, id);
    if (!escuela) return;

    document.getElementById("idEscuelaEditando").value = escuela.id;
    document.getElementById("nombreEscuela").value = escuela.nombre;
    document.getElementById("directorEscuela").value = escuela.director;
    document.getElementById("carreraEscuela").value = escuela.carrera;

    document.getElementById("tituloFormularioEscuela").textContent = "Editar Escuela";
    document.getElementById("contenedorFormularioEscuela").style.display = "block";
}

// ------------------------------------------------------------
// 5. Formulario: Limpiar y ocultar.
// ------------------------------------------------------------
function limpiarFormularioEscuela() {
    document.getElementById("formEscuela").reset();
    document.getElementById("idEscuelaEditando").value = "";
    document.getElementById("tituloFormularioEscuela").textContent = "Nueva Escuela";
    document.getElementById("contenedorFormularioEscuela").style.display = "none";
}

// ------------------------------------------------------------
// 6. Formulario: Manejar el envío (Crear o Actualizar).
// ------------------------------------------------------------
function manejarEnvioFormularioEscuela(evento) {
    evento.preventDefault();

    const datos = {
        nombre: document.getElementById("nombreEscuela").value.trim(),
        director: document.getElementById("directorEscuela").value.trim(),
        carrera: document.getElementById("carreraEscuela").value.trim()
    };

    const idEnEdicion = document.getElementById("idEscuelaEditando").value;

    if (idEnEdicion) {
        actualizarElemento(NOMBRE_COLECCION, idEnEdicion, datos);
    } else {
        agregarElemento(NOMBRE_COLECCION, datos);
    }

    limpiarFormularioEscuela();
    actualizarVista();
}

// ------------------------------------------------------------
// 7. Eliminar una escuela con confirmación.
// ------------------------------------------------------------
function manejarEliminarEscuela(id) {
    const escuela = buscarPorId(NOMBRE_COLECCION, id);
    if (!escuela) return;
    
    const confirmado = window.confirm(`¿Estás seguro de que deseas eliminar la escuela "${escuela.nombre}"?`);
    if (confirmado) {
        eliminarElemento(NOMBRE_COLECCION, id);
        actualizarVista();
    }
}

// ------------------------------------------------------------
// 8. Escuchador de clics para los botones de acción en la tabla.
// ------------------------------------------------------------
function manejarClicEnTabla(evento) {
    const boton = evento.target.closest("button[data-accion]");
    if (!boton) return;

    const id = boton.dataset.id;
    const accion = boton.dataset.accion;

    if (accion === "eliminar") {
        manejarEliminarEscuela(id);
    } else if (accion === "ver") {
        const escuela = buscarPorId(NOMBRE_COLECCION, id);
        if (escuela) {
            window.alert(
                `ESCUELA SELECCIONADA\n\nNombre: ${escuela.nombre}\nDirector: ${escuela.director}\nCarrera: ${escuela.carrera}`
            );
        }
    } else if (accion === "editar") {
        cargarEscuelaEnFormulario(id);
    }
}

// ------------------------------------------------------------
// 9. Arranque del módulo.
// ------------------------------------------------------------
function iniciarModuloEscuelas() {
    actualizarVista();
    
    const tabla = document.getElementById("tablaEscuelas");
    if (tabla) {
        tabla.addEventListener("click", manejarClicEnTabla);
    }

    const formulario = document.getElementById("formEscuela");
    if (formulario) {
        formulario.addEventListener("submit", manejarEnvioFormularioEscuela);
    }

    const btnAgregar = document.getElementById("btnAgregarEscuela");
    if (btnAgregar) {
        btnAgregar.addEventListener("click", function() {
            limpiarFormularioEscuela();
            document.getElementById("contenedorFormularioEscuela").style.display = "block";
        });
    }

    const btnCancelar = document.getElementById("btnCancelarEscuela");
    if (btnCancelar) {
        btnCancelar.addEventListener("click", limpiarFormularioEscuela);
    }
}

document.addEventListener("DOMContentLoaded", iniciarModuloEscuelas);