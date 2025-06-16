import { Sequelize } from "sequelize";
import db from "../config/database.js";
import Users from "../users/user-model.js";      // Import Users model
import Feedback from "../feedback/feedback-model.js"; // Import Feedback model (untuk hasOne)

const { DataTypes } = Sequelize;

const Antrian = db.define('antrian', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    keluhan: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    poli: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userId: { // Foreign Key ke User (yang membuat antrian)
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // Nama tabel Users
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('menunggu acc admin', 'dalam antrian', 'selesai', 'ditolak'),
        allowNull: false,
        defaultValue: 'menunggu acc admin'
    },
    queue_number: {
        type: DataTypes.INTEGER,
        allowNull: true, // Bisa null jika belum 'dalam antrian'
    },
    estimasi_masuk: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    durasi_periksa: {
        type: DataTypes.INTEGER,
        allowNull: true,
    }
}, {
    freezeTableName: true,
    timestamps: true // Pastikan ini true
});

// Definisikan asosiasi:
// Antrian dimiliki oleh satu User
Antrian.belongsTo(Users, { foreignKey: 'userId' });
// Antrian bisa memiliki satu Feedback
Antrian.hasOne(Feedback, { foreignKey: 'antrianId' });

export default Antrian;
