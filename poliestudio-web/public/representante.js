// Proteger acceso
const sesion = protegerPagina("representante");
const cont = document.getElementById("contenido");

function mostrar(vista) {
  cont.innerHTML = "";
  if (vista === "verCalificaciones") cargarCalificaciones();
  if (vista === "verAsistencia") cargarAsistencia();
}

/* ==========================
   VER CALIFICACIONES
========================== */
async function cargarCalificaciones() {
  cont.innerHTML = "<h3>Calificaciones de mis representados</h3>";

  try {
    const res = await fetch(API_URL + `/representante/${sesion.detalle.id}/calificaciones`);
    const data = await res.json();

    if (data.length === 0) {
      cont.innerHTML += "<p>No hay calificaciones registradas.</p>";
      return;
    }

    let tabla = `
      <table class="table">
        <thead>
          <tr>
            <th>Estudiante</th>
            <th>Asignatura</th>
            <th>Actividad</th>
            <th>Nota</th>
            <th>Ponderación</th>
            <th>Nota Final</th>
          </tr>
        </thead>
        <tbody>
    `;

    data.forEach(c => {
      tabla += `
        <tr>
          <td>${c.nombre_estudiante} ${c.apellido_estudiante}</td>
          <td>${c.nombre_asignatura}</td>
          <td>${c.actividad}</td>
          <td>${c.calificacion}</td>
          <td>${c.ponderacion}%</td>
          <td>${Number(c.calificacionPonderada).toFixed(2)}</td>
        </tr>
      `;
    });

    tabla += "</tbody></table>";
    cont.innerHTML += tabla;

  } catch (err) {
    cont.innerHTML += "<p style='color:red'>Error al cargar calificaciones</p>";
  }
}

/* ==========================
   VER ASISTENCIA
========================== */
async function cargarAsistencia() {
  cont.innerHTML = "<h3>Asistencia de mis representados</h3>";

  try {
    const res = await fetch(API_URL + `/representante/${sesion.detalle.id}/asistencia`);
    const data = await res.json();

    if (data.length === 0) {
      cont.innerHTML += "<p>No hay registros de asistencia.</p>";
      return;
    }

    let tabla = `
      <table class="table">
        <thead>
          <tr>
            <th>Estudiante</th>
            <th>Asignatura</th>
            <th>Sesión</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
    `;

    data.forEach(a => {
      tabla += `
        <tr>
          <td>${a.nombre_estudiante} ${a.apellido_estudiante}</td>
          <td>${a.asignatura || '-'}</td>
          <td>${a.id_sesion || '-'}</td>
          <td>${a.estado_asistencia}</td>
        </tr>
      `;
    });

    tabla += "</tbody></table>";
    cont.innerHTML += tabla;

  } catch (err) {
    cont.innerHTML += "<p style='color:red'>Error al cargar asistencia</p>";
  }
}
