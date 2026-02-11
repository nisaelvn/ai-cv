const express = require("express");
const cors = require("cors");
const pool = require("./config/db"); // <-- DB bağlantısı

const authRoutes = require("./routes/auth.routes");
const cvRoutes = require("./routes/cv.routes");
const adminRoutes = require("./routes/admin.routes");
const jobPostsRoutes = require("./routes/jobPosts.routes");
const aiRoutes = require('./routes/ai.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log("REQ:", req.method, req.url, "CT:", req.headers["content-type"]);
  next();
});

app.use("/auth", authRoutes);
app.use("/cv", cvRoutes);
app.use("/admin", adminRoutes);
app.use("/job-posts", jobPostsRoutes);
app.use('/ai', aiRoutes);

// Sağlık kontrolü
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// DB test endpoint
app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT current_user as user, current_database() as db");
    res.json({ ok: true, ...result.rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message }); 
  }
  });

app.use((err, req, res, next) => {
  if (err && err.type === "entity.parse.failed") {
    return res.status(400).json({
      ok: false,
      error: "Invalid JSON",
      message: err.message,
    });
  }
  next(err);
});

module.exports = app;


