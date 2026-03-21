import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const AdminLoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/admin/login", form);
      login(data);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Admin login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md rounded-3xl border border-amber-100 bg-white/95 p-7 shadow-xl page-enter">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">Admin panel</p>
      <h1 className="mt-2 font-display text-3xl text-teal-900">Secure Admin Login</h1>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={onChange}
          placeholder="Admin email"
          required
          className="w-full rounded-xl border border-teal-200 px-4 py-2.5 outline-none focus:border-teal-500"
        />
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={onChange}
          placeholder="Admin password"
          required
          className="w-full rounded-xl border border-teal-200 px-4 py-2.5 outline-none focus:border-teal-500"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-amber-500 px-4 py-2.5 font-semibold text-white transition hover:bg-amber-600 disabled:opacity-70"
        >
          {loading ? "Verifying..." : "Admin Login"}
        </button>
      </form>
    </section>
  );
};

export default AdminLoginPage;
