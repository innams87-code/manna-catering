// MC build v30
console.log('MC build v30 loaded');
console.log('Munna site loaded');

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM ready v30');

  const fmt = (n) => Number(n).toFixed(2).replace(/\.00$/, '');

  // Elements
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  const printBtn = document.getElementById('print');
  const copyBtn  = document.getElementById('copy');
  const waBtn    = document.getElementById('waOrder');
  const clearBtn = document.getElementById('clear');

  const nameEl = document.getElementById('cust-name');
  const locEl  = document.getElementById('cust-location');
  const timeEl = document.getElementById('cust-time');

  const menu   = document.getElementById('menu');
  const countEl = document.getElementById('count');
  const totalEl = document.getElementById('total');
  const summary = document.getElementById('summary');
  const summaryList = document.getElementById('summaryList');
  const summaryTotalEl = document.getElementById('summaryTotal');
  const receiptTimeEl = document.getElementById('receipt-time');
  const receiptCustomerEl = document.getElementById('receipt-customer');

  if (!menu) { console.warn('No #menu found'); return; }

  // Customer save/load (inside DOMContentLoaded)
  const CUST_KEY = 'mc_customer_v1';
  function saveCustomer() {
    const data = {
      name: nameEl?.value || '',
      loc:  locEl?.value  || '',
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
 [nameEl, locEl, timeEl].forEach(el => el?.addEventListener('input', () => {
saveCustomer();
compute(); // re-check WhatsApp enable/disable immediately
}));
  loadCustomer();
  compute();

  // Items
  const items = [...menu.querySelectorAll('li[data-price]')];
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

  // Cart storage
  const STORAGE_KEY = 'mc_cart_v30';
  function saveCart() {
    try {
      const state = items.map(li => Number(li.dataset.qty || 0));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }
  function loadCart() {
    try {
      const state = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      state.forEach((qty, i) => {
        const li = items[i];
        if (!li) return;
        qty = Number(qty) || 0;
        li.dataset.qty = String(qty);
        li.querySelector('.q')?.textContent = qty;
        li.classList.toggle('selected', qty > 0);
      });
    } catch (e) {}
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
    if (summaryTotalEl) summaryTotalEl.textContent = fmt(total);

    if (summary && summaryList) {
      if (!lines.length) {
        summary.classList.add('hidden');
        summaryList.innerHTML = '';
      } else {
        summary.classList.remove('hidden');
        summaryList.innerHTML = lines
          .map(r => `<li><span>${r.name} x${r.qty}</span><strong>AED ${fmt(r.lineTotal)}</strong></li>`)
          .join('');
      }
    }

    // Enable/disable buttons
    const disable = total === 0;
    if (printBtn) printBtn.disabled = disable;
    if (copyBtn)  copyBtn.disabled  = disable;
    const hasCustomer = !!(nameEl?.value?.trim() && locEl?.value?.trim());
    if (waBtn) waBtn.disabled = disable || !hasCustomer;

    saveCart();
  }

  // Click handlers
  menu.addEventListener('click', (e) => {
    const gbtn = e.target.closest('.group-actions .btn');
    if (gbtn) {
      e.preventDefault();
      const { group: gid, action } = gbtn.dataset;
      document.querySelectorAll(`#${gid} li[data-price]`).forEach(li => {
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

  function setQty(li, newQty) {
    newQty = Math.max(0, Math.min(99, Number(newQty) || 0));
    li.dataset.qty = String(newQty);
    li.querySelector('.q')?.textContent = newQty;
    li.classList.toggle('selected', newQty > 0);
    compute();
  }

  // Clear all
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      items.forEach(li => setQty(li, 0));
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      if (nameEl) nameEl.value = '';
      if (locEl)  locEl.value  = '';
      if (timeEl) timeEl.value = '';
      try { localStorage.removeItem(CUST_KEY); } catch (e) {}
      compute();
    });
  }

  // Build message
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

  // Print
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

  // Copy
  if (copyBtn) {
    copyBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const { msg } = buildOrderMessage();
      try {
        await navigator.clipboard.writeText(msg);
        copyBtn.textContent = 'Copied!';
      } catch (e2) {
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

  // WhatsApp
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
