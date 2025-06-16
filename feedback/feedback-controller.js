import Feedback from "./feedback-model.js";
import Antrian from "../antrian/antrian-model.js"; // Import model Antrian
import Users from "../users/user-model.js"; // Import model User

// Fungsi untuk mendapatkan semua feedback (untuk halaman beranda)
export const getAllFeedback = async (req, res) => {
    try {
        console.log("[BACKEND - getAllFeedback] Menerima permintaan untuk semua feedback.");
        // --- AKTIFKAN KEMBALI KLAUSA INCLUDE UNTUK PRODUKSI ---
        const feedbacks = await Feedback.findAll({
            include: [
                {
                    model: Antrian,
                    attributes: ['id', 'poli', 'keluhan', 'updatedAt'], // Ambil kolom yang relevan dari Antrian
                    include: [{
                        model: Users, // User diakses melalui Antrian
                        attributes: ['name'] // Ambil nama user dari model User melalui Antrian
                    }],
                    required: false // Gunakan false jika Anda ingin menyertakan feedback bahkan jika antrian atau user tidak ada
                },
                {
                    model: Users, // Sertakan model Users secara langsung jika Feedback juga memiliki userId langsung
                    attributes: ['name'],
                    required: false // Gunakan false jika Anda ingin menyertakan feedback meskipun userId tidak terhubung ke Users
                }
            ],
            order: [['createdAt', 'DESC']] // Urutkan feedback terbaru di atas
        });
        // --- AKHIR AKTIVASI KLAUSA INCLUDE ---

        // Format ulang data agar sesuai dengan frontend (e.g., fb.user.name)
        const formattedFeedbacks = feedbacks.map(feedback => {
            let userName = 'Anonim';
            if (feedback.Antrian && feedback.Antrian.User && feedback.Antrian.User.name) {
                userName = feedback.Antrian.User.name;
            } else if (feedback.User && feedback.User.name) { // Jika ada asosiasi Feedback.belongsTo(Users) langsung
                userName = feedback.User.name;
            }

            return {
                id: feedback.id,
                rating: feedback.rating,
                komentar: feedback.komentar,
                updatedAt: feedback.updatedAt,
                antrianId: feedback.antrianId,
                user: {
                    name: userName // Menggunakan nama yang ditemukan atau 'Anonim'
                }
            };
        });
        console.log(`[BACKEND - getAllFeedback] Mengirim ${formattedFeedbacks.length} feedback.`);
        res.json(formattedFeedbacks);
    } catch (error) {
        console.error("[BACKEND - getAllFeedback] Error fetching all feedback:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Fungsi untuk membuat feedback baru
export const createFeedback = async (req, res) => {
    try {
        const { antrianId, rating, komentar } = req.body;
        const userId = req.userId; // Dari verifyToken middleware

        console.log(`[BACKEND - createFeedback] Menerima permintaan feedback dari user ${userId} untuk antrian ${antrianId}.`);
        console.log("[BACKEND - createFeedback] Data diterima:", { antrianId, rating, komentar });

        if (!antrianId || !rating) {
            console.warn("[BACKEND - createFeedback] Validasi gagal: Antrian ID atau rating kosong.");
            return res.status(400).json({ message: "Antrian ID dan rating wajib diisi" });
        }

        // Pastikan antrian memang milik user yang sedang login dan sudah selesai
        const antrian = await Antrian.findOne({
            where: { id: antrianId, userId: userId, status: 'selesai' }
        });

        if (!antrian) {
            console.warn("[BACKEND - createFeedback] Antrian tidak ditemukan atau belum selesai untuk user ini.");
            return res.status(404).json({ message: "Antrian tidak ditemukan atau belum selesai." });
        }

        // Cek apakah feedback untuk antrian ini sudah ada
        const existingFeedback = await Feedback.findOne({ where: { antrianId: antrianId } });
        if (existingFeedback) {
            console.warn("[BACKEND - createFeedback] Feedback sudah ada untuk antrian ini.");
            return res.status(400).json({ message: "Anda sudah memberikan feedback untuk antrian ini." });
        }

        const newFeedback = await Feedback.create({
            antrianId,
            rating,
            komentar,
            userId // Simpan userId yang memberikan feedback
        });
        console.log("[BACKEND - createFeedback] Feedback berhasil dibuat:", newFeedback.id);

        res.status(201).json({ message: "Feedback berhasil dikirim", feedback: newFeedback });
    } catch (error) {
        console.error("[BACKEND - createFeedback] Error creating feedback:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Fungsi untuk mendapatkan feedback user tertentu (untuk halaman feedback user)
export const getUserFeedback = async (req, res) => {
    try {
        const userId = req.userId; // Dari verifyToken middleware
        console.log(`[BACKEND - getUserFeedback] Menerima permintaan feedback dari user ${userId}.`);

        const feedbacks = await Feedback.findAll({
            where: { userId: userId }, // Filter berdasarkan userId yang memberikan feedback
            include: [{
                model: Antrian,
                attributes: ['id', 'poli', 'keluhan', 'updatedAt'] // Sertakan detail antrian
            }],
            order: [['createdAt', 'DESC']]
        });
        console.log(`[BACKEND - getUserFeedback] Mengirim ${feedbacks.length} feedback untuk user ${userId}.`);
        res.json(feedbacks);
    } catch (error) {
        console.error("[BACKEND - getUserFeedback] Error fetching user feedback:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// FUNGSI getRiwayatAntrianSelesai (dari antrian-controller.js)
// Asumsi ini sudah diimpor dan diekspor dengan benar di tempat lain
// export const getRiwayatAntrianSelesai = async (req, res) => { /* ... */ };

export const simpanPrediksiAntrian = async (req, res) => {
    const { id } = req.params;
    const { entryMinutes, durationMinutes } = req.body;

    try {
        const antrian = await Antrian.findByPk(id);
        if (!antrian) return res.status(404).json({ message: "Antrian tidak ditemukan" });

        antrian.estimasi_masuk = entryMinutes;
        antrian.durasi_periksa = durationMinutes;

        await antrian.save();

        res.json({ message: "Prediksi berhasil disimpan", antrian });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal menyimpan prediksi" });
    }
};
