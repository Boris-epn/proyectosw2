
const sql = require('mssql');

const dbConfig = {
  user: 'hola',               
  password: 'hola',    
  server: 'localhost',
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
