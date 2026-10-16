import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

/*
  نسخه‌ی خام HTML را قبل از رندر React نگه می‌داریم.
  پنل مدیریت از همین نسخه برای ساخت index.html جدید (با محتوای ویرایش‌شده)
  استفاده می‌کند — کاملاً آفلاین و بدون نیاز به سرور.
*/
window.__SD_RAW_HTML__ = "<!doctype html>\n" + document.documentElement.outerHTML;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
