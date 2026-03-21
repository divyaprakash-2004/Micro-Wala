import { useEffect, useState } from "react";
import api from "../api/axios";
import Loader from "../components/Loader";
import { money, orderStatusClass, orderStatusLabel } from "../utils/formatters";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/orders/mine");
        setOrders(data);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <Loader text="Loading your orders..." />;
  }

  if (!orders.length) {
    return (
      <div className="rounded-2xl bg-white/95 p-10 text-center shadow-sm">
        <h2 className="font-display text-3xl text-teal-900">No orders yet</h2>
        <p className="mt-2 text-slate-600">Once you place an order, tracking details will show here.</p>
      </div>
    );
  }

  return (
    <section className="space-y-4 page-enter">
      <h1 className="font-display text-3xl text-teal-900">My Orders</h1>

      {orders.map((order) => (
        <article key={order._id} className="rounded-2xl bg-white/95 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-slate-600">Order ID: {order.orderId || order._id}</p>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${orderStatusClass(order.status)}`}>
              {orderStatusLabel(order.status)}
            </span>
          </div>

          <div className="mt-3 grid gap-3 rounded-xl bg-teal-50 p-3 text-sm text-slate-700 sm:grid-cols-2">
            <p>
              Book: <span className="font-semibold">{order.productName}</span>
            </p>
            <p>
              Quantity: <span className="font-semibold">{order.quantity}</span>
            </p>
            <p>
              Delivery Phone: <span className="font-semibold">{order.phone}</span>
            </p>
            <p>
              Pincode: <span className="font-semibold">{order.pincode}</span>
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 border-t border-teal-100 pt-3 text-sm">
            <p>
              Payment: <span className="font-semibold">{order.paymentMethod}</span>
            </p>
            <p>
              Payment Status: <span className="font-semibold capitalize">{order.paymentStatus}</span>
            </p>
            <p>
              Advance Paid: <span className="font-semibold">{money(order.advancePaidAmount || 0)}</span>
            </p>
            <p>
              COD Remaining: <span className="font-semibold">{money(order.codAmount || 0)}</span>
            </p>
            <p>
              Total: <span className="font-semibold">{money(order.totalPrice)}</span>
            </p>
          </div>
        </article>
      ))}
    </section>
  );
};

export default OrdersPage;
