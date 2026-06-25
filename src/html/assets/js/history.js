
document.addEventListener("DOMContentLoaded", () => {
  const listEl = document.getElementById("historyList");
  const chipsEl = document.getElementById("historyFilterChips");
  const viewToggleEl = document.getElementById("historyViewToggle");
  const pagerEl = document.getElementById("historyPager");

  const PAGE_SIZE = 6;

  // Overview and History share the same source records but were authored with two
  // field shapes. Normalize each record into the shape History renders so both the
  // overviewData items (sendAmount/sendCurrency, canonical BA statuses) and the
  // inline/extra rows (send/receive strings, simple statuses) display correctly.
  const STATUS_BUCKET = {
    processing: "processing",
    accepted: "processing",
    waiting_for_payment: "processing",
    proof_submitted: "processing",
    partially_confirmed: "processing",
    waiting: "waiting",
    pending_acceptance: "waiting",
    waiting_acceptance: "waiting",
    completed: "completed",
    dispute: "dispute",
    disputed: "dispute",
    cancelled: "cancelled",
    rejected: "cancelled",
    expired: "cancelled",
  };
  const statusBucket = status => STATUS_BUCKET[status] || status;

  const fmtSend = txn => txn.send
    || (txn.sendCurrency === "USD" ? `$${txn.sendAmount}` : `${txn.sendAmount} ${txn.sendCurrency}`);
  const fmtReceive = txn => txn.receive
    || (txn.receiveCurrency === "VND"
      ? `${String(txn.receiveAmount).replace(/,/g, ".")}đ`
      : `${txn.receiveAmount} ${txn.receiveCurrency}`);

  const makeTxnCode = txn => txn.transactionCode || `TXN-${String(txn.id || "DEMO").replace(/^txn_/, "").toUpperCase()}`;

  const normalizeTxn = txn => ({
    ...txn,
    transactionCode: makeTxnCode(txn),
    send: fmtSend(txn),
    receive: fmtReceive(txn),
    senderMethod: txn.senderMethod || txn.method,
    beneficiaryMethod: txn.beneficiaryMethod || txn.method,
    bucket: statusBucket(txn.status),
  });

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
  ].map(normalizeTxn);

  const filters = [
    {key:"all",label:"Tất cả"},
    {key:"processing",label:"Đang xử lý"},
    {key:"waiting",label:"Chờ chấp nhận"},
    {key:"completed",label:"Hoàn tất"},
    {key:"dispute",label:"Khiếu nại"},
  ];

  const getDetailLink = txn => txn.bucket==="completed"
    ? "transaction-detail-case-06-completed-rating.html"
    : txn.bucket==="waiting"
      ? "transaction-detail-case-01-waiting-counterparty-acceptance.html"
      : txn.bucket==="dispute"
        ? "transaction-detail-case-07-my-dispute.html"
        : "transaction-detail-case-02-accepted-upload-proof.html";

  const historyIcon = status => {
    const bucket = statusBucket(status);
    if(bucket === "completed") return "bi-check-lg";
    if(bucket === "cancelled") return "bi-x-lg";
    if(bucket === "dispute") return "bi-exclamation-lg";
    return "bi-clock";
  };

  const statusTone = status => {
    const bucket = statusBucket(status);
    if(bucket === "completed") return "success";
    if(bucket === "cancelled" || bucket === "dispute") return "danger";
    if(bucket === "waiting") return "warning";
    return "processing";
  };

  const statusBadgeClass = txn => {
    if(txn.bucket === "dispute") return badgeClass("disputed");
    if(txn.bucket === "cancelled") return badgeClass("cancelled");
    return badgeClass(txn.status);
  };

  let currentFilter = "all";
  let currentPage = 1;
  let currentView = localStorage.getItem("historyViewMode") || "cards";
  if(!["cards", "table"].includes(currentView)) currentView = "cards";

  const filterItems = key =>
    key==="all" ? historyItems : historyItems.filter(x => x.bucket===key);

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

  const renderViewToggle = () => {
    if(!viewToggleEl) return;
    const views = [
      { key: "cards", label: "Thẻ", icon: "bi-grid-3x3-gap" },
      { key: "table", label: "Bảng", icon: "bi-table" },
    ];

    viewToggleEl.innerHTML = views.map(view => `
      <button class="history-view-btn ${view.key === currentView ? "active" : ""}" type="button" data-history-view="${view.key}" aria-pressed="${view.key === currentView}">
        <i class="bi ${view.icon}"></i>
        <span>${view.label}</span>
      </button>
    `).join("");

    viewToggleEl.querySelectorAll("[data-history-view]").forEach(btn => {
      btn.addEventListener("click", () => {
        currentView = btn.dataset.historyView;
        localStorage.setItem("historyViewMode", currentView);
        currentPage = 1;
        renderViewToggle();
        renderHistory();
      });
    });
  };

  const txnCardHtml = txn => `
    <div class="col">
      <article class="recent-history-card history-page-card h-100" role="listitem">
        <div class="history-card-row row g-2 align-items-start">
          <div class="col-auto">
            <div class="recent-history-card-icon">
              <span class="history-status-icon ${statusTone(txn.status)}"><i class="bi ${historyIcon(txn.status)}"></i></span>
            </div>
          </div>

          <div class="col min-w-0">
            <div class="recent-history-card-main">
              <div class="history-main">
                <div class="history-code">${txn.transactionCode}</div>
                <div class="small-muted">với ${txn.name}</div>
                <small>${txn.time}</small>
              </div>
            </div>
          </div>

          <div class="col-auto">
            <div class="recent-history-card-status">
              <span class="badge-soft ${statusBadgeClass(txn)}">${txn.statusLabel}</span>
            </div>
          </div>

          <div class="col-12">
            <div class="history-card-footer row g-2 align-items-end">
              <div class="col min-w-0">
                <div class="recent-history-card-amount history-amount">
                  <span class="text-dark">Gửi: ${txn.send}</span>
                  <span>Nhận: ${txn.receive}</span>
                </div>
              </div>
              <div class="col-auto">
                <a href="${getDetailLink(txn)}" class="recent-history-card-action btn btn-sm btn-outline-success" aria-label="Xem ${txn.transactionCode}">
                  <i class="bi bi-eye"></i>
                  <span>Xem</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  `;

  const txnTableRowHtml = txn => `
    <tr>
      <td class="history-icon-cell"><span class="history-status-icon ${statusTone(txn.status)}"><i class="bi ${historyIcon(txn.status)}"></i></span></td>
      <td data-label="Mã giao dịch">
        <div class="history-code">${txn.transactionCode}</div>
        <div class="small-muted">với ${txn.name}</div>
      </td>
      <td data-label="Gửi"><span class="history-table-amount send">${txn.send}</span></td>
      <td data-label="Nhận"><span class="history-table-amount receive">${txn.receive}</span></td>
      <td data-label="Trạng thái"><span class="badge-soft ${statusBadgeClass(txn)}">${txn.statusLabel}</span></td>
      <td data-label="Thời gian"><span class="small-muted">${txn.time}</span></td>
      <td data-label="Thao tác">
        <a href="${getDetailLink(txn)}" class="btn btn-sm btn-outline-success overview-small-btn" aria-label="Xem ${txn.transactionCode}">
          <i class="bi bi-eye"></i> Xem
        </a>
      </td>
    </tr>
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

    if(currentView === "table"){
      listEl.innerHTML = `
        <div class="table-responsive history-table-wrap rounded">
          <table class="table table-sm table-hover align-middle mb-0 recent-history-table history-page-table">
            <thead>
              <tr>
                <th></th>
                <th>Mã giao dịch</th>
                <th>Gửi</th>
                <th>Nhận</th>
                <th>Trạng thái</th>
                <th>Thời gian</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>${pageItems.map(txnTableRowHtml).join("")}</tbody>
          </table>
        </div>
      `;
    }else{
      listEl.innerHTML = `
        <div class="history-card-grid row row-cols-1 row-cols-lg-2 row-cols-xxl-3 g-3" role="list">
          ${pageItems.map(txnCardHtml).join("")}
        </div>
      `;
    }

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
  renderViewToggle();
  renderHistory();
});
