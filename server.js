import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors()); 
app.use(express.json());

// MASUKKAN API KEY YANG BARU DI SINI (Pastikan diapit tanda kutip)
const OPENROUTER_API_KEY = "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";

app.post('/api/chat', async (req, res) => {
    try {
        // Kita langsung tembak API OpenRouter tanpa Library SDK
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                // Kita tes pakai model Gemini yang lebih ringan dan jarang antre
                model: "stepfun/step-3.5-flash:free", 
                messages: [
                    { 
                        role: "system", 
                        content: `Kamu adalah 'Sensei' dari HikariTutor, guru bahasa Jepang yang ramah dan sangat teliti.
Tugas utamanya adalah membantu user belajar dengan cara mengoreksi dan membedah kalimat.

LOGIKA KERJA:
1. Jika user memberikan kalimat bahasa Jepang yang SALAH (salah partikel, typo kanji, atau pola kalimat tidak tepat):
   - Tambahkan bagian **KOREKSI KALIMAT** di paling atas.
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
                    { role: "user", content: req.body.message }
                ]
            })
        });

        const data = await response.json();

        // 🚨 JIKA API KEY ATAU MODEL DITOLAK, PESANNYA AKAN TAMPIL DI WEB 🚨
        if (data.error) {
            console.log("❌ ERROR DARI OPENROUTER:", data.error.message);
            return res.json({ reply: `Error dari AI: ${data.error.message}` });
        }

        // Jika berhasil, kirim jawaban AI ke HTML
        res.json({ reply: data.choices[0].message.content });

    } catch (error) {
        console.log("❌ ERROR SISTEM:", error);
        res.status(500).json({ reply: "Koneksi backend ke OpenRouter terputus." });
    }
});

// Render akan otomatis memberikan port, jika tidak ada pakai 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌸 Server jalan di port ${PORT}`));