import { useEffect, useRef, useState } from "react";
import {
  applyTheme,
  clearDraft,
  faNum,
  fetchContentJson,
  hasDraft as hasDraftStored,
  loadInitialContent,
  readDraft,
  saveDraft,
  telHref,
  waLink,
  type Heading,
  type SiteContent,
} from "./content";
import { SDMasterpiece, SDMini } from "./components/SDMark";
import { ProjectModal } from "./components/ProjectModal";
import { Admin } from "./components/Admin";
import { Shop } from "./components/Shop";
import { SalesAssistant } from "./components/SalesAssistant";

function WaIcon() {
  return (
    <svg className="wa-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-2.9.8.8-2.8-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4 0-.5.1-.7l.4-.5c.1-.2.1-.3 0-.5L9.6 8c-.1-.3-.3-.3-.5-.3h-.4c-.1 0-.4.1-.6.4-.2.3-.8.8-.8 2s.8 2.3 1 2.5c.1.2 1.7 2.6 4.1 3.6.6.2 1 .4 1.4.5.6.2 1.1.2 1.5.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2l-.6-.3Z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="phone-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7a2 2 0 0 1 1.7 2Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="check-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12.5l5 5L20 6.5" />
    </svg>
  );
}

const ICON_PATHS: Record<string, string> = {
  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M3 12h18 M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3Z",
  bag: "M6 8h12l1 12H5L6 8Z M9 8V6a3 3 0 0 1 6 0v2",
  rocket: "M22 2 11 13 M22 2l-7 20-4-9-9-4 20-7Z",
  calendar: "M5 6h14v13H5z M5 10h14 M9 3v4 M15 3v4",
  chart: "M3 21h18 M6 21V11 M11 21V6 M16 21v-9 M21 21V9",
  shield: "M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-3Z M9.5 12l2 2 3.5-4",
  pen: "M4 20l4-1 11-11-3-3L5 16l-1 4Z M13 7l3 3",
  phone: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7a2 2 0 0 1 1.7 2Z",
  star: "M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9L12 3Z",
  camera: "M4 8h3l2-3h6l2 3h3v11H4z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  code: "M8 7 3 12l5 5 M16 7l5 5-5 5 M14 4l-4 16",
  heart: "M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z",
};

function ServiceIcon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="svc-svg">
      <path d={ICON_PATHS[name] ?? ICON_PATHS.globe} />
    </svg>
  );
}

function CountUp({ to, suffix = "", start }: { to: number; suffix?: string; start: boolean }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const t0 = performance.now();
    const dur = 1400;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, to]);
  return (
    <>
      {faNum(val)}
      {suffix}
    </>
  );
}

function SectionHead({ h }: { h: Heading }) {
  return (
    <div className="section-head reveal">
      <div>
        <span className="eyebrow">
          {h.en} <b>/</b> {h.eyebrow}
        </span>
        <h2 className="section-title">
          {h.before} {h.highlight && <span className="grad-cham">{h.highlight}</span>} {h.after}
        </h2>
      </div>
      {h.sub && <p className="section-sub">{h.sub}</p>}
    </div>
  );
}

function isAdminHash() {
  return window.location.hash.replace("#", "").toLowerCase() === "admin";
}

export default function App() {
  const [{ content: initialContent, isDraft: initialDraft }] = useState(() => loadInitialContent());
  const [content, setContent] = useState<SiteContent>(initialContent);
  const [draft, setDraft] = useState(initialDraft);
  const [admin, setAdmin] = useState(isAdminHash());
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState({ open: false, preset: "" });
  const [toast, setToast] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const glowRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const c = content;
  const brandName = c.brand.first + c.brand.second;

  // content.json روی هاست (اگر وجود داشت و پیش‌نویسی نبود)
  useEffect(() => {
    let alive = true;
    (async () => {
      if (readDraft()) return;
      const remote = await fetchContentJson();
      if (alive && remote) setContent(remote);
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    applyTheme(c.theme);
  }, [c.theme]);

  useEffect(() => {
    document.title = c.brand.pageTitle;
  }, [c.brand.pageTitle]);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), admin ? 0 : 1400);
    return () => window.clearTimeout(t);
  }, [admin]);

  useEffect(() => {
    const onHash = () => setAdmin(isAdminHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("admin-open", admin);
    return () => document.body.classList.remove("admin-open");
  }, [admin]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowTop(window.scrollY > 700);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (admin) return;
    const items = document.querySelectorAll<HTMLElement>(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const obs = new IntersectionObserver(
      (entries, o) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-visible");
            o.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    items.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [admin, c]);

  useEffect(() => {
    if (!window.matchMedia("(pointer:fine)").matches) return;
    const glow = glowRef.current;
    if (!glow) return;
    let raf = 0;
    let x = -300;
    let y = -300;
    let tx = x;
    let ty = y;
    const onMove = (e: globalThis.MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    const loop = () => {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      glow.style.transform = `translate(${x - 200}px, ${y - 200}px)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(
    () => () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const result = params.get("payment");
    if (!result) return;
    if (result === "success") {
      const reference = params.get("ref");
      notify(reference ? `پرداخت تأیید شد. کد پیگیری: ${reference}` : "پرداخت توسط زرین‌پال تأیید شد.");
    } else if (result === "cancelled") {
      notify("پرداخت لغو شد؛ می‌توانی روش واتساپ/کارت‌به‌کارت را انتخاب کنی.");
    } else {
      notify("تأیید پرداخت انجام نشد؛ قبل از پرداخت دوباره با پشتیبانی تماس بگیر.");
    }
    params.delete("payment");
    params.delete("ref");
    params.delete("order");
    params.delete("reason");
    const query = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
  }, []);

  function notify(msg: string) {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2800);
  }

  function updateContent(next: SiteContent) {
    setContent(next);
    saveDraft(next);
    setDraft(true);
  }

  function openAdmin() {
    window.location.hash = "admin";
  }

  function closeAdmin() {
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    setAdmin(false);
  }

  function openModal(preset = "") {
    setMenuOpen(false);
    setModal({ open: true, preset });
  }

  function closeModal() {
    setModal((m) => ({ ...m, open: false }));
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  if (admin) {
    return (
      <>
        <Admin content={c} onChange={updateContent} onClose={closeAdmin} notify={notify} hasDraft={draft || hasDraftStored()} />
        <div className={`toast${toast ? " is-visible" : ""}`} role="status" aria-live="polite">
          {toast}
        </div>
      </>
    );
  }

  const phone = telHref(c.contact.phoneRaw);

  return (
    <div className={`site${loading ? " is-loading" : " is-ready"}`} dir="rtl">
      <a className="skip-link" href="#main">
        رفتن به محتوای اصلی
      </a>
      <div className="cursor-glow" ref={glowRef} aria-hidden="true" />

      <div className={`loader${loading ? "" : " is-done"}`} aria-hidden={!loading}>
        <div className="loader-mark" dir="ltr">
          <span className="loader-s">S</span>
          <span className="loader-d">D</span>
        </div>
        <div className="loader-bar">
          <i />
        </div>
        <span className="loader-text">{c.brand.loaderText}</span>
      </div>

      {draft && (
        <div className="draft-bar" role="status">
          <span>✏️ حالت پیش‌نمایش — این تغییرات فقط روی این دستگاه دیده می‌شه و هنوز منتشر نشده.</span>
          <div>
            <button onClick={openAdmin}>باز کردن مدیریت</button>
            <button
              className="ghost"
              onClick={() => {
                if (confirm("تغییرات این دستگاه پاک شود؟")) {
                  clearDraft();
                  window.location.reload();
                }
              }}
            >
              حذف تغییرات
            </button>
          </div>
        </div>
      )}

      <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
        <div className="container nav-inner">
          <a className="brand" href="#home" aria-label={`${brandName} — خانه`} onClick={closeMenu}>
            <SDMini />
            <span className="brand-name" dir="ltr">
              {c.brand.first}
              <span>{c.brand.second}</span>
              <sup>®</sup>
            </span>
          </a>

          <nav id="mobile-menu" className={`nav-links${menuOpen ? " is-open" : ""}`} aria-label="منوی اصلی">
            {c.nav.map((n) => (
              <a key={n.label + n.href} href={n.href} onClick={closeMenu}>
                {n.label}
              </a>
            ))}
            <button className="mobile-cta" onClick={() => openModal()}>
              {c.navCta}
            </button>
          </nav>

          <div className="nav-actions">
            <a className="phone-chip" href={phone} dir="ltr" aria-label={`تماس با ${c.contact.name}`}>
              <PhoneIcon />
              <span>{c.contact.phoneDisplay}</span>
            </a>
            <button className="btn btn-primary btn-sm" onClick={() => openModal()}>
              {c.navCta}
            </button>
            <button
              className={`burger${menuOpen ? " is-open" : ""}`}
              aria-label={menuOpen ? "بستن منو" : "باز کردن منو"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <main id="main">
        <section className="hero" id="home" aria-labelledby="hero-title">
          <div className="hero-bg" aria-hidden="true">
            <span className="blob b1" />
            <span className="blob b2" />
            <span className="blob b3" />
            <span className="hero-aurora" />
          </div>

          <div className="container hero-inner">
            <div className="hero-copy">
              <div className="hero-badge">
                <span className="pulse-dot" />
                {c.hero.badge}
              </div>
              <h1 id="hero-title">
                {c.hero.line1}
                <br />
                <span className="grad-cham">{c.hero.line2}</span>
                <br />
                {c.hero.line3}
              </h1>
              <p className="hero-sub">{c.hero.sub}</p>
              <div className="hero-actions">
                <a className="btn btn-primary btn-lg" href="#work">
                  {c.hero.primaryBtn}
                </a>
                <a className="btn btn-whatsapp btn-lg" href={waLink(c.contact.whatsapp, c.hero.whatsappMsg)} target="_blank" rel="noreferrer">
                  <WaIcon />
                  {c.hero.whatsappBtn}
                </a>
              </div>
              <div className="hero-stats">
                {c.hero.stats.map((s, i) => (
                  <div className="stat-wrap" key={i}>
                    {i > 0 && <i />}
                    <div className="stat">
                      <b>
                        <CountUp to={s.value} suffix={s.suffix} start={!loading} />
                      </b>
                      <span>{s.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hero-visual">
              <SDMasterpiece chipLive={c.hero.chipLive} chipEn={c.hero.chipEn} chipFa={c.hero.chipFa} />
            </div>
          </div>

          {c.projects.length > 0 && (
            <div className="container live-strip">
              <span className="live-strip-label">{c.hero.liveLabel}</span>
              <div className="live-pills">
                {c.projects.map((p) => (
                  <a key={p.id} href={p.url} target="_blank" rel="noreferrer" dir="ltr">
                    <i />
                    {p.urlLabel}
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>

        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {[0, 1].map((k) => (
              <div className="mq-seq" key={k} dir="ltr">
                {c.marquee.map((m, i) => (
                  <span key={i} className="mq-item">
                    <span>{m}</span>
                    {i % 2 === 0 ? <b>● LIVE</b> : <em>✦</em>}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <section className="section" id="services">
          <div className="container">
            <SectionHead h={c.headings.services} />
            <div className="services-grid">
              {c.services.map((s, i) => (
                <button className="service-card reveal" key={s.title + i} style={{ transitionDelay: `${(i % 3) * 90}ms` }} onClick={() => openModal(s.preset)}>
                  <span className="svc-icon">
                    <ServiceIcon name={s.icon} />
                  </span>
                  <span className="svc-en" dir="ltr">
                    {s.en}
                  </span>
                  <span className="svc-title">{s.title}</span>
                  <span className="svc-desc">{s.description}</span>
                  <span className="svc-link">
                    سفارش این خدمت <i>←</i>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {c.products.length > 0 && (
          <section className="section shop-section" id="shop">
            <div className="container">
              <SectionHead h={c.headings.products} />
              <Shop content={c} notify={notify} />
            </div>
          </section>
        )}

        <section className="section work-section" id="work">
          <div className="container">
            <SectionHead h={c.headings.work} />
            <div className="works-list">
              {c.projects.map((p) => (
                <article className={`work-card accent-${p.accent} reveal`} key={p.id}>
                  <a className="work-media" href={p.url} target="_blank" rel="noreferrer" aria-label={`مشاهده سایت ${p.faTitle}`}>
                    {p.image ? <img src={p.image} alt={p.imageAlt} loading="lazy" /> : <span className="work-noimg" dir="ltr">{p.enTitle}</span>}
                    <span className="live-badge">
                      <i />
                      LIVE
                    </span>
                    <span className="work-url" dir="ltr">
                      {p.urlLabel} ↗
                    </span>
                  </a>
                  <div className="work-body">
                    <span className="work-en" dir="ltr">
                      {p.enTitle} · {p.year}
                    </span>
                    <h3>
                      {p.faTitle} <small>— {p.category}</small>
                    </h3>
                    <p className="work-desc">{p.description}</p>
                    <ul className="work-feats">
                      {p.features.map((f) => (
                        <li key={f}>
                          <CheckIcon />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className="work-tags">
                      <span>{p.lang}</span>
                      {p.tags.map((t) => (
                        <span key={t} dir="ltr">
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="work-actions">
                      <a className="btn btn-primary" href={p.url} target="_blank" rel="noreferrer">
                        مشاهده سایت زنده ↗
                      </a>
                      <button className="btn btn-ghost" onClick={() => openModal("سایتی مشابه نمونه‌کارها")}>
                        می‌خوام مثل این داشته باشم
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {c.workNote && (
              <p className="work-note reveal">
                <span className="note-mark">*</span> {c.workNote}
              </p>
            )}
          </div>
        </section>

        <section className="section about-section" id="about">
          <div className="container">
            <SectionHead h={c.headings.about} />
            <div className="about-grid">
              <div className="founder-card reveal">
                <div className="founder-top">
                  <span className="founder-avatar" dir="ltr">
                    {c.about.avatar}
                  </span>
                  <div>
                    <h3>{c.contact.name}</h3>
                    <span>{c.contact.role}</span>
                  </div>
                </div>
                <p>{c.about.bio}</p>
                <div className="skill-chips" dir="ltr">
                  {c.about.skills.map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </div>
                <div className="founder-actions">
                  <a className="btn btn-whatsapp" href={waLink(c.contact.whatsapp, c.about.whatsappMsg)} target="_blank" rel="noreferrer">
                    <WaIcon />
                    {c.contact.whatsappLabel}
                  </a>
                  <a className="btn btn-ghost" href={phone} dir="ltr">
                    <PhoneIcon />
                    {c.contact.phoneDisplay}
                  </a>
                </div>
              </div>

              <div className="about-points">
                {c.about.points.map((pt, i) => (
                  <div className="point reveal" key={pt.t + i} style={{ transitionDelay: `${i * 90}ms` }}>
                    <span className="point-num" dir="ltr">
                      0{i + 1}
                    </span>
                    <div>
                      <b>{pt.t}</b>
                      <p>{pt.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="process">
          <div className="container">
            <SectionHead h={c.headings.process} />
            <div className="steps-grid">
              {c.steps.map((s, i) => (
                <article className="step reveal" key={s.n + i} style={{ transitionDelay: `${i * 90}ms` }}>
                  <span className="step-num">{s.n}</span>
                  <span className="step-en" dir="ltr">
                    {s.en}
                  </span>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section pricing-section" id="pricing">
          <div className="container">
            <SectionHead h={c.headings.pricing} />
            <div className="plans-grid">
              {c.plans.map((pl, i) => (
                <article className={`plan reveal${pl.featured ? " is-featured" : ""}`} key={pl.name + i} style={{ transitionDelay: `${i * 90}ms` }}>
                  {pl.featured && <span className="plan-badge">⭐ پیشنهاد ویژه</span>}
                  <span className="plan-en" dir="ltr">
                    {pl.en}
                  </span>
                  <h3>{pl.name}</h3>
                  <div className="plan-price">
                    <b>{pl.price}</b>
                    <span>{pl.unit}</span>
                  </div>
                  <p className="plan-desc">{pl.desc}</p>
                  <ul className="plan-feats">
                    {pl.features.map((f) => (
                      <li key={f}>
                        <CheckIcon />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button className={`btn btn-block${pl.featured ? " btn-primary" : " btn-ghost"}`} onClick={() => openModal(pl.preset)}>
                    سفارش {pl.name}
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        {c.support.length > 0 && (
          <section className="section support-section" id="support">
            <div className="container">
              <SectionHead h={c.headings.support} />
              <div className="support-grid">
                {c.support.map((s, i) => (
                  <article className="support-card reveal" key={s.title + i} style={{ transitionDelay: `${(i % 3) * 90}ms` }}>
                    <span className="svc-icon">
                      <ServiceIcon name={s.icon} />
                    </span>
                    <span className="svc-en" dir="ltr">
                      {s.en}
                    </span>
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                    <div className="support-foot">
                      <b>{s.price}</b>
                      <button className="btn btn-ghost btn-sm" onClick={() => openModal("پشتیبانی و توسعه")}>
                        درخواست <i>←</i>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="section terms-section" id="terms">
          <div className="container">
            <SectionHead h={c.headings.terms} />
            <div className="terms-grid">
              <div className="terms-main reveal">
                <p className="terms-intro">{c.terms.intro}</p>
                <ol className="pay-steps">
                  {c.terms.steps.map((s, i) => (
                    <li key={s.title + i}>
                      <span className="pay-percent">{s.percent}</span>
                      <div>
                        <b>{s.title}</b>
                        <p>{s.desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="pay-bar" aria-hidden="true">
                  {c.terms.steps.map((s, i) => (
                    <span key={i} style={{ flex: 1 }}>
                      {s.percent}
                    </span>
                  ))}
                </div>
              </div>
              <aside className="terms-side reveal">
                <h3>مفاد قرارداد</h3>
                <ol className="clauses">
                  {c.terms.clauses.map((cl, i) => (
                    <li key={i}>{cl}</li>
                  ))}
                </ol>
                {c.terms.cardNumber.trim() && (
                  <div className="card-box" dir="ltr">
                    <span>{c.terms.cardNumber}</span>
                    <small dir="rtl">به نام {c.terms.cardOwner}</small>
                  </div>
                )}
                <p className="terms-note">{c.terms.note}</p>
                <div className="terms-actions">
                  <button className="btn btn-primary" onClick={() => openModal()}>
                    ثبت سفارش با همین شرایط
                  </button>
                  <button
                    className="btn btn-ghost"
                    onClick={() => {
                      const txt = [
                        `قرارداد همکاری — ${brandName}`,
                        "",
                        c.terms.intro,
                        "",
                        ...c.terms.steps.map((s, i) => `${i + 1}) ${s.title} (${s.percent}): ${s.desc}`),
                        "",
                        "مفاد:",
                        ...c.terms.clauses.map((x, i) => `${i + 1}. ${x}`),
                        "",
                        c.terms.note,
                        `${c.contact.name} · ${c.contact.phoneDisplay}`,
                      ].join("\n");
                      navigator.clipboard?.writeText(txt).then(
                        () => notify("متن قرارداد کپی شد ✅"),
                        () => notify("کپی نشد؛ متن را دستی انتخاب کن"),
                      );
                    }}
                  >
                    کپی متن قرارداد
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="section" id="faq">
          <div className="container faq-wrap">
            <SectionHead h={c.headings.faq} />
            <div className="faq-list">
              {c.faqs.map((f, i) => (
                <div className="reveal" key={f.q + i}>
                  <div className={`faq-item${openFaq === i ? " is-open" : ""}`}>
                    <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}>
                      <span>{f.q}</span>
                      <i>{openFaq === i ? "−" : "+"}</i>
                    </button>
                    <div className="faq-a">
                      <p>{f.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section final-section" id="contact">
          <div className="container">
            <div className="final-panel reveal">
              <span className="final-sd" dir="ltr" aria-hidden="true">
                SD
              </span>
              <span className="eyebrow">{c.final.eyebrow}</span>
              <h2>
                {c.final.before} <span className="grad-cham">{c.final.highlight}</span> {c.final.after}
              </h2>
              <p>{c.final.sub}</p>
              <a className="final-phone" href={phone} dir="ltr">
                <PhoneIcon />
                {c.contact.phoneDisplay}
              </a>
              <div className="final-actions">
                <a className="btn btn-whatsapp btn-lg" href={waLink(c.contact.whatsapp, c.final.whatsappMsg)} target="_blank" rel="noreferrer">
                  <WaIcon />
                  {c.final.whatsappBtn}
                </a>
                <button className="btn btn-primary btn-lg" onClick={() => openModal()}>
                  {c.final.formBtn}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <a className="brand" href="#home" aria-label={`${brandName} — بازگشت به بالا`}>
                <SDMini />
                <span className="brand-name" dir="ltr">
                  {c.brand.first}
                  <span>{c.brand.second}</span>
                  <sup>®</sup>
                </span>
              </a>
              <p>{c.footer.about}</p>
            </div>
            <div className="footer-col">
              <span>{c.footer.quickTitle}</span>
              {c.nav.map((n) => (
                <a key={n.label + n.href} href={n.href}>
                  {n.label}
                </a>
              ))}
            </div>
            <div className="footer-col">
              <span>{c.footer.worksTitle}</span>
              {c.projects.map((p) => (
                <a key={p.id} href={p.url} target="_blank" rel="noreferrer" dir="ltr">
                  {p.urlLabel} ↗
                </a>
              ))}
            </div>
            <div className="footer-col">
              <span>{c.footer.contactTitle}</span>
              <a href={phone} dir="ltr">
                {c.contact.phoneDisplay}
              </a>
              <a href={waLink(c.contact.whatsapp, c.hero.whatsappMsg)} target="_blank" rel="noreferrer">
                واتساپ: پیام بده 💬
              </a>
              <button onClick={() => openModal()}>فرم سفارش پروژه 📝</button>
            </div>
          </div>
          <div className="footer-bottom">
            <span>{c.footer.copyright}</span>
            <span className="footer-made">{c.footer.made}</span>
            <button className="admin-gear" onClick={openAdmin} aria-label="مدیریت سایت" title="مدیریت سایت">
              ⚙
            </button>
          </div>
        </div>
      </footer>

      <a className="wa-float" href={waLink(c.contact.whatsapp, c.hero.whatsappMsg)} target="_blank" rel="noreferrer" aria-label={c.contact.whatsappLabel}>
        <span className="wa-ping" />
        <WaIcon />
      </a>

      <button className={`top-btn${showTop ? " is-visible" : ""}`} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="بازگشت به بالا">
        ↑
      </button>

      <ProjectModal open={modal.open} preset={modal.preset} onClose={closeModal} notify={notify} content={c} />

      <SalesAssistant content={c} notify={notify} onRequestForm={(preset) => openModal(preset)} />

      <div className={`toast${toast ? " is-visible" : ""}`} role="status" aria-live="polite">
        {toast}
      </div>
    </div>
  );
}
