import { useEffect, useState } from "react";
import api from "../api/axios";

export default function JobList({ selectedJobId, onSelect }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setErr("");
        setLoading(true);

        const res = await api.get("/job-posts");
        const list = res.data?.jobs || res.data; // backend bazen {jobs: []} bazen [] döndürebilir
        setJobs(Array.isArray(list) ? list : []);
      } catch (e) {
        setErr(e?.response?.data?.error || "Job posts could not be loaded.");
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  if (loading) return <p>Loading job posts...</p>;
  if (err) return <p style={{ color: "crimson" }}>{err}</p>;
  if (!jobs.length) return <p>No job post found.</p>;

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
      {jobs.map((job) => {
        const active = Number(selectedJobId) === Number(job.id);
        return (
          <div
            key={job.id}
            onClick={() => onSelect?.(job.id)}
            style={{
              padding: 10,
              borderRadius: 10,
              cursor: "pointer",
              border: "1px solid #eee",
              marginBottom: 10,
              background: active ? "#eef6ff" : "white",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <b>
                #{job.id} — {job.title}
              </b>
              <span style={{ fontSize: 12, opacity: 0.7 }}>
                {active ? "Selected" : "Click to select"}
              </span>
            </div>
            <p style={{ margin: "6px 0 0", opacity: 0.85 }}>{job.description}</p>
          </div>
        );
      })}
    </div>
  );
}