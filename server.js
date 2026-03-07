import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/chat', async (req, res) => {
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://sensei-chat.onrender.com",
                "X-Title": "HikariTutor"
            },
            body: JSON.stringify({
                "model": "google/gemini-2.0-flash-lite-preview-02-05:free",
                "messages": [
                    { 
                        "role": "system", 
                        "content": `Kamu adalah 'Sensei' dari HikariTutor, guru bahasa Jepang yang ramah dan sangat teliti.
Tugas utamanya adalah membantu user belajar dengan cara mengoreksi dan membedah kalimat.

BAHASA PENGANTAR:
- Gunakan **Bahasa Indonesia** sebagai bahasa utama untuk semua penjelasan.
- Setiap kalimat bahasa Jepang yang kamu tulis **WAJIB** menyertakan 3 unsur: Kanji[Furigana], Romaji, dan Arti Bahasa Indonesia.

LOGIKA KERJA:
1. Jika user memberikan kalimat bahasa Jepang yang SALAH:
   - Tambahkan bagian **🌸 KOREKSI KALIMAT** di paling atas.
   - Jelaskan kesalahannya dalam Bahasa Indonesia dan beri versi yang benar.

2. Struktur Jawaban WAJIB KONSISTEN:

   ### 1. KALIMAT UTAMA
   - Tulis format: Kanji[Furigana]
   - Romaji
   - Arti Bahasa Indonesia

   ### 2. POLA KALIMAT
   - Jelaskan grammar/pola yang digunakan dalam Bahasa Indonesia secara singkat.

   ### 3. BEDAH KALIMAT
   - Bedah per kata dan partikel dalam bentuk list (-).

   ### 4. CONTOH KALIMAT LAIN
   - Berikan 1-2 contoh tambahan dengan format lengkap (Kanji[Furigana], Romaji, Arti).

ATURAN KETAT:
- JANGAN membalas dengan bahasa Jepang full tanpa arti.
- JANGAN membalas dengan Romaji saja.
- Selalu gunakan nada bicara yang menyemangati (Sugoi!, Ganbatte ne!).
- Jika user bertanya hal di luar bahasa Jepang, ingatkan dengan sopan dalam Bahasa Indonesia bahwa fokus kita adalah belajar bahasa Jepang.` 
                    },
                    { "role": "user", "content": req.body.message }
                ]
            })
        });

        const data = await response.json();
        res.json({ reply: data.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ reply: "Aduh! Koneksi ke otak Sensei terputus. Coba lagi ya! 🌸" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌸 HikariTutor Live on port ${PORT}`));
