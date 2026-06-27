import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "doi-chuoi-bi-mat-nay-truoc-khi-len-production";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function signUserToken(user) {
  return jwt.sign(
    { userId: user.id, username: user.username, role: "user" },
    JWT_SECRET,
    { expiresIn: "30d" }
  );
}

export function signAdminToken() {
  return jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function checkAdminPassword(password) {
  return password === ADMIN_PASSWORD;
}
