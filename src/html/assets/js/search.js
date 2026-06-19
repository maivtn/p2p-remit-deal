document.addEventListener("DOMContentLoaded", () => {
  renderMethodChips("senderUsdMethods", "USD", ["Zelle"], { single: false });
  renderMethodChips("receiveVndMethods", "VND", ["MoMo", "Bank Transfer"], { single: false, blue: false });

  initChipToggle();
});
