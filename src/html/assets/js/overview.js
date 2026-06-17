
document.addEventListener("DOMContentLoaded", () => {
  const getTxnDetailLink = (txn) => {
    if (txn.status === "completed") return "transaction-detail-case-06-completed-rating.html";
    if (txn.status === "waiting") return "transaction-detail-case-01-waiting-counterparty-acceptance.html";
    if (txn.status === "dispute") return "transaction-detail-case-07-my-dispute.html";
    return "transaction-detail-case-02-accepted-upload-proof.html";
  };

  const renderTxnCard = (txn) => `
    <div class="txn-card">
      <div class="name-line">
        <h3 class="card-name">${txn.name}</h3>
        <span class="badge-soft ${badgeClass(txn.status)}">${txn.statusLabel}</span>
      </div>

      <div class="amount-row">
        <div>
          <span class="amount-main">${txn.send}</span>
          <span class="mx-1">→</span>
          <span class="amount-main">${txn.receive}</span>
        </div>
        <span class="small-muted">${txn.time}</span>
      </div>

      <div class="txn-method-action-row">
        <div class="txn-method-tags">
          ${methodTag(txn.senderMethod, "green")}
          ${methodTag(txn.beneficiaryMethod)}
        </div>

        <a class="btn btn-sm btn-outline-primary" href="${getTxnDetailLink(txn)}">
          <i class="bi bi-eye"></i> Xem
        </a>
      </div>
    </div>
  `;

  const processingEl = document.getElementById("processingList");
  if(processingEl) processingEl.innerHTML = overviewData.processingTransactions.map(renderTxnCard).join("");

  const hotEl = document.getElementById("hotDeals");
  if(hotEl){
    hotEl.innerHTML = mockDealsB.slice(0,2).map(deal => `
      <div class="deal-card">
        <div class="name-line">
          <div>
            <h3 class="card-name">Tran *** B</h3>
            <div class="small-muted">${currencyFlag(deal.beneficiaryReceiveCurrency.currency)} ${deal.beneficiaryReceiveCurrency.currency} → ${currencyFlag(deal.senderPayCurrency.currency)} ${deal.senderPayCurrency.currency} · $${deal.amountLimit.minUsd}–$${deal.amountLimit.maxUsd}</div>
          </div>
          <div class="rate-blue">${deal.exchangeRate.rate.toLocaleString("vi-VN")}đ/USD</div>
        </div>
        <div class="d-flex justify-content-between align-items-center mt-2">
          <div>${methodTag(deal.beneficiaryReceiveMethod)}</div>
          <a href="deal-detail.html" class="btn btn-sm btn-outline-primary small"><i class="bi bi-eye"></i> Xem</a>
        </div>
      </div>
    `).join("");
  }

  const historyEl = document.getElementById("recentHistory");
  if(historyEl) historyEl.innerHTML = overviewData.recentHistory.map(renderTxnCard).join("");
});
