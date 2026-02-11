import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    try {
      const res = await api.post("/auth/register", {
        full_name: fullName,
        email,
        password,
      });

      setMsg(res.data?.message || "Registration successful. Waiting for admin approval.");
      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      setError(err?.response?.data?.error || "Registration failed.");
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "80px auto", padding: 16 }}>
      <h2>Register</h2>

      {msg && <div style={{ background: "#e8ffe8", padding: 10, marginTop: 10, borderRadius: 8 }}>{msg}</div>}
      {error && <div style={{ background: "#ffe5e5", padding: 10, marginTop: 10, borderRadius: 8 }}>{error}</div>}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, marginTop: 16 }}>
        <input placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Register</button>
      </form>

      <p style={{ marginTop: 12 }}>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}

