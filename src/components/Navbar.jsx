import { BookOpenText, LogOut, Menu, ShieldCheck, ShoppingCart, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(false);

  const onLogout = () => {
    logout();
    setOpenMenu(false);
    navigate("/");
  };

  const navItemClass = ({ isActive }) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition ${
      isActive ? "bg-teal-700 text-white" : "text-teal-900 hover:bg-teal-100"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-teal-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="rounded-xl bg-teal-700 p-2 text-white shadow-glow">
            <BookOpenText size={18} />
          </span>
          <div>
            <p className="font-display text-lg leading-none text-teal-900 sm:text-xl">Micro Wala</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">Book Store</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <NavLink className={navItemClass} to="/">
            Home
          </NavLink>
          <NavLink className={navItemClass} to="/contact">
            Contact
          </NavLink>
          {user && (
            <NavLink className={navItemClass} to="/orders">
              Orders
            </NavLink>
          )}
          {isAdmin && (
            <NavLink className={navItemClass} to="/admin/dashboard">
              Admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setOpenMenu((prev) => !prev)}
            className="rounded-full border border-teal-200 p-2 text-teal-900 md:hidden"
            aria-label="Toggle menu"
          >
            {openMenu ? <X size={18} /> : <Menu size={18} />}
          </button>

          <Link
            to="/cart"
            className="relative hidden rounded-full border border-teal-200 p-2 text-teal-900 transition hover:border-teal-400 hover:bg-teal-50 sm:inline-flex"
          >
            <ShoppingCart size={18} />
            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 rounded-full bg-amber-500 px-1.5 text-xs font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>

          {!user && (
            <>
              <Link to="/login" className="hidden rounded-full border border-teal-300 px-4 py-2 text-sm font-semibold text-teal-800 sm:block">
                Login
              </Link>
              <Link to="/register" className="hidden rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-glow sm:block">
                Register
              </Link>
            </>
          )}

          {user && (
            <div className="flex items-center gap-2">
              <span className="hidden rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-700 sm:flex sm:items-center sm:gap-1">
                <UserRound size={14} /> {user.name}
              </span>
              {isAdmin && <ShieldCheck className="text-amber-600" size={18} />}
              <button
                type="button"
                onClick={onLogout}
                className="hidden rounded-full border border-red-200 p-2 text-red-700 transition hover:bg-red-50 sm:block"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {openMenu && (
        <div className="border-t border-teal-100 bg-white p-4 md:hidden">
          <div className="grid gap-2">
            <NavLink onClick={() => setOpenMenu(false)} className={navItemClass} to="/">
              Home
            </NavLink>
            <NavLink onClick={() => setOpenMenu(false)} className={navItemClass} to="/cart">
              Cart ({totalItems})
            </NavLink>
            <NavLink onClick={() => setOpenMenu(false)} className={navItemClass} to="/contact">
              Contact
            </NavLink>
            <NavLink onClick={() => setOpenMenu(false)} className={navItemClass} to="/orders">
              Orders
            </NavLink>
            {user ? (
              <>
                <NavLink onClick={() => setOpenMenu(false)} className={navItemClass} to="/profile">
                  Profile
                </NavLink>
                {isAdmin && (
                  <NavLink onClick={() => setOpenMenu(false)} className={navItemClass} to="/admin/dashboard">
                    <span className="inline-flex items-center gap-1"><ShieldCheck size={14} /> Admin Panel</span>
                  </NavLink>
                )}
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700"
                >
                  <LogOut size={15} /> Logout
                </button>
              </>
            ) : (
              <>
                <NavLink onClick={() => setOpenMenu(false)} className={navItemClass} to="/login">
                  Login
                </NavLink>
                <NavLink onClick={() => setOpenMenu(false)} className={navItemClass} to="/register">
                  Register
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
