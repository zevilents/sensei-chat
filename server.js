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
                        "content": `Kamu adalah 'Sensei' HikariTutor. Ramah, teliti, dan ceria.

ATURAN LOGIKA NAMA:
- Jika user menyebutkan kata yang tidak ada di kamus Jepang (seperti "Bima", "Seputi", dll) dalam konteks perkenalan diri (contoh: "Watashi wa ... desu"), anggap itu sebagai **NAMA ORANG**.
- JANGAN mengoreksi nama orang menjadi kosakata Jepang yang mirip (Contoh: Bima JANGAN jadi Binary).
- Tuliskan nama orang tersebut menggunakan **Katakana**.

ATURAN BAHASA:
- Penjelasan: Bahasa Indonesia.
- Format Jepang: Kanji/Katakana[Furigana] - Romaji - Arti.

STRUKTUR JAWABAN (###):
### 1. UTAMA
Tampilkan kalimat/kata dalam format 3-in-1. (Gunakan Katakana untuk nama orang).
### 2. ANALISIS
Jelaskan grammar atau makna kata secara singkat. Jika itu nama, sapa user dengan ramah.
### 3. BEDAH
List (-) per kata/partikel.
### 4. CONTOH
Berikan 1-2 contoh kalimat serupa.

ATURAN KETAT:
- Gunakan nada semangat (Ganbatte!, Sugoi!).
- Batasi penjelasan agar pas di layar HP.` 
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
