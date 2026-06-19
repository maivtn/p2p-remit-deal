
document.addEventListener("DOMContentLoaded", () => {
  const results = document.getElementById("dealResultsList");
  if(!results) return;

  const formatDealRate = deal => `${Number(deal.exchangeRate.rate).toLocaleString("vi-VN", {
    maximumFractionDigits: Number(deal.exchangeRate.rate) < 100 ? 4 : 0,
  })} ${deal.exchangeRate.to}/${deal.exchangeRate.from}`;

  results.innerHTML = mockDealsB.map(deal => `
    <div class="deal-card">
      <div class="name-line">
        <div>
          <h3 class="card-name">Tran *** B</h3>
          <div class="small-muted">
            ${deal.beneficiaryReceiveCurrency.currency}
            →
            ${deal.senderPayCurrency.currency}
            · $${deal.amountLimit.minUsd}–$${deal.amountLimit.maxUsd}
          </div>
        </div>
        <span class="badge-soft badge-success">Phù hợp</span>
      </div>

      <div class="result-rate-action-row mt-2">
        <div>
          <div class="small-muted">Tỷ giá</div>
          <div class="rate-blue">${formatDealRate(deal)}</div>
        </div>
        <a href="deal-detail.html" class="btn btn-primary btn-sm">Xem chi tiết</a>
      </div>

      <div class="result-method-split mt-3">
        <div class="result-method-row">
          <div class="result-method-label">Nhận qua:</div>
          <div class="result-method-tags">${deal.senderPaymentMethods.map(m => methodTag(m, "green")).join("")}</div>
        </div>
        <div class="result-method-row">
          <div class="result-method-label">Gửi qua:</div>
          <div class="result-method-tags">${methodTag(deal.beneficiaryReceiveMethod)}</div>
        </div>
      </div>
    </div>
  `).join("");
});
