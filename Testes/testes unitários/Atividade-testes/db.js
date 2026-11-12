import mysql from 'mysql2/promise';
export const db = mysql.createPool({
host: process.env.DB_HOST ?? 'localhost',
port: Number(process.env.DB_PORT ?? 3306),
user: process.env.DB_USER ?? 'diretor',
password: process.env.DB_PASSWORD ?? 'senha',
database: process.env.DB_NAME ?? 'escola_caos',
});