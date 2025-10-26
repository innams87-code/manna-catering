console.log("JS loaded");

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM ready");

  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  const menu = document.getElementById("menu");
  const countEl = document.getElementById("count");
  const totalEl = document.getElementById("total");
  const clearBtn = document.getElementById("clear");

  if (!menu) {
    console.warn("No #menu section found");
    return;
  }

  function compute() {
    let count = 0, total = 0;
    menu.querySelectorAll("li.selected").forEach(li => {
      count++;
      total += Number(li.dataset.price || 0);
    });
    if (countEl) countEl.textContent = count;
    if (totalEl) totalEl.textContent = total.toFixed(2).replace(/\.00$/, "");
  }

  // Event delegation on the #menu container
  menu.addEventListener("click", (e) => {
    const li = e.target.closest("li");
    if (!li || !menu.contains(li)) return;
    li.classList.toggle("selected");
    compute();
  });

  menu.addEventListener("keydown", (e) => {
    const li = e.target.closest("li");
    if (!li || !menu.contains(li)) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      li.classList.toggle("selected");
      compute();
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      menu.querySelectorAll("li.selected").forEach(li => li.classList.remove("selected"));
      compute();
    });
  }

  compute();
});
// Build WhatsApp order from selected items
const waBtn = document.getElementById("waOrder");
const WA_NUMBER = "971509459509"; // <-- your number (no +)

if (waBtn) {
  waBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const menu = document.getElementById("menu");
    const selected = Array.from(menu.querySelectorAll("li.selected"));

    const items = selected
      .map(li => li.querySelector(".name")?.textContent.trim())
      .filter(Boolean);

    const total = selected.reduce((sum, li) => sum + Number(li.dataset.price || 0), 0);

    const msg = items.length
      ? `Hello Munna Catering, I'd like to order:\n- ${items.join("\n- ")}\n\nTotal: AED ${total}\nDelivery location: ____\nPreferred time: ____\nName: ____`
      : `Hello Munna Catering, I'd like to order.`;

    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  });
}
