
document.addEventListener("DOMContentLoaded", () => {
  const flows = document.getElementById("paymentFlows");
  if(flows){
    flows.innerHTML = transactionDetail.flows.map(flow => `
      <div class="form-card">
        <div class="name-line">
          <h3 class="card-name">${flow.title}</h3>
          <span class="badge-soft badge-processing">Chờ gửi tiền</span>
        </div>
        <div class="summary-line"><span>Số tiền</span><strong>${flow.amount}</strong></div>
        <div class="summary-line"><span>Phương thức</span><strong>${flow.method}</strong></div>
        <div class="summary-line"><span>Người nhận</span><strong>${flow.receiverName}</strong></div>
        <div class="summary-line"><span>Thông tin</span><strong>${flow.details.phoneNumber}</strong></div>
        <div class="mt-3" data-upload-control data-upload-id="proof_${flow.id}" data-max-files="5" data-max-size-mb="5" data-camera-label="Chụp ảnh" data-file-label="Chọn file" data-label="Upload ảnh chụp màn hình, biên lai hoặc file xác nhận giao dịch"></div>
        <div class="d-grid gap-2 mt-3">
          <button class="btn btn-success" data-confirm-paid data-flow-id="${flow.id}" data-flow-title="${flow.title}" data-flow-amount="${flow.amount}" data-flow-method="${flow.method}">Tôi đã gửi tiền</button>
          <button class="btn btn-outline-primary">Tôi đã nhận tiền</button>
        </div>
      </div>
    `).join("");
    initUploadControls();
    bindConfirmPaidModal();
  }

  const timeline = document.getElementById("activityTimeline");
  if(timeline){
    timeline.innerHTML = transactionDetail.logs.map(log => `
      <div class="timeline-item">
        <div class="fw-bold">${log.time}</div>
        <div class="small-muted">${log.message}</div>
      </div>
    `).join("");
  }
});


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
      const amount = btn.dataset.flowAmount || "";
      const method = btn.dataset.flowMethod || "";
      subtitle.textContent = `Tải lên bằng chứng bạn đã gửi ${amount} qua ${method}.`;

      if(noteInput) noteInput.value = "";
      if(submitBtn) submitBtn.disabled = true;

      // Re-init upload control if needed
      initUploadControls();

      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
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
