const sql = require('mssql');
const creds = require('./db_creds'); // Create this module to import sentitive information

const connStr = `Server=${creds.server};Database=${creds.db_name};User id=${creds.db_user};Password=${creds.db_password};Trusted_Connection=True;TrustServerCertificate=True;encrypt=false`;

const poolPromise = new sql.ConnectionPool(connStr)
  .connect()
  .then(pool => {
    console.log('Connected to MSSQL');
    return pool;
  })
  .catch(err => console.log('Database Connection Failed! Bad Config: ', err));

async function selectEmployees(group, res){
   const pool = await poolPromise;
   
   await pool
      .request()
      .query("SELECT * FROM Employees WHERE [Group] =" + group)
      .then(result => res.json(result.recordset))
      .catch(err => res.json(err));

}

 module.exports = {
   selectEmployees, 
   sql,
   poolPromise}