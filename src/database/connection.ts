import pg from "pg";

let pool: pg.Pool;

const connectDB = (dsn: string) => {
  pool = new pg.Pool({ connectionString: dsn });
};

const query = async (text: string, params?: any[]) => {
  const res = await pool.query(text, params);
  return res.rows;
};

const closeDB = () => pool.end();

export const db = { connectDB, query, closeDB };
