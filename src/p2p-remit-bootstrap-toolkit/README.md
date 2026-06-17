# P2P Remit — Emerald Trust Bootstrap Toolkit

Bộ HTML toolkit base trên Bootstrap 5 cho module P2P Remit / Deal Matching.

## Cấu trúc

```text
p2p-remit-bootstrap-toolkit/
├── index.html                 # Design system toolkit: colors, type, tokens, buttons, forms, cards, modals, mobile preview
├── screen-patterns.html       # Screen patterns: Overview, Search, Results, Select, Create, Manage, History, Accounts, Transaction cases 1–9
├── starter-template.html      # Base template để copy tạo page mới
├── assets/
│   ├── css/p2p-remit.css      # Design tokens + component styles
│   └── js/p2p-remit.js        # Demo interaction: filter, countdown, upload preview, copy
└── README.md
```

## Thư viện dùng

- Bootstrap 5.3.3 CDN
- Bootstrap Icons 1.11.3 CDN
- CSS custom properties cho theme Emerald Trust

## Palette chính

```css
--p2p-primary: #009B72;
--p2p-primary-900: #003F2D;
--p2p-mint: #E6F8F1;
--p2p-bg: #F6FAF8;
--p2p-surface: #FFFFFF;
--p2p-text: #111827;
--p2p-border: #DDE5E2;
--p2p-success: #12B76A;
--p2p-warning: #F79009;
--p2p-danger: #F04438;
--p2p-info: #2563EB;
--p2p-hold: #7A5AF8;
```

## Các component có sẵn

- `.btn-p2p-primary`, `.btn-p2p-secondary`, `.btn-p2p-outline`, `.btn-p2p-ghost`, `.btn-p2p-danger`
- `.p2p-card`, `.p2p-deal-card`, `.p2p-card-soft`, `.p2p-summary-box`
- `.p2p-chip`, `.p2p-method`, `.p2p-status-*`
- `.p2p-app-frame`, `.p2p-app-header`, `.p2p-app-content`, `.p2p-bottom-nav`
- Upload control bằng `data-upload-control`
- Filter group bằng `data-filter-group`
- Countdown bằng `data-countdown`

## Upload control mẫu

```html
<div
  class="file-drop"
  data-upload-control
  data-max-files="6"
  data-max-size-mb="10"
  data-accept="image/*,video/*,audio/*">
  <i class="bi bi-cloud-arrow-up fs-2 text-success"></i>
  <div>Upload bằng chứng đã gửi tiền</div>
</div>
```

## Ghi chú dev

Đây là static HTML/JS để prototype và chuẩn hoá UI. Khi integrate FE thật, nên tách thành component tương ứng: Button, Chip, MethodTag, DealCard, AccountPicker, ProofUpload, TransactionCasePanel.
