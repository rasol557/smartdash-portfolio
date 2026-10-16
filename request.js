import { randomUUID } from "node:crypto";
import {
  appOrigin,
  getPublishedContent,
  json,
  signState,
  validateGatewayConfig,
  zarinpalBase,
} from "../../server/zarinpal.js";

function readBody(body) {
  if (body && typeof body === "object") return body;
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return null;
    }
  }
  return null;
}

function finalPrice(product, now) {
  const price = Number(product?.price);
  const discount = Math.min(100, Math.max(0, Number(product?.discountPercent) || 0));
  if (!Number.isSafeInteger(price) || price <= 0) return 0;
  const end = product?.offerEnds ? new Date(product.offerEnds).getTime() : 0;
  const offerActive = discount > 0 && (!end || (Number.isFinite(end) && end > now));
  return offerActive ? Math.round(price * (1 - discount / 100)) : price;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { message: "فقط POST مجاز است." });

  const origin = appOrigin();
  if (!origin) return json(res, 503, { message: "APP_ORIGIN در تنظیمات امن هاست کامل نیست." });
  const requestOrigin = req.headers.origin;
  if (requestOrigin && requestOrigin !== origin) return json(res, 403, { message: "مبدأ درخواست مجاز نیست." });

  const body = readBody(req.body);
  if (!body) return json(res, 400, { message: "اطلاعات سفارش معتبر نیست." });
  const content = await getPublishedContent(origin);
  if (!content) return json(res, 503, { message: "محتوای منتشرشده پیدا نشد. از پنل مدیریت index.html نهایی را منتشر کن." });

  const config = validateGatewayConfig(content);
  if (!config.ready) return json(res, 503, { message: config.message });
  if (body.merchantId !== config.merchantId || Boolean(body.sandbox) !== config.sandbox)
    return json(res, 409, { message: "تنظیمات درگاه با سرور هماهنگ نیست؛ اتصال را در پنل بررسی کن." });

  const productId = typeof body.productId === "string" ? body.productId.slice(0, 100) : "";
  const product = content.products.find((item) => item.id === productId);
  if (!product) return json(res, 404, { message: "این محصول در فهرست منتشرشده پیدا نشد." });

  const priceToman = finalPrice(product, Date.now());
  const amountRial = priceToman * 10;
  if (!Number.isSafeInteger(amountRial) || amountRial < 10000)
    return json(res, 400, { message: "مبلغ محصول معتبر نیست یا از حداقل مبلغ درگاه کمتر است." });

  const phone = String(body.phone || "").replace(/[^0-9+]/g, "").slice(0, 18);
  const name = String(body.name || "").trim().replace(/[<>]/g, "").slice(0, 100);
  if (name.length < 2 || phone.replace(/\D/g, "").length < 10)
    return json(res, 400, { message: "نام و شماره تماس معتبر لازم است." });

  const orderId = randomUUID();
  const state = signState({
    orderId,
    productId,
    productTitle: String(product.title || "محصول دیجیتال").slice(0, 150),
    amountToman: priceToman,
    amountRial,
    exp: Date.now() + 30 * 60 * 1000,
  });

  const callback = new URL(`${origin}/api/zarinpal/callback`);
  callback.searchParams.set("state", state);

  const payload = {
    merchant_id: config.merchantId,
    amount: amountRial,
    currency: "IRR",
    description: `سفارش ${String(product.title || "محصول دیجیتال").slice(0, 150)} — ${orderId.slice(0, 8)}`,
    callback_url: callback.toString(),
    metadata: { mobile: phone, order_id: orderId },
  };

  try {
    const response = await fetch(`${zarinpalBase()}/pg/v4/payment/request.json`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(12000),
    });
    const result = await response.json();
    const code = Number(result?.data?.code);
    const authority = result?.data?.authority;
    if (!response.ok || code !== 100 || typeof authority !== "string") {
      return json(res, 502, {
        message: "زرین‌پال درخواست را نپذیرفت. از روش جایگزین استفاده کن.",
        providerCode: Number.isFinite(code) ? code : undefined,
      });
    }
    const host = config.sandbox ? "https://sandbox.zarinpal.com" : "https://payment.zarinpal.com";
    return json(res, 200, {
      paymentUrl: `${host}/pg/StartPay/${encodeURIComponent(authority)}`,
      orderId,
      amountToman: priceToman,
    });
  } catch {
    return json(res, 502, { message: "ارتباط با زرین‌پال برقرار نشد. روش جایگزین در دسترس است." });
  }
}