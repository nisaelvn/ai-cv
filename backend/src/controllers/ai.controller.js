require('dotenv').config(); 
const { GoogleGenerativeAI } = require("@google/generative-ai");
const pool = require('../config/db'); 

const API_KEY = process.env.GEMINI_API_KEY; 
if (!API_KEY) {
  throw new Error("API Key bulunamadı!");
}

const genai = new GoogleGenerativeAI(API_KEY);
const model = genai.getGenerativeModel({ 
    model: "gemini-2.5-flash", 
    generationConfig: {
        temperature: 0.3, 
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
    }
});

exports.analyzeCv = async (req, res) => {
    try {
        const { jobDescription, cvText, cvId } = req.body;

        if (!jobDescription || !cvText) {
            return res.status(400).json({ message: "Eksik veri!" });
        }

        const prompt = `
        Sen tecrübeli bir İnsan Kaynakları Uzmanısın.
        
        GÖREV: Aşağıdaki ADAY PROFİLİNİ, belirtilen POZİSYON için değerlendir.
        
        --- HEDEF POZİSYON / İLAN ---
        "${jobDescription}"
        
        --- ADAYIN CV METNİ ---
        "${cvText}"
        
        DEĞERLENDİRME RUBRİĞİ:
        - 0-30: Alakasız / 31-50: Zayıf / 51-70: Orta / 71-85: Güçlü / 86-100: Mükemmel

        ÇIKTI FORMATI (Sadece saf JSON döndür):
        {
          "uygunluk_puani": (sayı),
          "uygunluk_durumu": "...",
          "olumlu_yanlar": [...],
          "eksik_yanlar": [...],
          "kisa_ozet": "...",
          "aday_mail_taslagi": "Adaya gönderilecek nazik, profesyonel ve analize dayalı bir e-posta taslağı (Türkçe)."
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonResult = JSON.parse(cleanedText);
        
        if (cvId) {
            const prosString = JSON.stringify(jsonResult.olumlu_yanlar || []);
            const consString = JSON.stringify(jsonResult.eksik_yanlar || []);
            // 1. ADIM: Mail taslağını al
            const emailDraft = jsonResult.aday_mail_taslagi || "";

            // 2. ADIM: Sorguyu güncellenen sütunla çalıştır
            await pool.query(
                `UPDATE uploaded_cvs 
                 SET analysis_score = $1, 
                     analysis_notes = $2,
                     analysis_pros = $3, 
                     analysis_cons = $4,
                     analysis_email_draft = $5 -- Yeni sütun buraya
                 WHERE id = $6`,
                [
                    jsonResult.uygunluk_puani, 
                    jsonResult.kisa_ozet, 
                    prosString, 
                    consString, 
                    emailDraft, // 5. parametre
                    cvId        // 6. parametre
                ]
            );
            console.log(`✅ CV ID: ${cvId} mail taslağıyla birlikte kaydedildi.`);
        }

        res.status(200).json({ success: true, data: jsonResult });

    } catch (error) {
        console.error("AI Hatası:", error);
        res.status(500).json({ message: "Analiz hatası", error: error.message });
    }
};