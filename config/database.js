import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize({
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DATABSE,
  dialect: 'mysql',
  port: process.env.DB_PORT,
  host: process.env.DB_HOST,
});

export default sequelize; // ✅ Benar

