// MC build v16
console.log('MC build v16 loaded');
console.log('Munna site loaded'); // <-- add this line
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM ready v16");
  const printBtn = document.getElementById("print");
const copyBtn  = document.getElementById("copy");

if (printBtn) printBtn.addEventListener("click", () => window.print());

if (copyBtn) {
  copyBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const { msg } = buildOrderMessage(); // uses the same function as WhatsApp
    try {
      await navigator.clipboard.writeText(msg);
      copyBtn.textContent = "Copied!";
    } catch (_) {
      // Fallback for older Safari
      const ta = document.createElement("textarea");
      ta.value = msg;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      copyBtn.textContent = "Copied!";
    }
    setTimeout(() => (copyBtn.textContent = "Copy order"), 1200);
  });
}



  // Elements
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  const menu = document.getElementById("menu");
  const countEl = document.getElementById("count");
  const totalEl = document.getElementById("total");
  const clearBtn = document.getElementById("clear");
  const waBtn = document.getElementById("waOrder");
  const summary = document.getElementById("summary");
  const summaryList = document.getElementById("summaryList");

  if (!menu) { console.warn("No #menu found"); return; }

  const items = Array.from(menu.querySelectorAll("li"));

  // Add qty controls
  items.forEach(li => {
    if (!li.dataset.qty) li.dataset.qty = "0";
    if (!li.querySelector(".qty")) {
      const qty = document.createElement("div");
      qty.className = "qty";
      qty.innerHTML = `
        <button class="minus" type="button" aria-label="decrease">−</button>
        <span class="q">${li.dataset.qty}</span>
        <button class="plus" type="button" aria-label="increase">+</button>
      `;
      li.appendChild(qty);
    }
  });

  // Storage helpers
  const STORAGE_KEY = "mc_cart_v1";
  function saveCart() {
    try {
      const state = items.map(li => Number(li.dataset.qty || 0));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {}
  }
  function loadCart() {
    try {
      const state = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      state.forEach((qty, i) => {
        if (!items[i]) return;
        qty = Number(qty) || 0;
        items[i].dataset.qty = String(qty);
        const q = items[i].querySelector(".q");
        if (q) q.textContent = qty;
        if (qty > 0) items[i].classList.add("selected");
        else items[i].classList.remove("selected");
      });
    } catch (e) { console.warn("loadCart error", e); }
  }

  function compute() {
    let itemsCount = 0, total = 0;
    const lines = [];

    items.forEach(li => {
      const qty = Number(li.dataset.qty || 0);
      if (!qty) return;
      const name = (li.querySelector(".name")?.textContent || "Item").trim();
      const price = Number(li.dataset.price || 0);
      const lineTotal = qty * price;

      itemsCount += qty;
      total += lineTotal;
      lines.push({ name, qty, lineTotal });
    });

    if (countEl) countEl.textContent = itemsCount;
    if (totalEl) totalEl.textContent = total.toFixed(2).replace(/\.00$/, "");
    if (waBtn) waBtn.toggleAttribute("disabled", total === 0);
    if (waBtn)   waBtn.toggleAttribute("disabled", total === 0);
if (printBtn) printBtn.toggleAttribute("disabled", total === 0);
if (copyBtn)  copyBtn.toggleAttribute("disabled", total === 0);

    if (summary && summaryList) {
      if (lines.length === 0) {
        summary.classList.add("hidden");
        summaryList.innerHTML = "";
      } else {
        summary.classList.remove("hidden");
        summaryList.innerHTML = lines
          .map(r => `<li><span>${r.name} x${r.qty}</span><strong>AED ${r.lineTotal}</strong></li>`)
          .join("");
      }
    }

    saveCart();
  }

  // Clicks: group buttons, +/−, item toggle
  menu.addEventListener("click", (e) => {
    // Group buttons (+1 each / Clear)
    const gbtn = e.target.closest(".group-actions .btn");
    if (gbtn) {
      e.preventDefault();
      const gid = gbtn.dataset.group;
      const action = gbtn.dataset.action;
      const lis = document.querySelectorAll(`#${gid} li`);
      lis.forEach(li => {
        const current = Number(li.dataset.qty || 0);
        setQty(li, action === "add1" ? current + 1 : 0);
      });
      return;
    }

    const plus = e.target.closest(".plus");
    const minus = e.target.closest(".minus");
    const li = e.target.closest("li");
    if (!li || !menu.contains(li)) return;

    if (plus) { setQty(li, Number(li.dataset.qty || 0) + 1); return; }
    if (minus) { setQty(li, Number(li.dataset.qty || 0) - 1); return; }

    if (!e.target.closest(".qty")) {
      const current = Number(li.dataset.qty || 0);
      setQty(li, current === 0 ? 1 : 0);
    }
  });

  function setQty(li, newQty) {
    newQty = Math.max(0, Math.min(99, Number(newQty) || 0));
    li.dataset.qty = String(newQty);
    const q = li.querySelector(".q");
    if (q) q.textContent = newQty;
    if (newQty > 0) li.classList.add("selected");
    else li.classList.remove("selected");
    compute();
  }

  // Clear all
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      items.forEach(li => setQty(li, 0));
      try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
      compute();
    });
  }

  // WhatsApp order
  function buildOrderMessage() {
    const lines = [];
    let total = 0;
    items.forEach(li => {
      const qty = Number(li.dataset.qty || 0);
      if (qty > 0) {
        const name = li.querySelector(".name")?.textContent.trim() || "Item";
        const price = Number(li.dataset.price || 0);
        total += qty * price;
        lines.push(`${name} x${qty}`);
      }
    });
    const msg = lines.length
      ? `Hello Munna Catering, I'd like to order:\n- ${lines.join("\n- ")}\n\nTotal: AED ${total}\nDelivery location: ____\nPreferred time: ____\nName: ____`
      : `Hello Munna Catering, I'd like to order.`;
    return { msg, total };
  }

  const WA_NUMBER = "971509459509"; // no +, no spaces
  if (waBtn) {
    waBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const { msg } = buildOrderMessage();
      const isMobile = /Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent);
      const url = isMobile
        ? `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`
        : `https://web.whatsapp.com/send?phone=${WA_NUMBER}&text=${encodeURIComponent(msg)}`;
      const opened = window.open(url, "_blank", "noopener");
      if (!opened || opened.closed || typeof opened.closed === "undefined") {
        window.location.href = url;
      }
    });
  }

  // Load and compute
  loadCart();
  compute();
});
