import { useEffect, useState } from "react";
import api from "../api/axios";

export default function AdminCvs() {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");

  // --- YENİ EKLENEN STATE'LER ---
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const loadList = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/cvs");
      const list = res.data?.cvs ?? res.data ?? [];
      setCvs(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Liste alınamadı");
    } finally {
      setLoading(false);
    }
  };

  const loadPreview = async (id) => {
    if (!id) {
      setError("Preview için id bulunamadı (id undefined).");
      return;
    }
    setError("");
    setPreview("");
    setAiResult(null); // Yeni CV seçince eski analizi temizle
    
    try {
      const res = await api.get(`/admin/cvs/${id}`);
      const cv = res.data?.cv ?? res.data ?? {};
      setPreview(cv.raw_text_preview ?? cv.raw_text ?? "");
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Preview alınamadı");
    }
  };

  // --- YENİ EKLENEN FONKSİYON: ANALİZ ET ---
  const handleAiAnalyze = async () => {
    if (!preview) return;

    // Listeden seçili olan CV'nin iş başlığını bulalım (Context için)
    // id eşleşmesi için tüm olası id alanlarına bakıyoruz
    const currentCv = cvs.find(c => (c.id ?? c.uploadId ?? c.upload_id ?? c.cvid) === selectedId);
    const jobTitle = currentCv?.job_title || "Genel Başvuru";

    try {
      setAiLoading(true);
      const res = await api.post("/ai/analyze", {
        cvText: preview,
        jobDescription: `Pozisyon: ${jobTitle}. (Bu aday bu pozisyon için uygun mu? Teknik yetenekleri yeterli mi? Analiz et.)`
      });

      if (res.data.success) {
        setAiResult(res.data.data);
      }
    } catch (err) {
      console.error(err);
      alert("Yapay zeka analizi başarısız oldu: " + (err.response?.data?.message || err.message));
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    loadList();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 24,
        background: "linear-gradient(180deg, #071a33 0%, #0b2b57 55%, #071a33 100%)",
        fontFamily: "sans-serif"
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ color: "#fff", margin: "0 0 14px 0" }}>
          Admin - Uploaded CVs
        </h2>

        {error && (
          <div
            style={{
              background: "#ff3b3b22",
              border: "1px solid #ff3b3b66",
              color: "#fff",
              padding: 12,
              borderRadius: 12,
              marginBottom: 14,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 16, alignItems: "stretch", flexDirection: "row" }}>
          {/* LEFT LIST */}
          <div
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 16,
              padding: 14,
              backdropFilter: "blur(6px)",
              height: "fit-content"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ color: "#fff", fontWeight: 800, marginBottom: 4 }}>
                  Latest uploads
                </div>
                <div style={{ color: "rgba(255,255,255,0.80)", fontSize: 13 }}>
                  Click a row to preview parsed text.
                </div>
              </div>

              <button
                onClick={loadList}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.25)",
                  background: "rgba(0,0,0,0.35)",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>

            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
              {cvs.length === 0 ? (
                <div style={{ color: "rgba(255,255,255,0.85)" }}>No CV uploads yet.</div>
              ) : (
                cvs.map((cv) => {
                  const id = cv.id ?? cv.uploadId ?? cv.upload_id ?? cv.cv_id ?? cv.cvid;
                  const active = selectedId === id;

                  return (
                    <div
                      key={id ?? `${cv.file_name}-${cv.created_at}`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setSelectedId(id);
                        loadPreview(id);
                      }}
                      style={{
                        padding: 12,
                        borderRadius: 14,
                        border: active
                          ? "1px solid rgba(255,255,255,0.55)"
                          : "1px solid rgba(255,255,255,0.18)",
                        background: active
                          ? "rgba(255,255,255,0.18)"
                          : "rgba(0,0,0,0.20)",
                        cursor: "pointer",
                        transition: "0.15s",
                        userSelect: "none",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <div style={{ color: "#fff", fontWeight: 800 }}>
                          {cv.job_title || "Job Post"}
                        </div>
                        <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12 }}>
                          {cv.created_at ? new Date(cv.created_at).toLocaleString() : ""}
                        </div>
                      </div>

                      <div style={{ marginTop: 6, color: "rgba(255,255,255,0.88)", fontSize: 13 }}>
                        File: {cv.original_name || cv.file_name}
                      </div>

                      <div style={{ marginTop: 6, color: "rgba(255,255,255,0.70)", fontSize: 12 }}>
                        #{id ?? "?"} — Click to preview
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT PREVIEW & AI ANALYSIS */}
          <div
            style={{
              flex: 1,
              minHeight: 460,
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 16,
              padding: 14,
              backdropFilter: "blur(6px)",
              display: "flex",
              flexDirection: "column",
              gap: 16
            }}
          >
            <div>
              <div style={{ color: "#fff", fontWeight: 800, marginBottom: 6 }}>Preview & Analysis</div>
              <div style={{ color: "rgba(255,255,255,0.80)", fontSize: 13, marginBottom: 12 }}>
                Select a CV from the list to analyze.
              </div>

              {/* RAW TEXT PREVIEW */}
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  margin: 0,
                  color: "#fff",
                  background: "rgba(0,0,0,0.38)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  borderRadius: 14,
                  padding: 12,
                  minHeight: 200,
                  maxHeight: 400,
                  overflowY: "auto",
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                {preview ||
                  (selectedId
                    ? "No parsed text found for this CV."
                    : "Waiting for selection...")}
              </pre>
            </div>

            {/* --- AI BUTTON --- */}
            {preview && (
              <button
                onClick={handleAiAnalyze}
                disabled={aiLoading}
                style={{
                  background: aiLoading 
                    ? "rgba(100, 100, 100, 0.5)" 
                    : "linear-gradient(90deg, #4f46e5 0%, #9333ea 100%)",
                  color: "white",
                  border: "none",
                  padding: "12px 20px",
                  borderRadius: "12px",
                  fontWeight: "bold",
                  fontSize: "14px",
                  cursor: aiLoading ? "not-allowed" : "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  boxShadow: "0 4px 15px rgba(147, 51, 234, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >
                {aiLoading ? (
                  <>⏳ Yapay Zeka Düşünüyor...</>
                ) : (
                  <>✨ Yapay Zeka İle Analiz Et</>
                )}
              </button>
            )}

            {/* --- AI RESULT BOX --- */}
            {aiResult && (
              <div
                style={{
                  background: "rgba(16, 185, 129, 0.1)", // Hafif yeşil transparan
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  borderRadius: 14,
                  padding: 16,
                  color: "#fff",
                  animation: "fadeIn 0.5s ease-in-out"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h3 style={{ margin: 0, color: "#34d399", fontSize: "1.2rem" }}>
                    Uygunluk Skoru: %{aiResult.uygunluk_puani}
                  </h3>
                  <span style={{ 
                    background: "#064e3b", 
                    padding: "4px 10px", 
                    borderRadius: "8px", 
                    fontSize: "0.8rem", 
                    color: "#6ee7b7",
                    border: "1px solid #34d399"
                  }}>
                    {aiResult.uygunluk_durumu}
                  </span>
                </div>

                <p style={{ lineHeight: "1.5", color: "rgba(255,255,255,0.9)", fontStyle: "italic", marginBottom: 16 }}>
                  "{aiResult.kisa_ozet}"
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {/* Artılar */}
                  <div style={{ background: "rgba(0,0,0,0.2)", padding: 10, borderRadius: 10 }}>
                    <div style={{ color: "#34d399", fontWeight: "bold", marginBottom: 6 }}>✅ Artılar</div>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.85rem", color: "rgba(255,255,255,0.8)" }}>
                      {aiResult.olumlu_yanlar?.map((item, i) => (
                        <li key={i} style={{ marginBottom: 4 }}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Eksiler */}
                  <div style={{ background: "rgba(0,0,0,0.2)", padding: 10, borderRadius: 10 }}>
                    <div style={{ color: "#f87171", fontWeight: "bold", marginBottom: 6 }}>❌ Eksikler</div>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.85rem", color: "rgba(255,255,255,0.8)" }}>
                      {aiResult.eksik_yanlar?.map((item, i) => (
                        <li key={i} style={{ marginBottom: 4 }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}