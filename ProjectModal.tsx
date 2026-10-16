import { useEffect, useRef, useState, type FormEvent } from "react";
import { faNum, isValidPhone, telHref, toEnglishDigits, waLink, type SiteContent } from "../content";

interface Props {
  open: boolean;
  preset: string;
  onClose: () => void;
  notify: (msg: string) => void;
  content: SiteContent;
}

interface FormState {
  projectType: string;
  name: string;
  phone: string;
  contact: string;
  details: string;
  budget: string;
  agree: boolean;
}

type Errors = Partial<Record<"projectType" | "name" | "phone" | "contact" | "details" | "agree", string>>;

const EMPTY: FormState = {
  projectType: "",
  name: "",
  phone: "",
  contact: "",
  details: "",
  budget: "",
  agree: false,
};

function validEmailOrEmpty(value: string) {
  const n = toEnglishDigits(value.trim());
  if (!n) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(n) || /^@?[A-Za-z0-9_.]{3,}$/.test(n) || isValidPhone(n);
}

export function ProjectModal({ open, preset, onClose, notify, content }: Props) {
  const PROJECT_OPTIONS = content.form.projectOptions;
  const BUDGET_OPTIONS = content.form.budgetOptions;
  const CONTACT = content.contact;
  const brandName = content.brand.first + content.brand.second;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [reqText, setReqText] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        ...EMPTY,
        budget: BUDGET_OPTIONS[BUDGET_OPTIONS.length - 1] ?? "",
        projectType: PROJECT_OPTIONS.includes(preset) ? preset : "",
      });
      setErrors({});
      setStep(1);
      setDone(false);
      setReqText("");
      setCopied(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, preset]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    else if (!open && d.open) d.close();
  }, [open]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((c) => ({ ...c, [key]: value }));
    setErrors((c) => {
      const n = { ...c };
      delete (n as Record<string, string | undefined>)[key as string];
      return n;
    });
  }

  function nextStep(): boolean {
    const e: Errors = {};
    if (!form.projectType) e.projectType = "نوع پروژه رو انتخاب کن 👆";
    if (form.name.trim().length < 2) e.name = "اسمت رو بنویس (حداقل ۲ حرف).";
    if (!isValidPhone(form.phone)) e.phone = "شماره موبایل معتبر وارد کن (مثل 0912xxxxxxx) — برای تماس لازمه.";
    if (!validEmailOrEmpty(form.contact)) e.contact = "ایمیل یا آیدی معتبر بنویس (یا خالی بذار).";
    setErrors(e);
    if (Object.keys(e).length > 0) {
      requestAnimationFrame(() => {
        if (e.projectType)
          dialogRef.current?.querySelector<HTMLInputElement>('input[name="pt"]')?.focus();
        else if (e.name) document.getElementById("pm-name")?.focus();
        else if (e.phone) document.getElementById("pm-phone")?.focus();
        else document.getElementById("pm-contact")?.focus();
      });
      return false;
    }
    setStep(2);
    window.setTimeout(() => descRef.current?.focus(), 90);
    return true;
  }

  function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (step === 1) {
      nextStep();
      return;
    }
    if (form.details.trim().length < 20) {
      setErrors({ details: "حداقل ۲۰ کاراکتر بنویس تا بهتر راهنماییت کنم ✍️" });
      descRef.current?.focus();
      return;
    }
    if (!form.agree) {
      setErrors({ agree: "برای ادامه، شرایط قرارداد سه‌قسطی رو تأیید کن." });
      return;
    }
    const text = [
      `🚀 درخواست پروژه — ${brandName}`,
      `نوع پروژه: ${form.projectType}`,
      `نام: ${form.name.trim()}`,
      `📞 شماره تماس: ${toEnglishDigits(form.phone.trim())}`,
      form.contact.trim() ? `راه ارتباطی دیگر: ${form.contact.trim()}` : "",
      `بودجه: ${form.budget}`,
      `توضیحات: ${form.details.trim()}`,
      `✅ شرایط قرارداد سه‌قسطی (۱/۳ پیش‌پرداخت، ۱/۳ دموی HTML، ۱/۳ انتشار نهایی) را می‌پذیرم.`,
    ]
      .filter(Boolean)
      .join("\n");
    setReqText(text);
    setDone(true);
  }

  async function copyText() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(reqText);
      } else {
        throw new Error("no-clipboard");
      }
      setCopied(true);
      notify("متن درخواست کپی شد ✅");
    } catch {
      const t = document.createElement("textarea");
      t.value = reqText;
      t.style.position = "fixed";
      t.style.opacity = "0";
      document.body.appendChild(t);
      t.select();
      const ok = document.execCommand("copy");
      t.remove();
      setCopied(ok);
      notify(ok ? "متن درخواست کپی شد ✅" : "کپی نشد؛ دستی انتخابش کن");
    }
  }

  return (
    <dialog
      className="project-dialog"
      ref={dialogRef}
      aria-labelledby="pm-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dialog-inner" dir="rtl">
        <div className="dialog-head">
          <div>
            <span className="dialog-kicker" dir="ltr">
              LET'S BUILD SOMETHING GREAT
            </span>
            <h2 id="pm-title">{done ? "درخواستت آماده‌ست! 🎉" : "بگو چی تو ذهنته 👇"}</h2>
          </div>
          <button className="dialog-close" type="button" onClick={onClose} aria-label="بستن فرم">
            ×
          </button>
        </div>

        {!done ? (
          <form className="project-form" onSubmit={onSubmit} noValidate>
            <div className="steps-indicator" aria-label={`مرحله ${faNum(step)} از ${faNum(2)}`}>
              <span className={step === 1 ? "is-current" : "is-complete"}>
                {faNum(1)} <b>اطلاعات اولیه</b>
              </span>
              <i className={step === 2 ? "is-complete" : ""} />
              <span className={step === 2 ? "is-current" : ""}>
                {faNum(2)} <b>جزئیات پروژه</b>
              </span>
            </div>

            {step === 1 ? (
              <div className="form-step" key="s1">
                <fieldset
                  className="form-fieldset"
                  aria-describedby={errors.projectType ? "pm-type-err" : undefined}
                >
                  <legend>
                    چی می‌خوای بسازیم؟ <span>*</span>
                  </legend>
                  <div className="choice-grid">
                    {PROJECT_OPTIONS.map((opt, i) => (
                      <label className="choice" key={opt}>
                        <input
                          type="radio"
                          name="pt"
                          value={opt}
                          checked={form.projectType === opt}
                          onChange={() => update("projectType", opt)}
                        />
                        <span className="choice-box">
                          <i>{faNum(i + 1)}</i>
                          {opt}
                          <b>+</b>
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.projectType && (
                    <span className="field-error" id="pm-type-err" role="alert">
                      {errors.projectType}
                    </span>
                  )}
                </fieldset>

                <div className="form-2col">
                  <div className="field">
                    <label htmlFor="pm-name">
                      اسمت <span>*</span>
                    </label>
                    <input
                      id="pm-name"
                      autoComplete="name"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="مثلاً: علی رضایی"
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? "pm-name-err" : undefined}
                    />
                    {errors.name && (
                      <span className="field-error" id="pm-name-err" role="alert">
                        {errors.name}
                      </span>
                    )}
                  </div>
                  <div className="field">
                    <label htmlFor="pm-phone">
                      شماره تماس <span>*</span>
                    </label>
                    <input
                      id="pm-phone"
                      type="tel"
                      inputMode="tel"
                      dir="ltr"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      placeholder="0912 345 6789"
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? "pm-phone-err" : "pm-phone-hint"}
                    />
                    {errors.phone ? (
                      <span className="field-error" id="pm-phone-err" role="alert">
                        {errors.phone}
                      </span>
                    ) : (
                      <span className="field-hint" id="pm-phone-hint">
                        برای هماهنگی تلفنی — محرمانه می‌مونه.
                      </span>
                    )}
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="pm-contact">
                    ایمیل یا آیدی تلگرام / اینستاگرام <small>(اختیاری)</small>
                  </label>
                  <input
                    id="pm-contact"
                    autoComplete="email"
                    value={form.contact}
                    onChange={(e) => update("contact", e.target.value)}
                    placeholder="you@example.com یا @username"
                    aria-invalid={Boolean(errors.contact)}
                    aria-describedby={errors.contact ? "pm-contact-err" : undefined}
                  />
                  {errors.contact && (
                    <span className="field-error" id="pm-contact-err" role="alert">
                      {errors.contact}
                    </span>
                  )}
                </div>

                <button className="btn btn-primary btn-block" type="submit">
                  ادامه <span className="arrow-icon">←</span>
                </button>
              </div>
            ) : (
              <div className="form-step" key="s2">
                <div className="field">
                  <label htmlFor="pm-details">
                    درباره کارت بگو <span>*</span>
                  </label>
                  <textarea
                    ref={descRef}
                    id="pm-details"
                    value={form.details}
                    onChange={(e) => update("details", e.target.value)}
                    placeholder="کسب‌وکارت چیه؟ چی می‌خوای بهش اضافه بشه؟ هرچی می‌دونی بنویس..."
                    rows={4}
                    aria-invalid={Boolean(errors.details)}
                    aria-describedby={errors.details ? "pm-details-err" : "pm-details-hint"}
                  />
                  <div className="field-meta">
                    {errors.details ? (
                      <span className="field-error" id="pm-details-err" role="alert">
                        {errors.details}
                      </span>
                    ) : (
                      <span id="pm-details-hint">هرقدر بیشتر بگی، پیشنهاد دقیق‌تری می‌گیری.</span>
                    )}
                    <span>
                      {faNum(form.details.trim().length)} / حداقل {faNum(20)}
                    </span>
                  </div>
                </div>

                <fieldset className="form-fieldset budget-fieldset">
                  <legend>
                    بودجه تقریبی <small>اختیاری</small>
                  </legend>
                  <div className="budget-grid">
                    {BUDGET_OPTIONS.map((opt) => (
                      <label className="budget" key={opt}>
                        <input
                          type="radio"
                          name="budget"
                          value={opt}
                          checked={form.budget === opt}
                          onChange={() => update("budget", opt)}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <label className={`agree-box${errors.agree ? " has-error" : ""}`}>
                  <input type="checkbox" checked={form.agree} onChange={(e) => update("agree", e.target.checked)} />
                  <span>
                    <b>شرایط قرارداد سه‌قسطی</b> را خواندم و می‌پذیرم: ۱/۳ پیش‌پرداخت · ۱/۳ پس از دموی واقعی (HTML) · ۱/۳ پس از انتشار نهایی.{" "}
                    <a href="#terms" onClick={onClose}>
                      مشاهده کامل قرارداد ↗
                    </a>
                  </span>
                </label>
                {errors.agree && (
                  <span className="field-error" role="alert">
                    {errors.agree}
                  </span>
                )}

                <div className="form-actions">
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setErrors({});
                    }}
                  >
                    <span className="arrow-icon flip">←</span> برگشت
                  </button>
                  <button className="btn btn-primary" type="submit">
                    آماده‌سازی درخواست 🚀
                  </button>
                </div>
              </div>
            )}

            <p className="privacy-note">
              با ادامه، درخواستت آماده ارسال در واتساپ می‌شه — ارسال نهایی رو خودت تایید می‌کنی.
            </p>
          </form>
        ) : (
          <div className="success-box">
            <div className="success-tick">
              <span>✓</span>
            </div>
            <p className="success-intro">
              عالیه {form.name.trim() || "رفیق"}! 🎯 حالا درخواستت رو با یه کلیک توی واتساپ برام
              بفرست تا سریع جوابت رو بدم.
            </p>
            <label className="preview-label" htmlFor="pm-preview">
              پیش‌نمایش درخواست
            </label>
            <textarea id="pm-preview" className="req-preview" value={reqText} readOnly rows={7} />
            <div className="success-actions">
              <a
                className="btn btn-whatsapp"
                href={waLink(CONTACT.whatsapp, reqText)}
                target="_blank"
                rel="noreferrer"
              >
                ارسال در واتساپ
                <svg className="wa-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-2.9.8.8-2.8-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4 0-.5.1-.7l.4-.5c.1-.2.1-.3 0-.5L9.6 8c-.1-.3-.3-.3-.5-.3h-.4c-.1 0-.4.1-.6.4-.2.3-.8.8-.8 2s.8 2.3 1 2.5c.1.2 1.7 2.6 4.1 3.6.6.2 1 .4 1.4.5.6.2 1.1.2 1.5.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2l-.6-.3Z" />
                </svg>
              </a>
              <button className="btn btn-ghost" type="button" onClick={copyText}>
                {copied ? "کپی شد ✓" : "کپی متن"}
              </button>
              <a className="btn btn-ghost" href={telHref(CONTACT.phoneRaw)}>
                تماس: {CONTACT.phoneDisplay}
              </a>
            </div>
            <button
              className="edit-link"
              type="button"
              onClick={() => {
                setDone(false);
                setStep(2);
              }}
            >
              ویرایش اطلاعات
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
}
