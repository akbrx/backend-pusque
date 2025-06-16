import { Sequelize } from "sequelize";
import db from "../config/database.js";
import Antrian from "../antrian/antrian-model.js";     // Import Antrian model
import Feedback from "../feedback/feedback-model.js"; // Import Feedback model

const { DataTypes } = Sequelize;

const User = db.define('users', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    nik: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: {
                args: [16, 16],
                msg: "NIK harus terdiri dari 16 angka"
            },
            isNumeric: {
                msg: "NIK hanya boleh berisi angka"
            }
        }
    },
    tanggalLahir: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    domisili: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    fotoKtp: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('pasien', 'admin', 'dokter'),
        allowNull: false,
        defaultValue: 'pasien'
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    refreshToken: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    freezeTableName: true,
    timestamps: true // Pastikan ini true
});

// Definisikan asosiasi:
// User memiliki banyak Antrian
User.hasMany(Antrian, { foreignKey: 'userId' });
// User bisa memiliki banyak Feedback (jika userId di Feedback adalah pembuat feedback)
User.hasMany(Feedback, { foreignKey: 'userId' });

export default User;
