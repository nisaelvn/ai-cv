import { useEffect, useState } from "react";
import api from "../api/axios";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const loadPending = async () => {
    setError("");
    setLoadingList(true);
    try {
      const res = await api.get("/admin/pending-users");
      setUsers(res.data?.users || []);
    } catch (e) {
      setError(e?.response?.data?.error || "Pending kullanıcılar alınamadı.");
    } finally {
      setLoadingList(false);
    }
  };

  const approve = async (id) => {
    setError("");
    setBusyId(id);
    try {
      await api.patch(`/admin/approve-user/${id}`);
      // listeden düşür
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e) {
      setError(e?.response?.data?.error || "Onaylama başarısız.");
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (id) => {
    setError("");
    setBusyId(id);
    try {
      await api.patch(`/admin/reject-user/${id}`);
      // listeden düşür
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e) {
      setError(e?.response?.data?.error || "Reddetme başarısız.");
    } finally {
      setBusyId(null);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "60px auto", padding: 16 }}>
      <h2>Admin - Pending Users</h2>

      {error && (
        <div style={{ background: "#ffe5e5", padding: 10, borderRadius: 8, marginTop: 10 }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
        <button onClick={loadPending} disabled={loadingList}>
          {loadingList ? "Loading..." : "Refresh"}
        </button>
        <span style={{ opacity: 0.7, alignSelf: "center" }}>
          Total pending: <b>{users.length}</b>
        </span>
      </div>

      <div style={{ marginTop: 16, border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
        {loadingList ? (
          <p>Loading pending users...</p>
        ) : users.length === 0 ? (
          <p>Bekleyen kullanıcı yok.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {users.map((u) => (
              <div
                key={u.id}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 10,
                  padding: 12,
                  display: "grid",
                  gap: 6,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <b>{u.full_name}</b> <span style={{ opacity: 0.7 }}>({u.email})</span>
                  </div>
                  <div style={{ opacity: 0.75, fontSize: 12 }}>
                    {u.created_at ? new Date(u.created_at).toLocaleString() : ""}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <span>
                    <b>Role:</b> {u.role}
                  </span>
                  <span>
                    <b>Status:</b> {u.status}
                  </span>
                  <span style={{ fontSize: 12, opacity: 0.7 }}>
                    <b>ID:</b> {u.id}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                  <button onClick={() => approve(u.id)} disabled={busyId === u.id}>
                    {busyId === u.id ? "..." : "Approve"}
                  </button>

                  <button onClick={() => reject(u.id)} disabled={busyId === u.id}>
                    {busyId === u.id ? "..." : "Reject"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
        Not: Bu sayfaya sadece admin erişebilir (backend requireAdmin ile korunmalı).
      </p>
    </div>
  );
}
