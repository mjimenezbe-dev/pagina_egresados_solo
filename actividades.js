// ============================================================
// actividades.js
// Lógica del módulo "Gestión de Actividades".
// Depende de datos.js (debe cargarse ANTES que este archivo).
// ============================================================

const COLECCION_ACTIVIDADES = "actividades";

// ------------------------------------------------------------
// 1. Construir el HTML de una fila de la tabla para una actividad
// ------------------------------------------------------------
function crearFilaActividadHTML(actividad) {
    // Usamos actividad.titulo (o nombre como respaldo en caso de que datos.js use "nombre")
    const tituloMostrado = actividad.titulo || actividad.nombre || "Sin título";
    
    return `
        <tr data-id="${actividad.id}">
            <td><strong>${tituloMostrado}</strong></td>
            <td>${actividad.descripcion}</td>
            <td>${actividad.publico}</td>
            <td>
                <div class="acciones-tabla">
                    <button type="button" class="view" data-accion="ver" data-id="${actividad.id}" title="Ver detalles"><i class="fa-solid fa-eye"></i></button>
                    <button type="button" class="edit" data-accion="editar" data-id="${actividad.id}" title="Editar"><i class="fa-solid fa-pencil"></i></button>
                    <button type="button" class="delete" data-accion="eliminar" data-id="${actividad.id}" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `;
}

// ------------------------------------------------------------
// 2. Dibujar la tabla completa
// ------------------------------------------------------------
function renderizarTablaActividades(listaActividades) {
    const cuerpoTabla = document.getElementById("cuerpoTablaActividades");
    if (!cuerpoTabla) return;

    if (listaActividades.length === 0) {
        cuerpoTabla.innerHTML = '<tr><td colspan="4" style="text-align:center;">No hay actividades registradas.</td></tr>';
        return;
    }

    const filasHTML = listaActividades.map(crearFilaActividadHTML).join("");
    cuerpoTabla.innerHTML = filasHTML;
}

// ------------------------------------------------------------
// 3. Volver a leer los datos y actualizar vista
// ------------------------------------------------------------
function actualizarVistaActividades() {
    const listaCompleta = obtenerColeccion(COLECCION_ACTIVIDADES);
    renderizarTablaActividades(listaCompleta);
}

// ------------------------------------------------------------
// 4. Formulario: Cargar datos para editar
// ------------------------------------------------------------
function cargarActividadEnFormulario(id) {
    const actividad = buscarPorId(COLECCION_ACTIVIDADES, id);
    if (!actividad) return;

    document.getElementById("idActividadEditando").value = actividad.id;
    document.getElementById("tituloActividad").value = actividad.titulo || actividad.nombre || "";
    document.getElementById("descripcionActividad").value = actividad.descripcion || "";
    document.getElementById("publicoActividad").value = actividad.publico || "";

    document.getElementById("tituloFormularioActividad").textContent = "Editar Actividad";
    document.getElementById("contenedorFormularioActividad").style.display = "block";
    
    // Scroll suave
    document.getElementById("contenedorFormularioActividad").scrollIntoView({ behavior: 'smooth' });
}

// ------------------------------------------------------------
// 5. Formulario: Limpiar y ocultar
// ------------------------------------------------------------
function limpiarFormularioActividad() {
    document.getElementById("formActividad").reset();
    document.getElementById("idActividadEditando").value = "";
    document.getElementById("tituloFormularioActividad").textContent = "Nueva Actividad";
    document.getElementById("contenedorFormularioActividad").style.display = "none";
}

// ------------------------------------------------------------
// 6. Formulario: Guardar (Crear/Editar)
// ------------------------------------------------------------
function manejarEnvioFormularioActividad(evento) {
    evento.preventDefault();

    const datos = {
        titulo: document.getElementById("tituloActividad").value.trim(),
        descripcion: document.getElementById("descripcionActividad").value.trim(),
        publico: document.getElementById("publicoActividad").value.trim()
    };

    const idEnEdicion = document.getElementById("idActividadEditando").value;

    if (idEnEdicion) {
        actualizarElemento(COLECCION_ACTIVIDADES, idEnEdicion, datos);
    } else {
        agregarElemento(COLECCION_ACTIVIDADES, datos);
    }

    limpiarFormularioActividad();
    actualizarVistaActividades();
}

// ------------------------------------------------------------
// 7. Eliminar con confirmación
// ------------------------------------------------------------
function manejarEliminarActividad(id) {
    const actividad = buscarPorId(COLECCION_ACTIVIDADES, id);
    if (!actividad) return;
    
    const titulo = actividad.titulo || actividad.nombre || "esta actividad";
    const confirmado = window.confirm(`¿Estás seguro de que deseas eliminar "${titulo}"?`);
    
    if (confirmado) {
        eliminarElemento(COLECCION_ACTIVIDADES, id);
        actualizarVistaActividades();
    }
}

// ------------------------------------------------------------
// 8. Clics en la tabla (Ver, Editar, Eliminar)
// ------------------------------------------------------------
function manejarClicEnTablaActividades(evento) {
    const boton = evento.target.closest("button[data-accion]");
    if (!boton) return;

    const id = boton.dataset.id;
    const accion = boton.dataset.accion;

    if (accion === "eliminar") {
        manejarEliminarActividad(id);
    } else if (accion === "ver") {
        const actividad = buscarPorId(COLECCION_ACTIVIDADES, id);
        if (actividad) {
            const titulo = actividad.titulo || actividad.nombre;
            window.alert(
                `DETALLES DE LA ACTIVIDAD\n\nTítulo: ${titulo}\nDescripción: ${actividad.descripcion}\nPúblico: ${actividad.publico}`
            );
        }
    } else if (accion === "editar") {
        cargarActividadEnFormulario(id);
    }
}

// ------------------------------------------------------------
// 9. Inicializar el módulo
// ------------------------------------------------------------
function iniciarModuloActividades() {
    actualizarVistaActividades();
    
    const tabla = document.getElementById("tablaActividades");
    if (tabla) {
        tabla.addEventListener("click", manejarClicEnTablaActividades);
    }

    const formulario = document.getElementById("formActividad");
    if (formulario) {
        formulario.addEventListener("submit", manejarEnvioFormularioActividad);
    }

    const btnAgregar = document.getElementById("btnAgregarActividad");
    if (btnAgregar) {
        btnAgregar.addEventListener("click", function() {
            limpiarFormularioActividad();
            document.getElementById("contenedorFormularioActividad").style.display = "block";
        });
    }

    const btnCancelar = document.getElementById("btnCancelarActividad");
    if (btnCancelar) {
        btnCancelar.addEventListener("click", limpiarFormularioActividad);
    }
}

document.addEventListener("DOMContentLoaded", iniciarModuloActividades);