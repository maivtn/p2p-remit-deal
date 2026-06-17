document.addEventListener("DOMContentLoaded", () => {
  const deal = mockDealsB[0];

  const params = new URLSearchParams(window.location.search);
  const isOwner = params.get("isOwner") === "true";

  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setText("dealCode", deal.dealCode);

  setText(
    "dealPair",
    `${currencyFlag(deal.senderPayCurrency.currency)} ${deal.senderPayCurrency.currency} → ${currencyFlag(deal.beneficiaryReceiveCurrency.currency)} ${deal.beneficiaryReceiveCurrency.currency}`
  );

  setText(
    "dealAmount",
    `$${deal.amountLimit.minUsd} - $${deal.amountLimit.maxUsd}`
  );

  setText(
    "dealRate",
    `1 USD = ${deal.exchangeRate.rate.toLocaleString("vi-VN")}đ`
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