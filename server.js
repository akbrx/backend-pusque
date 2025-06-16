//hilangkan semua komentar (di on kan) untuk create tabel di database

import express from 'express';
import db from './config/database.js';
import router from './routes/index.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import Antrian from './antrian/antrian-model.js'; //idupkan ini jika ingin membuat tabel antrian
import Users from './users/user-model.js'; //idupkan ini jika ingin membuat tabel users
import Feedback from './feedback/feedback-model.js';

dotenv.config();
const app = express();


// Fungsi untuk membuat direktori jika belum ada
    const createUploadsDirectory = () => {
        const uploadDir = path.join(process.cwd(), 'uploads', 'ktp');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
            console.log(`Direktori "${uploadDir}" berhasil dibuat.`);
        } else {
            console.log(`Direktori "${uploadDir}" sudah ada.`);
        }
    };

try {
  await db.authenticate();
  console.log('Database connected');

  createUploadsDirectory();

  //await db.sync(); 
  await Users.sync(); 
  await Antrian.sync(); 
  await Feedback.sync(); 
} catch (error) {
  console.log(error);
}


app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:3000'],
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use('/uploads', express.static('uploads')); 
app.use(router)
app.listen(5000, () => {
  console.log('Server is running on port 5000');
});