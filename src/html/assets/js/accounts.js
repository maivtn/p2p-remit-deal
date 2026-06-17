
document.addEventListener("DOMContentLoaded", () => {
  const renderGroup = (title, accounts) => `
    <div class="mb-4">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h2 class="section-title m-0">${title}</h2>
        <button class="btn btn-sm btn-success" data-account-modal data-mode="add"><i class="bi bi-plus"></i> Thêm</button>
      </div>
      ${accounts.map(acc => `
        <div class="account-card mb-2">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <div class="account-title-row">
              <img class="pay-icon-lg" src="${methodConfig(acc.currency, acc.method)?.icon || ''}" alt="${acc.method}">
              <div>
              <div class="account-title">${acc.method} - ${acc.details.name}</div>
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
  const el = document.getElementById("accountsList");
  if(el){
    el.innerHTML = `
      <div class="desktop-grid">
        <div class="desktop-col-6">
          ${renderGroup("Tài khoản VND", beneficiaryAccountsA.filter(a => a.currency === "VND"))}
        </div>
        <div class="desktop-col-6">
          ${renderGroup("Tài khoản USD", beneficiaryAccountsB.filter(a => a.currency === "USD"))}
        </div>
      </div>
    `;
  }

  bindAccountModalEvents();
});
