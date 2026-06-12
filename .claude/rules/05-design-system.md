---
description: Design system for P2P Remit Deals — based on DESIGN.md (monday.com white-canvas + pastel language). Apply when building or reviewing any UI component.
paths:
  - src/app/components/**/*.tsx
  - src/styles/**
---

# Design System

**Theme:** light · white canvas · pastel accent surfaces · pill-shaped components  
**Source tokens:** [.claude/rules/DESIGN.md](DESIGN.md)  
**UX spec:** [src/docs/P2P_Remit_Deals_UX_UI_Spec_v4.0.md](../../src/docs/P2P_Remit_Deals_UX_UI_Spec_v4.0.md)

---

## Color Tokens

### Brand & Base

| Token | Value | Dùng cho |
|---|---|---|
| `--color-monday-violet` | `#6161ff` | CTA chính, brand surfaces, active tab, link, gradient stop |
| `--color-ink` | `#333333` | Text chính, headings, button label |
| `--color-slate` | `#535768` | Text phụ, icon, helper text |
| `--color-iron` | `#808080` | Muted text, disabled stroke |
| `--color-fog` | `#cacbcd` | Divider nhẹ giữa các block |
| `--color-mist` | `#d0d4e4` | Card border, outlined input border |
| `--color-pebble` | `#dddfeb` | Badge border, pill-button outline |
| `--color-cloud` | `#f5f6f8` | App background (canvas) |
| `--color-snow` | `#ffffff` | Card surface, input fill, button text |
| `--color-shadow-dust` | `#e6e7ea` | Box-shadow tint |

### Pastel Accent (surfaces, highlights — KHÔNG dùng cho text/border/button)

| Token | Value | Ngữ cảnh P2P |
|---|---|---|
| `--color-mint` | `#bcfe90` | Provider confirmed / completed / trust-positive |
| `--color-sky` | `#abf0ff` | Requester action required / payment instruction |
| `--color-lavender` | `#eddff7` | Proof card / dispute context |
| `--color-periwinkle` | `#e7ecff` | Deal card background / brand-tinted tile |
| `--color-aqua` | `#d1faff` | Transfer proof / transfer_sent |
| `--color-periwinkle-wash` | `#dbdbff` | Badge & tag background |
| `--color-cornflower` | `#93beff` | Marketplace / info card surface |

### Status Semantic (dùng text/icon — surface dùng pastel tương ứng)

| Token | Value | Dùng cho |
|---|---|---|
| `--color-ultra-violet` | `#9450fd` | `pending_acceptance`, `payment_sent` — chờ Provider |
| `--color-electric-cyan` | `#3ac9ff` | `accepted`, `payment_confirmed` — Requester cầm lượt |
| `--color-forest` | `#2a5c4e` | `completed`, verified, proof accepted |
| `--color-warning` | `#f59e0b` | SLA countdown gần hết, `transfer_sent` waiting |
| `--color-danger` | `#ef4444` | `rejected`, `disputed`, destructive action |

### Gradient

| Token | Value | Dùng cho |
|---|---|---|
| `--gradient-hero` | `linear-gradient(90deg, #fe81e4 31%, #fda900 88%)` | Hero headline, trust banner title |
| `--gradient-prism` | `conic-gradient(from 270deg, #8181ff 15%, #33dbdb 40%, #33d58e 55%, #ffd633 65%, #fc527d 85%, #8181ff 100%)` | Logo mark, brand divider — không dùng làm surface fill |

---

## Typography

**Font:** Poppins — duy nhất cho toàn bộ app (nav, body, heading, button, badge, số tiền)  
**Fallback:** Manrope, DM Sans, Plus Jakarta Sans

```css
--font-poppins: 'Poppins', ui-sans-serif, system-ui, sans-serif;
```

| Role | Size | Weight | Line height | Letter spacing | Token |
|---|---|---|---|---|---|
| Display (hero) | 64px | 300 | 1.15 | -2.56px | `--text-display` |
| Heading lg | 48px | 300–400 | 1.15 | -0.96px | `--text-heading-lg` |
| Heading | 36px | 500–600 | 1.2 | -0.54px | `--text-heading` |
| Heading sm (page title) | 24px | 600 | 1.3 | -0.36px | `--text-heading-sm` |
| Subheading (section title) | 20px | 500 | 1.4 | -0.22px | `--text-subheading` |
| Body | 16px | 400 | 1.5 | -0.16px | `--text-body` |
| Body sm | 14px | 400 | 1.5 | — | `--text-body-sm` |
| Caption / helper | 12px | 400 | 1.45 | -0.12px | `--text-caption` |
| **Money number** | 20–28px | 600 | 1.2 | — | tabular-nums, monospace fallback |
| **Memo/ref code** | 18–20px | 700 | — | — | mono, no wrap, copy button |

---

## Spacing & Shape

**Base unit:** 8px

| Token | Value |
|---|---|
| `--spacing-8` | 8px |
| `--spacing-16` | 16px |
| `--spacing-24` | 24px |
| `--spacing-32` | 32px |
| `--spacing-40` | 40px |
| `--spacing-48` | 48px |
| `--spacing-64` | 64px |
| `--spacing-80` | 80px |

### Border Radius

| Element | Value | Token |
|---|---|---|
| Button / CTA | **160px** — pill shape bắt buộc | `--radius-buttons` |
| Card | 24px | `--radius-cards` |
| Image / avatar | 12px | `--radius-images` |
| Badge / tag / status pill | 6px | `--radius-badges` |
| Input / nav item | 6px | `--radius-nav` |

> Pill shape (160px) là chữ ký của design — KHÔNG dùng square hay 4px-radius cho button.

### Shadows (flat-with-soft-shadow approach)

| Token | Value | Dùng cho |
|---|---|---|
| `--shadow-xl` | `rgba(205,208,223,0.4) 0px 2px 48px 0px` | Card, board mockup — elevation tiêu chuẩn |
| `--shadow-xl-2` | `rgba(0,0,0,0.15) 0px 5px 45px 0px` | Elevated card (hover/featured) |
| `--shadow-xl-3` | `rgba(0,0,0,0.15) 0px 4px 40px 0px` | Bottom sheet, modal |

---

## Surfaces

| Level | Name | Value | Ngữ cảnh P2P |
|---|---|---|---|
| 0 | Canvas | `#f5f6f8` | App background, page floor |
| 1 | Card | `#ffffff` | Request card, deal card, form container |
| 2 | Brand Panel | `#6161ff` | CTA section, role selection hero |
| 3 | Tinted Accent | pastel (mint/sky/lavender…) | Feature card, proof card, status highlight |

---

## Component Patterns — Bootstrap Base + DESIGN.md Override

Mọi component dùng **Bootstrap 5 class làm base**, sau đó override bằng CSS custom properties từ DESIGN.md.  
Cấu trúc: `HTML dùng class Bootstrap → theme.css override bằng `--color-*` tokens`.

---

### Transition tokens (thêm vào `:root` trong `theme.css`)

```css
:root {
  --transition-fast: 0.12s ease;   /* copy flash, badge tap */
  --transition-base: 0.18s ease;   /* button, input, card hover */
  --transition-slow: 0.28s ease;   /* card lift, sheet open */
}
```

Áp dụng `transition` trên `background-color, border-color, box-shadow, transform, opacity`.

---

### Button

**Bootstrap base:** `.btn` + `.btn-primary` / `.btn-outline-secondary` / `.btn-danger`  
**Override bắt buộc:** radius 160px (pill), font Poppins, màu từ token.

```html
<!-- Primary -->
<button class="btn btn-primary">Đã chuyển tiền & tải bằng chứng</button>

<!-- Secondary -->
<button class="btn btn-outline-secondary">Hủy</button>

<!-- Destructive -->
<button class="btn btn-danger">Mở khiếu nại</button>

<!-- Copy (custom class) -->
<button class="btn btn-copy">Copy</button>

<!-- Ghost / Icon -->
<button class="btn btn-ghost-icon" aria-label="Quay lại">
  <i class="bi bi-arrow-left"></i>
</button>
```

```css
/* ── Override .btn chung ── */
.btn {
  font-family: var(--font-poppins);
  font-weight: 500;
  border-radius: var(--radius-buttons) !important; /* 160px — pill bắt buộc */
  padding: 13px 24px;
  font-size: 16px;
  transition: background-color var(--transition-base),
              border-color var(--transition-base),
              box-shadow var(--transition-base),
              transform var(--transition-fast);
}

/* Primary */
.btn-primary                { background: #6161ff; border-color: #6161ff; color: #fff; }
.btn-primary:hover          { background: #5252db; border-color: #5252db;
                               box-shadow: rgba(97,97,255,0.32) 0 4px 20px; }
.btn-primary:active         { background: #4444c2; transform: scale(0.98); }
.btn-primary:focus-visible  { outline: 2px solid #6161ff; outline-offset: 3px;
                               box-shadow: none; }
.btn-primary:disabled,
.btn-primary.disabled       { background: #6161ff; opacity: 0.4; pointer-events: none; }

/* Secondary outlined */
.btn-outline-secondary                { border: 1.5px solid #535768; color: #333333; background: transparent; }
.btn-outline-secondary:hover          { background: #f5f6f8; border-color: #333333; color: #333333; }
.btn-outline-secondary:active         { background: #e7ecff; transform: scale(0.98); }
.btn-outline-secondary:focus-visible  { outline: 2px solid #6161ff; outline-offset: 3px; box-shadow: none; }

/* Destructive */
.btn-danger               { background: #ef4444; border-color: #ef4444; color: #fff; }
.btn-danger:hover         { background: #dc2626; border-color: #dc2626;
                            box-shadow: rgba(239,68,68,0.30) 0 4px 16px; }
.btn-danger:active        { background: #b91c1c; transform: scale(0.98); }
.btn-danger:focus-visible { outline: 2px solid #ef4444; outline-offset: 3px; box-shadow: none; }

/* Copy button */
.btn-copy               { background: #e7ecff; color: #6161ff; font-size: 12px;
                           font-weight: 600; padding: 5px 14px; }
.btn-copy:hover         { background: #dbdbff; transform: scale(1.03); color: #6161ff; }
.btn-copy:active        { background: #c7c7ff; transform: scale(0.97); }
.btn-copy.copied        { background: #bcfe90; color: #2a5c4e; } /* flash 1.8s */
.btn-copy:focus-visible { outline: 2px solid #6161ff; outline-offset: 2px; box-shadow: none; }

/* Ghost icon button */
.btn-ghost-icon {
  width: 36px; height: 36px; padding: 0;
  background: #f5f6f8; border: none; border-radius: 50% !important;
  display: inline-flex; align-items: center; justify-content: center;
}
.btn-ghost-icon:hover         { background: #e7ecff; transform: scale(1.08); }
.btn-ghost-icon:active        { background: #dbdbff; transform: scale(1.0); }
.btn-ghost-icon:focus-visible { outline: 2px solid #6161ff; outline-offset: 2px; box-shadow: none; }
```

---

### Input / Textarea / Select

**Bootstrap base:** `.form-control`, `.form-select`

```html
<input type="text" class="form-control p2p-input" placeholder="Số tiền" />
<textarea class="form-control p2p-input"></textarea>
<select class="form-select p2p-input"></select>

<!-- Error state -->
<input class="form-control p2p-input is-invalid" />
```

```css
/* ── Override .form-control & .form-select ── */
.form-control,
.form-select {
  font-family: var(--font-poppins);
  font-size: 15px;
  border: 1px solid #dddfeb;       /* pebble */
  border-radius: 6px !important;   /* radius-inputs */
  background: #ffffff;
  color: #333333;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
  box-shadow: none;
}
.form-control:hover,
.form-select:hover       { border-color: #d0d4e4; }      /* mist */

.form-control:focus,
.form-select:focus       { border-color: #6161ff;
                            box-shadow: 0 0 0 3px rgba(97,97,255,0.14);
                            outline: none; }

.form-control.is-invalid,
.form-select.is-invalid  { border-color: #ef4444;
                            box-shadow: 0 0 0 3px rgba(239,68,68,0.14); }

.form-control:disabled,
.form-select:disabled    { background: #f5f6f8; color: #808080; cursor: not-allowed; }
```

---

### Checkbox & Radio

**Bootstrap base:** `.form-check-input`

```html
<div class="form-check">
  <input class="form-check-input" type="checkbox" id="confirmCheck" />
  <label class="form-check-label" for="confirmCheck">
    Tôi xác nhận người nhận đã nhận đủ tiền
  </label>
</div>
```

```css
.form-check-input {
  width: 18px; height: 18px;
  border: 1.5px solid #dddfeb;
  background: #ffffff;
  border-radius: 4px;
  transition: border-color var(--transition-base), box-shadow var(--transition-base),
              background-color var(--transition-base);
  cursor: pointer;
}
.form-check-input:hover          { border-color: #d0d4e4; }
.form-check-input:focus          { border-color: #6161ff;
                                    box-shadow: 0 0 0 3px rgba(97,97,255,0.14);
                                    outline: none; }
.form-check-input:checked        { background-color: #6161ff; border-color: #6161ff; }
.form-check-input:checked:hover  { background-color: #5252db; }
.form-check-input:disabled       { background: #f5f6f8; opacity: 0.5; cursor: not-allowed; }
```

---

### Card

**Bootstrap base:** `.card`  
**P2P variants:** `.p2p-card` (static), `.deal-card` (clickable)

```html
<!-- Static card -->
<div class="card p2p-card">...</div>

<!-- Clickable deal card -->
<div class="card deal-card" tabindex="0" role="button">...</div>
```

```css
/* Static card */
.card.p2p-card {
  border: 1px solid #d0d4e4;
  border-radius: 24px !important;
  box-shadow: rgba(205,208,223,0.4) 0px 2px 48px 0px;
  transition: box-shadow var(--transition-base);
}

/* Clickable deal card */
.card.deal-card {
  border: 1px solid #d0d4e4;
  border-radius: 24px !important;
  box-shadow: rgba(205,208,223,0.4) 0px 2px 48px 0px;
  cursor: pointer;
  transition: transform var(--transition-base),
              box-shadow var(--transition-base),
              border-color var(--transition-base);
}
.card.deal-card:hover        { transform: translateY(-2px);
                                box-shadow: rgba(0,0,0,0.15) 0px 5px 45px 0px;
                                border-color: rgba(97,97,255,0.30); }
.card.deal-card:active       { transform: translateY(0);
                                box-shadow: rgba(205,208,223,0.4) 0px 2px 48px 0px; }
.card.deal-card:focus-visible { outline: 2px solid #6161ff; outline-offset: 2px;
                                 border-radius: 24px; }
```

---

### Badge / Status Pill

**Bootstrap base:** `.badge`  
**Override:** radius 6px, Poppins, màu pastel từ token.

```html
<span class="badge badge-p2p badge-accepted">Chờ bạn chuyển tiền</span>
<span class="badge badge-p2p badge-payment-sent">Chờ Provider xác nhận</span>
<span class="badge badge-p2p badge-completed">Hoàn thành</span>
<span class="badge badge-p2p badge-disputed">Đang khiếu nại</span>
```

```css
.badge.badge-p2p {
  font-family: var(--font-poppins);
  font-size: 12px; font-weight: 500;
  border-radius: 6px !important;    /* radius-badges */
  padding: 3px 10px;
  letter-spacing: 0.01em;
}

/* Luôn có text label — không truyền nghĩa chỉ bằng màu */
.badge-pending       { background: #e7ecff; color: #6161ff; }
.badge-accepted      { background: #d1faff; color: #0891b2; }
.badge-payment-sent  { background: #eddff7; color: #9450fd; }
.badge-payment-conf  { background: #abf0ff; color: #0891b2; }
.badge-transfer-sent { background: #dbdbff; color: #6161ff; }
.badge-completed     { background: #bcfe90; color: #2a5c4e; }
.badge-disputed      { background: #fee2e2; color: #ef4444; }
.badge-resolved      { background: #f5f6f8; color: #535768; }
.badge-expired       { background: #f5f6f8; color: #808080; }
```

---

### Nav / Tabs

**Bootstrap base:** `.nav`, `.nav-tabs`, `.nav-link`

```html
<!-- Section tabs -->
<ul class="nav nav-tabs p2p-tabs">
  <li class="nav-item">
    <a class="nav-link active" href="#">Đang xử lý</a>
  </li>
  <li class="nav-item">
    <a class="nav-link" href="#">Đã đóng</a>
  </li>
</ul>

<!-- Bottom navigation (mobile) -->
<nav class="p2p-bottom-nav">
  <a class="p2p-nav-item active" href="#"><i class="bi bi-send"></i><span>Gửi tiền</span></a>
  <a class="p2p-nav-item" href="#"><i class="bi bi-list-ul"></i><span>Yêu cầu</span></a>
  <a class="p2p-nav-item" href="#"><i class="bi bi-link-45deg"></i><span>Liên kết</span></a>
  <a class="p2p-nav-item" href="#"><i class="bi bi-person"></i><span>Hồ sơ</span></a>
</nav>
```

```css
/* Section tabs */
.nav-tabs.p2p-tabs          { border-bottom: 1px solid #dddfeb; gap: 4px; }
.nav-tabs.p2p-tabs .nav-link {
  font-family: var(--font-poppins); font-size: 14px; font-weight: 500;
  color: #535768; border: none; border-radius: 6px 6px 0 0 !important;
  padding: 8px 16px;
  transition: color var(--transition-base), background-color var(--transition-base);
}
.nav-tabs.p2p-tabs .nav-link:hover        { color: #333333; background: rgba(97,97,255,0.06); }
.nav-tabs.p2p-tabs .nav-link.active       { color: #6161ff; background: transparent;
                                             border-bottom: 2px solid #6161ff !important; font-weight: 600; }
.nav-tabs.p2p-tabs .nav-link:focus-visible { outline: 2px solid #6161ff; outline-offset: 2px; }

/* Bottom nav */
.p2p-bottom-nav {
  display: flex; background: #ffffff;
  border-top: 1px solid #dddfeb; padding: 8px 0 4px;
}
.p2p-nav-item {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  gap: 3px; padding: 4px 8px; color: #535768; text-decoration: none;
  font-family: var(--font-poppins); font-size: 10px; font-weight: 500;
  border-radius: 8px !important;
  transition: color var(--transition-base), background-color var(--transition-base);
}
.p2p-nav-item:hover         { color: #333333; background: rgba(97,97,255,0.06); }
.p2p-nav-item.active        { color: #6161ff; }
.p2p-nav-item:focus-visible { outline: 2px solid #6161ff; outline-offset: 2px; }
```

---

### Dropdown / Select Menu

**Bootstrap base:** `.dropdown`, `.dropdown-menu`, `.dropdown-item`

```html
<div class="dropdown">
  <button class="btn btn-outline-secondary dropdown-toggle p2p-dropdown-trigger" data-bs-toggle="dropdown">
    Chọn phương thức
  </button>
  <ul class="dropdown-menu p2p-dropdown-menu">
    <li><a class="dropdown-item p2p-dropdown-item" href="#">Zelle</a></li>
    <li><a class="dropdown-item p2p-dropdown-item active" href="#">MoMo</a></li>
  </ul>
</div>
```

```css
.p2p-dropdown-trigger.show,
.p2p-dropdown-trigger:focus { border-color: #6161ff !important;
                               box-shadow: 0 0 0 3px rgba(97,97,255,0.14) !important; }

.p2p-dropdown-menu {
  border: 1px solid #d0d4e4; border-radius: 12px !important;
  box-shadow: rgba(0,0,0,0.15) 0px 4px 40px 0px; padding: 6px;
}
.p2p-dropdown-item {
  font-family: var(--font-poppins); font-size: 14px;
  border-radius: 8px !important; padding: 8px 14px;
  color: #333333;
  transition: background-color var(--transition-fast);
}
.p2p-dropdown-item:hover  { background: #e7ecff; color: #6161ff; }
.p2p-dropdown-item.active { background: #6161ff !important; color: #ffffff !important; }
```

---

### Ticket Row (copy action)

```html
<div class="ticket-row">
  <span class="ticket-label">Memo bắt buộc</span>
  <div class="d-flex align-items-center gap-2">
    <span class="memo-box">RQ-7K2M9</span>
    <button class="btn btn-copy">Copy</button>
  </div>
</div>
```

```css
.ticket-row {
  transition: background-color var(--transition-fast);
  cursor: default;
}
.ticket-row.copyable        { cursor: pointer; }
.ticket-row.copyable:hover  { background: #f5f6f8; }
.ticket-row.copyable:active { background: #e7ecff; }
```

---

### Upload / Proof Drop Zone

```html
<div class="p2p-dropzone" tabindex="0" role="button" aria-label="Tải bằng chứng lên">
  <i class="bi bi-cloud-upload" style="font-size:32px;"></i>
  <span>Kéo thả hoặc bấm để chọn file</span>
</div>
```

```css
.p2p-dropzone {
  border: 1.5px dashed #dddfeb; border-radius: 12px;
  background: #f5f6f8; padding: 24px; text-align: center;
  color: #808080; cursor: pointer;
  transition: border-color var(--transition-base),
              background-color var(--transition-base),
              transform var(--transition-slow);
}
.p2p-dropzone:hover       { border-color: #6161ff; background: #e7ecff; color: #6161ff; }
.p2p-dropzone.drag-over   { border: 2px solid #6161ff; background: #dbdbff; transform: scale(1.01); }
.p2p-dropzone:focus-visible { outline: 2px solid #6161ff; outline-offset: 2px; }
.p2p-dropzone.uploaded    { border-color: #bcfe90; background: #f0fff4; color: #2a5c4e; }
```

---

### Countdown Badge

```html
<span class="countdown" id="countdown">48:12</span>
```

```css
.countdown {
  font-family: var(--font-poppins); font-size: 13px; font-weight: 500;
  background: #fff8e1; color: #f59e0b;
  border-radius: 160px; padding: 3px 12px;
  transition: background-color var(--transition-base), color var(--transition-base);
}
.countdown.warning { background: #fef3c7; color: #d97706; }
.countdown.urgent  { background: #fee2e2; color: #ef4444;
                     animation: p2p-pulse 1.2s ease-in-out infinite; }

@keyframes p2p-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.60; } }
```

---

### Link

```css
a.p2p-link, .p2p-link {
  color: #6161ff; text-decoration: none;
  transition: opacity var(--transition-fast);
}
a.p2p-link:hover        { text-decoration: underline; opacity: 0.82; }
a.p2p-link:active       { color: #4444c2; }
a.p2p-link:visited      { color: #9450fd; }
a.p2p-link:focus-visible { outline: 2px solid #6161ff; outline-offset: 2px; border-radius: 2px; }
```

---

### Quy tắc bắt buộc cho tất cả controls

1. **Không xóa `outline`** — thay bằng `outline: 2px solid #6161ff` + `outline-offset: 2px`
2. **Dùng `:focus-visible`** — tránh ring hiện khi click chuột
3. **Transition khai báo trên element** — không khai báo trong pseudo-class
4. **Disabled** — `pointer-events: none` + `opacity: 0.4`; không có hover/focus effect
5. **Touch target ≥ 44×44px** — icon button, checkbox, bottom nav item
6. **Active state** — `transform: scale(0.97–0.98)` để mobile cảm nhận được tap
7. **`!important` chỉ dùng để override Bootstrap** — không dùng trong logic nghiệp vụ

---

## Responsive & Breakpoints

Tính năng **3 bên (Requester · Provider · Admin) phải hoạt động tốt trên cả desktop lẫn mobile**.  
Dùng Bootstrap 5 breakpoints làm chuẩn, override bằng tokens khi cần.

### Breakpoint map

| Name | Bootstrap | Viewport | Layout chính |
|---|---|---|---|
| `xs` | default | < 576px | Mobile 1 cột — role switcher top |
| `sm` | `sm` | 576–767px | Mobile landscape — vẫn 1 cột |
| `md` | `md` | 768–1023px | Tablet — 2 cột hoặc collapsed sidebar |
| `lg` | `lg` | 1024–1279px | Desktop nhỏ — 2–3 cột phone frames |
| `xl` | `xl` | ≥ 1280px | Desktop đầy đủ — 3 cột song song |

### Demo layout (3 phone/panel frames)

```
Desktop ≥ 1024px:
┌─────────────────┬─────────────────┬──────────────────────┐
│  Requester      │  Provider       │  Admin Panel         │
│  (390×844)      │  (390×844)      │  (min 320px, flex)   │
└─────────────────┴─────────────────┴──────────────────────┘

Tablet 768–1023px:
┌─────────────────┬─────────────────┐
│  Requester      │  Provider       │
│  (320×auto)     │  (320×auto)     │
└─────────────────┴─────────────────┘
[ Admin: tab riêng hoặc panel dưới ]

Mobile < 768px:
┌────────────────────────────────────┐
│  [Requester] [Provider] [Admin]    │  ← role switcher tabs
│                                    │
│  Requester screen (active)         │
│  full-width, scroll-snap           │
└────────────────────────────────────┘
```

```css
/* 3-column demo wrapper */
.demo-wrapper {
  display: flex;
  gap: 32px;
  align-items: flex-start;
  justify-content: center;
  padding: 40px 20px;
  flex-wrap: wrap;          /* xuống dòng nếu không đủ chỗ */
}

/* Phone frame container */
.phone-shell {
  width: 390px;
  flex-shrink: 0;
}

/* Admin panel container */
.admin-panel {
  width: 100%;
  max-width: 480px;
  flex-shrink: 1;
}

/* Tablet: thu nhỏ phone frames */
@media (max-width: 1023px) {
  .phone-shell { width: 320px; }
  .admin-panel { max-width: 100%; order: 3; }
}

/* Mobile: role switcher + single column */
@media (max-width: 767px) {
  .demo-wrapper   { flex-direction: column; align-items: center; gap: 0; padding: 0; }
  .phone-shell    { width: 100%; max-width: 430px; border-radius: 0; border: none; }
  .role-switcher  { display: flex !important; } /* hiện tab switcher */
  .role-panel     { display: none; }
  .role-panel.active { display: block; }
}
```

### Requester & Provider (mobile-first)

```css
/* Sticky bottom CTA — không bị keyboard che */
.sticky-bottom {
  position: sticky;
  bottom: 0;
  /* env() xử lý safe-area trên iPhone notch */
  padding-bottom: max(24px, env(safe-area-inset-bottom));
}

/* Touch target tối thiểu 44×44px */
.btn, .p2p-nav-item, .form-check-input-wrap {
  min-height: 44px;
  min-width: 44px;
}

/* Memo không được wrap */
.memo-box {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

### Admin Console (desktop-first, có responsive)

```css
/* Sidebar layout */
.admin-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
}

/* Tablet: sidebar icon-only */
@media (max-width: 1023px) {
  .admin-layout { grid-template-columns: 56px 1fr; }
  .admin-sidebar-label { display: none; }
}

/* Mobile: sidebar ẩn, hamburger menu */
@media (max-width: 767px) {
  .admin-layout { grid-template-columns: 1fr; }
  .admin-sidebar { display: none; }
  .admin-sidebar.open { display: block; position: fixed; z-index: 1000;
                         width: 240px; height: 100vh; top: 0; left: 0; }
}

/* Bảng dữ liệu: horizontal scroll trên mobile */
.admin-table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.admin-table { min-width: 640px; }

/* Admin Decision Panel (R1-R4) */
.decision-panel {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
@media (max-width: 767px) {
  .decision-panel { grid-template-columns: 1fr; }
}
```

### Chat 3 bên

| Viewport | Layout |
|---|---|
| Desktop ≥ 1024px | Side panel 360px, fixed bên phải màn request detail |
| Tablet 768–1023px | Drawer từ bottom, height 60vh |
| Mobile < 768px | Full-screen overlay, back button để thoát |

```css
.chat-panel { /* desktop side panel */
  width: 360px;
  position: sticky;
  top: 0;
  height: 100vh;
  border-left: 1px solid var(--color-pebble);
}
@media (max-width: 1023px) {
  .chat-panel { width: 100%; height: 60vh; position: fixed; bottom: 0; left: 0;
                border-radius: 24px 24px 0 0; border-left: none;
                border-top: 1px solid var(--color-pebble); }
}
@media (max-width: 767px) {
  .chat-panel { height: 100vh; border-radius: 0; }
}
```

### Quy tắc responsive bắt buộc

1. **Không có content bị cắt** — mọi text, button, card hiển thị đầy đủ ở 320px width
2. **Không horizontal scroll** ngoài bảng dữ liệu (dùng `overflow-x: auto` có wrapper)
3. **Font size tối thiểu 12px** — memo/ref code không được wrap xuống dòng
4. **Notification toast/banner** ≤ 100% width; không che CTA sticky bottom
5. **Keyboard trên mobile** không được đẩy sticky CTA ra ngoài viewport — dùng `env(safe-area-inset-bottom)`
6. **Admin case vẫn đọc được trên mobile** — dù thiếu sidebar, nội dung chính (dispute detail, evidence, decision) vẫn accessible

---

## UX Rules bắt buộc

1. **Ai đang cầm lượt** — App Header (detail) luôn có: status badge + tên actor + countdown SLA
2. **Một CTA chính** — Sticky bottom, pill `#6161ff`; CTA phụ không cạnh tranh thị giác
3. **Confirm 2 bước** — Alert Dialog trước mọi action không đảo ngược (accept, complete, resolve, delete)
4. **Memo nổi bật** — mono bold 18–20px, background `#f5f6f8`, copy riêng + copy all
5. **Masking mặc định** — số tài khoản/SĐT `••••1234`; unmask chỉ khi đúng bước cần hành động
6. **Fee tách 3 dòng** — "Số tiền chuyển" / "Phí nền tảng" / "Tổng chi phí" — không gộp
7. **Không ngõ cụt** — rejected/expired/no deal luôn có CTA phục hồi với text rõ ràng
8. **Error rõ cách sửa** — "Thiếu tài khoản Zelle để đăng deal — Thêm tài khoản"

---

## Do's and Don'ts

### Do
- Dùng **160px border-radius** cho tất cả button và CTA — pill shape là chữ ký
- Reserve `#6161ff` cho primary action; pastel chỉ dùng cho card surface
- Font Poppins weight 300 cho display headline; weight 500–600 cho UI label; weight 700 cho memo/ref
- `24px radius` cho card, `6px` cho badge/input — giữ 2 tier này nhất quán
- Shadow `rgba(205,208,223,0.4) 0 2px 48px` — một lớp shadow nhẹ; không stack shadow

### Don't
- Không dùng square hay `4px-radius` button
- Không dùng pastel làm text color, border color, hay icon color
- Không dùng `#000000` thuần cho text lớn — dùng `#333333`
- Không hiển thị tài khoản/SĐT đầy đủ khi không ở bước cần thanh toán
- Không bỏ text label trên Status Badge — màu không đủ để truyền nghĩa
- Không tự completed ở `transfer_sent` — phải có xác nhận Requester
