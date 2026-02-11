const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function signToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role, status: user.status },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

exports.register = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ ok: false, error: "Eksik alan var." });
    }

    const existing = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ ok: false, error: "Bu e-posta zaten kayıtlı." });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash)
       VALUES ($1,$2,$3)
       RETURNING id, full_name, email, role, status, created_at`,
      [full_name, email, password_hash]
    );

    return res.status(201).json({
      ok: true,
      message: "Kayıt alındı. Admin onayı bekleniyor.",
      user: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, error: "Eksik alan var." });
    }

    const result = await pool.query(
      "SELECT id, full_name, email, password_hash, role, status FROM users WHERE email=$1",
      [email]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ ok: false, error: "Hatalı e-posta veya şifre." });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ ok: false, error: "Hatalı e-posta veya şifre." });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        ok: false,
        error: `Hesap durumu: ${user.status}. Admin onayı gerekli.`,
      });
    }

    const token = signToken(user);

    return res.json({
      ok: true,
      token,
      user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role, status: user.status },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
};

exports.me = async (req, res) => {
  return res.json({ ok: true, user: req.user });
};
