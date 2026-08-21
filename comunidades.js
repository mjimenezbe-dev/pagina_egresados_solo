// ============================================================
// comunidades.js
// Lógica del módulo "Gestión de Comunidades".
// Depende de datos.js (debe cargarse ANTES que este archivo).
// ============================================================

const COLECCION_COMUNIDADES = "comunidades";

// ------------------------------------------------------------
// 0. Función para Forzar Limpieza e Inyección de datos correctos
// ------------------------------------------------------------
function inicializarDatosComunidades() {
    const comunidadesActuales = obtenerColeccion(COLECCION_COMUNIDADES);
    
    // Verificamos si los datos actuales de verdad tienen las categorías ("Técnico", "Bachillerato", etc.)
    const datosValidos = comunidadesActuales.some(c => c.tipoPrograma === "Técnico" || c.tipoPrograma === "Bachillerato");

    // Si la lista está vacía, O si los datos están atascados sin categorías, forzamos un reseteo
    if (comunidadesActuales.length === 0 || !datosValidos) {
        
        // Limpiamos la base de datos local para quitar la basura vieja
        localStorage.removeItem(COLECCION_COMUNIDADES);
        
        const comunidadesBase = [
            { nombre: "Ingeniería de Software", tipoPrograma: "Bachillerato" },
            { nombre: "Técnico en Desarrollo de Software", tipoPrograma: "Técnico" },
            { nombre: "Bachillerato en Tecnologías de la Información", tipoPrograma: "Bachillerato" },
            { nombre: "Técnico en Ciberseguridad", tipoPrograma: "Técnico" },
            { nombre: "Maestría en Gestión de Proyectos TI", tipoPrograma: "Maestría" }, // Agregamos Maestría
            { nombre: "Administración de Empresas", tipoPrograma: "Bachillerato" },
            { nombre: "Comunidad de Robótica", tipoPrograma: "General" }
        ];
        
        // Inyectamos los datos limpios
        comunidadesBase.forEach(comunidad => agregarElemento(COLECCION_COMUNIDADES, comunidad));
    }
}

// ------------------------------------------------------------
// 1. Construir el HTML de una TARJETA de comunidad
// ------------------------------------------------------------
function crearTarjetaComunidadHTML(comunidad) {
    const programa = comunidad.tipoPrograma || "General";

    return `
        <div class="comunidad" data-id="${comunidad.id}">
            <div class="circulo"></div>
            <h2>${comunidad.nombre}</h2>
            <p style="margin-bottom: 15px; color: #555; font-size: 0.9em; text-align: center;">Programa: ${programa}</p>
            
            <div class="acciones-tabla" style="display: flex; justify-content: center; gap: 10px;">
                <button type="button" class="edit" data-accion="editar" data-id="${comunidad.id}" title="Editar">
                    <i class="fa-solid fa-pencil"></i>
                </button>
                <button type="button" class="delete" data-accion="eliminar" data-id="${comunidad.id}" title="Eliminar">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

// ------------------------------------------------------------
// 2. Dibujar las tarjetas en el contenedor
// ------------------------------------------------------------
function renderizarComunidades(listaComunidades) {
    const contenedor = document.getElementById("contenedorComunidades");
    if (!contenedor) return;

    if (listaComunidades.length === 0) {
        contenedor.innerHTML = '<p style="text-align:center; width:100%;">No se encontraron comunidades para este filtro.</p>';
        return;
    }

    const tarjetasHTML = listaComunidades.map(crearTarjetaComunidadHTML).join("");
    contenedor.innerHTML = tarjetasHTML;
}

// ------------------------------------------------------------
// 3. Obtener datos, aplicar filtro y actualizar vista
// ------------------------------------------------------------
function actualizarVistaComunidades() {
    const listaCompleta = obtenerColeccion(COLECCION_COMUNIDADES);
    
    const filtroDropdown = document.getElementById("filtroTipoPrograma") || document.getElementById("tipoPrograma");
    const tipoFiltro = filtroDropdown ? filtroDropdown.value : "Todos";

    let listaFiltrada = listaCompleta;
    
    if (tipoFiltro !== "Todos") {
        listaFiltrada = listaCompleta.filter(c => {
            if (!c.tipoPrograma) return false;
            // Estandarizamos para que no importe si hay tildes o mayúsculas
            const tipoComunidad = c.tipoPrograma.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            const tipoBuscado = tipoFiltro.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            
            return tipoComunidad === tipoBuscado;
        });
    }

    renderizarComunidades(listaFiltrada);
}

// ------------------------------------------------------------
// 4. Formulario: Cargar datos para editar
// ------------------------------------------------------------
function cargarComunidadEnFormulario(id) {
    const comunidad = buscarPorId(COLECCION_COMUNIDADES, id);
    if (!comunidad) return;

    document.getElementById("idComunidadEditando").value = comunidad.id;
    document.getElementById("nombreComunidad").value = comunidad.nombre;
    document.getElementById("tipoComunidad").value = comunidad.tipoPrograma || "General";

    document.getElementById("tituloFormularioComunidad").textContent = "Editar Comunidad";
    document.getElementById("contenedorFormularioComunidad").style.display = "block";
    
    document.getElementById("contenedorFormularioComunidad").scrollIntoView({ behavior: 'smooth' });
}

// ------------------------------------------------------------
// 5. Formulario: Limpiar y ocultar
// ------------------------------------------------------------
function limpiarFormularioComunidad() {
    document.getElementById("formComunidad").reset();
    document.getElementById("idComunidadEditando").value = "";
    document.getElementById("tituloFormularioComunidad").textContent = "Nueva Comunidad";
    document.getElementById("contenedorFormularioComunidad").style.display = "none";
}

// ------------------------------------------------------------
// 6. Formulario: Guardar (Crear/Editar)
// ------------------------------------------------------------
function manejarEnvioFormularioComunidad(evento) {
    evento.preventDefault();

    const datos = {
        nombre: document.getElementById("nombreComunidad").value.trim(),
        tipoPrograma: document.getElementById("tipoComunidad").value.trim()
    };

    const idEnEdicion = document.getElementById("idComunidadEditando").value;

    if (idEnEdicion) {
        actualizarElemento(COLECCION_COMUNIDADES, idEnEdicion, datos);
    } else {
        agregarElemento(COLECCION_COMUNIDADES, datos);
    }

    limpiarFormularioComunidad();
    
    const filtroDropdown = document.getElementById("filtroTipoPrograma") || document.getElementById("tipoPrograma");
    if (filtroDropdown) filtroDropdown.value = "Todos";
    
    actualizarVistaComunidades();
}

// ------------------------------------------------------------
// 7. Eliminar con confirmación
// ------------------------------------------------------------
function manejarEliminarComunidad(id) {
    const comunidad = buscarPorId(COLECCION_COMUNIDADES, id);
    if (!comunidad) return;
    
    const confirmado = window.confirm(`¿Estás seguro de que deseas eliminar la comunidad "${comunidad.nombre}"?`);
    
    if (confirmado) {
        eliminarElemento(COLECCION_COMUNIDADES, id);
        actualizarVistaComunidades();
    }
}

// ------------------------------------------------------------
// 8. Clics en el contenedor (Delegación de eventos)
// ------------------------------------------------------------
function manejarClicEnContenedorComunidades(evento) {
    const boton = evento.target.closest("button[data-accion]");
    if (!boton) return;

    const id = boton.dataset.id;
    const accion = boton.dataset.accion;

    if (accion === "eliminar") {
        manejarEliminarComunidad(id);
    } else if (accion === "editar") {
        cargarComunidadEnFormulario(id);
    }
}

// ------------------------------------------------------------
// 9. Inicializar el módulo
// ------------------------------------------------------------
function iniciarModuloComunidades() {
    inicializarDatosComunidades(); 
    actualizarVistaComunidades();  
    
    const contenedor = document.getElementById("contenedorComunidades");
    if (contenedor) {
        contenedor.addEventListener("click", manejarClicEnContenedorComunidades);
    }

    const formulario = document.getElementById("formComunidad");
    if (formulario) {
        formulario.addEventListener("submit", manejarEnvioFormularioComunidad);
    }

    const btnAgregar = document.getElementById("btnAgregarComunidad");
    if (btnAgregar) {
        btnAgregar.addEventListener("click", function() {
            limpiarFormularioComunidad();
            document.getElementById("contenedorFormularioComunidad").style.display = "block";
        });
    }

    const btnCancelar = document.getElementById("btnCancelarComunidad");
    if (btnCancelar) {
        btnCancelar.addEventListener("click", limpiarFormularioComunidad);
    }

    const btnFiltrar = document.querySelector(".filtrar, #btnFiltrar");
    if (btnFiltrar) {
        btnFiltrar.addEventListener("click", actualizarVistaComunidades);
    }
}

document.addEventListener("DOMContentLoaded", iniciarModuloComunidades);