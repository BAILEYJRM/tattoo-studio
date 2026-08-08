const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:password@localhost:5432/postgres'
});
client.connect()
  .then(() => client.query('CREATE DATABASE tattoo_db'))
  .then(() => { console.log('Database created'); client.end(); })
  .catch(err => {
    if (err.code === '42P04') { console.log('Database already exists'); client.end(); }
    else { console.error('Error:', err); client.end(); }
  });
