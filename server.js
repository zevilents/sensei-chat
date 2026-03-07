import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Konfigurasi Path untuk ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json());
// Melayani file statis (seperti index.html) dari folder saat ini
app.use(express.static(__dirname));

// Ambil API Key dari Environment Variable di Render
const OPENROUTER_API_KEY = "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";

/**
 * ROUTE UTAMA (GET /)
 * Mengatasi error "Cannot GET /" dengan mengirimkan file HTML kamu.
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

/**
 * ROUTE CHAT (POST /api/chat)
 * Jantung dari Sensei HikariTutor.
 */
app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                // Menggunakan model Gemini 2.0 Flash Lite (Free & Cepat)
                model: "stepfun/step-3.5-flash:free", 
                messages: [
                    { 
                        role: "system", 
                        content: `Kamu adalah 'Sensei' dari HikariTutor, guru bahasa Jepang yang ramah, ceria, dan sangat teliti.
                        
Tugas utamanya adalah membantu user belajar dengan cara mengoreksi dan membedah kalimat.

LOGIKA KERJA:
1. Jika kalimat user SALAH (partikel, typo, atau pola kalimat):
   - Tampilkan bagian ### 🌸 KOREKSI KALIMAT di paling atas.
   - Jelaskan kesalahannya dengan lembut dan beri versi yang benar.

2. Gunakan struktur penjelasan berikut:
   ### 1. KALIMAT UTAMA
   - Tuliskan kalimat yang benar menggunakan format Kanji[Furigana]. Contoh: 私[わたし].
   - Sertakan Romaji dan Arti Bahasa Indonesia.

   ### 2. POLA KALIMAT
   - Jelaskan grammar/pola yang digunakan.

   ### 3. BEDAH KALIMAT
   - Bedah per kata dan fungsi partikel dalam bentuk list.

   ### 4. CONTOH KALIMAT LAIN
   - Berikan 1-2 contoh tambahan dengan pola serupa.

Gunakan nada bicara yang menyemangati seperti "Sugoi!" atau "Ganbatte!". Selalu gunakan Markdown.` 
                    },
                    { role: "user", content: userMessage }
                ]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("Error OpenRouter:", data.error.message);
            return res.status(400).json({ reply: "Gomen! Sensei sedang lelah, coba lagi nanti ya." });
        }

        res.json({ reply: data.choices[0].message.content });

    } catch (error) {
        console.error("Sistem Error:", error);
        res.status(500).json({ reply: "Koneksi ke otak Sensei terputus. Pastikan internetmu aktif!" });
    }
});

// Menjalankan Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🌸 HikariTutor Live di port ${PORT}`);
});


