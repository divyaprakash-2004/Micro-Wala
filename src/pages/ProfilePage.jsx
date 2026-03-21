import { LogOut, ShieldCheck, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <section className="mx-auto max-w-xl space-y-4 page-enter">
      <div className="rounded-2xl bg-white/95 p-5 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-teal-100 p-3 text-teal-700">
            <UserRound size={18} />
          </span>
          <div>
            <h1 className="font-display text-3xl text-teal-900">My Profile</h1>
            <p className="text-sm text-slate-600">Manage account and quick actions.</p>
          </div>
        </div>

        <div className="mt-5 space-y-2 rounded-xl bg-teal-50 p-4 text-sm">
          <p>
            Name: <span className="font-semibold">{user?.name}</span>
          </p>
          <p>
            Email: <span className="font-semibold">{user?.email}</span>
          </p>
          <p>
            Role: <span className="font-semibold uppercase">{user?.role}</span>
          </p>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Link to="/orders" className="rounded-xl border border-teal-200 px-4 py-3 text-center text-sm font-semibold text-teal-700">
            View My Orders
          </Link>
          {isAdmin && (
            <Link to="/admin/dashboard" className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300 px-4 py-3 text-sm font-semibold text-amber-700">
              <ShieldCheck size={16} /> Admin Dashboard
            </Link>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white sm:col-span-2"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
