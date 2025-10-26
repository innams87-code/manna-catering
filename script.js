// Auto year in footer
const y = document.getElementById("year");
if (y) y.textContent = new Date().getFullYear();

// Selection + total
const items = document.querySelectorAll("#menu li");
const countEl = document.getElementById("count");
const totalEl = document.getElementById("total");
const clearBtn = document.getElementById("clear");

function compute() {
  let count = 0, total = 0;
  document.querySelectorAll("#menu li.selected").forEach(li => {
    count++;
    total += Number(li.dataset.price || 0);
  });
  if (countEl) countEl.textContent = count;
  if (totalEl) totalEl.textContent = total.toFixed(2).replace(/\.00$/, "");
}

function toggle(li) {
  li.classList.toggle("selected");
  compute();
}

items.forEach(li => {
  li.style.cursor = "pointer";
  li.setAttribute("role", "button");
  li.setAttribute("tabindex", "0");
  li.addEventListener("click", () => toggle(li));
  li.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(li); }
  });
});

if (clearBtn) clearBtn.addEventListener("click", () => {
  items.forEach(li => li.classList.remove("selected"));
  compute();
});

compute();
