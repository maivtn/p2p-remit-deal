document.addEventListener("DOMContentLoaded", () => {
  const formatVndRate = value => `${Number(value).toLocaleString("vi-VN")} đ/USD`;
  const formatUsdLimit = limit => `$${Number(limit.minUsd).toLocaleString("en-US")} - $${Number(limit.maxUsd).toLocaleString("en-US")}`;
  const getTxnDetailLink = (txn) => {
    if (txn.status === "completed") return "transaction-detail-case-06-completed-rating.html";
    if (txn.status === "waiting") return "transaction-detail-case-01-waiting-counterparty-acceptance.html";
    if (txn.status === "rejected") return "transaction-detail-case-01-waiting-counterparty-acceptance.html";
    if (txn.status === "dispute") return "transaction-detail-case-07-my-dispute.html";
    return "transaction-detail-case-02-accepted-upload-proof.html";
  };

  const statusTone = status => {
    switch(status){
      case "completed": return "success";
      case "waiting": return "warning";
      case "rejected":
      case "cancelled":
      case "deleted": return "danger";
      default: return "processing";
    }
  };

  const renderMetricCard = metric => `
    <div class="overview-metric-card ${metric.tone}">
      <div class="metric-icon"><i class="bi ${metric.icon}"></i></div>
      <div>
        <div class="metric-label">${metric.label}</div>
        <div class="metric-value">${metric.value}</div>
        <div class="metric-unit">${metric.unit}</div>
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
        <div class="countdown ${txn.status === "waiting" ? "warning" : ""}">${txn.countdown}</div>
        <div class="countdown-label">Còn lại</div>
        <a class="btn btn-sm btn-outline-primary overview-detail-btn" href="${getTxnDetailLink(txn)}">Xem chi tiết</a>
      </div>
    </article>
  `;

  const tagClass = tag => {
    if(tag === "Best rate") return "tag-best";
    if(tag === "High limit") return "tag-high";
    return "tag-fast";
  };

  const renderDealRow = (deal, index) => `
    <tr>
      <td class="deal-index">${index + 1}</td>
      <td>
        <div class="deal-owner">
          <span class="overview-avatar mini">${deal.ownerInitial || "B"}</span>
          <span>${deal.ownerNameMasked || "Tran ***"}</span>
        </div>
      </td>
      <td class="deal-rate">${formatVndRate(deal.exchangeRate.rate)}</td>
      <td>
        <span class="deal-rating"><i class="bi bi-star-fill"></i> ${deal.rating || "4.8"} <span>(${deal.reviewCount || 0})</span></span>
      </td>
      <td class="deal-limit">${formatUsdLimit(deal.amountLimit)}</td>
      <td>${methodTag(deal.beneficiaryReceiveMethod)}</td>
      <td>
        <div class="method-chip-row compact">
          ${deal.senderPaymentMethods.map(method => methodTag(method, "green")).join("")}
        </div>
      </td>
      <td>
        <div class="deal-tags">${(deal.highlightTags || []).map(tag => `<span class="deal-tag ${tagClass(tag)}">${tag}</span>`).join("")}</div>
      </td>
      <td><a href="deal-detail.html" class="btn btn-sm btn-outline-primary overview-small-btn">Xem</a></td>
    </tr>
  `;

  const renderMarketChart = snapshot => {
    const width = 360;
    const height = 150;
    const pad = 18;
    const values = snapshot.points.map(point => point.value);
    const min = Math.min(...values) - 80;
    const max = Math.max(...values) + 80;
    const xStep = (width - pad * 2) / (snapshot.points.length - 1);
    const pointToSvg = (point, index) => {
      const x = pad + index * xStep;
      const y = height - pad - ((point.value - min) / (max - min)) * (height - pad * 2);
      return { x, y };
    };
    const coords = snapshot.points.map(pointToSvg);
    const line = coords.map(point => `${point.x},${point.y}`).join(" ");
    const area = `${pad},${height - pad} ${line} ${width - pad},${height - pad}`;

    return `
      <div class="market-rate-label">Tỷ giá ${snapshot.pair} (tham khảo)</div>
      <div class="market-rate-row">
        <strong>${Number(snapshot.rate).toLocaleString("vi-VN")}</strong>
        <span>đ/USD</span>
        <em>+${snapshot.change} (${snapshot.changePercent}%)</em>
      </div>
      <svg class="market-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Biểu đồ tỷ giá 7 ngày">
        <polygon points="${area}" fill="rgba(18,183,106,.14)"></polygon>
        <polyline points="${line}" fill="none" stroke="#12b76a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
        ${coords.map(point => `<circle cx="${point.x}" cy="${point.y}" r="4" fill="#12b76a"></circle>`).join("")}
        ${snapshot.points.map((point, index) => `<text x="${pad + index * xStep}" y="${height - 2}" text-anchor="middle">${point.label}</text>`).join("")}
      </svg>
      <div class="market-foot">
        <span>Thấp nhất: ${Number(snapshot.low).toLocaleString("vi-VN")}</span>
        <span>Cao nhất: ${Number(snapshot.high).toLocaleString("vi-VN")}</span>
      </div>
    `;
  };

  const historyIcon = status => {
    if(status === "completed") return "bi-check-lg";
    if(status === "rejected") return "bi-x-lg";
    return "bi-clock";
  };

  const renderHistoryItem = txn => `
    <article class="recent-history-item">
      <span class="history-status-icon ${statusTone(txn.status)}"><i class="bi ${historyIcon(txn.status)}"></i></span>
      <div class="history-main">
        <div class="history-code">${txn.transactionCode}</div>
        <div class="small-muted">với ${txn.name}</div>
      </div>
      <div class="history-amount">
        <strong>${txn.sendAmount} ${txn.sendCurrency}</strong>
        <span>${txn.receiveAmount} ${txn.receiveCurrency}</span>
      </div>
      <div class="history-method">${methodTag(txn.method)}</div>
      <div class="history-meta">
        <span class="badge-soft ${badgeClass(txn.status)}">${txn.statusLabel}</span>
        <small>${txn.time}</small>
      </div>
      <a href="${getTxnDetailLink(txn)}" class="history-link">Xem</a>
    </article>
  `;

  const metricsEl = document.getElementById("overviewMetrics");
  if(metricsEl){
    const summary = overviewData.summary;
    metricsEl.innerHTML = [
      { label: "Đang xử lý", value: summary.processingCount, unit: "giao dịch", icon: "bi-clipboard2-check", tone: "green" },
      { label: "Chờ chấp nhận", value: summary.waitingAcceptanceCount, unit: "giao dịch", icon: "bi-clock", tone: "orange" },
      { label: "Hoàn tất", value: summary.completedCount, unit: "giao dịch", icon: "bi-check-circle", tone: "green" },
      { label: "Khiếu nại", value: summary.disputeCount, unit: "giao dịch", icon: "bi-shield-exclamation", tone: "red" },
      { label: "Volume", value: summary.volumeLabel, unit: summary.volumeCurrency, icon: "bi-database", tone: "green volume" },
    ].map(renderMetricCard).join("");
  }

  const processingEl = document.getElementById("processingList");
  if(processingEl) processingEl.innerHTML = overviewData.processingTransactions.map(renderProcessingCard).join("");

  const marketEl = document.getElementById("marketSnapshot");
  if(marketEl) marketEl.innerHTML = renderMarketChart(overviewData.marketSnapshot);

  const hotEl = document.getElementById("hotDeals");
  if(hotEl){
    hotEl.innerHTML = `
      <div class="deal-table-wrap">
        <table class="deal-highlight-table">
          <thead>
            <tr>
              <th></th>
              <th>Người tạo deal</th>
              <th>Tỷ giá (VND)</th>
              <th>Đánh giá</th>
              <th>Giới hạn giao dịch</th>
              <th>Nhận USD qua</th>
              <th>Gửi VND qua</th>
              <th>Nhãn</th>
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
  if(historyEl) historyEl.innerHTML = overviewData.recentHistory.map(renderHistoryItem).join("");
});
