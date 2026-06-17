
document.addEventListener("DOMContentLoaded", () => {
  const listEl = document.getElementById("manageDealsList");
  const chipsEl = document.getElementById("manageDealFilterChips");

  const myDeals = [
    ...mockDealsB,
    {
      ...mockDealsB[0],
      id: "deal_my_completed_001",
      dealCode: "DL-MY-COMPLETED-001",
      status: "completed",
      statusLabel: "Đã hoàn tất",
      availableAmountUsd: 0,
      completedAt: "2026-06-16T14:00:00Z",
    },
    {
      ...mockDealsB[0],
      id: "deal_my_deleted_001",
      dealCode: "DL-MY-DELETED-001",
      status: "deleted",
      statusLabel: "Đã xoá",
      deletedAt: "2026-06-16T15:00:00Z",
    }
  ];

  const filters = [
    { key: "all", label: "Tất cả" },
    { key: "active", label: "Đang hoạt động" },
    { key: "completed", label: "Đã hoàn tất" },
    { key: "deleted", label: "Đã xoá" },
  ];

  const countByFilter = (key) => {
    if(key === "all") return myDeals.length;
    return myDeals.filter(deal => deal.status === key).length;
  };

  const renderChips = (activeKey) => {
    if(!chipsEl) return;
    chipsEl.innerHTML = filters.map(filter => `
      <button class="manage-filter-chip ${filter.key === activeKey ? "active" : ""}" data-manage-filter="${filter.key}" type="button">
        <span>${filter.label}</span>
        <span class="count">${countByFilter(filter.key)}</span>
      </button>
    `).join("");

    chipsEl.querySelectorAll("[data-manage-filter]").forEach(btn => {
      btn.addEventListener("click", () => renderDeals(btn.dataset.manageFilter));
    });
  };

  const renderDeals = (activeKey = "all") => {
    renderChips(activeKey);

    const visibleDeals = activeKey === "all"
      ? myDeals
      : myDeals.filter(deal => deal.status === activeKey);

    if(!listEl) return;

    if(!visibleDeals.length){
      listEl.innerHTML = `
        <div class="manage-empty">
          <div class="fw-bold">Không có deal</div>
          <div class="small-muted mt-1">Không có dữ liệu phù hợp với filter này.</div>
        </div>
      `;
      return;
    }

    listEl.innerHTML = visibleDeals.map(deal => `
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
                <div class="fw-bold">${deal.exchangeRate.rate.toLocaleString("vi-VN")}đ/USD</div>
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
            <a class="btn btn-outline-success btn-sm fw-bold" href="deal-detail-owner.html?isOwner=true"><i class="bi bi-eye"></i> Xem</a>
            <a class="btn btn-outline-primary btn-sm" href="create-deal.html"><i class="bi bi-pencil"></i> Sửa</a>
            <button class="btn btn-outline-danger btn-sm " type="button" aria-label="Xoá deal">Xoá <i class="bi bi-trash"></i></button>
          </div>
            </div>
          </div>

          
        </div>
      </div>
    `).join("");
  };

  renderDeals("all");
});
