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
}

/* ==============================
    FORMULARIOS
=============================== */

function formCrearEstudiante() {
  cont.innerHTML = `
    <h3>Crear Estudiante</h3>
    <div class="input-group">
        <label>Cédula</label>
  <input id="id_estudiante">
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
    contrasena: document.getElementById("contrasena").value
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
