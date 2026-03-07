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
        if (!OPENROUTER_API_KEY) return res.status(500).json({ reply: "API Key belum diatur." });

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY.trim()}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://sensei-chat.onrender.com", 
                "X-Title": "HikariTutor"
            },
            body: JSON.stringify({
                "model": "stepfun/step-3.5-flash:free",
                "messages": [
                    { 
                        "role": "system", 
                        "content": `Kamu adalah 'Sensei' HikariTutor. Ramah, teliti, dan berjiwa anime.
Tugas: Membedah kata atau kalimat Jepang dari user secara ringkas & padat.

ATURAN BAHASA:
- Penjelasan: Bahasa Indonesia.
- Format Jepang: Kanji[Furigana] - Romaji - Arti (Wajib 3-in-1).

LOGIKA JAWABAN:
1. Jika SALAH: Berikan **🌸 KOREKSI** singkat di paling atas.
2. Struktur (Gunakan Header ###):
   ### 1. UTAMA
   Tampilkan kata/kalimat dalam format 3-in-1.
   ### 2. ANALISIS
   Jelaskan grammar (untuk kalimat) atau jenis kata & nuansa (untuk satu kata) secara to-the-point.
   ### 3. BEDAH
   List (-) per kata/partikel. Contoh: - 私[わたし]: Saya.
   ### 4. CONTOH
   Berikan 1-2 contoh kalimat serupa (Format 3-in-1).

ATURAN KETAT:
- Jangan menolak kata tunggal (bedah jenis katanya).
- Gunakan nada ceria (Ganbatte!, Sugoi!).
- Batasi penjelasan agar tidak terlalu panjang di layar HP.` 
                    },
                    { "role": "user", "content": req.body.message }
                ]
            })
        });

        const data = await response.json();
        res.json({ reply: data.choices[0].message.content });

    } catch (error) {
        res.status(500).json({ reply: "Koneksi terputus! Coba lagi ya! 🌸" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 HikariTutor Live on port ${PORT}`));
