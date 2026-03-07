import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Inisialisasi Path untuk ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Melayani file statis (index.html)

// Ambil API Key dari Environment Variable Render
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Route Halaman Utama
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route Utama API Chat
app.post('/api/chat', async (req, res) => {
    try {
        // Cek apakah API Key tersedia
        if (!OPENROUTER_API_KEY) {
            return res.status(500).json({ reply: "Sistem: API Key belum diatur di server Render." });
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY.trim()}`,
                "Content-Type": "application/json",
                // Header Identitas Wajib (Penting agar tidak Error 'User not found')
                "HTTP-Referer": "https://sensei-chat.onrender.com", 
                "X-Title": "HikariTutor"
            },
            body: JSON.stringify({
                "model": "stepfun/step-3.5-flash:free",
                "messages": [
                    { 
                        "role": "system", 
                        "content": `Kamu adalah 'Sensei' dari HikariTutor, guru bahasa Jepang yang ramah, gaul, dan sangat teliti.
Tugas utamanya adalah membantu user belajar bahasa Jepang, baik itu berupa satu kata (kosakata) maupun kalimat utuh.

BAHASA PENGANTAR:
- Gunakan **Bahasa Indonesia** sebagai bahasa utama untuk penjelasan.
- Setiap unsur bahasa Jepang (Kata/Kalimat) **WAJIB** menyertakan: Kanji[Furigana], Romaji, dan Arti Bahasa Indonesia.

LOGIKA KERJA:
1. JIKA USER MENGIRIM SATU KATA (KOSAKATA):
   - Jangan menolak! Tetap bedah kata tersebut secara mendalam.
   - Jelaskan jenis katanya (Noun, Verb, Adjective, dll) dan nuansa penggunaannya.

2. JIKA USER MENGIRIM KALIMAT YANG SALAH:
   - Tambahkan bagian **🌸 KOREKSI KALIMAT** di paling atas.
   - Jelaskan letak kesalahannya (partikel/grammar) dengan lembut dan beri versi yang benar.

STRUKTUR JAWABAN WAJIB KONSISTEN:

### 1. KALIMAT / KATA UTAMA
- Tulis format: Kanji[Furigana]
- Romaji
- Arti Bahasa Indonesia

### 2. POLA / MAKNA KATA
- Jika berupa kalimat: Jelaskan grammar yang digunakan.
- Jika berupa satu kata: Jelaskan jenis kata dan cara penggunaannya dalam percakapan sehari-hari.

### 3. BEDAH UNIT
- Bedah per elemen (Kanji, Partikel, atau Akar Kata) dalam bentuk list (-).

### 4. CONTOH KALIMAT LAIN
- Berikan 2-3 contoh kalimat yang menggunakan kata/pola tersebut dengan format lengkap (Kanji[Furigana], Romaji, Arti).

ATURAN KETAT:
- Selalu gunakan nada bicara menyemangati (Sugoi!, Ganbatte ne!, Yatta!).
- JANGAN pernah meminta user mengirim kalimat lengkap jika mereka hanya mengirim satu kata.
- JANGAN membalas dengan Romaji saja atau Bahasa Jepang saja tanpa terjemahan.
- Jika user bertanya di luar bahasa Jepang, ingatkan dengan sopan dalam Bahasa Indonesia.` 
                    },
                    { "role": "user", "content": req.body.message }
                ]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            console.error("❌ OpenRouter Error:", data.error);
            return res.status(400).json({ reply: `Gomen! OpenRouter bilang: ${data.error.message}` });
        }

        res.json({ reply: data.choices[0].message.content });

    } catch (error) {
        console.error("❌ Server Error:", error);
        res.status(500).json({ reply: "Aduh! Koneksi ke otak Sensei terputus. Coba lagi ya! 🌸" });
    }
});

// Jalankan Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 HikariTutor Live on port ${PORT}`));
