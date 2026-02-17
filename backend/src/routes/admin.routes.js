const router = require("express").Router();
const pool = require("../config/db");
const { requireAuth } = require("../middleware/auth.middleware");
const { requireAdmin } = require("../middleware/admin.middleware");

// --- YARDIMCI FONKSİYON: JSON PARSE GÜVENLİĞİ ---
const safeJsonParse = (str) => {
  try {
    return str ? JSON.parse(str) : [];
  } catch (e) {
    return [];
  }
};

/**
 * 1) Admin - CV liste (Kullanıcı e-postası eklendi)
 * GET /admin/cvs
 */
router.get("/cvs", requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        uc.id AS cv_id,
        uc.user_id,
        uc.job_post_id,
        uc.file_name,
        uc.original_name,
        uc.file_path,
        uc.created_at,
        uc.analysis_score, 
        uc.analysis_notes, 
        uc.analysis_pros, 
        uc.analysis_cons,
        uc.analysis_email_draft, -- <--- Yeni eklediğimiz sütun
        u.email AS candidate_email, -- <--- Users tablosundan gelen e-posta
        COALESCE(SUBSTRING(uc.raw_text FROM 1 FOR 1500), '') AS raw_text_preview,
        jp.title AS job_title
      FROM uploaded_cvs uc
      LEFT JOIN users u ON uc.user_id = u.id -- <--- E-posta için JOIN
      LEFT JOIN job_posts jp ON jp.id = uc.job_post_id
      ORDER BY uc.created_at DESC
    `);

    const processedRows = result.rows.map(row => ({
      ...row,
      id: row.cv_id,
      analysis_pros: safeJsonParse(row.analysis_pros),
      analysis_cons: safeJsonParse(row.analysis_cons)
    }));

    return res.json({ ok: true, cvs: processedRows });
  } catch (err) {
    console.error("GET /admin/cvs error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * 2) Admin - CV detay (Kullanıcı e-postası eklendi)
 * GET /admin/cvs/:id
 */
router.get("/cvs/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        uc.id AS cv_id,
        uc.user_id,
        uc.job_post_id,
        uc.file_name,
        uc.original_name,
        uc.file_path,
        uc.created_at,
        uc.analysis_score,
        uc.analysis_notes,
        uc.analysis_pros,
        uc.analysis_cons,
        uc.analysis_email_draft, -- <--- Yeni eklediğimiz sütun
        u.email AS candidate_email, -- <--- Adayın maili
        uc.raw_text,
        jp.title AS job_title
      FROM uploaded_cvs uc
      LEFT JOIN users u ON uc.user_id = u.id -- <--- JOIN
      LEFT JOIN job_posts jp ON jp.id = uc.job_post_id
      WHERE uc.id = $1 OR uc.id = $1::integer
      LIMIT 1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: "CV bulunamadı" });
    }

    const row = result.rows[0];

    return res.json({
      ok: true,
      cv: {
        ...row,
        analysis_pros: safeJsonParse(row.analysis_pros),
        analysis_cons: safeJsonParse(row.analysis_cons),
        raw_text_preview: (row.raw_text || "").slice(0, 1500),
      },
    });
  } catch (err) {
    console.error("GET /admin/cvs/:id error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * 3, 4, 5) Pending Users, Approve, Reject (Değişmedi)
 */
router.get("/pending-users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.full_name, u.email, u.role, u.status, u.created_at
      FROM users u WHERE u.status = 'pending' ORDER BY u.created_at DESC
    `);
    return res.json({ ok: true, users: result.rows });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

router.patch("/approve-user/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE users u SET status = 'active', updated_at = NOW() WHERE u.id = $1 RETURNING *`, [id]
    );
    if (result.rowCount === 0) return res.status(404).json({ ok: false, error: "Kullanıcı yok" });
    return res.json({ ok: true, user: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

router.patch("/reject-user/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE users u SET status = 'rejected', updated_at = NOW() WHERE u.id = $1 RETURNING *`, [id]
    );
    if (result.rowCount === 0) return res.status(404).json({ ok: false, error: "Kullanıcı yok" });
    return res.json({ ok: true, user: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;