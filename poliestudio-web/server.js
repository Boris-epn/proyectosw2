const express = require('express');
const cors = require('cors');
const path = require('path');
const { sql, getPool } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.post('/api/login', async (req, res) => {
  const { usuario, contrasena } = req.body;

  try {
    const pool = await getPool();
    const cuenta = await pool.request()
      .input('usuario', sql.NVarChar(50), usuario)
      .input('contrasena', sql.NVarChar(50), contrasena)
      .query(`
        SELECT * FROM Cuenta
        WHERE usuario = @usuario AND contrasena = @contrasena AND estado = 'Activo';
      `);

    if (cuenta.recordset.length === 0) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
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

app.put('/api/admin/calificaciones/:id/ponderacion', async (req, res) => {
  const id_calificacion = parseInt(req.params.id, 10);
  const { nueva_ponderacion } = req.body; // decimal entre 0 y 1

  try {
    const pool = await getPool();
    await pool.request()
      .input('id_calificacion', sql.Int, id_calificacion)
      .input('nueva_ponderacion', sql.Decimal(5, 2), nueva_ponderacion)
      .execute('sp_ModificarPonderacion');

    res.json({ mensaje: 'Ponderación actualizada correctamente.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

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

app.get('/api/estudiante/:id/asistencia', async (req, res) => {
  const id_estudiante = parseInt(req.params.id, 10);

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id_estudiante', sql.Int, id_estudiante)
      .query(`
        SELECT a.id_asistencia,
               a.estado_asistencia,
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


app.get('/api/estudiante/:id/horario', async (req, res) => {
  const id_estudiante = parseInt(req.params.id, 10);

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id_estudiante', sql.Int, id_estudiante)
      .query(`
        SELECT DISTINCT h.dia, h.hora_inicio, h.hora_fin,
               asig.nombre AS asignatura,
               p.aula, p.edificio
        FROM Calificacion c
        INNER JOIN Horario h ON c.id_asignatura = h.id_asignatura
        INNER JOIN Asignatura asig ON h.id_asignatura = asig.id_asignatura
        INNER JOIN Paralelo p ON h.id_paralelo = p.id_paralelo
        WHERE c.id_estudiante = @id_estudiante
        ORDER BY h.dia, h.hora_inicio;
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener horario' });
  }
});


app.get('/api/representante/:id/observaciones', async (req, res) => {
  const id_representante = parseInt(req.params.id, 10);

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id_representante', sql.Int, id_representante)
      .query(`
        SELECT o.id_observacion,
               o.observacion,
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


const PORT = 3000;
app.listen(PORT, () => {
  console.log('Servidor escuchando en http://localhost:' + PORT);
});
