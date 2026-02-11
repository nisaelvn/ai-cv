require('dotenv').config(); // Bunu en üste ekle
const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = process.env.GEMINI_API_KEY; 

if (!API_KEY) {
  throw new Error("API Key bulunamadı! .env dosyasına GEMINI_API_KEY ekledin mi?");
}

const genai = new GoogleGenerativeAI(API_KEY);

const model = genai.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: {
        temperature: 0.3, // Biraz esneklik iyidir (0 çok katıydı, 1 çok gevşek)
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
    }
});

exports.analyzeCv = async (req, res) => {
    try {
        const { jobDescription, cvText } = req.body;

        if (!jobDescription || !cvText) {
            return res.status(400).json({ message: "Eksik veri!" });
        }

        // Promptu "Skorlama" mantığına çevirdik (Toplama işlemi yerine)
        const prompt = `
        Sen tecrübeli bir İnsan Kaynakları Uzmanısın.
        
        GÖREV: Aşağıdaki ADAY PROFİLİNİ, belirtilen POZİSYON için değerlendir.
        
        --- HEDEF POZİSYON / İLAN ---
        "${jobDescription}"
        
        --- ADAYIN CV METNİ ---
        "${cvText}"
        
        DEĞERLENDİRME RUBRİĞİ (Buna göre puan ver):
        - 0-30: Alakasız aday (Bölüm yanlış, yetenekler tamamen farklı).
        - 31-50: Zayıf aday (Bazı terimler tutuyor ama deneyim çok yetersiz).
        - 51-70: Orta aday (Geliştirilebilir, potansiyeli var, stajyer olabilir).
        - 71-85: Güçlü aday (Aranan temel yeteneklerin çoğu var).
        - 86-100: Mükemmel aday (Tam isabet, fazlası var eksiği yok).

        ÖNEMLİ: Eğer ilan metni çok kısaysa (sadece "Frontend Developer" gibi), genel sektör standartlarına göre bu pozisyonun gerekliliklerini (React, CSS, HTML vb.) bildiğini varsayarak değerlendir.

        ÇIKTI FORMATI (Sadece saf JSON döndür):
        {
          "uygunluk_puani": (0-100 arası mantıklı bir sayı),
          "uygunluk_durumu": "Düşük / Orta / Yüksek",
          "olumlu_yanlar": ["Madde 1", "Madde 2"],
          "eksik_yanlar": ["Eksik 1", "Eksik 2"],
          "kisa_ozet": "Adayın durumunu özetleyen 2 cümle."
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Temizlik (Bazen markdown tırnakları gelir, onları siliyoruz)
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonResult = JSON.parse(text);
        
        res.status(200).json({ success: true, data: jsonResult });

    } catch (error) {
        console.error("AI Hatası:", error);
        res.status(500).json({ message: "Analiz hatası", error: error.message });
    }
};