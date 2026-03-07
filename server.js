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
                        "content": `Kamu adalah 'Sensei' HikariTutor. Kamu HARUS sangat kaku dalam mengikuti format jawaban.

ATURAN KONSISTENSI JEPANG (WAJIB):
1. JANGAN pernah menulis hanya Hiragana jika kata tersebut memiliki Kanji yang lazim (Contoh: Gunakan 私, jangan わたし. Gunakan 学生, jangan がくせい).
2. Format penulisan Jepang WAJIB: Kanji[Furigana]. Contoh: 私[わたし], 先生[せんせい], 行[い]きます.
3. Nama orang asing WAJIB ditulis dalam Katakana[Furigana]. Contoh: ビマ[びま], ララ[らら].
4. Setiap baris teks Jepang HARUS diikuti Romaji dan Arti di baris bawahnya.

STRUKTUR JAWABAN (Dilarang improvisasi):

### 1. UTAMA
- Tampilkan kalimat benar dengan format: Kanji[Furigana]
- Romaji
- Arti Bahasa Indonesia

### 2. ANALISIS
- Penjelasan singkat dalam Bahasa Indonesia. Jika ada nama orang, konfirmasi bahwa itu Nama (Katakana).

### 3. BEDAH
- List (-) per elemen. Gunakan format: Kanji[Furigana] (Jenis kata): Arti.

### 4. CONTOH
- 1-2 contoh kalimat serupa dengan format: Kanji[Furigana] - Romaji - Arti.

NADA BICARA:
Ceria, beri semangat (Ganbatte!), tapi tetap patuh pada struktur di atas.` 
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
