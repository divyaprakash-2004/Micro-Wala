import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { BOOK_IMAGE_FALLBACK, money, orderStatusLabel, withImageUrl } from "../utils/formatters";

const HALF_PAYMENT_QR_IMAGE = "/half-payment-qr.jpeg";

const CheckoutPage = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: "",
    address: "",
    pincode: "",
    quantity: 1,
    paymentMethod: "HALF_QR_COD",
    transactionReference: "",
    paymentConfirmed: false
  });

  useEffect(() => {
    if (user?.name) {
      setForm((prev) => ({ ...prev, name: prev.name || user.name }));
    }
  }, [user]);

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/books/${bookId}`);
        setBook(withImageUrl(data));
      } catch {
        toast.error("Book not found");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [bookId, navigate, toast]);

  const totalPrice = useMemo(() => {
    if (!book) {
      return 0;
    }
    return Number(book.price) * Number(form.quantity || 1);
  }, [book, form.quantity]);

  const qrPayableAmount = useMemo(() => {
    if (!totalPrice) {
      return 0;
    }
    return Number((totalPrice / 2).toFixed(2));
  }, [totalPrice]);

  const codPayableAmount = useMemo(() => {
    if (!totalPrice) {
      return 0;
    }
    return Number((totalPrice - qrPayableAmount).toFixed(2));
  }, [qrPayableAmount, totalPrice]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Number(value) : value
    }));
  };

  const onPaymentConfirmedChange = (event) => {
    setForm((prev) => ({
      ...prev,
      paymentConfirmed: event.target.checked
    }));
  };

  const validate = () => {
    if (!form.name.trim()) {
      return "Please enter full name";
    }
    if (!/^\d{10}$/.test(form.phone)) {
      return "Please enter a valid 10-digit mobile number";
    }
    if (!form.address.trim() || form.address.trim().length < 12) {
      return "Please enter full delivery address";
    }
    if (!/^\d{6}$/.test(form.pincode)) {
      return "Please enter a valid 6-digit pincode";
    }
    if (!form.quantity || form.quantity < 1) {
      return "Quantity must be at least 1";
    }
    if (book && form.quantity > book.stock) {
      return `Only ${book.stock} units available`;
    }
    if (!form.transactionReference.trim()) {
      return "Please enter payment transaction reference";
    }
    if (!form.paymentConfirmed) {
      return "Please confirm that you have paid the half amount";
    }
    return null;
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    const message = validate();
    if (message) {
      toast.error(message);
      return;
    }

    setPlacing(true);
    try {
      const { data } = await api.post("/orders", {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        pincode: form.pincode.trim(),
        productId: book._id,
        quantity: Number(form.quantity),
        paymentMethod: "HALF_QR_COD",
        transactionReference: form.transactionReference.trim()
      });
      setSuccessData(data);
      toast.success("Order confirmed after half payment");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return <Loader text="Preparing checkout..." />;
  }

  if (!book) {
    return null;
  }

  if (successData?.order) {
    return (
      <section className="mx-auto max-w-xl rounded-3xl bg-white p-6 text-center shadow-xl page-enter sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">Order confirmed</p>
        <h1 className="mt-2 font-display text-4xl text-teal-900">Half payment received</h1>
        <p className="mt-3 text-sm text-slate-600">Your order ID is</p>
        <p className="mt-1 rounded-xl bg-teal-50 px-4 py-2 text-lg font-bold text-teal-800">{successData.order.orderId}</p>

        <div className="mt-5 space-y-2 rounded-2xl border border-teal-100 p-4 text-left text-sm">
          <p className="flex justify-between"><span>Book</span><span className="font-semibold">{successData.order.productName}</span></p>
          <p className="flex justify-between"><span>Quantity</span><span className="font-semibold">{successData.order.quantity}</span></p>
          <p className="flex justify-between"><span>Total</span><span className="font-semibold">{money(successData.order.totalPrice)}</span></p>
          <p className="flex justify-between"><span>Advance Paid</span><span className="font-semibold">{money(successData.order.advancePaidAmount || 0)}</span></p>
          <p className="flex justify-between"><span>COD Remaining</span><span className="font-semibold">{money(successData.order.codAmount || 0)}</span></p>
          <p className="flex justify-between"><span>Transaction Ref</span><span className="font-semibold">{successData.order.transactionReference}</span></p>
          <p className="flex justify-between"><span>Status</span><span className="font-semibold">{orderStatusLabel(successData.order.status)}</span></p>
        </div>

        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left text-sm text-emerald-900">
          <p className="mt-1">Estimated delivery: 3-5 business days</p>
        </div>

        <div className="mt-6">
          <Link to="/" className="inline-flex rounded-xl border border-teal-200 px-4 py-2.5 font-semibold text-teal-800">
            Back to Home
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-6 pb-24 page-enter lg:grid-cols-[1.7fr_1fr]">
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-white/95 p-4 shadow-lg sm:p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">Checkout</p>
          <h1 className="font-display text-3xl text-teal-900">Delivery Details</h1>
        </div>

        <input
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder="Full Name"
          className="w-full rounded-xl border border-teal-200 px-3 py-2.5 outline-none focus:border-teal-500"
          required
        />
        <input
          name="phone"
          value={form.phone}
          onChange={onChange}
          placeholder="Mobile Number"
          className="w-full rounded-xl border border-teal-200 px-3 py-2.5 outline-none focus:border-teal-500"
          required
        />
        <textarea
          name="address"
          value={form.address}
          onChange={onChange}
          rows={4}
          placeholder="Full Address"
          className="w-full rounded-xl border border-teal-200 px-3 py-2.5 outline-none focus:border-teal-500"
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            name="pincode"
            value={form.pincode}
            onChange={onChange}
            placeholder="Pincode"
            className="w-full rounded-xl border border-teal-200 px-3 py-2.5 outline-none focus:border-teal-500"
            required
          />
          <input
            name="quantity"
            type="number"
            value={form.quantity}
            min={1}
            max={book.stock}
            onChange={onChange}
            className="w-full rounded-xl border border-teal-200 px-3 py-2.5 outline-none focus:border-teal-500"
            required
          />
        </div>

        <div className="rounded-xl bg-teal-50 p-4">
          <p className="text-sm font-semibold text-teal-800">Payment Method: Half Online + COD</p>
          <div className="mt-3 grid gap-2">
            <label className="flex items-center gap-2 rounded-xl border border-teal-200 bg-white px-3 py-2 text-sm">
              <input
                type="radio"
                name="paymentMethod"
                value="HALF_QR_COD"
                checked
                readOnly
              />
              Half Online + COD
            </label>
          </div>

          <div className="mt-4 rounded-xl border border-teal-200 bg-white p-4 text-center">
            <img src={HALF_PAYMENT_QR_IMAGE} alt="Half payment QR" className="mx-auto h-44 w-44 rounded-lg object-cover" loading="lazy" />
            <p className="mt-2 text-xs text-slate-600">Scan and pay {money(qrPayableAmount)} as advance payment.</p>
            <p className="mt-1 text-xs text-slate-600">Remaining {money(codPayableAmount)} will be collected as COD.</p>
          </div>

          <input
            name="transactionReference"
            value={form.transactionReference}
            onChange={onChange}
            placeholder="Enter UPI/Txn Reference"
            className="mt-3 w-full rounded-xl border border-teal-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500"
            required
          />

          <label className="mt-3 flex items-start gap-2 rounded-xl border border-teal-200 bg-white px-3 py-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.paymentConfirmed}
              onChange={onPaymentConfirmedChange}
              className="mt-1"
            />
            I confirm that I have paid half amount using the scanner above.
          </label>
        </div>

        <button
          type="submit"
          disabled={placing}
          className="hidden w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 font-semibold text-white transition hover:bg-teal-800 disabled:opacity-70 sm:flex"
        >
          {placing ? <Loader2 size={16} className="animate-spin" /> : null}
          {placing ? "Placing Order..." : "Place Order"}
        </button>
      </form>

      <aside className="h-fit rounded-2xl bg-white/95 p-5 shadow-lg">
        <h3 className="font-display text-2xl text-teal-900">Order Summary</h3>
        <img
          src={book.imageUrl}
          alt={book.title}
          className="mt-3 h-44 w-full rounded-xl object-cover"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = BOOK_IMAGE_FALLBACK;
          }}
        />
        <p className="mt-3 font-semibold text-teal-900">{book.title}</p>
        <p className="text-sm text-teal-600">Category: {book.category || "General"}</p>
        <p className="mt-2 text-sm text-slate-700">Price: {money(book.price)}</p>
        <p className="text-sm text-slate-700">Quantity: {form.quantity}</p>
        <p className="mt-3 border-t border-teal-100 pt-3 text-lg font-bold text-teal-900">Total: {money(totalPrice)}</p>
        <p className="text-sm text-slate-700">Pay Now (Online): {money(qrPayableAmount)}</p>
        <p className="text-sm text-slate-700">Pay on Delivery: {money(codPayableAmount)}</p>
      </aside>

      <div className="fixed inset-x-0 bottom-14 z-40 border-t border-teal-100 bg-white p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] sm:hidden">
        <button
          type="button"
          onClick={onSubmit}
          disabled={placing}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 font-semibold text-white disabled:opacity-70"
        >
          {placing ? <Loader2 size={16} className="animate-spin" /> : null}
          {placing ? "Placing..." : `Place Order ${money(totalPrice)}`}
        </button>
      </div>
    </section>
  );
};

export default CheckoutPage;
