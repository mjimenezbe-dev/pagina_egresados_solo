// ============================================================
// datos.js
// Capa de datos del sistema. Aquí vive TODA la lógica de
// guardar, leer, actualizar y eliminar información usando
// Local Storage, además de los datos "semilla" con los que el
// sitio arranca la primera vez que alguien lo abre.
//
// Cada "colección" (egresados, carreras, escuelas, etc.) se
// guarda en Local Storage como un arreglo de objetos, convertido
// a texto con JSON.stringify() y recuperado con JSON.parse().
//
// Este archivo NO dibuja nada en pantalla: solo maneja datos.
// Cada página tiene su propio archivo (por ejemplo egresados.js)
// que usa estas funciones para mostrar la información en el DOM.
// ============================================================


// ------------------------------------------------------------
// 1. Nombres de las claves que usamos en Local Storage.
//    Tenerlos centralizados evita errores de tipeo al usarlos
//    en distintos archivos.
// ------------------------------------------------------------
const CLAVES_STORAGE = {
    egresados: "cenfotec_egresados",
    titulos: "cenfotec_titulos",
    carreras: "cenfotec_carreras",
    escuelas: "cenfotec_escuelas",
    actividades: "cenfotec_actividades",
    comunidades: "cenfotec_comunidades",
    mentorias: "cenfotec_mentorias",
    oportunidades: "cenfotec_oportunidades",
    comunicados: "cenfotec_comunicados",
    usuarios: "cenfotec_usuarios",
    sesion: "cenfotec_sesion_activa",
    inicializado: "cenfotec_inicializado"
};


// ------------------------------------------------------------
// 2. Datos semilla (los mismos que ya existían escritos a mano
//    en el HTML). Solo se usan la primera vez que se abre el
//    sitio en un navegador; después, todo se lee de Local Storage.
// ------------------------------------------------------------
const DATOS_SEMILLA = {
    usuarios: [
        { id: 1, email: "registro@cenfotec.ac.cr", clave: "123456", rol: "registro", nombre: "Personal de Registro" },
        { id: 2, email: "bienestar@cenfotec.ac.cr", clave: "123456", rol: "bienestar", nombre: "Personal Bienestar Estudiantil" },
        { id: 3, email: "egresado@cenfotec.ac.cr", clave: "123456", rol: "egresado", nombre: "Mateo (Egresado)" }
    ],
    egresados: [
        { id: 1, nombre: "Mateo", carrera: "Ingeniería de software", anioGraduacion: 2002, estado: "Activo", foto: "foto_perfil/images.jpg", correoPersonal: "mateo@gmail.com", telefono: "8888-1111", empresaActual: "Tech CR", puestoActual: "Desarrollador Lead", areaProfesional: "Ingeniería del Software", linkedIn: "https://linkedin.com", portafolio: "https://github.com" },
        { id: 2, nombre: "Martin", carrera: "Técnico en ciberseguridad", anioGraduacion: 2025, estado: "Inactivo", foto: "foto_perfil/images (1).jpg", correoPersonal: "martin@gmail.com", telefono: "8888-2222", empresaActual: "SecOps", puestoActual: "Analista SOC", areaProfesional: "Ciberseguridad", linkedIn: "", portafolio: "" },
        { id: 3, nombre: "Camila", carrera: "Maestría en IA", anioGraduacion: 2000, estado: "Activo", foto: "foto_perfil/images (3).jpg", correoPersonal: "camila@gmail.com", telefono: "8888-3333", empresaActual: "AI Labs", puestoActual: "Investigadora AI", areaProfesional: "Sistemas Inteligentes", linkedIn: "", portafolio: "" },
        { id: 4, nombre: "Sebastian", carrera: "Bachillerato en ciberseguridad", anioGraduacion: 2015, estado: "Inactivo", foto: "foto_perfil/images (2).jpg", correoPersonal: "sebastian@gmail.com", telefono: "8888-4444", empresaActual: "CyberNet", puestoActual: "Auditor TI", areaProfesional: "Ciberseguridad", linkedIn: "", portafolio: "" },
        { id: 5, nombre: "Maria", carrera: "Técnico en bases de datos", anioGraduacion: 2025, estado: "Inactivo", foto: "foto_perfil/images (4).jpg", correoPersonal: "maria@gmail.com", telefono: "8888-5555", empresaActual: "DataCorp", puestoActual: "DBA Junior", areaProfesional: "Sistemas de Información", linkedIn: "", portafolio: "" }
    ],
    titulos: [
        { id: 1, egresadoId: 1, tipoPrograma: "Bachillerato", carrera: "Ingeniería de software", escuela: "Ingeniería del Software", anioGraduacion: 2002, estado: "Emitido" },
        { id: 2, egresadoId: 2, tipoPrograma: "Técnico", carrera: "Técnico en Ciberseguridad", escuela: "Ciberseguridad", anioGraduacion: 2025, estado: "Emitido" },
        { id: 3, egresadoId: 3, tipoPrograma: "Maestría", carrera: "Maestría en IA", escuela: "Sistemas Inteligentes", anioGraduacion: 2000, estado: "Emitido" },
        { id: 4, egresadoId: 4, tipoPrograma: "Bachillerato", carrera: "Bachillerato en ciberseguridad", escuela: "Ciberseguridad", anioGraduacion: 2015, estado: "Emitido" },
        { id: 5, egresadoId: 5, tipoPrograma: "Técnico", carrera: "Técnico en bases de datos", escuela: "Sistemas de Información", anioGraduacion: 2025, estado: "Emitido" }
    ],
    carreras: [
        { id: 1, nombre: "Técnico en Desarrollo de Software", escuela: "Ingeniería del Software", egresados: 320, estado: "Activo" },
        { id: 2, nombre: "Técnico en Ingeniería del Software", escuela: "Ingeniería del Software", egresados: 185, estado: "Activo" },
        { id: 3, nombre: "Técnico en Desarrollo y Diseño Web", escuela: "Ingeniería del Software", egresados: 240, estado: "Activo" },
        { id: 4, nombre: "Maestría Profesional en Ingeniería del Software", escuela: "Ingeniería del Software", egresados: 68, estado: "Activo" },
        { id: 5, nombre: "Técnico en Ciberseguridad", escuela: "Ciberseguridad", egresados: 275, estado: "Activo" },
        { id: 6, nombre: "Maestría Profesional en Ciberseguridad y Seguridad de la Información", escuela: "Ciberseguridad", egresados: 92, estado: "Activo" },
        { id: 7, nombre: "Técnico en Data Analyst", escuela: "Sistemas de Información", egresados: 150, estado: "Activo" },
        { id: 8, nombre: "Técnico en Business Analytics", escuela: "Sistemas de Información", egresados: 128, estado: "Activo" },
        { id: 9, nombre: "Maestría en Bases de Datos con Analítica", escuela: "Sistemas de Información", egresados: 54, estado: "Activo" },
        { id: 10, nombre: "Técnico en Amazon Web Services", escuela: "Tecnologías de Información", egresados: 142, estado: "Activo" },
        { id: 11, nombre: "Técnico en Redes – CCNA", escuela: "Tecnologías de Información", egresados: 168, estado: "Activo" },
        { id: 12, nombre: "Técnico en Soporte Técnico", escuela: "Tecnologías de Información", egresados: 121, estado: "Activo" },
        { id: 13, nombre: "Técnico en Inteligencia Artificial y Machine Learning", escuela: "Sistemas Inteligentes", egresados: 96, estado: "Activo" },
        { id: 14, nombre: "Técnico en Administración de Empresas", escuela: "Administración de Empresas", egresados: 187, estado: "Activo" },
        { id: 15, nombre: "Técnico en Automatización de Infraestructura", escuela: "Sistemas Industriales", egresados: 103, estado: "Activo" }
    ],
    escuelas: [
        { id: 1, nombre: "Administración de Empresas", director: "María Isabel Losilla Barrientos", carrera: "300" },
        { id: 2, nombre: "Ciberseguridad", director: "Edgar Zamora Gatgens", carrera: "1500" },
        { id: 3, nombre: "Fundamentos", director: "Christian Sibaja F", carrera: "700" },
        { id: 4, nombre: "Ingeniería del Software", director: "Sergio Oviedo Seas", carrera: "400" },
        { id: 5, nombre: "Sistemas Industriales", director: "Sergio Oviedo Seas", carrera: "350" },
        { id: 6, nombre: "Sistemas de Información", director: "María Isabel Losilla Barrientos", carrera: "1234" },
        { id: 7, nombre: "Sistemas Inteligentes", director: "Tomás de Camino Beck", carrera: "1230" },
        { id: 8, nombre: "Tecnologías de Información", director: "Jason Ulloa Hernández", carrera: "900" }
    ],
    actividades: [
        { id: 1, nombre: "Charla: IA en el Desarrollo de Software", descripcion: "Uso de herramientas generativas en entornos de producción reales.", publico: "Desarrolladores de Software" },
        { id: 2, nombre: "Taller: Finanzas para Freelancers", descripcion: "Estrategias de facturación, impuestos locales y gestión de cobros.", publico: "General" },
        { id: 3, nombre: "Networking: Egresados Cenfo 2026", descripcion: "Encuentro presencial para conectar con reclutadores y colegas.", publico: "General" },
        { id: 4, nombre: "Torneo deportivo", descripcion: "Actividades deportivas al aire libre", publico: "General" },
        { id: 5, nombre: "Voluntariado", descripcion: "Voluntariado de siembra de árboles", publico: "General" },
        { id: 6, nombre: "Charla: Redes modernas", descripcion: "Charla sobre las nuevas novedades en redes", publico: "TI" }
    ],
    comunidades: [
        { id: 1, nombre: "Ingeniería de Software" },
        { id: 2, nombre: "Técnico en Desarrollo de Software" },
        { id: 3, nombre: "Bachillerato en Tecnologías de la Información" },
        { id: 4, nombre: "Técnico en Ciberseguridad" },
        { id: 5, nombre: "Administración de Empresas" },
        { id: 6, nombre: "Robótica" }
    ],
    mentorias: [
        { id: 1, mentor: "Ana Jiménez", area: "Desarrollo Web", inicio: "2026-06-01", fin: "2026-08-01", estado: "Activa" },
        { id: 2, mentor: "Carlos Mora", area: "Ciberseguridad", inicio: "2026-05-15", fin: "2026-07-15", estado: "Pendiente" },
        { id: 3, mentor: "Laura Vega", area: "Inteligencia Artificial", inicio: "2026-03-10", fin: "2026-05-10", estado: "Finalizada" }
    ],
    oportunidades: [
        { id: 1, empresa: "TechSolutions CR", puesto: "Desarrollador Full Stack", modalidad: "Remoto", ubicacion: "San José", vencimiento: "2026-07-30", estado: "Activa" },
        { id: 2, empresa: "Banco Nacional", puesto: "Analista de Datos", modalidad: "Presencial", ubicacion: "Heredia", vencimiento: "2026-07-15", estado: "Activa" },
        { id: 3, empresa: "Intel Costa Rica", puesto: "Ingeniero de Software", modalidad: "Híbrido", ubicacion: "Belén", vencimiento: "2026-07-01", estado: "Cerrada" }
    ],
    comunicados: [
        { id: 1, titulo: "Charla: Inteligencia Artificial en la industria", fecha: "2026-06-15", dirigidoA: "Todos los egresados", estado: "Publicado" },
        { id: 2, titulo: "Nueva política de becas para maestrías", fecha: "2026-06-10", dirigidoA: "Egresados de Bachillerato", estado: "Publicado" },
        { id: 3, titulo: "Feria de empleo tecnológico 2026", fecha: "2026-06-05", dirigidoA: "Todos los egresados", estado: "Borrador" }
    ]
};


// ------------------------------------------------------------
// 3. Inicialización: si es la primera vez que la persona abre
//    el sitio en este navegador, copiamos los datos semilla a
//    Local Storage. Si ya existen datos guardados de una visita
//    anterior, los dejamos tal cual (para no borrar cambios).
// ------------------------------------------------------------
function inicializarDatos() {
    // Si ya inicializamos antes, no hacemos nada.
    if (localStorage.getItem(CLAVES_STORAGE.inicializado)) {
        return;
    }

    // Recorremos cada colección semilla y la guardamos en Local Storage.
    for (const nombreColeccion in DATOS_SEMILLA) {
        const clave = CLAVES_STORAGE[nombreColeccion];
        if (clave) {
            localStorage.setItem(clave, JSON.stringify(DATOS_SEMILLA[nombreColeccion]));
        }
    }

    // Marcamos que ya se inicializó, para no repetir este proceso.
    localStorage.setItem(CLAVES_STORAGE.inicializado, "true");
}


// ------------------------------------------------------------
// 4. Funciones CRUD genéricas. Reciben el NOMBRE de la colección
//    ("egresados", "carreras", etc.) y trabajan sobre ella.
//    Así no repetimos el mismo código para cada entidad.
// ------------------------------------------------------------

// Lee una colección completa desde Local Storage.
// Devuelve un arreglo (vacío si algo sale mal).
function obtenerColeccion(nombreColeccion) {
    const clave = CLAVES_STORAGE[nombreColeccion];
    try {
        const texto = localStorage.getItem(clave);
        return texto ? JSON.parse(texto) : [];
    } catch (error) {
        console.error("Error leyendo '" + nombreColeccion + "' de Local Storage:", error);
        return [];
    }
}

// Guarda un arreglo completo en Local Storage, reemplazando lo
// que hubiera antes.
function guardarColeccion(nombreColeccion, arreglo) {
    const clave = CLAVES_STORAGE[nombreColeccion];
    if (clave) {
        localStorage.setItem(clave, JSON.stringify(arreglo));
    }
}

// Genera un id nuevo para un elemento: toma el id más alto que
// exista en la colección y le suma 1. Si la colección está
// vacía, empieza en 1.
function generarNuevoId(arreglo) {
    if (arreglo.length === 0) {
        return 1;
    }
    const idsExistentes = arreglo.map(function (elemento) { return elemento.id; });
    return Math.max.apply(null, idsExistentes) + 1;
}

// Agrega un nuevo elemento a una colección y lo guarda.
// Devuelve el elemento ya con su id asignado.
function agregarElemento(nombreColeccion, elementoSinId) {
    const coleccion = obtenerColeccion(nombreColeccion);
    const nuevoElemento = Object.assign({ id: generarNuevoId(coleccion) }, elementoSinId);
    coleccion.push(nuevoElemento);
    guardarColeccion(nombreColeccion, coleccion);
    return nuevoElemento;
}

// Busca un elemento por su id dentro de una colección.
// Devuelve el objeto encontrado, o undefined si no existe.
function buscarPorId(nombreColeccion, id) {
    const coleccion = obtenerColeccion(nombreColeccion);
    return coleccion.find(function (elemento) { return elemento.id === Number(id); });
}

// Actualiza un elemento existente (identificado por id) con los
// campos nuevos que se le pasen, y guarda el resultado.
function actualizarElemento(nombreColeccion, id, cambios) {
    const coleccion = obtenerColeccion(nombreColeccion);
    const indice = coleccion.findIndex(function (elemento) { return elemento.id === Number(id); });

    if (indice === -1) {
        return null; // No se encontró el elemento.
    }

    coleccion[indice] = Object.assign({}, coleccion[indice], cambios);
    guardarColeccion(nombreColeccion, coleccion);
    return coleccion[indice];
}

// Elimina un elemento de una colección según su id.
function eliminarElemento(nombreColeccion, id) {
    const coleccion = obtenerColeccion(nombreColeccion);
    const nuevaColeccion = coleccion.filter(function (elemento) { return elemento.id !== Number(id); });
    guardarColeccion(nombreColeccion, nuevaColeccion);
}


// ------------------------------------------------------------
// 5. Funciones auxiliares para el Manejo de Sesión y Roles (RF-01)
// ------------------------------------------------------------
function obtenerSesionActiva() {
    try {
        const sesion = localStorage.getItem(CLAVES_STORAGE.sesion);
        return sesion ? JSON.parse(sesion) : null;
    } catch (error) {
        return null;
    }
}

function guardarSesionActiva(usuario) {
    localStorage.setItem(CLAVES_STORAGE.sesion, JSON.stringify(usuario));
}

function cerrarSesion() {
    localStorage.removeItem(CLAVES_STORAGE.sesion);
    window.location.href = "iniciar_sesion.html";
}


// ------------------------------------------------------------
// 6. Ejecutamos la inicialización apenas se carga este archivo,
//    para que los datos existan ANTES de que cualquier otra
//    página intente leerlos.
// ------------------------------------------------------------
inicializarDatos();