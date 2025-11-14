const sesion = protegerPagina("estudiante");

// =======================
//  CARGAR ASISTENCIA
// =======================
async function cargarAsistencia() {
  const tbody = document.querySelector('#tablaAsistencia tbody');
  tbody.innerHTML = '';

  try {
    const res = await fetch(`${API_URL}/estudiante/${sesion.detalle.id}/asistencia`);
    const data = await res.json();

    data.forEach(a => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${a.id_asistencia}</td>
        <td>${a.asignatura || "-"}</td>
        <td>${a.id_sesion || "-"}</td>
        <td><span class="badge">${a.estado_asistencia}</span></td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("ERROR ASISTENCIA:", err);
  }
}

// =======================
//  CARGAR CALIFICACIONES (SP)
// =======================
async function cargarCalificaciones() {
  const cont = document.getElementById("tablaCalificaciones");
  cont.innerHTML = "";

  try {
    const res = await fetch(`${API_URL}/estudiante/${sesion.detalle.id}/calificaciones`);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      cont.innerHTML = "<p>No tienes calificaciones registradas.</p>";
      return;
    }

    let tabla = `
      <table class="table mt-3">
        <thead>
          <tr>
            <th>Asignatura</th>
            <th>Actividad</th>
            <th>Calificación</th>
            <th>Ponderación (%)</th>
            <th>Calificación Ponderada</th>
          </tr>
        </thead>
        <tbody>
    `;

    data.forEach(c => {
      tabla += `
        <tr>
          <td>${c.NombreAsignatura}</td>
          <td>${c.Actividad}</td>
          <td>${c.Calificacion}</td>
          <td>${c.Ponderacion}</td>
          <td>${Number(c.CalificacionPonderada).toFixed(2)}</td>
        </tr>
      `;
    });

    tabla += "</tbody></table>";
    cont.innerHTML = tabla;

  } catch (err) {
    cont.innerHTML = "<p style='color:red'>Error al cargar calificaciones</p>";
  }
}

// Ejecutar
cargarAsistencia();
cargarCalificaciones();
