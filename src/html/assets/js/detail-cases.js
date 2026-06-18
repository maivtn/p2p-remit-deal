
const proofFileMock = {
  id: "proof_mock_001",
  name: "payment-proof.png",
  url: "https://placehold.co/300x400/eaf2ff/2563eb?text=Proof",
  mimeType: "image/png",
  sizeText: "1.1 MB",
};

const transactionDetailCases = {
  "case-01": {
    title:"Chờ Tran *** B chấp nhận",
    statusLabel: "Chờ chấp nhận",
    statusClass: "badge-waiting",
    caseNoteType: "warning",
    caseNote: "Sau khi bạn tìm deal và xác nhận chọn deal, giao dịch ở trạng thái chờ Tran *** B chấp nhận. Chưa upload bằng chứng ở bước này.",
    showAcceptancePanel: true,
    countdown: { type: "acceptance", seconds: 15 * 60, label: "Thời gian còn lại để Tran *** B chấp nhận hoặc huỷ" },
    parties: { me: { name: "Bạn", statusLabel: "Đã chọn deal" }, counterparty: { name: "Tran *** B", statusLabel: "Chờ chấp nhận" } },
    flows: [
      { id: "flow_a_to_b", title: "Bạn sẽ gửi USD cho người thụ hưởng của B", amount: "$500", method: "Zelle", receiverName: "Tran Van B", details: { phoneNumber: "+1 415 555 2288" }, isMyPaymentFlow: true, proofUploaded: false, locked: true },
      { id: "flow_b_to_a", title: "Tran *** B sẽ gửi VND cho người thụ hưởng của bạn", amount: "12.750.000đ", method: "MoMo", receiverName: "Nguyen Van A", details: { phoneNumber: "0901236789" }, isMyPaymentFlow: false, proofUploaded: false, locked: true },
    ],
    logs: [{ time: "13:10", message: "Bạn đã chọn deal và gửi yêu cầu chấp nhận." }, { time: "13:11", message: "Đang chờ Tran *** B chấp nhận giao dịch." }],
  },

  "case-02": {
    title: "Đã chấp nhận - upload bằng chứng",
    statusLabel: "Đang xử lý",
    statusClass: "badge-processing",
    caseNoteType: "blue",
    caseNote: "Hai bên đã chấp nhận. Trong tiến trình này, bạn sẽ chuyển tiền ngoài hệ thống và upload bằng chứng chuyển tiền.",
    countdown: { type: "processing", seconds: 60 * 60, label: "Thời gian còn lại để hai bên upload bằng chứng chuyển tiền" },
    flows: [
      { id: "flow_a_to_b", title: "Bạn gửi USD cho người thụ hưởng của B", amount: "$500", method: "Zelle", receiverName: "Tran Van B", details: { phoneNumber: "+1 415 555 2288" }, isMyPaymentFlow: true, proofUploaded: false },
      { id: "flow_b_to_a", title: "Tran *** B gửi VND cho người thụ hưởng của bạn", amount: "12.750.000đ", method: "MoMo", receiverName: "Nguyen Van A", details: { phoneNumber: "0901236789" }, isMyPaymentFlow: false, proofUploaded: false },
    ],
    logs: [{ time: "13:15", message: "Hai bên đã chấp nhận giao dịch." }, { time: "13:16", message: "Bạn cần gửi tiền và upload bằng chứng chuyển tiền." }],
  },

  "case-03": {
    title: "Tran *** B đã upload, bạn chưa upload",
    statusLabel: "Đang xử lý",
    statusClass: "badge-waiting",
    caseNoteType: "warning",
    caseNote: "Tran *** B đã upload bằng chứng. Bạn chưa upload proof, nên có cả 2 action: xác nhận đã nhận tiền và upload bằng chứng chuyển tiền.",
    flows: [
      { id: "flow_a_to_b", title: "Bạn gửi USD cho người thụ hưởng của B", amount: "$500", method: "Zelle", receiverName: "Tran Van B", details: { phoneNumber: "+1 415 555 2288" }, isMyPaymentFlow: true, proofUploaded: false },
      { id: "flow_b_to_a", title: "Tran *** B gửi VND cho người thụ hưởng của bạn", amount: "12.750.000đ", method: "MoMo", receiverName: "Nguyen Van A", details: { phoneNumber: "0901236789" }, isMyPaymentFlow: false, proofUploaded: true, counterpartyProof: true, proof: { ...proofFileMock, name: "momo-payment-proof.png", note: "Tran *** B đã chuyển MoMo cho người thụ hưởng của bạn.", uploadedAt: "13:28" } },
    ],
    logs: [{ time: "13:28", message: "Tran *** B đã upload bằng chứng gửi VND." }, { time: "13:29", message: "Bạn có thể xác nhận đã nhận tiền và upload bằng chứng khoản bạn gửi." }],
  },

  "case-04": {
    title: "Bạn đã upload, Tran *** B chưa upload",
    statusLabel: "Đang xử lý",
    statusClass: "badge-processing",
    caseNoteType: "blue",
    caseNote: "Bạn đã upload bằng chứng chuyển tiền, nhưng Tran *** B chưa upload bằng chứng. Có button khiếu nại nếu cần.",
    flows: [
      { id: "flow_a_to_b", title: "Bạn gửi USD cho người thụ hưởng của B", amount: "$500", method: "Zelle", receiverName: "Tran Van B", details: { phoneNumber: "+1 415 555 2288" }, isMyPaymentFlow: true, proofUploaded: true, allowDispute: true, proof: { ...proofFileMock, name: "zelle-payment-proof.png", note: "Bạn đã gửi đủ $500 qua Zelle.", uploadedAt: "13:24" } },
      { id: "flow_b_to_a", title: "Tran *** B gửi VND cho người thụ hưởng của bạn", amount: "12.750.000đ", method: "MoMo", receiverName: "Nguyen Van A", details: { phoneNumber: "0901236789" }, isMyPaymentFlow: false, proofUploaded: false, counterpartyProof: true },
    ],
    logs: [{ time: "13:24", message: "Bạn đã upload bằng chứng gửi USD." }, { time: "13:30", message: "Đang Đang xử lý bằng chứng gửi VND." }],
  },

  "case-05": {
    title: "Cả hai bên đã upload bằng chứng",
    statusLabel: "Đang xử lý",
    statusClass: "badge-waiting",
    caseNoteType: "warning",
    caseNote: "Cả hai bên đều đã upload proof. Có button xác nhận đã nhận đủ tiền và button khiếu nại.",
    flows: [
      { id: "flow_a_to_b", title: "Bạn gửi USD cho người thụ hưởng của B", amount: "$500", method: "Zelle", receiverName: "Tran Van B", details: { phoneNumber: "+1 415 555 2288" }, isMyPaymentFlow: true, proofUploaded: true, allowDispute: true, proof: { ...proofFileMock, name: "zelle-payment-proof.png", note: "Bạn đã gửi đủ $500 qua Zelle.", uploadedAt: "13:24" } },
      { id: "flow_b_to_a", title: "Tran *** B gửi VND cho người thụ hưởng của bạn", amount: "12.750.000đ", method: "MoMo", receiverName: "Nguyen Van A", details: { phoneNumber: "0901236789" }, isMyPaymentFlow: false, proofUploaded: true, counterpartyProof: true, proof: { ...proofFileMock, name: "momo-payment-proof.png", note: "Tran *** B đã chuyển MoMo cho người thụ hưởng của bạn.", uploadedAt: "13:28" } },
    ],
    logs: [{ time: "13:24", message: "Bạn đã upload bằng chứng gửi USD." }, { time: "13:28", message: "Tran *** B đã upload bằng chứng gửi VND." }, { time: "13:29", message: "Đang chờ bạn xác nhận đã nhận đủ tiền." }],
  },

  "case-06": {
    title: "Case 06: Hoàn tất",
    statusLabel: "Hoàn tất",
    statusClass: "badge-success",
    caseNoteType: "success",
    caseNote: "Giao dịch đã hoàn tất. Hiển thị button đánh giá.",
    showRating: true,
    flows: [
      { id: "flow_a_to_b", title: "Bạn gửi USD cho người thụ hưởng của B", amount: "$500", method: "Zelle", receiverName: "Tran Van B", details: { phoneNumber: "+1 415 555 2288" }, isMyPaymentFlow: true, proofUploaded: true, confirmed: true, proof: { ...proofFileMock, name: "zelle-payment-proof.png", note: "Bạn đã gửi đủ $500 qua Zelle.", uploadedAt: "13:24" } },
      { id: "flow_b_to_a", title: "Tran *** B gửi VND cho người thụ hưởng của bạn", amount: "12.750.000đ", method: "MoMo", receiverName: "Nguyen Van A", details: { phoneNumber: "0901236789" }, isMyPaymentFlow: false, proofUploaded: true, counterpartyProof: true, confirmed: true, proof: { ...proofFileMock, name: "momo-payment-proof.png", note: "Tran *** B đã chuyển MoMo cho người thụ hưởng của bạn.", uploadedAt: "13:28" } },
    ],
    logs: [{ time: "13:42", message: "Hai bên đã xác nhận nhận đủ tiền. Giao dịch hoàn tất." }],
  },

  "case-07": {
    title: "Bên bạn khiếu nại",
    statusLabel: "Khiếu nại",
    statusClass: "badge-danger-soft",
    caseNoteType: "danger",
    caseNote: "Đây là case bên bạn mở khiếu nại. Có button rút khiếu nại.",
    disputed: true,
    disputeOwner: "me",
    dispute: { reason: "Tôi chưa nhận đủ tiền.", description: "Tran *** B đã upload bằng chứng nhưng người thụ hưởng của tôi chưa nhận được hoặc thông tin không khớp.", statusLabel: "Đang chờ admin xử lý" },
    flows: [
      { id: "flow_a_to_b", title: "Bạn gửi USD cho người thụ hưởng của B", amount: "$500", method: "Zelle", receiverName: "Tran Van B", details: { phoneNumber: "+1 415 555 2288" }, isMyPaymentFlow: true, proofUploaded: true, proof: { ...proofFileMock, name: "zelle-payment-proof.png", note: "Bạn đã gửi đủ $500 qua Zelle.", uploadedAt: "13:24" } },
      { id: "flow_b_to_a", title: "Tran *** B gửi VND cho người thụ hưởng của bạn", amount: "12.750.000đ", method: "MoMo", receiverName: "Nguyen Van A", details: { phoneNumber: "0901236789" }, isMyPaymentFlow: false, proofUploaded: true, counterpartyProof: true, proof: { ...proofFileMock, name: "momo-payment-proof.png", note: "Tran *** B đã upload proof nhưng bạn báo chưa nhận đủ tiền.", uploadedAt: "13:28" } },
    ],
    logs: [{ time: "13:45", message: "Bạn đã mở khiếu nại: chưa nhận đủ tiền." }],
  },

  "case-08": {
    title: "Tran *** B chờ bên bạn chấp nhận",
    statusLabel: "Chờ chấp nhận",
    statusClass: "badge-waiting",
    caseNoteType: "warning",
    caseNote: "Đây là case khi Tran *** B chọn deal của bạn và đang chờ bên bạn chấp nhận. Có action Từ chối / Chấp nhận, click Chấp nhận hiện modal confirm.",
    showMyAcceptanceActions: true,
    flows: [
      { id: "flow_b_to_a", title: "Tran *** B sẽ gửi USD cho người thụ hưởng của bạn", amount: "$500", method: "Zelle", receiverName: "Nguyen Van A", details: { phoneNumber: "+1 408 555 0199" }, isMyPaymentFlow: false, proofUploaded: false, locked: true },
      { id: "flow_a_to_b", title: "Bạn sẽ gửi VND cho người thụ hưởng của Tran *** B", amount: "12.750.000đ", method: "MoMo", receiverName: "Tran Van B", details: { phoneNumber: "0987654321" }, isMyPaymentFlow: true, proofUploaded: false, locked: true },
    ],
    logs: [{ time: "13:05", message: "Tran *** B đã chọn deal của bạn." }, { time: "13:06", message: "Đang chờ bạn từ chối hoặc chấp nhận giao dịch." }],
  },

  "case-09": {
    title: "Tran *** B khiếu nại",
    statusLabel: "Khiếu nại",
    statusClass: "badge-danger-soft",
    caseNoteType: "danger",
    caseNote: "Đây là case Tran *** B mở khiếu nại. Bên bạn có button giải thích về khiếu nại, click sẽ hiện modal giải thích gồm upload hình/video/audio tối đa 6 cái và ghi chú.",
    disputed: true,
    disputeOwner: "counterparty",
    dispute: { reason: "Tran *** B báo chưa nhận tiền.", description: "Tran *** B cho rằng chưa nhận đủ tiền hoặc proof không khớp. Bạn cần giải thích và upload bằng chứng bổ sung nếu có.", statusLabel: "Chờ bạn giải thích" },
    flows: [
      { id: "flow_a_to_b", title: "Bạn gửi USD cho người thụ hưởng của B", amount: "$500", method: "Zelle", receiverName: "Tran Van B", details: { phoneNumber: "+1 415 555 2288" }, isMyPaymentFlow: true, proofUploaded: true, proof: { ...proofFileMock, name: "zelle-payment-proof.png", note: "Bạn đã gửi đủ $500 qua Zelle.", uploadedAt: "13:24" } },
      { id: "flow_b_to_a", title: "Tran *** B gửi VND cho người thụ hưởng của bạn", amount: "12.750.000đ", method: "MoMo", receiverName: "Nguyen Van A", details: { phoneNumber: "0901236789" }, isMyPaymentFlow: false, proofUploaded: true, counterpartyProof: true, proof: { ...proofFileMock, name: "momo-payment-proof.png", note: "Tran *** B đã upload proof và sau đó mở khiếu nại.", uploadedAt: "13:28" } },
    ],
    logs: [{ time: "13:45", message: "Tran *** B đã mở khiếu nại." }, { time: "13:46", message: "Đang chờ bạn giải thích về khiếu nại." }],
  },
};

const caseLinks = [
  { id: "case-01", label: "Case 01 · Chờ Tran *** B", href: "transaction-detail-case-01-waiting-counterparty-acceptance.html" },
  { id: "case-02", label: "Case 02 · Upload proof", href: "transaction-detail-case-02-accepted-upload-proof.html" },
  { id: "case-03", label: "Case 03 · Tran *** B proof", href: "transaction-detail-case-03-counterparty-proof.html" },
  { id: "case-04", label: "Case 04 · Bạn proof", href: "transaction-detail-case-04-my-proof-waiting-counterparty.html" },
  { id: "case-05", label: "Case 05 · 2 bên proof", href: "transaction-detail-case-05-both-proof-confirm.html" },
  { id: "case-06", label: "Case 06 · Hoàn tất", href: "transaction-detail-case-06-completed-rating.html" },
  { id: "case-07", label: "Case 07 · Bạn khiếu nại", href: "transaction-detail-case-07-my-dispute.html" },
  { id: "case-08", label: "Case 08 · Chờ bạn chấp nhận", href: "transaction-detail-case-08-waiting-my-acceptance.html" },
  { id: "case-09", label: "Case 09 · Tran *** B khiếu nại", href: "transaction-detail-case-09-counterparty-dispute.html" },
];


function renderFeeHoldPanel(mode = "accepted"){
  const amount = 500;
  const fee = amount * 0.005;
  const hold = amount;
  const feeText = `$${fee.toFixed(2)} USDV`;
  const holdText = `$${hold.toLocaleString("en-US")} USDV`;

  if(mode === "beforeAccept"){
    return `
      <section class="form-card fee-hold-panel warning">
        <h2 class="section-title mt-0"><i class="bi bi-info-circle"></i> Phí & hold khi giao dịch được chấp nhận</h2>
        <div class="summary-line"><span>Phí accept giao dịch / mỗi bên</span><strong>0.5% / mỗi bên</strong></div>
        <div class="summary-line"><span>Số phí dự kiến</span><strong>${feeText}</strong></div>
        <div class="summary-line"><span>Ví bị trừ phí</span><strong>USDV Wallet trong VLINKPAY</strong></div>
        <div class="summary-line"><span>Hold sau khi accept</span><strong>${holdText} / mỗi bên</strong></div>
        <div class="small-muted mt-2">Phí accept sẽ bị trừ từ ví USDV của cả hai bên và không hoàn lại. Khi accept, ví USDV của cả hai bên sẽ bị hold số tiền bằng số tiền giao dịch, và được release ngay khi hoàn tất giao dịch.</div>
      </section>
    `;
  }

  return `
    <section class="form-card fee-hold-panel">
      <h2 class="section-title mt-0"><i class="bi bi-shield-lock"></i> Phí & hold USDV</h2>
      <div class="summary-line"><span>Phí đã trừ / mỗi bên</span><strong>${feeText} / mỗi bên</strong></div>
      <div class="summary-line"><span>Ví trừ phí</span><strong>USDV Wallet trong VLINKPAY</strong></div>
      <div class="summary-line"><span>USDV đang hold</span><strong>${holdText} / mỗi bên</strong></div>
      <div class="small-muted mt-2">Phí 0.5% của mỗi bên không hoàn lại sau khi giao dịch được accept. Hold USDV được dùng để bảo vệ giao dịch trong quá trình xử lý.</div>
    </section>
  `;
}


document.addEventListener("DOMContentLoaded", () => {
  const caseId = document.body.dataset.detailCase || "case-01";
  const data = transactionDetailCases[caseId] || transactionDetailCases["case-01"];

  renderCaseSwitcher(caseId);
  renderDetailSummary(data);
  renderCountdown(data);
  renderMyAcceptancePanel(data);
  renderAcceptancePanel(data);
  renderPaymentFlows(data);
  
  applyV45CancelFeeHoldRules(caseId);
  applyV47Case79Buttons(caseId);
renderRatingSection(data);
  renderDisputeSection(data);
  renderTimeline(data);
  bindConfirmPaidModal();
  bindConfirmReceivedActions();
  bindComplaintActions();
  bindRatingActions();
  bindMyAcceptanceActions();
  bindDisputeModals();
});

 const cardHistory = document.getElementById("cardHistory");
 if(cardHistory){
  cardHistory.style.display="none"
 }


function renderCaseSwitcher(activeCase){
  const el = document.getElementById("caseSwitcher");
  if(!el) return;
  el.innerHTML = caseLinks.map(item => `<a href="${item.href}" class="${item.id === activeCase ? "active" : ""}">${item.label}</a>`).join("");
}

function renderDetailSummary(data){
  const title = document.getElementById("detailCaseTitle");
  const desc = document.getElementById("detailCaseDescription");
  const badge = document.getElementById("detailStatusBadge");
  const note = document.getElementById("caseSummaryNote");

  if(title) title.textContent = data.title;
  if(desc) {
    desc.textContent = data.description || "Theo dõi và xử lý giao dịch";
    desc.style.display="none"
  }

  if(badge){
    badge.className = `badge-soft ${data.statusClass}`;
    badge.textContent = data.statusLabel;
  }
  if(note){
    note.className = `case-summary-note ${data.caseNoteType || ""}`;
    note.textContent = data.caseNote || "";
    note.style.display="none"
  }
}


function renderCountdown(data){
  const el = document.getElementById("countdownPanel");
  if(!el) return;
  if(!data.countdown){
    el.innerHTML = "";
    return;
  }

  const panelClass = data.countdown.type === "acceptance" ? "warning" : "";
  el.innerHTML = `
    <div class="countdown-card ${panelClass}">
      <div class="countdown-label">${data.countdown.label}</div>
      <div class="countdown-timer" data-countdown-seconds="${data.countdown.seconds}">--:--</div>
      <div class="small mt-2">
        ${data.countdown.type === "acceptance"
          ? "Hết 15 phút giao dịch sẽ tự chuyển sang trạng thái hết hạn."
          : "Hết 1 giờ nếu chưa đủ bằng chứng, giao dịch có thể chuyển sang cần xử lý/khiếu nại."}
      </div>
    </div>
  `;

  startCountdown(el.querySelector("[data-countdown-seconds]"));
}

function startCountdown(timerEl){
  if(!timerEl) return;
  let remaining = Number(timerEl.dataset.countdownSeconds || 0);

  const format = (value) => {
    const h = Math.floor(value / 3600);
    const m = Math.floor((value % 3600) / 60);
    const s = value % 60;
    if(h > 0) return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
    return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  };

  const tick = () => {
    timerEl.textContent = format(Math.max(remaining, 0));
    if(remaining <= 0){
      timerEl.closest(".countdown-card")?.classList.add("danger");
      return;
    }
    remaining -= 1;
    window.setTimeout(tick, 1000);
  };

  tick();
}

function renderMyAcceptancePanel(data){
  const el = document.getElementById("myAcceptancePanel");
  if(!el) return;
  if(!data.showMyAcceptanceActions){ el.innerHTML = ""; return; }

  el.innerHTML = `
    <section class="form-card">
      <div class="accept-request-card">
        <div class="incoming-deal-head">
          <div>
            <div class="fw-bold">Yêu cầu chấp nhận deal</div>
            <div class="small mt-1">Tran *** B đã chọn deal của bạn. Vui lòng kiểm tra thông tin deal trước khi từ chối hoặc chấp nhận.</div>
          </div>
          <span class="badge-soft badge-waiting">Chờ bạn phản hồi</span>
        </div>

        <div class="incoming-deal-summary mt-3">
          <div class="incoming-deal-title">
            <span class="masked-party"><span class="avatar">B</span> Tran *** B</span>
            <span class="small-muted">Deal của bên B</span>
          </div>

          <div class="incoming-deal-grid">
            <div class="incoming-deal-item">
              <span>Cặp tiền tệ</span>
              <strong>VND → USD</strong>
            </div>
            <div class="incoming-deal-item">
              <span>Tỷ giá</span>
              <strong>1 USD = 25.500đ</strong>
            </div>
            <div class="incoming-deal-item">
              <span>B gửi</span>
              <strong>12.750.000đ VND</strong>
            </div>
            <div class="incoming-deal-item">
              <span>B muốn nhận</span>
              <strong>$500 USD</strong>
            </div>
          </div>

          <div class="incoming-method-split">
            <div class="incoming-method-row">
              <div class="incoming-method-label">Gửi qua:</div>
              <div class="incoming-method-tags">${methodTag("MoMo", "green")}</div>
            </div>
            <div class="incoming-method-row">
              <div class="incoming-method-label">Nhận qua:</div>
              <div class="incoming-method-tags">${methodTag("Zelle")}</div>
            </div>
          </div>
        </div>

        <div class="case-summary-note mt-3">
          Nếu chấp nhận, bạn sẽ gửi <strong>$500 USD</strong> qua <strong>Zelle</strong> cho người thụ hưởng của Tran *** B và người thụ hưởng của bạn sẽ nhận <strong>12.750.000đ VND</strong> qua <strong>MoMo</strong> từ Tran *** B.
        </div>

        <div class="action-row">
          <button class="btn btn-outline-danger" data-decline-incoming-deal><i class="bi bi-x-circle"></i> Từ chối</button>
          <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#acceptIncomingDealModal"><i class="bi bi-check-circle"></i> Chấp nhận</button>
        </div>
      </div>
    </section>
  `;
}

function renderAcceptancePanel(data){
  const el = document.getElementById("acceptancePanel");
  if(!el) return;
  if(!data.showAcceptancePanel){ el.innerHTML = ""; return; }
  el.innerHTML = `
    <section class="form-card p-0">
      <div class="acceptance-panel">
        <div class="fw-bold">Trạng thái chấp nhận giao dịch</div>
        <div class="small mt-1">Giao dịch chỉ bắt đầu sau khi Tran *** B chấp nhận.</div>
        <div class="acceptance-users">
          <div class="acceptance-user"><div class="fw-bold">${data.parties.me.name}</div><div class="badge-soft badge-success">${data.parties.me.statusLabel}</div></div>
          <div class="acceptance-user waiting"><div class="fw-bold">${data.parties.counterparty.name}</div><div class="badge-soft badge-waiting">${data.parties.counterparty.statusLabel}</div></div>
        </div>
      </div>
    </section>
  `;
}


function maskedCounterpartyName(){
  return "Tran *** B";
}

function shouldHideCounterpartyAccount(flow){
  return !!flow.locked;
}

function renderReceiverInfo(flow){
  if(shouldHideCounterpartyAccount(flow)){
    return `
      <div class="summary-line"><span>Người nhận</span><strong>${flow.isMyPaymentFlow ? maskedCounterpartyName() : "Bạn"}</strong></div>
      <div class="hidden-until-accept mt-2">
        <i class="bi bi-lock"></i>
        Thông tin tài khoản nhận sẽ chỉ hiển thị sau khi giao dịch được chấp nhận.
      </div>
    `;
  }

  return `
    <div class="summary-line"><span>Người nhận</span><strong>${flow.receiverName}</strong></div>
    <div class="summary-line"><span>Thông tin</span><strong>${flow.details.phoneNumber}</strong></div>
  `;
}


function applyV45CancelFeeHoldRules(caseKey){
  const actionPanel = document.getElementById("actionPanel");
  const paymentFlowPanel = document.getElementById("paymentFlowPanel");

  if(caseKey === "case-01"){
    if(paymentFlowPanel && !document.getElementById("feeHoldBeforeAcceptPanel")){
      paymentFlowPanel.insertAdjacentHTML("beforebegin", `<div id="feeHoldBeforeAcceptPanel">${renderFeeHoldPanel("beforeAccept")}</div>`);
    }

    if(!document.getElementById("cancelWaitingAcceptanceBtn")){
      const cancelBtnHtml = `
        <section class="form-card case-cancel-card" id="cancelCase1ActionCard">
          <div class="case-summary-note success">
            Tran *** B chưa accept nên bạn có thể huỷ giao dịch ở bước này và <strong>không mất phí</strong>.
          </div>
          <button class="btn btn-outline-danger mt-3" id="cancelWaitingAcceptanceBtn" data-bs-toggle="modal" data-bs-target="#cancelWaitingAcceptanceModal">
            <i class="bi bi-x-circle"></i> Huỷ giao dịch
          </button>
        </section>
      `;

      if(actionPanel){
        actionPanel.insertAdjacentHTML("afterbegin", cancelBtnHtml);
      } else if(paymentFlowPanel){
        paymentFlowPanel.insertAdjacentHTML("beforebegin", cancelBtnHtml);
      } else {
        const acceptancePanel = document.getElementById("acceptancePanel");
        acceptancePanel?.insertAdjacentHTML("afterend", cancelBtnHtml);
      }
    }

    if(!document.getElementById("cancelWaitingAcceptanceModal")){
      document.body.insertAdjacentHTML("beforeend", `
        <div class="modal fade" id="cancelWaitingAcceptanceModal" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered mx-auto" style="max-width:460px">
            <div class="modal-content accept-modal-card">
              <div class="modal-header">
                <div>
                  <h5 class="modal-title fw-black">Huỷ giao dịch?</h5>
                  <div class="small-muted">Tran *** B chưa accept giao dịch.</div>
                </div>
                <button class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <div class="alert alert-success small mb-3">
                  Bạn có quyền huỷ giao dịch ở bước này và <strong>không mất phí</strong> vì Tran *** B chưa chấp nhận.
                </div>
                <div class="summary-line"><span>Trạng thái hiện tại</span><strong>Chờ Tran *** B chấp nhận</strong></div>
                <div class="summary-line"><span>Phí huỷ</span><strong>$0.00</strong></div>
                <div class="summary-line"><span>USDV bị hold</span><strong>Chưa hold</strong></div>
              </div>
              <div class="modal-footer">
                <button class="btn btn-light flex-fill" data-bs-dismiss="modal">Tiếp tục chờ</button>
                <a class="btn btn-danger flex-fill" href="history.html">Xác nhận huỷ</a>
              </div>
            </div>
          </div>
        </div>
      `);
    }
  }

  const acceptedCases = [
    "case-02",
    "case-03",
    "case-04",
    "case-05",
    "case-06",
    "case-07",
    "case-09"
  ];

  if(acceptedCases.includes(caseKey)){
    if(paymentFlowPanel && !document.getElementById("feeHoldAcceptedPanel")){
      paymentFlowPanel.insertAdjacentHTML("beforebegin", `<div id="feeHoldAcceptedPanel">${renderFeeHoldPanel("accepted")}</div>`);
    }
  }
}



function applyV47Case79Buttons(caseId){
  const actionPanel = document.getElementById("actionPanel");
  if(!actionPanel) return;

  if(caseId === "case-07" && !document.getElementById("case7ActionButtonsDynamic")){
    actionPanel.insertAdjacentHTML("beforeend", `
      <section class="form-card dispute-action-card" id="case7ActionButtonsDynamic">
        <h2 class="section-title mt-0"><i class="bi bi-life-preserver"></i> Thao tác khiếu nại</h2>
        <div class="case-action-grid mt-3">
          <button class="btn btn-outline-warning btn-lg w-100" data-bs-toggle="modal" data-bs-target="#withdrawDisputeModal" type="button">
            <i class="bi bi-arrow-counterclockwise"></i> Rút khiếu nại
          </button>
          <a class="btn btn-outline-primary btn-lg w-100" href="mailto:support@vlinkpay.com">
            <i class="bi bi-headset"></i> Liên hệ hỗ trợ
          </a>
        </div>
      </section>
    `);
  }

  if(caseId === "case-09" && !document.getElementById("case9ActionButtonsDynamic")){
    actionPanel.insertAdjacentHTML("beforeend", `
      <section class="form-card dispute-action-card" id="case9ActionButtonsDynamic">
        <h2 class="section-title mt-0"><i class="bi bi-chat-left-text"></i> Phản hồi khiếu nại</h2>
        <div class="case-action-grid mt-3">
          <button class="btn btn-outline-warning btn-lg w-100" data-bs-toggle="modal" data-bs-target="#explainDisputeModal" type="button">
            <i class="bi bi-pencil-square"></i> Giải thích về khiếu nại
          </button>
          <a class="btn btn-outline-primary btn-lg w-100" href="mailto:support@vlinkpay.com">
            <i class="bi bi-headset"></i> Liên hệ hỗ trợ
          </a>
        </div>
      </section>
    `);
  }
}


function renderPaymentFlows(data){
  const flows = document.getElementById("paymentFlows");
  if(!flows) return;
  flows.innerHTML = data.flows.map(flow => `
    <div class="form-card ${flow.locked ? "flow-disabled" : ""}">
      <div class="name-line">
        <h3 class="card-name">${flow.title}</h3>
        ${renderFlowBadge(flow)}
      </div>
      <div class="summary-line"><span>Số tiền</span><strong>${flow.amount}</strong></div>
      <div class="summary-line"><span>Phương thức</span><strong>${flow.method}</strong></div>
      ${renderReceiverInfo(flow)}
      ${renderFlowProofAndActions(flow, data)}
    </div>
  `).join("");
}

function renderFlowBadge(flow){
  if(flow.locked) return `<span class="badge-soft badge-waiting">Chưa bắt đầu</span>`;
  if(flow.confirmed) return `<span class="badge-soft badge-success">Đã xác nhận</span>`;
  if(flow.proofUploaded) return `<span class="badge-soft badge-waiting">Đã upload bằng chứng</span>`;
  return `<span class="badge-soft badge-processing">Chờ gửi tiền</span>`;
}

function renderFlowProofAndActions(flow, transaction){
  if(flow.locked){
    return `<div class="case-summary-note warning mt-3">Chưa thể gửi tiền hoặc upload bằng chứng cho tới khi hai bên cùng chấp nhận giao dịch.</div>`;
  }

  if(flow.isMyPaymentFlow){
    if(flow.proofUploaded){
      return `
        ${renderProofView(flow.proof, "Bằng chứng bạn đã upload")}
        ${flow.confirmed ? `<div class="case-summary-note success mt-3">Tran *** B đã xác nhận nhận tiền.</div>` : flow.allowDispute ? renderComplaintButton() : ""}
      `;
    }
    return `
      <div class="flow-action-title">Hành động của bạn</div>
      <div class="action-row">
        <button class="btn btn-outline-primary" data-confirm-paid data-flow-id="${flow.id}" data-flow-title="${flow.title}" data-flow-amount="${flow.amount}" data-flow-method="${flow.method}">
          <i class="bi bi-upload"></i> Upload bằng chứng chuyển tiền
        </button>
      </div>
    `;
  }

  if(flow.proofUploaded){
    return `
      ${renderProofView(flow.proof, "Bằng chứng Tran *** B đã upload")}
      ${flow.confirmed ? `<div class="case-summary-note success mt-3">Bạn đã xác nhận nhận tiền từ Tran *** B.</div>` : `
        <div class="flow-action-title">Đây là bằng chứng do Tran *** B upload. Bạn hãy xem và xác nhận sau khi kiểm tra tiền đã vào tài khoản. </div>
        <div class="action-row">
          <button class="btn btn-primary" data-confirm-received data-flow-id="${flow.id}" data-amount="${flow.amount}" data-method="${flow.method}">✅ Xác nhận đã nhận tiền</button>
        </div>
      `}
    `;
  }

  return `<div class="proof-empty-card mt-3"><div class="fw-bold">Chưa có bằng chứng từ Tran *** B</div><div class="small-muted">Khi Tran *** B gửi tiền và upload bằng chứng, bạn sẽ xem được tại đây.</div></div>`;
}

function renderComplaintButton(){
  return `
    <div class="flow-action-title">Nếu có vấn đề với giao dịch</div>
    <div class="action-row">
      <button class="btn btn-outline-danger" data-bs-toggle="modal" data-bs-target="#createDisputeModal"><i class="bi bi-exclamation-triangle"></i> Khiếu nại</button>
    </div>
  `;
}

function renderProofView(proof, title){
  const preview = `<img class="proof-view-thumb" src="${proof?.url || "https://placehold.co/300x400/eaf2ff/2563eb?text=Proof"}" alt="${proof?.name || "proof"}">`;
  return `
    <div class="proof-view-card mt-3">
    <div class="fw-bold mb-2">${title}</div>
     <div class="d-flex align-items-start gap-3">
      <div class="d-flex align-items-start flex-column">
        ${preview}
        <div class="flex-grow-1">
          <a class="btn btn-sm btn-outline-primary mt-2" href="${proof?.url || "#"}" target="_blank"><i class="bi bi-eye"></i> View</a>
        </div>
      </div>
      <div class="d-flex align-items-start flex-column">
        ${preview}
        <div class="flex-grow-1">
          <a class="btn btn-sm btn-outline-primary mt-2" href="${proof?.url || "#"}" target="_blank"><i class="bi bi-eye"></i> View</a>
        </div>
      </div>
     </div>
    </div>
  `;
}

function renderRatingSection(data){
  const el = document.getElementById("ratingSection");
  if(!el) return;
  if(!data.showRating){ el.innerHTML = ""; return; }
  el.innerHTML = `
    <section class="form-card p-0">
      <div class="rating-card">
        <div class="fw-bold">Đánh giá giao dịch</div>
        <div class="small-muted mt-1">Giao dịch đã hoàn tất. Hãy đánh giá trải nghiệm với đối tác.</div>
        <div class="rating-stars interactive" id="interactiveStars">
          <i class="bi bi-star-fill" data-star="1"></i>
          <i class="bi bi-star-fill" data-star="2"></i>
          <i class="bi bi-star-fill" data-star="3"></i>
          <i class="bi bi-star-fill" data-star="4"></i>
          <i class="bi bi-star" data-star="5"></i>
        </div>
        <div class="mb-3">
          <div class="small text-muted mb-2">Gợi ý nhận xét:</div>
          <div class="d-flex flex-wrap gap-2">
            <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill rating-chip" data-suggestion="Giao dịch nhanh chóng">Nhanh chóng</button>
            <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill rating-chip" data-suggestion="Đúng hẹn cam kết">Đúng hẹn</button>
            <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill rating-chip" data-suggestion="Uy tín, đáng tin cậy">Uy tín</button>
            <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill rating-chip" data-suggestion="Giao tiếp tốt, phản hồi nhanh">Giao tiếp tốt</button>
            <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill rating-chip" data-suggestion="Tỷ giá hợp lý">Tỷ giá tốt</button>
            <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill rating-chip" data-suggestion="Rất chuyên nghiệp">Chuyên nghiệp</button>
          </div>
        </div>
        <textarea class="form-control mb-3" rows="3" id="ratingTextarea" placeholder="Nhập nhận xét hoặc chọn gợi ý bên trên..."></textarea>
        <button class="btn btn-primary fw-bold" data-submit-rating><i class="bi bi-star-fill"></i> Gửi đánh giá</button>
      </div>
    </section>
  `;
}

function renderDisputeSection(data){
  const el = document.getElementById("disputeSection");
  if(!el) return;
  if(!data.disputed){ el.innerHTML = ""; return; }

  const isMyDispute = data.disputeOwner === "me";
  const isCounterpartyDispute = data.disputeOwner === "counterparty";

  el.innerHTML = `
    <section class="form-card">
      <div class="dispute-card">
        <div class="d-flex justify-content-between align-items-start gap-3">
          <div>
            <div class="fw-bold text-danger">${isMyDispute ? "Khiếu nại của bạn đang mở" : "Tran *** B đang khiếu nại"}</div>
            <div class="small-muted mt-1">${data.dispute.statusLabel}</div>
          </div>
          <span class="badge-soft badge-danger-soft">Khiếu nại</span>
        </div>
        <div class="dispute-reason mt-3">
          <div class="small-muted">Lý do</div>
          <div class="fw-bold">${data.dispute.reason}</div>
        </div>
        <div class="action-row">
          ${isMyDispute ? `<button class="btn btn-outline-danger" data-withdraw-complaint><i class="bi bi-x-circle"></i> Rút khiếu nại</button>` : ""}
          ${isCounterpartyDispute ? `<button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#explainDisputeModal"><i class="bi bi-chat-square-text"></i> Giải thích về khiếu nại</button>` : ""}
          <button class="btn btn-outline-primary"><i class="bi bi-chat-dots"></i> Liên hệ hỗ trợ</button>
        </div>
      </div>
    </section>
  `;
}

function renderTimeline(data){
  const timeline = document.getElementById("activityTimeline");
  if(!timeline) return;
  timeline.innerHTML = data.logs.map(log => `<div class="timeline-item"><div class="fw-bold">${log.time}</div><div class="small-muted">${log.message}</div></div>`).join("");
}

function bindConfirmPaidModal(){
  const modalEl = document.getElementById("confirmPaidModal");
  if(!modalEl) return;
  const subtitle = document.getElementById("confirmPaidSubtitle");
  const submitBtn = document.getElementById("confirmPaidSubmitBtn");
  const uploadRoot = document.getElementById("confirmPaidUpload");
  const noteInput = document.getElementById("confirmPaidNote");

  document.querySelectorAll("[data-confirm-paid]").forEach(btn => {
    if(btn.dataset.bound === "true") return;
    btn.dataset.bound = "true";
    btn.addEventListener("click", () => {
      subtitle.textContent = `Tải lên một hoặc nhiều bằng chứng bạn đã gửi ${btn.dataset.flowAmount || ""} qua ${btn.dataset.flowMethod || ""}. Hỗ trợ image, video, audio.`;
      if(noteInput) noteInput.value = "";
      if(submitBtn) submitBtn.disabled = true;
      initUploadControls();
      bootstrap.Modal.getOrCreateInstance(modalEl).show();
    });
  });

  if(uploadRoot && uploadRoot.dataset.confirmBound !== "true"){
    uploadRoot.dataset.confirmBound = "true";
    uploadRoot.addEventListener("upload-control:change", (event) => {
      const files = event.detail?.files || [];
      if(submitBtn) submitBtn.disabled = files.length === 0;
    });
  }

  if(submitBtn && submitBtn.dataset.bound !== "true"){
    submitBtn.dataset.bound = "true";
    submitBtn.addEventListener("click", () => {
      submitBtn.innerHTML = "✅ Đã xác nhận mock";
      setTimeout(() => {
        submitBtn.innerHTML = "✅ Xác nhận gửi";
        bootstrap.Modal.getOrCreateInstance(modalEl).hide();
      }, 700);
    });
  }
}

function bindConfirmReceivedActions(){
  document.querySelectorAll("[data-confirm-received]").forEach(btn => {
    if(btn.dataset.bound === "true") return;
    btn.dataset.bound = "true";
    btn.addEventListener("click", () => {
      const amount = btn.dataset.amount || "số tiền";
      const method = btn.dataset.method || "phương thức";
      showConfirmReceived(amount, method).then(confirmed => {
        if(!confirmed) return;
        btn.classList.remove("btn-success");
        btn.classList.add("btn-outline-success");
        btn.innerHTML = "✅ Đã xác nhận nhận tiền";
        btn.disabled = true;
      });
    });
  });
}

function bindComplaintActions(){
  document.querySelectorAll("[data-withdraw-complaint]").forEach(btn => {
    if(btn.dataset.bound === "true") return;
    btn.dataset.bound = "true";
    btn.addEventListener("click", () => {
      btn.innerHTML = '<i class="bi bi-check2-circle"></i> Đã rút khiếu nại mock';
      btn.disabled = true;
    });
  });
}

function bindRatingActions(){
  const starsContainer = document.getElementById("interactiveStars");
  if(starsContainer && !starsContainer.dataset.bound){
    starsContainer.dataset.bound = "true";
    const stars = starsContainer.querySelectorAll("[data-star]");
    let selectedRating = 4;

    function paintStars(n){
      stars.forEach(s => {
        const v = parseInt(s.dataset.star);
        s.className = v <= n ? "bi bi-star-fill" : "bi bi-star";
      });
    }

    stars.forEach(s => {
      s.style.cursor = "pointer";
      s.addEventListener("mouseenter", () => paintStars(parseInt(s.dataset.star)));
      s.addEventListener("click", () => { selectedRating = parseInt(s.dataset.star); paintStars(selectedRating); });
    });
    starsContainer.addEventListener("mouseleave", () => paintStars(selectedRating));
  }

  document.querySelectorAll(".rating-chip").forEach(chip => {
    if(chip.dataset.bound === "true") return;
    chip.dataset.bound = "true";
    chip.addEventListener("click", () => {
      const isActive = chip.classList.toggle("active");
      chip.classList.toggle("btn-warning", isActive);
      chip.classList.toggle("btn-outline-warning", !isActive);
      const textarea = document.getElementById("ratingTextarea");
      const active = document.querySelectorAll(".rating-chip.active");
      textarea.value = Array.from(active).map(c => c.dataset.suggestion).join(", ");
    });
  });

  document.querySelectorAll("[data-submit-rating]").forEach(btn => {
    if(btn.dataset.bound === "true") return;
    btn.dataset.bound = "true";
    btn.addEventListener("click", () => {
      btn.innerHTML = '<i class="bi bi-check2-circle"></i> Đã gửi đánh giá mock';
      btn.disabled = true;
    });
  });
}

function bindMyAcceptanceActions(){
  document.querySelectorAll("[data-decline-incoming-deal]").forEach(btn => {
    if(btn.dataset.bound === "true") return;
    btn.dataset.bound = "true";
    btn.addEventListener("click", () => {
      btn.innerHTML = '<i class="bi bi-x-circle"></i> Đã từ chối mock';
      btn.disabled = true;
    });
  });
}

function bindDisputeModals(){
  initUploadControls();

  const createUpload = document.getElementById("createDisputeUpload");
  const explainUpload = document.getElementById("explainDisputeUpload");
  const createSubmit = document.getElementById("createDisputeSubmitBtn");
  const explainSubmit = document.getElementById("explainDisputeSubmitBtn");

  if(createUpload && createUpload.dataset.bound !== "true"){
    createUpload.dataset.bound = "true";
    createUpload.addEventListener("upload-control:change", (event) => {
      const files = event.detail?.files || [];
      if(createSubmit) createSubmit.disabled = files.length === 0;
    });
  }

  if(explainUpload && explainUpload.dataset.bound !== "true"){
    explainUpload.dataset.bound = "true";
    explainUpload.addEventListener("upload-control:change", (event) => {
      const files = event.detail?.files || [];
      if(explainSubmit) explainSubmit.disabled = files.length === 0;
    });
  }

  if(createSubmit && createSubmit.dataset.bound !== "true"){
    createSubmit.dataset.bound = "true";
    createSubmit.addEventListener("click", () => {
      createSubmit.innerHTML = '<i class="bi bi-check2-circle"></i> Đã gửi khiếu nại mock';
      setTimeout(() => bootstrap.Modal.getOrCreateInstance(document.getElementById("createDisputeModal")).hide(), 700);
    });
  }

  if(explainSubmit && explainSubmit.dataset.bound !== "true"){
    explainSubmit.dataset.bound = "true";
    explainSubmit.addEventListener("click", () => {
      explainSubmit.innerHTML = '<i class="bi bi-check2-circle"></i> Đã gửi giải thích mock';
      setTimeout(() => bootstrap.Modal.getOrCreateInstance(document.getElementById("explainDisputeModal")).hide(), 700);
    });
  }
}
