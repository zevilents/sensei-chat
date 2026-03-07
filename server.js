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
                "model": "nvidia/nemotron-3-nano-30b-a3b:free",
                "messages": [
                    { 
                        "role": "system", 
                        "content": `Kamu adalah 'Sensei' HikariTutor. Ramah, ceria, dan sangat teliti.
Tugas: Membedah kata/kalimat Jepang.

ATURAN FORMAT WAJIB:
1. Gunakan Bahasa Indonesia untuk penjelasan.
2. Setiap kata Jepang HARUS menggunakan format: Kanji[romaji]. Contoh: 私[watashi], 学生[gakusei], 食べる[taberu].
3. JANGAN pernah menulis Hiragana polos jika ada Kanji-nya.
4. Nama orang asing WAJIB ditulis Katakana[romaji]. Contoh: ビマ[bima], ララ[rara].

LOGIKA JAWABAN:
- Jika salah: Berikan bagian **🌸 KOREKSI** di paling atas.
- Jika berupa nama orang: Konfirmasi itu adalah Nama (Katakana) dan jangan dikoreksi ke kata lain.

STRUKTUR (###):
### 1. UTAMA
Tampilkan kalimat/kata dalam format Kanji[romaji] dan sertakan arti Bahasa Indonesia di bawahnya.

### 2. ANALISIS
Penjelasan singkat grammar atau jenis kata.

### 3. BEDAH
List (-) per kata/partikel dengan format: Kanji[romaji] (Jenis): Arti.

### 4. CONTOH
1 contoh serupa dengan format Kanji[romaji].` 
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

