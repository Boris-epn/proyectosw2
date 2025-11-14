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
      <input type="password" id="contrasena_prof">
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
  } catch (e) {
    msg.style.color = "red";
    msg.textContent = "Error de servidor";
  }
}

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
      <input type="password" id="contrasena_rep">
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

  } catch (e) {
    msg.style.color = "red";
    msg.textContent = "Error de servidor";
  }
}

function formCrearAsignatura() {
  cont.innerHTML = `
    <h3>Crear Asignatura</h3>

    <div class="input-group">
      <label>Nombre de la asignatura</label>
      <input id="nombre_asig">
    </div>

    <div class="input-group">
      <label>Descripción</label>
      <input id="descripcion_asig">
    </div>

    <div class="input-group">
      <label>ID del Profesor</label>
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

  } catch (e) {
    msg.style.color = "red";
    msg.textContent = "Error de servidor";
  }
}
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

  } catch (e) {
    msg.style.color = "red";
    msg.textContent = "Error de servidor";
  }
}











