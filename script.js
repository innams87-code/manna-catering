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
