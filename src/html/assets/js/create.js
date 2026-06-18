document.addEventListener("DOMContentLoaded", () => {
  const DEFAULT_SENDER_CURRENCY = "VND";
  const DEFAULT_BENEFICIARY_CURRENCY = "USD";

  let selectedBeneficiaryAccount = null;

  const senderCurrencySelect = document.getElementById("createSenderCurrency");
  const beneficiaryCurrencySelect = document.getElementById("createBeneficiaryCurrency");
  const senderMethodsTitle = document.getElementById("createSenderMethodsTitle");
  const beneficiaryMethodsTitle = document.getElementById("createBeneficiaryMethodsTitle");
  const selectedAccountEl = document.getElementById("createBeneficiaryAccount");
  const pickerButton = document.getElementById("openCreateBeneficiaryAccountPicker");
  const pickerModalEl = document.getElementById("createBeneficiaryAccountPickerModal");
  const pickerListEl = document.getElementById("createBeneficiaryAccountPickerList");
  const pickerSubtitleEl = document.getElementById("createAccountPickerSubtitle");
  const pickerModal = pickerModalEl ? new bootstrap.Modal(pickerModalEl) : null;

  const methodCurrencies = paymentMethodMatrix.map(item => item.currency);
  const getCurrencyMeta = currency => CURRENCIES.find(item => item.code === currency);
  const getMethodsByCurrency = currency => paymentMethodMatrix.find(item => item.currency === currency)?.methods || [];
  const getSelectedSenderCurrency = () => senderCurrencySelect?.value || DEFAULT_SENDER_CURRENCY;
  const getSelectedBeneficiaryCurrency = () => beneficiaryCurrencySelect?.value || DEFAULT_BENEFICIARY_CURRENCY;
  const getDefaultBeneficiaryMethod = currency => {
    const defaultAccount = beneficiaryAccountsB.find(account =>
      account.currency === currency &&
      account.status === "active" &&
      account.isDefault
    );
    const methods = getMethodsByCurrency(currency);
    return defaultAccount?.method || methods[0]?.method || "";
  };

  function populateCurrencySelect(select, selectedCurrency){
    if(!select) return;
    select.innerHTML = methodCurrencies.map(currency => {
      const meta = getCurrencyMeta(currency);
      const label = meta ? `${meta.flag} ${meta.code} - ${meta.name}` : currency;
      return `<option value="${currency}" ${currency === selectedCurrency ? "selected" : ""}>${label}</option>`;
    }).join("");
  }

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

  const getSelectedBeneficiaryMethod = () => {
    const currency = getSelectedBeneficiaryCurrency();
    return getSelectedChipMethod("#createBeneficiaryUsdMethods", getDefaultBeneficiaryMethod(currency));
  };

  const renderSelectedAccount = () => {
    const currency = getSelectedBeneficiaryCurrency();
    const method = getSelectedBeneficiaryMethod();
    renderSelectedPickerAccount({
      container: selectedAccountEl,
      account: selectedBeneficiaryAccount,
      currency,
      method,
      colorClass: "primary",
      onChange: openAccountPicker,
      onRemove: () => {
        selectedBeneficiaryAccount = null;
        renderSelectedAccount();
      }
    });
  };

  function bindBeneficiaryMethodChanges(){
    document.querySelectorAll("#createBeneficiaryUsdMethods [data-chip]").forEach(chipEl => {
      chipEl.addEventListener("click", () => {
        window.setTimeout(() => {
          const method = getSelectedBeneficiaryMethod();
          const currency = getSelectedBeneficiaryCurrency();
          if(selectedBeneficiaryAccount && (
            selectedBeneficiaryAccount.method !== method ||
            selectedBeneficiaryAccount.currency !== currency
          )){
            selectedBeneficiaryAccount = null;
          }
          renderSelectedAccount();
        }, 0);
      });
    });
  }

  function renderMethodPanels(){
    const senderCurrency = getSelectedSenderCurrency();
    const beneficiaryCurrency = getSelectedBeneficiaryCurrency();
    const senderMethods = getMethodsByCurrency(senderCurrency).map(item => item.method);
    const beneficiaryMethod = getDefaultBeneficiaryMethod(beneficiaryCurrency);

    if(senderMethodsTitle){
      senderMethodsTitle.textContent = `Tôi gửi tiền ${senderCurrency} bằng hình thức`;
    }
    if(beneficiaryMethodsTitle){
      beneficiaryMethodsTitle.textContent = `Người thụ hưởng nhận ${beneficiaryCurrency} bằng hình thức`;
    }

    renderMethodChips("createSenderVndMethods", senderCurrency, senderMethods, { single:false });
    renderMethodChips("createBeneficiaryUsdMethods", beneficiaryCurrency, beneficiaryMethod ? [beneficiaryMethod] : [], { single:true, blue:true });
    initChipToggle();
    bindBeneficiaryMethodChanges();
    renderSelectedAccount();
  }

  function openAccountPicker(){
    const currency = getSelectedBeneficiaryCurrency();
    const method = getSelectedBeneficiaryMethod();
    renderAccountPickerList({
      listEl: pickerListEl,
      subtitleEl: pickerSubtitleEl,
      accounts: beneficiaryAccountsB,
      selectedAccount: selectedBeneficiaryAccount,
      currency,
      method,
      onSelect: (account) => {
        selectedBeneficiaryAccount = account;
        renderSelectedAccount();
        pickerModal?.hide();
      }
    });
    pickerModal?.show();
  }

  populateCurrencySelect(senderCurrencySelect, DEFAULT_SENDER_CURRENCY);
  populateCurrencySelect(beneficiaryCurrencySelect, DEFAULT_BENEFICIARY_CURRENCY);

  senderCurrencySelect?.addEventListener("change", renderMethodPanels);
  beneficiaryCurrencySelect?.addEventListener("change", () => {
    selectedBeneficiaryAccount = null;
    renderMethodPanels();
  });
  pickerButton?.addEventListener("click", openAccountPicker);

  renderMethodPanels();
});
