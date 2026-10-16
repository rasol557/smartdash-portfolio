# SMARTDESH admin and ZarinPal setup

## Admin access

- Open `https://YOUR-DOMAIN/#admin` (replace `YOUR-DOMAIN` with the exact domain you registered).
- The initial local panel password is `1234`. Change it in **Publish & backup** before handing this device to an editor.
- Add products from **Shop & categories**. Add a category first if needed, then add the product, select an image, enter the price in Toman, discount percentage and optional local end date/time.
- Preview changes, download the updated `index.html`, and replace the deployed homepage with it.

The `index.html` filename is intentional: web hosts look for that name as the default homepage. It is not the old brand name. The visible brand, title, metadata and copy use SMARTDESH.

## Important admin limitation

This project currently keeps edits in the current browser and exports a static HTML file. Its password is only a local UI gate, not secure server-side authentication. It does not provide shared logins, roles, or a shared database. An editor working on another device must send the exported file to the site owner or be given hosting access. Do not expose the panel as a secure public CMS without adding server-side authentication and storage.

## ZarinPal

The official ZarinPal REST v4 flow uses a 36-character `merchant_id`; it does not document a separate API-key header for payment request/verify. Never place the signing secret in the admin panel, `content.json`, or browser HTML.

This project includes Vercel serverless routes under `api/zarinpal/`. For a real online payment, deploy the whole project to Vercel, not just `dist/index.html`, and add these server-side Environment Variables in Vercel Project Settings:

- `APP_ORIGIN`: the public HTTPS origin, such as `https://your-domain.example` (no trailing path).
- `ZARINPAL_MERCHANT_ID`: the merchant ID from the ZarinPal panel.
- `PAYMENT_SIGNING_SECRET`: a private random string with at least 32 characters. Keep it only in Vercel Environment Variables.
- `ZARINPAL_SANDBOX`: `true` for sandbox tests; `false` or unset for production.

Then:

1. In the site admin, open **ZarinPal & fallback**, enter the same Merchant ID and endpoint `/api/zarinpal/request`, and match the sandbox switch to `ZARINPAL_SANDBOX`.
2. Enable online payments and keep the WhatsApp/card-to-card fallback enabled.
3. Download and deploy the new `index.html` so the serverless function can read the current published product catalog and payment configuration.
4. Redeploy the Vercel project after setting environment variables.
5. Open **ZarinPal & fallback** again and run **Test secure connection**. Do not enable live payments until the check passes and a sandbox payment/callback has been tested.

The request route reads the published product price on the server and signs callback state. The callback verifies the transaction with ZarinPal before showing success. If the API is unavailable or the project is on a static-only host, the UI offers WhatsApp and card-to-card as the configured fallback. Product delivery remains a manual step; the current static site is not an inventory or digital-download fulfillment system.

Official docs:

- https://www.zarinpal.com/docs/paymentGateway/connectToGateway
- https://www.zarinpal.com/docs/paymentGateway/sandBox