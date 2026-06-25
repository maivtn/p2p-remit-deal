
document.addEventListener("DOMContentLoaded", () => {
  const filterEl = document.getElementById("accountCurrencyFilters");
  const listEl = document.getElementById("accountsList");
  const filterCurrencies = ["all", "USD", "VND", "AUD", "THB", "EUR"];
  const allAccounts = beneficiaryAccounts || [];
  let currentCurrency = "all";

  const countByCurrency = currency =>
    currency === "all"
      ? allAccounts.length
      : allAccounts.filter(account => account.currency === currency).length;

  const renderGroup = (title, accounts) => `
    <div class="mb-4">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h2 class="section-title m-0">${title}</h2>
      </div>
      ${accounts.map(acc => `
        <div class="account-card mb-2">
          <div class="d-flex justify-content-between align-items-start">
            <div class="account-card-main min-w-0">
              <div class="account-title-row">
                <img class="pay-icon-lg" src="${methodConfig(acc.currency, acc.method)?.icon || ''}" alt="${acc.method}">
                <div class="min-w-0">
                  <div class="account-method-line">
                    <span class="account-method-pill">${acc.method}</span>
                    <span class="account-currency-pill">${acc.currency}</span>
                  </div>
                  <div class="account-holder-name">${acc.details.name}</div>
                  <div class="account-meta">${accountDisplay(acc)}</div>
                </div>
              </div>
            </div>
            <div class="d-flex gap-1">
              <button class="btn btn-light icon-btn" data-account-modal data-mode="edit" data-account-id="${acc.id}"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-light icon-btn text-danger"><i class="bi bi-trash"></i></button>
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `;

  const renderFilters = () => {
    if(!filterEl) return;

    filterEl.innerHTML = filterCurrencies.map(currency => `
      <button class="account-filter-chip ${currency === currentCurrency ? "active" : ""}" data-account-currency="${currency}" type="button">
        <span>${currency === "all" ? "All" : currency}</span>
        <span class="count">${countByCurrency(currency)}</span>
      </button>
    `).join("");

    filterEl.querySelectorAll("[data-account-currency]").forEach(button => {
      button.addEventListener("click", () => {
        currentCurrency = button.dataset.accountCurrency || "all";
        renderFilters();
        renderAccounts();
      });
    });
  };

  const renderAccounts = () => {
    if(!listEl) return;

    const accounts = currentCurrency === "all"
      ? allAccounts
      : allAccounts.filter(account => account.currency === currentCurrency);

    const currencies = currentCurrency === "all"
      ? filterCurrencies.filter(currency => currency !== "all")
      : [currentCurrency];

    const groups = currencies
      .map(currency => ({
        currency,
        accounts: accounts.filter(account => account.currency === currency),
      }))
      .filter(group => group.accounts.length > 0);

    if(!groups.length){
      listEl.innerHTML = `
        <div class="history-empty">
          <div class="fw-bold">Không có tài khoản</div>
          <div class="small-muted mt-1">Chưa có tài khoản nhận tiền cho currency này.</div>
        </div>
      `;
      return;
    }

    listEl.innerHTML = `
      <div class="desktop-grid">
        ${groups.map(group => `
          <div class="desktop-col-6">
            ${renderGroup(`Tài khoản ${group.currency}`, group.accounts)}
          </div>
        `).join("")}
      </div>
    `;
    bindAccountModalEvents();
  };

  renderFilters();
  renderAccounts();
  bindAccountModalEvents();
});
