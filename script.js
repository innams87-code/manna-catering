// MC build v16
console.log('MC build v16 loaded');
console.log('Munna site loaded');
// Save/load customer details
const CUST_KEY = 'mc_customer_v1';

function saveCustomer() {
  const data = {
    name: nameEl?.value || '',
    loc:  locEl?.value || '',
    time: timeEl?.value || ''
  };
  try { localStorage.setItem(CUST_KEY, JSON.stringify(data)); } catch (e) {}
}

function loadCustomer() {
  try {
    const data = JSON.parse(localStorage.getItem(CUST_KEY) || '{}');
    if (nameEl && data.name) nameEl.value = data.name;
    if (locEl  && data.loc)  locEl.value  = data.loc;
    if (timeEl && data.time) timeEl.value = data.time;
  } catch (e) {}
}

[nameEl, locEl, timeEl].forEach(el => el?.addEventListener('input', saveCustomer));
loadCustomer();
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM ready v16');

  // Format helper: 60 -> "60", 60.5 -> "60.50"
  const fmt = (n) => Number(n).toFixed(2).replace(/\.00$/, '');

  // Elements
  const printBtn = document.getElementById('print');
  const copyBtn  = document.getElementById('copy');

  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Customer fields (optional, if present in HTML)
  const nameEl = document.getElementById('cust-name');
  const locEl  = document.getElementById('cust-location');
  const timeEl = document.getElementById('cust-time');

  const menu = document.getElementById('menu');
  const countEl = document.getElementById('count');
  const totalEl = document.getElementById('total');
  const clearBtn = document.getElementById('clear');
  const waBtn = document.getElementById('waOrder');
  const summary = document.getElementById('summary');
  const summaryList = document.getElementById('summaryList');
  const summaryTotalEl = document.getElementById('summaryTotal');
  const receiptTimeEl = document.getElementById('receipt-time');
  const receiptCustomerEl = document.getElementById('receipt-customer');

  if (!menu) { console.warn('No #menu found'); return; }

  // Only menu items with a price
  const items = [...menu.querySelectorAll('li[data-price]')];

  // Add qty controls if missing
  items.forEach(li => {
    if (!li.dataset.qty) li.dataset.qty = '0';
    if (!li.querySelector('.qty')) {
      const qty = document.createElement('div');
      qty.className = 'qty';
      qty.innerHTML = `
        <button class="minus" type="button" aria-label="decrease">−</button>
        <span class="q">${li.dataset.qty}</span>
        <button class="plus" type="button" aria-label="increase">+</button>
      `;
      li.appendChild(qty);
    }
  });

  // Storage
  const STORAGE_KEY = 'mc_cart_v26';
  function saveCart() {
    try {
      const state = items.map(li => Number(li.dataset.qty || 0));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {}
  }
  function loadCart() {
    try {
      const state = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      state.forEach((qty, i) => {
        if (!items[i]) return;
        qty = Number(qty) || 0;
        items[i].dataset.qty = String(qty);
        const q = items[i].querySelector('.q');
        if (q) q.textContent = qty;
        items[i].classList.toggle('selected', qty > 0);
      });
    } catch (e) { console.warn('loadCart error', e); }
  }

  function compute() {
    let itemsCount = 0, total = 0;
    const lines = [];

    for (const li of items) {
      const qty = Number(li.dataset.qty || 0);
      if (!qty) continue;
      const name = li.querySelector('.name')?.textContent.trim() || 'Item';
      const price = Number(li.dataset.price || 0);
      const lineTotal = qty * price;

      itemsCount += qty;
      total += lineTotal;
      lines.push({ name, qty, lineTotal });
    }

    if (countEl) countEl.textContent = itemsCount;
    if (totalEl) totalEl.textContent = fmt(total);

    const disable = total === 0;
    if (waBtn) waBtn.disabled = disable;
    if (printBtn) printBtn.disabled = disable;
    if (copyBtn) copyBtn.disabled = disable;
    const hasCustomer = (nameEl?.value?.trim() && locEl?.value?.trim());
if (waBtn) waBtn.disabled = (total === 0) || !hasCustomer;

    if (summaryTotalEl) summaryTotalEl.textContent = fmt(total);

    if (summary && summaryList) {
      if (lines.length === 0) {
        summary.classList.add('hidden');
        summaryList.innerHTML = '';
      } else {
        summary.classList.remove('hidden');
        summaryList.innerHTML = lines
          .map(r => `<li><span>${r.name} x${r.qty}</span><strong>AED ${fmt(r.lineTotal)}</strong></li>`)
          .join('');
      }
    }

    saveCart();
  }

  function setQty(li, newQty) {
    newQty = Math.max(0, Math.min(99, Number(newQty) || 0));
    li.dataset.qty = String(newQty);
    const q = li.querySelector('.q');
    if (q) q.textContent = newQty;
    li.classList.toggle('selected', newQty > 0);
    compute();
  }

  // Delegated clicks: group buttons, plus/minus, or toggle
  menu.addEventListener('click', (e) => {
    // Group actions (+1 each / Clear)
    const gbtn = e.target.closest('.group-actions .btn');
    if (gbtn) {
      e.preventDefault();
      const { group: gid, action } = gbtn.dataset;
      const lis = document.querySelectorAll(`#${gid} li[data-price]`);
      lis.forEach(li => {
        const current = Number(li.dataset.qty || 0);
        setQty(li, action === 'add1' ? current + 1 : 0);
      });
      return;
    }

    const li = e.target.closest('li[data-price]');
    if (!li || !menu.contains(li)) return;

    if (e.target.closest('.plus'))  { setQty(li, Number(li.dataset.qty || 0) + 1); return; }
    if (e.target.closest('.minus')) { setQty(li, Number(li.dataset.qty || 0) - 1); return; }

    if (!e.target.closest('.qty')) {
      const current = Number(li.dataset.qty || 0);
      setQty(li, current === 0 ? 1 : 0);
    }
  });

  // Clear all
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      items.forEach(li => setQty(li, 0));
      try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
      compute();
      if (nameEl) nameEl.value = '';
if (locEl) locEl.value = '';
if (timeEl) timeEl.value = '';
try { localStorage.removeItem('mc_customer_v1'); } catch(_) {}
compute();
    });
  }

  // WhatsApp/Copy message with per-line subtotals + customer info
  function buildOrderMessage() {
    const lines = [];
    let total = 0;

    for (const li of items) {
      const qty = Number(li.dataset.qty || 0);
      if (!qty) continue;
      const name = li.querySelector('.name')?.textContent.trim() || 'Item';
      const price = Number(li.dataset.price || 0);
      const lineTotal = qty * price;
      total += lineTotal;
      lines.push(`${name} x${qty} — AED ${fmt(lineTotal)} (AED ${fmt(price)} ea)`);
    }

    if (!lines.length) return { msg: "Hello Munna Catering, I'd like to order.", total: 0 };

    const cname = nameEl?.value?.trim() || '____';
    const cloc  = locEl?.value?.trim()  || '____';
    const ctime = timeEl?.value?.trim() || '____';

    const msg = `Hello Munna Catering, I'd like to order:
- ${lines.join('\n- ')}

Total: AED ${fmt(total)}
Name: ${cname}
Delivery location: ${cloc}
Preferred time: ${ctime}`;

    return { msg, total };
  }

  // Print: set time and optional customer line, then print
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      const nowStr = new Date().toLocaleString('en-GB', { hour12: false });
      const orderId = String(Date.now()).slice(-6);
      if (receiptTimeEl) receiptTimeEl.textContent = `${nowStr} • Order #${orderId}`;

      if (receiptCustomerEl) {
        const cname = nameEl?.value?.trim() || '____';
        const cloc  = locEl?.value?.trim()  || '____';
        const ctime = timeEl?.value?.trim() || '____';
        receiptCustomerEl.textContent = `Name: ${cname} • Location: ${cloc} • Time: ${ctime}`;
      }

      window.print();
    });
  }

  // Copy order
  if (copyBtn) {
    copyBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const { msg } = buildOrderMessage();
      try {
        await navigator.clipboard.writeText(msg);
        copyBtn.textContent = 'Copied!';
      } catch (_) {
        const ta = document.createElement('textarea');
        ta.value = msg;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        copyBtn.textContent = 'Copied!';
      }
      setTimeout(() => (copyBtn.textContent = 'Copy order'), 1200);
    });
  }

  // WhatsApp open
  const WA_NUMBER = '971509459509'; // no +, no spaces
  if (waBtn) {
    waBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const { msg } = buildOrderMessage();
      const isMobile = /Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent);
      const url = isMobile
        ? `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`
        : `https://web.whatsapp.com/send?phone=${WA_NUMBER}&text=${encodeURIComponent(msg)}`;
      const opened = window.open(url, '_blank', 'noopener');
      if (!opened || opened.closed || typeof opened.closed === 'undefined') {
        window.location.href = url;
      }
    });
  }

  // Init
  loadCart();
  compute();
});
