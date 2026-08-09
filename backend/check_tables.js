const pool = require('./src/config/database');

pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
  .then(r => {
    console.log(r.rows.map(row => row.table_name));
    process.exit(0);
  })
  .catch(console.error);
