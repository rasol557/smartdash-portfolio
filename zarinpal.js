import { createHmac, timingSafeEqual } from "node:crypto";

export function json(res, status, value) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(value));
}

export function appOrigin() {
  const value = process.env.APP_ORIGIN?.trim();
  if (!value) return "";
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.hostname !== "localhost") return "";
    return url.origin;
  } catch {
    return "";
  }
}

export function signState(data) {
  const secret = process.env.PAYMENT_SIGNING_SECRET;
  if (!secret || secret.length < 32) throw new Error("PAYMENT_SIGNING_SECRET must be at least 32 characters");
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function readSignedState(token) {
  const secret = process.env.PAYMENT_SIGNING_SECRET;
  if (!secret || secret.length < 32 || typeof token !== "string") return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;
  const expected = createHmac("sha256", secret).update(payload).digest();
  let actual;
  try {
    actual = Buffer.from(signature, "base64url");
  } catch {
    return null;
  }
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data.exp || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getPublishedContent(origin = appOrigin()) {
  if (!origin) return null;
  try {
    const response = await fetch(`${origin}/`, {
      cache: "no-store",
      headers: { Accept: "text/html" },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    const html = await response.text();
    const match = html.match(/<script\b[^>]*\bid=["']sd-content["'][^>]*>([\s\S]*?)<\/script>/i);
    if (!match?.[1]) return null;
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

export function zarinpalBase() {
  return process.env.ZARINPAL_SANDBOX === "true"
    ? "https://sandbox.zarinpal.com"
    : "https://payment.zarinpal.com";
}

export function validateGatewayConfig(content) {
  const merchantId = process.env.ZARINPAL_MERCHANT_ID?.trim();
  const signingSecret = process.env.PAYMENT_SIGNING_SECRET;
  const origin = appOrigin();
  const sandbox = process.env.ZARINPAL_SANDBOX === "true";
  const gateway = content?.payment;

  if (!origin) return { ready: false, message: "APP_ORIGIN با دامنه‌ی HTTPS سایت تنظیم نشده است.", merchantId, sandbox };
  if (!merchantId) return { ready: false, message: "ZARINPAL_MERCHANT_ID در متغیرهای امن هاست تنظیم نشده است.", merchantId, sandbox };
  if (!signingSecret || signingSecret.length < 32)
    return { ready: false, message: "PAYMENT_SIGNING_SECRET باید حداقل ۳۲ کاراکتر باشد.", merchantId, sandbox };
  if (!gateway) return { ready: false, message: "اطلاعات منتشرشده‌ی سایت (content) پیدا نشد؛ ابتدا از پنل فایل index.html را منتشر کن.", merchantId, sandbox };
  if (!gateway.enabled) return { ready: false, message: "پرداخت آنلاین در پنل سایت خاموش است.", merchantId, sandbox };
  if (!gateway.merchantId || gateway.merchantId !== merchantId)
    return { ready: false, message: "Merchant ID پنل سایت و متغیر امن هاست با هم یکی نیستند.", merchantId, sandbox };
  if (Boolean(gateway.sandbox) !== sandbox)
    return { ready: false, message: "حالت Sandbox پنل و تنظیم هاست با هم یکی نیستند.", merchantId, sandbox };
  return { ready: true, message: "اتصال امن آماده است.", merchantId, sandbox };
}

export function redirect(res, url) {
  res.statusCode = 302;
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Location", url);
  res.end();
}