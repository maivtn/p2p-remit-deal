
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const requestedDealId = params.get("dealId");
  const deal = mockDealsB.find(item => item.id === requestedDealId || item.dealCode === requestedDealId) || mockDealsB[0];
  let selectedBeneficiaryAccount = null;

  const backLink = document.getElementById("selectDealBackLink");
  if(backLink){
    const detailHref = `deal-detail.html?dealId=${encodeURIComponent(deal.id)}`;
    backLink.href = params.get("from") === "results" ? "deal-results.html" : detailHref;
  }

  const renderAllowedOldStyleChips = (containerId, methods, options = {}) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const uniqueMethods = [...new Set(methods)].filter(Boolean);

    // Chỉ render các method tồn tại trong deal.
    // UI vẫn dùng chip cũ: .chip + data-chip + check mark.
    container.innerHTML = uniqueMethods
      .map((method, index) => chip(method, index === 0, !!options.single, !!options.blue))
      .join("");
  };

  const getSelectedReceiveMethod = () => {
    const activeChip = document.querySelector("#selectDealReceiveMethods [data-chip].active");
    return activeChip?.dataset?.method || deal.senderPaymentMethods[0];
  };

  const summaryReceiveMethods = document.getElementById("summaryReceiveMethods");
  if(summaryReceiveMethods){
    summaryReceiveMethods.innerHTML = methodTag(deal.beneficiaryReceiveMethod);
  }

  const summaryCreator = document.getElementById("dealSummaryCreator");
  if(summaryCreator){
    summaryCreator.innerHTML = `
      <span class="avatar">${deal.ownerInitial || "B"}</span>
      <span>${deal.ownerNameMasked || "Tran ***"}</span>
      ${renderOwnerRating(deal, "compact")}
    `;
  }

  const summarySendMethods = document.getElementById("summarySendMethods");
  if(summarySendMethods){
    summarySendMethods.innerHTML = deal.senderPaymentMethods.map(m => methodTag(m, "green")).join("");
  }

  // A gửi USD bằng hình thức = chỉ hiển thị method mà Tran *** B có thể nhận USD.
  renderAllowedOldStyleChips("selectDealSenderMethods", [deal.beneficiaryReceiveMethod], {
    single: true
  });

  // Người thụ hưởng nhận VND bằng hình thức = chỉ hiển thị method mà Tran *** B có thể gửi VND.
  renderAllowedOldStyleChips("selectDealReceiveMethods", deal.senderPaymentMethods, {
    single: true
  });

  initChipToggle();

  const selectedAccountEl = document.getElementById("selectedBeneficiaryAccount");
  const pickerButton = document.getElementById("openBeneficiaryAccountPicker");
  const pickerModalEl = document.getElementById("beneficiaryAccountPickerModal");
  const pickerListEl = document.getElementById("beneficiaryAccountPickerList");
  const pickerSubtitleEl = document.getElementById("accountPickerSubtitle");

  const pickerModal = pickerModalEl ? new bootstrap.Modal(pickerModalEl) : null;

  const getFilteredAccounts = () => {
    const selectedMethod = getSelectedReceiveMethod();
    return beneficiaryAccountsA.filter(account =>
      account.currency === "VND" &&
      account.method === selectedMethod &&
      account.status === "active"
    );
  };

  const renderSelectedAccount = () => {
    if(!selectedAccountEl) return;

    if(!selectedBeneficiaryAccount){
      const selectedMethod = getSelectedReceiveMethod();
      selectedAccountEl.innerHTML = `
        <div class="hidden-until-accept">
          <i class="bi bi-person-check"></i>
          Chưa chọn tài khoản người thụ hưởng. Vui lòng chọn tài khoản ${selectedMethod} hoặc thêm mới.
        </div>
      `;
      return;
    }

    const account = selectedBeneficiaryAccount;
    selectedAccountEl.innerHTML = `
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
          <span class="badge-soft badge-success">${account.currency}</span>
        </div>

        <div class="selected-account-actions">
          <button class="btn btn-sm btn-light" id="changeSelectedBeneficiaryAccount" type="button">
            <i class="bi bi-arrow-repeat"></i> Đổi tài khoản
          </button>
          <button class="btn btn-sm remove-account-btn" id="removeSelectedBeneficiaryAccount" type="button">
            <i class="bi bi-trash"></i> Xoá
          </button>
        </div>
      </div>
    `;

    document.getElementById("changeSelectedBeneficiaryAccount")?.addEventListener("click", openAccountPicker);
    document.getElementById("removeSelectedBeneficiaryAccount")?.addEventListener("click", () => {
      selectedBeneficiaryAccount = null;
      renderSelectedAccount();
    });
  };

  const renderPickerList = () => {
    if(!pickerListEl) return;

    const selectedMethod = getSelectedReceiveMethod();
    const accounts = getFilteredAccounts();

    if(pickerSubtitleEl){
      pickerSubtitleEl.textContent = `Chỉ hiển thị tài khoản VND theo phương thức ${selectedMethod}.`;
    }

    if(!accounts.length){
      pickerListEl.innerHTML = `
        <div class="account-picker-empty">
          <div class="fw-bold">Không có tài khoản ${selectedMethod}</div>
          <div class="small-muted mt-1">Bạn có thể bấm “Thêm mới” để tạo tài khoản người thụ hưởng phù hợp.</div>
        </div>
      `;
      return;
    }

    pickerListEl.innerHTML = accounts.map(account => `
      <button class="account-picker-item ${selectedBeneficiaryAccount?.id === account.id ? "active" : ""}" data-account-id="${account.id}" type="button">
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

    pickerListEl.querySelectorAll("[data-account-id]").forEach(item => {
      item.addEventListener("click", () => {
        const accountId = item.dataset.accountId;
        selectedBeneficiaryAccount = accounts.find(account => account.id === accountId) || null;
        renderSelectedAccount();
        pickerModal?.hide();
      });
    });
  };

  function openAccountPicker(){
    renderPickerList();
    pickerModal?.show();
  }

  pickerButton?.addEventListener("click", openAccountPicker);

  // Khi đổi phương thức nhận, tài khoản đã chọn không còn phù hợp thì xoá khỏi form.
  document.querySelectorAll("#selectDealReceiveMethods [data-chip]").forEach(chipEl => {
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
