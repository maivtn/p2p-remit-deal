document.addEventListener("DOMContentLoaded", () => {
  const DEFAULT_SENDER_CURRENCY = "USD";
  const DEFAULT_RECEIVE_CURRENCY = "VND";
  const DEFAULT_AMOUNT = 500;

  const senderCurrencySelect = document.getElementById("searchSenderCurrency");
  const receiveCurrencySelect = document.getElementById("searchReceiveCurrency");
  const amountInput = document.getElementById("searchAmountInput");
  const rateText = document.getElementById("searchRateText");
  const convertedAmount = document.getElementById("searchConvertedAmount");
  const senderMethodsLabel = document.getElementById("searchSenderMethodsLabel");
  const receiveMethodsLabel = document.getElementById("searchReceiveMethodsLabel");
  const searchButton = document.querySelector('a[href="deal-results.html"]');

  const methodCurrencies = paymentMethodMatrix.map(item => item.currency);
  const getCurrencyMeta = currency => CURRENCIES.find(item => item.code === currency);
  const getMethodsByCurrency = currency => paymentMethodMatrix.find(item => item.currency === currency)?.methods || [];
  const getSelectedSenderCurrency = () => senderCurrencySelect?.value || DEFAULT_SENDER_CURRENCY;
  const getSelectedReceiveCurrency = () => receiveCurrencySelect?.value || DEFAULT_RECEIVE_CURRENCY;
  const getSearchAmount = () => {
    const value = Number(String(amountInput?.value || "").replace(/,/g, ""));
    return Number.isFinite(value) && value > 0 ? value : DEFAULT_AMOUNT;
  };

  function populateCurrencySelect(select, selectedCurrency){
    if(!select) return;

    select.innerHTML = methodCurrencies.map(currency => {
      const meta = getCurrencyMeta(currency);
      const label = meta ? `${meta.flag} ${meta.code} - ${meta.name}` : currency;
      return `<option value="${currency}" ${currency === selectedCurrency ? "selected" : ""}>${label}</option>`;
    }).join("");
  }

  function formatRate(value, currency){
    if(!Number.isFinite(value)) return "";
    const meta = getCurrencyMeta(currency);
    const fractionDigits = value >= 100 ? 0 : 4;
    const formatted = value.toLocaleString("vi-VN", {
      maximumFractionDigits: fractionDigits,
    });

    return currency === "VND"
      ? `${formatted}đ`
      : `${formatted} ${meta?.symbol || currency}`;
  }

  function formatAmount(value, currency){
    if(!Number.isFinite(value)) return "";
    const meta = getCurrencyMeta(currency);
    const fractionDigits = currency === "VND" || value >= 100 ? 0 : 2;
    const formatted = value.toLocaleString("vi-VN", {
      minimumFractionDigits: currency === "VND" ? 0 : 2,
      maximumFractionDigits: fractionDigits,
    });

    if(currency === "VND") return `${formatted}đ`;
    return `${meta?.symbol || ""}${formatted} ${currency}`.trim();
  }

  function findMarketRate(fromCurrency, toCurrency){
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
  }

  function getDefaultMethods(currency, preferredMethods){
    const methodNames = getMethodsByCurrency(currency).map(item => item.method);
    const selected = preferredMethods.filter(method => methodNames.includes(method));
    return selected.length ? selected : methodNames.slice(0, 1);
  }

  function getSelectedMethods(containerId){
    return [...document.querySelectorAll(`#${containerId} [data-chip].active`)]
      .map(chip => chip.dataset.method)
      .filter(Boolean);
  }

  function updateTooltipTitle(element, title){
    if(!element) return;
    element.setAttribute("data-bs-title", title);
    element.setAttribute("title", title);
    bootstrap.Tooltip.getInstance(element)?.setContent({ ".tooltip-inner": title });
  }

  function renderConversionPreview(){
    const senderCurrency = getSelectedSenderCurrency();
    const receiveCurrency = getSelectedReceiveCurrency();
    const amount = getSearchAmount();
    const rate = findMarketRate(senderCurrency, receiveCurrency);

    if(rateText){
      rateText.textContent = rate
        ? `1 ${senderCurrency} ≈ ${formatRate(rate, receiveCurrency)}`
        : `Chưa có tỷ giá ${senderCurrency} → ${receiveCurrency}`;
    }

    if(convertedAmount){
      convertedAmount.textContent = rate
        ? formatAmount(amount * rate, receiveCurrency)
        : "Chưa hỗ trợ";
    }
  }

  function renderMethodSections(){
    const senderCurrency = getSelectedSenderCurrency();
    const receiveCurrency = getSelectedReceiveCurrency();

    if(senderMethodsLabel?.firstChild){
      senderMethodsLabel.firstChild.textContent = `Tôi gửi ${senderCurrency} bằng hình thức `;
    }
    if(receiveMethodsLabel?.firstChild){
      receiveMethodsLabel.firstChild.textContent = `Người thụ hưởng nhận ${receiveCurrency} bằng hình thức `;
    }
    updateTooltipTitle(
      senderMethodsLabel?.querySelector(".label-help-icon"),
      `Chọn một hoặc nhiều phương thức bạn có thể dùng để gửi ${senderCurrency} cho đối tác trong deal.`
    );
    updateTooltipTitle(
      receiveMethodsLabel?.querySelector(".label-help-icon"),
      `Chọn một hoặc nhiều phương thức người thụ hưởng của bạn có thể dùng để nhận ${receiveCurrency}.`
    );

    renderMethodChips("senderUsdMethods", senderCurrency, getDefaultMethods(senderCurrency, ["Zelle"]), { single: false });
    renderMethodChips("receiveVndMethods", receiveCurrency, getDefaultMethods(receiveCurrency, ["MoMo", "Bank Transfer"]), { single: false, blue: false });
    initChipToggle();
  }

  function syncSearchCriteria(){
    const senderCurrency = getSelectedSenderCurrency();
    const receiveCurrency = getSelectedReceiveCurrency();
    const amount = getSearchAmount();
    const rate = findMarketRate(senderCurrency, receiveCurrency);
    const criteria = {
      sourceCurrency: senderCurrency,
      destinationCurrency: receiveCurrency,
      amount: {
        value: amount,
        currency: senderCurrency,
      },
      convertedAmountPreview: {
        value: rate ? amount * rate : null,
        currency: receiveCurrency,
        displayText: convertedAmount?.textContent || "",
      },
      senderPaymentMethods: getSelectedMethods("senderUsdMethods"),
      beneficiaryReceiveMethods: getSelectedMethods("receiveVndMethods"),
    };

    localStorage.setItem("p2pSearchDealForm", JSON.stringify(criteria));
  }

  populateCurrencySelect(senderCurrencySelect, DEFAULT_SENDER_CURRENCY);
  populateCurrencySelect(receiveCurrencySelect, DEFAULT_RECEIVE_CURRENCY);
  renderMethodSections();
  renderConversionPreview();

  senderCurrencySelect?.addEventListener("change", () => {
    renderMethodSections();
    renderConversionPreview();
    syncSearchCriteria();
  });
  receiveCurrencySelect?.addEventListener("change", () => {
    renderMethodSections();
    renderConversionPreview();
    syncSearchCriteria();
  });
  amountInput?.addEventListener("input", () => {
    renderConversionPreview();
    syncSearchCriteria();
  });

  searchButton?.addEventListener("click", syncSearchCriteria);

  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
    bootstrap.Tooltip.getOrCreateInstance(el);
  });

  syncSearchCriteria();
});
