const express = require('express');
const cors = require('cors');
const path = require('path');
const { sql, getPool } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/* ============================================================
   LOGIN
============================================================ */
app.post('/api/login', async (req, res) => {
  const { usuario, contrasena } = req.body;

  try {
    const pool = await getPool();
    const cuenta = await pool.request()
      .input('usuario', sql.NVarChar(50), usuario)
      .input('contrasena', sql.NVarChar(50), contrasena)
      .query(`
        SELECT * FROM Cuenta
        WHERE usuario = @usuario AND contrasena = @contrasena;
      `);

    if (cuenta.recordset.length === 0) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
    
if (cuenta.recordset[0].estado === "Inactivo") {
  return res.status(403).json({ error: "Cuenta inactiva. Contacte al administrador." });
}


    const id_cuenta = cuenta.recordset[0].id_cuenta;
    let rol = null;
    let detalle = {};

    const tablas = [
      { nombre: 'Administrador', campoId: 'id_administrador' },
      { nombre: 'Profesor', campoId: 'id_profesor' },
      { nombre: 'Estudiante', campoId: 'id_estudiante' },
      { nombre: 'Representante', campoId: 'id_representante' }
    ];

    for (const t of tablas) {
      const r = await pool.request()
        .input('id_cuenta', sql.Int, id_cuenta)
        .query(`SELECT ${t.campoId} AS id FROM ${t.nombre} WHERE id_cuenta = @id_cuenta;`);

      if (r.recordset.length > 0) {
        rol = t.nombre.toLowerCase();
        detalle = { id: r.recordset[0].id };
        break;
      }
    }

    if (!rol) {
      return res.status(403).json({ error: 'La cuenta no tiene un rol asignado' });
    }

    res.json({
      id_cuenta,
      rol,
      detalle
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error de servidor' });
  }
});
/* ============================================================
   ADMIN - Crear REPRESENTANTE
============================================================ */
app.post("/api/admin/crear-representante", async (req, res) => {
  const { id_representante, nombre, apellido, usuario, contrasena } = req.body;

  try {
    const pool = await getPool();

    await pool.request()
      .input("id_representante", sql.Int, id_representante)
      .input("nombre", sql.NVarChar(50), nombre)
      .input("apellido", sql.NVarChar(50), apellido)
      .input("usuario", sql.NVarChar(50), usuario)
      .input("contrasena", sql.NVarChar(50), contrasena)
      .input("estado", sql.NVarChar(50), "Activo")
      .execute("sp_CrearRepresentante");

    res.json({ mensaje: "Representante creado correctamente" });

  } catch (err) {
    console.error("ERROR CREAR REPRESENTANTE:", err);
    res.status(500).json({ error: err.message });
  }
});


/* ============================================================
   PROFESOR - Registrar observaciones
============================================================ */
app.post('/api/profesor/observaciones', async (req, res) => {
  const { observacion, id_profesor, id_estudiante } = req.body;

  try {
    const pool = await getPool();
    await pool.request()
      .input('observacion', sql.NVarChar(50), observacion)
      .input('id_profesor', sql.Int, id_profesor)
      .input('id_estudiante', sql.Int, id_estudiante)
      .query(`
        INSERT INTO Observacion (observacion, id_profesor, id_estudiante)
        VALUES (@observacion, @id_profesor, @id_estudiante);
      `);

    res.json({ mensaje: 'Observación registrada correctamente.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar observación' });
  }
});


/* ============================================================
   ESTUDIANTE - Asistencia
============================================================ */
app.get('/api/estudiante/:id/asistencia', async (req, res) => {
  const id_estudiante = parseInt(req.params.id);

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id_estudiante', sql.Int, id_estudiante)
      .query(`
        SELECT a.id_asistencia, a.estado_asistencia,
               s.id_sesion,
               asig.nombre AS asignatura
        FROM Asistencia a
        LEFT JOIN Sesion s ON a.id_asistencia = s.id_asistencia
        LEFT JOIN Asignatura asig ON s.id_asignatura = asig.id_asignatura
        WHERE a.id_estudiante = @id_estudiante
        ORDER BY a.id_asistencia DESC;
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener asistencia' });
  }
});


/* ============================================================
   ESTUDIANTE - Horario
============================================================ */
app.get('/api/estudiante/:id/horario', async (req, res) => {
  const id_estudiante = parseInt(req.params.id);
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id_estudiante', sql.Int, id_estudiante)
      .query(`
        SELECT DISTINCT
          h.dia,
          CONVERT(char(8), h.hora_inicio, 108) AS hora_inicio,
          CONVERT(char(8), h.hora_fin, 108)    AS hora_fin,
          asig.nombre AS asignatura,
          p.aula,
          p.edificio
        FROM Calificacion c
        INNER JOIN Horario h ON c.id_asignatura = h.id_asignatura
        INNER JOIN Asignatura asig ON h.id_asignatura = asig.id_asignatura
        INNER JOIN Paralelo p ON h.id_paralelo = p.id_paralelo
        WHERE c.id_estudiante = @id_estudiante
        ORDER BY h.dia, hora_inicio;
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener horario' });
  }
});


/* ============================================================
   REPRESENTANTE - Ver observaciones de sus estudiantes
============================================================ */
app.get('/api/representante/:id/observaciones', async (req, res) => {
  const id_representante = parseInt(req.params.id);

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id_representante', sql.Int, id_representante)
      .query(`
        SELECT o.id_observacion, o.observacion,
               e.nombres AS nombre_estudiante,
               e.apellidos AS apellido_estudiante,
               p.nombres AS nombre_profesor,
               p.apellidos AS apellido_profesor
        FROM Observacion o
        INNER JOIN Estudiante e ON o.id_estudiante = e.id_estudiante
        INNER JOIN Profesor p ON o.id_profesor = p.id_profesor
        WHERE e.id_representante = @id_representante
        ORDER BY o.id_observacion DESC;
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener observaciones' });
  }
});


/* ============================================================
   ADMIN - Crear estudiante
============================================================ */
app.post('/api/admin/crear-estudiante', async (req, res) => {
  const { id_estudiante, nombres, apellidos, usuario, contrasena, id_representante } = req.body;

  try {
    const pool = await getPool();

    await pool.request()
      .input("id_estudiante", sql.Int, id_estudiante)
      .input("nombres", sql.NVarChar(50), nombres)
      .input("apellidos", sql.NVarChar(50), apellidos)
      .input("usuario", sql.NVarChar(50), usuario)
      .input("contrasena", sql.NVarChar(50), contrasena)
      .input("id_representante", sql.Int, id_representante || null)
      .execute("sp_CrearEstudiante");

    res.json({ mensaje: "Estudiante creado correctamente" });

  } catch (err) {
    console.error("ERROR CREAR ESTUDIANTE:", err);
    res.status(500).json({ error: err.message });
  }
});


app.post("/api/admin/asignar-horario", async (req, res) => {
  const { dia, hora_inicio, hora_fin, id_asignatura, id_paralelo } = req.body;

  console.log("Body recibido en servidor:", req.body);

  // Normaliza a HH:MM:SS
  function normalizarHora(str) {
    if (!str) return null;
    const parts = String(str).trim().split(":"); // ["10","00"] o ["10","00","00"]
    const hh = (parts[0] || "00").padStart(2, "0");
    const mm = (parts[1] || "00").padStart(2, "0");
    const ss = (parts[2] || "00").padStart(2, "0");
    return `${hh}:${mm}:${ss}`; // "10:00:00"
  }

  const hi = normalizarHora(hora_inicio);
  const hf = normalizarHora(hora_fin);

  if (!hi || !hf) {
    return res.status(400).json({ error: "Horas inválidas" });
  }

  try {
    const pool = await getPool();

    await pool.request()
      .input("dia", sql.NVarChar(50), dia)
      .input("hora_inicio", sql.NVarChar(8), hi)  // NVARCHAR, NO TIME
      .input("hora_fin", sql.NVarChar(8), hf)
      .input("id_asignatura", sql.Int, id_asignatura)
      .input("id_paralelo", sql.Int, id_paralelo)
      .query(`
        INSERT INTO Horario (dia, hora_inicio, hora_fin, id_asignatura, id_paralelo)
        VALUES (@dia, @hora_inicio, @hora_fin, @id_asignatura, @id_paralelo);
      `);

    res.json({ mensaje: "Horario asignado correctamente" });
  } catch (err) {
    console.error("ERROR ASIGNAR HORARIO:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/admin/desactivar-cuenta", async (req, res) => {
  const { id_cuenta } = req.body;

  try {
    const pool = await getPool();

    await pool.request()
      .input("id_cuenta", sql.Int, id_cuenta)
      .execute("sp_DesactivarCuenta");

    res.json({ mensaje: "Cuenta desactivada correctamente" });

  } catch (err) {
    console.error("ERROR DESACTIVAR CUENTA:", err);
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/admin/editar-estudiante", async (req, res) => {
  const { id_estudiante, nombres, apellidos, id_representante } = req.body;

  try {
    const pool = await getPool();

    await pool.request()
      .input("id_estudiante", sql.Int, id_estudiante)
      .input("nombres", sql.NVarChar(50), nombres)
      .input("apellidos", sql.NVarChar(50), apellidos)
      .input("id_representante", sql.Int, id_representante || null)
      .execute("sp_EditarEstudiante");

    res.json({ mensaje: "Estudiante actualizado correctamente" });

  } catch (err) {
    console.error("ERROR EDITAR ESTUDIANTE:", err);
    res.status(500).json({ error: err.message });
  }
});
app.put("/api/admin/editar-profesor", async (req, res) => {
  const { id_profesor, nombres, apellidos } = req.body;

  try {
    const pool = await getPool();

    await pool.request()
      .input("id_profesor", sql.Int, id_profesor)
      .input("nombres", sql.NVarChar(50), nombres)
      .input("apellidos", sql.NVarChar(50), apellidos)
      .execute("sp_EditarProfesor");

    res.json({ mensaje: "Profesor actualizado correctamente" });

  } catch (err) {
    console.error("ERROR EDITAR PROFESOR:", err);
    res.status(500).json({ error: err.message });
  }
});
app.put("/api/admin/editar-representante", async (req, res) => {
  const { id_representante, nombre, apellido } = req.body;

  try {
    const pool = await getPool();

    await pool.request()
      .input("id_representante", sql.Int, id_representante)
      .input("nombre", sql.NVarChar(50), nombre)
      .input("apellido", sql.NVarChar(50), apellido)
      .execute("sp_EditarRepresentante");

    res.json({ mensaje: "Representante actualizado correctamente" });

  } catch (err) {
    console.error("ERROR EDITAR REPRESENTANTE:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   PROFESOR - Registrar Calificación
============================================================ */
app.post('/api/profesor/calificaciones', async (req, res) => {
  const { nombre_actividad, ponderacion, valor_calificacion, id_estudiante, id_asignatura } = req.body;

  try {
    const pool = await getPool();

    await pool.request()
      .input("nombre_actividad", sql.NVarChar(50), nombre_actividad)
      .input("ponderacion", sql.Int, ponderacion)
      .input("valor_calificacion", sql.Decimal(4,2), valor_calificacion)
      .input("id_estudiante", sql.Int, id_estudiante)
      .input("id_asignatura", sql.Int, id_asignatura)
      .execute("sp_RegistrarCalificacion");

    res.json({ mensaje: "Calificación registrada correctamente" });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   PROFESOR - Editar Calificación
============================================================ */
app.put('/api/profesor/editar-calificacion', async (req, res) => {
  const { id_calificacion, valor_calificacion } = req.body;

  try {
    const pool = await getPool();

    await pool.request()
      .input("id_calificacion", sql.Int, id_calificacion)
      .input("valor_calificacion", sql.Decimal(4,2), valor_calificacion)
      .query(`
        UPDATE Calificacion
        SET valor_calificacion = @valor_calificacion
        WHERE id_calificacion = @id_calificacion
      `);

    res.json({ mensaje: "Calificación actualizada correctamente" });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   PROFESOR - Crear Sesión
============================================================ */
app.post('/api/profesor/crear-sesion', async (req, res) => {
  const { id_profesor, id_asignatura, id_curso } = req.body;

  try {
    const pool = await getPool();

    const salida = await pool.request()
      .input("id_profesor", sql.Int, id_profesor)
      .input("id_asignatura", sql.Int, id_asignatura)
      .input("id_curso", sql.Int, id_curso)
      .output("id_sesion", sql.Int)
      .execute("sp_CrearSesion");

    res.json({ mensaje: "Sesión creada correctamente", id_sesion: salida.output.id_sesion });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   PROFESOR - Registrar Asistencia
============================================================ */
app.post('/api/profesor/asistencia', async (req, res) => {
  const { id_estudiante, id_sesion, estado_asistencia } = req.body;

  try {
    const pool = await getPool();

    await pool.request()
      .input("id_estudiante", sql.Int, id_estudiante)
      .input("id_sesion", sql.Int, id_sesion)
      .input("estado_asistencia", sql.NVarChar(50), estado_asistencia)
      .execute("sp_RegistrarAsistencia");

    res.json({ mensaje: "Asistencia registrada" });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   PROFESOR - Sesión + Asistencia autom.
============================================================ */
app.post('/api/profesor/sesion-asistencia', async (req, res) => {
  const { id_profesor, id_asignatura, id_curso, lista_estudiantes } = req.body;

  try {
    const pool = await getPool();

    await pool.request()
      .input("id_profesor", sql.Int, id_profesor)
      .input("id_asignatura", sql.Int, id_asignatura)
      .input("id_curso", sql.Int, id_curso)
      .input("lista_estudiantes", sql.NVarChar(sql.MAX), lista_estudiantes)
      .execute("sp_CrearSesionYRegistrarAsistencia");

    res.json({ mensaje: "Sesión y asistencias registradas correctamente" });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   ESTUDIANTE - Ver calificaciones (usando SP)
============================================================ */
app.get("/api/estudiante/:id/calificaciones", async (req, res) => {
  const id_estudiante = parseInt(req.params.id);

  try {
    const pool = await getPool();

    const result = await pool.request()
      .input("id_estudiante", sql.Int, id_estudiante)
      .execute("sp_ConsultarCalificacionesEstudiante");

    res.json(result.recordset);

  } catch (err) {
    console.error("ERROR CONSULTAR CALIFICACIONES:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/representante/:id/calificaciones', async (req, res) => {
  const id_representante = parseInt(req.params.id);

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("id_representante", sql.Int, id_representante)
      .query(`
        SELECT e.id_estudiante,
               e.nombres AS nombre_estudiante,
               e.apellidos AS apellido_estudiante,
               a.nombre AS nombre_asignatura,
               c.nombre_actividad AS actividad,
               c.valor_calificacion AS calificacion,
               c.ponderacion,
               (c.valor_calificacion * c.ponderacion / 100.0) AS calificacionPonderada
        FROM Estudiante e
        INNER JOIN Calificacion c ON e.id_estudiante = c.id_estudiante
        INNER JOIN Asignatura a ON c.id_asignatura = a.id_asignatura
        WHERE e.id_representante = @id_representante
        ORDER BY e.id_estudiante, a.nombre, c.nombre_actividad;
      `);

    res.json(result.recordset);

  } catch (err) {
    console.error("ERROR CALIFICACIONES REPRESENTANTE:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/representante/:id/asistencia', async (req, res) => {
  const id_representante = parseInt(req.params.id);

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input("id_representante", sql.Int, id_representante)
      .query(`
        SELECT e.id_estudiante,
               e.nombres AS nombre_estudiante,
               e.apellidos AS apellido_estudiante,
               a.estado_asistencia,
               s.id_sesion,
               asig.nombre AS asignatura
        FROM Estudiante e
        INNER JOIN Asistencia a ON e.id_estudiante = a.id_estudiante
        LEFT JOIN Sesion s ON a.id_asistencia = s.id_asistencia
        LEFT JOIN Asignatura asig ON s.id_asignatura = asig.id_asignatura
        WHERE e.id_representante = @id_representante
        ORDER BY e.id_estudiante, a.id_asistencia DESC;
      `);

    res.json(result.recordset);

  } catch (err) {
    console.error("ERROR ASISTENCIA REPRESENTANTE:", err);
    res.status(500).json({ error: err.message });
  }
});


/* ============================================================
   PARAMETROS CALCULO
============================================================ */
async function ensureParametrosCalculo(pool) {
  await pool.request().query(`
    IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name='ParametrosCalculo')
    BEGIN
      CREATE TABLE ParametrosCalculo (
        id INT PRIMARY KEY,
        escala_max INT NOT NULL DEFAULT 10,
        modo_agregacion NVARCHAR(20) NOT NULL DEFAULT 'suma',
        validar_total_ponderacion BIT NOT NULL DEFAULT 1,
        prioridad_orden NVARCHAR(400) NULL
      );
      INSERT INTO ParametrosCalculo (id, escala_max, modo_agregacion, validar_total_ponderacion, prioridad_orden)
      VALUES (1,10,'suma',1,'');
    END;
  `);
}

// ADMIN - Obtener parámetros cálculo (sin stored procedure; acceso directo a tabla)
app.get('/api/admin/parametros-calculo', async (req, res) => {
  try {
    const pool = await getPool();
    await ensureParametrosCalculo(pool);
    const r = await pool.request().query(`
      SELECT escala_max, modo_agregacion, validar_total_ponderacion, prioridad_orden
      FROM ParametrosCalculo WHERE id = 1;
    `);
    res.json(r.recordset[0] || {});
  } catch (e) {
    console.error('[parametros-calculo][GET]', e.message);
    res.status(500).json({ error: 'Error al obtener parámetros' });
  }
});

// ADMIN - Actualizar parámetros cálculo (UPDATE directo; no usar sp_SetParametrosCalculo)
app.put('/api/admin/parametros-calculo', async (req, res) => {
  const { escala_max = 10, modo_agregacion = 'suma', validar_total_ponderacion = true, prioridad_orden = '' } = req.body || {};
  if (!['suma','promedio'].includes(modo_agregacion)) {
    return res.status(400).json({ error: 'modo_agregacion inválido (suma|promedio)' });
  }
  try {
    const pool = await getPool();
    await ensureParametrosCalculo(pool);
    await pool.request()
      .input('escala_max', sql.Int, escala_max)
      .input('modo_agregacion', sql.NVarChar(20), modo_agregacion)
      .input('validar_total_ponderacion', sql.Bit, validar_total_ponderacion ? 1 : 0)
      .input('prioridad_orden', sql.NVarChar(400), prioridad_orden)
      .query(`
        UPDATE ParametrosCalculo
        SET escala_max=@escala_max,
            modo_agregacion=@modo_agregacion,
            validar_total_ponderacion=@validar_total_ponderacion,
            prioridad_orden=@prioridad_orden
        WHERE id=1;
      `);
    res.json({ mensaje: 'Parámetros actualizados' });
  } catch (e) {
    console.error('[parametros-calculo][PUT]', e.message);
    res.status(500).json({ error: 'Error al actualizar parámetros' });
  }
});

// Nuevo endpoint resumen de calificaciones
app.get('/api/estudiante/:id/calificaciones-resumen', async (req, res) => {
  const id_estudiante = parseInt(req.params.id);
  try {
    const pool = await getPool();
    await ensureParametrosCalculo(pool);
    const params = await pool.request().query(`SELECT * FROM ParametrosCalculo WHERE id=1;`);
    const p = params.recordset[0];

    const result = await pool.request()
      .input("id_estudiante", sql.Int, id_estudiante)
      .execute("sp_ConsultarCalificacionesEstudiante");

    const items = result.recordset;
    let totalPonderacion = 0, sumaPonderada = 0;
    items.forEach(r => {
      totalPonderacion += (r.Ponderacion || 0);
      sumaPonderada += (r.CalificacionPonderada || 0);
    });

    let final = (p.modo_agregacion === 'promedio' && totalPonderacion > 0)
      ? (sumaPonderada * 100 / totalPonderacion)
      : sumaPonderada;

    const advertenciaPonderacion = p.validar_total_ponderacion && totalPonderacion !== 100;

    res.json({
      parametros: {
        escala_max: p.escala_max,
        modo_agregacion: p.modo_agregacion,
        validar_total_ponderacion: p.validar_total_ponderacion,
        prioridad_orden: p.prioridad_orden
      },
      resumen: {
        totalPonderacion,
        sumaPonderada,
        final,
        advertenciaPonderacion
      }
    });
  } catch (e) {
    console.error('[calificaciones-resumen]', e.message);
    res.status(500).json({ error: 'Error al generar resumen' });
  }
});


/* ============================================================
   INICIAR SERVIDOR
============================================================ */
const PORT = 3000;
app.listen(PORT, () => {
  console.log('Servidor escuchando en http://localhost:' + PORT);
});

app.post('/api/admin/inscribir-estudiante', async (req, res) => {
  const { id_estudiante, id_asignatura } = req.body;
  if (!id_estudiante || !id_asignatura) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }
  try {
    const pool = await getPool();
    // Verificar duplicado de inscripción ficticia
    const dup = await pool.request()
      .input('id_estudiante', sql.Int, id_estudiante)
      .input('id_asignatura', sql.Int, id_asignatura)
      .query(`
        SELECT 1 FROM Calificacion
        WHERE id_estudiante=@id_estudiante
          AND id_asignatura=@id_asignatura
          AND nombre_actividad='__INSCRIPCION__'
      `);
    if (dup.recordset.length > 0) {
      return res.json({ mensaje: 'El estudiante ya está inscrito en la asignatura.' });
    }

    // Usar SP existente para crear registro con ponderación y nota cero
    await pool.request()
      .input("nombre_actividad", sql.NVarChar(50), '__INSCRIPCION__')
      .input("ponderacion", sql.Int, 0)
      .input("valor_calificacion", sql.Decimal(4,2), 0)
      .input("id_estudiante", sql.Int, id_estudiante)
      .input("id_asignatura", sql.Int, id_asignatura)
      .execute("sp_RegistrarCalificacion");

    res.json({ mensaje: 'Inscripción realizada. El horario aparecerá asociado.' });
  } catch (err) {
    console.error('ERROR INSCRIBIR:', err);
    res.status(500).json({ error: 'Error al inscribir' });
  }
});
