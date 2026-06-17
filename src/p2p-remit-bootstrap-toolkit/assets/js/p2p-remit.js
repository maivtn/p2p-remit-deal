/* P2P Remit Toolkit demo helpers */
(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  $$('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.getAttribute('data-copy');
      try { await navigator.clipboard.writeText(text); } catch(e) {}
      const original = btn.innerHTML;
      btn.innerHTML = '<i class="bi bi-check2"></i>';
      setTimeout(() => btn.innerHTML = original, 1000);
    });
  });

  $$('[data-filter-group]').forEach(group => {
    const buttons = $$('[data-filter-value]', group);
    buttons.forEach(btn => btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const value = btn.getAttribute('data-filter-value');
      const targetSelector = group.getAttribute('data-filter-target');
      if(!targetSelector) return;
      $$(targetSelector).forEach(item => {
        const status = item.getAttribute('data-status');
        item.style.display = (value === 'all' || value === status) ? '' : 'none';
      });
    }));
  });

  $$('[data-countdown]').forEach(el => {
    let seconds = parseInt(el.getAttribute('data-countdown'), 10) || 0;
    const render = () => {
      const m = Math.floor(seconds/60).toString().padStart(2,'0');
      const s = Math.floor(seconds%60).toString().padStart(2,'0');
      el.textContent = `${m}:${s}`;
      if(seconds > 0) seconds -= 1;
    };
    render();
    setInterval(render, 1000);
  });

  $$('[data-upload-control]').forEach(control => {
    const maxFiles = control.dataset.maxFiles || 6;
    const maxSize = control.dataset.maxSizeMb || 10;
    const accept = control.dataset.accept || 'image/*,video/*,audio/*';
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = accept;
    input.className = 'd-none';
    const list = document.createElement('div');
    list.className = 'file-list mt-3 text-start';
    control.appendChild(input);
    control.appendChild(list);
    control.addEventListener('click', (e) => { if(e.target !== input) input.click(); });
    input.addEventListener('change', () => {
      const files = Array.from(input.files || []);
      list.innerHTML = files.length ? files.slice(0, maxFiles).map(file => `
        <div class="d-flex align-items-center justify-content-between gap-2 border rounded-3 px-3 py-2 mb-2 bg-white">
          <span><i class="bi bi-paperclip me-2 text-success"></i>${file.name}</span>
          <span class="text-muted small">${(file.size/1024/1024).toFixed(2)}MB</span>
        </div>`).join('') : '';
      if(files.length > maxFiles){
        list.insertAdjacentHTML('afterbegin', `<div class="alert alert-warning py-2 small">Chỉ nên upload tối đa ${maxFiles} file.</div>`);
      }
      files.forEach(file => {
        if(file.size > maxSize * 1024 * 1024){
          list.insertAdjacentHTML('beforeend', `<div class="alert alert-danger py-2 small">${file.name} vượt quá ${maxSize}MB/file.</div>`);
        }
      });
    });
  });

  $$('[data-select-account]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = $(btn.dataset.selectAccount || '#selectedAccount');
      if(!target) return;
      target.innerHTML = `
        <div class="p2p-card p-3 mt-3">
          <div class="d-flex align-items-start gap-3">
            <span class="p2p-method"><span class="method-icon method-momo">mo</span> MoMo</span>
            <div class="flex-grow-1">
              <div class="fw-bold">Trần Văn C</div>
              <div class="text-muted small">0901234567 · VND · Active</div>
            </div>
            <button class="btn btn-sm btn-p2p-ghost">Đổi</button>
            <button class="btn btn-sm btn-p2p-danger">Xoá</button>
          </div>
        </div>`;
    });
  });
})();
