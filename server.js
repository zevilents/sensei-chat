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

// Pastikan Key ini diambil dengan benar dari Environment Render
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/chat', async (req, res) => {
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // Format Authorization sesuai standar curl yang kamu berikan
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                // Tambahkan header ini agar tidak dianggap robot anonim oleh OpenRouter
                "HTTP-Referer": "https://sensei-chat.onrender.com", 
                "X-Title": "HikariTutor"
            },
            body: JSON.stringify({
                "model": "stepfun/step-3.5-flash:free",
                "messages": [
                    { 
                        "role": "system", 
                        "content": `Kamu adalah 'Sensei' dari HikariTutor.
                        Tugasmu:
                        1. Jika input user salah, berikan ### 🌸 KOREKSI KALIMAT.
                        2. Gunakan format: ### 1. KALIMAT UTAMA (Kanji[Furigana], Romaji, Arti), ### 2. POLA KALIMAT, ### 3. BEDAH KALIMAT, ### 4. CONTOH LAIN.
                        3. Selalu ramah dan gunakan Markdown.` 
                    },
                    { "role": "user", "content": req.body.message }
                ],
                // Fitur tambahan dari model curl yang kamu temukan
                "reasoning": {
                    "enabled": true
                }
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("❌ OpenRouter Error:", data.error.message);
            return res.status(400).json({ reply: `Error: ${data.error.message}` });
        }

        res.json({ reply: data.choices[0].message.content });

    } catch (error) {
        console.error("❌ System Error:", error);
        res.status(500).json({ reply: "Koneksi terputus. Pastikan server Render sudah bangun!" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌸 HikariTutor berjalan di port ${PORT}`));
