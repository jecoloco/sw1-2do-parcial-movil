import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'pizarraonline',
  password: '123456',
  port: 5432
});

export default pool;
