const sesion = protegerPagina('administrador');
const cont = document.getElementById("contenido");

function mostrar(vista) {
  cont.innerHTML = ""; 

  if (vista === "crearEstudiante") formCrearEstudiante();
  if (vista === "crearProfesor") formCrearProfesor();
  if (vista === "crearRepresentante") formCrearRepresentante();
  if (vista === "crearAsignatura") formCrearAsignatura();
  if (vista === "crearParalelo") formCrearParalelo();
  if (vista === "asignarHorario") formAsignarHorario();
  if (vista === "editarEstudiante") formEditarEstudiante();
  if (vista === "editarProfesor") formEditarProfesor();
  if (vista === "editarRepresentante") formEditarRepresentante();
  if (vista === "desactivarCuenta") formDesactivarCuenta();
  if (vista === "parametrosCalculo") formParametrosCalculo();
  if (vista === "inscribirEstudiante") formInscribirEstudiante();
}

/* ==============================
    FORMULARIOS
=============================== */

// --- FORM CREAR ESTUDIANTE ---
function formCrearEstudiante() {
  cont.innerHTML = `
    <h3>Crear Estudiante</h3>

    <div class="input-group">
      <label>Cédula (ID Estudiante)</label>
      <input id="id_estudiante" type="number">
    </div>

    <div class="input-group">
      <label>Nombres</label>
      <input id="nombres">
    </div>

    <div class="input-group">
      <label>Apellidos</label>
      <input id="apellidos">
    </div>

    <div class="input-group">
      <label>Usuario</label>
      <input id="usuario">
    </div>

    <div class="input-group">
      <label>Contraseña</label>
      <input id="contrasena" type="password">
    </div>

    <div class="input-group">
      <label>ID Representante (opcional)</label>
      <input id="id_representante_est" type="number">
    </div>

    <button onclick="crearEstudiante()">Crear</button>
    <p id="msg" class="mt-3"></p>
  `;
}

async function crearEstudiante() {
  const body = {
    id_estudiante: document.getElementById("id_estudiante").value,
    nombres: document.getElementById("nombres").value,
    apellidos: document.getElementById("apellidos").value,
    usuario: document.getElementById("usuario").value,
    contrasena: document.getElementById("contrasena").value,
    id_representante: document.getElementById("id_representante_est").value || null
  };

  const msg = document.getElementById("msg");

  try {
    const res = await fetch(API_URL + "/admin/crear-estudiante", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    msg.style.color = res.ok ? "green" : "red";
    msg.textContent = data.mensaje || data.error;

  } catch {
    msg.style.color = "red"; msg.textContent = "Error de servidor";
  }
}

// --- FORM CREAR PROFESOR ---
function formCrearProfesor() {
  cont.innerHTML = `
    <h3>Crear Profesor</h3>

    <div class="input-group">
      <label>Cédula</label>
      <input id="id_profesor">
    </div>

    <div class="input-group">
      <label>Nombres</label>
      <input id="nombres_prof">
    </div>

    <div class="input-group">
      <label>Apellidos</label>
      <input id="apellidos_prof">
    </div>

    <div class="input-group">
      <label>Usuario</label>
      <input id="usuario_prof">
    </div>

    <div class="input-group">
      <label>Contraseña</label>
      <input id="contrasena_prof" type="password">
    </div>

    <button onclick="crearProfesor()">Crear</button>
    <p id="msg" class="mt-3"></p>
  `;
}

async function crearProfesor() {
  const body = {
    id_profesor: document.getElementById("id_profesor").value,
    nombres: document.getElementById("nombres_prof").value,
    apellidos: document.getElementById("apellidos_prof").value,
    usuario: document.getElementById("usuario_prof").value,
    contrasena: document.getElementById("contrasena_prof").value
  };

  const msg = document.getElementById("msg");

  try {
    const res = await fetch(API_URL + "/admin/crear-profesor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    msg.style.color = res.ok ? "green" : "red";
    msg.textContent = data.mensaje || data.error;

  } catch {
    msg.style.color = "red"; msg.textContent = "Error de servidor";
  }
}

// --- FORM CREAR REPRESENTANTE ---
function formCrearRepresentante() {
  cont.innerHTML = `
    <h3>Crear Representante</h3>

    <div class="input-group">
      <label>Cédula</label>
      <input id="id_representante">
    </div>

    <div class="input-group">
      <label>Nombres</label>
      <input id="nombre_rep">
    </div>

    <div class="input-group">
      <label>Apellidos</label>
      <input id="apellido_rep">
    </div>

    <div class="input-group">
      <label>Usuario</label>
      <input id="usuario_rep">
    </div>

    <div class="input-group">
      <label>Contraseña</label>
      <input id="contrasena_rep" type="password">
    </div>

    <button onclick="crearRepresentante()">Crear</button>
    <p id="msg" class="mt-3"></p>
  `;
}

async function crearRepresentante() {
  const body = {
    id_representante: document.getElementById("id_representante").value,
    nombre: document.getElementById("nombre_rep").value,
    apellido: document.getElementById("apellido_rep").value,
    usuario: document.getElementById("usuario_rep").value,
    contrasena: document.getElementById("contrasena_rep").value
  };

  const msg = document.getElementById("msg");

  try {
    const res = await fetch(API_URL + "/admin/crear-representante", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    msg.style.color = res.ok ? "green" : "red";
    msg.textContent = data.mensaje || data.error;

  } catch {
    msg.style.color = "red"; msg.textContent = "Error de servidor";
  }
}

// --- FORM CREAR ASIGNATURA ---
function formCrearAsignatura() {
  cont.innerHTML = `
    <h3>Crear Asignatura</h3>

    <div class="input-group">
      <label>Nombre</label>
      <input id="nombre_asig">
    </div>

    <div class="input-group">
      <label>Descripción</label>
      <input id="descripcion_asig">
    </div>

    <div class="input-group">
      <label>ID Profesor</label>
      <input id="id_profesor_asig">
    </div>

    <button onclick="crearAsignatura()">Crear</button>
    <p id="msg" class="mt-3"></p>
  `;
}

async function crearAsignatura() {
  const body = {
    nombre: document.getElementById("nombre_asig").value,
    descripcion: document.getElementById("descripcion_asig").value,
    id_profesor: document.getElementById("id_profesor_asig").value
  };

  const msg = document.getElementById("msg");

  try {
    const res = await fetch(API_URL + "/admin/crear-asignatura", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    msg.style.color = res.ok ? "green" : "red";
    msg.textContent = data.mensaje || data.error;

  } catch {
    msg.style.color = "red"; msg.textContent = "Error de servidor";
  }
}

// --- FORM CREAR PARALELO ---
function formCrearParalelo() {
  cont.innerHTML = `
    <h3>Crear Paralelo</h3>

    <div class="input-group">
      <label>Aula</label>
      <input id="aula_paralelo">
    </div>

    <div class="input-group">
      <label>Edificio</label>
      <input id="edificio_paralelo">
    </div>

    <button onclick="crearParalelo()">Crear</button>
    <p id="msg" class="mt-3"></p>
  `;
}

async function crearParalelo() {
  const body = {
    aula: document.getElementById("aula_paralelo").value,
    edificio: document.getElementById("edificio_paralelo").value
  };

  const msg = document.getElementById("msg");

  try {
    const res = await fetch(API_URL + "/admin/crear-paralelo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    msg.style.color = res.ok ? "green" : "red";
    msg.textContent = data.mensaje || data.error;

  } catch {
    msg.style.color = "red"; msg.textContent = "Error de servidor";
  }
}

// --- FORM ASIGNAR HORARIO (UN SOLO BLOQUE) ---
function formAsignarHorario() {
  cont.innerHTML = `
    <h3>Asignar Horario</h3>

    <div class="input-group">
      <label>Día</label>
      <select id="dia_horario">
        <option value="Lunes">Lunes</option>
        <option value="Martes">Martes</option>
        <option value="Miércoles">Miércoles</option>
        <option value="Jueves">Jueves</option>
        <option value="Viernes">Viernes</option>
      </select>
    </div>

    <div class="input-group">
      <label>Hora Inicio</label>
      <input type="time" id="hora_inicio_horario" step="1">
    </div>

    <div class="input-group">
      <label>Hora Fin</label>
      <input type="time" id="hora_fin_horario" step="1">
    </div>

    <div class="input-group">
      <label>ID Asignatura</label>
      <input type="number" id="id_asignatura_horario">
    </div>

    <div class="input-group">
      <label>ID Paralelo</label>
      <input type="number" id="id_paralelo_horario">
    </div>

    <button onclick="asignarHorario()">Asignar</button>
    <p id="msg" class="mt-3"></p>
  `;
}

async function asignarHorario() {
  const dia = document.getElementById("dia_horario").value;
  let hora_inicio = document.getElementById("hora_inicio_horario").value;
  let hora_fin = document.getElementById("hora_fin_horario").value;
  const id_asignatura = document.getElementById("id_asignatura_horario").value;
  const id_paralelo = document.getElementById("id_paralelo_horario").value;

  const msg = document.getElementById("msg");

  if (!hora_inicio || !hora_fin) { msg.style.color="red"; msg.textContent="Selecciona horas válidas"; return; }
  if (hora_inicio.length === 5) hora_inicio += ":00";
  if (hora_fin.length === 5) hora_fin += ":00";

  const body = { dia, hora_inicio, hora_fin, id_asignatura, id_paralelo };

  try {
    const res = await fetch(API_URL + "/admin/asignar-horario", {
      method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify(body)
    });

    const data = await res.json();
    msg.style.color = res.ok ? "green" : "red";
    msg.textContent = data.mensaje || data.error;

  } catch { msg.style.color="red"; msg.textContent="Error de servidor"; }
}

// --- EDITAR ESTUDIANTE / PROFESOR / REPRESENTANTE / DESACTIVAR CUENTA ---
function formEditarEstudiante() {
  cont.innerHTML = `
    <h3>Editar Estudiante</h3>

    <label>ID Estudiante</label>
    <input id="edit_id_estudiante">

    <label>Nuevo nombre</label>
    <input id="edit_nombre_est">

    <label>Nuevo apellido</label>
    <input id="edit_apellido_est">

    <label>ID Representante (opcional)</label>
    <input id="edit_id_representante">

    <button onclick="editarEstudiante()">Guardar Cambios</button>
    <p id="msg" class="mt-3"></p>
  `;
}

async function editarEstudiante() {
  const body = {
    id_estudiante: document.getElementById("edit_id_estudiante").value,
    nombres: document.getElementById("edit_nombre_est").value,
    apellidos: document.getElementById("edit_apellido_est").value,
    id_representante: document.getElementById("edit_id_representante").value || null
  };

  const msg = document.getElementById("msg");

  const res = await fetch(API_URL + "/admin/editar-estudiante", {
    method:"PUT", headers:{ "Content-Type":"application/json" }, body:JSON.stringify(body)
  });

  const data = await res.json();
  msg.style.color = res.ok ? "green" : "red"; msg.textContent = data.mensaje || data.error;
}

function formEditarProfesor() {
  cont.innerHTML = `
    <h3>Editar Profesor</h3>

    <label>ID Profesor</label>
    <input id="edit_id_profesor">

    <label>Nuevo nombre</label>
    <input id="edit_nombre_prof">

    <label>Nuevo apellido</label>
    <input id="edit_apellido_prof">

    <button onclick="editarProfesor()">Guardar Cambios</button>
    <p id="msg" class="mt-3"></p>
  `;
}

async function editarProfesor() {
  const body = {
    id_profesor: document.getElementById("edit_id_profesor").value,
    nombres: document.getElementById("edit_nombre_prof").value,
    apellidos: document.getElementById("edit_apellido_prof").value
  };

  const msg = document.getElementById("msg");

  const res = await fetch(API_URL + "/admin/editar-profesor", {
    method:"PUT", headers:{ "Content-Type":"application/json" }, body:JSON.stringify(body)
  });

  const data = await res.json();
  msg.style.color = res.ok ? "green" : "red"; msg.textContent = data.mensaje || data.error;
}

function formEditarRepresentante() {
  cont.innerHTML = `
    <h3>Editar Representante</h3>

    <label>ID Representante</label>
    <input id="edit_id_rep">

    <label>Nuevo nombre</label>
    <input id="edit_nombre_rep">

    <label>Nuevo apellido</label>
    <input id="edit_apellido_rep">

    <button onclick="editarRepresentante()">Guardar Cambios</button>
    <p id="msg" class="mt-3"></p>
  `;
}

async function editarRepresentante() {
  const body = {
    id_representante: document.getElementById("edit_id_rep").value,
    nombre: document.getElementById("edit_nombre_rep").value,
    apellido: document.getElementById("edit_apellido_rep").value
  };

  const msg = document.getElementById("msg");

  const res = await fetch(API_URL + "/admin/editar-representante", {
    method:"PUT", headers:{ "Content-Type":"application/json" }, body:JSON.stringify(body)
  });

  const data = await res.json();
  msg.style.color = res.ok ? "green" : "red"; msg.textContent = data.mensaje || data.error;
}

function formDesactivarCuenta() {
  cont.innerHTML = `
    <h3>Desactivar Cuenta</h3>

    <label>ID Cuenta</label>
    <input id="id_cuenta_desactivar">

    <button onclick="desactivarCuenta()">Desactivar</button>
    <p id="msg" class="mt-3"></p>
  `;
}

async function desactivarCuenta() {
  const body = { id_cuenta: document.getElementById("id_cuenta_desactivar").value };

  const msg = document.getElementById("msg");

  const res = await fetch(API_URL + "/admin/desactivar-cuenta", {
    method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify(body)
  });

  const data = await res.json();
  msg.style.color = res.ok ? "green" : "red"; msg.textContent = data.mensaje || data.error;
}

// --- FORM PARAMETROS CALCULO ---
function formParametrosCalculo() {
  // Parámetros se gestionan sin stored procedure (UPDATE directo en server.js)
  cont.innerHTML = `
    <h3>Parámetros Cálculo Calificaciones</h3>
    <div class="input-group">
      <label>Escala Máx</label>
      <input id="pc_escala">
    </div>
    <div class="input-group">
      <label>Modo Agregación</label>
      <select id="pc_modo">
        <option value="suma">Suma</option>
        <option value="promedio">Promedio</option>
      </select>
    </div>
    <div class="input-group">
      <label>Validar total ponderación = 100%</label>
      <select id="pc_validar">
        <option value="1">Sí</option>
        <option value="0">No</option>
      </select>
    </div>
    <div class="input-group">
      <label>Prioridad orden (CSV)</label>
      <input id="pc_prioridad" placeholder="Parcial,Proyecto,Examen">
    </div>
    <button onclick="guardarParametrosCalculo()">Guardar</button>
    <p id="pc_msg" class="mt-3"></p>
  `;
  cargarParametrosCalculo();
}

async function cargarParametrosCalculo() {
  const msg = document.getElementById('pc_msg');
  try {
    const r = await fetch(API_URL + '/admin/parametros-calculo');
    const d = await r.json();
    document.getElementById('pc_escala').value = d.escala_max ?? 10;
    document.getElementById('pc_modo').value = d.modo_agregacion ?? 'suma';
    document.getElementById('pc_validar').value = d.validar_total_ponderacion ? '1':'0';
    document.getElementById('pc_prioridad').value = d.prioridad_orden ?? '';
  } catch { msg.style.color='red'; msg.textContent='Error al cargar'; }
}

async function guardarParametrosCalculo() {
  const msg = document.getElementById('pc_msg');
  const body = {
    escala_max: parseInt(document.getElementById('pc_escala').value),
    modo_agregacion: document.getElementById('pc_modo').value,
    validar_total_ponderacion: document.getElementById('pc_validar').value === '1',
    prioridad_orden: document.getElementById('pc_prioridad').value.trim()
  };
  try {
    const r = await fetch(API_URL + '/admin/parametros-calculo', {
      method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)
    });
    const d = await r.json();
    msg.style.color = r.ok ? 'green':'red';
    msg.textContent = d.mensaje || d.error;
  } catch { msg.style.color='red'; msg.textContent='Error al guardar'; }
}

// --- FORM INSCRIBIR ESTUDIANTE ---
function formInscribirEstudiante() {
  cont.innerHTML = `
    <h3>Inscribir Estudiante en Asignatura</h3>
    <div class="input-group">
      <label>ID Estudiante</label>
      <input id="insc_id_est" type="number">
    </div>
    <div class="input-group">
      <label>ID Asignatura</label>
      <input id="insc_id_asig" type="number">
    </div>
    <button onclick="inscribirEstudianteAsignatura()">Inscribir</button>
    <p id="insc_msg" class="mt-3"></p>
  `;
}

async function inscribirEstudianteAsignatura() {
  const msg = document.getElementById('insc_msg');
  const body = {
    id_estudiante: document.getElementById('insc_id_est').value,
    id_asignatura: document.getElementById('insc_id_asig').value
  };
  if (!body.id_estudiante || !body.id_asignatura) {
    msg.style.color='red'; msg.textContent='Completa ambos campos'; return;
  }
  try {
    const res = await fetch(API_URL + '/admin/inscribir-estudiante', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(body)
    });
    const data = await res.json();
    msg.style.color = res.ok ? 'green':'red';
    msg.textContent = data.mensaje || data.error;
  } catch {
    msg.style.color='red'; msg.textContent='Error de servidor';
  }
}
