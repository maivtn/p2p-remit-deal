
const dealTabs = [
  { key: "overview", label: "Overview", icon: "bi-window-dock", href: "overview.html" },
  { key: "searchDeals", label: "Tìm deal", icon: "bi-search", href: "search-deal.html" },
  { key: "manageDeals", label: "Quản lý deals", icon: "bi-briefcase", href: "manage-deals.html" },
  { key: "history", label: "Lịch sử", icon: "bi-clock-history", href: "history.html" },
  { key: "beneficiaryAccounts", label: "Tài khoản nhận", icon: "bi-wallet2", href: "beneficiary-accounts.html" },
];

function renderTabs(activeKey){
  const el = document.getElementById("dealTabs");
  if(!el) return;

  const wrap = el.closest(".tabs-wrap");
  const shell = document.querySelector(".app-shell");

  // v1.2: this is tab navigation, not bottom navigation.
  // Move the shared tab container to the top of the module, right after header/hero.
  if(wrap && shell){
    const topAnchor = shell.querySelector(".hero") || shell.querySelector(".screen-toolbar") || shell.querySelector(".app-header");
    if(topAnchor && topAnchor.nextSibling !== wrap){
      topAnchor.insertAdjacentElement("afterend", wrap);
    }else if(!topAnchor && shell.firstElementChild !== wrap){
      shell.insertAdjacentElement("afterbegin", wrap);
    }
  }

  el.innerHTML = dealTabs.map(tab => `
    <a class="deal-tab ${tab.key === activeKey ? "active" : ""}" href="${tab.href}">
      <i class="bi ${tab.icon}"></i>
      <span>${tab.label}</span>
    </a>
  `).join("");
}

function currencyFlag(code){
  return CURRENCIES.find(c => c.code === code)?.flag || "";
}
function currencySymbol(code){
  return CURRENCIES.find(c => c.code === code)?.symbol || "";
}
function methodConfig(currency, method){
  const group = paymentMethodMatrix.find(x => x.currency === currency);
  return group?.methods.find(m => m.method === method);
}
function methodLabel(currency, method){
  return methodConfig(currency, method)?.label || method;
}

function getMethodIconByLabelOrMethod(method){
  for(const group of paymentMethodMatrix){
    const found = group.methods.find(item => item.method === method || item.label === method);
    if(found?.icon) return found.icon;
  }
  return "";
}
function paymentIcon(method, className = "pay-icon"){
  const icon = getMethodIconByLabelOrMethod(method);
  if(!icon) return '<i class="bi bi-credit-card-2-front-fill"></i>';
  return `<img class="${className}" src="${icon}" alt="${method}">`;
}

function badgeClass(status){
  switch(status){
    case "processing":
    case "waiting_for_payment":
    case "active": return "badge-processing";
    case "waiting":
    case "waiting_acceptance": return "badge-waiting";
    case "completed": return "badge-success";
    case "rejected":
    case "deleted":
    case "cancelled": return "badge-danger-soft";
    default: return "badge-purple";
  }
}
function methodTag(method, variant = ""){
  const cls = variant === "green"
    ? "badge text-success border border-success-subtle"
    : "badge text-info border border-primary-subtle";
  return `<span class="${cls} d-inline-flex align-items-center gap-1 me-1 mt-1">${paymentIcon(method)}${method}</span>`;
}
function chip(method, active = false, radio = false, blue = false){
  return `
    <span class="chip ${radio ? "radio" : ""} ${active ? "active" : ""} ${blue && active ? "blue" : ""}" data-chip data-method="${method}">
      <span class="check">${active ? "✓" : ""}</span>
      ${paymentIcon(method)}
      <span>${method}</span>
    </span>
  `;
}
function accountDisplay(account){
  if(!account) return "";
  const d = account.details || {};
  if(d.phoneNumber) return d.phoneNumber;
  if(d.email) return d.email;
  // if(d.accountNumber) return `•••• ${String(d.accountNumber).slice(-4)}`;
  if(d.accountNumber) return `•••• ${String(d.accountNumber).slice(-4)}`;
  if(d.handle) return d.handle;
  return account.method;
}
function initChipToggle(){
  document.querySelectorAll("[data-chip]").forEach(chip => {
    chip.addEventListener("click", () => {
      const parent = chip.closest("[data-single]");
      if(parent){
        parent.querySelectorAll("[data-chip]").forEach(c => {
          c.classList.remove("active","blue");
          const check = c.querySelector(".check");
          if(check) check.textContent = "";
        });
      }
      chip.classList.toggle("active");
      if(chip.dataset.blue === "true") chip.classList.add("blue");
      const check = chip.querySelector(".check");
      if(check) check.textContent = chip.classList.contains("active") ? "✓" : "";
    });
  });
}
function renderMethodChips(containerId, currency, selected = [], options = {}){
  const el = document.getElementById(containerId);
  if(!el) return;
  const methods = paymentMethodMatrix.find(x => x.currency === currency)?.methods || [];
  el.innerHTML = methods.map(m => chip(m.label, selected.includes(m.method), options.single, options.blue)).join("");
}

/* ==============================
   v3.0 Shared Pagination
   Usage:
   renderPager(document.getElementById("xPager"), {
     page: currentPage, pageSize: 5, total: items.length,
     onPage: p => { currentPage = p; render(); }
   });
============================== */
function pagerRange(current, count){
  // Show every page when small; otherwise first, last, current ±1 with ellipses.
  if(count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const wanted = new Set([1, count, current, current - 1, current + 1]);
  const visible = [...wanted].filter(p => p >= 1 && p <= count).sort((a, b) => a - b);
  const out = [];
  let prev = 0;
  for(const p of visible){
    if(p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}

function renderPager(el, { page, pageSize, total, onPage }){
  if(!el) return;

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), pageCount);

  // Single page (or empty) → no pagination chrome needed.
  if(total === 0 || pageCount === 1){
    el.innerHTML = "";
    return;
  }

  const from = (current - 1) * pageSize + 1;
  const to = Math.min(current * pageSize, total);

  el.innerHTML = `
    <div class="pager">
      <div class="pager-info">Hiển thị <strong>${from}–${to}</strong> / ${total}</div>
      <nav class="pager-nav" aria-label="Phân trang">
        <button class="pager-btn" type="button" data-pager-prev ${current === 1 ? "disabled" : ""} aria-label="Trang trước">
          <i class="bi bi-chevron-left"></i>
        </button>
        ${pagerRange(current, pageCount).map(p => p === "…"
          ? `<span class="pager-gap" aria-hidden="true">…</span>`
          : `<button class="pager-num ${p === current ? "active" : ""}" type="button" data-pager-page="${p}" ${p === current ? 'aria-current="page"' : ""}>${p}</button>`
        ).join("")}
        <button class="pager-btn" type="button" data-pager-next ${current === pageCount ? "disabled" : ""} aria-label="Trang sau">
          <i class="bi bi-chevron-right"></i>
        </button>
      </nav>
    </div>
  `;

  const go = p => {
    const next = Math.min(Math.max(1, p), pageCount);
    if(next !== current) onPage(next);
  };

  el.querySelector("[data-pager-prev]")?.addEventListener("click", () => go(current - 1));
  el.querySelector("[data-pager-next]")?.addEventListener("click", () => go(current + 1));
  el.querySelectorAll("[data-pager-page]").forEach(btn => {
    btn.addEventListener("click", () => go(Number(btn.dataset.pagerPage)));
  });
}
document.addEventListener("DOMContentLoaded", () => {
  const active = document.body.dataset.activeTab;
  if(active) renderTabs(active);
  initChipToggle();
});


/* ==============================
   v1.2 Shared Add/Edit Beneficiary Account Modal
   Render field from paymentMethodMatrix
============================== */

function getSupportedCurrenciesForAccounts(){
  return paymentMethodMatrix.map(item => ({
    currency: item.currency,
    country: item.country,
    meta: CURRENCIES.find(c => c.code === item.currency)
  }));
}

function getMethodOptionsByCurrency(currency){
  return paymentMethodMatrix.find(item => item.currency === currency)?.methods || [];
}

function fieldLabel(field){
  const labels = {
    name: "Tên chủ tài khoản",
    phoneNumber: "Số điện thoại",
    email: "Email",
    handle: "Handle",
    cashtag: "Cashtag",
    bankName: "Tên ngân hàng",
    bankCode: "Mã ngân hàng",
    routingNumber: "Routing number",
    accountNumber: "Số tài khoản",
    accountType: "Loại tài khoản",
    branchName: "Chi nhánh",
    branchCode: "Mã chi nhánh",
    iban: "IBAN",
    bic: "BIC",
    sortCode: "Sort code",
    payNowType: "Loại PayNow",
    payNowValue: "Giá trị PayNow",
    payIdType: "Loại PayID",
    payIdValue: "Giá trị PayID",
    paypayId: "PayPay ID",
    promptPayType: "Loại PromptPay",
    promptPayValue: "Giá trị PromptPay",
    wechatId: "WeChat ID",
    alipayId: "Alipay ID",
    city: "Thành phố",
    province: "Tỉnh/Bang",
  };
  return labels[field] || field;
}

function fieldPlaceholder(field){
  const placeholders = {
    name: "Ví dụ: Tran Van B",
    phoneNumber: "Ví dụ: +1 415 555 2288",
    email: "Ví dụ: user@email.com",
    handle: "Ví dụ: @username",
    cashtag: "Ví dụ: $username",
    bankName: "Ví dụ: Chase Bank",
    bankCode: "Ví dụ: VCB",
    routingNumber: "Ví dụ: 021000021",
    accountNumber: "Nhập số tài khoản",
    accountType: "checking / savings",
    branchName: "Ví dụ: Chi nhánh TP.HCM",
    branchCode: "Ví dụ: 001",
    iban: "Nhập IBAN",
    bic: "Nhập BIC",
    sortCode: "Ví dụ: 20-00-00",
    payNowType: "phone / email / uen",
    payNowValue: "Nhập phone/email/UEN",
    payIdType: "phone / email / abn",
    payIdValue: "Nhập PayID",
    paypayId: "Nhập PayPay ID",
    promptPayType: "phone / nationalId",
    promptPayValue: "Nhập PromptPay",
    wechatId: "Nhập WeChat ID",
    alipayId: "Nhập Alipay ID",
    city: "Nhập thành phố",
    province: "Nhập tỉnh/bang",
  };
  return placeholders[field] || `Nhập ${field}`;
}

function buildFieldInput(field, value = "", required = true){
  const requiredMark = required ? '<span class="text-danger">*</span>' : '<span class="small-muted"></span>';
  return `
    <div class="col-12">
      <label class="form-label">${fieldLabel(field)} ${requiredMark}</label>
      <input class="form-control" name="${field}" value="${value || ""}" placeholder="${fieldPlaceholder(field)}" ${required ? "required" : ""}>
    </div>
  `;
}

function renderAccountDynamicFields({ currency, method, details = {} }){
  const fieldsEl = document.getElementById("accountDynamicFields");
  const noteEl = document.getElementById("accountMatrixNote");
  if(!fieldsEl) return;

  const config = methodConfig(currency, method);
  if(!config){
    fieldsEl.innerHTML = `<div class="alert alert-warning mb-0">Chưa có cấu hình field cho phương thức này.</div>`;
    if(noteEl) noteEl.textContent = "";
    return;
  }

  const requiredFields = config.fields || [];
  const oneOfGroups = config.oneOf || [];
  const optionalFields = config.optionalFields || [];

  let html = "";

  requiredFields.forEach(field => {
    html += buildFieldInput(field, details[field], true);
  });

  if(oneOfGroups.length){
    html += `
      <div class="col-12">
        <div class="alert alert-primary py-2 small mb-0">
          Chọn và nhập <strong>một trong các nhóm thông tin</strong> bên dưới.
        </div>
      </div>
    `;

    oneOfGroups.forEach((group, index) => {
      const groupName = group.map(fieldLabel).join(" + ");
      html += `
        <div class="col-12">
          <div class="border rounded-4 p-3 bg-light">
            <div class="form-check mb-2">
              <input class="form-check-input" type="radio" name="oneOfGroup" id="oneOfGroup${index}" value="${index}" ${index === 0 ? "checked" : ""}>
              <label class="form-check-label fw-bold" for="oneOfGroup${index}">${groupName}</label>
            </div>
            <div class="row g-2">
              ${group.map(field => buildFieldInput(field, details[field], false)).join("")}
            </div>
          </div>
        </div>
      `;
    });
  }

  optionalFields.forEach(field => {
    html += buildFieldInput(field, details[field], false);
  });

  fieldsEl.innerHTML = html;

  if(noteEl){
    noteEl.textContent = `Fields được render theo : ${currency} / ${method}`;
  }
}

function injectAccountModal(){
  if(document.getElementById("beneficiaryAccountModal")) return;

  const modalHtml = `
    <div class="modal fade" id="beneficiaryAccountModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable account-modal-dialog">
        <div class="modal-content accept-modal-card">
          <div class="modal-header">
            <div>
              <h5 class="modal-title fw-black" id="accountModalTitle">Thêm tài khoản nhận</h5>
            </div>
            <button class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form id="beneficiaryAccountForm">
              <input type="hidden" id="editingAccountId">

              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Loại tiền nhận <span class="text-danger">*</span></label>
                  <select class="form-select" id="accountCurrencySelect" required></select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Phương thức nhận <span class="text-danger">*</span></label>
                  <select class="form-select" id="accountMethodSelect" required></select>
                </div>
              </div>

              <div class="alert alert-info small mt-3 mb-3" id="accountMatrixNote"></div>

              <div class="account-field-grid" id="accountDynamicFields"></div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-light" data-bs-dismiss="modal">Huỷ</button>
            <button class="btn btn-success" id="saveBeneficiaryAccountBtn">
              <i class="bi bi-check2-circle"></i> Lưu tài khoản
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHtml);
}

function populateAccountCurrencySelect(selectedCurrency = "VND"){
  const select = document.getElementById("accountCurrencySelect");
  if(!select) return;

  select.innerHTML = getSupportedCurrenciesForAccounts().map(item => {
    const meta = item.meta;
    const label = `${meta?.flag || ""} ${item.currency} - ${meta?.name || item.country}`;
    return `<option value="${item.currency}" ${item.currency === selectedCurrency ? "selected" : ""}>${label}</option>`;
  }).join("");
}

function populateAccountMethodSelect(currency, selectedMethod){
  const select = document.getElementById("accountMethodSelect");
  if(!select) return;

  const methods = getMethodOptionsByCurrency(currency);
  const fallbackMethod = selectedMethod || methods[0]?.method || "";

  select.innerHTML = methods.map(method => `
    <option value="${method.method}" ${method.method === fallbackMethod ? "selected" : ""}>
      ${method.label}
    </option>
  `).join("");

  renderAccountDynamicFields({ currency, method: fallbackMethod });
}

function openBeneficiaryAccountModal(mode = "add", accountId = ""){
  injectAccountModal();

  const title = document.getElementById("accountModalTitle");
  const editingInput = document.getElementById("editingAccountId");

  const allAccounts = beneficiaryAccounts || [];
  const account = allAccounts.find(item => item.id === accountId);

  const currency = account?.currency || "VND";
  const method = account?.method || getMethodOptionsByCurrency(currency)[0]?.method || "";

  if(title) title.textContent = mode === "edit" ? "Sửa tài khoản nhận" : "Thêm tài khoản nhận";
  if(editingInput) editingInput.value = account?.id || "";

  populateAccountCurrencySelect(currency);
  populateAccountMethodSelect(currency, method);

  if(account){
    setTimeout(() => {
      renderAccountDynamicFields({ currency, method, details: account.details || {} });
    }, 0);
  }

  const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById("beneficiaryAccountModal"));
  modal.show();
}

function bindAccountModalEvents(){
  injectAccountModal();

  document.querySelectorAll("[data-account-modal]").forEach(btn => {
    btn.addEventListener("click", () => {
      openBeneficiaryAccountModal(btn.dataset.mode || "add", btn.dataset.accountId || "");
    });
  });

  const currencySelect = document.getElementById("accountCurrencySelect");
  const methodSelect = document.getElementById("accountMethodSelect");

  if(currencySelect && !currencySelect.dataset.bound){
    currencySelect.dataset.bound = "true";
    currencySelect.addEventListener("change", () => {
      populateAccountMethodSelect(currencySelect.value);
    });
  }

  if(methodSelect && !methodSelect.dataset.bound){
    methodSelect.dataset.bound = "true";
    methodSelect.addEventListener("change", () => {
      renderAccountDynamicFields({
        currency: currencySelect.value,
        method: methodSelect.value,
      });
    });
  }

  const saveBtn = document.getElementById("saveBeneficiaryAccountBtn");
  if(saveBtn && !saveBtn.dataset.bound){
    saveBtn.dataset.bound = "true";
    saveBtn.addEventListener("click", () => {
      const form = document.getElementById("beneficiaryAccountForm");
      if(!form.checkValidity()){
        form.reportValidity();
        return;
      }

      saveBtn.innerHTML = '<i class="bi bi-check2-circle"></i> Đã lưu mock';
      setTimeout(() => {
        saveBtn.innerHTML = '<i class="bi bi-check2-circle"></i> Lưu tài khoản';
        bootstrap.Modal.getOrCreateInstance(document.getElementById("beneficiaryAccountModal")).hide();
      }, 700);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  bindAccountModalEvents();
});


/* ==============================
   v1.3 Shared Upload Control
   Usage:
   <div data-upload-control data-upload-id="proof_flow_a" data-max-files="5" data-max-size-mb="5"></div>
============================== */

function formatFileSize(bytes){
  if(!bytes && bytes !== 0) return "";
  const mb = bytes / (1024 * 1024);
  if(mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.ceil(bytes / 1024)} KB`;
}

function createUploadControl(root){
  if(!root || root.dataset.initialized === "true") return;
  root.dataset.initialized = "true";

  const uploadId = root.dataset.uploadId || `upload_${Math.random().toString(36).slice(2)}`;
  const maxFiles = Number(root.dataset.maxFiles || 5);
  const maxSizeMb = Number(root.dataset.maxSizeMb || 5);
  const accept = root.dataset.accept || "image/png,image/jpeg,image/webp,application/pdf";
  const label = root.dataset.label || "Upload bằng chứng gửi tiền";
  const formatsLabel = root.dataset.formatsLabel || "Hỗ trợ PNG, JPG, JPEG.";
  const cameraLabel = root.dataset.cameraLabel || "Take Photo";
  const fileLabel = root.dataset.fileLabel || "Choose File";

  root.classList.add("upload-control");

  root.innerHTML = `
    <div class="upload-actions-grid">
      <label class="upload-action" for="${uploadId}_camera">
        <i class="bi bi-camera"></i>
        <span>${cameraLabel}</span>
      </label>

      <label class="upload-action" for="${uploadId}_file">
        <i class="bi bi-folder2-open"></i>
        <span>${fileLabel}</span>
      </label>
    </div>

    <input id="${uploadId}_camera" type="file" accept="image/*" capture="environment" class="d-none">
    <input id="${uploadId}_file" type="file" accept="${accept}" multiple class="d-none">

    <div class="upload-help-text">
      ${label} ${maxSizeMb}MB/file. ${formatsLabel}
    </div>

    <div class="upload-preview-grid" id="${uploadId}_preview"></div>
  `;

  const preview = root.querySelector(`#${uploadId}_preview`);
  const cameraInput = root.querySelector(`#${uploadId}_camera`);
  const fileInput = root.querySelector(`#${uploadId}_file`);
  const files = [];

  function renderPreview(){
    preview.innerHTML = files.map((file, index) => {
      const isImage = file.type && file.type.startsWith("image/");
      const isVideo = file.type && file.type.startsWith("video/");
      const isAudio = file.type && file.type.startsWith("audio/");
      const src = file.previewUrl || "";
      const thumb = isImage
        ? `<img class="upload-preview-thumb" src="${src}" alt="${file.name}">`
        : isVideo
          ? `<div class="media-preview-icon"><i class="bi bi-camera-video"></i></div>`
          : isAudio
            ? `<div class="media-preview-icon"><i class="bi bi-mic"></i></div>`
            : `<div class="media-preview-icon"><i class="bi bi-file-earmark"></i></div>`;

      return `
        <div class="upload-preview-card">
          <button class="upload-preview-remove" type="button" data-remove-upload="${index}">
            <i class="bi bi-x"></i>
          </button>
          ${thumb}
          <div class="upload-preview-body">
            <div class="upload-preview-name">${file.name}</div>
            <div class="upload-preview-meta">${formatFileSize(file.size)}</div>
            <button class="upload-preview-view" type="button" data-view-upload="${index}">
              <i class="bi bi-eye"></i> View
            </button>
          </div>
        </div>
      `;
    }).join("");

    preview.querySelectorAll("[data-remove-upload]").forEach(btn => {
      btn.addEventListener("click", () => {
        const index = Number(btn.dataset.removeUpload);
        files.splice(index, 1);
        renderPreview();
      });
    });

    preview.querySelectorAll("[data-view-upload]").forEach(btn => {
      btn.addEventListener("click", () => {
        const index = Number(btn.dataset.viewUpload);
        const file = files[index];
        if(file?.previewUrl){
          window.open(file.previewUrl, "_blank");
        }
      });
    });
  }

  function addFiles(fileList){
    const nextFiles = Array.from(fileList || []);

    for(const file of nextFiles){
      if(files.length >= maxFiles){
        alert(`Chỉ được upload tối đa ${maxFiles} file.`);
        break;
      }

      const sizeMb = file.size / (1024 * 1024);
      if(sizeMb > maxSizeMb){
        alert(`${file.name} vượt quá ${maxSizeMb}MB.`);
        continue;
      }

      file.previewUrl = URL.createObjectURL(file);
      files.push(file);
    }

    root.uploadedFiles = files;
    renderPreview();
    root.dispatchEvent(new CustomEvent("upload-control:change", {
      bubbles: true,
      detail: { files }
    }));
  }

  cameraInput.addEventListener("change", e => {
    addFiles(e.target.files);
    e.target.value = "";
  });

  fileInput.addEventListener("change", e => {
    addFiles(e.target.files);
    e.target.value = "";
  });
}

function initUploadControls(){
  document.querySelectorAll("[data-upload-control]").forEach(createUploadControl);
}

(function loadSweetAlert2(){
  if(window.__swal2Loaded) return;
  window.__swal2Loaded = true;
  const s = document.createElement("script");
  s.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.all.min.js";
  document.head.appendChild(s);
})();

function showConfirmReceived(amount, method){
  if(typeof Swal !== "undefined"){
    return Swal.fire({
      title: "Xác nhận nhận tiền?",
      html: `Bạn xác nhận đã nhận đủ số tiền <strong>${amount}</strong> bằng hình thức <strong>${method}</strong> từ Tran ** B.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#198754",
      cancelButtonColor: "#6c757d",
      reverseButtons: true,
    }).then(r => r.isConfirmed);
  }
  return Promise.resolve(window.confirm(`Bạn xác nhận đã nhận đủ số tiền ${amount} bằng hình thức ${method} từ Tran ** B?`));
}

document.addEventListener("DOMContentLoaded", () => {
  initUploadControls();
});
