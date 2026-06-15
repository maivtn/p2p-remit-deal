/**
 * P2P Remit Deals — Shared UI Components
 * Load sau mock-data.js, trước script của từng màn hình.
 */

var P2P_COMPONENTS = window.P2P_COMPONENTS = {
  /**
   * Render bottom nav vào #bottom-nav hoặc cuối body.
   * @param {string} activeId  — 'overview' | 'send' | 'deals' | 'requests' | 'received' | 'accounts'
   */
  renderBottomNav(activeId) {
    const items = [
      { id: 'overview',  href: 'm-01-overview.html',          icon: 'bi-house',             label: 'Overview'  },
      { id: 'send',      href: 'r-02-send-request.html',       icon: 'bi-send',              label: 'Gửi YC'    },
      { id: 'deals',     href: 'p-16-deal-list.html',          icon: 'bi-grid',              label: 'QL Deals'  },
      { id: 'requests',  href: 'r-05-request-list.html',       icon: 'bi-clock-history',     label: 'LS YC'     },
      { id: 'received',  href: 'p-19-received-requests.html',  icon: 'bi-inbox',             label: 'LS nhận'   },
      { id: 'accounts',  href: 's-27-beneficiaries.html',      icon: 'bi-person-lines-fill', label: 'TK nhận'   },
    ];

    const html = `
<nav id="p2p-bottom-nav">
  <div class="p2p-nav-inner">
    <div class="p2p-nav-items">
      ${items.map(item => `
      <a href="${item.href}" class="bottom-nav-item${item.id === activeId ? ' active' : ''}">
        <i class="bi ${item.icon}"></i><span>${item.label}</span>
      </a>`).join('')}
    </div>
  </div>
</nav>`;

    // Insert: replace placeholder OR inject right after .topbar (desktop stacking),
    // falling back to afterbegin so it appears before content.
    const placeholder = document.getElementById('bottom-nav');
    if (placeholder) {
      placeholder.outerHTML = html;
    } else {
      const topbar = document.querySelector('nav.topbar, .topbar, header');
      if (topbar && topbar.parentNode === document.body) {
        topbar.insertAdjacentHTML('afterend', html);
      } else {
        document.body.insertAdjacentHTML('afterbegin', html);
      }
    }

    // On desktop: measure topbar height and expose as CSS var so nav sticks below it.
    const setOffset = () => {
      const tb = document.querySelector('nav.topbar, .topbar, header');
      const h = tb ? tb.getBoundingClientRect().height : 0;
      document.documentElement.style.setProperty('--topbar-h', h + 'px');
    };
    setOffset();
    window.addEventListener('resize', setOffset, { passive: true });
  },

  /** Toast notification */
  showToast(msg, duration = 2200) {
    let el = document.getElementById('p2p-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'p2p-toast';
      el.style.cssText = [
        'position:fixed', 'bottom:120px', 'left:50%', 'transform:translateX(-50%)',
        'background:var(--color-ink)', 'color:#fff', 'padding:10px 20px',
        'border-radius:160px', 'font-size:14px', 'font-weight:500',
        'opacity:0', 'transition:opacity 0.2s', 'pointer-events:none',
        'white-space:nowrap', 'z-index:999', 'max-width:90vw',
        'text-overflow:ellipsis', 'overflow:hidden',
      ].join(';');
      document.body.appendChild(el);
    }
    clearTimeout(el._timer);
    el.textContent = msg;
    el.style.opacity = '1';
    el._timer = setTimeout(() => { el.style.opacity = '0'; }, duration);
  },

  /**
   * Countdown timer — updates a DOM element every second.
   * @param {string} deadlineISO  ISO 8601 deadline string
   * @param {HTMLElement} el      Element to update
   * @param {string} nowISO       Fixed "now" (default: P2P_DATA.NOW or live Date)
   */
  startCountdown(deadlineISO, el, nowISO) {
    const deadline = new Date(deadlineISO).getTime();

    function tick() {
      const baseNow = nowISO ? new Date(nowISO).getTime() : Date.now();
      const elapsed = Date.now() - P2P_COMPONENTS._startedAt;
      const now = baseNow + elapsed;
      const diff = Math.max(0, Math.floor((deadline - now) / 1000));

      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;

      el.textContent = h > 0
        ? `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
        : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;

      el.classList.toggle('urgent',  diff < 600);
      el.classList.toggle('warning', diff >= 600 && diff < 1800);

      if (diff === 0) {
        el.textContent = 'Hết giờ';
        el.classList.add('urgent');
        return;
      }
      setTimeout(tick, 1000);
    }

    tick();
  },
};

// Record wall-clock start for relative countdown simulation
P2P_COMPONENTS._startedAt = Date.now();

// Global shorthands
function showToast(msg, duration) { P2P_COMPONENTS.showToast(msg, duration); }
