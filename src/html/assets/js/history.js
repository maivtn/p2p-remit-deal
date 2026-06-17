
document.addEventListener("DOMContentLoaded", () => {
  const listEl = document.getElementById("historyList");
  const chipsEl = document.getElementById("historyFilterChips");

  const historyItems = [
    ...overviewData.processingTransactions,
    {id:"txn_waiting_001",name:"Nguyễn Văn D",send:"$300",receive:"7.650.000đ",senderMethod:"Zelle",beneficiaryMethod:"Bank Transfer",status:"waiting",statusLabel:"Chờ chấp nhận",time:"10 phút trước"},
    ...overviewData.recentHistory,
    {id:"txn_dispute_001",name:"Nguyễn Văn E",send:"$700",receive:"17.850.000đ",senderMethod:"PayPal",beneficiaryMethod:"MoMo",status:"dispute",statusLabel:"Khiếu nại",time:"Hôm qua"}
  ];

  const filters = [
    {key:"all",label:"Tất cả"},
    {key:"processing",label:"Đang xử lý"},
    {key:"waiting",label:"Chờ chấp nhận"},
    {key:"completed",label:"Hoàn tất"},
    {key:"dispute",label:"Khiếu nại"},
  ];

  const getDetailLink = txn => txn.status==="completed"
    ? "transaction-detail-case-06-completed-rating.html"
    : txn.status==="waiting"
      ? "transaction-detail-case-01-waiting-counterparty-acceptance.html"
      : txn.status==="dispute"
        ? "transaction-detail-case-07-my-dispute.html"
        : "transaction-detail-case-02-accepted-upload-proof.html";

  const count = key => key==="all" ? historyItems.length : historyItems.filter(x=>x.status===key).length;

  const renderChips = active => {
    if(!chipsEl) return;
    chipsEl.innerHTML = filters.map(f => `
      <button class="history-filter-chip ${f.key===active ? "active" : ""}" data-history-filter="${f.key}" type="button">
        <span>${f.label}</span>
        <span class="count">${count(f.key)}</span>
      </button>
    `).join("");

    chipsEl.querySelectorAll("[data-history-filter]").forEach(btn => {
      btn.addEventListener("click", () => renderHistory(btn.dataset.historyFilter));
    });
  };

  const renderHistory = (active="all") => {
    renderChips(active);

    const items = active==="all"
      ? historyItems
      : historyItems.filter(x=>x.status===active);

    if(!listEl) return;

    if(!items.length){
      listEl.innerHTML = `
        <div class="history-empty">
          <div class="fw-bold">Không có giao dịch</div>
          <div class="small-muted mt-1">Không có dữ liệu phù hợp với filter này.</div>
        </div>
      `;
      return;
    }

    listEl.innerHTML = items.map(txn => `
      <div class="txn-card">
        <div class="name-line">
          <h3 class="card-name">${txn.name}</h3>
          <span class="badge-soft ${badgeClass(txn.status)}">${txn.statusLabel}</span>
        </div>

        <div class="amount-row">
          <div>
            <span class="amount-main">${txn.send}</span>
            <span class="mx-1">→</span>
            <span class="amount-main">${txn.receive}</span>
          </div>
          <span class="small-muted">${txn.time}</span>
        </div>

        <div class="txn-method-action-row">
          <div class="txn-method-tags">
            ${methodTag(txn.senderMethod, "green")}
            ${methodTag(txn.beneficiaryMethod)}
          </div>

          <a class="btn btn-sm btn-outline-primary" href="${getDetailLink(txn)}">
            <i class="bi bi-eye"></i> View detail
          </a>
        </div>
      </div>
    `).join("");
  };

  renderHistory("all");
});
