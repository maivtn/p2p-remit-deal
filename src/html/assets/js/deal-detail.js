document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const requestedDealId = params.get("dealId");
  const deal = mockDealsB.find(item => item.id === requestedDealId || item.dealCode === requestedDealId) || mockDealsB[0];
  const isOwner = params.get("isOwner") === "true";

  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  const formatDealRate = deal => `1 ${deal.exchangeRate.from} = ${Number(deal.exchangeRate.rate).toLocaleString("vi-VN", {
    maximumFractionDigits: Number(deal.exchangeRate.rate) < 100 ? 4 : 0,
  })} ${deal.exchangeRate.to}`;

  setText("dealCode", deal.dealCode);

  setText(
    "dealPair",
    `${deal.senderPayCurrency.currency} → ${deal.beneficiaryReceiveCurrency.currency}`
  );

  setText(
    "dealAmount",
    `$${deal.amountLimit.minUsd} - $${deal.amountLimit.maxUsd}`
  );

  setText(
    "dealRate",
    formatDealRate(deal)
  );

  setText(
    "dealRateLabel",
    deal.exchangeRate?.source === "market" ? "Tỷ giá (theo giá thị trường)" : "Tỷ giá"
  );

  const methodEl = document.getElementById("dealMethods");

  if (methodEl) {
    methodEl.innerHTML = `
      <div class="mb-3">
        <div class="small-muted mb-1">Bên đối tác nhận qua</div>
        ${methodTag(deal.beneficiaryReceiveMethod)}
      </div>
      <div>
        <div class="small-muted mb-1">Bên đối tác gửi qua</div>
        ${deal.senderPaymentMethods.map(m => methodTag(m, "green")).join("")}
      </div>
    `;
  }

  const accountEl = document.getElementById("dealAccountInfo");
  const accountElOwner = document.getElementById("cardAccountInfo");
  

  if (!isOwner) {
    if (accountElOwner) accountElOwner.style.display = "none";
    return;
  }

  const acc = beneficiaryAccountsB.find(a => a.id === deal.beneficiaryAccountId);

  if (accountEl && acc && isOwner) {
    accountEl.style.display = "";

    accountEl.innerHTML = `
      <div class="account-card">
        <div class="d-flex justify-content-between align-items-start gap-3">
          <div class="account-title-row">
            <img class="pay-icon-lg" src="${methodConfig(acc.currency, acc.method)?.icon || ""}" alt="${acc.method}">
            <div>
              <div class="account-title">${acc.method} - ${acc.details.name}</div>
              <div class="account-meta">${accountDisplay(acc)}</div>
            </div>
          </div>
          <span class="badge-soft badge-success">${acc.currency}</span>
        </div>
      </div>
    `;
  }
});
