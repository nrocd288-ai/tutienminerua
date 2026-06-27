import { Redis } from "@upstash/redis";

// Đọc cấu hình từ biến môi trường mà Vercel tự điền khi bạn kết nối
// Upstash Redis qua mục Storage trong dashboard (Integration tự thêm
// UPSTASH_REDIS_REST_URL và UPSTASH_REDIS_REST_TOKEN, hoặc các biến có
// tiền tố KV_ tuỳ phiên bản tích hợp).
const redis = new Redis({
  url:
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.REDIS_URL,
  token:
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.REDIS_TOKEN,
});

const KEY = {
  user: (id) => `user:${id}`,
  usernameIndex: (username) => `username:${username.toLowerCase()}`,
  userIds: "user:ids",
  nextUserId: "user:next_id",
  order: (id) => `order:${id}`,
  orderIds: "order:ids",
  userOrderIds: (userId) => `user:${userId}:order_ids`,
  nextOrderId: "order:next_id",
};

async function nextId(counterKey) {
  return redis.incr(counterKey);
}

export async function findUserByUsername(username) {
  const id = await redis.get(KEY.usernameIndex(username));
  if (!id) return null;
  return redis.get(KEY.user(id));
}

export async function findUserById(id) {
  return redis.get(KEY.user(id));
}

export async function createUser({ username, phone, passwordHash }) {
  const id = await nextId(KEY.nextUserId);
  const user = {
    id,
    username,
    phone,
    passwordHash,
    rentalDaysLeft: 0,
    rentalExpiresAt: null,
    createdAt: new Date().toISOString(),
  };
  await redis.set(KEY.user(id), user);
  await redis.set(KEY.usernameIndex(username), id);
  await redis.sadd(KEY.userIds, id);
  return user;
}

export async function updateUser(id, patch) {
  const user = await redis.get(KEY.user(id));
  if (!user) return null;
  const updated = { ...user, ...patch };
  await redis.set(KEY.user(id), updated);
  return updated;
}

export async function createOrder({ userId, username, packageDays, amount, content }) {
  const id = await nextId(KEY.nextOrderId);
  const order = {
    id,
    userId,
    username,
    packageDays,
    amount,
    content,
    status: "pending",
    createdAt: new Date().toISOString(),
    confirmedAt: null,
  };
  await redis.set(KEY.order(id), order);
  await redis.sadd(KEY.orderIds, id);
  await redis.sadd(KEY.userOrderIds(userId), id);
  return order;
}

async function getOrdersByIds(ids) {
  if (!ids || ids.length === 0) return [];
  const orders = await Promise.all(ids.map((id) => redis.get(KEY.order(id))));
  return orders
    .filter(Boolean)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function listOrdersForUser(userId) {
  const ids = await redis.smembers(KEY.userOrderIds(userId));
  return getOrdersByIds(ids);
}

export async function listAllOrders() {
  const ids = await redis.smembers(KEY.orderIds);
  return getOrdersByIds(ids);
}

export async function markOrderPaid(orderId, userId) {
  const order = await redis.get(KEY.order(orderId));
  if (!order || order.userId !== userId) return null;
  if (order.status === "pending") {
    order.status = "marked_paid";
    await redis.set(KEY.order(orderId), order);
  }
  return order;
}

export async function confirmOrder(orderId) {
  const order = await redis.get(KEY.order(orderId));
  if (!order) return null;
  if (order.status === "confirmed") return order;

  order.status = "confirmed";
  order.confirmedAt = new Date().toISOString();
  await redis.set(KEY.order(orderId), order);

  const user = await redis.get(KEY.user(order.userId));
  if (user) {
    const now = new Date();
    const currentExpiry =
      user.rentalExpiresAt && new Date(user.rentalExpiresAt) > now
        ? new Date(user.rentalExpiresAt)
        : now;
    const newExpiry = new Date(currentExpiry);
    newExpiry.setDate(newExpiry.getDate() + order.packageDays);

    user.rentalExpiresAt = newExpiry.toISOString();
    user.rentalDaysLeft = Math.ceil((newExpiry - now) / (1000 * 60 * 60 * 24));
    await redis.set(KEY.user(user.id), user);
  }

  return order;
}

export async function rejectOrder(orderId) {
  const order = await redis.get(KEY.order(orderId));
  if (!order) return null;
  order.status = "rejected";
  await redis.set(KEY.order(orderId), order);
  return order;
}
