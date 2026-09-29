/* =========================================================
   Nexo Tech IA — interacciones de la landing
   ========================================================= */

// Configuración: número de WhatsApp en formato internacional, sin "+" ni espacios.
// Colombia (+57) + número móvil.
const WHATSAPP_NUMBER = "573125579526";
const WHATSAPP_DEFAULT_MSG = "Hola Nexo Tech IA, quiero información sobre sus servicios.";

document.documentElement.classList.remove("no-js");

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const waLink = (text) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

/* ---------- Tema claro / oscuro ---------- */
const root = document.documentElement;
const themeToggle = $("#themeToggle");
const themeMeta = $('meta[name="theme-color"]');

const applyTheme = (theme) => {
  root.dataset.theme = theme;
  themeMeta.content = theme === "light" ? "#f6f9fe" : "#070b14";
  themeToggle.setAttribute("aria-label", theme === "light" ? "Cambiar a tema oscuro" : "Cambiar a tema claro");
};

applyTheme(root.dataset.theme || "light");

themeToggle.addEventListener("click", () => {
  const next = root.dataset.theme === "light" ? "dark" : "light";
  applyTheme(next);
  try { localStorage.setItem("theme", next); } catch (e) { /* almacenamiento no disponible */ }
});

/* ---------- Header: fondo al hacer scroll ---------- */
const header = $("#header");
const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 20);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

/* ---------- Menú móvil ---------- */
const nav = $("#nav");
const toggle = $("#navToggle");

const setMenu = (open) => {
  nav.classList.toggle("is-open", open);
  header.classList.toggle("menu-open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  document.body.style.overflow = open ? "hidden" : "";
};

toggle.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
$$("a", nav).forEach((link) => link.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));
window.matchMedia("(min-width: 900px)").addEventListener("change", (e) => e.matches && setMenu(false));

/* ---------- Enlace activo según la sección visible ---------- */
const navLinks = $$(".nav__link");
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) =>
        link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`)
      );
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
$$("main section[id]").forEach((s) => sectionObserver.observe(s));

/* ---------- Animación de aparición ---------- */
const revealObserver = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      obs.unobserve(entry.target);
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);

$$(".reveal").forEach((el, i) => {
  // Pequeño retraso escalonado para elementos en la misma fila
  el.style.transitionDelay = `${(i % 4) * 80}ms`;
  revealObserver.observe(el);
});

/* ---------- Contadores de cifras ---------- */
const animateCount = (el) => {
  const target = Number(el.dataset.count);
  const suffix = el.dataset.suffix || "";
  const duration = 1600;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const countObserver = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCount(entry.target);
      obs.unobserve(entry.target);
    });
  },
  { threshold: 0.6 }
);
$$("[data-count]").forEach((el) => countObserver.observe(el));

/* ---------- Reloj del monitor ---------- */
const clock = $("#monitorClock");
const updateClock = () => {
  clock.textContent = new Date().toLocaleTimeString("es-CO", { hour12: false });
};
updateClock();
setInterval(updateClock, 1000);

/* ---------- Botón flotante de WhatsApp ---------- */
$("#whatsappBtn").href = waLink(WHATSAPP_DEFAULT_MSG);

/* ---------- Formulario → WhatsApp ---------- */
const form = $("#contactForm");
const status = $("#formStatus");

const setStatus = (msg, type = "") => {
  status.textContent = msg;
  status.className = `form__status${type ? ` is-${type}` : ""}`;
};

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const fields = $$("input, select, textarea", form);
  let valid = true;

  fields.forEach((field) => {
    const ok = field.checkValidity() && (!field.required || field.value.trim() !== "");
    field.classList.toggle("is-invalid", !ok);
    if (!ok) valid = false;
  });

  if (!valid) {
    setStatus("Por favor completa los campos obligatorios.", "error");
    fields.find((f) => f.classList.contains("is-invalid"))?.focus();
    return;
  }

  const data = Object.fromEntries(new FormData(form));
  const message = [
    "Hola Nexo Tech IA, quiero una cotización.",
    `*Nombre:* ${data.nombre.trim()}`,
    `*Teléfono:* ${data.telefono.trim()}`,
    `*Servicio:* ${data.servicio}`,
    data.mensaje.trim() && `*Mensaje:* ${data.mensaje.trim()}`,
  ]
    .filter(Boolean)
    .join("\n");

  window.open(waLink(message), "_blank", "noopener");
  setStatus("¡Listo! Te estamos redirigiendo a WhatsApp.", "success");
  form.reset();
});

// Quitar el estado de error mientras el usuario corrige
form.addEventListener("input", (e) => e.target.classList.remove("is-invalid"));
form.addEventListener("change", (e) => e.target.classList.remove("is-invalid"));

/* ---------- Año del footer ---------- */
$("#year").textContent = new Date().getFullYear();
