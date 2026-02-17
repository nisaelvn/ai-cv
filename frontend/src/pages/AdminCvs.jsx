import { useEffect, useState } from "react";
import api from "../api/axios";

export default function AdminCvs() {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Seçim ve Önizleme State'leri
  const [selectedId, setSelectedId] = useState(null);
  const [preview, setPreview] = useState("");

  // AI State'leri
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  // --- 1. LİSTEYİ YÜKLE ---
  const loadList = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/cvs");
      // Gelen veriyi garantiye alalım (Array mi?)
      const list = res.data?.cvs ?? res.data ?? [];
      setCvs(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error("Liste yükleme hatası:", e);
      setError("Liste yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. SEÇİLEN CV'NİN DETAYINI GETİR (GÜNCELLENDİ) ---
  const loadPreview = async (id) => {
    if (!id) return;

    setError("");
    setPreview("");
    setAiResult(null);

    const currentCvFromList = cvs.find(c => (c.id || c.cv_id) == id);

    try {
      const res = await api.get(`/admin/cvs/${id}`);
      const cvData = res.data?.cv ?? res.data ?? {};
      setPreview(cvData.raw_text_preview ?? cvData.raw_text ?? "");

      // Hafıza Özelliği: Eski analiz verilerini (Mail dahil) geri getir
      if (currentCvFromList && currentCvFromList.analysis_score) {
          setAiResult({
              uygunluk_puani: currentCvFromList.analysis_score,
              kisa_ozet: currentCvFromList.analysis_notes || "Daha önce analiz edildi.",
              uygunluk_durumu: currentCvFromList.analysis_score > 70 ? "Yüksek" : "Düşük",
              olumlu_yanlar: currentCvFromList.analysis_pros || [],
              eksik_yanlar: currentCvFromList.analysis_cons || [],
              // YENİ: Veritabanından gelen mail taslağını state'e koyuyoruz
              aday_mail_taslagi: currentCvFromList.analysis_email_draft || ""
          });
      }

    } catch (e) {
      console.error("Preview hatası:", e);
      setError("CV içeriği alınamadı.");
    }
  };
  
  // --- 3. YAPAY ZEKA ANALİZİ VE KAYIT ---
  const handleAiAnalyze = async () => {
    if (!preview || !selectedId) {
        alert("Lütfen önce listeden bir CV seçin.");
        return;
    }

    // A) Listeden doğru objeyi bul (Esnek Arama)
    const currentCv = cvs.find(c => {
        const cId = c.id || c.uploadId || c.cv_id || c.cvid;
        return cId == selectedId;
    });
    
    if (!currentCv) {
        console.error("HATA: ID Eşleşmedi. Seçilen:", selectedId, "Liste:", cvs);
        alert("Hata: Seçili CV listede bulunamadı.");
        return;
    }

    // B) Gerekli bilgileri hazırla
    const jobTitle = currentCv.job_title || "Genel Başvuru";
    // Veritabanı ID'sini al (Hangisi doluysa)
    const databaseId = currentCv.id || currentCv.uploadId || currentCv.cv_id;

    try {
      setAiLoading(true);
      
      // C) Backend'e Gönder
      const res = await api.post("/ai/analyze", {
        cvText: preview,
        jobDescription: `Pozisyon: ${jobTitle}.`,
        cvId: databaseId // <--- Veritabanı Kaydı İçin ŞART!
      });

      if (res.data.success) {
        const resultData = res.data.data;
        setAiResult(resultData);
        console.log(resultData);

        // D) Listeyi Güncelle (Sayfa yenilenmeden YEŞİL olsun)
        setCvs(prevList => prevList.map(item => {
            const itemId = item.id || item.uploadId || item.cv_id || item.cvid;
            // Yine esnek eşitlik (==) kullanıyoruz
            if (itemId == databaseId) {
                return { 
                    ...item, 
                    analysis_score: resultData.uygunluk_puani,
                    analysis_notes: resultData.kisa_ozet,
                    analysis_email_draft: resultData.aday_mail_taslagi
                };
            }
            return item;
        }));
      }
    } catch (err) {
      console.error(err);
      alert("Analiz başarısız: " + (err.response?.data?.message || err.message));
    } finally {
      setAiLoading(false);
    }
  };

  // Sayfa açılınca listeyi çek
  useEffect(() => {
    loadList();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 24,
        background: "linear-gradient(180deg, #071a33 0%, #0b2b57 55%, #071a33 100%)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        
        {/* BAŞLIK */}
        <h2 style={{ color: "#fff", margin: "0 0 14px 0" }}>
          Admin Panel - CV Yönetimi
        </h2>

        {/* HATA KUTUSU */}
        {error && (
          <div style={{ background: "#ef444433", border: "1px solid #ef4444", color: "#fff", padding: 12, borderRadius: 8, marginBottom: 14 }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 16, alignItems: "stretch", flexDirection: "row" }}>
          
          {/* --- SOL TARA (LİSTE) --- */}
          <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 14, backdropFilter: "blur(10px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ color: "#e2e8f0", fontWeight: "bold" }}>Yüklenen CV'ler</div>
              <button onClick={loadList} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white", padding: "5px 10px", borderRadius: 6, cursor: "pointer" }}>
                {loading ? "..." : "Yenile"}
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {cvs.length === 0 ? (
                <div style={{ color: "#94a3b8", textAlign: "center", padding: 20 }}>Henüz CV yüklenmemiş.</div>
              ) : (
                cvs.map((cv) => {
                  // ID Bulma (Esnek)
                  const id = cv.id ?? cv.uploadId ?? cv.cv_id ?? cv.cvid;
                  const isActive = (id == selectedId);
                  const isAnalyzed = cv.analysis_score != null; // Puanı varsa analiz edilmiştir

                  return (
                    <div
                      key={id}
                      onClick={() => { setSelectedId(id); loadPreview(id); }}
                      style={{
                        padding: 12,
                        borderRadius: 12,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        // --- RENK VE KENARLIK AYARLARI ---
                        background: isActive 
                            ? "rgba(255,255,255,0.2)" 
                            : isAnalyzed ? "rgba(16, 185, 129, 0.15)" : "rgba(255,255,255,0.05)",
                        border: isActive
                            ? "1px solid rgba(255,255,255,0.6)"
                            : isAnalyzed ? "1px solid #10b981" : "1px solid transparent",
                        // ---------------------------------
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "#fff", fontWeight: "600" }}>{cv.job_title || "Pozisyon Belirtilmemiş"}</span>
                        
                        {/* SKOR ROZETİ */}
                        {isAnalyzed && (
                            <span style={{ fontSize: 11, background: "#065f46", color: "#34d399", padding: "2px 8px", borderRadius: 99 }}>
                                Skor: {cv.analysis_score}
                            </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                        {cv.original_name || cv.file_name}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* --- SAĞ TARAF (PREVIEW & AI) --- */}
          <div style={{ flex: 1, minHeight: 500, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 14, backdropFilter: "blur(10px)", display: "flex", flexDirection: "column" }}>
            
            <h3 style={{ color: "#fff", margin: "0 0 10px 0" }}>Analiz Paneli</h3>
            
            {/* Metin Önizleme Alanı */}
            <div style={{ flex: 1, background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: 10, overflowY: "auto", maxHeight: 300, color: "#cbd5e1", fontSize: 13, whiteSpace: "pre-wrap", border: "1px solid rgba(255,255,255,0.1)" }}>
              {preview || (selectedId ? "Metin yükleniyor..." : "Listeden bir CV seçin.")}
            </div>

            {/* AI Butonu */}
            {preview && (
              <button
                onClick={handleAiAnalyze}
                disabled={aiLoading}
                style={{
                  marginTop: 16,
                  background: aiLoading ? "#475569" : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  color: "white",
                  border: "none",
                  padding: "14px",
                  borderRadius: 12,
                  fontWeight: "bold",
                  cursor: aiLoading ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                }}
              >
                {aiLoading ? "Analiz Yapılıyor..." : "✨ Yapay Zeka ile Analiz Et"}
              </button>
            )}

            {/* AI Sonuç Kutusu */}
            {aiResult && (
              <div style={{ marginTop: 16, background: "rgba(16, 185, 129, 0.1)", border: "1px solid #10b981", borderRadius: 12, padding: 16, animation: "fadeIn 0.5s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                   <strong style={{ color: "#34d399", fontSize: 18 }}>Uygunluk: %{aiResult.uygunluk_puani}</strong>
                   <span style={{ color: "#fff", background: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: 4, fontSize: 12 }}>
                     {aiResult.uygunluk_durumu}
                   </span>
                </div>
                <p style={{ color: "#e2e8f0", fontSize: 13, fontStyle: "italic" }}>
                  "{aiResult.kisa_ozet}"
                </p>

                {/* Artılar / Eksiler (Varsa Göster) */}
                {(aiResult.olumlu_yanlar?.length > 0) && (
                    <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12 }}>
                        <div style={{ background: "rgba(0,0,0,0.2)", padding: 8, borderRadius: 6 }}>
                            <div style={{ color: "#4ade80", fontWeight: "bold", marginBottom: 4 }}>✅ Artılar</div>
                            {aiResult.olumlu_yanlar.map((x, i) => <div key={i} style={{color:"#cbd5e1"}}>• {x}</div>)}
                        </div>
                        <div style={{ background: "rgba(0,0,0,0.2)", padding: 8, borderRadius: 6 }}>
                             <div style={{ color: "#f87171", fontWeight: "bold", marginBottom: 4 }}>❌ Eksiler</div>
                             {aiResult.eksik_yanlar?.map((x, i) => <div key={i} style={{color:"#cbd5e1"}}>• {x}</div>)}
                        </div>
                    </div>
                )}
                {/* --- YENİ: MAİL GÖNDERME BUTONU --- */}
    {aiResult.aday_mail_taslagi && (
      <button
        onClick={() => {
          // Backend JOIN ile gelen 'candidate_email' bilgisini alıyoruz
          const currentCv = cvs.find(c => (c.id || c.cv_id) == selectedId);
          const toEmail = currentCv?.candidate_email || ""; 
          
          const subject = encodeURIComponent("İş Başvurunuz Hakkında Güncelleme");
          const body = encodeURIComponent(aiResult.aday_mail_taslagi);
          
          window.location.href = `mailto:${toEmail}?subject=${subject}&body=${body}`;
        }}
        style={{
          marginTop: 16,
          width: "100%",
          padding: "12px",
          background: "linear-gradient(90deg, #1e40af 0%, #3b82f6 100%)",
          color: "white",
          border: "none",
          borderRadius: "10px",
          fontWeight: "bold",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8
        }}
      >
        📧 Adaya Bilgilendirme Maili Gönder
      </button>
    )}
  </div>
)}
          </div>
        </div>
      </div>
    </div>
  );
}