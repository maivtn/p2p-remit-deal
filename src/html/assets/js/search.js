
document.addEventListener("DOMContentLoaded", () => {
  renderMethodChips("senderUsdMethods", "USD", ["Zelle"], { single:false });
  renderMethodChips("receiveVndMethods", "VND", ["MoMo", "Bank Transfer"], { single:true, blue:false });

  initChipToggle();

  let selectedBeneficiaryAccount = null;

  const selectedAccountEl = document.getElementById("selectedBeneficiaryAccount");
  const pickerButton = document.getElementById("openSearchBeneficiaryAccountPicker");
  const pickerModalEl = document.getElementById("searchBeneficiaryAccountPickerModal");
  const pickerListEl = document.getElementById("searchBeneficiaryAccountPickerList");
  const pickerSubtitleEl = document.getElementById("searchAccountPickerSubtitle");
  const pickerModal = pickerModalEl ? new bootstrap.Modal(pickerModalEl) : null;


function getSelectedChipMethod(selector, fallback){
  const activeChip = document.querySelector(`${selector} [data-chip].active`);
  return activeChip?.dataset?.method || fallback;
}

function renderAccountPickerList({ listEl, subtitleEl, accounts, selectedAccount, currency, method, onSelect }){
  if(!listEl) return;

  const filteredAccounts = accounts.filter(account =>
    account.currency === currency &&
    account.method === method &&
    account.status === "active"
  );

  if(subtitleEl){
    subtitleEl.textContent = `Chỉ hiển thị tài khoản ${currency} theo phương thức ${method}.`;
  }

  if(!filteredAccounts.length){
    listEl.innerHTML = `
      <div class="account-picker-empty">
        <div class="fw-bold">Không có tài khoản ${method}</div>
        <div class="small-muted mt-1">Bạn có thể bấm “Thêm mới” để tạo tài khoản người thụ hưởng phù hợp.</div>
      </div>
    `;
    return;
  }

  listEl.innerHTML = filteredAccounts.map(account => `
    <button class="account-picker-item ${selectedAccount?.id === account.id ? "active" : ""}" data-account-id="${account.id}" type="button">
      <div>
        <div class="account-title-row">
          <img class="pay-icon-lg" src="${methodConfig(account.currency, account.method)?.icon || ""}" alt="${account.method}">
          <div>
            <div class="account-title">${account.method} - ${account.details.name}</div>
            <div class="account-meta">${accountDisplay(account)}</div>
          </div>
        </div>
      </div>
      <i class="bi bi-chevron-right text-success"></i>
    </button>
  `).join("");

  listEl.querySelectorAll("[data-account-id]").forEach(item => {
    item.addEventListener("click", () => {
      const accountId = item.dataset.accountId;
      const account = filteredAccounts.find(item => item.id === accountId) || null;
      onSelect(account);
    });
  });
}

function renderSelectedPickerAccount({ container, account, currency, method, onChange, onRemove, colorClass = "success" }){
  if(!container) return;

  if(!account){
    container.innerHTML = `
      <div class="hidden-until-accept">
        <i class="bi bi-wallet2"></i>
        Chưa chọn tài khoản người thụ hưởng. Vui lòng chọn tài khoản ${method} hoặc thêm mới.
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="account-card selected-account-card">
      <div class="d-flex justify-content-between align-items-start gap-3">
        <div>
          <div class="account-title-row">
            <img class="pay-icon-lg" src="${methodConfig(account.currency, account.method)?.icon || ""}" alt="${account.method}">
            <div>
              <div class="account-title">${account.method} - ${account.details.name}</div>
              <div class="account-meta">${accountDisplay(account)}</div>
            </div>
          </div>
        </div>
        <span class="badge-soft ${colorClass === "primary" ? "badge-processing" : "badge-success"}">${account.currency}</span>
      </div>

      <div class="selected-account-actions">
        <button class="btn btn-sm btn-light js-change-account" type="button">
          <i class="bi bi-arrow-repeat"></i> Đổi tài khoản
        </button>
        <button class="btn btn-sm remove-account-btn js-remove-account" type="button">
          <i class="bi bi-trash"></i> Xoá
        </button>
      </div>
    </div>
  `;

  container.querySelector(".js-change-account")?.addEventListener("click", onChange);
  container.querySelector(".js-remove-account")?.addEventListener("click", onRemove);
}


  const getSelectedReceiveMethod = () => getSelectedChipMethod("#receiveVndMethods", "MoMo");

  const renderSelectedAccount = () => {
    const method = getSelectedReceiveMethod();
    renderSelectedPickerAccount({
      container: selectedAccountEl,
      account: selectedBeneficiaryAccount,
      currency: "VND",
      method,
      colorClass: "success",
      onChange: openAccountPicker,
      onRemove: () => {
        selectedBeneficiaryAccount = null;
        renderSelectedAccount();
      }
    });
  };

  function openAccountPicker(){
    const method = getSelectedReceiveMethod();
    renderAccountPickerList({
      listEl: pickerListEl,
      subtitleEl: pickerSubtitleEl,
      accounts: beneficiaryAccountsA,
      selectedAccount: selectedBeneficiaryAccount,
      currency: "VND",
      method,
      onSelect: (account) => {
        selectedBeneficiaryAccount = account;
        renderSelectedAccount();
        pickerModal?.hide();
      }
    });
    pickerModal?.show();
  }

  pickerButton?.addEventListener("click", openAccountPicker);

  document.querySelectorAll("#receiveVndMethods [data-chip]").forEach(chipEl => {
    chipEl.addEventListener("click", () => {
      window.setTimeout(() => {
        if(selectedBeneficiaryAccount && selectedBeneficiaryAccount.method !== getSelectedReceiveMethod()){
          selectedBeneficiaryAccount = null;
        }
        renderSelectedAccount();
      }, 0);
    });
  });

  renderSelectedAccount();
});
