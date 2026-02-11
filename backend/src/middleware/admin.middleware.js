exports.requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      ok: false,
      error: "Giriş gerekli"
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      ok: false,
      error: "Bu işlem sadece admin yetkisi ile yapılabilir"
    });
  }

  next();
};
