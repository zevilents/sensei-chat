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
                "HTTP-Referer": "stepfun/step-3.5-flash:free", 
                "X-Title": "HikariTutor"
            },
            body: JSON.stringify({
                "model": "nvidia/nemotron-3-nano-30b-a3b:free",
                "messages": [
                    { 
                        "role": "system", 
                        content: `Kamu adalah Hikari Sensei, guru bahasa Jepang yang ramah, ringkas, dan terstruktur. Gunakan bahasa Indonesia.

ATURAN KETAT (WAJIB DIIKUTI):
1. DILARANG KERAS menggunakan Tabel Markdown. UI kami bergaya Telegram, jadi gunakan teks biasa, angka (1, 2, 3), atau bullet point (-).
2. Jika user menyebut nama orang asing dalam perkenalan (contoh: Bima, Rara, dll), JANGAN ubah menjadi kosakata Jepang. Gunakan Katakana.
3. Jawab HANYA menggunakan struktur di bawah ini. Jangan tambahkan basa-basi panjang di awal atau akhir.

STRUKTUR JAWABAN WAJIB:
**📚 Kosakata**
**1. Cara Penulisan:**
- Hiragana/Katakana: [huruf kana]
- Kanji: [huruf kanji, atau tulis "Tidak ada" jika memang tidak pakai kanji]
- Arti: [terjemahan bahasa Indonesia]

**2. Bedah Kanji (atau Analisis Kata):**
- [Sebutkan kanji pembentuknya dan artinya. Jika kata tersebut tidak memiliki kanji, jelaskan jenis kata atau asal usul serapannya secara singkat.]

**3. Contoh Kalimat:**
- [Kalimat bahasa Jepang]
- [Romaji]
- [Arti bahasa Indonesia]

**4. Pola Tata Bahasa:**
- [Jelaskan pola grammar atau partikel yang digunakan pada contoh kalimat di atas. Sertakan huruf Jepang, Romaji, dan terjemahan polanya].`
                    },
                    { "role": "user", "content": req.body.message }
                ]
            })
        });

        const data = await response.json();
        res.json({ reply: data.choices[0].message.content });

    } catch (error) {
        res.status(500).json({ reply: "Koneksi terputus! 🌸" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 HikariTutor Live on port ${PORT}`));





