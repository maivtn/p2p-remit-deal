document.addEventListener("DOMContentLoaded", () => {
  const DEFAULT_SENDER_CURRENCY = "VND";
  const DEFAULT_BENEFICIARY_CURRENCY = "USD";

  let selectedBeneficiaryAccount = null;
  let operatingHours = [
    { key: "mon", label: "Mon", enabled: true, start: "09:00", end: "19:00" },
    { key: "tue", label: "Tue", enabled: true, start: "09:00", end: "19:00" },
    { key: "wed", label: "Wed", enabled: true, start: "09:00", end: "19:00" },
    { key: "thu", label: "Thu", enabled: true, start: "09:00", end: "19:00" },
    { key: "fri", label: "Fri", enabled: true, start: "09:00", end: "19:00" },
    { key: "sat", label: "Sat", enabled: true, start: "10:00", end: "16:00" },
    { key: "sun", label: "Sun", enabled: false, start: "10:00", end: "16:00" },
  ];

  const senderCurrencySelect = document.getElementById("createSenderCurrency");
  const beneficiaryCurrencySelect = document.getElementById("createBeneficiaryCurrency");
  const rateLabel = document.getElementById("createRateLabel");
  const marketRateToggle = document.getElementById("createMarketRateToggle");
  const exchangeRateInput = document.getElementById("createExchangeRateInput");
  const minAmountLabel = document.getElementById("createMinAmountLabel");
  const maxAmountLabel = document.getElementById("createMaxAmountLabel");
  const minAmountHelp = document.getElementById("createMinAmountHelp");
  const maxAmountHelp = document.getElementById("createMaxAmountHelp");
  const senderMethodsTitle = document.getElementById("createSenderMethodsTitle");
  const beneficiaryMethodsTitle = document.getElementById("createBeneficiaryMethodsTitle");
  const selectedAccountEl = document.getElementById("createBeneficiaryAccount");
  const pickerButton = document.getElementById("openCreateBeneficiaryAccountPicker");
  const pickerModalEl = document.getElementById("createBeneficiaryAccountPickerModal");
  const pickerListEl = document.getElementById("createBeneficiaryAccountPickerList");
  const pickerSubtitleEl = document.getElementById("createAccountPickerSubtitle");
  const pickerModal = pickerModalEl ? new bootstrap.Modal(pickerModalEl) : null;
  const operatingHoursSummaryEl = document.getElementById("operatingHoursSummary");
  const operatingHoursListEl = document.getElementById("operatingHoursList");
  const operatingHoursModalEl = document.getElementById("operatingHoursModal");
  const operatingHoursModal = operatingHoursModalEl ? new bootstrap.Modal(operatingHoursModalEl) : null;
  const operatingHoursButton = document.getElementById("openOperatingHoursModal");
  const saveOperatingHoursButton = document.getElementById("saveOperatingHours");

  const methodCurrencies = paymentMethodMatrix.map(item => item.currency);
  const getCurrencyMeta = currency => CURRENCIES.find(item => item.code === currency);
  const getMethodsByCurrency = currency => paymentMethodMatrix.find(item => item.currency === currency)?.methods || [];
  const getSelectedSenderCurrency = () => senderCurrencySelect?.value || DEFAULT_SENDER_CURRENCY;
  const getSelectedBeneficiaryCurrency = () => beneficiaryCurrencySelect?.value || DEFAULT_BENEFICIARY_CURRENCY;
  const formatHourLabel = value => {
    const [hourText, minuteText] = value.split(":");
    const hour = Number(hourText);
    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minuteText} ${suffix}`;
  };
  const summarizeOperatingHours = hours => {
    const enabledDays = hours.filter(item => item.enabled);
    if(!enabledDays.length) return "No availability hours selected";

    const groups = [];
    enabledDays.forEach(day => {
      const lastGroup = groups[groups.length - 1];
      if(lastGroup && lastGroup.start === day.start && lastGroup.end === day.end){
        lastGroup.days.push(day.label);
      }else{
        groups.push({ start: day.start, end: day.end, days: [day.label] });
      }
    });

    return groups.map(group => {
      const dayLabel = group.days.length > 1
        ? `${group.days[0]}-${group.days[group.days.length - 1]}`
        : group.days[0];
      return `${dayLabel}, ${formatHourLabel(group.start)} - ${formatHourLabel(group.end)}`;
    }).join("; ");
  };
  const formatRateInput = value => {
    const rate = Number(value);
    if(!Number.isFinite(rate)) return "";
    return rate >= 100 ? String(Math.round(rate)) : String(Number(rate.toFixed(4)));
  };
  const findMarketRate = (fromCurrency, toCurrency) => {
    const exactDeals = mockDealsB.filter(deal =>
      deal.exchangeRate?.from === fromCurrency &&
      deal.exchangeRate?.to === toCurrency
    );
    const exactMarketDeal = exactDeals.find(deal => deal.exchangeRate.source === "market");
    if(exactMarketDeal) return exactMarketDeal.exchangeRate.rate;
    if(exactDeals[0]) return exactDeals[0].exchangeRate.rate;

    const reverseDeals = mockDealsB.filter(deal =>
      deal.exchangeRate?.from === toCurrency &&
      deal.exchangeRate?.to === fromCurrency
    );
    const reverseMarketDeal = reverseDeals.find(deal => deal.exchangeRate.source === "market");
    const reverseRate = reverseMarketDeal?.exchangeRate.rate || reverseDeals[0]?.exchangeRate.rate;
    return reverseRate ? 1 / Number(reverseRate) : null;
  };
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

  function renderOperatingHoursSummary(){
    if(operatingHoursSummaryEl){
      operatingHoursSummaryEl.textContent = summarizeOperatingHours(operatingHours);
    }
  }

  function renderOperatingHoursRows(){
    if(!operatingHoursListEl) return;

    operatingHoursListEl.innerHTML = operatingHours.map(day => `
      <div class="operating-hours-row ${day.enabled ? "" : "muted"}" data-day="${day.key}">
        <label class="operating-hours-day">
          <input class="form-check-input operating-hours-toggle" type="checkbox" ${day.enabled ? "checked" : ""} data-day-enabled="${day.key}">
          <span>${day.label}</span>
        </label>
        <div class="operating-hours-time-group">
          <div class="operating-hours-time-wrap">
            <input class="form-control operating-hours-time" type="time" value="${day.start}" ${day.enabled ? "" : "disabled"} data-day-start="${day.key}">
            <i class="bi bi-clock"></i>
          </div>
          <span class="operating-hours-to">to</span>
          <div class="operating-hours-time-wrap">
            <input class="form-control operating-hours-time" type="time" value="${day.end}" ${day.enabled ? "" : "disabled"} data-day-end="${day.key}">
            <i class="bi bi-clock"></i>
          </div>
        </div>
      </div>
    `).join("");

    operatingHoursListEl.querySelectorAll("[data-day-enabled]").forEach(input => {
      input.addEventListener("change", () => {
        syncOperatingHoursFromInputs();
        const day = operatingHours.find(item => item.key === input.dataset.dayEnabled);
        if(!day) return;
        day.enabled = input.checked;
        renderOperatingHoursRows();
      });
    });
  }

  function syncOperatingHoursFromInputs(){
    operatingHours = operatingHours.map(day => {
      const startInput = operatingHoursListEl?.querySelector(`[data-day-start="${day.key}"]`);
      const endInput = operatingHoursListEl?.querySelector(`[data-day-end="${day.key}"]`);
      const enabledInput = operatingHoursListEl?.querySelector(`[data-day-enabled="${day.key}"]`);
      return {
        ...day,
        enabled: !!enabledInput?.checked,
        start: startInput?.value || day.start,
        end: endInput?.value || day.end,
      };
    });
  }

  function getSelectedChipMethod(selector, fallback){
    const activeChip = document.querySelector(`${selector} [data-chip].active`);
    return activeChip?.dataset?.method || fallback;
  }

  function renderExchangeRate(){
    const senderCurrency = getSelectedSenderCurrency();
    const beneficiaryCurrency = getSelectedBeneficiaryCurrency();
    const marketRate = findMarketRate(beneficiaryCurrency, senderCurrency);

    if(rateLabel){
      rateLabel.textContent = `Tỷ giá (1 ${beneficiaryCurrency} = ? ${senderCurrency})`;
    }
    if(exchangeRateInput){
      exchangeRateInput.placeholder = marketRate
        ? `Thị trường: ${formatRateInput(marketRate)}`
        : "Nhập tỷ giá";
      exchangeRateInput.readOnly = !!marketRateToggle?.checked;
      exchangeRateInput.classList.toggle("bg-light", !!marketRateToggle?.checked);
      if(marketRateToggle?.checked){
        exchangeRateInput.value = marketRate ? formatRateInput(marketRate) : "";
      }
    }
  }

  function updateTooltipTitle(element, title){
    if(!element) return;
    element.setAttribute("data-bs-title", title);
    element.setAttribute("title", title);
    bootstrap.Tooltip.getOrCreateInstance(element).setContent({ ".tooltip-inner": title });
  }

  function renderAmountLimitLabels(){
    const senderCurrency = getSelectedSenderCurrency();

    if(minAmountLabel){
      minAmountLabel.textContent = `Tối thiểu (${senderCurrency})`;
    }
    if(maxAmountLabel){
      maxAmountLabel.textContent = `Tối đa (${senderCurrency})`;
    }

    updateTooltipTitle(
      minAmountHelp,
      `Số tiền ${senderCurrency} nhỏ nhất mà bạn muốn gửi cho mỗi giao dịch được tạo từ deal này.`
    );
    updateTooltipTitle(
      maxAmountHelp,
      `Số tiền ${senderCurrency} lớn nhất mà bạn sẵn sàng gửi cho mỗi giao dịch từ deal này.`
    );
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
          <i class="bi bi-person-check"></i>
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
    renderExchangeRate();
    renderAmountLimitLabels();
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

  if(marketRateToggle) marketRateToggle.checked = true;

  senderCurrencySelect?.addEventListener("change", renderMethodPanels);
  beneficiaryCurrencySelect?.addEventListener("change", () => {
    selectedBeneficiaryAccount = null;
    renderMethodPanels();
  });
  marketRateToggle?.addEventListener("change", renderExchangeRate);
  pickerButton?.addEventListener("click", openAccountPicker);
  operatingHoursButton?.addEventListener("click", () => {
    renderOperatingHoursRows();
    operatingHoursModal?.show();
  });
  saveOperatingHoursButton?.addEventListener("click", () => {
    syncOperatingHoursFromInputs();
    renderOperatingHoursSummary();
    operatingHoursModal?.hide();
  });

  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
    bootstrap.Tooltip.getOrCreateInstance(el);
  });

  renderOperatingHoursSummary();
  renderMethodPanels();
});
