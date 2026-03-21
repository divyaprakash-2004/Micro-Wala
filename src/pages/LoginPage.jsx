import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = location.state?.from || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      login(data);
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md rounded-3xl bg-white/90 p-6 shadow-xl page-enter sm:p-8">
      <h1 className="font-display text-3xl text-teal-900">Welcome back</h1>
      <p className="mt-1 text-sm text-slate-600">Login to place orders and track delivery.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input
          className="w-full rounded-xl border border-teal-200 px-4 py-2.5 outline-none focus:border-teal-500"
          placeholder="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={onChange}
          required
        />
        <input
          className="w-full rounded-xl border border-teal-200 px-4 py-2.5 outline-none focus:border-teal-500"
          placeholder="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={onChange}
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-teal-700 px-4 py-2.5 font-semibold text-white transition hover:bg-teal-800 disabled:opacity-70"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>

      <p className="mt-5 text-sm text-slate-600">
        New user? <Link to="/register" className="font-bold text-teal-700">Register here</Link>
      </p>
      <p className="mt-2 text-xs text-slate-500">Admin access is restricted.</p>
    </section>
  );
};

export default LoginPage;
