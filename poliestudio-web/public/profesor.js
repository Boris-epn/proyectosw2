// Proteger acceso
const sesion = protegerPagina("profesor");
const cont = document.getElementById("contenido");

// Cambia de vista
function mostrar(vista) {
  cont.innerHTML = "";

  switch (vista) {
    case "registrarCalificacion":
      formRegistrarCalificacion();
      break;
    case "editarCalificacion":
      formEditarCalificacion();
      break;
    case "crearSesion":
      formCrearSesion();
      break;
    case "registrarAsistencia":
      formRegistrarAsistencia();
      break;
    case "crearSesionAsistencia":
      formCrearSesionAsistencia();
      break;
  }
}

/* ============================================================
   FORMULARIO: Registrar Calificación
============================================================ */
function formRegistrarCalificacion() {
  cont.innerHTML = `
    <h3>Registrar Calificación</h3>

    <div class="input-group">
      <label>Nombre Actividad</label>
      <input id="nombre_actividad">
    </div>

    <div class="input-group">
      <label>Ponderación (%)</label>
      <input type="number" id="ponderacion">
    </div>

    <div class="input-group">
      <label>Calificación</label>
      <input type="number" id="valor_calificacion" step="0.01">
    </div>

    <div class="input-group">
      <label>ID Estudiante</label>
      <input type="number" id="id_estudiante">
    </div>

    <div class="input-group">
      <label>ID Asignatura</label>
      <input type="number" id="id_asignatura">
    </div>

    <button onclick="registrarCalificacion()">Registrar</button>
    <p id="msg"></p>
  `;
}

async function registrarCalificacion() {
  const body = {
    nombre_actividad: document.getElementById("nombre_actividad").value,
    ponderacion: document.getElementById("ponderacion").value,
    valor_calificacion: document.getElementById("valor_calificacion").value,
    id_estudiante: document.getElementById("id_estudiante").value,
    id_asignatura: document.getElementById("id_asignatura").value
  };

  const msg = document.getElementById("msg");

  try {
    const res = await fetch(API_URL + "/profesor/calificaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    msg.style.color = res.ok ? "green" : "red";
    msg.textContent = data.mensaje || data.error;

  } catch (err) {
    msg.style.color = "red";
    msg.textContent = "Error de servidor";
  }
}

/* ============================================================
   FORM: Editar Calificación
============================================================ */
function formEditarCalificacion() {
  cont.innerHTML = `
    <h3>Editar Calificación</h3>

    <div class="input-group">
      <label>ID Calificación</label>
      <input type="number" id="id_calificacion">
    </div>

    <div class="input-group">
      <label>Nueva Calificación</label>
      <input type="number" id="nuevo_valor" step="0.01">
    </div>

    <button onclick="editarCalificacion()">Guardar cambios</button>
    <p id="msg"></p>
  `;
}

async function editarCalificacion() {
  const body = {
    id_calificacion: document.getElementById("id_calificacion").value,
    valor_calificacion: document.getElementById("nuevo_valor").value,
  };

  const msg = document.getElementById("msg");

  try {
    const res = await fetch(API_URL + "/profesor/editar-calificacion", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    msg.style.color = res.ok ? "green" : "red";
    msg.textContent = data.mensaje || data.error;

  } catch (err) {
    msg.style.color = "red";
    msg.textContent = "Error de servidor";
  }
}

/* ============================================================
   FORM: Crear Sesión
============================================================ */
function formCrearSesion() {
  cont.innerHTML = `
    <h3>Crear Sesión</h3>

    <div class="input-group">
      <label>ID Profesor</label>
      <input type="number" id="id_profesor">
    </div>

    <div class="input-group">
      <label>ID Asignatura</label>
      <input type="number" id="id_asignatura_sesion">
    </div>

    <div class="input-group">
      <label>ID Curso</label>
      <input type="number" id="id_curso">
    </div>

    <button onclick="crearSesion()">Crear Sesión</button>
    <p id="msg"></p>
  `;
}

function autollenarCamposSesion(id) {
  const campos = document.querySelectorAll("input[id*='sesion']");

  campos.forEach(campo => {
    campo.value = id;
  });

  console.log("Campos de sesión autollenados con ID:", id);
}


async function crearSesion() {
  const body = {
    id_profesor: document.getElementById("id_profesor").value,
    id_asignatura: document.getElementById("id_asignatura_sesion").value,
    id_curso: document.getElementById("id_curso").value,
  };

  const msg = document.getElementById("msg");

  try {
    const res = await fetch(API_URL + "/profesor/crear-sesion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (res.ok) {
      msg.style.color = "green";
      msg.textContent = `Sesión creada. ID = ${data.id_sesion}`;
      localStorage.setItem("ultima_sesion", data.id_sesion);

      autollenarCamposSesion(data.id_sesion);

    } else {
      msg.style.color = "red";
      msg.textContent = data.error;
    }

  } catch (err) {
    msg.style.color = "red";
    msg.textContent = "Error de servidor";
  }
}

/* ============================================================
   FORM: Registrar Asistencia
============================================================ */
function formRegistrarAsistencia() {
  cont.innerHTML = `
    <h3>Registrar Asistencia</h3>

    <div class="input-group">
      <label>ID Estudiante</label>
      <input id="id_estudiante_asis">
    </div>

    <div class="input-group">
      <label>ID Sesión</label>
      <input id="id_sesion_asis">
    </div>

    <div class="input-group">
      <label>Estado</label>
      <select id="estado_asistencia">
        <option>Presente</option>
        <option>Ausente</option>
        <option>Justificado</option>
      </select>
    </div>

    <button onclick="registrarAsistencia()">Registrar</button>
    <p id="msg"></p>
  `;

  const ultima = localStorage.getItem("ultima_sesion");
  if (ultima) {
    autollenarCamposSesion(ultima);
  }
}


async function registrarAsistencia() {
  const body = {
    id_estudiante: document.getElementById("id_estudiante_asis").value,
    id_sesion: document.getElementById("id_sesion_asis").value,
    estado_asistencia: document.getElementById("estado_asistencia").value,
  };

  const msg = document.getElementById("msg");

  try {
    const res = await fetch(API_URL + "/profesor/asistencia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    msg.style.color = res.ok ? "green" : "red";
    msg.textContent = data.mensaje || data.error;

  } catch (err) {
    msg.style.color = "red";
    msg.textContent = "Error de servidor";
  }
}

/* ============================================================
   FORM: Sesión + Asistencia automática
============================================================ */
function formCrearSesionAsistencia() {
  cont.innerHTML = `
    <h3>Sesión + Asistencia Automática</h3>

    <div class="input-group">
      <label>ID Profesor</label>
      <input id="id_prof_auto">
    </div>

    <div class="input-group">
      <label>ID Asignatura</label>
      <input id="id_asig_auto">
    </div>

    <div class="input-group">
      <label>ID Curso</label>
      <input id="id_curso_auto">
    </div>

    <div class="input-group">
      <label>Lista de Estudiantes (CSV)</label>
      <input id="lista_csv" placeholder="1,5,10,20">
    </div>

    <button onclick="crearSesionAsistencia()">Ejecutar</button>
    <p id="msg"></p>
  `;
}

async function crearSesionAsistencia() {
  const body = {
    id_profesor: document.getElementById("id_prof_auto").value,
    id_asignatura: document.getElementById("id_asig_auto").value,
    id_curso: document.getElementById("id_curso_auto").value,
    lista_estudiantes: document.getElementById("lista_csv").value,
  };

  const msg = document.getElementById("msg");

  try {
    const res = await fetch(API_URL + "/profesor/sesion-asistencia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    msg.style.color = res.ok ? "green" : "red";
    msg.textContent = data.mensaje || data.error;

  } catch (err) {
    msg.style.color = "red";
    msg.textContent = "Error de servidor";
  }
}
