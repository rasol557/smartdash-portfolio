import { appOrigin, getPublishedContent, json, validateGatewayConfig } from "../../server/zarinpal.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { ready: false, message: "فقط GET مجاز است." });

  const origin = appOrigin();
  const content = await getPublishedContent(origin);
  const status = validateGatewayConfig(content);
  return json(res, 200, {
    ready: status.ready,
    message: status.message,
    merchantId: status.merchantId || "",
    sandbox: status.sandbox,
    catalogPublished: Boolean(content?.products),
  });
}