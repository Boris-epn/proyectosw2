
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
