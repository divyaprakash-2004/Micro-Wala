import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import BookCard from "../components/BookCard";
import Loader from "../components/Loader";
import { useToast } from "../context/ToastContext";
import { withImageUrl } from "../utils/formatters";

const HomePage = () => {
  const toast = useToast();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/books", {
        params: { search, category, minPrice, maxPrice }
      });
      setBooks(data.map(withImageUrl));
    } catch {
      toast.error("Unable to fetch books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const totalStock = useMemo(() => books.reduce((acc, book) => acc + book.stock, 0), [books]);

  return (
    <section className="space-y-8 page-enter">
      <div className="rounded-3xl bg-gradient-to-r from-teal-900 via-teal-700 to-emerald-600 p-6 text-white shadow-xl sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">Discover stories</p>
        <h1 className="mt-3 max-w-2xl font-display text-3xl sm:text-5xl">Your Next Favorite Book Starts Here</h1>
        <p className="mt-3 max-w-xl text-sm text-teal-50 sm:text-base">
          Explore a curated library, add to cart, pay half online using scanner, and complete remaining payment on delivery.
        </p>
      </div>

      <div className="grid gap-3 rounded-2xl border border-white/60 bg-white/90 p-3 shadow-sm sm:p-4 md:grid-cols-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title"
          className="rounded-xl border border-teal-200 px-3 py-2 outline-none focus:border-teal-500"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-teal-200 px-3 py-2 outline-none focus:border-teal-500"
        >
          <option value="">All Categories</option>
          <option value="General">General</option>
          <option value="Fiction">Fiction</option>
          <option value="Non Fiction">Non Fiction</option>
          <option value="Self Help">Self Help</option>
          <option value="Biography">Biography</option>
          <option value="Academic">Academic</option>
        </select>
        <input
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          type="number"
          placeholder="Min price"
          className="rounded-xl border border-teal-200 px-3 py-2 outline-none focus:border-teal-500"
        />
        <input
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          type="number"
          placeholder="Max price"
          className="rounded-xl border border-teal-200 px-3 py-2 outline-none focus:border-teal-500"
        />
        <button
          type="button"
          onClick={fetchBooks}
          className="rounded-xl bg-teal-700 px-3 py-2 font-semibold text-white transition hover:bg-teal-800"
        >
          Apply
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-teal-900">
        <p>
          <span className="font-bold">{books.length}</span> books available
        </p>
        <p>
          <span className="font-bold">{totalStock}</span> total stock units
        </p>
      </div>

      {loading ? (
        <Loader text="Loading books..." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {books.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      )}

      {!loading && books.length === 0 && (
        <div className="rounded-2xl border border-dashed border-teal-300 p-10 text-center text-teal-800">
          No books found. Try changing your search and filters.
        </div>
      )}
    </section>
  );
};

export default HomePage;
