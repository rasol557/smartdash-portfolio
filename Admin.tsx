import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import {
  DEFAULT_CONTENT,
  clearDraft,
  exportHtml,
  exportJson,
  fileToDataUrl,
  getPassword,
  isLoggedIn,
  mergeContent,
  setLoggedIn,
  setPassword,
  uid,
  formatToman,
  type Faq,
  type Heading,
  type Plan,
  type Product,
  type ProductCategory,
  type Project,
  type Service,
  type SiteContent,
  type SalesObjective,
  type Step,
  type SupportItem,
  type TermStep,
} from "../content";

interface Props {
  content: SiteContent;
  onChange: (next: SiteContent) => void;
  onClose: () => void;
  notify: (msg: string) => void;
  hasDraft: boolean;
}

type Tab =
  | "publish"
  | "brand"
  | "nav"
  | "hero"
  | "services"
  | "shop"
  | "projects"
  | "support"
  | "terms"
  | "about"
  | "process"
  | "pricing"
  | "faq"
  | "contact"
  | "payment"
  | "sales"
  | "theme";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "publish", label: "انتشار و پشتیبان", icon: "🚀" },
  { id: "brand", label: "برند و عنوان سایت", icon: "✦" },
  { id: "nav", label: "منوی هدر", icon: "☰" },
  { id: "hero", label: "بخش اول (هیرو)", icon: "🎯" },
  { id: "services", label: "خدمات", icon: "🧩" },
  { id: "shop", label: "فروشگاه و دسته‌بندی", icon: "🛒" },
  { id: "projects", label: "نمونه‌کارها", icon: "🖼️" },
  { id: "support", label: "پشتیبانی و تولید محتوا", icon: "🛠️" },
  { id: "terms", label: "قرارداد و پرداخت", icon: "📜" },
  { id: "about", label: "درباره من", icon: "👤" },
  { id: "process", label: "روش کار", icon: "🪜" },
  { id: "pricing", label: "تعرفه و قیمت‌ها", icon: "💰" },
  { id: "faq", label: "سوالات پرتکرار", icon: "❓" },
  { id: "contact", label: "تماس، فرم و فوتر", icon: "📞" },
  { id: "payment", label: "زرین‌پال و روش جایگزین", icon: "💳" },
  { id: "sales", label: "دستیار فروش (AI)", icon: "🤖" },
  { id: "theme", label: "رنگ‌ها و انیمیشن", icon: "🎨" },
];

function toLocalInput(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
function fromLocalInput(v: string): string {
  if (!v) return "";
  const d = new Date(v);
  return Number.isFinite(d.getTime()) ? d.toISOString() : "";
}

const ICONS = ["globe", "bag", "rocket", "calendar", "chart", "shield", "pen", "phone", "star", "camera", "code", "heart"];

/* ---------- Generic fields ---------- */

function Field({
  label,
  value,
  onChange,
  dir,
  hint,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  dir?: "ltr" | "rtl";
  hint?: string;
  type?: string;
}) {
  return (
    <label className="ad-field">
      <span>{label}</span>
      <input type={type} value={value} dir={dir} onChange={(e) => onChange(e.target.value)} />
      {hint && <small>{hint}</small>}
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
  rows = 3,
  hint,
  dir,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <label className="ad-field">
      <span>{label}</span>
      <textarea rows={rows} value={value} dir={dir} onChange={(e) => onChange(e.target.value)} />
      {hint && <small>{hint}</small>}
    </label>
  );
}

function Lines({
  label,
  value,
  onChange,
  hint,
  dir,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  hint?: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <Area
      label={label}
      rows={Math.max(3, value.length + 1)}
      value={value.join("\n")}
      dir={dir}
      hint={hint ?? "هر خط = یک مورد"}
      onChange={(v) => onChange(v.split("\n").map((s) => s.trim()).filter(Boolean))}
    />
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="ad-toggle">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
      <i />
      <span>{label}</span>
    </label>
  );
}

function Card({ title, children, actions }: { title: string; children: ReactNode; actions?: ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className={`ad-card${open ? " is-open" : ""}`}>
      <div className="ad-card-head">
        <button type="button" className="ad-card-title" onClick={() => setOpen((o) => !o)}>
          <i>{open ? "▾" : "▸"}</i>
          {title || "بدون عنوان"}
        </button>
        <div className="ad-card-actions">{actions}</div>
      </div>
      {open && <div className="ad-card-body">{children}</div>}
    </div>
  );
}

function ListEditor<T>({
  items,
  onChange,
  title,
  render,
  create,
  addLabel,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  title: (item: T, i: number) => string;
  render: (item: T, update: (patch: Partial<T>) => void, i: number) => ReactNode;
  create: () => T;
  addLabel: string;
}) {
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }
  return (
    <div className="ad-list">
      {items.map((item, i) => (
        <Card
          key={i}
          title={`${i + 1}. ${title(item, i)}`}
          actions={
            <>
              <button type="button" title="بالا" onClick={() => move(i, -1)} disabled={i === 0}>
                ↑
              </button>
              <button type="button" title="پایین" onClick={() => move(i, 1)} disabled={i === items.length - 1}>
                ↓
              </button>
              <button
                type="button"
                className="danger"
                title="حذف"
                onClick={() => {
                  if (confirm("این مورد حذف شود؟")) onChange(items.filter((_, k) => k !== i));
                }}
              >
                ✕
              </button>
            </>
          }
        >
          {render(item, (patch) => onChange(items.map((it, k) => (k === i ? { ...it, ...patch } : it))), i)}
        </Card>
      ))}
      <button type="button" className="ad-add" onClick={() => onChange([...items, create()])}>
        ＋ {addLabel}
      </button>
    </div>
  );
}

function HeadingEditor({ value, onChange }: { value: Heading; onChange: (h: Heading) => void }) {
  const u = (p: Partial<Heading>) => onChange({ ...value, ...p });
  return (
    <div className="ad-grid-2">
      <Field label="برچسب کوچک (فارسی)" value={value.eyebrow} onChange={(v) => u({ eyebrow: v })} />
      <Field label="برچسب انگلیسی" value={value.en} dir="ltr" onChange={(v) => u({ en: v })} />
      <Field label="عنوان — قبل از رنگی" value={value.before} onChange={(v) => u({ before: v })} />
      <Field label="عنوان — بخش رنگی" value={value.highlight} onChange={(v) => u({ highlight: v })} />
      <Field label="عنوان — بعد از رنگی" value={value.after} onChange={(v) => u({ after: v })} />
      <Area label="توضیح زیر عنوان" value={value.sub} onChange={(v) => u({ sub: v })} rows={2} />
    </div>
  );
}

function ImagePicker({
  value,
  onChange,
  notify,
}: {
  value: string;
  onChange: (v: string) => void;
  notify: (m: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  async function pick(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const url = await fileToDataUrl(f);
      onChange(url);
      notify("عکس اضافه شد ✅ (داخل سایت ذخیره می‌شود)");
    } catch (err) {
      notify(err instanceof Error ? err.message : "خطا در خواندن عکس");
    }
    e.target.value = "";
  }
  return (
    <div className="ad-image">
      <div className="ad-image-preview">{value ? <img src={value} alt="" /> : <span>بدون عکس</span>}</div>
      <div className="ad-image-controls">
        <Field label="آدرس عکس (URL)" value={value.startsWith("data:") ? "" : value} dir="ltr" onChange={onChange} hint={value.startsWith("data:") ? "عکس از دستگاه شما داخل سایت ذخیره شده" : "یا از دستگاه انتخاب کن ↓"} />
        <div className="ad-row">
          <button type="button" className="ad-btn" onClick={() => ref.current?.click()}>
            📁 انتخاب عکس از دستگاه
          </button>
          {value && (
            <button type="button" className="ad-btn ghost" onClick={() => onChange("")}>
              حذف عکس
            </button>
          )}
        </div>
        <input ref={ref} type="file" accept="image/*" hidden onChange={pick} />
      </div>
    </div>
  );
}

/* ---------- Login ---------- */

function Login({ onOk }: { onOk: () => void }) {
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  return (
    <div className="ad-login">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (p === getPassword()) {
            setLoggedIn(true);
            onOk();
          } else setErr("رمز اشتباهه");
        }}
      >
        <div className="ad-login-mark" dir="ltr">
          SD
        </div>
        <h2>ورود به مدیریت</h2>
        <p>
          آدرس ورود: دامنه‌ی سایت + <b dir="ltr">#admin</b> · رمز اولیه <b dir="ltr">1234</b> است. بعد از ورود آن را از «انتشار و پشتیبان» عوض کن.
        </p>
        <input type="password" value={p} onChange={(e) => setP(e.target.value)} placeholder="رمز عبور" autoFocus dir="ltr" />
        {err && <span className="ad-err">{err}</span>}
        <button className="ad-btn primary" type="submit">
          ورود
        </button>
        <a href="#" className="ad-link" onClick={() => window.history.replaceState(null, "", window.location.pathname)}>
          بازگشت به سایت
        </a>
      </form>
    </div>
  );
}

/* ---------- Main panel ---------- */

export function Admin({ content, onChange, onClose, notify, hasDraft }: Props) {
  const [logged, setLogged] = useState(isLoggedIn());
  const [tab, setTab] = useState<Tab>("publish");
  const [newPass, setNewPass] = useState("");
  const [gatewayCheck, setGatewayCheck] = useState<{ ok: boolean; message: string } | null>(null);
  const [checkingGateway, setCheckingGateway] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const c = content;

  if (!logged) return <Login onOk={() => setLogged(true)} />;

  const set = <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => onChange({ ...c, [key]: value });
  const setIn = <K extends keyof SiteContent>(key: K, patch: Partial<SiteContent[K]>) =>
    onChange({ ...c, [key]: { ...(c[key] as object), ...patch } as SiteContent[K] });

  function publishHtml() {
    try {
      exportHtml(c);
      notify("فایل index.html ساخته شد — روی هاست جایگزینش کن ✅");
    } catch (e) {
      notify(e instanceof Error ? e.message : "خطا در ساخت فایل");
    }
  }

  async function importJson(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const parsed = JSON.parse(await f.text());
      onChange(mergeContent(DEFAULT_CONTENT, parsed));
      notify("پشتیبان بارگذاری شد ✅");
    } catch {
      notify("فایل معتبر نیست");
    }
    e.target.value = "";
  }

  async function checkGateway() {
    const endpoint = c.payment.requestEndpoint.trim() || "/api/zarinpal/request";
    const statusUrl = endpoint.replace(/\/request\/?$/, "/status");
    setCheckingGateway(true);
    setGatewayCheck(null);
    try {
      const response = await fetch(statusUrl, { cache: "no-store" });
      const result = (await response.json()) as {
        ready?: boolean;
        merchantId?: string;
        sandbox?: boolean;
        message?: string;
      };
      const merchantMatches = !c.payment.merchantId || result.merchantId === c.payment.merchantId;
      const sandboxMatches = result.sandbox === c.payment.sandbox;
      const ok = response.ok && result.ready === true && merchantMatches && sandboxMatches;
      const message = !response.ok
        ? result.message ?? `پاسخ سرور: ${response.status}`
        : !result.ready
          ? result.message ?? "تنظیمات امن در هاست کامل نیست."
          : !merchantMatches
            ? "شناسه پذیرنده با متغیر امن هاست یکی نیست."
            : !sandboxMatches
              ? "حالت آزمایشی پنل با تنظیم هاست یکی نیست."
              : "اتصال سمت سرور آماده است. مبلغ و محصول روی سرور دوباره بررسی می‌شوند.";
      setGatewayCheck({ ok, message });
    } catch {
      setGatewayCheck({
        ok: false,
        message: "سرور پرداخت پاسخ نداد. اگر سایت روی هاست استاتیک است، زرین‌پال فعال نمی‌شود؛ روش واتساپ/کارت‌به‌کارت همچنان در دسترس است.",
      });
    } finally {
      setCheckingGateway(false);
    }
  }

  return (
    <div className="admin" dir="rtl">
      <aside className="ad-side">
        <div className="ad-side-head">
          <span className="ad-logo" dir="ltr">
            SD
          </span>
          <div>
            <b>مدیریت سایت</b>
            <small>{c.brand.first + c.brand.second}</small>
          </div>
        </div>
        <nav className="ad-tabs">
          {TABS.map((t) => (
            <button key={t.id} type="button" className={tab === t.id ? "is-active" : ""} onClick={() => setTab(t.id)}>
              <i>{t.icon}</i>
              {t.label}
            </button>
          ))}
        </nav>
        <div className="ad-side-foot">
          <button type="button" className="ad-btn ghost" onClick={onClose}>
            👁 دیدن سایت
          </button>
          <button
            type="button"
            className="ad-btn ghost"
            onClick={() => {
              setLoggedIn(false);
              setLogged(false);
            }}
          >
            خروج
          </button>
        </div>
      </aside>

      <main className="ad-main">
        <header className="ad-top">
          <div>
            <h1>{TABS.find((t) => t.id === tab)?.label}</h1>
            <p>
              {hasDraft ? (
                <span className="ad-badge warn">● تغییرات ذخیره شده روی این دستگاه — هنوز منتشر نشده</span>
              ) : (
                <span className="ad-badge ok">● بدون تغییر منتشرنشده</span>
              )}
            </p>
          </div>
          <div className="ad-row">
            <button type="button" className="ad-btn primary" onClick={publishHtml}>
              ⬇ دانلود index.html نهایی
            </button>
          </div>
        </header>

        <section className="ad-content">
          {tab === "publish" && (
            <>
              <div className="ad-panel ad-steps">
                <h3>راهنمای سریع تو و ادمین</h3>
                <ol>
                  <li>
                    <b>ورود:</b> آدرس دامنه‌ای که ثبت کرده‌ای + <code dir="ltr">#admin</code>؛ مثلاً <span dir="ltr">https://your-domain/#admin</span>. رمز اولیه <b dir="ltr">1234</b> است. از همین بخش رمز دستگاه را عوض کن.
                  </li>
                  <li>
                    <b>افزودن محصول:</b> تب «فروشگاه و دسته‌بندی» ← «افزودن دسته‌بندی» (در صورت نیاز) ← «افزودن محصول»؛ عکس، عنوان، توضیح، قیمت، تخفیف و زمان پایان تخفیف را وارد کن.
                  </li>
                  <li>
                    <b>بررسی و انتشار:</b> تغییرات را پیش‌نمایش کن، سپس «دانلود index.html نهایی» را بزن و فایل را روی هاست جایگزین کن. برای حفظ صفحه اصلی، نام فایل روی هاست باید <code dir="ltr">index.html</code> بماند.
                  </li>
                </ol>
                <p className="ad-note ad-warning">
                  🔐 مهم: این سایت فعلاً استاتیک است؛ رمز پنل فقط قفل ساده‌ی رابط کاربری روی همین دستگاه است، نه احراز هویت امن برای سایت عمومی. تغییرات هم فقط در مرورگر همان ادمین ذخیره می‌شوند. ادمین باید فایل خروجی را برای تو بفرستد یا خودش با دسترسی هاست منتشر کند. برای چند ادمین واقعی و ورود امن، بک‌اند/CMS لازم است.
                </p>
              </div>

              <div className="ad-panel ad-steps">
                <h3>چطور تغییرات روی سایت واقعی بره؟ (۳ قدم)</h3>
                <ol>
                  <li>
                    <b>ویرایش کن.</b> هر چیزی که از منوی سمت راست عوض می‌کنی، همون لحظه روی سایت (فقط در این مرورگر) دیده می‌شه. دکمه‌ی «دیدن سایت» رو بزن و نتیجه رو ببین.
                  </li>
                  <li>
                    <b>دانلود کن.</b> دکمه‌ی «⬇ دانلود index.html نهایی» رو بزن. یک فایل کامل با تمام تغییرات ساخته می‌شه.
                  </li>
                  <li>
                    <b>جایگزین کن.</b> فایل جدید رو روی هاست (cPanel / Vercel / هرجا) به‌جای index.html قبلی آپلود کن. تمام! 🎉
                  </li>
                </ol>
                <p className="ad-note">
                  💡 هیچ سرور یا اینترنتی لازم نیست؛ همه‌چیز روی همین دستگاه انجام می‌شه. فقط آپلود نهایی به هاست اینترنت می‌خواد.
                </p>
              </div>

              <div className="ad-grid-2">
                <div className="ad-panel">
                  <h3>پشتیبان‌گیری</h3>
                  <p>فایل content.json فقط محتواست (کوچک). برای انتقال به دستگاه دیگه یا نگه‌داشتن نسخه قبلی.</p>
                  <div className="ad-row">
                    <button type="button" className="ad-btn" onClick={() => exportJson(c)}>
                      ⬇ دانلود پشتیبان (JSON)
                    </button>
                    <button type="button" className="ad-btn ghost" onClick={() => importRef.current?.click()}>
                      ⬆ بارگذاری پشتیبان
                    </button>
                    <input ref={importRef} type="file" accept="application/json,.json" hidden onChange={importJson} />
                  </div>
                </div>

                <div className="ad-panel">
                  <h3>رمز ورود پنل</h3>
                  <p>این رمز فقط روی همین دستگاه ذخیره می‌شه و توی فایل سایت قرار نمی‌گیره.</p>
                  <div className="ad-row">
                    <input className="ad-input" type="text" dir="ltr" placeholder="رمز جدید" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
                    <button
                      type="button"
                      className="ad-btn"
                      onClick={() => {
                        if (newPass.trim().length < 4) return notify("رمز حداقل ۴ کاراکتر باشه");
                        setPassword(newPass.trim());
                        setNewPass("");
                        notify("رمز عوض شد ✅");
                      }}
                    >
                      ذخیره رمز
                    </button>
                  </div>
                </div>
              </div>

              <div className="ad-panel danger-zone">
                <h3>منطقه خطر</h3>
                <div className="ad-row">
                  <button
                    type="button"
                    className="ad-btn ghost"
                    onClick={() => {
                      if (confirm("تغییرات ذخیره‌نشده روی این دستگاه پاک شود و سایت به نسخه منتشرشده برگردد؟")) {
                        clearDraft();
                        window.location.reload();
                      }
                    }}
                  >
                    حذف تغییرات این دستگاه
                  </button>
                  <button
                    type="button"
                    className="ad-btn danger"
                    onClick={() => {
                      if (confirm("همه‌چیز به تنظیمات اولیه برگردد؟ (قابل بازگشت با فایل پشتیبان)")) {
                        onChange(DEFAULT_CONTENT);
                        notify("به پیش‌فرض برگشت");
                      }
                    }}
                  >
                    بازگردانی به پیش‌فرض کارخانه
                  </button>
                </div>
              </div>

              <div className="ad-panel">
                <h3>دسترسی به این پنل</h3>
                <p>
                  آدرس سایت + <b dir="ltr">#admin</b> یا دکمه‌ی ⚙ در انتهای فوتر. رمز اولیه <b dir="ltr">1234</b> است.
                </p>
              </div>
            </>
          )}

          {tab === "brand" && (
            <div className="ad-panel">
              <div className="ad-grid-2">
                <Field label="بخش اول نام (سفید)" value={c.brand.first} dir="ltr" onChange={(v) => setIn("brand", { first: v })} />
                <Field label="بخش دوم نام (رنگی)" value={c.brand.second} dir="ltr" onChange={(v) => setIn("brand", { second: v })} />
                <Field label="عنوان تب مرورگر" value={c.brand.pageTitle} onChange={(v) => setIn("brand", { pageTitle: v })} />
                <Field label="متن لودینگ اول سایت" value={c.brand.loaderText} onChange={(v) => setIn("brand", { loaderText: v })} />
              </div>
              <Area label="توضیح سایت برای گوگل (SEO)" value={c.brand.metaDescription} onChange={(v) => setIn("brand", { metaDescription: v })} />
              <Lines label="متن‌های نوار متحرک (زیر هیرو)" value={c.marquee} dir="ltr" onChange={(v) => set("marquee", v)} />
            </div>
          )}

          {tab === "nav" && (
            <div className="ad-panel">
              <Field label="متن دکمه‌ی اصلی هدر" value={c.navCta} onChange={(v) => set("navCta", v)} />
              <h3>لینک‌های منو</h3>
              <ListEditor
                items={c.nav}
                onChange={(v) => set("nav", v)}
                title={(n) => n.label}
                addLabel="افزودن لینک"
                create={() => ({ label: "لینک جدید", href: "#services" })}
                render={(n, u) => (
                  <div className="ad-grid-2">
                    <Field label="متن" value={n.label} onChange={(v) => u({ label: v })} />
                    <Field label="مقصد" value={n.href} dir="ltr" onChange={(v) => u({ href: v })} hint="#services · #work · #about · #process · #pricing · #faq · #contact یا آدرس کامل" />
                  </div>
                )}
              />
            </div>
          )}

          {tab === "hero" && (
            <div className="ad-panel">
              <Field label="برچسب بالای عنوان" value={c.hero.badge} onChange={(v) => setIn("hero", { badge: v })} />
              <div className="ad-grid-3">
                <Field label="خط ۱" value={c.hero.line1} onChange={(v) => setIn("hero", { line1: v })} />
                <Field label="خط ۲ (رنگی)" value={c.hero.line2} onChange={(v) => setIn("hero", { line2: v })} />
                <Field label="خط ۳" value={c.hero.line3} onChange={(v) => setIn("hero", { line3: v })} />
              </div>
              <Area label="متن زیر عنوان" value={c.hero.sub} onChange={(v) => setIn("hero", { sub: v })} />
              <div className="ad-grid-2">
                <Field label="دکمه اصلی" value={c.hero.primaryBtn} onChange={(v) => setIn("hero", { primaryBtn: v })} />
                <Field label="دکمه واتساپ" value={c.hero.whatsappBtn} onChange={(v) => setIn("hero", { whatsappBtn: v })} />
              </div>
              <Area label="پیام آماده‌ی واتساپ (دکمه هیرو)" value={c.hero.whatsappMsg} rows={2} onChange={(v) => setIn("hero", { whatsappMsg: v })} />
              <Field label="متن نوار لینک‌های زنده" value={c.hero.liveLabel} onChange={(v) => setIn("hero", { liveLabel: v })} />
              <h3>برچسب‌های شناور دور لوگو</h3>
              <div className="ad-grid-3">
                <Field label="برچسب سبز (LIVE)" value={c.hero.chipLive} onChange={(v) => setIn("hero", { chipLive: v })} />
                <Field label="برچسب انگلیسی" value={c.hero.chipEn} dir="ltr" onChange={(v) => setIn("hero", { chipEn: v })} />
                <Field label="برچسب فارسی" value={c.hero.chipFa} onChange={(v) => setIn("hero", { chipFa: v })} />
              </div>
              <h3>آمار (اعداد شمارنده)</h3>
              <ListEditor
                items={c.hero.stats}
                onChange={(v) => setIn("hero", { stats: v })}
                title={(s) => `${s.value}${s.suffix} ${s.label}`}
                addLabel="افزودن آمار"
                create={() => ({ value: 10, suffix: "+", label: "عنوان" })}
                render={(s, u) => (
                  <div className="ad-grid-3">
                    <Field label="عدد" type="number" value={String(s.value)} dir="ltr" onChange={(v) => u({ value: Number(v) || 0 })} />
                    <Field label="پسوند (+ ٪ …)" value={s.suffix} onChange={(v) => u({ suffix: v })} />
                    <Field label="برچسب" value={s.label} onChange={(v) => u({ label: v })} />
                  </div>
                )}
              />
            </div>
          )}

          {tab === "services" && (
            <div className="ad-panel">
              <h3>عنوان بخش</h3>
              <HeadingEditor value={c.headings.services} onChange={(h) => setIn("headings", { services: h })} />
              <h3>کارت‌های خدمات</h3>
              <ListEditor
                items={c.services}
                onChange={(v) => set("services", v)}
                title={(s) => s.title}
                addLabel="افزودن خدمت"
                create={() => ({ icon: "star", en: "NEW", title: "خدمت جدید", description: "توضیح کوتاه…", preset: c.form.projectOptions[0] ?? "" }) as Service}
                render={(s, u) => (
                  <>
                    <div className="ad-grid-3">
                      <Field label="عنوان" value={s.title} onChange={(v) => u({ title: v })} />
                      <Field label="برچسب انگلیسی" value={s.en} dir="ltr" onChange={(v) => u({ en: v })} />
                      <label className="ad-field">
                        <span>آیکون</span>
                        <select value={s.icon} onChange={(e) => u({ icon: e.target.value })}>
                          {ICONS.map((i) => (
                            <option key={i} value={i}>
                              {i}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <Area label="توضیح" value={s.description} rows={2} onChange={(v) => u({ description: v })} />
                    <label className="ad-field">
                      <span>با کلیک، کدام گزینه‌ی فرم انتخاب شود؟</span>
                      <select value={s.preset} onChange={(e) => u({ preset: e.target.value })}>
                        {c.form.projectOptions.map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                    </label>
                  </>
                )}
              />
            </div>
          )}


          {tab === "shop" && (
            <>
              <div className="ad-panel">
                <h3>عنوان بخش فروشگاه</h3>
                <HeadingEditor value={c.headings.products} onChange={(h) => setIn("headings", { products: h })} />
                <Area label="یادداشت زیر محصولات (نحوه پرداخت/تحویل)" value={c.shopNote} rows={2} onChange={(v) => set("shopNote", v)} />
              </div>

              <div className="ad-panel">
                <h3>دسته‌بندی‌ها</h3>
                <p>هر محصول به یکی از این دسته‌ها وصل می‌شه. شناسه انگلیسی و بدون فاصله باشه (مثلاً wordpress).</p>
                <ListEditor
                  items={c.productCategories}
                  onChange={(v) => set("productCategories", v)}
                  title={(x) => `${x.icon} ${x.name}`}
                  addLabel="افزودن دسته‌بندی"
                  create={() => ({ id: "cat-" + uid(), name: "دسته جدید", icon: "📦" }) as ProductCategory}
                  render={(x, u) => (
                    <div className="ad-grid-3">
                      <Field label="نام نمایشی" value={x.name} onChange={(v) => u({ name: v })} />
                      <Field label="شناسه (انگلیسی)" value={x.id} dir="ltr" onChange={(v) => u({ id: v.replace(/\s+/g, "-").toLowerCase() })} />
                      <Field label="ایموجی / آیکون" value={x.icon} onChange={(v) => u({ icon: v })} />
                    </div>
                  )}
                />
              </div>

              <div className="ad-panel">
                <h3>محصولات</h3>
                <ListEditor
                  items={c.products}
                  onChange={(v) => set("products", v)}
                  title={(x) => `${x.featured ? "★ " : ""}${x.title} — ${formatToman(x.price)}${x.discountPercent ? ` (${x.discountPercent}٪ تخفیف)` : ""}`}
                  addLabel="افزودن محصول جدید"
                  create={() =>
                    ({
                      id: "p-" + uid(),
                      title: "محصول جدید",
                      en: "NEW PRODUCT",
                      category: c.productCategories[0]?.id ?? "",
                      price: 10000000,
                      discountPercent: 0,
                      offerEnds: "",
                      featured: false,
                      badge: "",
                      image: "",
                      description: "توضیح محصول…",
                      features: ["ویژگی ۱", "ویژگی ۲"],
                      deliverables: "فایل‌ها + راهنمای نصب",
                      demoUrl: "",
                    }) as Product
                  }
                  render={(x, u) => (
                    <>
                      <ImagePicker value={x.image} onChange={(v) => u({ image: v })} notify={notify} />
                      <div className="ad-grid-3">
                        <Field label="نام محصول" value={x.title} onChange={(v) => u({ title: v })} />
                        <Field label="نام انگلیسی" value={x.en} dir="ltr" onChange={(v) => u({ en: v })} />
                        <label className="ad-field">
                          <span>دسته‌بندی</span>
                          <select value={x.category} onChange={(e) => u({ category: e.target.value })}>
                            {c.productCategories.map((ct) => (
                              <option key={ct.id} value={ct.id}>
                                {ct.icon} {ct.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <Field label="قیمت (تومان)" type="number" value={String(x.price)} dir="ltr" onChange={(v) => u({ price: Math.max(0, Number(v) || 0) })} hint={formatToman(x.price)} />
                        <Field label="درصد تخفیف" type="number" value={String(x.discountPercent)} dir="ltr" onChange={(v) => u({ discountPercent: Math.min(100, Math.max(0, Number(v) || 0)) })} hint={x.discountPercent ? `قیمت نهایی: ${formatToman(Math.round(x.price * (1 - x.discountPercent / 100)))}` : "۰ = بدون تخفیف"} />
                        <label className="ad-field">
                          <span>پایان تخفیف (تایمر)</span>
                          <input type="datetime-local" dir="ltr" value={toLocalInput(x.offerEnds)} onChange={(e) => u({ offerEnds: fromLocalInput(e.target.value) })} />
                          <small>{x.offerEnds ? "بعد از این زمان، قیمت اصلی نمایش داده می‌شود" : "خالی = تخفیف بدون محدودیت زمانی"}</small>
                        </label>
                        <Field label="برچسب (پرفروش، جدید…)" value={x.badge} onChange={(v) => u({ badge: v })} />
                        <Field label="لینک دمو" value={x.demoUrl} dir="ltr" onChange={(v) => u({ demoUrl: v })} />
                        <Toggle label="محصول ویژه (اول لیست + ستاره)" value={x.featured} onChange={(v) => u({ featured: v })} />
                      </div>
                      <Area label="توضیح" value={x.description} rows={3} onChange={(v) => u({ description: v })} />
                      <div className="ad-grid-2">
                        <Lines label="ویژگی‌ها (حداکثر ۴ تا نمایش داده می‌شود)" value={x.features} onChange={(v) => u({ features: v })} />
                        <Area label="چی تحویل داده می‌شود؟" value={x.deliverables} rows={3} onChange={(v) => u({ deliverables: v })} />
                      </div>
                    </>
                  )}
                />
              </div>
            </>
          )}

          {tab === "support" && (
            <div className="ad-panel">
              <h3>عنوان بخش</h3>
              <HeadingEditor value={c.headings.support} onChange={(h) => setIn("headings", { support: h })} />
              <h3>خدمات پشتیبانی و محتوا</h3>
              <ListEditor
                items={c.support}
                onChange={(v) => set("support", v)}
                title={(x) => `${x.title} — ${x.price}`}
                addLabel="افزودن خدمت پشتیبانی"
                create={() => ({ icon: "star", en: "SERVICE", title: "خدمت جدید", desc: "توضیح…", price: "توافقی" }) as SupportItem}
                render={(x, u) => (
                  <>
                    <div className="ad-grid-3">
                      <Field label="عنوان" value={x.title} onChange={(v) => u({ title: v })} />
                      <Field label="برچسب انگلیسی" value={x.en} dir="ltr" onChange={(v) => u({ en: v })} />
                      <label className="ad-field">
                        <span>آیکون</span>
                        <select value={x.icon} onChange={(e) => u({ icon: e.target.value })}>
                          {ICONS.map((i) => (
                            <option key={i} value={i}>
                              {i}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <Area label="توضیح" value={x.desc} rows={2} onChange={(v) => u({ desc: v })} />
                    <Field label="قیمت / شرایط" value={x.price} onChange={(v) => u({ price: v })} hint="مثلاً: از ۳ میلیون / ماه" />
                  </>
                )}
              />
            </div>
          )}

          {tab === "terms" && (
            <>
              <div className="ad-panel">
                <h3>عنوان بخش</h3>
                <HeadingEditor value={c.headings.terms} onChange={(h) => setIn("headings", { terms: h })} />
                <Area label="مقدمه قرارداد" value={c.terms.intro} rows={3} onChange={(v) => setIn("terms", { intro: v })} />
                <Area label="جمله پایانی (پذیرش)" value={c.terms.note} rows={2} onChange={(v) => setIn("terms", { note: v })} />
              </div>
              <div className="ad-panel">
                <h3>مراحل پرداخت</h3>
                <ListEditor
                  items={c.terms.steps}
                  onChange={(v) => setIn("terms", { steps: v })}
                  title={(x) => `${x.percent} — ${x.title}`}
                  addLabel="افزودن مرحله"
                  create={() => ({ title: "مرحله جدید", percent: "۱/۳", desc: "توضیح…" }) as TermStep}
                  render={(x, u) => (
                    <>
                      <div className="ad-grid-2">
                        <Field label="عنوان" value={x.title} onChange={(v) => u({ title: v })} />
                        <Field label="سهم (مثلاً ۱/۳ یا ۳۰٪)" value={x.percent} onChange={(v) => u({ percent: v })} />
                      </div>
                      <Area label="توضیح" value={x.desc} rows={2} onChange={(v) => u({ desc: v })} />
                    </>
                  )}
                />
              </div>
              <div className="ad-panel">
                <h3>مفاد قرارداد</h3>
                <Lines label="بندها" value={c.terms.clauses} onChange={(v) => setIn("terms", { clauses: v })} />
              </div>
              <div className="ad-panel">
                <h3>اطلاعات پرداخت (کارت‌به‌کارت)</h3>
                <p>اگر شماره کارت را وارد کنی، در بخش قرارداد و پنجره خرید محصولات با دکمه کپی نمایش داده می‌شود. خالی = نمایش داده نمی‌شود.</p>
                <div className="ad-grid-2">
                  <Field label="شماره کارت" value={c.terms.cardNumber} dir="ltr" onChange={(v) => setIn("terms", { cardNumber: v })} hint="مثلاً 6037-9975-xxxx-xxxx" />
                  <Field label="به نام" value={c.terms.cardOwner} onChange={(v) => setIn("terms", { cardOwner: v })} />
                </div>
              </div>
            </>
          )}

          {tab === "projects" && (
            <div className="ad-panel">
              <h3>عنوان بخش</h3>
              <HeadingEditor value={c.headings.work} onChange={(h) => setIn("headings", { work: h })} />
              <Field label="یادداشت زیر نمونه‌کارها" value={c.workNote} onChange={(v) => set("workNote", v)} />
              <h3>پروژه‌ها / محصولات</h3>
              <ListEditor
                items={c.projects}
                onChange={(v) => set("projects", v)}
                title={(p) => `${p.faTitle} — ${p.category}`}
                addLabel="افزودن پروژه / محصول جدید"
                create={() =>
                  ({
                    id: uid(),
                    enTitle: "NEW PROJECT",
                    faTitle: "پروژه جدید",
                    category: "دسته‌بندی",
                    url: "https://",
                    urlLabel: "example.com",
                    year: "۲۰۲۶",
                    lang: "فارسی",
                    description: "توضیح پروژه…",
                    features: ["ویژگی ۱", "ویژگی ۲"],
                    tags: ["Web"],
                    image: "",
                    imageAlt: "",
                    accent: "violet",
                  }) as Project
                }
                render={(p, u) => (
                  <>
                    <ImagePicker value={p.image} onChange={(v) => u({ image: v })} notify={notify} />
                    <div className="ad-grid-3">
                      <Field label="نام فارسی" value={p.faTitle} onChange={(v) => u({ faTitle: v })} />
                      <Field label="نام انگلیسی" value={p.enTitle} dir="ltr" onChange={(v) => u({ enTitle: v })} />
                      <Field label="دسته / نوع" value={p.category} onChange={(v) => u({ category: v })} />
                      <Field label="آدرس کامل سایت" value={p.url} dir="ltr" onChange={(v) => u({ url: v })} />
                      <Field label="آدرس کوتاه نمایشی" value={p.urlLabel} dir="ltr" onChange={(v) => u({ urlLabel: v })} />
                      <Field label="سال" value={p.year} onChange={(v) => u({ year: v })} />
                      <Field label="زبان" value={p.lang} onChange={(v) => u({ lang: v })} />
                      <Field label="متن جایگزین عکس" value={p.imageAlt} onChange={(v) => u({ imageAlt: v })} />
                      <label className="ad-field">
                        <span>رنگ هاله</span>
                        <select value={p.accent} onChange={(e) => u({ accent: e.target.value as Project["accent"] })}>
                          <option value="gold">طلایی</option>
                          <option value="violet">بنفش</option>
                          <option value="amber">کهربایی</option>
                          <option value="cyan">فیروزه‌ای</option>
                        </select>
                      </label>
                    </div>
                    <Area label="توضیح" value={p.description} onChange={(v) => u({ description: v })} />
                    <div className="ad-grid-2">
                      <Lines label="ویژگی‌ها" value={p.features} onChange={(v) => u({ features: v })} />
                      <Lines label="برچسب‌ها (انگلیسی)" value={p.tags} dir="ltr" onChange={(v) => u({ tags: v })} />
                    </div>
                  </>
                )}
              />
            </div>
          )}

          {tab === "about" && (
            <div className="ad-panel">
              <h3>عنوان بخش</h3>
              <HeadingEditor value={c.headings.about} onChange={(h) => setIn("headings", { about: h })} />
              <div className="ad-grid-2">
                <Field label="نام" value={c.contact.name} onChange={(v) => setIn("contact", { name: v })} />
                <Field label="عنوان شغلی" value={c.contact.role} onChange={(v) => setIn("contact", { role: v })} />
                <Field label="حروف آواتار" value={c.about.avatar} dir="ltr" onChange={(v) => setIn("about", { avatar: v })} />
              </div>
              <Area label="بیوگرافی" value={c.about.bio} rows={4} onChange={(v) => setIn("about", { bio: v })} />
              <Lines label="مهارت‌ها" value={c.about.skills} dir="ltr" onChange={(v) => setIn("about", { skills: v })} />
              <Area label="پیام واتساپ دکمه‌ی این بخش" value={c.about.whatsappMsg} rows={2} onChange={(v) => setIn("about", { whatsappMsg: v })} />
              <h3>نقاط قوت</h3>
              <ListEditor
                items={c.about.points}
                onChange={(v) => setIn("about", { points: v })}
                title={(p) => p.t}
                addLabel="افزودن مورد"
                create={() => ({ t: "عنوان", d: "توضیح" })}
                render={(p, u) => (
                  <>
                    <Field label="عنوان" value={p.t} onChange={(v) => u({ t: v })} />
                    <Area label="توضیح" value={p.d} rows={2} onChange={(v) => u({ d: v })} />
                  </>
                )}
              />
            </div>
          )}

          {tab === "process" && (
            <div className="ad-panel">
              <h3>عنوان بخش</h3>
              <HeadingEditor value={c.headings.process} onChange={(h) => setIn("headings", { process: h })} />
              <h3>مراحل</h3>
              <ListEditor
                items={c.steps}
                onChange={(v) => set("steps", v)}
                title={(s) => `${s.n} ${s.title}`}
                addLabel="افزودن مرحله"
                create={() => ({ n: "۰۵", en: "STEP", title: "مرحله جدید", desc: "توضیح…" }) as Step}
                render={(s, u) => (
                  <>
                    <div className="ad-grid-3">
                      <Field label="شماره" value={s.n} onChange={(v) => u({ n: v })} />
                      <Field label="برچسب انگلیسی" value={s.en} dir="ltr" onChange={(v) => u({ en: v })} />
                      <Field label="عنوان" value={s.title} onChange={(v) => u({ title: v })} />
                    </div>
                    <Area label="توضیح" value={s.desc} rows={2} onChange={(v) => u({ desc: v })} />
                  </>
                )}
              />
            </div>
          )}

          {tab === "pricing" && (
            <div className="ad-panel">
              <h3>عنوان بخش</h3>
              <HeadingEditor value={c.headings.pricing} onChange={(h) => setIn("headings", { pricing: h })} />
              <h3>پلن‌ها</h3>
              <ListEditor
                items={c.plans}
                onChange={(v) => set("plans", v)}
                title={(p) => `${p.name} — ${p.price}`}
                addLabel="افزودن پلن"
                create={() => ({ name: "پلن جدید", en: "PLAN", price: "۱۰۰ میلیون", unit: "شروع از", desc: "توضیح…", features: ["ویژگی ۱"], featured: false, preset: c.form.projectOptions[0] ?? "" }) as Plan}
                render={(p, u) => (
                  <>
                    <div className="ad-grid-3">
                      <Field label="نام پلن" value={p.name} onChange={(v) => u({ name: v })} />
                      <Field label="برچسب انگلیسی" value={p.en} dir="ltr" onChange={(v) => u({ en: v })} />
                      <Field label="قیمت" value={p.price} onChange={(v) => u({ price: v })} hint="مثلاً: ۱۲۰ میلیون / توافقی" />
                      <Field label="توضیح کنار قیمت" value={p.unit} onChange={(v) => u({ unit: v })} />
                      <label className="ad-field">
                        <span>گزینه‌ی فرم هنگام سفارش</span>
                        <select value={p.preset} onChange={(e) => u({ preset: e.target.value })}>
                          {c.form.projectOptions.map((o) => (
                            <option key={o}>{o}</option>
                          ))}
                        </select>
                      </label>
                      <Toggle label="پلن پیشنهادی (برجسته)" value={p.featured} onChange={(v) => u({ featured: v })} />
                    </div>
                    <Area label="توضیح" value={p.desc} rows={2} onChange={(v) => u({ desc: v })} />
                    <Lines label="ویژگی‌ها" value={p.features} onChange={(v) => u({ features: v })} />
                  </>
                )}
              />
            </div>
          )}

          {tab === "faq" && (
            <div className="ad-panel">
              <h3>عنوان بخش</h3>
              <HeadingEditor value={c.headings.faq} onChange={(h) => setIn("headings", { faq: h })} />
              <h3>سوال‌ها</h3>
              <ListEditor
                items={c.faqs}
                onChange={(v) => set("faqs", v)}
                title={(f) => f.q}
                addLabel="افزودن سوال"
                create={() => ({ q: "سوال جدید؟", a: "پاسخ…" }) as Faq}
                render={(f, u) => (
                  <>
                    <Field label="سوال" value={f.q} onChange={(v) => u({ q: v })} />
                    <Area label="پاسخ" value={f.a} rows={3} onChange={(v) => u({ a: v })} />
                  </>
                )}
              />
            </div>
          )}

          {tab === "contact" && (
            <>
              <div className="ad-panel">
                <h3>اطلاعات تماس</h3>
                <div className="ad-grid-3">
                  <Field label="شماره نمایشی" value={c.contact.phoneDisplay} dir="ltr" onChange={(v) => setIn("contact", { phoneDisplay: v })} />
                  <Field label="شماره برای تماس (بین‌المللی)" value={c.contact.phoneRaw} dir="ltr" onChange={(v) => setIn("contact", { phoneRaw: v })} hint="مثل +989148218790" />
                  <Field label="شماره واتساپ (بدون +)" value={c.contact.whatsapp} dir="ltr" onChange={(v) => setIn("contact", { whatsapp: v })} hint="مثل 989352665972" />
                  <Field label="متن دکمه واتساپ" value={c.contact.whatsappLabel} onChange={(v) => setIn("contact", { whatsappLabel: v })} />
                </div>
              </div>
              <div className="ad-panel">
                <h3>بخش پایانی (دعوت به اقدام)</h3>
                <div className="ad-grid-3">
                  <Field label="برچسب" value={c.final.eyebrow} onChange={(v) => setIn("final", { eyebrow: v })} />
                  <Field label="عنوان — قبل" value={c.final.before} onChange={(v) => setIn("final", { before: v })} />
                  <Field label="عنوان — رنگی" value={c.final.highlight} onChange={(v) => setIn("final", { highlight: v })} />
                  <Field label="عنوان — بعد" value={c.final.after} onChange={(v) => setIn("final", { after: v })} />
                  <Field label="دکمه واتساپ" value={c.final.whatsappBtn} onChange={(v) => setIn("final", { whatsappBtn: v })} />
                  <Field label="دکمه فرم" value={c.final.formBtn} onChange={(v) => setIn("final", { formBtn: v })} />
                </div>
                <Area label="متن" value={c.final.sub} rows={2} onChange={(v) => setIn("final", { sub: v })} />
                <Area label="پیام واتساپ" value={c.final.whatsappMsg} rows={2} onChange={(v) => setIn("final", { whatsappMsg: v })} />
              </div>
              <div className="ad-panel">
                <h3>فرم سفارش</h3>
                <div className="ad-grid-2">
                  <Lines label="گزینه‌های نوع پروژه" value={c.form.projectOptions} onChange={(v) => setIn("form", { projectOptions: v })} />
                  <Lines label="گزینه‌های بودجه" value={c.form.budgetOptions} onChange={(v) => setIn("form", { budgetOptions: v })} hint="هر خط یک گزینه — آخرین گزینه پیش‌فرض است" />
                </div>
              </div>
              <div className="ad-panel">
                <h3>فوتر</h3>
                <Area label="متن معرفی" value={c.footer.about} rows={2} onChange={(v) => setIn("footer", { about: v })} />
                <div className="ad-grid-3">
                  <Field label="عنوان ستون ۱" value={c.footer.quickTitle} onChange={(v) => setIn("footer", { quickTitle: v })} />
                  <Field label="عنوان ستون ۲" value={c.footer.worksTitle} onChange={(v) => setIn("footer", { worksTitle: v })} />
                  <Field label="عنوان ستون ۳" value={c.footer.contactTitle} onChange={(v) => setIn("footer", { contactTitle: v })} />
                </div>
                <Field label="متن کپی‌رایت" value={c.footer.copyright} onChange={(v) => setIn("footer", { copyright: v })} />
                <Field label="متن «ساخته‌شده توسط»" value={c.footer.made} onChange={(v) => setIn("footer", { made: v })} />
              </div>
            </>
          )}

          {tab === "payment" && (
            <>
              <div className="ad-panel">
                <h3>پرداخت آنلاین زرین‌پال</h3>
                <p>
                  نسخه‌ی API زرین‌پال از <b dir="ltr">Merchant ID</b> استفاده می‌کند؛ فیلد جداگانه‌ی API Key در مستندات V4 ندارد. مبلغ سفارش از محصول منتشرشده سمت سرور خوانده می‌شود، نه از مرورگر مشتری.
                </p>
                <Toggle label="نمایش دکمه پرداخت آنلاین در فروشگاه" value={c.payment.enabled} onChange={(v) => setIn("payment", { enabled: v })} />
                <div className="ad-grid-2">
                  <Field label="شناسه پذیرنده / Merchant ID" value={c.payment.merchantId} dir="ltr" onChange={(v) => setIn("payment", { merchantId: v.trim() })} hint="شناسه‌ای که از پنل زرین‌پال می‌گیری؛ این فیلد secret نیست." />
                  <Field label="نشانی API درخواست پرداخت" value={c.payment.requestEndpoint} dir="ltr" onChange={(v) => setIn("payment", { requestEndpoint: v })} hint="معمولاً /api/zarinpal/request روی همین دامنه" />
                </div>
                <Toggle label="حالت آزمایشی (Sandbox) — باید با تنظیم سرور هم یکی باشد" value={c.payment.sandbox} onChange={(v) => setIn("payment", { sandbox: v })} />
                <div className="ad-row wrap gateway-actions">
                  <button type="button" className="ad-btn" onClick={checkGateway} disabled={checkingGateway}>
                    {checkingGateway ? "در حال بررسی…" : "آزمایش اتصال امن"}
                  </button>
                  {gatewayCheck && <span className={`gateway-result${gatewayCheck.ok ? " is-ok" : " is-error"}`}>{gatewayCheck.ok ? "✓ " : "! "}{gatewayCheck.message}</span>}
                </div>
                <p className="ad-note ad-warning">
                  کلید محرمانه را هرگز اینجا، داخل content.json یا فایل HTML ننویس. تنظیم امن روی Vercel: <code dir="ltr">ZARINPAL_MERCHANT_ID</code>، <code dir="ltr">PAYMENT_SIGNING_SECRET</code> (رشته‌ی تصادفی حداقل ۳۲ کاراکتر) و <code dir="ltr">APP_ORIGIN</code>. حالت تست را با <code dir="ltr">ZARINPAL_SANDBOX=true</code> فعال کن. بعد از ذخیره‌ی Environment Variables، پروژه را Redeploy کن.
                </p>
              </div>

              <div className="ad-panel">
                <h3>روش جایگزین، اگر زرین‌پال قطع بود</h3>
                <Toggle label="نمایش کارت‌به‌کارت و ثبت سفارش واتساپی به‌عنوان جایگزین" value={c.payment.fallbackEnabled} onChange={(v) => setIn("payment", { fallbackEnabled: v })} />
                <Area label="پیام راهنمای مشتری در حالت جایگزین" value={c.payment.fallbackNote} rows={2} onChange={(v) => setIn("payment", { fallbackNote: v })} />
                <p>شماره کارت جایگزین را در تب «قرارداد و پرداخت» وارد کن. اگر اتصال آنلاین در دسترس نباشد، مشتری می‌تواند سفارش و شماره تماسش را در واتساپ برایت بفرستد.</p>
              </div>

              <div className="ad-panel ad-steps">
                <h3>راه‌اندازی زرین‌پال روی Vercel</h3>
                <ol>
                  <li>در Vercel: پروژه ← Settings ← Environment Variables؛ سه مقدار بالا را اضافه کن. <code dir="ltr">APP_ORIGIN</code> باید دامنه‌ی واقعی با https باشد.</li>
                  <li>در همین پنل Merchant ID را وارد کن؛ حالت Sandbox را با متغیر سرور هماهنگ نگه دار. دکمه‌ی «آزمایش اتصال امن» باید سبز شود.</li>
                  <li>فایل نهایی را منتشر کن و پوشه‌ی <code dir="ltr">api/</code> را هم در استقرار Vercel نگه دار. روی هاست فایل استاتیک تنها، درگاه اجرا نمی‌شود و روش جایگزین کار می‌کند.</li>
                </ol>
                <p className="ad-note">درگاه فقط وقتی «موفق» اعلام می‌شود که callback سرور تراکنش را با API رسمی زرین‌پال Verify کند. برگشت ساده‌ی مرورگر از صفحه‌ی پرداخت به‌تنهایی اثبات پرداخت نیست.</p>
              </div>
            </>
          )}

          {tab === "sales" && (
            <>
              <div className="ad-panel">
                <h3>دستیار فروش هوشمند</h3>
                <p>
                  این دستیار بر پایه‌ی کلیدواژه‌های فارسی پاسخ می‌دهد، نیاز مشتری را تشخیص می‌دهد و در هر مرحله یک سؤال کشف، معرفی نمونه‌کار، پاسخ به اعتراض یا دعوت به اقدام ارسال می‌کند. تمام متن‌ها از همین پنل قابل ویرایش هستند.
                </p>
                <Toggle label="فعال‌سازی دستیار فروش روی سایت" value={c.sales.enabled} onChange={(v) => setIn("sales", { enabled: v })} />
                <div className="ad-grid-2">
                  <Field label="متن دکمه شناور" value={c.sales.fabLabel} onChange={(v) => setIn("sales", { fabLabel: v })} />
                  <Field label="عنوان پنجره" value={c.sales.windowTitle} onChange={(v) => setIn("sales", { windowTitle: v })} />
                </div>
                <Area label="پیام خوش‌آمدگویی" value={c.sales.greeting} rows={3} onChange={(v) => setIn("sales", { greeting: v })} />
                <Area label="پیشنهاد اولیه (بعد از سلام)" value={c.sales.openingOffer} rows={2} onChange={(v) => setIn("sales", { openingOffer: v })} />
                <Field
                  label="لحن گفتگو"
                  value={c.sales.tone}
                  onChange={(v) => setIn("sales", { tone: v as SiteContent["sales"]["tone"] })}
                  hint="فقط راهنمای داخلی برای خودت؛ تأثیری در پاسخ‌ها ندارد."
                />
              </div>

              <div className="ad-panel">
                <h3>مزیت‌های فروش</h3>
                <Lines label="مزیت‌ها" value={c.sales.valueProps} onChange={(v) => setIn("sales", { valueProps: v })} hint="هر خط یک مزیت. دستیار در گفتگو به تدریج از این‌ها استفاده می‌کند." />
              </div>

              <div className="ad-panel">
                <h3>سؤالات کشف نیاز</h3>
                <p>وقتی دستیار تشخیص می‌دهد نیاز مشتری روشن نیست، به ترتیب از این سؤال‌ها استفاده می‌کند.</p>
                <Lines label="سؤالات" value={c.sales.discoveryQuestions} onChange={(v) => setIn("sales", { discoveryQuestions: v })} />
              </div>

              <div className="ad-panel">
                <h3>جواب‌های آماده برای اعتراض‌ها</h3>
                <ListEditor
                  items={c.sales.objectionHandlers}
                  onChange={(v) => setIn("sales", { objectionHandlers: v })}
                  title={(o) => `اعتراض: ${o.objection}`}
                  addLabel="افزودن اعتراض"
                  create={() => ({ objection: "اعتراض جدید", response: "پاسخ پیشنهادی" })}
                  render={(o, u) => (
                    <>
                      <Field label="کلیدواژه/عنوان اعتراض" value={o.objection} onChange={(v) => u({ objection: v })} />
                      <Area label="پاسخ پیشنهادی" value={o.response} rows={3} onChange={(v) => u({ response: v })} />
                    </>
                  )}
                />
              </div>

              <div className="ad-panel">
                <h3>سناریوهای تشخیص نیاز (آبجکتیوها)</h3>
                <p>هر سناریو یک «نیت» مشتری است؛ مثلاً «سایت از صفر»، «سؤال درباره قیمت»، «نمونه‌کار می‌خوام». کلیدواژه‌ها کمک می‌کنند دستیار سریع تشخیص بدهد.</p>
                <ListEditor
                  items={c.sales.objectives}
                  onChange={(v) => setIn("sales", { objectives: v })}
                  title={(o) => o.title}
                  addLabel="افزودن سناریو"
                  create={() => ({ id: uid(), title: "سناریوی جدید", triggers: [], response: "پاسخ", nextAction: "form", followups: [] }) as SalesObjective}
                  render={(o, u) => (
                    <>
                      <div className="ad-grid-2">
                        <Field label="عنوان" value={o.title} onChange={(v) => u({ title: v })} />
                        <Field label="شناسه انگلیسی" value={o.id} dir="ltr" onChange={(v) => u({ id: v.replace(/\s+/g, "-").toLowerCase() })} />
                      </div>
                      <Area label="کلیدواژه‌ها (هر خط یک کلید)" value={o.triggers.join("\n")} rows={3} onChange={(v) => u({ triggers: v.split("\n").map((s) => s.trim()).filter(Boolean) })} />
                      <Area label="پاسخ اصلی" value={o.response} rows={3} onChange={(v) => u({ response: v })} />
                      <label className="ad-field">
                        <span>اقدام بعد از پاسخ</span>
                        <select value={o.nextAction} onChange={(e) => u({ nextAction: e.target.value as SalesObjective["nextAction"] })}>
                          <option value="form">باز کردن فرم سفارش</option>
                          <option value="whatsapp">ارسال پیام در واتساپ</option>
                          <option value="phone">شماره تماس</option>
                          <option value="shop">لینک به فروشگاه</option>
                          <option value="live">لینک به نمونه‌کار زنده</option>
                          <option value="samples">نمونه‌کارها</option>
                        </select>
                      </label>
                      <Lines label="پیام‌های بعدی (پیگیری)" value={o.followups} onChange={(v) => u({ followups: v })} />
                    </>
                  )}
                />
              </div>

              <div className="ad-panel">
                <h3>نمونه‌کارهای قابل اشاره در گفتگو</h3>
                <ListEditor
                  items={c.sales.liveWork}
                  onChange={(v) => setIn("sales", { liveWork: v })}
                  title={(l) => l.title}
                  addLabel="افزودن نمونه‌کار"
                  create={() => ({ title: "نمونه‌کار", url: "https://", what: "توضیح کوتاه" })}
                  render={(l, u) => (
                    <>
                      <Field label="نام" value={l.title} onChange={(v) => u({ title: v })} />
                      <Field label="آدرس" value={l.url} dir="ltr" onChange={(v) => u({ url: v })} />
                      <Field label="توضیح یک‌خطی" value={l.what} onChange={(v) => u({ what: v })} />
                    </>
                  )}
                />
              </div>

              <div className="ad-panel">
                <h3>شواهد اعتمادساز و FAQ</h3>
                <Lines label="شواهد اعتمادساز (Social Proof)" value={c.sales.socialProof.map((s) => s.text)} onChange={(v) => setIn("sales", { socialProof: v.map((text) => ({ text })) })} />
                <ListEditor
                  items={c.sales.faq}
                  onChange={(v) => setIn("sales", { faq: v })}
                  title={(f) => f.q}
                  addLabel="افزودن سؤال"
                  create={() => ({ q: "سؤال جدید؟", a: "پاسخ…" })}
                  render={(f, u) => (
                    <>
                      <Field label="سؤال" value={f.q} onChange={(v) => u({ q: v })} />
                      <Area label="پاسخ" value={f.a} rows={2} onChange={(v) => u({ a: v })} />
                    </>
                  )}
                />
              </div>

              <div className="ad-panel">
                <h3>بحث قیمت و آپ‌سل</h3>
                <p>وقتی مشتری درباره بودجه سؤال کرد، دستیار این پلن‌ها را پیشنهاد می‌دهد.</p>
                <ListEditor
                  items={c.sales.pricingPitches}
                  onChange={(v) => setIn("sales", { pricingPitches: v })}
                  title={(p) => p.budget}
                  addLabel="افزودن بازه قیمت"
                  create={() => ({ budget: "بازه جدید", pitch: "توضیح پلن" })}
                  render={(p, u) => (
                    <>
                      <Field label="بازه قیمت" value={p.budget} onChange={(v) => u({ budget: v })} />
                      <Area label="متن پیشنهاد" value={p.pitch} rows={2} onChange={(v) => u({ pitch: v })} />
                    </>
                  )}
                />
                <h3>پیام‌های آپ‌سل برای مشتری فعلی</h3>
                <ListEditor
                  items={c.sales.upsellTriggers}
                  onChange={(v) => setIn("sales", { upsellTriggers: v })}
                  title={(u) => u.signal}
                  addLabel="افزودن پیشنهاد آپ‌سل"
                  create={() => ({ signal: "کلمه کلیدی", suggestion: "پیشنهاد" })}
                  render={(item, u) => (
                    <>
                      <Field label="کلمه کلیدی" value={item.signal} onChange={(v) => u({ signal: v })} />
                      <Area label="پیشنهاد" value={item.suggestion} rows={2} onChange={(v) => u({ suggestion: v })} />
                    </>
                  )}
                />
                <Field label="پیام بعد از فروش (After Sale Care)" value={c.sales.afterSaleCare} onChange={(v) => setIn("sales", { afterSaleCare: v })} />
                <Field label="پیام آپ‌سل پیشنهادی" value={c.sales.upsell} onChange={(v) => setIn("sales", { upsell: v })} />
                <Field label="جمله‌ی بستن فروش (Closing Line)" value={c.sales.closingLine} onChange={(v) => setIn("sales", { closingLine: v })} />
                <Field label="پیام پیگیری بعد از ۲۴ ساعت" value={c.sales.followUpAfter24h} onChange={(v) => setIn("sales", { followUpAfter24h: v })} />
                <Field label="پیام برای مشتری سرد (Cold Lead)" value={c.sales.coldLeadNurture} onChange={(v) => setIn("sales", { coldLeadNurture: v })} />
              </div>

              <div className="ad-panel">
                <h3>نکته‌ی مهم درباره‌ی دستیار فروش</h3>
                <p className="ad-note ad-warning">
                  این دستیار به‌صورت آفلاین و در مرورگر مشتری کار می‌کند؛ یعنی هیچ داده‌ای به سرور ارسال نمی‌شود و سابقه‌ی گفتگو فقط در همان دستگاه مشتری (و در حافظه‌ی موقت) ذخیره می‌شود. برای گفتگوهای واقعی پایدار، مشتری را به واتساپ یا تماس هدایت کن.
                </p>
              </div>
            </>
          )}

          {tab === "theme" && (
            <div className="ad-panel">
              <h3>رنگ‌ها</h3>
              <div className="ad-colors">
                {(
                  [
                    ["purple", "بنفش اصلی"],
                    ["cyan", "فیروزه‌ای"],
                    ["mint", "سبزآبی (تاکید)"],
                    ["bg", "پس‌زمینه"],
                  ] as const
                ).map(([k, label]) => (
                  <label key={k} className="ad-color">
                    <input type="color" value={c.theme[k]} onChange={(e) => setIn("theme", { [k]: e.target.value } as Partial<SiteContent["theme"]>)} />
                    <span>{label}</span>
                    <code dir="ltr">{c.theme[k]}</code>
                  </label>
                ))}
              </div>
              <div className="ad-row wrap">
                {[
                  { n: "پیش‌فرض بنفش/فیروزه‌ای", p: "#a855f7", c: "#22d3ee", m: "#5eead4", b: "#050309" },
                  { n: "طلایی لوکس", p: "#f59e0b", c: "#fbbf24", m: "#fde68a", b: "#09070a" },
                  { n: "سبز نئون", p: "#22c55e", c: "#a3e635", m: "#86efac", b: "#040906" },
                  { n: "قرمز/صورتی", p: "#ef4444", c: "#f472b6", m: "#fda4af", b: "#0a0406" },
                  { n: "آبی اقیانوس", p: "#3b82f6", c: "#06b6d4", m: "#67e8f9", b: "#03060c" },
                ].map((pr) => (
                  <button key={pr.n} type="button" className="ad-btn ghost" onClick={() => setIn("theme", { purple: pr.p, cyan: pr.c, mint: pr.m, bg: pr.b })}>
                    <i className="ad-swatch" style={{ background: `linear-gradient(90deg, ${pr.p}, ${pr.c})` }} />
                    {pr.n}
                  </button>
                ))}
              </div>

              <h3>انیمیشن‌ها</h3>
              <div className="ad-row wrap">
                {(
                  [
                    ["on", "کامل (پیش‌فرض)"],
                    ["soft", "ملایم (آهسته‌تر)"],
                    ["off", "خاموش"],
                  ] as const
                ).map(([v, l]) => (
                  <label key={v} className={`ad-radio${c.theme.animations === v ? " is-on" : ""}`}>
                    <input type="radio" name="anim" checked={c.theme.animations === v} onChange={() => setIn("theme", { animations: v })} />
                    {l}
                  </label>
                ))}
              </div>
              <Toggle label="نور دنبال‌کننده‌ی موس" value={c.theme.cursorGlow} onChange={(v) => setIn("theme", { cursorGlow: v })} />

              <h3>اندازه متن</h3>
              <label className="ad-field">
                <span>مقیاس: {Math.round(c.theme.fontScale * 100)}٪</span>
                <input type="range" min={0.85} max={1.25} step={0.05} value={c.theme.fontScale} onChange={(e) => setIn("theme", { fontScale: Number(e.target.value) })} />
              </label>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
