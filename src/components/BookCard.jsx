import { Eye, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { BOOK_IMAGE_FALLBACK } from "../utils/formatters";

const BookCard = ({ book }) => {
  const { addToCart } = useCart();

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/60 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-56 overflow-hidden bg-teal-50">
        <img
          src={book.imageUrl}
          alt={book.title}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = BOOK_IMAGE_FALLBACK;
          }}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute right-3 top-3 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white">
          Rs {book.price}
        </span>
      </div>
      <div className="space-y-3 p-4">
        <div>
          <h3 className="line-clamp-1 font-display text-xl text-teal-900">{book.title}</h3>
          <p className="text-sm text-teal-600">by {book.author}</p>
          <p className="mt-1 inline-flex rounded-full bg-teal-100 px-2 py-1 text-xs font-bold text-teal-700">
            {book.category || "General"}
          </p>
        </div>
        <p className="line-clamp-2 text-sm text-slate-600">{book.description}</p>
        <div className="grid grid-cols-3 gap-2">
          <Link
            to={`/checkout/${book._id}`}
            className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <ShoppingBag size={16} /> Buy Now
          </Link>
          <Link
            to={`/books/${book._id}`}
            className="flex items-center justify-center gap-2 rounded-xl border border-teal-200 px-3 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
          >
            <Eye size={16} />
          </Link>
        </div>
        <button
          type="button"
          onClick={() => addToCart(book)}
          className="w-full rounded-xl border border-teal-200 px-3 py-2 text-xs font-semibold text-teal-700 transition hover:bg-teal-50"
        >
          Add to cart
        </button>
      </div>
    </article>
  );
};

export default BookCard;
