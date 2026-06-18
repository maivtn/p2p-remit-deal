
document.addEventListener("DOMContentLoaded", () => {
  const listEl = document.getElementById("manageDealsList");
  const chipsEl = document.getElementById("manageDealFilterChips");
  const pagerEl = document.getElementById("manageDealsPager");

  const PAGE_SIZE = 5;

  // Extra active deals so the list spans multiple pages (demo only).
  const extraActiveDeals = [
    { rate: 25450, min: 100, max: 1500, recv: "PayPal",        send: ["Bank Transfer"] },
    { rate: 25520, min: 80,  max: 900,  recv: "Zelle",         send: ["MoMo", "ZaloPay"] },
    { rate: 25380, min: 200, max: 3000, recv: "Bank Transfer", send: ["Bank Transfer"] },
    { rate: 25610, min: 50,  max: 600,  recv: "PayPal",        send: ["ZaloPay"] },
    { rate: 25470, min: 150, max: 1800, recv: "Zelle",         send: ["MoMo"] },
    { rate: 25550, min: 120, max: 5000, recv: "Bank Transfer", send: ["MoMo", "Bank Transfer"] },
  ].map((x, i) => ({
    ...mockDealsB[0],
    id: `deal_b_gen_${i + 1}`,
    dealCode: `DL-B-VND-USD-${String(i + 4).padStart(3, "0")}`,
    status: "active",
    statusLabel: "Đang hoạt động",
    exchangeRate: { ...mockDealsB[0].exchangeRate, rate: x.rate },
    amountLimit: { minUsd: x.min, maxUsd: x.max },
    beneficiaryReceiveMethod: x.recv,
    senderPaymentMethods: x.send,
  }));

  const myDeals = [
    ...mockDealsB,
    ...extraActiveDeals,
    {
      ...mockDealsB[0],
      id: "deal_my_completed_001",
      dealCode: "DL-MY-COMPLETED-001",
      status: "completed",
      statusLabel: "Đã hoàn tất",
      completedAt: "2026-06-16T14:00:00Z",
    },
    {
      ...mockDealsB[1],
      id: "deal_my_completed_002",
      dealCode: "DL-MY-COMPLETED-002",
      status: "completed",
      statusLabel: "Đã hoàn tất",
      completedAt: "2026-06-15T10:30:00Z",
    },
    {
      ...mockDealsB[2],
      id: "deal_my_completed_003",
      dealCode: "DL-MY-COMPLETED-003",
      status: "completed",
      statusLabel: "Đã hoàn tất",
      completedAt: "2026-06-14T16:45:00Z",
    },
    {
      ...mockDealsB[0],
      id: "deal_my_deleted_001",
      dealCode: "DL-MY-DELETED-001",
      status: "deleted",
      statusLabel: "Đã xoá",
      deletedAt: "2026-06-16T15:00:00Z",
    },
    {
      ...mockDealsB[1],
      id: "deal_my_deleted_002",
      dealCode: "DL-MY-DELETED-002",
      status: "deleted",
      statusLabel: "Đã xoá",
      deletedAt: "2026-06-13T11:20:00Z",
    },
  ];

  const filters = [
    { key: "all", label: "Tất cả" },
    { key: "active", label: "Đang hoạt động" },
    { key: "completed", label: "Đã hoàn tất" },
    { key: "deleted", label: "Đã xoá" },
  ];

  let currentFilter = "all";
  let currentPage = 1;

  const filterDeals = (key) =>
    key === "all" ? myDeals : myDeals.filter((deal) => deal.status === key);

  const countByFilter = (key) => filterDeals(key).length;

  const formatDealRate = deal => `${Number(deal.exchangeRate.rate).toLocaleString("vi-VN", {
    maximumFractionDigits: Number(deal.exchangeRate.rate) < 100 ? 4 : 0,
  })} ${deal.exchangeRate.to}/${deal.exchangeRate.from}`;

  const renderChips = () => {
    if(!chipsEl) return;
    chipsEl.innerHTML = filters.map(filter => `
      <button class="manage-filter-chip ${filter.key === currentFilter ? "active" : ""}" data-manage-filter="${filter.key}" type="button">
        <span>${filter.label}</span>
        <span class="count">${countByFilter(filter.key)}</span>
      </button>
    `).join("");

    chipsEl.querySelectorAll("[data-manage-filter]").forEach(btn => {
      btn.addEventListener("click", () => {
        currentFilter = btn.dataset.manageFilter;
        currentPage = 1;
        renderChips();
        renderDeals();
      });
    });
  };

  const dealCardHtml = (deal) => `
    <div class="deal-card manage-deal-card">
      <div class="manage-deal-layout">
        <div class="manage-deal-content">
          <div class="name-line">
            <div>
              <h3 class="card-name">${deal.senderPayCurrency.currency} → ${deal.beneficiaryReceiveCurrency.currency}</h3>
              <div class="small-muted">${deal.dealCode}</div>
            </div>
            <span class="badge-soft ${badgeClass(deal.status)}">${deal.statusLabel}</span>
          </div>

          <div class="row g-2 mt-2">
            <div class="col-6">
              <div class="small-muted">Tỷ giá</div>
              <div class="fw-bold">${formatDealRate(deal)}</div>
            </div>
            <div class="col-6 text-end">
              <div class="small-muted">Giới hạn</div>
              <div class="fw-bold">$${deal.amountLimit.minUsd}–$${deal.amountLimit.maxUsd}</div>
            </div>
          </div>
          <div class="d-block d-md-flex justify-content-between">
            <div class="manage-method-split mt-3">
              <div class="manage-method-row">
                <div class="manage-method-label">Gửi qua:</div>
                <div class="manage-method-tags">${deal.senderPaymentMethods.map(m => methodTag(m, "green")).join("")}</div>
              </div>
              <div class="manage-method-row">
                <div class="manage-method-label">Nhận qua:</div>
                <div class="manage-method-tags">${methodTag(deal.beneficiaryReceiveMethod)}</div>
              </div>
            </div>
            <div class="manage-deal-actions">
              <a class="btn btn-outline-info btn-sm" href="deal-detail-owner.html?isOwner=true"><i class="bi bi-eye"></i> Xem</a>
              <a class="btn btn-outline-primary btn-sm" href="create-deal.html"><i class="bi bi-pencil"></i> Sửa</a>
              <button class="btn btn-outline-danger btn-sm " type="button" aria-label="Xoá deal"><i class="bi bi-trash"></i> Xoá </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const renderDeals = () => {
    if(!listEl) return;

    const visibleDeals = filterDeals(currentFilter);
    const pageCount = Math.max(1, Math.ceil(visibleDeals.length / PAGE_SIZE));
    if(currentPage > pageCount) currentPage = pageCount;

    if(!visibleDeals.length){
      listEl.innerHTML = `
        <div class="manage-empty">
          <div class="fw-bold">Không có deal</div>
          <div class="small-muted mt-1">Không có dữ liệu phù hợp với filter này.</div>
        </div>
      `;
      renderPager(pagerEl, { page: 1, pageSize: PAGE_SIZE, total: 0, onPage: () => {} });
      return;
    }

    const start = (currentPage - 1) * PAGE_SIZE;
    const pageDeals = visibleDeals.slice(start, start + PAGE_SIZE);

    listEl.innerHTML = pageDeals.map(dealCardHtml).join("");

    renderPager(pagerEl, {
      page: currentPage,
      pageSize: PAGE_SIZE,
      total: visibleDeals.length,
      onPage: (p) => {
        currentPage = p;
        renderDeals();
        listEl.scrollIntoView({ behavior: "smooth", block: "start" });
      },
    });
  };

  renderChips();
  renderDeals();
});
