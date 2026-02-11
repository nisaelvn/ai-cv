const router = require("express").Router();
const pool = require("../config/db");
const { requireAuth } = require("../middleware/auth.middleware");
const { requireAdmin } = require("../middleware/admin.middleware");

/**
 * 1) Admin - CV liste (uploaded_cvs + job_posts join)
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
        COALESCE(SUBSTRING(uc.raw_text FROM 1 FOR 1500), '') AS raw_text_preview,
        jp.title AS job_title
      FROM uploaded_cvs uc
      LEFT JOIN job_posts jp
        ON jp.id = uc.job_post_id
      ORDER BY uc.created_at DESC
    `);

    return res.json({ ok: true, cvs: result.rows });
  } catch (err) {
    console.error("GET /admin/cvs error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * 2) Admin - CV detay (preview/full)
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
        uc.raw_text,
        jp.title AS job_title
      FROM uploaded_cvs uc
      LEFT JOIN job_posts jp
        ON jp.id = uc.job_post_id
      WHERE uc.id = $1
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
        raw_text_preview: (row.raw_text || "").slice(0, 1500),
      },
    });
  } catch (err) {
    console.error("GET /admin/cvs/:id error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * 3) Admin - Pending users list
 * GET /admin/pending-users
 */
router.get("/pending-users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        u.id,
        u.full_name,
        u.email,
        u.role,
        u.status,
        u.created_at
      FROM users u
      WHERE u.status = 'pending'
      ORDER BY u.created_at DESC
    `);

    return res.json({ ok: true, users: result.rows });
  } catch (err) {
    console.error("GET /admin/pending-users error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * 4) Admin - Approve user (pending -> active)
 * PATCH /admin/approve-user/:id
 */
router.patch("/approve-user/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE users u
      SET status = 'active', updated_at = NOW()
      WHERE u.id = $1
      RETURNING u.id, u.full_name, u.email, u.role, u.status
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, error: "Kullanıcı bulunamadı" });
    }

    return res.json({ ok: true, user: result.rows[0] });
  } catch (err) {
    console.error("PATCH /admin/approve-user/:id error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * 5) Admin - Reject user (pending -> rejected)
 * PATCH /admin/reject-user/:id
 */
router.patch("/reject-user/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE users u
      SET status = 'rejected', updated_at = NOW()
      WHERE u.id = $1
      RETURNING u.id, u.full_name, u.email, u.role, u.status
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, error: "Kullanıcı bulunamadı" });
    }

    return res.json({ ok: true, user: result.rows[0] });
  } catch (err) {
    console.error("PATCH /admin/reject-user/:id error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;


