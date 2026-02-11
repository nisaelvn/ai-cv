const jwt = require("jsonwebtoken");
const pool = require("../config/db");

exports.requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) return res.status(401).json({ ok: false, error: "Token yok." });

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query(
      "SELECT id, full_name, email, role, status FROM users WHERE id=$1",
      [payload.userId]
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ ok: false, error: "Kullanıcı bulunamadı." });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, error: "Geçersiz token." });
  }
};
