---
description: P2P Remit Deals — project context, actors, reference docs, and current implementation scope. Always apply for any task in this repo.
alwaysApply: true
---

# Project Overview

**P2P Remit Deals** là nền tảng chuyển tiền ngang hàng với 2 loại tài khoản:
- **Member** — tài khoản tự đăng ký, có thể giữ vai **Requester** (KYC T1+), vai **Provider** (KYC T2), hoặc cả hai cùng lúc (dual-role, KYC T2)
- **Admin** — tài khoản nội bộ do platform cấp, không tự đăng ký

Các vai trong Member:
- **Requester** — gửi tiền cho người thụ hưởng (Beneficiary) qua Provider
- **Provider** — cung cấp thanh khoản, niêm yết deal tỷ giá và thực hiện chi trả
- **Platform/System** — tạo niềm tin bằng KYC, ký quỹ Provider, ledger, proof, memo, SLA, Admin phân xử, chat, rating

Dòng tiền giao dịch chính **chạy ngoài hệ thống** qua Zelle, Venmo, PayPal, MoMo, ZaloPay, Bank Transfer. Platform giữ tiền thật chỉ để ký quỹ Provider và thực thi phán quyết tranh chấp.

## Tài liệu nghiệp vụ cốt lõi

Đọc trước khi thay đổi bất kỳ logic nghiệp vụ nào:

| Tài liệu | Nội dung |
|---|---|
| [BA Final v4.0](../../src/docs/P2P_Remit_Deals_BA_Final_v4.0.md) | State machine, ledger, fee, SLA, dispute, KYC, invariants |
| [UX/UI Spec v4.0](../../src/docs/P2P_Remit_Deals_UX_UI_Spec_v4.0.md) | Design principles, component inventory, screen mapping |
| [UI Text Wireframes v4.0](../../src/docs/P2P_Remit_Deals_UI_Text_Wireframes_v4.0.md) | Wireframe text từng màn hình theo role |

## Loại tài khoản, vai và navigation

| Loại tài khoản | KYC | Kênh chính | Cấu trúc điều hướng | Breakpoint |
|---|---|---|---|---|
| **Member** (KYC T1) | T1 | Mobile app | 1 tab chính **Yêu cầu** + bottom nav Requester | 320px+ |
| **Member** (KYC T2 — dual-role) | T2 | Mobile app | 2 tab chính **Yêu cầu** \| **Tạo deal** + bottom nav đổi theo tab | 320px+ |
| **Admin** | N/A (nội bộ) | Desktop web | Sidebar: Disputes · Users · Deals · Ledger · Risk · Config | 768px+ |

> **Admin account** được platform cấp nội bộ, không đi qua luồng đăng ký/KYC của Member.

### Cấu trúc tab trong Member app

Member app chia theo **tính năng**, không theo vai tĩnh. Thanh tab nằm ở vị trí nổi bật (top bar hoặc segment control dưới header), cho phép Member chuyển đổi giữa hai nhóm chức năng:

| Tab | Hiện với | Chức năng | Bottom nav |
|---|---|---|---|
| **Yêu cầu** | Mọi Member (KYC T1+) | Gửi tiền → chọn deal → tạo request → theo dõi → xác nhận hoàn tất | Gửi tiền · Yêu cầu · Liên kết · Hồ sơ |
| **Tạo deal** | Member KYC T2 (dual-role) | Quản lý deal → nhận request → xác nhận nhận tiền → chi trả → quản lý ví | Trang chủ · Deals · Yêu cầu · Ví/Hồ sơ |

**Quy tắc hiển thị tab:**
- Member KYC T1: chỉ thấy tab **Yêu cầu**; không hiển thị tab "Tạo deal" (không bị ẩn xám — đơn giản là không tồn tại trong nav).
- Member KYC T2: thấy cả 2 tab; tab **Tạo deal** mở khóa tự động sau khi KYC T2 được duyệt.
- Khi đang có giao dịch active ở một tab, CTA khởi tạo giao dịch mới ở tab kia bị block kèm deep-link đến giao dịch đang dở (INV-11).

## Yêu cầu 3-party responsive

**Tính năng 3 bên (Requester · Provider · Admin) phải hoạt động tốt trên cả desktop lẫn mobile.**

### Demo layout (`App.tsx` và `src/html/`)

| Viewport | Layout |
|---|---|
| **Desktop** ≥ 1024px | 3 cột song song: [Member app — tab Yêu cầu] [Member app — tab Tạo deal] [Admin panel] |
| **Tablet** 768–1023px | 2 cột: [Member app (Yêu cầu + Tạo deal)] / [Admin] hoặc tab switcher |
| **Mobile** < 768px | 1 cột + tab switcher ở top để chuyển giữa Yêu cầu · Tạo deal · Admin |

### Requester & Provider (mobile-first)
- Toàn bộ màn hình thiết kế theo chiều dọc 390×844px (iPhone 14 reference)
- Sticky bottom CTA luôn visible — không bị keyboard che
- Touch target ≥ 44×44px cho tất cả button và interactive element
- Font size tối thiểu 12px; memo/ref code không được wrap

### Admin console (desktop-first, có responsive)
- Layout chính: sidebar 240px + main content area
- Tại tablet (768px): sidebar collapse thành icon-only 56px; main content expand
- Tại mobile (< 768px): sidebar ẩn, top bar với hamburger menu; dispute case vẫn đọc được
- Bảng dữ liệu (dispute queue, ledger): horizontal scroll trên mobile thay vì hide columns
- Admin decision panel (R1-R4): stack vertical trên mobile, side-by-side trên desktop

### Shared constraints (tất cả 3 bên)
- Không có content bị cắt hay overflow ẩn ở bất kỳ breakpoint nào
- Scroll là linear vertical — không có horizontal scroll ngoài bảng dữ liệu
- Notification toast/banner: hiển thị ≤ 320px width; không che CTA chính
- Chat 3 bên: full-screen overlay trên mobile; side panel trên desktop ≥ 1024px

`App.tsx` hiển thị tối đa 3 phone/panel frame song song trên desktop. State được lift lên `App.tsx` và truyền xuống cả 3 app. Trên mobile, `App.tsx` dùng tab switcher hoặc scroll snap để chuyển giữa các bên.

## Nền tảng triển khai — Web App

**Đây là ứng dụng web app chạy hoàn toàn trên trình duyệt** — không phải native app. Toàn bộ `src/html/` phải chạy mượt mà trên mọi thiết bị và kích thước màn hình.

### Target platforms

| Thiết bị | Viewport điển hình | Yêu cầu |
|---|---|---|
| **Desktop / Laptop** | ≥ 1024px | Layout đầy đủ 3 cột; Admin console sidebar visible |
| **Tablet** (iPad, Android tablet) | 768–1023px | Layout 2 cột hoặc tab switcher; Admin có thể collapse sidebar |
| **Mobile** (smartphone) | 320–767px | Single column; role switcher; bottom nav; sticky CTA |
| **Mobile nhỏ** | 320px | Minimum supported width; không overflow, không clip text |

### Web app performance rules

- **Không dùng framework hay bundler cho `src/html/`** — pure HTML + Bootstrap 5 CDN + vanilla JS
- **Mọi trang phải load và tương tác được ngay cả khi offline mock data** — không gọi API thật
- **Touch & click đều phải hoạt động** — không dùng `hover`-only pattern làm trigger chính
- **Không có horizontal scroll** ngoài bảng dữ liệu — content luôn fit viewport width
- **Font size tối thiểu 12px** — không để text nhỏ hơn trên mobile
- **Tap target ≥ 44×44px** — mọi button/link phải đủ rộng để tap ngón tay
- **Keyboard navigation** — mọi interactive element phải có `:focus-visible` state rõ ràng
- **Không dùng `position: fixed` che content chính** — sticky bottom CTA phải dùng `padding-bottom` trên scroll container để tránh che nội dung cuối

### HTML screen pattern

Mỗi file trong `src/html/` là một màn hình độc lập:
```html
<!-- Load order bắt buộc -->
<link rel="stylesheet" href="bootstrap.min.css" />   <!-- Bootstrap 5 CDN -->
<link rel="stylesheet" href="bootstrap-icons.css" /> <!-- Bootstrap Icons CDN -->
<link rel="stylesheet" href="theme.css" />           <!-- Design tokens + component overrides -->

<script src="mock-data.js"></script>                 <!-- Mock data — load trước script màn hình -->
```

**Không dùng `phone-shell` / `phone-screen`** — Bỏ hoàn toàn khung điện thoại giả lập. Mỗi màn hình là trang Bootstrap thực sự:
- Layout dùng `container` (hoặc `container-md`) + `row` / `col-*` grid
- Topbar: `<nav class="topbar">` với brand icon và tiêu đề màn hình
- Role cards / content cards: `col-md-6` / `col-lg-4` — 2–3 cột trên desktop, stack 1 cột trên mobile
- Không có `body { display:flex; justify-content:center }` để căn giữa phone frame

---

## Mặc định mock data — KYC

**Tất cả tài khoản trong mock data mặc định đã KYC đầy đủ:**
- Requester: KYC T1 đã xác minh
- Provider: KYC T2 đã xác minh (đủ điều kiện đăng deal và nhận yêu cầu)
- Admin: không cần KYC

Khi xây dựng màn hình mới không cần thêm luồng KYC chưa hoàn thành trừ khi màn hình đó đặc biệt demo trạng thái chưa KYC (như C-02 demo state toggle).

---

## Phạm vi hiện tại (prototype/mock)

Dự án là **UI prototype** với mock data tĩnh — **chưa có backend thật**. Chưa implement:
- Backend API, ledger engine, SLA scheduler
- KYC flow thật
- Provider wallet thật + collateral lock/unlock
- Admin dispute console
- Chat 3 bên, rating double-blind, notification system

Khi thêm tính năng mới, bám theo `src/docs/` — đặc biệt **Hard Release Gates (G0–G8)** trong BA v4.0 §2.3 trước khi xử lý giao dịch tiền thật.
