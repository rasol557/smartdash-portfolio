import {
  appOrigin,
  getPublishedContent,
  json,
  readSignedState,
  redirect,
  validateGatewayConfig,
  zarinpalBase,
} from "../../server/zarinpal.js";

function resultUrl(origin, status, extra = {}) {
  const url = new URL("/", origin);
  url.searchParams.set("payment", status);
  for (const [key, value] of Object.entries(extra)) {
    if (value !== undefined && value !== null && String(value)) url.searchParams.set(key, String(value));
  }
  return url.toString();
}

export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { message: "فقط GET مجاز است." });
  const origin = appOrigin();
  if (!origin) return json(res, 503, { message: "APP_ORIGIN تنظیم نشده است." });

  const url = new URL(req.url, origin);
  const state = readSignedState(url.searchParams.get("state"));
  if (!state || !Number.isSafeInteger(state.amountRial) || !state.orderId)
    return redirect(res, resultUrl(origin, "failed", { reason: "invalid-state" }));

  const status = url.searchParams.get("Status");
  const authority = url.searchParams.get("Authority");
  if (status !== "OK" || !authority)
    return redirect(res, resultUrl(origin, "cancelled", { order: state.orderId }));

  const content = await getPublishedContent(origin);
  const config = validateGatewayConfig(content);
  if (!config.ready)
    return redirect(res, resultUrl(origin, "failed", { reason: "gateway-config" }));

  try {
    const response = await fetch(`${zarinpalBase()}/pg/v4/payment/verify.json`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant_id: config.merchantId,
        amount: state.amountRial,
        authority,
      }),
      signal: AbortSignal.timeout(12000),
    });
    const result = await response.json();
    const code = Number(result?.data?.code);
    if (response.ok && (code === 100 || code === 101)) {
      const refId = result?.data?.ref_id;
      return redirect(res, resultUrl(origin, "success", { ref: refId, order: state.orderId }));
    }
    return redirect(res, resultUrl(origin, "failed", { order: state.orderId }));
  } catch {
    return redirect(res, resultUrl(origin, "failed", { reason: "verify-unavailable", order: state.orderId }));
  }
}