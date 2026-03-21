export const money = (value) => `Rs ${Number(value || 0).toFixed(2)}`;

export const BOOK_IMAGE_FALLBACK = "/book-placeholder.svg";

export const ORDER_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  SHIPPED: "SHIPPED",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED"
};

const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: "Pending",
  [ORDER_STATUS.CONFIRMED]: "Confirmed",
  [ORDER_STATUS.SHIPPED]: "Shipped",
  [ORDER_STATUS.OUT_FOR_DELIVERY]: "Out for Delivery",
  [ORDER_STATUS.DELIVERED]: "Delivered"
};

const LEGACY_STATUS_MAP = {
  pending: ORDER_STATUS.PENDING,
  confirmed: ORDER_STATUS.CONFIRMED,
  shipped: ORDER_STATUS.SHIPPED,
  out_for_delivery: ORDER_STATUS.OUT_FOR_DELIVERY,
  outfordelivery: ORDER_STATUS.OUT_FOR_DELIVERY,
  "out for delivery": ORDER_STATUS.OUT_FOR_DELIVERY,
  delivered: ORDER_STATUS.DELIVERED
};

export const normalizeOrderStatus = (status) => {
  const raw = String(status || "").trim();
  if (!raw) {
    return ORDER_STATUS.PENDING;
  }

  const upper = raw.toUpperCase();
  if (ORDER_STATUS_LABELS[upper]) {
    return upper;
  }

  return LEGACY_STATUS_MAP[raw.toLowerCase()] || ORDER_STATUS.PENDING;
};

export const orderStatusLabel = (status) => ORDER_STATUS_LABELS[normalizeOrderStatus(status)] || "Pending";

export const orderStatusClass = (status) => {
  const normalized = normalizeOrderStatus(status);

  if (normalized === ORDER_STATUS.DELIVERED) {
    return "bg-emerald-100 text-emerald-700";
  }
  if (normalized === ORDER_STATUS.OUT_FOR_DELIVERY) {
    return "bg-blue-100 text-blue-700";
  }
  if (normalized === ORDER_STATUS.SHIPPED) {
    return "bg-violet-100 text-violet-700";
  }
  if (normalized === ORDER_STATUS.CONFIRMED) {
    return "bg-cyan-100 text-cyan-700";
  }
  return "bg-amber-100 text-amber-700";
};

export const withImageUrl = (book) => {
  const base =
    import.meta.env.VITE_API_URL?.replace("/api", "") ||
    "https://micro-wala.onrender.com";

  const rawImage = String(book?.image || "").trim();
  if (!rawImage) {
    return {
      ...book,
      imageUrl: BOOK_IMAGE_FALLBACK
    };
  }

  let imageUrl = rawImage;
  if (rawImage.startsWith("http://") || rawImage.startsWith("https://")) {
    imageUrl = rawImage;
  } else if (rawImage.startsWith("/")) {
    imageUrl = `${base}${rawImage}`;
  } else {
    imageUrl = `${base}/${rawImage}`;
  }

  return {
    ...book,
    imageUrl
  };
};
