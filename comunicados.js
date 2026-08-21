// ============================================================
// comunicados.js
// Lógica del módulo "Gestión de Comunicados".
// Depende de datos.js (debe cargarse ANTES que este archivo).
// ============================================================

const COLECCION_COMUNICADOS = "comunicados";

// ------------------------------------------------------------
// 0. Inyectar datos de prueba si está vacío
// ------------------------------------------------------------
function inicializarDatosComunicados() {
    const listaActual = obtenerColeccion(COLECCION_COMUNICADOS);
    
    if (listaActual.length === 0) {
        const datosBase = [
            { titulo: "Charla: Inteligencia Artificial en la industria", fecha: "15/06/2026", dirigido: "Todos los egresados", estado: "Publicado" },
            { titulo: "Nueva política de becas para maestrías", fecha: "10/06/2026", dirigido: "Egresados de Bachillerato", estado: "Publicado" },
            { titulo: "Feria de empleo tecnológico 2026", fecha: "05/06/2026", dirigido: "Todos los egresados", estado: "Borrador" }
        ];
        
        datosBase.forEach(com => agregarElemento(COLECCION_COMUNICADOS, com));
    }
}

// ------------------------------------------------------------
// 1. Construir HTML de una Fila (Corregido para diseño original)
// ------------------------------------------------------------
function crearFilaComunicadoHTML(comunicado) {
    let claseEstado = "activo";
    if (comunicado.estado === "Borrador") {
        claseEstado = "pendiente";
    }

    return `
        <tr>
            <td>${comunicado.titulo}</td>
            <td>${comunicado.fecha}</td>
            <td>${comunicado.dirigido}</td>
            <td><span class="${claseEstado}">${comunicado.estado}</span></td>
            <td>
                <div class="acciones-tabla">
                    <a href="#" class="view" data-accion="ver" data-id="${comunicado.id}" title="Ver Detalles">
                        <i class="fa-solid fa-eye"></i>
                    </a>
                    <a href="#" class="edit" data-accion="editar" data-id="${comunicado.id}" title="Editar">
                        <i class="fa-solid fa-pencil"></i>
                    </a>
                    <a href="#" class="delete" data-accion="eliminar" data-id="${comunicado.id}" title="Eliminar">
                        <i class="fa-solid fa-trash"></i>
                    </a>
                </div>
            </td>
        </tr>
    `;
}

// ------------------------------------------------------------
// 2. Dibujar la tabla
// ------------------------------------------------------------
function actualizarVistaComunicados() {
    const tbody = document.getElementById("cuerpoTablaComunicados");
    if (!tbody) return;

    const listaComunicados = obtenerColeccion(COLECCION_COMUNICADOS);

    if (listaComunicados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No hay comunicados registrados.</td></tr>';
        return;
    }

    tbody.innerHTML = listaComunicados.map(crearFilaComunicadoHTML).join("");
}

// ------------------------------------------------------------
// 3. Formulario: Cargar para Editar
// ------------------------------------------------------------
function cargarComunicadoEnFormulario(id) {
    const com = buscarPorId(COLECCION_COMUNICADOS, id);
    if (!com) return;

    document.getElementById("idComunicadoEditando").value = com.id;
    document.getElementById("tituloComunicado").value = com.titulo;
    document.getElementById("fechaComunicado").value = com.fecha;
    document.getElementById("dirigidoComunicado").value = com.dirigido;
    document.getElementById("estadoComunicado").value = com.estado || "Publicado";

    document.getElementById("tituloFormularioComunicado").textContent = "Editar Comunicado";
    document.getElementById("contenedorFormularioComunicado").style.display = "block";
    document.getElementById("contenedorFormularioComunicado").scrollIntoView({ behavior: 'smooth' });
}

// ------------------------------------------------------------
// 4. Formulario: Limpiar
// ------------------------------------------------------------
function limpiarFormularioComunicado() {
    document.getElementById("formComunicado").reset();
    document.getElementById("idComunicadoEditando").value = "";
    document.getElementById("tituloFormularioComunicado").textContent = "Nuevo Comunicado";
    document.getElementById("contenedorFormularioComunicado").style.display = "none";
}

// ------------------------------------------------------------
// 5. Formulario: Guardar (Crear / Editar)
// ------------------------------------------------------------
function manejarEnvioFormularioComunicado(evento) {
    evento.preventDefault();

    const datos = {
        titulo: document.getElementById("tituloComunicado").value.trim(),
        fecha: document.getElementById("fechaComunicado").value.trim(),
        dirigido: document.getElementById("dirigidoComunicado").value,
        estado: document.getElementById("estadoComunicado").value
    };

    const idEnEdicion = document.getElementById("idComunicadoEditando").value;

    if (idEnEdicion) {
        actualizarElemento(COLECCION_COMUNICADOS, idEnEdicion, datos);
    } else {
        agregarElemento(COLECCION_COMUNICADOS, datos);
    }

    limpiarFormularioComunicado();
    actualizarVistaComunicados();
}

// ------------------------------------------------------------
// 6. Eliminar
// ------------------------------------------------------------
function manejarEliminarComunicado(id) {
    const com = buscarPorId(COLECCION_COMUNICADOS, id);
    if (!com) return;
    
    if (window.confirm(`¿Seguro que deseas eliminar el comunicado: "${com.titulo}"?`)) {
        eliminarElemento(COLECCION_COMUNICADOS, id);
        actualizarVistaComunicados();
    }
}

// ------------------------------------------------------------
// 7. Ver Detalles (Simulación)
// ------------------------------------------------------------
function manejarVerComunicado(id) {
    const com = buscarPorId(COLECCION_COMUNICADOS, id);
    if (!com) return;
    
    alert(`📢 DETALLES DEL COMUNICADO 📢\n\nTítulo: ${com.titulo}\nFecha: ${com.fecha}\nPúblico Meta: ${com.dirigido}\nEstado: ${com.estado}`);
}

// ------------------------------------------------------------
// 8. Clics en la Tabla (Delegación corregida para enlaces)
// ------------------------------------------------------------
function manejarClicEnTablaComunicados(evento) {
    const boton = evento.target.closest("[data-accion]");
    if (!boton) return;

    evento.preventDefault(); // Evitar el salto de página del href="#"

    const id = boton.dataset.id;
    const accion = boton.dataset.accion;

    if (accion === "eliminar") {
        manejarEliminarComunicado(id);
    } else if (accion === "editar") {
        cargarComunicadoEnFormulario(id);
    } else if (accion === "ver") {
        manejarVerComunicado(id);
    }
}

// ------------------------------------------------------------
// 9. Inicialización
// ------------------------------------------------------------
function iniciarModuloComunicados() {
    inicializarDatosComunicados();
    actualizarVistaComunicados();

    const tbody = document.getElementById("cuerpoTablaComunicados");
    if (tbody) {
        tbody.addEventListener("click", manejarClicEnTablaComunicados);
    }

    const form = document.getElementById("formComunicado");
    if (form) {
        form.addEventListener("submit", manejarEnvioFormularioComunicado);
    }

    const btnAgregar = document.getElementById("btnAgregarComunicado");
    if (btnAgregar) {
        btnAgregar.addEventListener("click", () => {
            limpiarFormularioComunicado();
            document.getElementById("contenedorFormularioComunicado").style.display = "block";
        });
    }

    const btnCancelar = document.getElementById("btnCancelarComunicado");
    if (btnCancelar) {
        btnCancelar.addEventListener("click", limpiarFormularioComunicado);
    }
}

document.addEventListener("DOMContentLoaded", iniciarModuloComunicados);