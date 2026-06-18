
document.addEventListener("DOMContentLoaded", () => {
  const listEl = document.getElementById("historyList");
  const chipsEl = document.getElementById("historyFilterChips");
  const pagerEl = document.getElementById("historyPager");

  const PAGE_SIZE = 5;

  // Extra rows so history spans multiple pages (demo only).
  const extraHistory = [
    { name:"Lê Thị F",      send:"$450", receive:"11.475.000đ", senderMethod:"Venmo",         beneficiaryMethod:"MoMo",          status:"completed",  statusLabel:"Hoàn thành",     time:"4 ngày trước" },
    { name:"Trần Văn G",    send:"$220", receive:"5.610.000đ",  senderMethod:"Zelle",         beneficiaryMethod:"Bank Transfer", status:"processing", statusLabel:"Đang xử lý",     time:"5 phút trước" },
    { name:"Phạm Thị H",    send:"$880", receive:"22.440.000đ", senderMethod:"PayPal",        beneficiaryMethod:"MoMo",          status:"completed",  statusLabel:"Hoàn thành",     time:"5 ngày trước" },
    { name:"Vũ Minh I",     send:"$130", receive:"3.315.000đ",  senderMethod:"Bank Transfer", beneficiaryMethod:"ZaloPay",       status:"waiting",    statusLabel:"Chờ chấp nhận",  time:"20 phút trước" },
    { name:"Hoàng Văn K",   send:"$640", receive:"16.320.000đ", senderMethod:"Zelle",         beneficiaryMethod:"Bank Transfer", status:"completed",  statusLabel:"Hoàn thành",     time:"1 tuần trước" },
    { name:"Đặng Thị L",    send:"$390", receive:"9.945.000đ",  senderMethod:"Venmo",         beneficiaryMethod:"MoMo",          status:"processing", statusLabel:"Đang xử lý",     time:"12 phút trước" },
    { name:"Bùi Văn M",     send:"$1.100", receive:"28.050.000đ", senderMethod:"PayPal",      beneficiaryMethod:"Bank Transfer", status:"dispute",    statusLabel:"Khiếu nại",      time:"2 ngày trước" },
    { name:"Ngô Thị N",     send:"$260", receive:"6.630.000đ",  senderMethod:"Zelle",         beneficiaryMethod:"ZaloPay",       status:"completed",  statusLabel:"Hoàn thành",     time:"1 tuần trước" },
  ].map((x, i) => ({ id: `txn_gen_${i + 1}`, ...x }));

  const historyItems = [
    ...overviewData.processingTransactions,
    { id:"txn_waiting_001", name:"Nguyễn Văn D", send:"$300", receive:"7.650.000đ", senderMethod:"Zelle", beneficiaryMethod:"Bank Transfer", status:"waiting", statusLabel:"Chờ chấp nhận", time:"10 phút trước" },
    ...overviewData.recentHistory,
    { id:"txn_dispute_001", name:"Nguyễn Văn E", send:"$700", receive:"17.850.000đ", senderMethod:"PayPal", beneficiaryMethod:"MoMo", status:"dispute", statusLabel:"Khiếu nại", time:"Hôm qua" },
    ...extraHistory,
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

  let currentFilter = "all";
  let currentPage = 1;

  const filterItems = key =>
    key==="all" ? historyItems : historyItems.filter(x => x.status===key);

  const count = key => filterItems(key).length;

  const renderChips = () => {
    if(!chipsEl) return;
    chipsEl.innerHTML = filters.map(f => `
      <button class="history-filter-chip ${f.key===currentFilter ? "active" : ""}" data-history-filter="${f.key}" type="button">
        <span>${f.label}</span>
        <span class="count">${count(f.key)}</span>
      </button>
    `).join("");

    chipsEl.querySelectorAll("[data-history-filter]").forEach(btn => {
      btn.addEventListener("click", () => {
        currentFilter = btn.dataset.historyFilter;
        currentPage = 1;
        renderChips();
        renderHistory();
      });
    });
  };

  const txnCardHtml = txn => `
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
  `;

  const renderHistory = () => {
    if(!listEl) return;

    const items = filterItems(currentFilter);
    const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    if(currentPage > pageCount) currentPage = pageCount;

    if(!items.length){
      listEl.innerHTML = `
        <div class="history-empty">
          <div class="fw-bold">Không có giao dịch</div>
          <div class="small-muted mt-1">Không có dữ liệu phù hợp với filter này.</div>
        </div>
      `;
      renderPager(pagerEl, { page: 1, pageSize: PAGE_SIZE, total: 0, onPage: () => {} });
      return;
    }

    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = items.slice(start, start + PAGE_SIZE);

    listEl.innerHTML = pageItems.map(txnCardHtml).join("");

    renderPager(pagerEl, {
      page: currentPage,
      pageSize: PAGE_SIZE,
      total: items.length,
      onPage: (p) => {
        currentPage = p;
        renderHistory();
        listEl.scrollIntoView({ behavior: "smooth", block: "start" });
      },
    });
  };

  renderChips();
  renderHistory();
});
