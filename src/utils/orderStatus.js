export const ORDER_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED"
};

const LEGACY_STATUS_MAP = {
  pending: ORDER_STATUS.PENDING,
  shipped: ORDER_STATUS.OUT_FOR_DELIVERY,
  delivered: ORDER_STATUS.DELIVERED
};

const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: "Pending",
  [ORDER_STATUS.CONFIRMED]: "Confirmed",
  [ORDER_STATUS.OUT_FOR_DELIVERY]: "Out for Delivery",
  [ORDER_STATUS.DELIVERED]: "Delivered"
};

export const ORDER_STATUS_VALUES = Object.values(ORDER_STATUS);

export const normalizeOrderStatus = (value) => {
  const raw = String(value || "").trim();
  if (!raw) {
    return ORDER_STATUS.PENDING;
  }

  const upper = raw.toUpperCase();
  if (ORDER_STATUS_VALUES.includes(upper)) {
    return upper;
  }

  const legacy = LEGACY_STATUS_MAP[raw.toLowerCase()];
  return legacy || ORDER_STATUS.PENDING;
};

export const orderStatusLabel = (value) => {
  const normalized = normalizeOrderStatus(value);
  return ORDER_STATUS_LABELS[normalized] || ORDER_STATUS_LABELS[ORDER_STATUS.PENDING];
};