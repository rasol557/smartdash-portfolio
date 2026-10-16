import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  faNum,
  finalPrice,
  formatToman,
  isOfferActive,
  isValidPhone,
  telHref,
  toEnglishDigits,
  waLink,
  type Product,
  type SiteContent,
} from "../content";

/* ---------- شمارش معکوس ---------- */

function useNow(interval = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), interval);
    return () => window.clearInterval(t);
  }, [interval]);
  return now;
}

function Countdown({ until, now }: { until: string; now: number }) {
  const end = new Date(until).getTime();
  if (!Number.isFinite(end)) return null;
  const diff = Math.max(0, end - now);
  if (diff === 0) return <span className="cd cd-ended">پیشنهاد تمام شد</span>;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const pad = (n: number) => faNum(String(n).padStart(2, "0"));
  return (
    <span className="cd" aria-label="زمان باقی‌مانده‌ی تخفیف">
      <i>⏳</i>
      {d > 0 && (
        <b>
          {faNum(d)}
          <small>روز</small>
        </b>
      )}
      <b>
        {pad(h)}
        <small>ساعت</small>
      </b>
      <b>
        {pad(m)}
        <small>دقیقه</small>
      </b>
      <b>
        {pad(s)}
        <small>ثانیه</small>
      </b>
    </span>
  );
}

/* ---------- کارت محصول ---------- */

function ProductCard({ p, now, catName, onBuy }: { p: Product; now: number; catName: string; onBuy: (p: Product) => void }) {
  const active = isOfferActive(p, now);
  const price = finalPrice(p, now);
  return (
    <article className={`product${p.featured ? " is-featured" : ""} reveal`}>
      <div className="product-media">
        {p.image ? <img src={p.image} alt={p.title} loading="lazy" /> : <span className="product-noimg" dir="ltr">{p.en || "SD"}</span>}
        <span className="product-cat">{catName}</span>
        {p.badge && <span className="product-badge">{p.badge}</span>}
        {active && <span className="product-off">{faNum(p.discountPercent)}٪ تخفیف</span>}
        {p.featured && <span className="product-star" title="محصول ویژه">★</span>}
      </div>
      <div className="product-body">
        <span className="product-en" dir="ltr">
          {p.en}
        </span>
        <h3>{p.title}</h3>
        <p className="product-desc">{p.description}</p>
        {p.features.length > 0 && (
          <ul className="product-feats">
            {p.features.slice(0, 4).map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        )}
        {active && p.offerEnds && <Countdown until={p.offerEnds} now={now} />}
        <div className="product-price">
          {active && <s>{formatToman(p.price)}</s>}
          <b>{formatToman(price)}</b>
        </div>
        <div className="product-actions">
          <button className="btn btn-primary" onClick={() => onBuy(p)}>
            خرید و دریافت
          </button>
          {p.demoUrl && (
            <a className="btn btn-ghost" href={p.demoUrl} target="_blank" rel="noreferrer">
              دموی زنده ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

/* ---------- پنجره‌ی خرید ---------- */

function BuyModal({ p, content, onClose, notify }: { p: Product | null; content: SiteContent; onClose: () => void; notify: (m: string) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState<{ name?: string; phone?: string }>({});
  const [gatewayError, setGatewayError] = useState("");
  const [gatewayLoading, setGatewayLoading] = useState(false);
  const now = useNow(1000);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (p && !d.open) {
      setName("");
      setPhone("");
      setErr({});
      setGatewayError("");
      setGatewayLoading(false);
      d.showModal();
    } else if (!p && d.open) d.close();
  }, [p]);

  if (!p) return <dialog ref={ref} className="project-dialog" onClose={onClose} />;

  const price = finalPrice(p, now);
  const active = isOfferActive(p, now);
  const card = content.terms.cardNumber.trim();
  const payment = content.payment;

  function validateBuyer() {
    const n: typeof err = {};
    if (name.trim().length < 2) n.name = "اسمت رو بنویس.";
    if (!isValidPhone(phone)) n.phone = "شماره موبایل معتبر وارد کن.";
    setErr(n);
    return Object.keys(n).length === 0;
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!validateBuyer()) return;
    const msg = [
      `🛒 سفارش محصول — ${content.brand.first + content.brand.second}`,
      `محصول: ${p!.title}`,
      `کد: ${p!.id}`,
      `قیمت: ${formatToman(price)}${active ? ` (با ${faNum(p!.discountPercent)}٪ تخفیف)` : ""}`,
      `نام: ${name.trim()}`,
      `📞 شماره تماس: ${toEnglishDigits(phone.trim())}`,
      p!.demoUrl ? `دمو: ${p!.demoUrl}` : "",
      "روش پرداخت جایگزین: کارت‌به‌کارت / هماهنگی در واتساپ",
      "لطفاً روش پرداخت و زمان تحویل رو اعلام کنید.",
    ]
      .filter(Boolean)
      .join("\n");
    window.open(waLink(content.contact.whatsapp, msg), "_blank", "noopener,noreferrer");
    notify("سفارش در واتساپ باز شد — ارسال رو تأیید کن ✅");
  }

  async function startOnlinePayment() {
    if (!validateBuyer()) return;
    setGatewayLoading(true);
    setGatewayError("");
    try {
      const response = await fetch(payment.requestEndpoint || "/api/zarinpal/request", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          productId: p!.id,
          name: name.trim(),
          phone: toEnglishDigits(phone.trim()),
          merchantId: payment.merchantId,
          sandbox: payment.sandbox,
        }),
      });
      const result = (await response.json()) as { paymentUrl?: string; message?: string };
      if (!response.ok || !result.paymentUrl) {
        throw new Error(result.message || "درگاه آماده نیست.");
      }
      window.location.assign(result.paymentUrl);
    } catch (error) {
      setGatewayError(error instanceof Error ? error.message : "ارتباط با درگاه برقرار نشد.");
      setGatewayLoading(false);
    }
  }

  async function copyCard() {
    try {
      await navigator.clipboard.writeText(toEnglishDigits(card).replace(/\D/g, ""));
      notify("شماره کارت کپی شد ✅");
    } catch {
      notify("کپی نشد؛ دستی انتخاب کن");
    }
  }

  return (
    <dialog
      ref={ref}
      className="project-dialog buy-dialog"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="buy-title"
    >
      <div className="dialog-inner" dir="rtl">
        <div className="dialog-head">
          <div>
            <span className="dialog-kicker" dir="ltr">
              CHECKOUT
            </span>
            <h2 id="buy-title">خرید {p.title}</h2>
          </div>
          <button className="dialog-close" type="button" onClick={onClose} aria-label="بستن">
            ×
          </button>
        </div>

        <div className="buy-summary">
          {p.image && <img src={p.image} alt="" />}
          <div>
            <b>{p.title}</b>
            <span>{p.deliverables}</span>
            <div className="product-price">
              {active && <s>{formatToman(p.price)}</s>}
              <b>{formatToman(price)}</b>
            </div>
            {active && p.offerEnds && <Countdown until={p.offerEnds} now={now} />}
          </div>
        </div>

        <ol className="buy-steps">
          <li>
            <b>۱. ثبت سفارش</b> — اسم و شماره‌ت رو بنویس و بزن «ارسال سفارش»؛ پیام آماده توی واتساپ باز می‌شه.
          </li>
          <li>
            <b>۲. پرداخت</b> — {card ? "کارت‌به‌کارت به شماره‌ی زیر یا" : ""} طبق هماهنگی در واتساپ. رسید رو بفرست.
          </li>
          <li>
            <b>۳. تحویل</b> — فایل‌ها + راهنمای نصب حداکثر تا ۲۴ ساعت. نصب و شخصی‌سازی اولیه رایگانه.
          </li>
        </ol>

        {card && (
          <div className="card-box" dir="ltr">
            <span>{card}</span>
            <small dir="rtl">به نام {content.terms.cardOwner}</small>
            <button type="button" className="btn btn-ghost" onClick={copyCard}>
              کپی
            </button>
          </div>
        )}

        {gatewayError && (
          <div className="gateway-fallback" role="alert">
            <b>زرین‌پال فعلاً در دسترس نیست.</b>
            <span>{gatewayError}</span>
            {payment.fallbackNote && <small>{payment.fallbackNote}</small>}
          </div>
        )}

        <form className="project-form" onSubmit={submit} noValidate>
          <div className="form-2col">
            <div className="field">
              <label htmlFor="buy-name">
                نام <span>*</span>
              </label>
              <input id="buy-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="نام و نام خانوادگی" aria-invalid={Boolean(err.name)} />
              {err.name && <span className="field-error">{err.name}</span>}
            </div>
            <div className="field">
              <label htmlFor="buy-phone">
                شماره تماس <span>*</span>
              </label>
              <input id="buy-phone" type="tel" dir="ltr" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0912 345 6789" aria-invalid={Boolean(err.phone)} />
              {err.phone && <span className="field-error">{err.phone}</span>}
            </div>
          </div>
          <div className="form-actions">
            <a className="btn btn-ghost" href={telHref(content.contact.phoneRaw)}>
              تماس: {content.contact.phoneDisplay}
            </a>
            {payment.enabled && (
              <button className="btn btn-primary" type="button" disabled={gatewayLoading} onClick={startOnlinePayment}>
                {gatewayLoading ? "در حال اتصال به درگاه…" : "پرداخت امن زرین‌پال"}
              </button>
            )}
            {(!payment.enabled || payment.fallbackEnabled) && (
              <button className="btn btn-whatsapp" type="submit">
                {payment.enabled ? "روش جایگزین: واتساپ" : "ثبت سفارش در واتساپ"}
              </button>
            )}
          </div>
          <p className="privacy-note">با ثبت سفارش، شرایط فروش محصولات دیجیتال (عدم بازگشت وجه پس از تحویل فایل) را می‌پذیری. پشتیبانی نصب طبق توضیح هر محصول ارائه می‌شود. {payment.fallbackEnabled && payment.fallbackNote}</p>
        </form>
      </div>
    </dialog>
  );
}

/* ---------- بخش فروشگاه ---------- */

export function Shop({ content, notify }: { content: SiteContent; notify: (m: string) => void }) {
  const [cat, setCat] = useState("all");
  const [buying, setBuying] = useState<Product | null>(null);
  const now = useNow(1000);
  const cats = content.productCategories;
  const catName = (id: string) => cats.find((c) => c.id === id)?.name ?? "";

  const list = useMemo(() => {
    const items = cat === "all" ? content.products : content.products.filter((p) => p.category === cat);
    return [...items].sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [cat, content.products]);

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    content.products.forEach((p) => (m[p.category] = (m[p.category] ?? 0) + 1));
    return m;
  }, [content.products]);

  if (content.products.length === 0) return null;

  return (
    <>
      <div className="shop-filters reveal" role="tablist" aria-label="دسته‌بندی محصولات">
        <button role="tab" aria-selected={cat === "all"} className={cat === "all" ? "is-on" : ""} onClick={() => setCat("all")}>
          همه <small>{faNum(content.products.length)}</small>
        </button>
        {cats.map((c) => (
          <button key={c.id} role="tab" aria-selected={cat === c.id} className={cat === c.id ? "is-on" : ""} onClick={() => setCat(c.id)}>
            <i>{c.icon}</i> {c.name} <small>{faNum(counts[c.id] ?? 0)}</small>
          </button>
        ))}
      </div>

      <div className="products-grid" key={cat}>
        {list.map((p) => (
          <ProductCard key={p.id} p={p} now={now} catName={catName(p.category)} onBuy={setBuying} />
        ))}
        {list.length === 0 && <p className="shop-empty">هنوز محصولی در این دسته ثبت نشده.</p>}
      </div>

      {content.shopNote && (
        <p className="work-note reveal">
          <span className="note-mark">*</span> {content.shopNote}
        </p>
      )}

      <BuyModal p={buying} content={content} onClose={() => setBuying(null)} notify={notify} />
    </>
  );
}
