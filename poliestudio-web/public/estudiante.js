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
      const codigoAsign = a.codigo_asignatura || a.CodigoAsignatura || a.codigo || '';
      const nombreAsign = a.asignatura || a.NombreAsignatura || '';
      // Nombre + código si existe
      const displayAsign = codigoAsign ? `${nombreAsign} (${codigoAsign})` : nombreAsign || "-";

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${a.id_asistencia}</td>
        <td>${displayAsign}</td>
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
//  CALIFICACIONES
// =======================
function renderCalificaciones(data, filtro = '', modoOrden = 'alfabetico') {
  const cont = document.getElementById("tablaCalificaciones");
  cont.innerHTML = "";

  // Filtro simple por nombre o código
  const term = filtro.trim().toLowerCase();
  let filtradas = data.filter(c => {
    const nombre = (c.NombreAsignatura || '').toLowerCase();
    const codigo = (c.CodigoAsignatura || c.Codigo || c.codigo_asignatura || '').toLowerCase();
    return !term || nombre.includes(term) || codigo.includes(term);
  });

  // Orden
  if (modoOrden === 'alfabetico') {
    filtradas.sort((a, b) => (a.NombreAsignatura || '').localeCompare(b.NombreAsignatura || ''));
  } else if (modoOrden === 'categoria') {
    filtradas.sort((a, b) => (a.Categoria || '').localeCompare(b.Categoria || ''));
  }

  if (filtradas.length === 0) {
    cont.innerHTML = "<p>No hay calificaciones que coincidan.</p>";
    return;
  }

  let tabla = `
    <table class="table mt-3">
      <thead>
        <tr>
          <th>Asignatura (Código)</th>
          <th>Actividad</th>
          <th>Calificación</th>
          <th>Ponderación (%)</th>
          <th>Calificación Ponderada</th>
          <th>Categoría</th>
        </tr>
      </thead>
      <tbody>
  `;

  filtradas.forEach(c => {
    const nombre = c.NombreAsignatura || '';
    const codigo = c.CodigoAsignatura || c.Codigo || c.codigo_asignatura || '';
    const categoria = c.Categoria || c.CategoriaAsignatura || '';
    tabla += `
      <tr>
        <td>${codigo ? `${nombre} (${codigo})` : nombre}</td>
        <td>${c.Actividad}</td>
        <td>${c.Calificacion}</td>
        <td>${c.Ponderacion}</td>
        <td>${Number(c.CalificacionPonderada).toFixed(2)}</td>
        <td>${categoria}</td>
      </tr>
    `;
  });

  tabla += "</tbody></table>";
  cont.innerHTML = tabla;
}

let cacheCalificaciones = [];

// =======================
//  CARGAR CALIFICACIONES (SP)
// =======================
async function cargarCalificaciones() {
  const cont = document.getElementById("tablaCalificaciones");
  cont.innerHTML = "";

  try {
    const res = await fetch(`${API_URL}/estudiante/${sesion.detalle.id}/calificaciones`);
    const data = await res.json();
    cacheCalificaciones = Array.isArray(data) ? data : [];

    // Inserta controles de búsqueda y orden
    const controles = document.createElement('div');
    controles.className = 'mt-3';
    controles.innerHTML = `
      <div class="input-group">
        <label>Buscar asignatura (nombre o código)</label>
        <input id="filtro_asig" placeholder="Ej: MAT101 o Matemáticas">
      </div>
      <div class="input-group">
        <label>Ordenar por</label>
        <select id="orden_asig">
          <option value="alfabetico">Alfabético</option>
          <option value="categoria">Categoría</option>
        </select>
      </div>
    `;
    cont.parentElement.insertBefore(controles, cont);

    // Eventos
    document.getElementById('filtro_asig').addEventListener('input', () => {
      const f = document.getElementById('filtro_asig').value;
      const o = document.getElementById('orden_asig').value;
      renderCalificaciones(cacheCalificaciones, f, o);
    });
    document.getElementById('orden_asig').addEventListener('change', () => {
      const f = document.getElementById('filtro_asig').value;
      const o = document.getElementById('orden_asig').value;
      renderCalificaciones(cacheCalificaciones, f, o);
    });

    renderCalificaciones(cacheCalificaciones);
    cargarResumenCalificaciones();

  } catch (err) {
    cont.innerHTML = "<p style='color:red'>Error al cargar calificaciones</p>";
  }
}

async function cargarResumenCalificaciones() {
  try {
    const res = await fetch(`${API_URL}/estudiante/${sesion.detalle.id}/calificaciones-resumen`);
    const data = await res.json();
    const contenedor = document.getElementById('contenedorCalificaciones');
    const r = data.resumen || {};
    const p = data.parametros || {};
    const warn = r.advertenciaPonderacion ? `<span style="color:#dc2626"> (Advertencia: total ponderación ≠ 100%)</span>` : '';
    const bloque = document.createElement('div');
    bloque.className = 'mt-3';
    bloque.innerHTML = `
      <h3>Resumen Final</h3>
      <p>Modo: ${p.modo_agregacion} | Escala Máx: ${p.escala_max}</p>
      <p>Total Ponderación: ${r.totalPonderacion}${warn}</p>
      <p>Suma Ponderada: ${r.sumaPonderada.toFixed(2)}</p>
      <p>Calificación Final: <strong>${(r.final ?? 0).toFixed(2)}</strong></p>
    `;
    contenedor.appendChild(bloque);
  } catch {
    // opcional silencio
  }
}

// =======================
//  CARGAR HORARIO
// =======================
async function cargarHorario() {
  const tbody = document.querySelector('#tablaHorario tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  function fmtHora(v) {
    if (!v) return '-';
    if (typeof v === 'string') {
      if (v.includes('T')) { // ISO
        const t = v.split('T')[1];
        return t.slice(0,5);
      }
      // Esperado HH:MM:SS
      return v.slice(0,5);
    }
    if (v instanceof Date) return v.toTimeString().slice(0,5);
    return String(v).slice(0,5);
  }
  try {
    const res = await fetch(`${API_URL}/estudiante/${sesion.detalle.id}/horario`);
    const data = await res.json();
    const ordenDias = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
    data.sort((a,b)=>{
      const od = ordenDias.indexOf(a.dia) - ordenDias.indexOf(b.dia);
      if (od !== 0) return od;
      return (a.hora_inicio || '').localeCompare(b.hora_inicio || '');
    });
    data.forEach(h => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${h.dia}</td>
        <td>${fmtHora(h.hora_inicio)}</td>
        <td>${fmtHora(h.hora_fin)}</td>
        <td>${h.asignatura || '-'}</td>
        <td>${h.aula || '-'}</td>
        <td>${h.edificio || '-'}</td>
      `;
      tbody.appendChild(tr);
    });
    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6">Sin horario asignado.</td></tr>`;
    }
  } catch {
    tbody.innerHTML = `<tr><td colspan="6" style="color:red">Error al cargar horario</td></tr>`;
  }
}

// Ejecutar
cargarAsistencia();
cargarCalificaciones();
cargarHorario();
