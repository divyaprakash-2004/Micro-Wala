import { Minus, Plus, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { BOOK_IMAGE_FALLBACK, money } from "../utils/formatters";

const CartPage = () => {
  const { items, updateQuantity, removeFromCart, subTotal, shipping, total } = useCart();
  const navigate = useNavigate();

  if (!items.length) {
    return (
      <div className="rounded-2xl bg-white/90 p-10 text-center shadow-sm">
        <h2 className="font-display text-3xl text-teal-900">Your cart is empty</h2>
        <p className="mt-3 text-slate-600">Add books from the home page to continue.</p>
        <Link to="/" className="mt-6 inline-block rounded-xl bg-teal-700 px-5 py-2.5 font-semibold text-white">
          Browse Books
        </Link>
      </div>
    );
  }

  return (
    <section className="grid gap-6 pb-24 page-enter lg:grid-cols-[2fr_1fr]">
      <div className="space-y-4">
        {items.map((item) => (
          <article key={item._id} className="flex flex-col gap-4 rounded-2xl bg-white/90 p-4 shadow-sm sm:flex-row">
            <img
              src={item.imageUrl}
              alt={item.title}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = BOOK_IMAGE_FALLBACK;
              }}
              className="h-32 w-full rounded-xl object-cover sm:w-24"
            />
            <div className="flex-1">
              <h3 className="font-display text-2xl text-teal-900">{item.title}</h3>
              <p className="text-sm text-teal-600">{item.author}</p>
              <p className="mt-2 text-sm font-semibold text-slate-700">{money(item.price)}</p>
              <button
                type="button"
                onClick={() => navigate(`/checkout/${item._id}`)}
                className="mt-3 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Buy This Now
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                className="rounded-full border border-teal-200 p-2.5"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center font-semibold">{item.quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                className="rounded-full border border-teal-200 p-2.5"
              >
                <Plus size={14} />
              </button>
              <button
                type="button"
                onClick={() => removeFromCart(item._id)}
                className="ml-2 rounded-full border border-red-200 p-2.5 text-red-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </article>
        ))}
      </div>

      <aside className="h-fit rounded-2xl bg-white/95 p-5 shadow-lg">
        <h3 className="font-display text-2xl text-teal-900">Cart Summary</h3>
        <div className="mt-4 space-y-2 text-sm text-slate-700">
          <p className="flex justify-between">
            <span>Subtotal</span>
            <span>{money(subTotal)}</span>
          </p>
          <p className="flex justify-between">
            <span>Shipping</span>
            <span>{money(shipping)}</span>
          </p>
          <p className="flex justify-between border-t border-teal-100 pt-2 text-base font-bold text-teal-900">
            <span>Total</span>
            <span>{money(total)}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/checkout/${items[0]._id}`)}
          className="mt-5 hidden w-full rounded-xl bg-teal-700 px-4 py-2.5 font-semibold text-white transition hover:bg-teal-800 sm:block"
        >
          Quick Checkout
        </button>
      </aside>

      <div className="fixed inset-x-0 bottom-14 z-40 border-t border-teal-100 bg-white p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] sm:hidden">
        <button
          type="button"
          onClick={() => navigate(`/checkout/${items[0]._id}`)}
          className="w-full rounded-xl bg-teal-700 px-4 py-3 font-semibold text-white"
        >
          Quick Checkout {money(total)}
        </button>
      </div>
    </section>
  );
};

export default CartPage;
