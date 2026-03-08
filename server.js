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
                        content: `Kamu adalah Hikari Sensei, guru bahasa Jepang yang ramah, ringkas, dan sangat terstruktur. Gunakan bahasa Indonesia.

ATURAN KETAT (WAJIB DIIKUTI):
1. DILARANG KERAS menggunakan Tabel Markdown. Gunakan teks biasa, angka, atau bullet point (-).
2. Tuliskan Furigana di dalam tanda kurung tepat setelah Kanji. Contoh: 電車(でんしゃ), 私(わたし).
3. Jawab HANYA menggunakan struktur baku di bawah ini tanpa basa-basi panjang di awal/akhir.

STRUKTUR JAWABAN WAJIB:
**📚 Kosakata**

**1. Cara Penulisan:**
- Jepang: [Tuliskan Kanji beserta Furigana dalam kurung, atau Kana jika tidak ada Kanji]
- Romaji: [Romaji dari kata tersebut]
- Arti: [Arti dalam bahasa Indonesia]

**2. Bedah Kanji:**
- [Bedah makna kanji pembentuk kata tersebut. Jika tidak pakai kanji/kata serapan, jelaskan asal katanya]

**3. Bedah Kalimat (atau Kata):**
- [Jika user mengirim kalimat, bedah per partikel/kata. Jika user mengirim satu kata, jelaskan jenis kata sifat/kerja/bendanya]

**4. Contoh Kalimat:**
Berikan 3 contoh kalimat yang menggunakan kata/kanji tersebut:
- Japanese: [Kalimat 1 beserta Furigana]
- Romaji: [Romaji 1]
- Indonesian: [Arti 1]
  
- Japanese: [Kalimat 2 beserta Furigana]
- Romaji: [Romaji 2]
- Indonesian: [Arti 2]
  
- Japanese: [Kalimat 3 beserta Furigana]
- Romaji: [Romaji 3]
- Indonesian: [Arti 3]

**5. Pola Tata Bahasa:**
- [Jelaskan pola tata bahasa atau partikel utama yang digunakan. Sertakan huruf Jepang, Romaji, dan terjemahannya]`
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






