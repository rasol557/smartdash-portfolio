import { useEffect, useRef, useState } from "react";
import {
  SalesConversation,
  type Message,
  type SalesIntent,
  type SalesAction,
} from "../salesEngine";
import { telHref, waLink, type SiteContent } from "../content";

interface Props {
  content: SiteContent;
  notify: (msg: string) => void;
  onRequestForm: (preset: string) => void;
}

const TYPING_DELAY = 12;
const INITIAL_DELAY = 600;

function intentLabel(intent?: SalesIntent): string {
  if (!intent) return "گفتگو";
  const map: Record<SalesIntent, string> = {
    greeting: "خوش‌آمدگویی",
    smalltalk: "گفتگوی دوستانه",
    confused: "نیاز به روشن‌شدن",
    goodbye: "خداحافظی",
    "site-from-scratch": "سایت از صفر",
    redesign: "بازطراحی",
    ecommerce: "فروشگاه اینترنتی",
    booking: "سامانه رزرو",
    price: "بحث قیمت",
    time: "زمان تحویل",
    sample: "نمونه‌کار",
    compare: "مقایسه",
    support: "پشتیبانی",
    ready: "آماده‌ی خرید",
    objection: "پاسخ به اعتراض",
    fallback: "کشف نیاز",
  };
  return map[intent] ?? "گفتگو";
}

function ActionButton({ action, content, onRequestForm, notify }: { action: SalesAction; content: SiteContent; notify: (m: string) => void; onRequestForm: (p: string) => void }) { void notify;
  if (action.kind === "open-form") {
    return (
      <button
        type="button"
        className="sa-action sa-action-form"
        onClick={() => onRequestForm(action.preset)}
      >
        📝 پر کردن فرم سفارش
      </button>
    );
  }
  if (action.kind === "open-whatsapp") {
    const href = waLink(content.contact.whatsapp, action.text);
    return (
      <a className="sa-action sa-action-wa" href={href} target="_blank" rel="noreferrer">
        💬 ارسال در واتساپ
      </a>
    );
  }
  if (action.kind === "open-phone") {
    return (
      <a className="sa-action sa-action-phone" href={telHref(content.contact.phoneRaw)}>
        📞 تماس با {content.contact.phoneDisplay}
      </a>
    );
  }
  if (action.kind === "open-link") {
    return (
      <a className="sa-action sa-action-link" href={action.url} target={action.url.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
        ↗ {action.label}
      </a>
    );
  }
  return null;
}

function SuggestionChips({ items, onPick }: { items: string[]; onPick: (s: string) => void }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="sa-suggestions" role="listbox" aria-label="پیشنهادها">
      {items.map((s) => (
        <button type="button" key={s} className="sa-suggestion" onClick={() => onPick(s)}>
          {s}
        </button>
      ))}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="sa-msg sa-msg-bot" aria-label="دستیار در حال نوشتن">
      <div className="sa-avatar" aria-hidden="true">
        SD
      </div>
      <div className="sa-bubble sa-typing">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

function MessageRow({ message, content, onRequestForm, notify }: { message: Message; content: SiteContent; onRequestForm: (p: string) => void; notify: (m: string) => void }) { void notify;
  if (message.role === "user") {
    return (
      <div className="sa-msg sa-msg-user">
        <div className="sa-bubble sa-bubble-user">{message.text}</div>
      </div>
    );
  }
  return (
    <div className="sa-msg sa-msg-bot">
      <div className="sa-avatar" aria-hidden="true">
        SD
      </div>
      <div className="sa-bubble-group">
        {message.intent && (
          <span className={`sa-tag sa-tag-${message.intent}`}>{intentLabel(message.intent)}</span>
        )}
        <div className="sa-bubble sa-bubble-bot">
          {message.text.split("\n\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        {message.actions && message.actions.length > 0 && (
          <div className="sa-actions">
            {message.actions.map((a, i) => (
              <ActionButton key={i} action={a} content={content} notify={notify} onRequestForm={onRequestForm} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function SalesAssistant({ content, notify, onRequestForm }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const convRef = useRef<SalesConversation | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [renderKey, setRenderKey] = useState(0);

  function ensure() {
    if (!convRef.current) {
      convRef.current = SalesConversation.load(content);
    }
    return convRef.current;
  }

  useEffect(() => {
    if (!content.sales.enabled) return;
    const conv = ensure();
    if (conv.history.length === 0) {
      setTyping(true);
      const timer = window.setTimeout(() => {
        conv.greeting();
        conv.save();
        setTyping(false);
        setRenderKey((k) => k + 1);
        if (!open) setUnread((n) => n + 1);
      }, INITIAL_DELAY);
      return () => window.clearTimeout(timer);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content.sales.enabled]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      window.requestAnimationFrame(() => {
        const el = scrollRef.current;
        if (el) el.scrollTop = el.scrollHeight;
      });
    }
  }, [open, renderKey, typing]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest("[data-open-modal]")) {
        setOpen(false);
      }
    };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  if (!content.sales.enabled) return null;

  function send(text: string) {
    const cleaned = text.trim();
    if (!cleaned) return;
    const conv = ensure();
    setDraft("");
    setTyping(true);
    const delay = 400 + Math.min(2200, cleaned.length * TYPING_DELAY);
    window.setTimeout(() => {
      conv.step(cleaned);
      conv.save();
      setTyping(false);
      setRenderKey((k) => k + 1);
      if (!open) setUnread((n) => n + 1);
    }, delay);
  }

  const conv = convRef.current;
  const messages = conv ? conv.history : [];

  return (
    <div className={`sa-root${open ? " is-open" : ""}`} dir="rtl">
      <button
        type="button"
        className="sa-fab"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="sales-panel"
        aria-label={content.sales.fabLabel}
      >
        <span className="sa-fab-pulse" />
        <span className="sa-fab-icon" aria-hidden="true">
          💬
        </span>
        <span className="sa-fab-text">{content.sales.fabLabel}</span>
        {unread > 0 && open === false && <span className="sa-fab-badge">{faNum(unread)}</span>}
      </button>

      {open && (
        <section
          className="sa-panel"
          id="sales-panel"
          role="dialog"
          aria-label={content.sales.windowTitle}
        >
          <header className="sa-head">
            <div className="sa-head-info">
              <span className="sa-head-avatar" aria-hidden="true">
                SD
              </span>
              <div>
                <strong>{content.sales.windowTitle}</strong>
                <small>
                  <span className="sa-online" /> پاسخ‌گوی زنده
                </small>
              </div>
            </div>
            <button
              type="button"
              className="sa-close"
              onClick={() => setOpen(false)}
              aria-label="بستن گفتگو"
            >
              ×
            </button>
          </header>

          <div className="sa-scroll" ref={scrollRef}>
            <div className="sa-intro">
              <strong>سلام! 👋 من دستیار فروش SMARTDESH هستم.</strong>
              <span>پاسخ‌هایم سریع و فارسی هستن. اگه سؤالی داشتی یا بخوای مستقیم با رسول حرف بزنی، از دکمه‌ی واتساپ استفاده کن.</span>
            </div>
            {messages.map((m) => (
              <MessageRow key={m.id} message={m} content={content} onRequestForm={onRequestForm} notify={notify} />
            ))}
            {typing && <TypingIndicator />}
          </div>

          <SuggestionChips
            items={typing ? [] : messages.length > 0 ? messages[messages.length - 1]?.suggestions ?? [] : []}
            onPick={(s) => send(s)}
          />

          <form
            className="sa-input"
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
          >
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="پیامت رو بنویس..."
              aria-label="پیام"
              dir="auto"
            />
            <button type="submit" aria-label="ارسال">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </button>
          </form>

          <footer className="sa-foot">
            <span>پاسخ‌ها بر اساس تنظیمات پنل سایت ساخته می‌شن. برای مذاکره‌ی واقعی، دکمه‌ی واتساپ بزن.</span>
            <button
              type="button"
              className="sa-reset"
              onClick={() => {
                SalesConversation.clearStored();
                const fresh = new SalesConversation(content);
                fresh.greeting();
                fresh.save();
                convRef.current = fresh;
                setRenderKey((k) => k + 1);
                notify("گفتگوی جدید شروع شد");
              }}
            >
              شروع تازه
            </button>
          </footer>
        </section>
      )}
    </div>
  );
}

function faNum(n: number) {
  return String(n).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}
