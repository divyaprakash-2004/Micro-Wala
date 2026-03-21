import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import Loader from "../components/Loader";
import { useCart } from "../context/CartContext";
import { BOOK_IMAGE_FALLBACK, money, withImageUrl } from "../utils/formatters";

const BookDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/books/${id}`);
        setBook(withImageUrl(data));
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  if (loading) {
    return <Loader text="Loading book details..." />;
  }

  if (!book) {
    return <p className="text-center text-red-600">Book not found.</p>;
  }

  return (
    <section className="grid gap-6 rounded-3xl bg-white/90 p-5 shadow-xl page-enter md:grid-cols-2 md:p-8">
      <div className="overflow-hidden rounded-2xl bg-teal-50">
        <img
          src={book.imageUrl}
          alt={book.title}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = BOOK_IMAGE_FALLBACK;
          }}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="space-y-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">Book details</p>
          <h1 className="mt-2 font-display text-3xl text-teal-900">{book.title}</h1>
          <p className="text-teal-600">by {book.author}</p>
        </div>

        <p className="rounded-xl bg-teal-50 p-4 text-sm leading-7 text-slate-700">{book.description}</p>

        <div className="flex flex-wrap items-center gap-4">
          <p className="rounded-xl bg-amber-100 px-4 py-2 text-lg font-bold text-amber-700">{money(book.price)}</p>
          <p className="text-sm font-semibold text-teal-700">Stock: {book.stock}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to={`/checkout/${book._id}`}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 font-semibold text-white transition hover:bg-emerald-700"
          >
            Buy Now
          </Link>
          <button
            type="button"
            onClick={() => addToCart(book)}
            className="rounded-xl bg-teal-700 px-5 py-2.5 font-semibold text-white transition hover:bg-teal-800"
          >
            Add to Cart
          </button>
          <button
            type="button"
            onClick={() => navigate("/cart")}
            className="rounded-xl border border-teal-200 px-5 py-2.5 font-semibold text-teal-700 transition hover:bg-teal-50"
          >
            Go to Cart
          </button>
        </div>
      </div>
    </section>
  );
};

export default BookDetailsPage;
