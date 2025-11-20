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

}

/* ==============================
    FORMULARIOS
=============================== */

funcfunction formCrearEstudiante() {
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
d_esasync function crearEstudiante() {
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

  } catch (e) {
    msg.style.color = "red";
    msg.textContent = "Error de servidor";
  }
}
ementById("dia_horario").value;
  const horaInicioRaw = document.getElementById("hora_inicio_horario").value;
  const horaFinRaw = document.getElementById("hora_fin_horario").value;

  const id_asignatura = document.getElementById("id_asignatura_horario").value;
  const id_paralelo = document.getElementById("id_paralelo_horario").value;

  const msg = document.getElementById("msg");

  if (!horaInicioRaw || !horaFinRaw) {
    msg.textContent = "Selecciona horas válidas";
    msg.style.color = "red";
    return;
  }

  // Convertir HH:MM a HH:MM:SS
  function normalizarHora(h) {
    // Caso HH:MM
    if (/^\d{2}:\d{2}$/.test(h)) {
      return h + ":00";
    }

    // Caso "10:00 a. m." del navegador
    const match = h.match(/(\d{1,2}):(\d{2})\s*(a\. m\.|p\. m\.)/i);
    if (match) {
      let hora = parseInt(match[1]);
      const min = match[2];
      const sufijo = match[3].toLowerCase();

      if (sufijo.includes("p") && hora < 12) hora += 12;
      if (sufijo.includes("a") && hora === 12) hora = 0;

      return `${hora.toString().padStart(2, "0")}:${min}:00`;
    }

    return null;
  }

  const hora_inicio = normalizarHora(horaInicioRaw);
  const hora_fin = normalizarHora(horaFinRaw);

  if (!hora_inicio || !hora_fin) {
    msg.textContent = "Formato de hora inválido";
    msg.style.color = "red";
    return;
  }

  const body = {
    dia,
    hora_inicio,
    hora_fin,
    id_asignatura,
    id_paralelo
  };

  console.log("Enviando:", body);

  try {
    const res = await fetch(API_URL + "/admin/asignar-horario", {
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
      <input id="id_asignatura_horario" type="number">
    </div>

    <div class="input-group">
      <label>ID Paralelo</label>
      <input id="id_paralelo_horario" type="number">
    </div>

    <button onclick="asignarHorario()">Asignar</button>
    <p id="msg" class="mt-3"></p>
  `;
}
async function asignarHorario() {
  const dia = document.getElementById("dia_horario").value;
  const hora_inicio = document.getElementById("hora_inicio_horario").value;  // HH:MM:SS
  const hora_fin = document.getElementById("hora_fin_horario").value;        // HH:MM:SS
  const id_asignatura = document.getElementById("id_asignatura_horario").value;
  const id_paralelo = document.getElementById("id_paralelo_horario").value;

  const msg = document.getElementById("msg");

  if (!hora_inicio || !hora_fin) {
    msg.textContent = "Selecciona horas válidas";
    msg.style.color = "red";
    return;
  }

  const body = {
    dia,
    hora_inicio,
    hora_fin,
    id_asignatura,
    id_paralelo
  };

  try {
    const res = await fetch(API_URL + "/admin/asignar-horario", {
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
      <input id="id_asignatura_horario" type="number">
    </div>

    <div class="input-group">
      <label>ID Paralelo</label>
      <input id="id_paralelo_horario" type="number">
    </div>

    <button onclick="asignarHorario()">Asignar</button>
    <p id="msg" class="mt-3"></p>
  `;
}

async function asignarHorario() {
  const dia = document.getElementById("dia_horario").value;
  const hora_inicio = document.getElementById("hora_inicio_horario").value;  // "10:00" o "10:00:00"
  const hora_fin = document.getElementById("hora_fin_horario").value;
  const id_asignatura = document.getElementById("id_asignatura_horario").value;
  const id_paralelo = document.getElementById("id_paralelo_horario").value;

  const msg = document.getElementById("msg");

  if (!hora_inicio || !hora_fin) {
    msg.textContent = "Selecciona horas válidas";
    msg.style.color = "red";
    return;
  }

  const body = {
    dia,
    hora_inicio,
    hora_fin,
    id_asignatura,
    id_paralelo
  };

  console.log("Body que envío al backend:", body);

  try {
    const res = await fetch(API_URL + "/admin/asignar-horario", {
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
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  msg.style.color = res.ok ? "green" : "red";
  msg.textContent = data.mensaje || data.error;
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
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  msg.style.color = res.ok ? "green" : "red";
  msg.textContent = data.mensaje || data.error;
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
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  msg.style.color = res.ok ? "green" : "red";
  msg.textContent = data.mensaje || data.error;
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
  const body = {
    id_cuenta: document.getElementById("id_cuenta_desactivar").value
  };

  const msg = document.getElementById("msg");

  const res = await fetch(API_URL + "/admin/desactivar-cuenta", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  msg.style.color = res.ok ? "green" : "red";
  msg.textContent = data.mensaje || data.error;
}
