import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(cors());
app.use(express.json());
// Melayani file index.html secara otomatis
app.use(express.static(__dirname));

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Menangani halaman utama agar tidak "Cannot GET /"
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
                // WAJIB: Agar OpenRouter tidak memberikan error "User not found"
                "HTTP-Referer": "https://sensei-chat.onrender.com",
                "X-Title": "HikariTutor"
            },
            body: JSON.stringify({
                "model": "stepfun/step-3.5-flash:free",
                "messages": [
                    { 
                        "role": "system", 
                        "content": `Kamu adalah 'Sensei' dari HikariTutor, guru bahasa Jepang yang ceria dan teliti.
                        TUGAS UTAMA:
                        1. Koreksi kalimat user jika ada kesalahan partikel atau grammar.
                        2. Bedah struktur kalimatnya menggunakan format:
                           ### 🌸 KOREKSI KALIMAT (Jika ada yang salah)
                           ### 1. KALIMAT UTAMA
                           Tulis Kanji[Furigana]. Contoh: 私[わたし]は学生[がくせい]です。
                           ### 2. POLA KALIMAT
                           ### 3. BEDAH KATA
                        3. Berikan contoh kalimat lain yang serupa. Selalu gunakan Markdown.`
                    },
                    { "role": "user", "content": req.body.message }
                ]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            console.error("OpenRouter Error:", data.error.message);
            return res.status(400).json({ reply: `Gomen! OpenRouter bilang: ${data.error.message}` });
        }

        res.json({ reply: data.choices[0].message.content });

    } catch (error) {
        res.status(500).json({ reply: "Aduh! Koneksi ke otak Sensei terputus." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌸 Sensei Live on port ${PORT}`));
