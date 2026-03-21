import { CircleHelp, House, ShoppingCart, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const MobileBottomNav = () => {
  const { user } = useAuth();
  const { totalItems } = useCart();

  const itemClass = ({ isActive }) =>
    `relative flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-[11px] font-semibold transition ${
      isActive ? "bg-teal-700 text-white" : "text-teal-900"
    }`;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-teal-100 bg-white/95 px-2 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur sm:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-4 gap-1">
        <NavLink to="/" className={itemClass}>
          <House size={16} />
          Home
        </NavLink>
        <NavLink to="/cart" className={itemClass}>
          <span className="relative">
            <ShoppingCart size={16} />
            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </span>
          Cart
        </NavLink>
        <NavLink to="/contact" className={itemClass}>
          <CircleHelp size={16} />
          Contact
        </NavLink>
        <NavLink to={user ? "/profile" : "/login"} className={itemClass}>
          <User size={16} />
          Profile
        </NavLink>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
