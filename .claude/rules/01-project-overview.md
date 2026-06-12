---
description: P2P Remit Deals — project context, actors, reference docs, and current implementation scope. Always apply for any task in this repo.
alwaysApply: true
---

# Project Overview

**P2P Remit Deals** là nền tảng chuyển tiền ngang hàng kết nối:
- **Requester** — người có nhu cầu gửi tiền cho người thụ hưởng (Beneficiary)
- **Provider** — người có thanh khoản ở hai đầu, niêm yết deal tỷ giá và thực hiện chi trả
- **Platform** — tạo niềm tin bằng KYC, ký quỹ Provider, ledger, proof, memo, SLA, Admin phân xử, chat, rating

Dòng tiền giao dịch chính **chạy ngoài hệ thống** qua Zelle, Venmo, PayPal, MoMo, ZaloPay, Bank Transfer. Platform giữ tiền thật chỉ để ký quỹ Provider và thực thi phán quyết tranh chấp.

## Tài liệu nghiệp vụ cốt lõi

Đọc trước khi thay đổi bất kỳ logic nghiệp vụ nào:

| Tài liệu | Nội dung |
|---|---|
| [BA Final v4.0](../../src/docs/P2P_Remit_Deals_BA_Final_v4.0.md) | State machine, ledger, fee, SLA, dispute, KYC, invariants |
| [UX/UI Spec v4.0](../../src/docs/P2P_Remit_Deals_UX_UI_Spec_v4.0.md) | Design principles, component inventory, screen mapping |
| [UI Text Wireframes v4.0](../../src/docs/P2P_Remit_Deals_UI_Text_Wireframes_v4.0.md) | Wireframe text từng màn hình theo role |

## Actors và navigation

| Role | Kênh chính | Navigation | Breakpoint tối thiểu |
|---|---|---|---|
| **Requester** | Mobile app | Bottom tabs: Gửi tiền · Yêu cầu · Liên kết · Hồ sơ | 320px+ |
| **Provider** | Mobile app | Bottom tabs: Trang chủ · Deals · Yêu cầu · Ví/Hồ sơ | 320px+ |
| **Admin/Trọng tài** | Desktop web | Sidebar: Disputes · Users · Deals · Ledger · Risk · Config | 768px+ (tablet minimum) |

## Yêu cầu 3-party responsive

**Tính năng 3 bên (Requester · Provider · Admin) phải hoạt động tốt trên cả desktop lẫn mobile.**

### Demo layout (`App.tsx` và `src/html/`)

| Viewport | Layout |
|---|---|
| **Desktop** ≥ 1024px | 3 cột song song: [Requester phone] [Provider phone] [Admin panel] |
| **Tablet** 768–1023px | 2 cột: [Requester + Provider] / [Admin] hoặc tab switcher |
| **Mobile** < 768px | 1 cột + role switcher ở top để chuyển giữa 3 bên |

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

## Phạm vi hiện tại (prototype/mock)

Dự án là **UI prototype** với mock data tĩnh — **chưa có backend thật**. Chưa implement:
- Backend API, ledger engine, SLA scheduler
- KYC flow thật
- Provider wallet thật + collateral lock/unlock
- Admin dispute console
- Chat 3 bên, rating double-blind, notification system

Khi thêm tính năng mới, bám theo `src/docs/` — đặc biệt **Hard Release Gates (G0–G8)** trong BA v4.0 §2.3 trước khi xử lý giao dịch tiền thật.
