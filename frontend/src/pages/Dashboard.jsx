import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import CVUpload from "./CVUpload";
import JobList from "./JobList";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);

  useEffect(() => {
    const loadMe = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data?.user || res.data);
      } catch {
        localStorage.removeItem("token");
        navigate("/login");
      }
    };
    loadMe();
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const page = {
    minHeight: "100vh",
    background: "#f6f7fb",
    padding: "40px 16px",
  };

  const container = {
    maxWidth: 980,
    margin: "0 auto",
  };

  const card = {
    background: "white",
    border: "1px solid #e6e6e6",
    borderRadius: 14,
    padding: 16,
    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
  };

  const pillLink = {
    display: "inline-block",
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: 10,
    textDecoration: "none",
    background: "#fff",
  };

  const row = { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 };

  if (!user) {
    return (
      <div style={page}>
        <div style={container}>
          <div style={card}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={page}>
      <div style={container}>
        <h2 style={{ margin: "0 0 14px" }}>Dashboard</h2>

        {/* USER CARD */}
        <div style={card}>
          <div style={{ display: "grid", gap: 6 }}>
            <div><b>Full Name:</b> {user.full_name}</div>
            <div><b>Email:</b> {user.email}</div>
            <div><b>Role:</b> {user.role}</div>
            <div><b>Status:</b> {user.status}</div>
          </div>

          <div style={row}>
            <button
              onClick={logout}
              style={{
                borderRadius: 10,
                background: "#fff",
                cursor: "pointer",
              }}
            >
              Logout
            </button>

            {user.role === "admin" && (
              <>
                <Link to="/admin/cvs" style={pillLink}>CV List</Link>
                <Link to="/admin/users" style={pillLink}>Pending Users</Link>
              </>
            )}
          </div>
        </div>

        {/* JOB POSTS */}
        <div style={{ ...card, marginTop: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h3 style={{ margin: 0 }}>Job Posts</h3>
              <div style={{ opacity: 0.75, marginTop: 4 }}>
                Select a job post, then upload a CV for it.
              </div>
            </div>

            <div style={{ alignSelf: "center", opacity: 0.8 }}>
              <b>Selected Job:</b> {selectedJobId ? `#${selectedJobId}` : "None"}
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <JobList selectedJobId={selectedJobId} onSelect={setSelectedJobId} />
          </div>
        </div>
        

        {/* UPLOAD */}
        <div style={{ ...card, marginTop: 18 }}>
          <h3 style={{ margin: "0 0 10px" }}>Upload CV</h3>

          {!selectedJobId ? (
            <div style={{ opacity: 0.8 }}>
              Please select a job post above to enable CV upload.
            </div>
          ) : (
            <CVUpload jobPostId={selectedJobId} />
          )}
        </div>
      </div>
    </div>
  );
}