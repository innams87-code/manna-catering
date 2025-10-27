// Debug so we know the script is running
console.log("JS loaded");
const summary = document.getElementById("summary");
const summaryList = document.getElementById("summaryList");
document.addEventListener("DOMContentLoaded", () => {
  // ... your existing references and qty-controls code above ...

  // After you define: const items = Array.from(menu.querySelectorAll("li"));
  // and after you add .qty controls, add these:

  const STORAGE_KEY = "mc_cart_v1";

  function saveCart() {
    const state = items.map(li => Number(li.dataset.qty || 0));
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
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
    } catch (e) {
      console.warn("loadCart error", e);
    }
  }

  // In your compute() function, after you update count/total/summary, add:
  // saveCart();
  // and also keep this line to disable WA when total is 0:
  // if (waBtn) waBtn.toggleAttribute("disabled", total === 0);

  // Example compute() body (keep your summary logic):
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

    // Save after every change
    saveCart();
  }

  // In your Clear button handler, also clear storage:
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      items.forEach(li => {
        li.dataset.qty = "0";
        const q = li.querySelector(".q"); if (q) q.textContent = "0";
        li.classList.remove("selected");
      });
      try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
      compute();
    });
  }

  // Load saved quantities on page load and then compute
  loadCart();
  compute();

  // ... rest of your code (WhatsApp handler etc.) ...
});

// Footer year
const y = document.getElementById("year");
if (y) y.textContent = new Date().getFullYear();

const menu = document.getElementById("menu");
const countEl = document.getElementById("count");
const totalEl = document.getElementById("total");
const clearBtn = document.getElementById("clear");

if (!menu) return;

// Enhance each item with qty controls
const items = Array.from(menu.querySelectorAll("li"));
items.forEach(li => {
// Start qty at 0
if (!li.dataset.qty) li.dataset.qty = "0";
  // Add controls only once
if (!li.querySelector(".qty")) {
  const qty = document.createElement("div");
  qty.className = "qty";
  qty.innerHTML = `
    <button class="minus" type="button" aria-label="decrease">−</button>
    <span class="q">${li.dataset.qty}</span>
    <button class="plus" type="button" aria-label="increase">+</button>
  `;
  li.appendChild(qty);
}});

function setQty(li, newQty) {
newQty = Math.max(0, Math.min(99, Number(newQty) || 0));
li.dataset.qty = String(newQty);
const q = li.querySelector(".q");
if (q) q.textContent = newQty;
if (newQty > 0) li.classList.add("selected");
else li.classList.remove("selected");
compute();
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
}

// Event delegation: +, −, or li body toggle (0 ↔ 1)
menu.addEventListener("click", (e) => {
  // 1) Group action buttons
  const gbtn = e.target.closest(".group-actions .btn");
  if (gbtn) {
    e.preventDefault();
    const gid = gbtn.dataset.group;          // "mains" | "breads" | "drinks"
    const action = gbtn.dataset.action;      // "add1" | "clear"
    const lis = document.querySelectorAll(`#${gid} li`);
    lis.forEach(li => {
      const current = Number(li.dataset.qty || 0);
      setQty(li, action === "add1" ? current + 1 : 0);
    });
    return;
  }

  // 2) Item-level + / − controls
  const plus = e.target.closest(".plus");
  const minus = e.target.closest(".minus");
  const li = e.target.closest("li");
  if (!li || !menu.contains(li)) return;

  if (plus) { setQty(li, Number(li.dataset.qty || 0) + 1); return; }
  if (minus) { setQty(li, Number(li.dataset.qty || 0) - 1); return; }

  // 3) Click on the item (not on qty controls): toggle 0 ↔ 1
  if (!e.target.closest(".qty")) {
    const current = Number(li.dataset.qty || 0);
    setQty(li, current === 0 ? 1 : 0);
  }
});
// Clear all
if (clearBtn) {
clearBtn.addEventListener("click", () => {
items.forEach(li => setQty(li, 0));
});
}

// WhatsApp order with quantities
const waBtn = document.getElementById("waOrder");
const WA_NUMBER = "971509459509"; // your number (no +)

if (waBtn) {
waBtn.addEventListener("click", (e) => {
e.preventDefault();
    const lines = [];
  items.forEach(li => {
    const qty = Number(li.dataset.qty || 0);
    if (qty > 0) {
      const name = li.querySelector(".name")?.textContent.trim() || "Item";
      lines.push(`${name} x${qty}`);
    }
  });

  const total = items.reduce((sum, li) => {
    return sum + Number(li.dataset.qty || 0) * Number(li.dataset.price || 0);
  }, 0);

  const msg = lines.length
    ? `Hello Munna Catering, I'd like to order:\n- ${lines.join("\n- ")}\n\nTotal: AED ${total}\nDelivery location: ____\nPreferred time: ____\nName: ____`
    : `Hello Munna Catering, I'd like to order.`;

  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
});
  }

compute();
});
