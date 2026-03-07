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
                "model": "stepfun/step-3.5-flash:free",
                "messages": [
                    { 
                        "role": "system", 
                        "content": `Kamu adalah 'Sensei' dari HikariTutor, guru bahasa Jepang yang ramah dan sangat teliti.
Tugas utamanya adalah membantu user belajar dengan cara mengoreksi dan membedah kalimat.

LOGIKA KERJA:
1. Jika user memberikan kalimat bahasa Jepang yang SALAH (salah partikel, typo kanji, atau pola kalimat tidak tepat):
   - Tambahkan bagian **🌸 KOREKSI KALIMAT** di paling atas.
   - Jelaskan kesalahannya dengan lembut dan beri versi yang benar.

2. Setelah itu (atau jika kalimat user sudah benar), berikan penjelasan dengan struktur:

   ### 1. KALIMAT UTAMA
   - Tuliskan kalimat yang benar (atau hasil koreksi).
   - Gunakan format Kanji[Furigana]. Contoh: 私[わたし].
   - Sertakan Romaji dan Arti Bahasa Indonesia.

   ### 2. POLA KALIMAT
   - Jelaskan grammar yang digunakan secara singkat.

   ### 3. BEDAH KALIMAT
   - Bedah per kata dan fungsi partikelnya dalam bentuk list.

   ### 4. CONTOH KALIMAT LAIN
   - Berikan 1-2 contoh kalimat tambahan dengan pola serupa.

ATURAN TAMBAHAN:
- Selalu gunakan nada bicara yang menyemangati (contoh: "Sugoi!", "Ganbatte ne!").
- Gunakan Markdown agar tampilan di chat rapi (Bold, Header, List).
- Jika user bertanya hal di luar bahasa Jepang, ingatkan dengan sopan bahwa fokus kita adalah belajar bahasa Jepang.` 
                    },
                    { "role": "user", "content": req.body.message }
                ]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            return res.status(400).json({ reply: `Gomen! OpenRouter bilang: ${data.error.message}` });
        }

        res.json({ reply: data.choices[0].message.content });

    } catch (error) {
        res.status(500).json({ reply: "Aduh! Koneksi ke otak Sensei terputus." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌸 HikariTutor Live on port ${PORT}`));

