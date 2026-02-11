import { useState } from "react";
import api from "../api/axios";

export default function CvUpload({ jobPostId }) {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewText, setPreviewText] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!jobPostId) {
      setMsg("Please select a job post first.");
      return;
    }
    if (!file) {
      setMsg("Please choose a PDF file.");
      return;
    }

    const form = new FormData();
    form.append("cv", file); // multer: upload.single("cv")
    form.append("job_post_id", String(jobPostId)); // backend: req.body.job_post_id

    try {
      setLoading(true);
      const res = await api.post("/cv/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      
      });
      console.log("UPLOAD RESPONSE:", res.data);
      // örnek response: { ok:true, uploadId, createdAt, fileName, ... }
      setMsg(`Uploaded ✅ (uploadId: ${res.data?.uploadId || "-"})`);
      setPreviewText(res.data?.textPreview || "");
      setFile(null);
    } catch (err) {
      const text =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Upload failed.";
      setMsg(text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
      <div style={{ marginBottom: 10, opacity: 0.9 }}>
        <b>Selected Job ID:</b> {jobPostId ? jobPostId : "None"}
      </div>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button type="submit" disabled={loading} style={{ marginLeft: 10 }}>
        {loading ? "Uploading..." : "Upload"}
      </button>

      {msg && (
        <p style={{ marginTop: 10, color: msg.includes("✅") ? "green" : "crimson" }}>
          {msg}
        </p>
      )}

      {previewText && (
        <div className="preview-box">
          <p className="preview-text">
      {previewText.slice(0, 300)}...
    </p>
  </div>
)}
      
    </form>
  );
}