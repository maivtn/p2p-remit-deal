document.addEventListener("DOMContentLoaded", () => {
  const formatRateValue = value => Number(value).toLocaleString("vi-VN", {
    maximumFractionDigits: Number(value) < 100 ? 4 : 0,
  });
  const formatExchangeRate = deal => `${formatRateValue(deal.exchangeRate.rate)} ${deal.exchangeRate.to}/${deal.exchangeRate.from}`;
  const formatCurrencyPair = deal => `${deal.beneficiaryReceiveCurrency.currency} → ${deal.senderPayCurrency.currency}`;
  const formatUsdLimit = limit => `$${Number(limit.minUsd).toLocaleString("en-US")} - $${Number(limit.maxUsd).toLocaleString("en-US")}`;
  const getTxnDetailLink = (txn) => {
    if (txn.status === "completed") return "transaction-detail-case-06-completed-rating.html";
    if (txn.status === "pending_acceptance") return "transaction-detail-case-01-waiting-counterparty-acceptance.html";
    if (txn.status === "cancelled") return "transaction-detail-case-01-waiting-counterparty-acceptance.html";
    if (txn.status === "disputed") return "transaction-detail-case-07-my-dispute.html";
    return "transaction-detail-case-02-accepted-upload-proof.html";
  };

  const statusTone = status => {
    switch(status){
      case "completed": return "success";
      case "pending_acceptance": return "warning";
      case "disputed":
      case "cancelled":
      case "deleted": return "danger";
      default: return "processing";
    }
  };

  const renderMetricCard = metric => `
    <div class="overview-metric-item">
      <div class="overview-metric-card h-100 ${metric.tone}">
        <div class="metric-icon"><i class="bi ${metric.icon}"></i></div>
        <div>
          <div class="metric-label">${metric.label}</div>
          <div class="metric-value">${metric.value}</div>
          <div class="metric-unit">${metric.unit}</div>
        </div>
      </div>
    </div>
  `;

  const renderProcessingCard = txn => `
    <article class="processing-card">
      <div class="processing-person">
        <span class="overview-avatar ${statusTone(txn.status)}">${txn.initial || txn.name.slice(0, 1)}</span>
        <div>
          <h3>${txn.name}</h3>
          <p>${txn.time}</p>
          <span class="badge-soft ${badgeClass(txn.status)}">${txn.statusLabel}</span>
        </div>
      </div>

      <div class="processing-amount">
        <div class="processing-code">${txn.transactionCode}</div>
        <div class="amount-pair">
          <strong>${txn.sendAmount}</strong> <span>${txn.sendCurrency}</span>
          <i class="bi bi-arrow-right"></i>
          <strong>${txn.receiveAmount}</strong> <span>${txn.receiveCurrency}</span>
        </div>
        <div class="processing-rate">Rate: ${txn.rateLabel}</div>
        <div class="method-chip-row">
          ${methodTag(txn.senderMethod, "green")}
          ${methodTag(txn.beneficiaryMethod)}
        </div>
      </div>

      <div class="processing-action">
        <a class="btn btn-sm btn-outline-primary overview-detail-btn" href="${getTxnDetailLink(txn)}" aria-label="Xem chi tiết">
          <i class="bi bi-eye"></i>
          <span class="overview-detail-text">Xem</span>
        </a>
      </div>
    </article>
  `;

  const renderDealRow = deal => `
    <tr>
      <td class="deal-pair" data-label="Cặp tiền tệ">${formatCurrencyPair(deal)}</td>
      <td class="deal-rate" data-label="Tỷ giá">${formatExchangeRate(deal)}</td>
      <td class="deal-limit" data-label="Giới hạn giao dịch">${formatUsdLimit(deal.amountLimit)}</td>
      <td data-label="Nhận qua">${methodTag(deal.beneficiaryReceiveMethod)}</td>
      <td data-label="Gửi qua">
        <div class="method-chip-row compact">
          ${deal.senderPaymentMethods.map(method => methodTag(method, "green")).join("")}
        </div>
      </td>
      <td data-label="Thao tác"><a href="deal-detail.html" class="btn btn-sm btn-outline-primary overview-small-btn"><i class="bi bi-eye"></i> Xem</a></td>
    </tr>
  `;

  const historyIcon = status => {
    if(status === "completed") return "bi-check-lg";
    if(status === "cancelled") return "bi-x-lg";
    return "bi-clock";
  };

  const renderHistoryCard = txn => `
    <article class="recent-history-card" role="listitem">
      <div class="recent-history-card-icon">
        <span class="history-status-icon ${statusTone(txn.status)}"><i class="bi ${historyIcon(txn.status)}"></i></span>
      </div>

      <div class="recent-history-card-main">
        <div class="history-main">
          <div class="history-code">${txn.transactionCode}</div>
          <div class="small-muted">với ${txn.name}</div>
          <small>${txn.time}</small>
        </div>
      </div>

      <div class="recent-history-card-amount history-amount">
        <span class="text-dark">- ${txn.sendAmount} ${txn.sendCurrency}</span>
        <span>+ ${txn.receiveAmount} ${txn.receiveCurrency}</span>
      </div>

      <div class="recent-history-card-status">
        <span class="badge-soft ${badgeClass(txn.status)}">${txn.statusLabel}</span>
      </div>

      <a href="${getTxnDetailLink(txn)}" class="recent-history-card-action btn btn-sm btn-outline-success" aria-label="Xem ${txn.transactionCode}">
        <i class="bi bi-eye"></i>
        <span>Xem</span>
      </a>
    </article>
  `;

  const metricsEl = document.getElementById("overviewMetrics");
  if(metricsEl){
    const summary = overviewData.summary;
    metricsEl.innerHTML = [
      { label: "Đang xử lý", value: summary.processingCount, unit: "giao dịch", icon: "bi-clipboard2-check", tone: "green" },
      { label: "Chờ chấp nhận", value: summary.waitingAcceptanceCount, unit: "giao dịch", icon: "bi-clock", tone: "orange" },
      { label: "Hoàn tất", value: summary.completedCount, unit: "giao dịch", icon: "bi-check-circle", tone: "green" },
      { label: "Tranh chấp", value: summary.disputedCount, unit: "giao dịch", icon: "bi-shield-exclamation", tone: "red" },
    ].map(renderMetricCard).join("");
  }

  const processingEl = document.getElementById("processingList");
  if(processingEl) processingEl.innerHTML = overviewData.processingTransactions.map(renderProcessingCard).join("");

  const hotEl = document.getElementById("hotDeals");
  if(hotEl){
    hotEl.innerHTML = `
      <div class="table-responsive deal-table-wrap rounded">
        <table class="table table-sm table-hover align-middle mb-0 deal-highlight-table">
          <thead class="table-light">
            <tr>
              <th>Cặp tiền tệ</th>
              <th>Tỷ giá</th>
              <th>Giới hạn giao dịch</th>
              <th>Nhận qua</th>
              <th>Gửi qua</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${mockDealsB.slice(0, 8).map(renderDealRow).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  const historyEl = document.getElementById("recentHistory");
  if(historyEl){
    historyEl.innerHTML = `
      <div class="recent-history-cards" role="list">
        ${overviewData.recentHistory.map(renderHistoryCard).join("")}
      </div>
    `;
  }
});
