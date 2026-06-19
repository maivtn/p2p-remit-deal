document.addEventListener("DOMContentLoaded", () => {
  renderMethodChips("senderUsdMethods", "USD", ["Zelle"], { single: false });
  renderMethodChips("receiveVndMethods", "VND", ["MoMo", "Bank Transfer"], { single: false, blue: false });

  initChipToggle();

  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
    bootstrap.Tooltip.getOrCreateInstance(el);
  });
});
