
document.addEventListener("DOMContentLoaded", () => {
  const results = document.getElementById("dealResultsList");
  const viewToggleEl = document.getElementById("dealResultsViewToggle");
  const pagerEl = document.getElementById("dealResultsPager");
  if(!results) return;

  const PAGE_SIZE = 5;
  let currentView = localStorage.getItem("dealResultsViewMode") || "cards";
  let currentPage = 1;
  if(!["cards", "table"].includes(currentView)) currentView = "cards";

  const formatDealRate = deal => `${Number(deal.exchangeRate.rate).toLocaleString("vi-VN", {
    maximumFractionDigits: Number(deal.exchangeRate.rate) < 100 ? 4 : 0,
  })} ${deal.exchangeRate.to}/${deal.exchangeRate.from}`;
  const formatHourLabel = value => {
    const [hourText, minuteText] = value.split(":");
    const hour = Number(hourText);
    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minuteText} ${suffix}`;
  };
  const summarizeAvailability = (hours = [], compact = false) => {
    const enabledDays = hours.filter(item => item.enabled);
    if(!enabledDays.length) return "Chưa có giờ sẵn sàng";

    const groups = [];
    enabledDays.forEach(day => {
      const lastGroup = groups[groups.length - 1];
      if(lastGroup && lastGroup.start === day.start && lastGroup.end === day.end){
        lastGroup.days.push(day.day);
      }else{
        groups.push({ start: day.start, end: day.end, days: [day.day] });
      }
    });

    const labels = groups.map(group => {
      const dayLabel = group.days.length > 1
        ? `${group.days[0]}-${group.days[group.days.length - 1]}`
        : group.days[0];
      return `${dayLabel}, ${formatHourLabel(group.start)} - ${formatHourLabel(group.end)}`;
    });

    if(!compact || labels.length <= 1) return labels.join("; ");
    return `${labels[0]}`;
  };

  const initResultTooltips = () => {
    results.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
      bootstrap.Tooltip.getOrCreateInstance(el);
    });
  };

  const renderViewToggle = () => {
    if(!viewToggleEl) return;
    const views = [
      { key: "cards", label: "Thẻ", icon: "bi-grid-3x3-gap" },
      { key: "table", label: "Bảng", icon: "bi-table" },
    ];

    viewToggleEl.innerHTML = views.map(view => `
      <button class="results-view-btn ${view.key === currentView ? "active" : ""}" type="button" data-results-view="${view.key}" aria-pressed="${view.key === currentView}">
        <i class="bi ${view.icon}"></i>
        <span>${view.label}</span>
      </button>
    `).join("");

    viewToggleEl.querySelectorAll("[data-results-view]").forEach(btn => {
      btn.addEventListener("click", () => {
        currentView = btn.dataset.resultsView;
        currentPage = 1;
        localStorage.setItem("dealResultsViewMode", currentView);
        renderViewToggle();
        renderResults();
      });
    });
  };

  const dealCardHtml = deal => `
    <div class="deal-card result-deal-card">
      <div class="result-card-top">
        <div class="result-card-identity">
          <span class="result-card-avatar">${deal.ownerInitial || "B"}</span>
          <div class="result-card-title-block">
            <div class="result-card-title-row">
              <h3 class="card-name">${deal.ownerNameMasked || "Tran ***"}</h3>
            </div>
            ${renderOwnerRating(deal)}
            <div class="small-muted">
              ${deal.beneficiaryReceiveCurrency.currency} → ${deal.senderPayCurrency.currency} · $${deal.amountLimit.minUsd}–$${deal.amountLimit.maxUsd}
            </div>
          </div>
        </div>

        <div class="result-card-rate-action">
          <div class="result-action-group">
            <a href="deal-detail.html?dealId=${deal.id}" class="btn btn-primary btn-sm"><i class="bi bi-eye"></i> Xem chi tiết</a>
            <a href="select-deal.html?dealId=${deal.id}&from=results" class="btn btn-outline-primary btn-sm">
              <i class="bi bi-check2-circle"></i> Chọn deal
            </a>
          </div>
        </div>
      </div>

      <div class="result-card-info-grid row g-2">
        <div class="col-12 col-md-6 col-xl-3">
          <div class="result-card-rate h-100">
            <div class="result-info-label">Tỷ giá</div>
            <div class="rate-blue">${formatDealRate(deal)}</div>
          </div>
        </div>
        <div class="col-12 col-md-6 col-xl-3">
          <div class="result-info-box availability h-100">
            <div class="result-info-label">
              <i class="bi bi-clock"></i>
              Thời gian giao dịch
              <i class="bi bi-info-circle label-help-icon" tabindex="0" data-bs-toggle="tooltip" data-bs-title="${summarizeAvailability(deal.availabilityHours)}"></i>
            </div>
            <div class="result-info-value">${summarizeAvailability(deal.availabilityHours, true)}</div>
          </div>
        </div>
        <div class="col-12 col-md-6 col-xl-3">
          <div class="result-info-box h-100">
            <div class="result-info-label">Bên Tran *** B gửi ${deal.senderPayCurrency.currency} qua</div>
            <div class="result-method-tags">${deal.senderPaymentMethods.map(m => methodTag(m, "green")).join("")}</div>
          </div>
        </div>
        <div class="col-12 col-md-6 col-xl-3">
          <div class="result-info-box h-100">
            <div class="result-info-label">Bạn gửi ${deal.beneficiaryReceiveCurrency.currency} qua</div>
            <div class="result-method-tags">${methodTag(deal.beneficiaryReceiveMethod)}</div>
          </div>
        </div>
      </div>
    </div>
  `;

  const dealTableRowHtml = deal => `
    <tr>
      <td data-label="Deal">
        <div class="result-table-deal">
          <span class="result-card-avatar small">${deal.ownerInitial || "B"}</span>
          <div>
            <div class="history-code">${deal.ownerNameMasked || "Tran *** B"}</div>
            ${renderOwnerRating(deal, "compact")}
            <div class="small-muted">${deal.beneficiaryReceiveCurrency.currency} → ${deal.senderPayCurrency.currency}</div>
          </div>
        </div>
      </td>
      <td data-label="Tỷ giá"><span class="history-table-amount receive">${formatDealRate(deal)}</span></td>
      <td data-label="Giới hạn"><span class="history-table-amount send">$${deal.amountLimit.minUsd}–$${deal.amountLimit.maxUsd}</span></td>
      <td data-label="Thời gian giao dịch">
        <span class="result-table-availability">
          ${summarizeAvailability(deal.availabilityHours, true)}
          <i class="bi bi-info-circle label-help-icon" tabindex="0" data-bs-toggle="tooltip" data-bs-title="${summarizeAvailability(deal.availabilityHours)}"></i>
        </span>
      </td>
      <td data-label="Bên B gửi qua"><div class="result-table-methods">${deal.senderPaymentMethods.map(m => methodTag(m, "green")).join("")}</div></td>
      <td data-label="Bạn gửi qua"><div class="result-table-methods">${methodTag(deal.beneficiaryReceiveMethod)}</div></td>
      <td data-label="Thao tác">
        <div class="result-table-actions">
          <a href="deal-detail.html?dealId=${deal.id}" class="btn btn-primary btn-sm overview-small-btn"><i class="bi bi-eye"></i> Xem</a>
          <a href="select-deal.html?dealId=${deal.id}&from=results" class="btn btn-outline-primary btn-sm overview-small-btn">
            <i class="bi bi-check2-circle"></i> Chọn
          </a>
        </div>
      </td>
    </tr>
  `;

  function renderResults(){
    const pageCount = Math.max(1, Math.ceil(mockDealsB.length / PAGE_SIZE));
    currentPage = Math.min(currentPage, pageCount);
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageDeals = mockDealsB.slice(start, start + PAGE_SIZE);

    if(currentView === "table"){
      results.innerHTML = `
        <div class="table-responsive history-table-wrap result-table-wrap rounded">
          <table class="table table-sm table-hover align-middle mb-0 result-deal-table">
            <thead>
              <tr>
                <th>Deal</th>
                <th>Tỷ giá</th>
                <th>Giới hạn</th>
                <th>Thời gian giao dịch</th>
                <th>Bên B gửi qua</th>
                <th>Bạn gửi qua</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>${pageDeals.map(dealTableRowHtml).join("")}</tbody>
          </table>
        </div>
      `;
    }else{
      results.innerHTML = pageDeals.map(dealCardHtml).join("");
    }

    initResultTooltips();
    renderPager(pagerEl, {
      page: currentPage,
      pageSize: PAGE_SIZE,
      total: mockDealsB.length,
      onPage: page => {
        currentPage = page;
        renderResults();
        results.scrollIntoView({ behavior: "smooth", block: "start" });
      },
    });
  }

  renderViewToggle();
  renderResults();
});
