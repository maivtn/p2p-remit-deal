
document.addEventListener("DOMContentLoaded", () => {
  const listEl = document.getElementById("manageDealsList");
  const chipsEl = document.getElementById("manageDealFilterChips");
  const viewToggleEl = document.getElementById("manageViewToggle");
  const pagerEl = document.getElementById("manageDealsPager");

  const PAGE_SIZE = 5;
  const myDeals = typeof mockMyDeals !== "undefined" ? mockMyDeals : mockDealsB;

  const filters = [
    { key: "all", label: "Tất cả" },
    { key: "active", label: "Đang hoạt động" },
    { key: "completed", label: "Đã hoàn tất" },
    { key: "deleted", label: "Đã xoá" },
  ];

  let currentFilter = "all";
  let currentPage = 1;
  let currentView = localStorage.getItem("manageDealViewMode") || "table";
  if(!["cards", "table"].includes(currentView)) currentView = "table";

  const filterDeals = (key) =>
    key === "all" ? myDeals : myDeals.filter((deal) => deal.status === key);

  const countByFilter = (key) => filterDeals(key).length;

  const formatDealRate = deal => `${Number(deal.exchangeRate.rate).toLocaleString("vi-VN", {
    maximumFractionDigits: Number(deal.exchangeRate.rate) < 100 ? 4 : 0,
  })} ${deal.exchangeRate.to}/${deal.exchangeRate.from}`;

  const formatDealDate = value => {
    if(!value) return "Chưa cập nhật";
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  };

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

  const renderViewToggle = () => {
    if(!viewToggleEl) return;
    const views = [
      { key: "cards", label: "Thẻ", icon: "bi-grid-3x3-gap" },
      { key: "table", label: "Bảng", icon: "bi-table" },
    ];

    viewToggleEl.innerHTML = views.map(view => `
      <button class="manage-view-btn ${view.key === currentView ? "active" : ""}" type="button" data-manage-view="${view.key}" aria-pressed="${view.key === currentView}">
        <i class="bi ${view.icon}"></i>
        <span>${view.label}</span>
      </button>
    `).join("");

    viewToggleEl.querySelectorAll("[data-manage-view]").forEach(btn => {
      btn.addEventListener("click", () => {
        currentView = btn.dataset.manageView;
        localStorage.setItem("manageDealViewMode", currentView);
        currentPage = 1;
        renderViewToggle();
        renderDeals();
      });
    });
  };

  const dealCardHtml = (deal) => `
    <div class="col" role="listitem">
    <div class="deal-card manage-deal-card h-100">
      <div class="manage-deal-layout">
        <div class="manage-deal-content">
          <div class="name-line">
            <div>
              <h3 class="card-name">${deal.senderPayCurrency.currency} → ${deal.beneficiaryReceiveCurrency.currency}</h3>
              <div class="small-muted">${deal.dealCode} · Tạo ${formatDealDate(deal.createdAt)}</div>
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
                <div class="manage-method-label">Tôi gửi qua:</div>
                <div class="manage-method-tags">${deal.senderPaymentMethods.map(m => methodTag(m, "green")).join("")}</div>
              </div>
              <div class="manage-method-row">
                <div class="manage-method-label">Thụ hưởng:</div>
                <div class="manage-method-tags">${methodTag(deal.beneficiaryReceiveMethod)}</div>
              </div>
            </div>
            <div class="manage-deal-actions">
              <a class="btn btn-outline-info btn-sm" href="deal-detail-owner.html?isOwner=true&dealId=${deal.id}"><i class="bi bi-eye"></i> Xem</a>
              <a class="btn btn-outline-primary btn-sm" href="create-deal.html"><i class="bi bi-pencil"></i> Sửa</a>
              <button class="btn btn-outline-danger btn-sm " type="button" aria-label="Xoá deal"><i class="bi bi-trash"></i> Xoá </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  `;

  const methodBadges = (methods, tone = "green") =>
    methods.map(method => methodTag(method, tone)).join("");

  const dealTableRowHtml = (deal) => `
    <tr>
      <td data-label="Deal">
        <div class="history-code">${deal.dealCode}</div>
        <div class="small-muted">Tạo ${formatDealDate(deal.createdAt)}</div>
      </td>
      <td data-label="Cặp tiền">
        <strong>${deal.senderPayCurrency.currency} → ${deal.beneficiaryReceiveCurrency.currency}</strong>
      </td>
      <td data-label="Tỷ giá"><span class="history-table-amount receive">${formatDealRate(deal)}</span></td>
      <td data-label="Giới hạn"><span class="history-table-amount send">$${deal.amountLimit.minUsd}–$${deal.amountLimit.maxUsd}</span></td>
      <td data-label="Tôi gửi qua"><div class="manage-table-methods">${methodBadges(deal.senderPaymentMethods)}</div></td>
      <td data-label="Người thụ hưởng nhận qua"><div class="manage-table-methods">${methodTag(deal.beneficiaryReceiveMethod)}</div></td>
      <td data-label="Trạng thái"><span class="badge-soft ${badgeClass(deal.status)}">${deal.statusLabel}</span></td>
      <td data-label="Thao tác">
        <div class="manage-table-actions">
          <a class="btn btn-outline-info btn-sm overview-small-btn" href="deal-detail-owner.html?isOwner=true&dealId=${deal.id}"><i class="bi bi-eye"></i> Xem</a>
          <a class="btn btn-outline-primary btn-sm overview-small-btn" href="create-deal.html"><i class="bi bi-pencil"></i> Sửa</a>
          <button class="btn btn-outline-danger btn-sm overview-small-btn" type="button" aria-label="Xoá ${deal.dealCode}"><i class="bi bi-trash"></i></button>
        </div>
      </td>
    </tr>
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
          <div class="small-muted mt-1">Bạn chưa có deal nào phù hợp với bộ lọc này.</div>
        </div>
      `;
      renderPager(pagerEl, { page: 1, pageSize: PAGE_SIZE, total: 0, onPage: () => {} });
      return;
    }

    const start = (currentPage - 1) * PAGE_SIZE;
    const pageDeals = visibleDeals.slice(start, start + PAGE_SIZE);

    if(currentView === "table"){
      listEl.innerHTML = `
        <div class="table-responsive history-table-wrap manage-table-wrap rounded">
          <table class="table table-sm table-hover align-middle mb-0 recent-history-table manage-deal-table">
            <thead>
              <tr>
                <th>Deal</th>
                <th>Cặp tiền</th>
                <th>Tỷ giá</th>
                <th>Giới hạn</th>
                <th>Tôi gửi qua</th>
                <th>Người thụ hưởng nhận qua</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>${pageDeals.map(dealTableRowHtml).join("")}</tbody>
          </table>
        </div>
      `;
    }else{
      listEl.innerHTML = `
        <div class="manage-deal-grid row row-cols-1 row-cols-lg-2 g-3" role="list">
          ${pageDeals.map(dealCardHtml).join("")}
        </div>
      `;
    }

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
  renderViewToggle();
  renderDeals();
});
