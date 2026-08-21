// ============================================================
// egresados.js - Módulo Gestión de Egresados
// ============================================================

const NOMBRE_COLECCION = "egresados";
const FILAS_POR_PAGINA = 6;
let paginaActual = 1;

function esModoAdministrador() {
    if (typeof obtenerUsuarioActual === "function") {
        return obtenerUsuarioActual().esAdmin;
    }
    return document.body.dataset.modo === "admin";
}

function crearFilaHTML(egresado) {
    const claseEstado = egresado.estado === "Activo" ? "activo" : "inactivo";

    let filaHTML =
        '<td><img src="' + (egresado.foto || 'imagenes/avatar_defecto.png') + '" alt="foto de perfil de ' + egresado.nombre + '"></td>' +
        '<td>' + egresado.nombre + '</td>' +
        '<td>' + egresado.carrera + '</td>' +
        '<td>' + (egresado.anioGraduacion || egresado.anio || '') + '</td>' +
        '<td><span class="estado-' + (egresado.estado || 'Activo').toLowerCase() + '">' + egresado.estado + '</span></td>';

    if (esModoAdministrador()) {
        filaHTML +=
            '<td>' +
            '<div class="acciones-tabla">' +
            '<button type="button" class="btn-accion view" data-accion="ver" data-id="' + egresado.id + '" title="Ver"><i class="fa-solid fa-eye"></i></button>' +
            '<button type="button" class="btn-accion edit" data-accion="editar" data-id="' + egresado.id + '" title="Editar"><i class="fa-solid fa-pencil"></i></button>' +
            '<button type="button" class="btn-accion delete" data-accion="eliminar" data-id="' + egresado.id + '" title="Eliminar"><i class="fa-solid fa-trash"></i></button>' +
            '</div>' +
            '</td>';
    }

    return '<tr data-id="' + egresado.id + '">' + filaHTML + '</tr>';
}

function renderizarTabla(listaEgresados) {
    const cuerpoTabla = document.getElementById("cuerpoTablaEgresados");
    if (!cuerpoTabla) return;

    if (listaEgresados.length === 0) {
        const columnas = esModoAdministrador() ? 6 : 5;
        cuerpoTabla.innerHTML = '<tr><td colspan="' + columnas + '" style="text-align:center; padding:20px;">No se encontraron egresados.</td></tr>';
        return;
    }

    cuerpoTabla.innerHTML = listaEgresados.map(crearFilaHTML).join("");
}

function cargarOpcionesCarreras() {
    const selectCarrera = document.getElementById("filtroCarrera");
    if (!selectCarrera) return;

    const listaEgresados = obtenerColeccion(NOMBRE_COLECCION);
    const carrerasUnicas = [];

    listaEgresados.forEach(function (e) {
        if (e.carrera && !carrerasUnicas.includes(e.carrera)) {
            carrerasUnicas.push(e.carrera);
        }
    });

    carrerasUnicas.sort();

    let opciones = '<option value="">Todas las carreras</option>';
    carrerasUnicas.forEach(function (carrera) {
        opciones += '<option value="' + carrera + '">' + carrera + '</option>';
    });

    selectCarrera.innerHTML = opciones;
}

function actualizarVista() {
    const listaCompleta = obtenerColeccion(NOMBRE_COLECCION);

    const campoBusqueda = document.getElementById("buscar");
    const selectCarrera = document.getElementById("filtroCarrera");
    const selectEstado = document.getElementById("filtroEstado");

    const textoBusqueda = campoBusqueda ? campoBusqueda.value.trim().toLowerCase() : "";
    const carreraSeleccionada = selectCarrera ? selectCarrera.value : "";
    const estadoSeleccionado = selectEstado ? selectEstado.value : "";

    const listaFiltrada = listaCompleta.filter(function (egresado) {
        const coincideNombre = !textoBusqueda || egresado.nombre.toLowerCase().includes(textoBusqueda);
        const coincideCarrera = !carreraSeleccionada || egresado.carrera === carreraSeleccionada;
        const coincideEstado = !estadoSeleccionado || egresado.estado === estadoSeleccionado;

        return coincideNombre && coincideCarrera && coincideEstado;
    });

    const totalPaginas = Math.max(1, Math.ceil(listaFiltrada.length / FILAS_POR_PAGINA));

    if (paginaActual > totalPaginas) paginaActual = totalPaginas;
    if (paginaActual < 1) paginaActual = 1;

    const indiceInicio = (paginaActual - 1) * FILAS_POR_PAGINA;
    const listaDeLaPagina = listaFiltrada.slice(indiceInicio, indiceInicio + FILAS_POR_PAGINA);

    renderizarTabla(listaDeLaPagina);
    renderizarPaginacion(totalPaginas);
}

function renderizarPaginacion(totalPaginas) {
    const contenedor = document.getElementById("paginacionEgresados");
    if (!contenedor) return;

    let botonesHTML = "";
    const anteriorDeshabilitado = paginaActual === 1 ? "disabled" : "";
    botonesHTML += '<button type="button" data-pagina="anterior" ' + anteriorDeshabilitado + '>« Anterior</button>';

    for (let numero = 1; numero <= totalPaginas; numero++) {
        const claseActiva = numero === paginaActual ? "pagina-activa" : "";
        botonesHTML += '<button type="button" class="' + claseActiva + '" data-pagina="' + numero + '">' + numero + '</button>';
    }

    const siguienteDeshabilitado = paginaActual === totalPaginas ? "disabled" : "";
    botonesHTML += '<button type="button" data-pagina="siguiente" ' + siguienteDeshabilitado + '>Siguiente »</button>';

    contenedor.innerHTML = botonesHTML;
}

function manejarClicPaginacion(evento) {
    const boton = evento.target.closest("button[data-pagina]");
    if (!boton || boton.disabled) return;

    const valor = boton.dataset.pagina;
    if (valor === "anterior") paginaActual--;
    else if (valor === "siguiente") paginaActual++;
    else paginaActual = Number(valor);

    actualizarVista();
}

// ------------------------------------------------------------
// Gestión del Modal y Formulario
// ------------------------------------------------------------
function abrirModal() {
    const modal = document.getElementById("modalEgresado");
    if (modal) modal.style.display = "flex";
}

function cerrarModal() {
    const modal = document.getElementById("modalEgresado");
    if (modal) modal.style.display = "none";
    limpiarFormularioEgresado();
}

function obtenerRegistroPorId(id) {
    const numId = Number(id);
    return buscarPorId(NOMBRE_COLECCION, id) || buscarPorId(NOMBRE_COLECCION, numId);
}

function cargarEgresadoEnFormulario(id) {
    const egresado = obtenerRegistroPorId(id);
    if (!egresado) return;

    document.getElementById("idEgresadoEditando").value = egresado.id;
    document.getElementById("nombre").value = egresado.nombre;
    document.getElementById("carrera").value = egresado.carrera;
    document.getElementById("anio").value = egresado.anioGraduacion || egresado.anio || "";

    const radioEstado = document.querySelector('input[name="estado"][value="' + egresado.estado + '"]');
    if (radioEstado) radioEstado.checked = true;

    const titulo = document.querySelector("#formEgresado h3");
    if (titulo) titulo.textContent = "Editar Egresado";

    abrirModal();
}

function limpiarFormularioEgresado() {
    const form = document.getElementById("formEgresado");
    if (form) form.reset();
    const idEdit = document.getElementById("idEgresadoEditando");
    if (idEdit) idEdit.value = "";
    const titulo = document.querySelector("#formEgresado h3");
    if (titulo) titulo.textContent = "Nuevo Egresado";
    mostrarErroresEgresado({});
}

function validarDatosEgresado(datos) {
    const errores = {};
    if (!datos.nombre || datos.nombre.trim().length < 2) errores.nombre = "El nombre debe tener al menos 2 caracteres.";
    if (!datos.carrera || datos.carrera.trim().length < 2) errores.carrera = "Escribe el nombre de la carrera.";

    const anioNumero = Number(datos.anioGraduacion);
    const anioActual = new Date().getFullYear();
    if (!datos.anioGraduacion || isNaN(anioNumero)) {
        errores.anio = "El año debe ser un número.";
    } else if (anioNumero < 1960 || anioNumero > anioActual + 1) {
        errores.anio = "Año inválido.";
    }

    return { valido: Object.keys(errores).length === 0, errores: errores };
}

function mostrarErroresEgresado(errores) {
    ["nombre", "carrera", "anio"].forEach(function (campo) {
        const elementoError = document.getElementById("error-" + campo);
        if (!elementoError) return;
        if (errores[campo]) {
            elementoError.textContent = errores[campo];
            elementoError.style.display = "block";
        } else {
            elementoError.textContent = "";
            elementoError.style.display = "none";
        }
    });
}

function manejarEnvioFormularioEgresado(evento) {
    evento.preventDefault();

    const datos = {
        nombre: document.getElementById("nombre").value.trim(),
        carrera: document.getElementById("carrera").value.trim(),
        anioGraduacion: document.getElementById("anio").value.trim(),
        estado: document.querySelector('input[name="estado"]:checked')?.value || "Activo"
    };

    const resultado = validarDatosEgresado(datos);
    mostrarErroresEgresado(resultado.errores);

    if (!resultado.valido) return;

    datos.anioGraduacion = Number(datos.anioGraduacion);
    const idEnEdicion = document.getElementById("idEgresadoEditando").value;

    if (idEnEdicion) {
        actualizarElemento(NOMBRE_COLECCION, Number(idEnEdicion) || idEnEdicion, datos);
    } else {
        datos.foto = "imagenes/avatar_defecto.png";
        agregarElemento(NOMBRE_COLECCION, datos);
    }

    cerrarModal();
    cargarOpcionesCarreras();
    actualizarVista();
}

function manejarEliminarEgresado(id) {
    const egresado = obtenerRegistroPorId(id);
    if (!egresado) return;
    if (window.confirm('¿Deseas eliminar a "' + egresado.nombre + '"?')) {
        eliminarElemento(NOMBRE_COLECCION, egresado.id);
        cargarOpcionesCarreras();
        actualizarVista();
    }
}

// ------------------------------------------------------------
// Carga CSV (Modo Admin)
// ------------------------------------------------------------
function manejarCargaCSV(evento) {
    const archivo = evento.target.files[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = function (e) {
        procesarYGuardarCSV(e.target.result);
        evento.target.value = "";
    };
    lector.readAsText(archivo);
}

function procesarYGuardarCSV(contenidoTexto) {
    const filas = contenidoTexto.split(/\r?\n/).filter(f => f.trim() !== "");
    if (filas.length < 2) return window.alert("Archivo sin datos válidos.");

    const encabezados = filas[0].split(",").map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));
    let contadorImportados = 0;

    for (let i = 1; i < filas.length; i++) {
        const valores = filas[i].split(",").map(v => v.trim().replace(/^"|"$/g, ''));
        if (valores.length < 2) continue;

        const nuevoEgresado = {
            foto: "imagenes/avatar_defecto.png",
            nombre: "",
            carrera: "",
            anioGraduacion: new Date().getFullYear(),
            estado: "Activo"
        };

        encabezados.forEach((col, idx) => {
            const val = valores[idx] || "";
            if (col.includes("nombre")) nuevoEgresado.nombre = val;
            else if (col.includes("carrera")) nuevoEgresado.carrera = val;
            else if (col.includes("año") || col.includes("anio")) nuevoEgresado.anioGraduacion = Number(val) || new Date().getFullYear();
            else if (col.includes("estado")) nuevoEgresado.estado = val.toLowerCase() === "inactivo" ? "Inactivo" : "Activo";
        });

        if (nuevoEgresado.nombre.trim().length >= 2) {
            agregarElemento(NOMBRE_COLECCION, nuevoEgresado);
            contadorImportados++;
        }
    }

    if (contadorImportados > 0) {
        paginaActual = 1;
        cargarOpcionesCarreras();
        actualizarVista();
        window.alert("Se importaron " + contadorImportados + " egresados exitosamente.");
    }
}

function manejarClicEnTabla(evento) {
    const boton = evento.target.closest("button[data-accion]");
    if (!boton) return;

    const id = boton.dataset.id;
    const accion = boton.dataset.accion;

    if (accion === "editar") cargarEgresadoEnFormulario(id);
    else if (accion === "eliminar") manejarEliminarEgresado(id);
    else if (accion === "ver") {
        const egresado = obtenerRegistroPorId(id);
        if (egresado) {
            alert(
                "Egresado: " + egresado.nombre +
                "\nCarrera: " + egresado.carrera +
                "\nAño: " + (egresado.anioGraduacion || egresado.anio) +
                "\nEstado: " + egresado.estado
            );
        }
    }
}

// ------------------------------------------------------------
// Inicialización
// ------------------------------------------------------------
function iniciarModuloEgresados() {
    cargarOpcionesCarreras();
    actualizarVista();

    const campoBusqueda = document.getElementById("buscar");
    const selectCarrera = document.getElementById("filtroCarrera");
    const selectEstado = document.getElementById("filtroEstado");

    [campoBusqueda, selectCarrera, selectEstado].forEach(function (elemento) {
        if (elemento) {
            elemento.addEventListener("change", function () {
                paginaActual = 1;
                actualizarVista();
            });
            if (elemento === campoBusqueda) {
                elemento.addEventListener("input", function () {
                    paginaActual = 1;
                    actualizarVista();
                });
            }
        }
    });

    const contenedorPaginacion = document.getElementById("paginacionEgresados");
    if (contenedorPaginacion) {
        contenedorPaginacion.addEventListener("click", manejarClicPaginacion);
    }

    if (!esModoAdministrador()) return;

    const botonAgregar = document.getElementById("btnNuevoEgresado") || document.getElementById("btnAgregar");
    const formulario = document.getElementById("formEgresado");
    const botonCerrar = document.getElementById("btnCerrarModal");
    const tabla = document.querySelector("table");
    const inputCSV = document.getElementById("inputCSV");

    if (botonAgregar) {
        botonAgregar.addEventListener("click", function () {
            limpiarFormularioEgresado();
            abrirModal();
        });
    }

    if (botonCerrar) {
        botonCerrar.addEventListener("click", cerrarModal);
    }

    if (formulario) formulario.addEventListener("submit", manejarEnvioFormularioEgresado);
    if (tabla) tabla.addEventListener("click", manejarClicEnTabla);
    if (inputCSV) inputCSV.addEventListener("change", manejarCargaCSV);
}

document.addEventListener("DOMContentLoaded", iniciarModuloEgresados);