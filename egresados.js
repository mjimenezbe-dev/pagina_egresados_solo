// ============================================================
// egresados.js
// Lógica del módulo "Gestión de Egresados".
// Se usa en DOS páginas distintas:
//   - gestion_egresados.html          (administrador: puede
//     agregar, editar, eliminar e importar CSV)
//   - gestion_egresadors_usuario.html (usuario: solo puede ver
//     la lista, sin botones de acción)
//
// Cómo sabe este archivo en qué modo está: leyendo el atributo
// data-modo="admin" o data-modo="user" que se le puso al <body>
// de cada página en el HTML.
//
// Depende de datos.js (debe cargarse ANTES que este archivo).
// ============================================================

const NOMBRE_COLECCION = "egresados";

// Cuántas filas se muestran por página, y en qué página estamos parados.
const FILAS_POR_PAGINA = 6;
let paginaActual = 1;


// ------------------------------------------------------------
// 1. Averiguar en qué modo estamos (admin o user).
// ------------------------------------------------------------
function esModoAdministrador() {
    return document.body.dataset.modo === "admin";
}


// ------------------------------------------------------------
// 2. Construir el HTML de una fila de la tabla para un egresado.
//    Si es administrador, incluye los botones de acción; si es
//    usuario, la fila queda sin esa columna.
// ------------------------------------------------------------
function crearFilaHTML(egresado) {
    const claseEstado = egresado.estado === "Activo" ? "activo" : "inactivo";

    // Estas columnas se muestran siempre, sin importar el rol.
    let filaHTML =
        '<td><img src="' + egresado.foto + '" alt="foto de perfil de ' + egresado.nombre + '"></td>' +
        '<td>' + egresado.nombre + '</td>' +
        '<td>' + egresado.carrera + '</td>' +
        '<td>' + egresado.anioGraduacion + '</td>' +
        '<td><span class="' + claseEstado + '">' + egresado.estado + '</span></td>';

    // La columna de acciones solo se agrega si es administrador.
    if (esModoAdministrador()) {
        filaHTML +=
            '<td>' +
            '<div class="acciones-tabla">' +
            '<button type="button" class="view" data-accion="ver" data-id="' + egresado.id + '"><i class="fa-solid fa-eye"></i></button>' +
            '<button type="button" class="edit" data-accion="editar" data-id="' + egresado.id + '"><i class="fa-solid fa-pencil"></i></button>' +
            '<button type="button" class="delete" data-accion="eliminar" data-id="' + egresado.id + '"><i class="fa-solid fa-trash"></i></button>' +
            '</div>' +
            '</td>';
    }

    return '<tr data-id="' + egresado.id + '">' + filaHTML + '</tr>';
}


// ------------------------------------------------------------
// 3. Dibujar la tabla completa a partir de una lista de egresados.
// ------------------------------------------------------------
function renderizarTabla(listaEgresados) {
    const cuerpoTabla = document.getElementById("cuerpoTablaEgresados");
    if (!cuerpoTabla) {
        return; // Esta página no tiene la tabla (por seguridad).
    }

    // Si no hay egresados que mostrar, mostramos un mensaje en vez
    // de dejar la tabla vacía sin explicación.
    if (listaEgresados.length === 0) {
        const columnas = esModoAdministrador() ? 6 : 5;
        cuerpoTabla.innerHTML = '<tr><td colspan="' + columnas + '" style="text-align:center;">No se encontraron egresados.</td></tr>';
        return;
    }

    // Construimos el HTML de todas las filas y lo insertamos de una vez.
    const filasHTML = listaEgresados.map(crearFilaHTML).join("");
    cuerpoTabla.innerHTML = filasHTML;
}


// ------------------------------------------------------------
// 4. Volver a leer los datos de Local Storage, aplicar el texto
//    de búsqueda si hay alguno, recortar solo las 6 filas que le
//    tocan a la página actual, y redibujar tabla + paginación.
// ------------------------------------------------------------
function actualizarVista() {
    const listaCompleta = obtenerColeccion(NOMBRE_COLECCION);
    const campoBusqueda = document.getElementById("buscar");
    const textoBusqueda = campoBusqueda ? campoBusqueda.value.trim().toLowerCase() : "";

    const listaFiltrada = textoBusqueda
        ? listaCompleta.filter(function (egresado) {
              return egresado.nombre.toLowerCase().includes(textoBusqueda);
          })
        : listaCompleta;

    const totalPaginas = Math.max(1, Math.ceil(listaFiltrada.length / FILAS_POR_PAGINA));

    if (paginaActual > totalPaginas) {
        paginaActual = totalPaginas;
    }
    if (paginaActual < 1) {
        paginaActual = 1;
    }

    const indiceInicio = (paginaActual - 1) * FILAS_POR_PAGINA;
    const indiceFin = indiceInicio + FILAS_POR_PAGINA;
    const listaDeLaPagina = listaFiltrada.slice(indiceInicio, indiceFin);

    renderizarTabla(listaDeLaPagina);
    renderizarPaginacion(totalPaginas);
}


// ------------------------------------------------------------
// 4.1 Construir y dibujar los botones de paginación.
// ------------------------------------------------------------
function renderizarPaginacion(totalPaginas) {
    const contenedor = document.getElementById("paginacionEgresados");
    if (!contenedor) {
        return;
    }

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


// ------------------------------------------------------------
// 4.2 Se ejecuta al hacer clic en cualquier botón de paginación.
// ------------------------------------------------------------
function manejarClicPaginacion(evento) {
    const boton = evento.target.closest("button[data-pagina]");
    if (!boton || boton.disabled) {
        return;
    }

    const valor = boton.dataset.pagina;

    if (valor === "anterior") {
        paginaActual = paginaActual - 1;
    } else if (valor === "siguiente") {
        paginaActual = paginaActual + 1;
    } else {
        paginaActual = Number(valor);
    }

    actualizarVista();
}


// ============================================================
// A partir de aquí, funciones que SOLO se usan en modo admin
// (validar formulario, agregar, editar, eliminar e importar CSV).
// ============================================================

// ------------------------------------------------------------
// 5. Validar los datos del formulario antes de guardarlos.
// ------------------------------------------------------------
function validarDatosEgresado(datos) {
    const errores = {};

    if (!datos.nombre || datos.nombre.trim().length < 2) {
        errores.nombre = "El nombre debe tener al menos 2 caracteres.";
    }

    if (!datos.carrera || datos.carrera.trim().length < 2) {
        errores.carrera = "Escribe el nombre de la carrera.";
    }

    const anioNumero = Number(datos.anioGraduacion);
    const anioActual = new Date().getFullYear();
    if (!datos.anioGraduacion || isNaN(anioNumero)) {
        errores.anio = "El año de graduación debe ser un número.";
    } else if (anioNumero < 1960 || anioNumero > anioActual + 1) {
        errores.anio = "Ingresa un año entre 1960 y " + (anioActual + 1) + ".";
    }

    return {
        valido: Object.keys(errores).length === 0,
        errores: errores
    };
}


// ------------------------------------------------------------
// 6. Mostrar los mensajes de error debajo de cada campo.
// ------------------------------------------------------------
function mostrarErroresEgresado(errores) {
    const campos = ["nombre", "carrera", "anio"];

    campos.forEach(function (campo) {
        const elementoError = document.getElementById("error-" + campo);
        if (!elementoError) {
            return;
        }
        if (errores[campo]) {
            elementoError.textContent = errores[campo];
            elementoError.classList.add("visible");
        } else {
            elementoError.textContent = "";
            elementoError.classList.remove("visible");
        }
    });
}


// ------------------------------------------------------------
// 7. Poner el formulario en "modo edición".
// ------------------------------------------------------------
function cargarEgresadoEnFormulario(id) {
    const egresado = buscarPorId(NOMBRE_COLECCION, id);
    if (!egresado) {
        return;
    }

    document.getElementById("idEgresadoEditando").value = egresado.id;
    document.getElementById("nombre").value = egresado.nombre;
    document.getElementById("carrera").value = egresado.carrera;
    document.getElementById("anio").value = egresado.anioGraduacion;

    const radioEstado = document.querySelector('input[name="estado"][value="' + egresado.estado + '"]');
    if (radioEstado) {
        radioEstado.checked = true;
    }

    document.querySelector("#formEgresado h3").textContent = "Editar Egresado";
    document.getElementById("formEgresado").style.display = "flex";
}


// ------------------------------------------------------------
// 8. Vaciar el formulario y devolverlo a "Nuevo Egresado".
// ------------------------------------------------------------
function limpiarFormularioEgresado() {
    document.getElementById("formEgresado").reset();
    document.getElementById("idEgresadoEditando").value = "";
    document.querySelector("#formEgresado h3").textContent = "Nuevo Egresado";
    mostrarErroresEgresado({});
}


// ------------------------------------------------------------
// 9. Se ejecuta al enviar el formulario (Crear / Actualizar).
// ------------------------------------------------------------
function manejarEnvioFormularioEgresado(evento) {
    evento.preventDefault();

    const datos = {
        nombre: document.getElementById("nombre").value.trim(),
        carrera: document.getElementById("carrera").value.trim(),
        anioGraduacion: document.getElementById("anio").value.trim(),
        estado: document.querySelector('input[name="estado"]:checked').value
    };

    const resultado = validarDatosEgresado(datos);
    mostrarErroresEgresado(resultado.errores);

    if (!resultado.valido) {
        return;
    }

    datos.anioGraduacion = Number(datos.anioGraduacion);
    const idEnEdicion = document.getElementById("idEgresadoEditando").value;

    if (idEnEdicion) {
        actualizarElemento(NOMBRE_COLECCION, idEnEdicion, datos);
    } else {
        datos.foto = "foto_perfil/default.jpg";
        agregarElemento(NOMBRE_COLECCION, datos);
    }

    limpiarFormularioEgresado();
    document.getElementById("formEgresado").style.display = "none";
    actualizarVista();
}


// ------------------------------------------------------------
// 10. Eliminar un egresado.
// ------------------------------------------------------------
function manejarEliminarEgresado(id) {
    const egresado = buscarPorId(NOMBRE_COLECCION, id);
    if (!egresado) {
        return;
    }
    const confirmado = window.confirm('¿Eliminar a "' + egresado.nombre + '" de la lista de egresados?');
    if (confirmado) {
        eliminarElemento(NOMBRE_COLECCION, id);
        actualizarVista();
    }
}


// ------------------------------------------------------------
// 11. Cargar y procesar archivo CSV.
// ------------------------------------------------------------
function manejarCargaCSV(evento) {
    const archivo = evento.target.files[0];
    if (!archivo) {
        return;
    }

    const lector = new FileReader();
    lector.onload = function (e) {
        const contenido = e.target.result;
        procesarYGuardarCSV(contenido);
        evento.target.value = ""; // Limpia el input para permitir volver a cargar el mismo archivo
    };
    lector.readAsText(archivo);
}

function procesarYGuardarCSV(contenidoTexto) {
    const filas = contenidoTexto.split(/\r?\n/).filter(function (fila) {
        return fila.trim() !== "";
    });

    if (filas.length < 2) {
        window.alert("El archivo CSV está vacío o no contiene datos válidos.");
        return;
    }

    // Extraer encabezados en minúsculas para compararlos fácilmente
    const encabezados = filas[0].split(",").map(function (h) {
        return h.trim().toLowerCase().replace(/^"|"$/g, '');
    });

    let contadorImportados = 0;

    for (let i = 1; i < filas.length; i++) {
        const valores = filas[i].split(",").map(function (v) {
            return v.trim().replace(/^"|"$/g, '');
        });

        if (valores.length < 2) continue;

        const nuevoEgresado = {
            foto: "foto_perfil/default.jpg",
            nombre: "",
            carrera: "",
            anioGraduacion: new Date().getFullYear(),
            estado: "Activo"
        };

        // Asignar campos mapeando según el nombre de la columna en el CSV
        encabezados.forEach(function (columna, indice) {
            const valor = valores[indice] || "";
            if (columna.includes("nombre")) {
                nuevoEgresado.nombre = valor;
            } else if (columna.includes("carrera")) {
                nuevoEgresado.carrera = valor;
            } else if (columna.includes("año") || columna.includes("anio") || columna.includes("graduacion")) {
                nuevoEgresado.anioGraduacion = Number(valor) || new Date().getFullYear();
            } else if (columna.includes("estado")) {
                nuevoEgresado.estado = valor.toLowerCase() === "inactivo" ? "Inactivo" : "Activo";
            }
        });

        // Guardar únicamente si posee un nombre válido
        if (nuevoEgresado.nombre.trim().length >= 2) {
            agregarElemento(NOMBRE_COLECCION, nuevoEgresado);
            contadorImportados++;
        }
    }

    if (contadorImportados > 0) {
        paginaActual = 1; // Volver a la primera página para mostrar los nuevos registros
        actualizarVista();
        window.alert("Se importaron " + contadorImportados + " egresados exitosamente.");
    } else {
        window.alert("No se pudo importar ningún egresado. Revisa las columnas del archivo CSV.");
    }
}


// ------------------------------------------------------------
// 12. Escuchador de clics para acciones dentro de la tabla.
// ------------------------------------------------------------
function manejarClicEnTabla(evento) {
    const boton = evento.target.closest("button[data-accion]");
    if (!boton) {
        return;
    }

    const id = boton.dataset.id;
    const accion = boton.dataset.accion;

    if (accion === "editar") {
        cargarEgresadoEnFormulario(id);
    } else if (accion === "eliminar") {
        manejarEliminarEgresado(id);
    } else if (accion === "ver") {
        const egresado = buscarPorId(NOMBRE_COLECCION, id);
        if (egresado) {
            window.alert(
                "Egresado: " + egresado.nombre +
                "\nCarrera: " + egresado.carrera +
                "\nAño de graduación: " + egresado.anioGraduacion +
                "\nEstado: " + egresado.estado
            );
        }
    }
}


// ============================================================
// 13. Arranque del módulo: conecta los eventos según el modo.
// ============================================================
function iniciarModuloEgresados() {
    actualizarVista();

    const campoBusqueda = document.getElementById("buscar");
    if (campoBusqueda) {
        campoBusqueda.addEventListener("input", function () {
            paginaActual = 1;
            actualizarVista();
        });
    }

    const contenedorPaginacion = document.getElementById("paginacionEgresados");
    if (contenedorPaginacion) {
        contenedorPaginacion.addEventListener("click", manejarClicPaginacion);
    }

    if (!esModoAdministrador()) {
        return;
    }

    const botonAgregar = document.getElementById("btnAgregar");
    const formulario = document.getElementById("formEgresado");
    const tabla = document.querySelector("table");
    const inputCSV = document.getElementById("inputCSV");

    if (botonAgregar && formulario) {
        botonAgregar.addEventListener("click", function () {
            const estaVisible = formulario.style.display === "flex";
            if (estaVisible) {
                formulario.style.display = "none";
            } else {
                limpiarFormularioEgresado();
                formulario.style.display = "flex";
            }
        });
    }

    if (formulario) {
        formulario.addEventListener("submit", manejarEnvioFormularioEgresado);
    }

    if (tabla) {
        tabla.addEventListener("click", manejarClicEnTabla);
    }

    if (inputCSV) {
        inputCSV.addEventListener("change", manejarCargaCSV);
    }
}

document.addEventListener("DOMContentLoaded", iniciarModuloEgresados);