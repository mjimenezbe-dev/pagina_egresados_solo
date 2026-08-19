// ============================================================
// egresados.js
// Lógica del módulo "Gestión de Egresados".
// Se usa en DOS páginas distintas:
//   - gestion_egresados.html          (administrador: puede
//     agregar, editar y eliminar)
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

    // Construimos el HTML de todas las filas y lo insertamos de una vez
    // (más eficiente que insertar fila por fila).
    const filasHTML = listaEgresados.map(crearFilaHTML).join("");
    cuerpoTabla.innerHTML = filasHTML;
}


// ------------------------------------------------------------
// 4. Volver a leer los datos de Local Storage y redibujar la
//    tabla, aplicando el texto de búsqueda si hay alguno escrito.
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

    renderizarTabla(listaFiltrada);
}


// ============================================================
// A partir de aquí, funciones que SOLO se usan en modo admin
// (validar formulario, agregar, editar, eliminar).
// ============================================================

// ------------------------------------------------------------
// 5. Validar los datos del formulario antes de guardarlos.
//    Devuelve un objeto con "valido" (true/false) y un objeto
//    "errores" con el mensaje de cada campo que falló.
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
// 6. Mostrar los mensajes de error debajo de cada campo, y
//    limpiar los mensajes de los campos que sí son válidos.
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
// 7. Poner el formulario en "modo edición": lo llena con los
//    datos del egresado seleccionado y guarda su id en un campo
//    oculto, para saber que al guardar debemos ACTUALIZAR y no
//    crear un egresado nuevo.
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
// 8. Vaciar el formulario y devolverlo a su estado de "Nuevo
//    Egresado" (sin ningún id de edición pendiente).
// ------------------------------------------------------------
function limpiarFormularioEgresado() {
    document.getElementById("formEgresado").reset();
    document.getElementById("idEgresadoEditando").value = "";
    document.querySelector("#formEgresado h3").textContent = "Nuevo Egresado";
    mostrarErroresEgresado({});
}


// ------------------------------------------------------------
// 9. Se ejecuta al enviar el formulario: valida los datos y,
//    según haya o no un id de edición, actualiza o crea un
//    egresado nuevo.
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
        return; // No seguimos: hay campos inválidos.
    }

    // Convertimos el año a número antes de guardarlo.
    datos.anioGraduacion = Number(datos.anioGraduacion);

    const idEnEdicion = document.getElementById("idEgresadoEditando").value;

    if (idEnEdicion) {
        // Ya existe un egresado con ese id: lo actualizamos.
        actualizarElemento(NOMBRE_COLECCION, idEnEdicion, datos);
    } else {
        // No hay id: es un egresado nuevo. Le damos una foto por
        // defecto, ya que el formulario no pide subir una imagen.
        datos.foto = "foto_perfil/default.jpg";
        agregarElemento(NOMBRE_COLECCION, datos);
    }

    limpiarFormularioEgresado();
    document.getElementById("formEgresado").style.display = "none";
    actualizarVista();
}


// ------------------------------------------------------------
// 10. Eliminar un egresado, pidiendo confirmación antes (para
//     evitar borrados accidentales).
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
// 11. Un solo "escuchador" de clics para toda la tabla (en vez
//     de uno por cada botón). Revisa qué botón se presionó según
//     su atributo data-accion.
// ------------------------------------------------------------
function manejarClicEnTabla(evento) {
    const boton = evento.target.closest("button[data-accion]");
    if (!boton) {
        return; // El clic no fue sobre un botón de acción.
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
// 12. Arranque del módulo: conecta los eventos según el modo
//     (admin o user) y dibuja la tabla por primera vez.
// ============================================================
function iniciarModuloEgresados() {
    // La tabla se dibuja siempre, sin importar el rol.
    actualizarVista();

    // La búsqueda funciona en ambos modos.
    const campoBusqueda = document.getElementById("buscar");
    if (campoBusqueda) {
        campoBusqueda.addEventListener("input", actualizarVista);
    }

    // Lo siguiente solo aplica si estamos en modo administrador.
    if (!esModoAdministrador()) {
        return;
    }

    const botonAgregar = document.getElementById("btnAgregar");
    const formulario = document.getElementById("formEgresado");
    const tabla = document.querySelector("table");

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
}

document.addEventListener("DOMContentLoaded", iniciarModuloEgresados);
