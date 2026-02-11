import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      const token = res.data?.token;

      if (!token) throw new Error("Token not received.");

      localStorage.setItem("token", token);
      navigate("/dashboard");
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Login failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "80px auto", padding: 16 }}>
      <h2>Sign In</h2>

      {error && (
        <div
          style={{
            background: "#ffe5e5",
            padding: 10,
            marginTop: 10,
            borderRadius: 8,
          }}
        >
          {error}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        style={{ display: "grid", gap: 10, marginTop: 16 }}
      >
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p style={{ marginTop: 12 }}>
        Don’t have an account?{" "}
        <Link to="/register">Create one</Link>
      </p>
    </div>
  );
}

