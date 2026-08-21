// ============================================================
// carreras.js
// Lógica del módulo "Gestión de Carreras".
// Depende de datos.js (debe cargarse ANTES que este archivo).
// ============================================================

const NOMBRE_COLECCION = "carreras";

// ------------------------------------------------------------
// 1. Construir el HTML de una fila de la tabla para una carrera.
// ------------------------------------------------------------
function crearFilaCarreraHTML(carrera) {
    return `
        <tr data-id="${carrera.id}">
            <td><strong>${carrera.nombre}</strong></td>
            <td>${carrera.escuela}</td>
            <td>${carrera.egresados}</td>
            <td>${carrera.estado}</td>
            <td>
                <div class="acciones-tabla">
                    <button type="button" class="view" data-accion="ver" data-id="${carrera.id}" title="Ver detalles"><i class="fa-solid fa-eye"></i></button>
                    <button type="button" class="edit" data-accion="editar" data-id="${carrera.id}" title="Editar"><i class="fa-solid fa-pencil"></i></button>
                    <button type="button" class="delete" data-accion="eliminar" data-id="${carrera.id}" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `;
}

// ------------------------------------------------------------
// 2. Dibujar la tabla completa a partir de una lista.
// ------------------------------------------------------------
function renderizarTablaCarreras(listaCarreras) {
    const cuerpoTabla = document.getElementById("cuerpoTablaCarreras");
    if (!cuerpoTabla) return;

    if (listaCarreras.length === 0) {
        cuerpoTabla.innerHTML = '<tr><td colspan="5" style="text-align:center;">No se encontraron carreras registradas.</td></tr>';
        return;
    }

    const filasHTML = listaCarreras.map(crearFilaCarreraHTML).join("");
    cuerpoTabla.innerHTML = filasHTML;
}

// ------------------------------------------------------------
// 3. Volver a leer los datos de Local Storage y redibujar.
// ------------------------------------------------------------
function actualizarVistaCarreras() {
    // Ya no necesitamos inicializar datos aquí porque datos.js se encarga
    const listaCompleta = obtenerColeccion(NOMBRE_COLECCION);
    renderizarTablaCarreras(listaCompleta);
}

// ------------------------------------------------------------
// 4. Formulario: Cargar datos para editar.
// ------------------------------------------------------------
function cargarCarreraEnFormulario(id) {
    const carrera = buscarPorId(NOMBRE_COLECCION, id);
    if (!carrera) return;

    document.getElementById("idCarreraEditando").value = carrera.id;
    document.getElementById("nombreCarrera").value = carrera.nombre;
    document.getElementById("escuelaCarrera").value = carrera.escuela;
    document.getElementById("egresadosCarrera").value = carrera.egresados;
    document.getElementById("estadoCarrera").value = carrera.estado;

    document.getElementById("tituloFormularioCarrera").textContent = "Editar Carrera";
    document.getElementById("contenedorFormularioCarrera").style.display = "block";
    
    // Scroll suave hacia el formulario
    document.getElementById("contenedorFormularioCarrera").scrollIntoView({ behavior: 'smooth' });
}

// ------------------------------------------------------------
// 5. Formulario: Limpiar y ocultar.
// ------------------------------------------------------------
function limpiarFormularioCarrera() {
    document.getElementById("formCarrera").reset();
    document.getElementById("idCarreraEditando").value = "";
    document.getElementById("tituloFormularioCarrera").textContent = "Nueva Carrera";
    document.getElementById("contenedorFormularioCarrera").style.display = "none";
}

// ------------------------------------------------------------
// 6. Formulario: Manejar el envío (Crear o Actualizar).
// ------------------------------------------------------------
function manejarEnvioFormularioCarrera(evento) {
    evento.preventDefault();

    const datos = {
        nombre: document.getElementById("nombreCarrera").value.trim(),
        escuela: document.getElementById("escuelaCarrera").value.trim(),
        egresados: parseInt(document.getElementById("egresadosCarrera").value.trim(), 10) || 0,
        estado: document.getElementById("estadoCarrera").value.trim()
    };

    const idEnEdicion = document.getElementById("idCarreraEditando").value;

    if (idEnEdicion) {
        actualizarElemento(NOMBRE_COLECCION, idEnEdicion, datos);
    } else {
        agregarElemento(NOMBRE_COLECCION, datos);
    }

    limpiarFormularioCarrera();
    actualizarVistaCarreras();
}

// ------------------------------------------------------------
// 7. Eliminar una carrera con confirmación.
// ------------------------------------------------------------
function manejarEliminarCarrera(id) {
    const carrera = buscarPorId(NOMBRE_COLECCION, id);
    if (!carrera) return;
    
    const confirmado = window.confirm(`¿Estás seguro de que deseas eliminar la carrera "${carrera.nombre}"?`);
    if (confirmado) {
        eliminarElemento(NOMBRE_COLECCION, id);
        actualizarVistaCarreras();
    }
}

// ------------------------------------------------------------
// 8. Escuchador de clics para los botones de acción en la tabla.
// ------------------------------------------------------------
function manejarClicEnTablaCarreras(evento) {
    const boton = evento.target.closest("button[data-accion]");
    if (!boton) return;

    const id = boton.dataset.id;
    const accion = boton.dataset.accion;

    if (accion === "eliminar") {
        manejarEliminarCarrera(id);
    } else if (accion === "ver") {
        const carrera = buscarPorId(NOMBRE_COLECCION, id);
        if (carrera) {
            window.alert(
                `DETALLES DE LA CARRERA\n\nNombre: ${carrera.nombre}\nEscuela: ${carrera.escuela}\nEgresados: ${carrera.egresados}\nEstado: ${carrera.estado}`
            );
        }
    } else if (accion === "editar") {
        cargarCarreraEnFormulario(id);
    }
}

// ------------------------------------------------------------
// 9. Arranque del módulo.
// ------------------------------------------------------------
function iniciarModuloCarreras() {
    actualizarVistaCarreras();
    
    const tabla = document.getElementById("tablaCarreras");
    if (tabla) {
        tabla.addEventListener("click", manejarClicEnTablaCarreras);
    }

    const formulario = document.getElementById("formCarrera");
    if (formulario) {
        formulario.addEventListener("submit", manejarEnvioFormularioCarrera);
    }

    const btnAgregar = document.getElementById("btnAgregarCarrera");
    if (btnAgregar) {
        btnAgregar.addEventListener("click", function() {
            limpiarFormularioCarrera();
            document.getElementById("contenedorFormularioCarrera").style.display = "block";
        });
    }

    const btnCancelar = document.getElementById("btnCancelarCarrera");
    if (btnCancelar) {
        btnCancelar.addEventListener("click", limpiarFormularioCarrera);
    }
}

document.addEventListener("DOMContentLoaded", iniciarModuloCarreras);