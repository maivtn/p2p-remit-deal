# P2P REMIT DEALS — Tài liệu mô tả ứng dụng

> Demo/prototype nền tảng **chuyển tiền ngang hàng (P2P Remittance)**: kết nối người cần chuyển tiền xuyên biên giới (Requester) với nhà cung cấp tỷ giá (Provider). Dự án được xuất từ Figma Make ([link thiết kế gốc](https://www.figma.com/design/9HOF797jP2AXkgrDK1DZ7R/P2P-REMIT-DEALS)), chạy hoàn toàn ở phía client với dữ liệu mock — chưa có backend.

---

## 1. Tổng quan

Ứng dụng mô phỏng **hai điện thoại đặt cạnh nhau trên cùng một màn hình**, chia sẻ chung một state (real-time shared state):

- 📱 **Bên trái — Nhà cung cấp (Provider)**: đăng deal tỷ giá, nhận và xử lý yêu cầu chuyển tiền.
- 📱 **Bên phải — Người dùng (Requester)**: tìm deal phù hợp, gửi yêu cầu, thanh toán và xác nhận.
- 🔄 **SyncBridge ở giữa**: hiệu ứng "LIVE SYNC" nhấp nháy mỗi khi một bên thao tác — bên kia cập nhật ngay lập tức.
- 📊 **Footer thống kê**: số deal đang hoạt động, số request đang xử lý, số giao dịch hoàn thành.

**Bài toán nghiệp vụ:** Người Việt ở nước ngoài (Mỹ, EU, Nhật, Hàn, Sing...) muốn chuyển tiền về Việt Nam (hoặc giữa các cặp tiền tệ khác). Thay vì qua dịch vụ truyền thống, họ tìm Provider trên marketplace — người chấp nhận nhận tiền qua Zelle/Venmo/PayPal... ở nước ngoài và chuyển trả VND qua MoMo/ZaloPay/chuyển khoản ngân hàng cho người thụ hưởng tại Việt Nam, theo tỷ giá Provider tự niêm yết. Hệ thống đóng vai trò trung gian với cơ chế **escrow + phí nền tảng 0,5%** và **chuỗi bằng chứng (proof chain)** cho từng bước.

---

## 2. Công nghệ sử dụng

| Hạng mục | Công nghệ |
|---|---|
| Framework | React 18.3 + TypeScript |
| Build tool | Vite 6.3 (`npm run dev` / `npm run build`) |
| Styling | Tailwind CSS 4 (plugin `@tailwindcss/vite`) + inline style |
| UI kit | Bộ component shadcn/ui (Radix UI) tại `src/app/components/ui/` + MUI (đã khai báo dependency) |
| Animation | `motion` (framer-motion) — hiệu ứng fade/slide cho card, tab, modal |
| Icon | `lucide-react` + ảnh PNG logo các ví thanh toán (`src/images/`) |
| Khác | react-hook-form, recharts, sonner (toast), react-router (chưa dùng routing thực tế) |

Alias `@` → `src/` (cấu hình trong [vite.config.ts](vite.config.ts)).

---

## 3. Cấu trúc thư mục

```
p2p/
├── index.html                  # Entry HTML
├── src/
│   ├── main.tsx                # Mount React vào #root
│   ├── app/
│   │   ├── App.tsx             # Layout 2 điện thoại + shared state + sync
│   │   ├── components/
│   │   │   ├── RoleSelection.tsx       # Màn chọn vai trò (không dùng trong layout 2 máy)
│   │   │   ├── provider/ProviderApp.tsx    # Toàn bộ app phía Provider (~3.400 dòng)
│   │   │   ├── requester/RequesterApp.tsx  # Toàn bộ app phía Requester (~2.300 dòng)
│   │   │   ├── shared/
│   │   │   │   ├── ProofModal.tsx      # Upload/hiển thị bằng chứng, escrow banner, step progress
│   │   │   │   ├── RecipientDetails.tsx # Hiển thị thông tin người thụ hưởng
│   │   │   │   └── MethodIcon.tsx      # Icon phương thức thanh toán (ảnh PNG / emoji)
│   │   │   ├── figma/ImageWithFallback.tsx
│   │   │   └── ui/                     # ~45 component shadcn/ui
│   │   ├── data/
│   │   │   ├── mockData.ts     # Toàn bộ model + dữ liệu mẫu (deal, request, tài khoản, ví)
│   │   │   └── paymentIcons.ts # Map methodId → ảnh PNG logo ví
│   │   └── images/             # Logo Zelle, Venmo, PayPal, MoMo, Alipay, KakaoPay...
│   └── styles/                 # index.css, tailwind.css, theme.css, fonts.css
├── guidelines/Guidelines.md    # Template guideline của Figma Make (chưa điền)
├── accounts_modal.tsx          # ⚠️ File nháp ở root (bản copy PaymentAccountsModal)
└── tmp_modal.tsx               # ⚠️ File nháp ở root (bản copy PaymentAccountsModal)
```

---

## 4. Mô hình dữ liệu chính ([mockData.ts](src/app/data/mockData.ts))

### 4.1. `Deal` — Deal tỷ giá do Provider niêm yết
| Trường | Ý nghĩa |
|---|---|
| `fromCurrency` / `toCurrency` | Cặp tiền tệ (vd: USD → VND) |
| `rate` | Tỷ giá Provider đưa ra |
| `minAmount` / `maxAmount` | Hạn mức giao dịch |
| `status` | `active` \| `paused` \| `expired` |
| `senderPaymentMethods` | Cách Provider **nhận** tiền từ người gửi (Zelle, Venmo...) |
| `recipientPaymentMethods` | Cách Provider **chuyển** cho người thụ hưởng (MoMo, bank...) |
| `transferTime`, `expiresAt`, `notes` | Thời gian xử lý, hạn deal, ghi chú |
| `providerName/Rating/Reviews/Verified` | Thông tin uy tín Provider |

### 4.2. `DealRequest` — Yêu cầu giao dịch của Requester
Chứa: số tiền gửi/nhận, tỷ giá chốt, phương thức 2 đầu, **thông tin người thụ hưởng** (tên, SĐT, ngân hàng, số tài khoản, địa chỉ), **thông tin tài khoản nhận tiền của Provider** (để Requester chuyển khoản), `memo` đối soát, **phí hệ thống** (`systemFeeRate`, `systemFeeAmount`), cờ `escrowLocked`, **chuỗi bằng chứng** (`paymentProof`, `transferProof`, `disputeProof`) và trạng thái `TxStatus`.

### 4.3. `TxStatus` — Trạng thái giao dịch
`pending` · `waiting_accept` · `accepted` · `payment_sent` · `payment_confirmed` · `transfer_sent` · `completed` · `rejected` · `cancelled` · `disputed`

### 4.4. `ProofData` — Bằng chứng
`type`, `label`, `icon`, `fakeRef` (mã tham chiếu giả lập, vd `REF-ABC12XYZ`), `note`, `timestamp`, `mediaFiles[]` (ảnh/video/audio).

### 4.5. `ProviderAccount` — Tài khoản thanh toán đã lưu
Dùng chung cho cả 2 vai trò: `methodId`, `currency`, `label`, và các trường tùy phương thức (`phone`, `email`, `handle`, `bankName`, `accountNumber`, `accountName`).

### 4.6. Tiền tệ & phương thức thanh toán hỗ trợ
- **10 tiền tệ:** VND 🇻🇳, USD 🇺🇸, EUR 🇪🇺, GBP 🇬🇧, JPY 🇯🇵, KRW 🇰🇷, AUD 🇦🇺, SGD 🇸🇬, THB 🇹🇭, CNY 🇨🇳.
- **Phương thức theo tiền tệ** (`PAYMENT_METHODS_BY_CURRENCY`):

| Tiền tệ | Phương thức |
|---|---|
| USD | Zelle, Venmo, PayPal, Bank Transfer |
| EUR | PayPal, SEPA, Bank Transfer |
| GBP | PayPal, Bank Transfer |
| SGD | PayNow, Bank Transfer |
| AUD | PayID, PayPal, Bank Transfer |
| JPY | PayPay, Bank Transfer |
| KRW | KakaoPay, Bank Transfer |
| THB | PromptPay, Bank Transfer |
| CNY | WeChat Pay, Alipay, Bank Transfer |
| VND | MoMo, ZaloPay, Chuyển khoản NH |

Mỗi phương thức có cờ `requiresPhone` (cần SĐT/email) hoặc `requiresAccount` (cần ngân hàng + số TK) — quyết định form nhập thông tin người thụ hưởng/tài khoản hiển thị trường nào.

---

## 5. Vòng đời giao dịch (State machine)

```
  Requester gửi yêu cầu
          │
          ▼
  pending / waiting_accept ──── Provider "Từ chối" ──────► rejected
          │                └─── Requester "Hủy yêu cầu" ──► cancelled
          │ Provider "Chấp nhận"
          │ (chốt phí 0,5% + khóa escrow)
          ▼
       accepted          ◄── Requester xem TK nhận tiền của Provider + memo đối soát
          │ Requester chuyển tiền & "Xác nhận đã gửi tiền & tải bằng chứng" (ProofModal)
          ▼
     payment_sent        ◄── Provider xem paymentProof
          │ Provider "Xác nhận đã nhận đủ tiền"
          ▼
   payment_confirmed     ◄── Provider chuyển tiền cho người thụ hưởng (kèm memo)
          │ Provider "Đã chuyển — Upload bằng chứng" (ProofModal)
          ▼
     transfer_sent       ◄── Requester xem transferProof
          │ Requester "Đã nhận đủ tiền — Hoàn tất"
          ▼
      completed          ✅ Trừ phí nền tảng, giải phóng escrow

  ⚠️ disputed: từ payment_sent / payment_confirmed / transfer_sent,
     một trong hai bên bấm "Khiếu nại" → upload ghi chú + bằng chứng
     → lưu disputedBy, disputeNote, disputeProof, disputedAt
```

**Nhãn trạng thái hiển thị (tiếng Việt):** Chờ chấp nhận → Chờ thanh toán → Chờ xác nhận → Đang chuyển tiền → Chờ hoàn tất → Hoàn thành / Từ chối / Đã hủy / Khiếu nại.

---

## 6. Ứng dụng phía Provider ([ProviderApp.tsx](src/app/components/provider/ProviderApp.tsx))

Màu chủ đạo: **xanh dương `#2563EB`**. Điều hướng 4 tab dưới đáy:

### 6.1. Tab Trang chủ (Home)
- Dashboard: thu nhập trong ngày, số deal đang mở, số giao dịch hoàn thành (248), điểm đánh giá (4.9★).
- Nút thao tác nhanh + danh sách các yêu cầu `pending` mới nhất.

### 6.2. Tab Deals — Quản lý deal
- Lọc theo trạng thái: tất cả / hoạt động / tạm dừng / hết hạn.
- **Tạo deal (CreateDealModal)** với các trường: cặp tiền tệ, tỷ giá (kèm tỷ giá thị trường tham khảo), min/max, phương thức nhận tiền & chuyển tiền (multi-select, bắt buộc ≥1 mỗi bên), thời gian chuyển (`30-60 phút` → `Trong 24 giờ`), hiệu lực deal (7/14/30 ngày), ghi chú.
- Validation: tỷ giá/min/max là số hợp lệ, min < max.
- Thao tác: tạo / tạm dừng ↔ kích hoạt lại / xóa.

### 6.3. Tab Yêu cầu (Requests)
- Danh sách card yêu cầu, badge đỏ đếm số `pending` trên tab; yêu cầu mới đến có nhãn **"🔔 MỚI"** nhấp nháy.
- **Màn chi tiết giao dịch** với thanh tiến trình từng bước (StepProgress), khu vực bằng chứng 2 chiều, thông tin người thụ hưởng (thu gọn/mở rộng) và nút hành động theo trạng thái:
  - `pending`: **Từ chối** / **Chấp nhận** (modal xác nhận, chốt phí + khóa escrow).
  - `payment_sent`: **Xác nhận đã nhận đủ [số tiền]**.
  - `payment_confirmed`: banner hướng dẫn chuyển tiền (tên người nhận, phương thức, **memo đối soát có nút copy**) + nút **Đã chuyển — Upload bằng chứng**.
  - `transfer_sent`: chờ Requester xác nhận; có nút **Khiếu nại**.

### 6.4. Tab Hồ sơ (Profile)
- Thống kê: tổng giao dịch, giao dịch tháng này, tỷ lệ hoàn thành.
- **Quản lý tài khoản thanh toán** (CRUD): nhóm theo tiền tệ; form động theo phương thức (Venmo → handle, Zelle/MoMo → SĐT, bank → ngân hàng + số TK + chủ TK); nút copy nhanh từng trường.
- Menu: lịch sử giao dịch, cài đặt thông báo, bảo mật (placeholder).

---

## 7. Ứng dụng phía Requester ([RequesterApp.tsx](src/app/components/requester/RequesterApp.tsx))

Màu chủ đạo: **xanh lục `#059669`**. Điều hướng 4 tab: **Gửi tiền · Yêu cầu · Liên kết · Hồ sơ**.

### 7.1. Tab Gửi tiền — wizard 3 bước

**Bước 1 — Nhập nhu cầu (NeedForm):**
- Chọn tiền tệ gửi + số tiền → chọn tiền tệ nhận (lọc theo cặp có tỷ giá) → xem **tỷ giá ước tính + số tiền nhận được** real-time.
- Chọn phương thức gửi và phương thức nhận (chip selector theo tiền tệ).
- Nhập thông tin người thụ hưởng — form thích ứng theo phương thức: tên (bắt buộc), SĐT (nếu `requiresPhone`), ngân hàng (dropdown sẵn các bank VN: Vietcombank, Techcombank, MB Bank, BIDV...), số tài khoản (nếu `requiresAccount`), địa chỉ (tùy chọn).
- Có thể **chọn nhanh từ tài khoản đã liên kết** (lọc theo tiền tệ + phương thức).
- Ghi chú cho nhà cung cấp.

**Bước 2 — Kết quả deal (DealResults):**
- Lọc deal `active` đúng cặp tiền tệ và số tiền nằm trong [min, max].
- **Chấm điểm khớp**: khớp cả 2 phương thức +20đ, mỗi phương thức +10đ; sắp xếp theo điểm rồi tỷ giá tốt nhất. Deal "Khớp hoàn toàn" được highlight.
- Card deal: avatar + tên + badge xác minh + đánh giá ★ + số GD hoàn thành + tỷ giá + số tiền nhận + phương thức (highlight xanh nếu trùng lựa chọn) + thời gian chuyển + ghi chú.
- Hiển thị thêm nhóm "deal lân cận" (khác hạn mức) làm tham khảo.

**Bước 3 — Xác nhận (ConfirmRequest):**
- Tổng hợp: provider, sơ đồ luồng tiền (gửi → nhận), tỷ giá, thông tin người thụ hưởng, ghi chú (sửa được).
- **Gửi yêu cầu** → tạo `DealRequest` với `status: waiting_accept`, phí 0,5% → tự chuyển sang tab Yêu cầu.

### 7.2. Tab Yêu cầu (My Requests)
- 4 bộ lọc kèm đếm số: **Đang xử lý / Chờ chấp nhận / Hoàn thành / Từ chối-Khiếu nại**.
- Màn chi tiết theo trạng thái:
  - `waiting_accept`: chờ provider, có nút **Hủy yêu cầu**.
  - `accepted`: banner **"Bước 1: Gửi tiền cho nhà cung cấp"** — hiện đầy đủ tài khoản nhận tiền của Provider (copy từng trường) + **memo bắt buộc ghi khi chuyển khoản** → nút **Xác nhận đã gửi tiền & tải bằng chứng** (mở ProofModal).
  - `payment_sent` / `payment_confirmed`: hiển thị bằng chứng + banner chờ.
  - `transfer_sent`: xem bằng chứng Provider đã chuyển → nút **Đã nhận đủ tiền — Hoàn tất**.
  - `completed`: 🎉 hoàn tất, hiển thị phí hệ thống 0,5% và thông báo giải phóng escrow.
  - Nút **⚠️ Khiếu nại** khả dụng khi đã có bằng chứng thanh toán.

### 7.3. Tab Liên kết (Accounts)
CRUD tài khoản thanh toán cá nhân, giống phía Provider: nhóm theo tiền tệ, form động theo phương thức, copy nhanh, xác nhận trước khi xóa.

### 7.4. Tab Hồ sơ
Avatar + badge xác minh, đánh giá 4.7★ (12 đánh giá), thống kê giao dịch, menu cài đặt (placeholder), nút Đăng xuất.

---

## 8. Thành phần dùng chung ([shared/](src/app/components/shared/))

| Component | Vai trò |
|---|---|
| **ProofModal** | Modal upload bằng chứng (kéo-thả, tối đa 10 file ảnh/video/audio), ô ghi chú, sinh mã tham chiếu `REF-XXXXXXXX`; chế độ `isDispute` cho khiếu nại. Kèm **Lightbox** xem media toàn màn hình (điều hướng, zoom, player audio/video). |
| **ProofCard** | Hiển thị bằng chứng read-only: icon, nhãn, mã tham chiếu, badge SUCCESS, timestamp, ghi chú, lưới thumbnail. |
| **TransactionProofSections** | 2 khối thu gọn/mở rộng: "Bằng chứng thanh toán" (xanh dương) và "Bằng chứng chuyển tiền" (xanh lục) — tự mở theo trạng thái giao dịch. |
| **StepProgress** | Thanh tiến trình các bước giao dịch trong màn chi tiết. |
| **EscrowBanner** | Banner 🔒 hiển thị số tiền đang khóa escrow (hiện đang ẩn trong UI). |
| **RecipientDetails** | Hiển thị người thụ hưởng (tên/SĐT/bank/số TK/địa chỉ), 2 chế độ `inline`/`stacked`, ẩn-hiện trường theo phương thức. |
| **MethodIcon** | Icon phương thức: ưu tiên ảnh PNG trong [paymentIcons.ts](src/app/data/paymentIcons.ts) (Zelle, Venmo, PayPal, MoMo... ), fallback emoji. |

---

## 9. Phí & Escrow

- **Phí hệ thống:** `systemFeeRate = 0.005` (**0,5%**), chốt tại thời điểm Provider chấp nhận yêu cầu. Cả người gửi và Provider đều chịu 0,5% (hiển thị trong modal chấp nhận và màn hoàn tất).
- **Escrow:** `escrowLocked = true` ngay khi chấp nhận; giải phóng khi `completed`. Ví mock: Provider có USD 18.500 / VND 480tr / EUR 6.200; Requester có USD 4.800 (`PROVIDER_WALLET_INIT`, `REQUESTER_WALLET_INIT`).
- **Memo đối soát:** mỗi giao dịch có mã tham chiếu (mặc định là request ID) — cả 2 bên được nhắc ghi đúng memo khi chuyển khoản để đối soát.

---

## 10. Cách chạy

```bash
npm i          # cài dependency
npm run dev    # chạy dev server (Vite)
npm run build  # build production → dist/
```

Mở trình duyệt theo địa chỉ Vite in ra (mặc định `http://localhost:5173`). Màn hình cần rộng tối thiểu ~860px để hiển thị đủ 2 điện thoại.

---

## 11. Hạn chế & lưu ý hiện tại

1. **Không có backend** — toàn bộ dữ liệu là mock trong [mockData.ts](src/app/data/mockData.ts), state nằm trong React (mất khi reload). "Real-time sync" thực chất là 2 component cùng đọc một state ở [App.tsx](src/app/App.tsx).
2. **Thời gian bị neo cứng**: `NOW = 2026-02-26` trong `timeAgo()` và ngày hết hạn deal — cần thay bằng thời gian thực khi tích hợp backend.
3. **Bằng chứng là giả lập**: mã tham chiếu `fakeRef` sinh ngẫu nhiên, file media chỉ lưu bằng object URL trong phiên.
4. **Một số mục là placeholder**: lịch sử giao dịch, cài đặt thông báo, bảo mật, đăng xuất.
5. **Cờ tính năng trong ProviderApp**: `SHOW_PENDING_FEE_ESCROW_INFO`, `SHOW_REQUESTER_MESSAGE_ON_CARD`, `SHOW_PENDING_PAYMENT_METHOD_BLOCK` đang tắt — ẩn thông tin phí/escrow/ghi chú trên card danh sách (vẫn hiện trong màn chi tiết).
6. **File nháp ở root**: [accounts_modal.tsx](accounts_modal.tsx) và [tmp_modal.tsx](tmp_modal.tsx) là bản copy của `PaymentAccountsModal`, không được import — có thể xóa.
7. **[RoleSelection.tsx](src/app/components/RoleSelection.tsx)** (màn chọn vai trò) hiện không được dùng trong layout 2 điện thoại.
8. Hai file `ProviderApp.tsx` (~3.400 dòng) và `RequesterApp.tsx` (~2.300 dòng) chứa toàn bộ UI mỗi vai trò — nên tách nhỏ khi phát triển tiếp.
