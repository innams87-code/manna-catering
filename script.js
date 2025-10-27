// Debug so we know the script is running
console.log("JS loaded");
const summary = document.getElementById("summary");
const summaryList = document.getElementById("summaryList");
document.addEventListener("DOMContentLoaded", () => {
console.log("DOM ready");

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
const plus = e.target.closest(".plus");
const minus = e.target.closest(".minus");
const li = e.target.closest("li");
if (!li || !menu.contains(li)) return;
  if (plus) {
  setQty(li, Number(li.dataset.qty || 0) + 1);
  return;
}
if (minus) {
  setQty(li, Number(li.dataset.qty || 0) - 1);
  return;
}
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
