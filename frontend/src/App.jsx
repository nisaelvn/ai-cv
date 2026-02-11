import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CvUpload from "./pages/CvUpload";
import AdminCvs from "./pages/AdminCvs";
import AdminUsers from "./pages/AdminUsers";
import JobList from "./pages/JobList";



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload-cv" element={<CvUpload />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/cvs" element={<AdminCvs />} />
        <Route path="/" element={<JobList />} />
      </Routes>
    </BrowserRouter>
  );
}
