import { Sequelize } from "sequelize";
import db from "../config/database.js";
import Antrian from "../antrian/antrian-model.js"; // Import Antrian model
import Users from "../users/user-model.js";     // Import Users model

const { DataTypes } = Sequelize;

const Feedback = db.define('feedback', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    antrianId: { // Foreign Key ke Antrian
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'antrian', // Nama tabel Antrian
            key: 'id'
        }
    },
    userId: { // Foreign Key ke User (yang memberi feedback)
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // Nama tabel Users
            key: 'id'
        }
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    komentar: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // Kolom createdAt dan updatedAt otomatis oleh Sequelize
}, {
    freezeTableName: true,
    timestamps: true // Pastikan ini true jika Anda mengandalkan createdAt/updatedAt
});

// Definisikan asosiasi:
// Feedback dimiliki oleh satu Antrian (melalui antrianId)
Feedback.belongsTo(Antrian, { foreignKey: 'antrianId' });
// Feedback dimiliki oleh satu User (melalui userId)
Feedback.belongsTo(Users, { foreignKey: 'userId' });

export default Feedback;
