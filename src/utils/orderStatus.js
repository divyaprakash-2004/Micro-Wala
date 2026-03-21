export const ORDER_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  SHIPPED: "SHIPPED",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED"
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

const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: "Pending",
  [ORDER_STATUS.CONFIRMED]: "Confirmed",
  [ORDER_STATUS.SHIPPED]: "Shipped",
  [ORDER_STATUS.OUT_FOR_DELIVERY]: "Out for Delivery",
  [ORDER_STATUS.DELIVERED]: "Delivered"
};

const ORDER_STATUS_FLOW = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.SHIPPED],
  [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.OUT_FOR_DELIVERY],
  [ORDER_STATUS.OUT_FOR_DELIVERY]: [ORDER_STATUS.DELIVERED],
  [ORDER_STATUS.DELIVERED]: []
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

export const canMoveToNextOrderStatus = (currentStatus, nextStatus) => {
  const current = normalizeOrderStatus(currentStatus);
  const next = normalizeOrderStatus(nextStatus);

  if (current === next) {
    return true;
  }

  return ORDER_STATUS_FLOW[current]?.includes(next) || false;
};