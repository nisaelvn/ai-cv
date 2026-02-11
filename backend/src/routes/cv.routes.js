const router = require("express").Router();
const fs = require("fs");
const pdfParse = require("pdf-parse"); // dikkat: function olarak geliyor
const upload = require("../middleware/upload.middleware");
const { requireAuth } = require("../middleware/auth.middleware");
const pool = require("../config/db");

// CV Upload (job_post_id ile)
router.post(
  "/upload",
  requireAuth,
  upload.single("cv"),
  async (req, res) => {
    try {
      // 1) Dosya kontrolü
      if (!req.file) {
        return res.status(400).json({ ok: false, error: "No file uploaded." });
      }

      // 2) job_post_id al (form-data / body)
      //    Postman: Body -> form-data -> key: job_post_id, value: 3 (text)
      const jobPostIdRaw = req.body?.job_post_id;
      const jobPostId =
        jobPostIdRaw === undefined || jobPostIdRaw === null || jobPostIdRaw === ""
          ? null
          : Number(jobPostIdRaw);

      if (jobPostId !== null && Number.isNaN(jobPostId)) {
        return res.status(400).json({
          ok: false,
          error: "job_post_id must be a number",
        });
      }

      // 3) PDF -> text
      const pdfBuffer = fs.readFileSync(req.file.path);
      const parsed = await pdfParse(pdfBuffer);
      const rawText = parsed?.text || "";

      // 4) DB'ye kaydet (job_post_id dahil)
      const result = await pool.query(
        `
        INSERT INTO uploaded_cvs
          (user_id, job_post_id, file_name, original_name, file_path, raw_text)
        VALUES
          ($1, $2, $3, $4, $5, $6)
        RETURNING id, job_post_id, created_at
        `,
        [
          req.user.id,
          jobPostId, // null olabilir
          req.file.filename,
          req.file.originalname,
          req.file.path,
          rawText,
        ]
      );

      return res.json({
        ok: true,
        uploadId: result.rows[0].id,
        jobPostId: result.rows[0].job_post_id,
        createdAt: result.rows[0].created_at,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        textLength: rawText.length,
        textPreview: rawText.slice(0, 300),
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  }
);

module.exports = router;





