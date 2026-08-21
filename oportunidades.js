// ============================================================
// oportunidades.js
// Lógica del módulo "Gestión de Oportunidades Laborales".
// Depende de datos.js (debe cargarse ANTES que este archivo).
// ============================================================

const COLECCION_OPORTUNIDADES = "oportunidades";

// ------------------------------------------------------------
// 0. Inyectar datos de prueba si está vacío
// ------------------------------------------------------------
function inicializarDatosOportunidades() {
    const listaActual = obtenerColeccion(COLECCION_OPORTUNIDADES);
    
    if (listaActual.length === 0) {
        const datosBase = [
            { empresa: "TechCorp", puesto: "Desarrollador Frontend", modalidad: "Remoto", ubicacion: "San José", vencimiento: "30/06/2026", estado: "Activa" },
            { empresa: "Innova IT", puesto: "Ingeniero de Datos", modalidad: "Híbrido", ubicacion: "Heredia", vencimiento: "15/07/2026", estado: "Inactiva" },
            { empresa: "Global Solutions", puesto: "Diseñador UX/UI", modalidad: "Presencial", ubicacion: "Cartago", vencimiento: "20/06/2026", estado: "Activa" }
        ];
        
        datosBase.forEach(op => agregarElemento(COLECCION_OPORTUNIDADES, op));
    }
}

// ------------------------------------------------------------
// 1. Construir HTML de una Fila (Corregido para diseño original)
// ------------------------------------------------------------
function crearFilaOportunidadHTML(oportunidad) {
    const claseEstado = oportunidad.estado === "Activa" ? "activo" : "inactivo";

    return `
        <tr>
            <td>${oportunidad.empresa}</td>
            <td>${oportunidad.puesto}</td>
            <td>${oportunidad.modalidad}</td>
            <td>${oportunidad.ubicacion}</td>
            <td>${oportunidad.vencimiento}</td>
            <td><span class="${claseEstado}">${oportunidad.estado}</span></td>
            <td>
                <div class="acciones-tabla">
                    <a href="#" class="view" data-accion="ver" data-id="${oportunidad.id}" title="Ver Detalles">
                        <i class="fa-solid fa-eye"></i>
                    </a>
                    <a href="#" class="edit" data-accion="editar" data-id="${oportunidad.id}" title="Editar">
                        <i class="fa-solid fa-pencil"></i>
                    </a>
                    <a href="#" class="delete" data-accion="eliminar" data-id="${oportunidad.id}" title="Eliminar">
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
function actualizarVistaOportunidades() {
    const tbody = document.getElementById("cuerpoTablaOportunidades");
    if (!tbody) return;

    const listaOportunidades = obtenerColeccion(COLECCION_OPORTUNIDADES);

    if (listaOportunidades.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No hay oportunidades laborales registradas.</td></tr>';
        return;
    }

    tbody.innerHTML = listaOportunidades.map(crearFilaOportunidadHTML).join("");
}

// ------------------------------------------------------------
// 3. Formulario: Cargar para Editar
// ------------------------------------------------------------
function cargarOportunidadEnFormulario(id) {
    const op = buscarPorId(COLECCION_OPORTUNIDADES, id);
    if (!op) return;

    document.getElementById("idOportunidadEditando").value = op.id;
    document.getElementById("empresaOportunidad").value = op.empresa;
    document.getElementById("puestoOportunidad").value = op.puesto;
    document.getElementById("modalidadOportunidad").value = op.modalidad;
    document.getElementById("ubicacionOportunidad").value = op.ubicacion;
    document.getElementById("vencimientoOportunidad").value = op.vencimiento;
    document.getElementById("estadoOportunidad").value = op.estado || "Activa";

    document.getElementById("tituloFormulario").textContent = "Editar Oportunidad Laboral";
    document.getElementById("contenedorFormularioOportunidad").style.display = "block";
    document.getElementById("contenedorFormularioOportunidad").scrollIntoView({ behavior: 'smooth' });
}

// ------------------------------------------------------------
// 4. Formulario: Limpiar
// ------------------------------------------------------------
function limpiarFormularioOportunidad() {
    document.getElementById("formOportunidad").reset();
    document.getElementById("idOportunidadEditando").value = "";
    document.getElementById("tituloFormulario").textContent = "Nueva Oportunidad Laboral";
    document.getElementById("contenedorFormularioOportunidad").style.display = "none";
}

// ------------------------------------------------------------
// 5. Formulario: Guardar (Crear / Editar)
// ------------------------------------------------------------
function manejarEnvioFormularioOportunidad(evento) {
    evento.preventDefault();

    const datos = {
        empresa: document.getElementById("empresaOportunidad").value.trim(),
        puesto: document.getElementById("puestoOportunidad").value.trim(),
        modalidad: document.getElementById("modalidadOportunidad").value,
        ubicacion: document.getElementById("ubicacionOportunidad").value.trim(),
        vencimiento: document.getElementById("vencimientoOportunidad").value.trim(),
        estado: document.getElementById("estadoOportunidad").value
    };

    const idEnEdicion = document.getElementById("idOportunidadEditando").value;

    if (idEnEdicion) {
        actualizarElemento(COLECCION_OPORTUNIDADES, idEnEdicion, datos);
    } else {
        agregarElemento(COLECCION_OPORTUNIDADES, datos);
    }

    limpiarFormularioOportunidad();
    actualizarVistaOportunidades();
}

// ------------------------------------------------------------
// 6. Eliminar
// ------------------------------------------------------------
function manejarEliminarOportunidad(id) {
    const op = buscarPorId(COLECCION_OPORTUNIDADES, id);
    if (!op) return;
    
    if (window.confirm(`¿Seguro que deseas eliminar el puesto de "${op.puesto}" en ${op.empresa}?`)) {
        eliminarElemento(COLECCION_OPORTUNIDADES, id);
        actualizarVistaOportunidades();
    }
}

// ------------------------------------------------------------
// 7. Ver Detalles (Simulación)
// ------------------------------------------------------------
function manejarVerOportunidad(id) {
    const op = buscarPorId(COLECCION_OPORTUNIDADES, id);
    if (!op) return;
    
    alert(`🏢 DETALLES DE OPORTUNIDAD 🏢\n\nEmpresa: ${op.empresa}\nPuesto: ${op.puesto}\nModalidad: ${op.modalidad}\nUbicación: ${op.ubicacion}\nVence: ${op.vencimiento}\nEstado: ${op.estado}`);
}

// ------------------------------------------------------------
// 8. Clics en la Tabla (Delegación corregida para enlaces)
// ------------------------------------------------------------
function manejarClicEnTablaOportunidades(evento) {
    const boton = evento.target.closest("[data-accion]");
    if (!boton) return;

    evento.preventDefault(); // Evitar el salto de página del href="#"

    const id = boton.dataset.id;
    const accion = boton.dataset.accion;

    if (accion === "eliminar") {
        manejarEliminarOportunidad(id);
    } else if (accion === "editar") {
        cargarOportunidadEnFormulario(id);
    } else if (accion === "ver") {
        manejarVerOportunidad(id);
    }
}

// ------------------------------------------------------------
// 9. Inicialización
// ------------------------------------------------------------
function iniciarModuloOportunidades() {
    inicializarDatosOportunidades();
    actualizarVistaOportunidades();

    const tbody = document.getElementById("cuerpoTablaOportunidades");
    if (tbody) {
        tbody.addEventListener("click", manejarClicEnTablaOportunidades);
    }

    const form = document.getElementById("formOportunidad");
    if (form) {
        form.addEventListener("submit", manejarEnvioFormularioOportunidad);
    }

    const btnAgregar = document.getElementById("btnAgregarOportunidad");
    if (btnAgregar) {
        btnAgregar.addEventListener("click", () => {
            limpiarFormularioOportunidad();
            document.getElementById("contenedorFormularioOportunidad").style.display = "block";
        });
    }

    const btnCancelar = document.getElementById("btnCancelarOportunidad");
    if (btnCancelar) {
        btnCancelar.addEventListener("click", limpiarFormularioOportunidad);
    }
}

document.addEventListener("DOMContentLoaded", iniciarModuloOportunidades);