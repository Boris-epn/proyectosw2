
const sql = require('mssql');

const dbConfig = {
  user: 'hola',               
  password: '12345',    
  server: 'localhost',
  port: 1433,
  database: 'poliestudio',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function getPool() {
  if (!sql.globalConnectionPool) {
    sql.globalConnectionPool = await sql.connect(dbConfig);
  }
  return sql.globalConnectionPool;
}

module.exports = { sql, getPool };

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

