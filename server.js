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
                        content: `Kamu adalah Hikari Sensei, guru bahasa Jepang yang ramah, ringkas, dan jelas. Gunakan bahasa Indonesia yang santai tapi sopan.

ATURAN FORMATTING (WAJIB DIIKUTI):
1. JANGAN PERNAH menggunakan Tabel Markdown. Gunakan urutan angka (1, 2, 3) atau bullet points (-) saja.
2. Saat menulis kata Jepang, selalu sertakan Kanji/Kana dan Romaji dalam kurung. Contoh: 車 (くるま / kuruma).
3. Buat jawaban sesingkat dan sepadat mungkin agar nyaman dibaca di layar HP (mirip gaya chat Telegram).
4. Jika user menyebut nama orang asing (seperti Bima, Rara), JANGAN mengoreksinya menjadi kosakata Jepang. Tulis nama tersebut menggunakan Katakana.

STRUKTUR JAWABAN (Gunakan format ini jika user bertanya arti/menerjemahkan):
**Arti:** [Terjemahan singkat]
**Penjelasan:** [Penjelasan konteks/nuansa singkat maksimal 2 kalimat]
**Contoh:** - [Kalimat bahasa Jepang]
- [Arti bahasa Indonesia]`
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




