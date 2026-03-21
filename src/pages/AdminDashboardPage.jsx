import { useEffect, useState } from "react";
import api from "../api/axios";
import Loader from "../components/Loader";
import { useToast } from "../context/ToastContext";
import {
  BOOK_IMAGE_FALLBACK,
  money,
  normalizeOrderStatus,
  ORDER_STATUS,
  orderStatusClass,
  orderStatusLabel,
  withImageUrl
} from "../utils/formatters";

const initialBook = {
  title: "",
  author: "",
  category: "General",
  price: "",
  stock: "",
  description: "",
  image: null
};

const AdminDashboardPage = () => {
  const toast = useToast();
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookForm, setBookForm] = useState(initialBook);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [booksRes, ordersRes, usersRes] = await Promise.all([
        api.get("/books"),
        api.get("/orders"),
        api.get("/admin/users")
      ]);
      setBooks(booksRes.data.map(withImageUrl));
      setOrders(ordersRes.data);
      setUsers(usersRes.data);
    } catch {
      toast.error("Failed to load admin dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const onBookInput = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setBookForm((prev) => ({ ...prev, image: files[0] || null }));
      return;
    }
    setBookForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetBookForm = () => {
    setBookForm(initialBook);
    setEditingId("");
  };

  const editBook = (book) => {
    setEditingId(book._id);
    setBookForm({
      title: book.title,
      author: book.author,
      category: book.category || "General",
      price: String(book.price),
      stock: String(book.stock),
      description: book.description,
      image: null
    });
  };

  const submitBook = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", bookForm.title);
      formData.append("author", bookForm.author);
      formData.append("category", bookForm.category);
      formData.append("price", bookForm.price);
      formData.append("stock", bookForm.stock);
      formData.append("description", bookForm.description);
      if (bookForm.image) {
        formData.append("image", bookForm.image);
      }

      if (editingId) {
        await api.put(`/books/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Book updated");
      } else {
        await api.post("/books", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Book created");
      }

      resetBookForm();
      fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save book");
    } finally {
      setSaving(false);
    }
  };

  const removeBook = async (id) => {
    try {
      await api.delete(`/books/${id}`);
      toast.success("Book deleted");
      fetchAll();
    } catch {
      toast.error("Failed to delete book");
    }
  };

  const changeOrderStatus = async (id, status) => {
    try {
      const { data } = await api.put(`/orders/${id}/status`, { status });
      toast.success("Order status updated");
      if (data?.notifications) {
        const { emailSent, smsSent } = data.notifications;
        toast.success(`Notifications: Email ${emailSent ? "sent" : "failed"}, SMS ${smsSent ? "sent" : "failed"}`);
      }
      fetchAll();
    } catch {
      toast.error("Failed to update order status");
    }
  };

  const deleteOrder = async (id) => {
    try {
      await api.delete(`/orders/${id}`);
      toast.success("Order deleted");
      fetchAll();
    } catch {
      toast.error("Failed to delete order");
    }
  };

  if (loading) {
    return <Loader text="Loading admin dashboard..." />;
  }

  return (
    <section className="space-y-6 page-enter">
      <h1 className="font-display text-3xl text-teal-900 sm:text-4xl">Admin Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white/95 p-4 shadow-sm">
          <p className="text-sm text-slate-500">Books</p>
          <p className="mt-1 text-3xl font-bold text-teal-800">{books.length}</p>
        </div>
        <div className="rounded-2xl bg-white/95 p-4 shadow-sm">
          <p className="text-sm text-slate-500">Orders</p>
          <p className="mt-1 text-3xl font-bold text-teal-800">{orders.length}</p>
        </div>
        <div className="rounded-2xl bg-white/95 p-4 shadow-sm">
          <p className="text-sm text-slate-500">Users</p>
          <p className="mt-1 text-3xl font-bold text-teal-800">{users.length}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1.9fr]">
        <form onSubmit={submitBook} className="space-y-3 rounded-2xl bg-white/95 p-5 shadow-lg">
          <h2 className="font-display text-2xl text-teal-900">{editingId ? "Edit Book" : "Add Book"}</h2>
          <input name="title" value={bookForm.title} onChange={onBookInput} required placeholder="Title" className="w-full rounded-xl border border-teal-200 px-3 py-2.5" />
          <input name="author" value={bookForm.author} onChange={onBookInput} required placeholder="Author" className="w-full rounded-xl border border-teal-200 px-3 py-2.5" />
          <select name="category" value={bookForm.category} onChange={onBookInput} className="w-full rounded-xl border border-teal-200 px-3 py-2.5">
            <option value="General">General</option>
            <option value="Fiction">Fiction</option>
            <option value="Non Fiction">Non Fiction</option>
            <option value="Self Help">Self Help</option>
            <option value="Biography">Biography</option>
            <option value="Academic">Academic</option>
          </select>
          <input name="price" type="number" value={bookForm.price} onChange={onBookInput} required placeholder="Price" className="w-full rounded-xl border border-teal-200 px-3 py-2.5" />
          <input name="stock" type="number" value={bookForm.stock} onChange={onBookInput} required placeholder="Stock" className="w-full rounded-xl border border-teal-200 px-3 py-2.5" />
          <textarea name="description" value={bookForm.description} onChange={onBookInput} required placeholder="Description" rows={4} className="w-full rounded-xl border border-teal-200 px-3 py-2.5" />
          <input name="image" type="file" accept="image/*" onChange={onBookInput} className="w-full rounded-xl border border-teal-200 px-3 py-2.5" />

          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white">
              {saving ? "Saving..." : editingId ? "Update Book" : "Create Book"}
            </button>
            {editingId && (
              <button type="button" onClick={resetBookForm} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="space-y-4">
          <div className="rounded-2xl bg-white/95 p-5 shadow-lg">
            <h2 className="font-display text-2xl text-teal-900">Manage Books</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {books.map((book) => (
                <article key={book._id} className="rounded-xl border border-teal-100 p-3">
                  <img
                    src={book.imageUrl}
                    alt={book.title}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = BOOK_IMAGE_FALLBACK;
                    }}
                    className="h-32 w-full rounded-lg object-cover"
                  />
                  <p className="mt-2 font-semibold text-teal-900">{book.title}</p>
                  <p className="text-xs text-teal-700">{book.category || "General"}</p>
                  <p className="text-sm text-slate-600">{money(book.price)} | Stock: {book.stock}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => editBook(book)} className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-white">
                      Edit
                    </button>
                    <button type="button" onClick={() => removeBook(book._id)} className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white">
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white/95 p-5 shadow-lg">
            <h2 className="font-display text-2xl text-teal-900">Manage Orders</h2>
            <div className="mt-4 space-y-3">
              {orders.map((order) => (
                <article key={order._id} className="rounded-xl border border-teal-100 p-3 text-sm">
                  <p className="font-semibold text-teal-900">{order.orderId} | {money(order.totalPrice)}</p>
                  <p className="text-slate-600">{order.name} ({order.phone})</p>
                  <p className="text-slate-600">{order.productName} x {order.quantity}</p>
                  <p className="text-slate-600">Payment: {order.paymentMethod} | {order.paymentStatus}</p>
                  <p className="text-slate-600">Advance: {money(order.advancePaidAmount || 0)} | COD: {money(order.codAmount || 0)}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-1 text-xs font-bold ${orderStatusClass(order.status)}`}>
                      {orderStatusLabel(order.status)}
                    </span>
                    <select
                      className="rounded-lg border border-teal-200 px-3 py-2 text-sm"
                      value={normalizeOrderStatus(order.status)}
                      onChange={(e) => changeOrderStatus(order._id, e.target.value)}
                    >
                      <option value={ORDER_STATUS.PENDING}>Pending</option>
                      <option value={ORDER_STATUS.CONFIRMED}>Confirmed</option>
                      <option value={ORDER_STATUS.OUT_FOR_DELIVERY}>Out for Delivery</option>
                      <option value={ORDER_STATUS.DELIVERED}>Delivered</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => deleteOrder(order._id)}
                      className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white/95 p-5 shadow-lg">
            <h2 className="font-display text-2xl text-teal-900">Users</h2>
            <div className="mt-4 space-y-2 text-sm">
              {users.map((user) => (
                <p key={user._id} className="rounded-lg border border-teal-100 px-3 py-2">
                  {user.name} | {user.email} | <span className="font-semibold uppercase">{user.role}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboardPage;
