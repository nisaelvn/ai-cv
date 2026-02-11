const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// POST /job-posts  -> yeni ilan ekle
router.post("/", async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        ok: false,
        error: "title ve description zorunlu",
      });
    }

    const result = await pool.query(
      `INSERT INTO job_posts (title, description)
       VALUES ($1, $2)
       RETURNING id, title, description, created_at`,
      [title, description]
    );

    return res.status(201).json({ ok: true, job: result.rows[0] });
  } catch (err) {
    console.error("JOB POST CREATE ERROR:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /job-posts -> ilanları listele
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, description, created_at
       FROM job_posts
       ORDER BY created_at DESC`
    );
    return res.json({ ok: true, jobs: result.rows });
  } catch (err) {
    console.error("JOB POST LIST ERROR:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;