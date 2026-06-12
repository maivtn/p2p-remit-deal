# TÀI LIỆU PHÂN TÍCH NGHIỆP VỤ (BUSINESS ANALYSIS DOCUMENT)

# P2P REMIT DEALS — Nền tảng chuyển tiền ngang hàng

| | |
|---|---|
| **Tên hệ thống** | P2P Remit Deals |
| **Loại tài liệu** | Tài liệu phân tích nghiệp vụ (BRD/FSD kết hợp) |
| **Phiên bản** | 1.0 |
| **Ngày lập** | 12/06/2026 |
| **Phạm vi** | Mô tả nghiệp vụ chi tiết theo 2 vai trò: **Nhà cung cấp (Provider)** và **Người dùng (Requester)**, dựa trên bản prototype hiện có |
| **Tài liệu liên quan** | [MO_TA_UNG_DUNG.md](MO_TA_UNG_DUNG.md) (mô tả kỹ thuật tổng quan) |

---

## MỤC LỤC

1. [Giới thiệu](#1-giới-thiệu)
2. [Tổng quan nghiệp vụ](#2-tổng-quan-nghiệp-vụ)
3. [Vòng đời giao dịch end-to-end](#3-vòng-đời-giao-dịch-end-to-end)
4. [Nghiệp vụ vai trò PROVIDER (Nhà cung cấp)](#4-nghiệp-vụ-vai-trò-provider-nhà-cung-cấp)
5. [Nghiệp vụ vai trò REQUESTER (Người dùng)](#5-nghiệp-vụ-vai-trò-requester-người-dùng)
6. [Ma trận quyền hành động theo trạng thái](#6-ma-trận-quyền-hành-động-theo-trạng-thái)
7. [Danh mục quy tắc nghiệp vụ (Business Rules)](#7-danh-mục-quy-tắc-nghiệp-vụ-business-rules)
8. [Dữ liệu nghiệp vụ](#8-dữ-liệu-nghiệp-vụ)
9. [KPI & báo cáo đề xuất](#9-kpi--báo-cáo-đề-xuất)
10. [Giả định, ràng buộc & vấn đề mở](#10-giả-định-ràng-buộc--vấn-đề-mở)
- [Phụ lục A — Bảng trạng thái giao dịch](#phụ-lục-a--bảng-trạng-thái-giao-dịch)
- [Phụ lục B — Dữ liệu mẫu minh họa](#phụ-lục-b--dữ-liệu-mẫu-minh-họa)
- [Phụ lục C — Từ điển nhãn/thông điệp chính trên UI](#phụ-lục-c--từ-điển-nhãnthông-điệp-chính-trên-ui)

---

## 1. GIỚI THIỆU

### 1.1. Mục đích tài liệu

Tài liệu này mô tả **đầy đủ và chi tiết nghiệp vụ** của nền tảng P2P Remit Deals theo từng vai trò người dùng, phục vụ:

- Đội phát triển: làm căn cứ xây dựng backend, API, cơ sở dữ liệu từ prototype.
- Đội kiểm thử: xây dựng test case theo use case và business rule được đánh số.
- Quản lý sản phẩm / vận hành: hiểu mô hình hoạt động, mô hình phí, các điểm rủi ro.
- Đối tác / bên thứ ba: đánh giá mô hình nghiệp vụ.

### 1.2. Phạm vi

**Trong phạm vi:** toàn bộ nghiệp vụ thể hiện trong prototype — đăng và quản lý deal, tìm deal, gửi yêu cầu, vòng đời giao dịch, phí, escrow, chuỗi bằng chứng, khiếu nại, quản lý tài khoản thanh toán.

**Ngoài phạm vi:** đăng ký/đăng nhập, KYC/xác minh danh tính, hạch toán ví thật, cổng thanh toán, quy trình xử lý tranh chấp của vận hành, thông báo đẩy — các mục này được ghi nhận tại [mục 10](#10-giả-định-ràng-buộc--vấn-đề-mở) như khoảng trống cần định nghĩa khi triển khai thực tế.

### 1.3. Thuật ngữ & định nghĩa

| Thuật ngữ | Định nghĩa |
|---|---|
| **Provider (Nhà cung cấp)** | Cá nhân niêm yết deal tỷ giá; nhận tiền của người gửi ở quốc gia A và chi trả cho người thụ hưởng ở quốc gia B |
| **Requester (Người dùng / Người gửi)** | Cá nhân có nhu cầu chuyển tiền; tìm deal, gửi yêu cầu, thanh toán cho Provider |
| **Người thụ hưởng (Beneficiary)** | Người nhận tiền cuối cùng (vd: thân nhân tại Việt Nam). Không phải người dùng hệ thống; do Requester khai báo |
| **Deal** | Bản chào tỷ giá do Provider niêm yết: cặp tiền tệ, tỷ giá, hạn mức, phương thức nhận/chi, thời gian xử lý, hạn hiệu lực |
| **Request (Yêu cầu giao dịch)** | Yêu cầu chuyển tiền của Requester gắn với một Deal cụ thể; là thực thể giao dịch trung tâm có vòng đời 10 trạng thái |
| **Hành lang chuyển tiền (Corridor)** | Cặp tiền tệ gửi → nhận (vd: USD → VND) |
| **Escrow** | Cơ chế tạm giữ số tiền giao dịch của cả hai bên trong suốt giao dịch, giải phóng khi hoàn tất |
| **Platform fee (Phí hệ thống)** | Phí 0,5% thu của mỗi bên tại thời điểm Provider chấp nhận yêu cầu; không hoàn trả |
| **Proof (Bằng chứng)** | Tệp media (ảnh/video/audio) + ghi chú + mã tham chiếu do một bên tải lên để chứng minh đã thực hiện một bước chuyển tiền |
| **Memo (Nội dung chuyển khoản)** | Mã đối soát mà Requester phải ghi khi chuyển tiền cho Provider; mặc định là mã yêu cầu |
| **GD** | Giao dịch (viết tắt hiển thị trên UI) |

### 1.4. Quy ước trình bày

- Nhãn nút/thông điệp trong dấu nháy kép là **văn bản hiển thị nguyên văn** trên giao diện (tiếng Việt).
- Use case đánh số `UC-P-xx` (Provider), `UC-R-xx` (Requester); quy tắc nghiệp vụ đánh số `BR-xx`.
- Trạng thái giao dịch viết bằng mã hệ thống (`accepted`, `payment_sent`...) kèm nhãn tiếng Việt khi cần.

---

## 2. TỔNG QUAN NGHIỆP VỤ

### 2.1. Bối cảnh & bài toán

Người Việt sinh sống/làm việc tại nước ngoài (Mỹ, EU, Anh, Nhật, Hàn, Úc, Singapore, Thái Lan, Trung Quốc) có nhu cầu chuyển tiền về Việt Nam thường xuyên. Kênh chuyển tiền truyền thống (ngân hàng, dịch vụ remittance) có phí cao, tỷ giá kém cạnh tranh và thời gian xử lý chậm.

Đồng thời, tồn tại nhóm cá nhân có **thanh khoản ở cả hai đầu** (có tài khoản USD ở Mỹ và tài khoản VND tại Việt Nam) sẵn sàng đóng vai trò trung gian đổi tiền với tỷ giá tốt hơn để hưởng chênh lệch.

**P2P Remit Deals** kết nối hai nhóm này theo mô hình **marketplace hai chiều (two-sided marketplace)**:

- Provider niêm yết "deal" công khai: tỷ giá, hạn mức, phương thức thanh toán, thời gian cam kết.
- Requester mô tả nhu cầu; hệ thống lọc, chấm điểm và xếp hạng deal phù hợp.
- Hai bên thực hiện giao dịch theo một quy trình chuẩn hóa có kiểm soát: **chấp nhận → thanh toán → xác nhận → chi trả → hoàn tất**, với phí nền tảng, escrow, chuỗi bằng chứng và kênh khiếu nại.

### 2.2. Mô hình hoạt động

```
   NGƯỜI DÙNG (Requester)                NHÀ CUNG CẤP (Provider)
   ở nước ngoài, có USD/EUR...           có tài khoản ở cả 2 đầu
          │                                        │
          │  1. Tìm deal phù hợp  ◄──── niêm yết deal (tỷ giá, hạn mức)
          │  2. Gửi yêu cầu ─────────────────►  3. Chấp nhận (chốt phí + escrow)
          │  4. Chuyển tiền ngoại tệ ─────────►  (tài khoản Zelle/Venmo/PayPal/bank
          │     + upload bằng chứng                của Provider ở nước ngoài)
          │                                      5. Xác nhận đã nhận đủ tiền
          │                                      6. Chuyển VND cho NGƯỜI THỤ HƯỞNG
          │                                         (MoMo/ZaloPay/bank tại VN)
          │                                         + upload bằng chứng
          │  7. Xác nhận người thụ hưởng đã nhận đủ ──► HOÀN TẤT
          │                                         (thu phí 0,5% mỗi bên,
          │                                          giải phóng escrow)
```

**Điểm cốt lõi của mô hình:** dòng tiền thật chạy **ngoài hệ thống** (qua Zelle, MoMo, chuyển khoản ngân hàng...). Nền tảng không cầm tiền hộ mà đóng vai trò: (1) nơi gặp gỡ cung–cầu; (2) chuẩn hóa quy trình và trạng thái; (3) lưu chuỗi bằng chứng và mã đối soát; (4) cơ chế phí + escrow + uy tín để tạo niềm tin.

### 2.3. Các bên tham gia (Actors)

| Actor | Loại | Vai trò nghiệp vụ | Mục tiêu chính |
|---|---|---|---|
| **Provider** | Người dùng chính | Niêm yết deal, duyệt yêu cầu, nhận tiền, chi trả cho người thụ hưởng | Tối đa hóa lợi nhuận chênh lệch tỷ giá; giữ uy tín (rating, tỷ lệ hoàn thành) |
| **Requester** | Người dùng chính | Tìm deal, gửi yêu cầu, thanh toán, xác nhận hoàn tất | Tỷ giá tốt nhất, tiền đến người thụ hưởng nhanh và an toàn |
| **Người thụ hưởng** | Bên thứ ba (không dùng hệ thống) | Nhận tiền từ Provider qua phương thức Requester khai báo | Nhận đúng, đủ, nhanh |
| **Nền tảng (System)** | Hệ thống | Khớp deal, quản lý trạng thái, thu phí, khóa/giải phóng escrow, lưu bằng chứng | Doanh thu phí; tăng trưởng giao dịch an toàn |

> Trên màn hình chọn vai trò, hai giá trị cốt lõi được truyền thông: Provider — **"Tôi là Nhà cung cấp – Đăng deal & nhận yêu cầu từ khách"**; Requester — **"Tôi cần Giao dịch – Tìm deal tốt nhất & gửi yêu cầu"**, kèm khẩu hiệu **"An toàn · Uy tín · Nhanh chóng"**.

### 2.4. Mô hình doanh thu

| Nguồn thu | Mức | Thời điểm thu | Đối tượng |
|---|---|---|---|
| Phí hệ thống (platform fee) | **0,5%** giá trị giao dịch | Ngay khi Provider **chấp nhận** yêu cầu; **không hoàn trả** kể cả giao dịch không hoàn tất | Thu **cả hai bên**: người gửi 0,5% và Provider 0,5% (cùng tính trên số tiền gửi) |

Ví dụ: yêu cầu $500 USD → VND. Khi Provider chấp nhận: người gửi chịu phí $2,50; Provider chịu phí $2,50. Tổng doanh thu nền tảng: $5,00/giao dịch.

### 2.5. Trụ cột tạo niềm tin

Vì dòng tiền chạy ngoài hệ thống giữa hai cá nhân không quen biết, mô hình dựa trên 5 lớp bảo vệ:

1. **Hồ sơ uy tín**: điểm đánh giá (★ 1–5), số lượt đánh giá, số giao dịch hoàn thành, huy hiệu **"Đã xác minh"** (verified) — hiển thị trên mọi deal và yêu cầu. Rating của Requester cũng hiển thị cho Provider khi duyệt yêu cầu.
2. **Escrow hai chiều**: khi Provider chấp nhận, hệ thống tạm giữ (khóa) giá trị giao dịch của **cả hai bên**; giải phóng khi giao dịch hoàn tất. (Ghi chú hiện trạng: xem [BR-14] và mục 10.)
3. **Chuỗi bằng chứng bắt buộc**: mỗi bước chuyển tiền phải kèm bằng chứng tải lên (ảnh/video/audio + ghi chú + mã tham chiếu), bên kia xem được ngay.
4. **Mã đối soát (memo)**: Requester buộc phải ghi đúng mã yêu cầu vào nội dung chuyển khoản để Provider đối soát tiền vào.
5. **Kênh khiếu nại**: hai bên có thể chuyển giao dịch sang trạng thái khiếu nại kèm bằng chứng khi phát sinh tranh chấp.

---

## 3. VÒNG ĐỜI GIAO DỊCH END-TO-END

Đây là quy trình nghiệp vụ trung tâm, dùng chung cho cả hai vai trò. Một giao dịch (Request) có **10 trạng thái**, trong đó 6 trạng thái "sống" và 4 trạng thái kết thúc.

### 3.1. Sơ đồ trạng thái

```
                      Requester gửi yêu cầu (UC-R-03)
                                 │
                                 ▼
                 ┌───────────────────────────────┐
                 │  pending / waiting_accept     │  «Chờ chấp nhận»
                 └───────────────────────────────┘
                   │            │            │
     Provider      │            │            │  Requester
     "Từ chối"     │            │            │  "Hủy yêu cầu"
                   ▼            │            ▼
              [rejected]        │       [cancelled]
                                │ Provider "✅ Đồng ý & Chấp nhận"
                                │ → chốt phí 0,5% + khóa escrow
                                ▼
                 ┌───────────────────────────────┐
                 │  accepted                     │  «Chờ thanh toán»
                 └───────────────────────────────┘
                                │ Requester chuyển tiền cho Provider,
                                │ "📤 Xác nhận đã gửi tiền & tải bằng chứng"
                                ▼
                 ┌───────────────────────────────┐
                 │  payment_sent                 │  «Chờ xác nhận»   ──── Requester khiếu nại ──► [disputed]
                 └───────────────────────────────┘
                                │ Provider "Xác nhận đã nhận đủ …"
                                ▼
                 ┌───────────────────────────────┐
                 │  payment_confirmed            │  «Đang chuyển tiền» ── Requester khiếu nại ──► [disputed]
                 └───────────────────────────────┘
                                │ Provider chuyển cho người thụ hưởng,
                                │ "📤 Đã chuyển … — Upload bằng chứng"
                                ▼
                 ┌───────────────────────────────┐
                 │  transfer_sent                │  «Chờ hoàn tất»  ── Requester HOẶC Provider khiếu nại ──► [disputed]
                 └───────────────────────────────┘
                                │ Requester "✓ Đã nhận đủ tiền … - Hoàn tất"
                                ▼
                 ┌───────────────────────────────┐
                 │  completed  🎉                │  «Hoàn thành» — giải phóng escrow
                 └───────────────────────────────┘
```

### 3.2. Bảng chuyển trạng thái đầy đủ

| # | Từ trạng thái | Người thực hiện | Hành động (nhãn nút) | Sang trạng thái | Dữ liệu ghi nhận (side effects) |
|---|---|---|---|---|---|
| T1 | `pending` / `waiting_accept` | Provider | "Từ chối" | `rejected` | `status` |
| T2 | `pending` / `waiting_accept` | Provider | "Chấp nhận" → modal "✅ Đồng ý & Chấp nhận" | `accepted` | `systemFeeRate = 0.005`; `systemFeeAmount = số tiền gửi × 0.005`; `escrowLocked = true` |
| T3 | `pending` / `waiting_accept` | Requester | "Hủy yêu cầu" | `cancelled` | `status` |
| T4 | `accepted` | Requester | "📤 Xác nhận đã gửi tiền & tải bằng chứng" (qua modal bằng chứng) | `payment_sent` | `paymentProof` (bằng chứng thanh toán) |
| T5 | `payment_sent` | Provider | "Xác nhận đã nhận đủ {số tiền} qua {phương thức}" | `payment_confirmed` | `paymentConfirmedAt` (thời điểm xác nhận) |
| T6 | `payment_confirmed` | Provider | "📤 Đã chuyển {tiền tệ} — Upload bằng chứng" (qua modal bằng chứng) | `transfer_sent` | `transferProof` (bằng chứng chi trả) |
| T7 | `transfer_sent` | Requester | "✓ Đã nhận đủ tiền {tiền tệ} - Hoàn tất" | `completed` | `completedAt`; `escrowLocked = false` (giải phóng escrow) |
| T8 | `payment_sent`, `payment_confirmed`, `transfer_sent` | Requester | "⚠️ Khiếu Nại" (yêu cầu có `paymentProof`) | `disputed` | `disputedBy = "requester"`; `disputeNote`; `disputeProof`; `disputedAt` |
| T9 | `transfer_sent` (duy nhất) | Provider | "⚠️ Khiếu Nại" (yêu cầu có `transferProof`) | `disputed` | `disputedBy = "provider"`; `disputeNote`; `disputeProof`; `disputedAt` |

**Phân biệt `pending` và `waiting_accept`:** hai trạng thái tương đương về nghiệp vụ ("chờ Provider chấp nhận"). `waiting_accept` là trạng thái khởi tạo khi Requester gửi yêu cầu mới qua ứng dụng; `pending` xuất hiện trong dữ liệu khởi tạo (yêu cầu có sẵn). Mọi xử lý phía sau giống hệt nhau; chỉ khác nhãn badge hiển thị (`pending` → "Chờ duyệt", `waiting_accept` → "Chờ chấp nhận"). *Khuyến nghị khi triển khai thật: hợp nhất thành một trạng thái* (xem mục 10).

**Trạng thái kết thúc:** `completed`, `rejected`, `cancelled`, `disputed` — không có chuyển tiếp nào ra khỏi các trạng thái này. Đặc biệt `disputed` hiện là **trạng thái treo vĩnh viễn**: chưa có quy trình phân xử/giải quyết (xem mục 10).

### 3.3. Hai pha thanh toán — trách nhiệm từng bên

| Pha | Dòng tiền | Người chuyển | Người nhận | Bằng chứng | Người xác nhận |
|---|---|---|---|---|---|
| **Pha 1 — Thanh toán** | Ngoại tệ (USD/EUR/...) từ Requester → tài khoản của Provider ở nước ngoài | Requester | Provider | `paymentProof` do Requester tải lên | Provider ("đã nhận đủ") |
| **Pha 2 — Chi trả** | Nội tệ (VND/...) từ Provider → người thụ hưởng | Provider | Người thụ hưởng | `transferProof` do Provider tải lên | Requester ("người nhận đã nhận đủ" → hoàn tất) |

Nguyên tắc đối ứng: **bên chuyển tiền nộp bằng chứng — bên nhận tiền xác nhận**. Mỗi pha chỉ tiến khi cả hai vế hoàn thành.

### 3.4. Quy tắc phí (chi tiết tại BR-10 → BR-13)

- Tỷ lệ phí cố định **0,5%** (`systemFeeRate = 0.005`), chốt vào yêu cầu tại thời điểm Provider chấp nhận.
- **Người gửi** chịu 0,5% × số tiền gửi (tính theo tiền tệ gửi).
- **Provider** chịu 0,5% × số tiền gửi (hiển thị cùng đơn vị tiền tệ gửi).
- Phí **thu ngay khi chấp nhận, không hoàn trả** — UI ghi rõ: *"💸 Platform fee — thu ngay, không hoàn trả"*.
- Khi hoàn tất, hai bên đều thấy dòng tổng kết: *"- Phí hệ thống (0.5%): {số tiền}"*.

### 3.5. Quy tắc escrow (chi tiết tại BR-14 → BR-16)

- Khi Provider chấp nhận: `escrowLocked = true`; mỗi bên bị tạm giữ **đúng bằng giá trị giao dịch** (số tiền gửi). UI: *"🔒 Escrow — tạm giữ trong suốt giao dịch"*, *"🔓 Escrow giải phóng khi giao dịch hoàn tất."*
- Khi Requester xác nhận hoàn tất: `escrowLocked = false`; UI: *"- Escrow đã được giải phóng"*.
- **Hiện trạng prototype:** escrow là cờ trạng thái + hiển thị; số dư ví (`PROVIDER_WALLET_INIT`, `REQUESTER_WALLET_INIT`) **chưa bị trừ/cộng thực** ở bất kỳ đâu. Khi làm thật cần hạch toán ví thật (mục 10).

### 3.6. Quy tắc bằng chứng (chi tiết tại BR-17 → BR-20)

- Bằng chứng gồm: tối đa **10 tệp** media (`image/*`, `video/*`, `audio/*`), ghi chú văn bản, mã tham chiếu tự sinh dạng `REF-XXXXXXX`, dấu thời gian.
- Nút xác nhận trong modal bằng chứng chỉ bật khi có **ít nhất 1 tệp HOẶC ghi chú khác rỗng**.
- Bên kia xem được bằng chứng ngay sau khi nộp (thẻ bằng chứng kèm badge "SUCCESS", thời gian, ghi chú, thư viện ảnh có lightbox).
- Hai khu bằng chứng tự mở rộng theo ngữ cảnh: khu "thanh toán" mở ở trạng thái `accepted`/`payment_sent`; khu "chi trả" mở ở `payment_confirmed`/`transfer_sent`/`completed`.

### 3.7. Quy tắc memo đối soát (BR-21)

- Mã đối soát = `memo` của yêu cầu, nếu trống thì dùng **mã yêu cầu (request ID)**.
- Requester thấy cảnh báo: *"⚠️ Vui lòng điền chính xác {memo} vào ghi chú / memo của giao dịch khi chuyển tiền cho nhà cung cấp."*
- Provider thấy cùng mã ở bước chi trả kèm chỉ dẫn: *"Điền chính xác nội dung này khi chuyển để đối soát."* — cả hai phía có nút copy.

---

## 4. NGHIỆP VỤ VAI TRÒ PROVIDER (NHÀ CUNG CẤP)

### 4.1. Chân dung & mục tiêu (Persona)

**"Nguyễn Văn B"** — người Việt định cư tại Mỹ, có tài khoản USD (Zelle, Venmo, PayPal, Chase) và tài khoản EUR (Deutsche Bank/SEPA), đồng thời duy trì nguồn VND tại Việt Nam. Hồ sơ minh họa: 248 giao dịch hoàn thành, đánh giá 4,9★ (248 lượt), đã xác minh, tỷ lệ hoàn thành 99%, 18 giao dịch trong tháng.

**Mục tiêu:** kiếm lợi nhuận từ chênh lệch tỷ giá; xoay vòng vốn nhanh; giữ uy tín để hút khách.

**Nỗi lo chính:** nhận thiếu tiền/tiền không về đúng giao dịch (→ cần memo đối soát + bằng chứng); chuyển xong nhưng khách không xác nhận (→ cần quyền khiếu nại); cam kết tỷ giá khi thị trường biến động (→ cần hạn mức, hạn hiệu lực, quyền tạm dừng deal).

### 4.2. Bản đồ chức năng & use case

Ứng dụng Provider gồm 4 phân hệ (4 tab): **Trang chủ · Deals · Yêu cầu · Hồ sơ**.

| Mã | Use case | Phân hệ | Mức ưu tiên |
|---|---|---|---|
| UC-P-01 | Theo dõi dashboard & nhận biết yêu cầu mới | Trang chủ | Trung bình |
| UC-P-02 | Tạo deal mới | Deals | **Cao** |
| UC-P-03 | Tạm dừng / kích hoạt lại / xóa deal | Deals | Cao |
| UC-P-04 | Duyệt yêu cầu: chấp nhận / từ chối | Yêu cầu | **Cao** |
| UC-P-05 | Xác nhận đã nhận tiền của người gửi | Yêu cầu | **Cao** |
| UC-P-06 | Chi trả cho người thụ hưởng & nộp bằng chứng | Yêu cầu | **Cao** |
| UC-P-07 | Khiếu nại giao dịch | Yêu cầu | Trung bình |
| UC-P-08 | Quản lý tài khoản thanh toán nhận tiền | Hồ sơ | Cao |

---

### UC-P-01 — Theo dõi dashboard & nhận biết yêu cầu mới

| Mục | Nội dung |
|---|---|
| **Mô tả** | Provider nắm tình hình kinh doanh và phát hiện yêu cầu mới cần xử lý ngay khi mở ứng dụng |
| **Actor** | Provider |
| **Điều kiện trước** | Đã đăng nhập với vai trò Provider |

**Luồng chính:**

1. Hệ thống hiển thị lời chào *"Xin chào 👋"* + tên Provider và khối chỉ số: **"Thu nhập hôm nay"** (₫15.250.000 — minh họa), **"Deals đang mở"** (đếm deal `active`), **"Hoàn thành"**, **"Đánh giá"**.
2. Khối thao tác nhanh: **"Tạo Deal"**, **"Deals"**, **"Yêu cầu"** — nút "Yêu cầu" hiển thị badge đỏ đếm số yêu cầu đang chờ (`pending` + `waiting_accept`) nếu > 0.
3. Mục **"Yêu cầu mới nhất"** liệt kê tối đa **3 yêu cầu chờ chấp nhận mới nhất** (tên + rating người gửi, số tiền gửi → nhận, phương thức 2 đầu, thời gian tạo, badge trạng thái); bấm vào đi thẳng tới chi tiết. Trống thì hiển thị *"Chưa có yêu cầu mới"*.

**Quy tắc thông báo:** yêu cầu phát sinh **sau thời điểm mở phiên** được gắn nhãn nhấp nháy **"🔔 MỚI"** trên card; badge đếm hiển thị đồng thời ở nút thao tác nhanh và tab "Yêu cầu" dưới đáy. [BR-26]

---

### UC-P-02 — Tạo deal mới

| Mục | Nội dung |
|---|---|
| **Mô tả** | Provider niêm yết một bản chào tỷ giá công khai lên marketplace |
| **Actor** | Provider |
| **Trigger** | Nút "Tạo mới" (tab Deals) / "Tạo Deal" (Trang chủ) / "Tạo Deal Ngay" (trạng thái trống) |
| **Điều kiện sau** | Deal mới xuất hiện ở tab Deals của Provider **và** trên marketplace của mọi Requester với trạng thái "Hoạt động" |

**Luồng chính — form "Tạo Deal Mới":**

| Bước | Trường | Quy tắc |
|---|---|---|
| 1 | **"Cặp tiền tệ"** (gửi → nhận) | Chọn từ 10 tiền tệ. Đổi tiền tệ sẽ reset danh sách phương thức về 2 phương thức đầu của tiền tệ đó |
| 2 | **"Tỷ giá (1 {gửi} = ? {nhận})"** | Số > 0. Nút **"⚡ Tỷ giá thị trường"** điền nhanh tỷ giá tham khảo (bảng SUGGESTED_RATES — Phụ lục B) |
| 3 | **"Tối thiểu"** / **"Tối đa"** | Hai số hợp lệ; tối đa phải lớn hơn tối thiểu |
| 4 | **"💳 Người gửi {cờ} thanh toán cho tôi qua"** | Multi-select các phương thức của tiền tệ gửi; tối thiểu 1 |
| 5 | **"📤 Tôi gửi tiền {cờ} qua"** | Multi-select các phương thức của tiền tệ nhận; tối thiểu 1 |
| 6 | **"Thời gian chuyển"** | 1 trong 5 mức: "30-60 phút" / "1-2 giờ" (mặc định) / "2-4 giờ" / "Trong ngày" / "Trong 24 giờ" — đây là **cam kết SLA công khai** của Provider |
| 7 | **"Hiệu lực"** | "7 ngày" / "14 ngày" (mặc định) / "30 ngày" — hệ thống tính ngày hết hạn deal |
| 8 | **"Ghi chú"** | Tùy chọn — điều kiện riêng (vd: "Chỉ xử lý lượng lớn, liên hệ trước.") |
| 9 | Nút **"Đăng Deal"** | Validate toàn bộ; hợp lệ → tạo deal trạng thái `active`, số yêu cầu = 0 |

**Thông báo lỗi (nguyên văn):** "Nhập tỷ giá hợp lệ" · "Nhập số tiền tối thiểu" · "Nhập số tiền tối đa" · "Tối đa phải lớn hơn tối thiểu" · "Chọn ít nhất 1 hình thức".

**Quy tắc nghiệp vụ liên quan:** [BR-01] [BR-02] [BR-03] [BR-04]

---

### UC-P-03 — Tạm dừng / kích hoạt lại / xóa deal

- Tab Deals có 4 bộ lọc đếm số: **"Tất cả" / "Hoạt động" / "Tạm dừng" / "Hết hạn"**.
- Mỗi deal (chưa hết hạn) có 2 thao tác:
  - **"Tạm dừng"** ⇄ **"Kích hoạt"**: chuyển `active` ⇄ `paused`. Deal tạm dừng **lập tức biến mất khỏi marketplace** (Requester không thấy) nhưng không ảnh hưởng yêu cầu đang xử lý.
  - **Xóa** (nút thùng rác): gỡ deal vĩnh viễn, **không có bước xác nhận** (rủi ro thao tác nhầm — xem mục 10).
- Deal "Hết hạn" không thao tác được.
- **Không có chức năng sửa deal**: muốn đổi tỷ giá/hạn mức, Provider phải tạm dừng hoặc xóa rồi tạo deal mới. [BR-05]

---

### UC-P-04 — Duyệt yêu cầu: chấp nhận / từ chối

| Mục | Nội dung |
|---|---|
| **Mô tả** | Quyết định kinh doanh quan trọng nhất của Provider: cam kết thực hiện giao dịch, chịu phí và khóa escrow |
| **Điều kiện trước** | Yêu cầu ở trạng thái "Chờ chấp nhận" (`pending`/`waiting_accept`) |
| **Thông tin để ra quyết định** | Tên + **rating người gửi**, số tiền gửi → nhận theo tỷ giá đã chốt, phương thức 2 đầu, thông tin người thụ hưởng, lời nhắn của người gửi (vd: *"Mình cần chuyển gấp trong hôm nay, bạn có thể xử lý không?"*), thời điểm tạo |

**Luồng chính (chấp nhận):**

1. Provider mở chi tiết yêu cầu, bấm **"Chấp nhận"**.
2. Hệ thống mở modal **"Xác nhận chấp nhận"**, tổng hợp nghĩa vụ:
   - **"Nhận từ người gửi"**: {số tiền tiền tệ gửi}
   - **"Gửi đến tài khoản"**: {số tiền tiền tệ nhận}
   - **"Gửi đến"**: quốc gia đích (vd: 🇻🇳 Việt Nam)
   - Khối phí/escrow (khi bật hiển thị): *"🔒 Escrow của bạn (tạm giữ)"*, *"🔒 Escrow người gửi (tạm giữ)"*, *"💸 Platform fee của bạn (thu ngay)"* −0,5%
3. Provider bấm **"✅ Đồng ý & Chấp nhận"**.
4. Hệ thống: chuyển `accepted`; chốt `systemFeeRate = 0,5%`, `systemFeeAmount`; **khóa escrow hai bên** [BR-10, BR-14]; phía Requester lập tức thấy hướng dẫn thanh toán.
5. Provider chờ — banner *"⏳ Chờ người gửi chuyển tiền qua {phương thức} và upload bằng chứng..."*.

**Luồng thay thế (từ chối):** bấm **"Từ chối"** → `rejected` ngay (không cần lý do, không có modal xác nhận). Requester thấy: *"Nhà cung cấp từ chối. Thử tìm deal khác."*

**Lưu ý nghiệp vụ:** Provider phải **chấp nhận từng yêu cầu một**, không có duyệt hàng loạt; không thể thương lượng số tiền/tỷ giá trên hệ thống (yêu cầu r5 mẫu minh họa khách "mặc cả" qua lời nhắn → Provider từ chối).

---

### UC-P-05 — Xác nhận đã nhận tiền của người gửi

| Mục | Nội dung |
|---|---|
| **Điều kiện trước** | Trạng thái `payment_sent` — Requester đã nộp bằng chứng thanh toán |
| **Trigger** | Provider đối chiếu tài khoản nhận tiền thực tế (ngoài hệ thống) với bằng chứng + memo |

**Luồng chính:**

1. Provider mở chi tiết, xem khu **"Bằng chứng thanh toán từ người gửi"**: thẻ bằng chứng (mã tham chiếu, thời gian, ghi chú, media đính kèm, lightbox).
2. Đối chiếu tiền vào tài khoản thật: đúng số tiền + đúng memo.
3. Bấm **"Xác nhận đã nhận đủ {số tiền} qua {phương thức}"** → `payment_confirmed`, ghi `paymentConfirmedAt`.

**Luồng thay thế:** tiền không về / sai số tiền → Provider **không xác nhận** (giao dịch đứng ở `payment_sent`); hiện tại Provider **chưa có quyền khiếu nại ở bước này** (chỉ Requester có) — ghi nhận là khoảng trống nghiệp vụ tại mục 10.

**Điểm kiểm soát quan trọng:** xác nhận này là **không thể đảo ngược** và là căn cứ để Provider bắt buộc chi trả ở bước sau. Provider chỉ bấm khi tiền đã thực nhận đủ. [BR-22]

---

### UC-P-06 — Chi trả cho người thụ hưởng & nộp bằng chứng

| Mục | Nội dung |
|---|---|
| **Điều kiện trước** | Trạng thái `payment_confirmed` |
| **Mô tả** | Provider thực hiện nghĩa vụ chi trả: chuyển {số tiền nhận} cho người thụ hưởng theo đúng phương thức Requester đã chỉ định, trong SLA đã cam kết trên deal |

**Luồng chính:**

1. Hệ thống hiển thị khối hướng dẫn **"🔄 Chuyển tiền ngay"**: số tiền chi trả, tên người thụ hưởng, chi tiết nhận tiền (SĐT ví/ngân hàng + số tài khoản/địa chỉ), và **mã đối soát** trong khung *"Ghi chú / nội dung chuyển khoản"* kèm chỉ dẫn *"Điền chính xác nội dung này khi chuyển để đối soát."* (có nút copy).
2. Provider chuyển tiền thật ngoài hệ thống (MoMo/ZaloPay/chuyển khoản...).
3. Bấm **"📤 Đã chuyển {tiền tệ} — Upload bằng chứng"** → modal **"Xác nhận đã chuyển tiền"** (*"Upload bằng chứng chuyển {số tiền} cho {người thụ hưởng}"*).
4. Tải lên tối đa 10 tệp + ghi chú; bấm xác nhận → `transfer_sent`, lưu `transferProof`.
5. Chờ Requester — banner *"⏳ Chờ người dùng xác nhận đã nhận tiền..."*.

**Kết thúc thành công:** Requester xác nhận → `completed`; Provider thấy khối **"🎉 Hoàn tất!"** với 2 dòng: phí hệ thống 0,5% và *"Escrow đã được giải phóng"*.

---

### UC-P-07 — Khiếu nại giao dịch (phía Provider)

| Mục | Nội dung |
|---|---|
| **Điều kiện trước** | **Chỉ** ở trạng thái `transfer_sent` và đã có `transferProof` — tức Provider đã chi trả xong nhưng Requester không xác nhận hoàn tất [BR-24] |
| **Trigger** | Nút **"⚠️ Khiếu Nại"** |

**Luồng:** mở modal **"Khiếu nại giao dịch"** (*"Mô tả vấn đề và đính kèm bằng chứng"*) → nhập mô tả + đính kèm → xác nhận → `disputed` với `disputedBy = "provider"`, lưu ghi chú + bằng chứng + thời điểm. Cả hai bên thấy banner *"⚠️ Khiếu nại bởi: …"* kèm trích dẫn ghi chú và thẻ *"📎 Bằng chứng khiếu nại"*.

**Hạn chế hiện tại:** sau `disputed` không có quy trình phân xử — xem mục 10.

---

### UC-P-08 — Quản lý tài khoản thanh toán nhận tiền

| Mục | Nội dung |
|---|---|
| **Mô tả** | Provider khai báo sẵn các tài khoản nhận tiền (Zelle/Venmo/PayPal/ngân hàng...) theo từng tiền tệ. Đây là dữ liệu **được hiển thị cho Requester** ở bước thanh toán |
| **Vị trí** | Hồ sơ → thẻ "Tài khoản thanh toán" ({n} tài khoản đã lưu) |

**Quy tắc form (thêm/sửa):**

| Trường | Quy tắc |
|---|---|
| "Loại tiền tệ" | Chọn 1 trong 10; đổi tiền tệ reset phương thức |
| "Hình thức thanh toán" | Theo tiền tệ đã chọn |
| "Tên gợi nhớ" | **Bắt buộc** (vd: "Zelle chính") |
| Trường động theo phương thức | Venmo → "Venmo username"; phương thức cần SĐT → "Số điện thoại / Email liên kết"; phương thức khác → "Email tài khoản"; chuyển khoản → "Tên ngân hàng" + "Số tài khoản / IBAN / Routing" + "Tên chủ tài khoản" |
| Nút lưu | "Lưu tài khoản" / "Cập nhật tài khoản" — chỉ bật khi đã chọn phương thức + nhập tên gợi nhớ |

- Danh sách nhóm theo tiền tệ; mỗi tài khoản có nút copy chi tiết (ưu tiên hiển thị: handle → SĐT → email → số tài khoản), nút sửa, nút xóa.
- **Xóa không có xác nhận** ở phía Provider (khác phía Requester có hỏi *"Xoá tài khoản này?"*) — điểm cần đồng nhất, xem mục 10.

**Liên kết nghiệp vụ quan trọng [BR-23]:** ở bước Requester thanh toán, nếu yêu cầu chưa có thông tin tài khoản Provider đính kèm, hệ thống **tự tra cứu tài khoản đã lưu của Provider khớp (phương thức gửi + tiền tệ gửi)** để hướng dẫn Requester chuyển tiền; nếu không tìm thấy, Requester thấy cảnh báo *"⚠️ Chưa có tài khoản · Liên hệ {tên Provider}"*. Do đó Provider **bắt buộc duy trì tài khoản cho mọi phương thức đã cam kết trên deal**.

### 4.9. Những điều Provider KHÔNG thể làm

| Hạn chế | Hệ quả nghiệp vụ |
|---|---|
| Không sửa được deal đã đăng | Muốn đổi tỷ giá phải tạo deal mới |
| Không sửa được nội dung yêu cầu (số tiền, người nhận, phương thức) | Chỉ tiến/lùi theo trạng thái |
| Không tự đánh dấu hoàn tất | Hoàn tất do Requester xác nhận — bảo vệ người gửi |
| Không hủy sau khi đã chấp nhận | Chỉ có thể đi tiếp hoặc khiếu nại (ở `transfer_sent`) |
| Không khiếu nại ở `payment_sent`/`payment_confirmed` | Khoảng trống khi nhận thiếu tiền — mục 10 |
| Không duyệt hàng loạt, không thương lượng giá trên hệ thống | Mỗi yêu cầu xử lý độc lập |
| Không xem hồ sơ chi tiết người gửi (ngoài tên + rating) | — |

### 4.10. Màn hình & điều hướng (Provider)

| Tab | Nhãn | Nội dung chính |
|---|---|---|
| 1 | "Trang chủ" | Dashboard + thao tác nhanh + 3 yêu cầu chờ mới nhất |
| 2 | "Deals" | Danh sách deal + bộ lọc + tạo deal |
| 3 | "Yêu cầu" (badge đếm chờ xử lý) | 4 bộ lọc: "Chờ chấp nhận / Đang xử lý / Hoàn thành / Từ chối/Khiếu nại"; card → màn "Chi tiết giao dịch" (thanh tiến trình + bằng chứng + hành động theo trạng thái) |
| 4 | "Hồ sơ" | Hồ sơ + chỉ số + tài khoản thanh toán + menu (Lịch sử giao dịch / Cài đặt thông báo / Bảo mật & xác thực — đều là placeholder) + "Đăng xuất" |

---

## 5. NGHIỆP VỤ VAI TRÒ REQUESTER (NGƯỜI DÙNG)

### 5.1. Chân dung & mục tiêu (Persona)

**"Nguyễn Văn A"** — người Việt làm việc tại Mỹ, định kỳ gửi tiền về cho gia đình. Hồ sơ minh họa: 12 giao dịch, 4,7★ (12 lượt đánh giá), tỷ lệ hoàn thành 92%, đã lưu sẵn 6 tài khoản nhận tiền (Vietcombank, MoMo, Techcombank, Zelle, PayPal, SEPA).

**Mục tiêu:** tỷ giá tốt nhất; người thân nhận đúng – đủ – nhanh; thao tác lặp lại tiện lợi (tài khoản đã lưu).

**Nỗi lo chính:** chuyển tiền cho Provider rồi bị "bùng" (→ escrow, bằng chứng, rating, khiếu nại); khai sai thông tin người nhận (→ form thích ứng theo phương thức + validate); không biết tiến độ (→ vòng đời trạng thái + thanh tiến trình từng bước).

### 5.2. Bản đồ chức năng & use case

Ứng dụng Requester gồm 4 phân hệ (4 tab): **Gửi tiền · Yêu cầu · Liên kết · Hồ sơ**.

| Mã | Use case | Phân hệ | Mức ưu tiên |
|---|---|---|---|
| UC-R-01 | Khai báo nhu cầu chuyển tiền (Bước 1) | Gửi tiền | **Cao** |
| UC-R-02 | Xem kết quả & chọn deal (Bước 2) | Gửi tiền | **Cao** |
| UC-R-03 | Xác nhận & gửi yêu cầu (Bước 3) | Gửi tiền | **Cao** |
| UC-R-04 | Theo dõi yêu cầu của tôi | Yêu cầu | Cao |
| UC-R-05 | Hủy yêu cầu | Yêu cầu | Trung bình |
| UC-R-06 | Thanh toán cho Provider & nộp bằng chứng | Yêu cầu | **Cao** |
| UC-R-07 | Xác nhận hoàn tất giao dịch | Yêu cầu | **Cao** |
| UC-R-08 | Khiếu nại giao dịch | Yêu cầu | Trung bình |
| UC-R-09 | Quản lý tài khoản liên kết (người nhận) | Liên kết | Cao |

Luồng "Gửi tiền" là **wizard 3 bước**: Nhập nhu cầu → Chọn deal → Xác nhận gửi.

---

### UC-R-01 — Khai báo nhu cầu chuyển tiền (Bước 1)

Màn hình mở đầu: *"Bạn muốn gửi tiền đi đâu?"* — *"Nhập nhu cầu — hệ thống tìm deal tốt nhất"*.

**Khối 1 — "SỐ TIỀN CHUYỂN":**

| Trường | Quy tắc |
|---|---|
| "Bạn gửi (đang ở quốc gia nào, trả bằng)" | Chọn tiền tệ gửi (10 lựa chọn). Đổi tiền tệ → tiền tệ nhận tự reset về lựa chọn khả dụng đầu tiên; 2 phương thức tự reset |
| Số tiền | Bắt buộc, số > 0. Lỗi: *"Nhập số tiền hợp lệ"* |
| "Người nhận sẽ nhận bằng" | Chỉ liệt kê các tiền tệ **có tỷ giá tham chiếu** với tiền tệ gửi (bảng PREVIEW_RATES — Phụ lục B) |
| Ước tính nhận | Hiển thị tỷ giá tham chiếu ("1 USD ≈ 25500") và số tiền nhận ước tính, kèm miễn trừ: *"\* Tỷ giá ước tính. Tỷ giá thực theo nhà cung cấp."* [BR-06] |

**Khối 2 — "HÌNH THỨC THANH TOÁN":** chọn 1 phương thức **"Bạn trả nhà cung cấp qua (tại {tiền tệ gửi})"** và 1 phương thức **"Người nhận sẽ nhận qua (tại {tiền tệ nhận})"**. Đổi phương thức nhận → xóa các trường chi tiết người nhận đã nhập (trừ tên).

**Khối 3 — "THÔNG TIN TÀI KHOẢN NHẬN"** — form thích ứng theo phương thức nhận [BR-08]:

| Phương thức nhận | Trường hiển thị | Bắt buộc | Lỗi (nguyên văn) |
|---|---|---|---|
| Mọi phương thức | "Tên chủ tài khoản *" | ✔ | "Nhập tên chủ tài khoản" |
| Ví điện tử (MoMo, ZaloPay, Zelle...) — `requiresPhone` | "Số điện thoại {tên ví} *" | ✔ | "Nhập số điện thoại" |
| Chuyển khoản — `requiresAccount` | Ngân hàng (VND: dropdown 9 ngân hàng — Vietcombank, Techcombank, MB Bank, BIDV, Agribank, VPBank, ACB, TPBank, Sacombank; tiền tệ khác: nhập tự do) + "Số tài khoản *" | ✔ (số TK) | "Nhập số tài khoản" |
| Nhận tiền mặt (nếu có địa chỉ) | "Địa chỉ nhận tiền mặt" | ✘ | — |

- **Chọn nhanh từ tài khoản đã lưu**: nếu có tài khoản liên kết khớp (tiền tệ nhận + phương thức nhận), hiển thị dải chip *"Chọn tài khoản đã lưu:"* — chạm 1 lần tự điền tên/SĐT/ngân hàng/số tài khoản; nút "Cài đặt" mở quản lý tài khoản. [BR-09]

**Khối 4 — "GHI CHÚ CHO NHÀ CUNG CẤP":** lời nhắn tùy chọn (vd: "Cần chuyển gấp trước 3h chiều...").

**Kết thúc bước:** nút **"Tìm Deal Phù Hợp"** → validate toàn bộ → sang Bước 2.

---

### UC-R-02 — Xem kết quả & chọn deal (Bước 2)

**Thuật toán lọc & xếp hạng [BR-07]:**

1. **Lọc cứng:** deal `active` + đúng hành lang (tiền tệ gửi → nhận) + số tiền nằm trong [tối thiểu, tối đa] của deal.
2. **Chấm điểm khớp phương thức:** +10 điểm nếu deal hỗ trợ phương thức gửi đã chọn; +10 điểm nếu hỗ trợ phương thức nhận đã chọn (tối đa 20).
3. **Xếp hạng:** điểm giảm dần → cùng điểm thì **tỷ giá cao hơn đứng trước** (người gửi nhận được nhiều hơn).
4. **Gắn nhãn:** deal khớp đủ 2 phương thức đứng đầu mang banner *"Khớp hoàn toàn hình thức thanh toán · Tỷ giá tốt nhất"*; các deal khớp đủ khác mang banner *"Hỗ trợ {phương thức gửi} & {phương thức nhận}"*.
5. **"Deal gần đúng số tiền"**: các deal cùng hành lang nhưng lệch hạn mức được liệt kê mờ phía dưới, **không chọn được** — gợi ý người dùng điều chỉnh số tiền.

**Thông tin trên mỗi card deal (căn cứ quyết định):** avatar + tên Provider + huy hiệu xác minh; rating ★ + số GD hoàn thành; khung tỷ giá + **"Bạn nhận: {số tiền}"** tính theo tỷ giá thật của deal; phương thức "Nhận qua:" / "Gửi qua:" (phương thức trùng lựa chọn được tô xanh); thời gian chuyển cam kết; ghi chú riêng của deal.

**Không có kết quả:** *"Chưa có deal {gửi} → {nhận} phù hợp"* — *"Thử đổi số tiền hoặc hình thức thanh toán"* + nút "Thay đổi yêu cầu".

**Kết thúc bước:** nút **"Chọn deal này"** → sang Bước 3.

---

### UC-R-03 — Xác nhận & gửi yêu cầu (Bước 3)

Màn **"Xác nhận yêu cầu"** (*"Kiểm tra kỹ trước khi gửi"*) tổng hợp: khối **"NHÀ CUNG CẤP"** (hồ sơ uy tín), khối **"LUỒNG GIAO DỊCH"** ("Bạn trả" → thời gian chuyển → "Bạn nhận", kèm **"💱 Tỉ giá áp dụng"** — tỷ giá thật của deal, thay thế tỷ giá ước tính), khối **"NGƯỜI THỤ HƯỞNG"**, khối **"GHI CHÚ"** (còn sửa được — đây là trường duy nhất sửa được ở bước này).

Bấm **"Gửi Yêu Cầu"** → hệ thống tạo yêu cầu:

- Trạng thái khởi tạo **`waiting_accept`** ("Chờ chấp nhận"); tỷ giá & số tiền nhận **chốt theo deal** tại thời điểm gửi; phí 0,5% ghi sẵn (chính thức chốt khi Provider chấp nhận); escrow chưa khóa.
- Điều hướng tự động sang tab **"Yêu cầu"**, bộ lọc "Chờ chấp nhận"; wizard quay về Bước 1.
- Phía Provider: yêu cầu xuất hiện tức thì kèm nhãn "🔔 MỚI" + badge đếm.
- Thông điệp định hướng: *"Nhà cung cấp sẽ xác nhận và liên hệ sớm nhất có thể"*.

---

### UC-R-04 — Theo dõi yêu cầu của tôi

Tab **"Yêu cầu của tôi"** (*"Theo dõi trạng thái chuyển tiền"*) chia 4 bộ lọc đếm số [BR-27]:

| Bộ lọc | Gồm trạng thái |
|---|---|
| "Đang xử lý" | `accepted`, `payment_sent`, `payment_confirmed`, `transfer_sent` |
| "Chờ chấp nhận" | `pending`, `waiting_accept` |
| "Hoàn thành" | `completed` |
| "Từ chối/Khiếu nại" | `rejected`, `cancelled`, `disputed` |

Card hiển thị: Provider + thời gian + badge trạng thái + tóm tắt "Bạn gửi → Người nhận" + tỷ giá; nút **"Xem chi tiết giao dịch"** mở màn chi tiết có **thanh tiến trình từng bước** (hiện từ `accepted` đến `completed`), 2 khu bằng chứng tự mở theo ngữ cảnh ("Bằng chứng thanh toán của bạn" / "Bằng chứng nhà cung cấp đã chuyển tiền"), khu "NGƯỜI THỤ HƯỞNG" thu gọn, và hành động theo trạng thái.

**Banner theo trạng thái (nguyên văn):**

| Trạng thái | Requester thấy |
|---|---|
| `waiting_accept`/`pending` | "⏳ Chờ nhà cung cấp chấp nhận" |
| `accepted` | "💳 Bước 1: Gửi tiền cho nhà cung cấp" (xem UC-R-06) |
| `payment_sent` | "⏳ Chờ nhà cung cấp xác nhận đã nhận tiền..." |
| `payment_confirmed` | "🔄 Nhà cung cấp đang chuyển tiền cho {người thụ hưởng} qua {phương thức}..." |
| `transfer_sent` | Nút xác nhận hoàn tất (xem UC-R-07) |
| `completed` | "🎉 Giao dịch hoàn tất!" + phí + escrow giải phóng |
| `rejected` | "Nhà cung cấp từ chối. Thử tìm deal khác." |
| `disputed` | "⚠️ Đang trong quá trình khiếu nại" + "Khiếu nại bởi: {Bạn/tên Provider}" |

---

### UC-R-05 — Hủy yêu cầu

- **Chỉ** khi trạng thái còn "Chờ chấp nhận" (`pending`/`waiting_accept`) [BR-25].
- Nút **"Hủy yêu cầu"** → `cancelled` ngay (không hỏi lại, không phí — phí chưa phát sinh vì chưa được chấp nhận).
- Từ thời điểm Provider chấp nhận, Requester **không còn đường rút lui đơn phương** — chỉ có thể đi tiếp hoặc khiếu nại. Đây là quy tắc cân bằng với việc Provider bị thu phí ngay khi chấp nhận.

---

### UC-R-06 — Thanh toán cho Provider & nộp bằng chứng

| Mục | Nội dung |
|---|---|
| **Điều kiện trước** | Trạng thái `accepted` |
| **Mô tả** | Bước rủi ro cao nhất với Requester: chuyển tiền thật cho Provider ngoài hệ thống |

**Luồng chính:**

1. Khối **"💳 Bước 1: Gửi tiền cho nhà cung cấp"** chỉ dẫn: *"Chuyển {số tiền} qua {phương thức} cho {tên Provider}"*.
2. Hệ thống hiển thị **tài khoản nhận tiền của Provider** (SĐT Zelle/handle Venmo/email PayPal/ngân hàng + số tài khoản — mỗi trường có nút copy). Nguồn dữ liệu: thông tin đính kèm yêu cầu, nếu trống thì **tự tra cứu tài khoản đã lưu của Provider** khớp phương thức + tiền tệ [BR-23]; không có thì cảnh báo *"⚠️ Chưa có tài khoản · Liên hệ {Provider}"*.
3. Khối memo: **"Memo / Nội dung chuyển khoản:"** {mã} + cảnh báo *"⚠️ Vui lòng điền chính xác {mã} vào ghi chú / memo của giao dịch khi chuyển tiền cho nhà cung cấp."* [BR-21]
4. Requester chuyển tiền thật ngoài hệ thống.
5. Bấm **"📤 Xác nhận đã gửi tiền & tải bằng chứng"** → modal **"Xác nhận đã gửi tiền"** (*"Tải lên bằng chứng bạn đã gửi {số tiền} qua {phương thức}"*) → đính kèm tối đa 10 tệp + ghi chú → xác nhận → `payment_sent`, lưu `paymentProof`.

**Luồng thay thế:** Requester chuyển thiếu/sai memo → Provider không xác nhận → giao dịch đứng ở `payment_sent`; Requester có quyền khiếu nại từ thời điểm này (UC-R-08).

---

### UC-R-07 — Xác nhận hoàn tất giao dịch

| Mục | Nội dung |
|---|---|
| **Điều kiện trước** | Trạng thái `transfer_sent` và có `transferProof` |
| **Mô tả** | Requester giữ "quyền chốt" cuối cùng — xác nhận người thụ hưởng đã thực nhận đủ tiền |

**Luồng chính:**

1. Xem khu **"Bằng chứng nhà cung cấp đã chuyển tiền"**.
2. Kiểm tra thực tế với người thụ hưởng (ngoài hệ thống).
3. Bấm **"✓ Đã nhận đủ tiền {tiền tệ} - Hoàn tất"** → `completed`, ghi `completedAt`, **giải phóng escrow** (`escrowLocked = false`).
4. Màn hình kết quả: *"🎉 Giao dịch hoàn tất!"* — *"- Phí hệ thống (0.5%): {số tiền}"* — *"- Escrow đã được giải phóng"*.

**Luồng thay thế:** người thụ hưởng chưa nhận được/thiếu tiền → không xác nhận, dùng UC-R-08 khiếu nại. (Nếu Requester "ỉm" không xác nhận dù đã nhận đủ, Provider có quyền khiếu nại — UC-P-07.)

---

### UC-R-08 — Khiếu nại giao dịch (phía Requester)

- **Điều kiện:** có `paymentProof` (đã từng thanh toán) và trạng thái thuộc {`payment_sent`, `payment_confirmed`, `transfer_sent`} [BR-24]. Phạm vi khiếu nại của Requester **rộng hơn Provider** (3 trạng thái so với 1) — phản ánh việc Requester là bên xuống tiền trước, chịu rủi ro sớm hơn.
- Nút **"⚠️ Khiếu Nại"** → modal "Khiếu nại giao dịch" → mô tả + đính kèm → `disputed`, `disputedBy = "requester"`.
- Hai bên cùng thấy thông tin khiếu nại; giao dịch dừng tại đây chờ xử lý ngoài hệ thống (mục 10).

---

### UC-R-09 — Quản lý tài khoản liên kết (người nhận)

Tab **"Liên kết"** — *"Tài khoản liên kết · Thêm, sửa hoặc xoá tài khoản nhận tiền"*: nơi lưu hồ sơ người thụ hưởng/tài khoản hay dùng để **tự điền 1 chạm** ở UC-R-01.

- Danh sách nhóm theo tiền tệ, thống kê "{n} tài khoản · {m} loại tiền"; mỗi mục: nhãn + chi tiết (copy được) + sửa + xóa (**có xác nhận**: *"Xoá tài khoản này?"*).
- Form thêm/sửa giống phía Provider: "Loại tiền tệ" → "Hình thức thanh toán" → "Tên gợi nhớ" (bắt buộc) → trường động theo phương thức (username Venmo / SĐT-email / ngân hàng + số TK + chủ TK).
- Trạng thái trống: *"Chưa có tài khoản nào — Thêm tài khoản để nhận thanh toán"*.

### 5.10. Những điều Requester KHÔNG thể làm

| Hạn chế | Hệ quả nghiệp vụ |
|---|---|
| Không sửa được yêu cầu đã gửi (số tiền, người nhận, phương thức) | Sai thì phải hủy (khi còn được hủy) và tạo lại |
| Không thương lượng tỷ giá | Tỷ giá chốt theo deal; "mặc cả" chỉ có thể qua lời nhắn và Provider từ chối/chấp nhận |
| Không hủy sau khi Provider đã chấp nhận | Chỉ đi tiếp hoặc khiếu nại |
| Không khiếu nại trước khi tự mình thanh toán | Điều kiện cần `paymentProof` |
| Không liên hệ trực tiếp trong ứng dụng (chat/gọi) | Kênh liên lạc duy nhất là lời nhắn lúc tạo yêu cầu |
| Không đánh giá Provider sau giao dịch (chưa có chức năng) | Rating hiện là dữ liệu tĩnh — mục 10 |

### 5.11. Màn hình & điều hướng (Requester)

| Tab | Nhãn | Nội dung chính |
|---|---|---|
| 1 | "Gửi tiền" | Wizard 3 bước tạo yêu cầu |
| 2 | "Yêu cầu" (badge đếm "chờ chấp nhận") | 4 bộ lọc; card → màn "Chi tiết giao dịch" |
| 3 | "Liên kết" | Quản lý tài khoản người nhận |
| 4 | "Hồ sơ" | Hồ sơ + chỉ số + menu (Tài khoản liên kết / Lịch sử giao dịch / Cài đặt thông báo / Bảo mật & xác thực — 3 mục sau là placeholder) + "Đăng xuất" |

---

## 6. MA TRẬN QUYỀN HÀNH ĐỘNG THEO TRẠNG THÁI

| Trạng thái (nhãn) | Provider được làm | Requester được làm | Hệ thống làm |
|---|---|---|---|
| `pending`/`waiting_accept` («Chờ chấp nhận») | ✅ "Chấp nhận" · ❌ "Từ chối" | 🚫 "Hủy yêu cầu" | Đếm badge, gắn nhãn "MỚI" |
| `accepted` («Chờ thanh toán») | (chờ) | 📤 Thanh toán + nộp bằng chứng | Hiện tài khoản Provider + memo; khóa escrow; chốt phí |
| `payment_sent` («Chờ xác nhận») | ✅ Xác nhận đã nhận đủ tiền | ⚠️ Khiếu nại | Hiện bằng chứng thanh toán cho Provider |
| `payment_confirmed` («Đang chuyển tiền») | 📤 Chi trả + nộp bằng chứng | ⚠️ Khiếu nại | Hiện hướng dẫn chi trả + memo cho Provider |
| `transfer_sent` («Chờ hoàn tất») | ⚠️ Khiếu nại | ✅ Xác nhận hoàn tất · ⚠️ Khiếu nại | Hiện bằng chứng chi trả cho Requester |
| `completed` («Hoàn thành») | — | — | Giải phóng escrow; tổng kết phí |
| `rejected` / `cancelled` / `disputed` | — | — | Lưu hồ sơ; disputed chờ xử lý ngoài hệ thống |

---

## 7. DANH MỤC QUY TẮC NGHIỆP VỤ (BUSINESS RULES)

### Nhóm Deal

| Mã | Quy tắc |
|---|---|
| **BR-01** | Deal phải có: cặp tiền tệ, tỷ giá > 0, hạn mức tối thiểu < tối đa, ≥ 1 phương thức nhận tiền (đầu gửi) và ≥ 1 phương thức chi trả (đầu nhận), thời gian chuyển cam kết, hạn hiệu lực (7/14/30 ngày) |
| **BR-02** | Deal mới đăng có hiệu lực ngay (`active`) và hiển thị công khai trên marketplace của mọi Requester |
| **BR-03** | Chỉ deal `active` xuất hiện trong kết quả tìm kiếm; `paused`/`expired` bị ẩn khỏi marketplace |
| **BR-04** | Phương thức thanh toán của deal bị ràng buộc theo tiền tệ (ma trận tại mục 8.2) |
| **BR-05** | Deal không sửa được sau khi đăng; chỉ tạm dừng/kích hoạt lại/xóa. Deal hết hạn không thao tác được |

### Nhóm Tìm kiếm & khớp deal

| Mã | Quy tắc |
|---|---|
| **BR-06** | Tỷ giá hiển thị ở bước nhập nhu cầu là **tham chiếu ước tính**; tỷ giá ràng buộc pháp lý là **tỷ giá của deal** được chốt vào yêu cầu lúc gửi |
| **BR-07** | Xếp hạng deal: lọc (đúng hành lang + `active` + đúng hạn mức) → chấm điểm (+10 khớp phương thức gửi, +10 khớp phương thức nhận) → sắp theo điểm giảm dần, đồng điểm theo tỷ giá giảm dần. Deal lệch hạn mức chỉ hiển thị tham khảo, không chọn được |
| **BR-08** | Thông tin người thụ hưởng bắt buộc thay đổi theo phương thức nhận: ví điện tử → tên + SĐT; chuyển khoản → tên + ngân hàng + số tài khoản; địa chỉ chỉ dùng cho nhận tiền mặt (tùy chọn) |
| **BR-09** | Tài khoản đã lưu chỉ được gợi ý khi khớp **cả** tiền tệ nhận **và** phương thức nhận đang chọn |

### Nhóm Phí

| Mã | Quy tắc |
|---|---|
| **BR-10** | Phí hệ thống 0,5% được chốt vào yêu cầu (tỷ lệ + số tiền) tại thời điểm Provider chấp nhận |
| **BR-11** | Cả hai bên cùng chịu phí: người gửi 0,5% số tiền gửi; Provider 0,5% số tiền gửi (cùng đơn vị tiền tệ gửi) |
| **BR-12** | Phí thu ngay khi chấp nhận và **không hoàn trả**, kể cả giao dịch sau đó khiếu nại/không hoàn tất |
| **BR-13** | Trước khi gửi yêu cầu/chấp nhận, mỗi bên đều được hiển thị đầy đủ phí và escrow sẽ phát sinh (modal "Xác nhận chấp nhận" phía Provider; khối phí trong chi tiết yêu cầu) |

### Nhóm Escrow

| Mã | Quy tắc |
|---|---|
| **BR-14** | Escrow khóa cho **cả hai bên**, mỗi bên đúng bằng giá trị giao dịch, tại thời điểm chấp nhận (`escrowLocked = true`) |
| **BR-15** | Escrow giải phóng khi và chỉ khi Requester xác nhận hoàn tất (`completed`) |
| **BR-16** | Trạng thái kết thúc không qua `completed` (rejected/cancelled trước chấp nhận) không phát sinh escrow; với `disputed`, escrow giữ nguyên trạng thái khóa chờ phân xử |

### Nhóm Bằng chứng & đối soát

| Mã | Quy tắc |
|---|---|
| **BR-17** | Mỗi bước chuyển tiền (thanh toán của Requester, chi trả của Provider) bắt buộc kèm bằng chứng mới được chuyển trạng thái |
| **BR-18** | Bằng chứng: tối đa 10 tệp ảnh/video/audio + ghi chú; hợp lệ khi có ≥ 1 tệp hoặc ghi chú khác rỗng; hệ thống tự sinh mã tham chiếu `REF-XXXXXXX` + dấu thời gian |
| **BR-19** | Bằng chứng hiển thị cho bên đối tác ngay khi nộp; không sửa/xóa được sau khi nộp |
| **BR-20** | Trình tự bằng chứng cố định: `paymentProof` (Requester) phải có trước; `transferProof` (Provider) có sau khi tiền được xác nhận |
| **BR-21** | Mã đối soát (memo) = `memo` của yêu cầu hoặc mã yêu cầu; Requester bắt buộc ghi đúng khi chuyển tiền; hiển thị kèm cảnh báo + nút copy ở cả hai phía |

### Nhóm Xác nhận & khiếu nại

| Mã | Quy tắc |
|---|---|
| **BR-22** | Nguyên tắc xác nhận chéo: bên **nhận tiền** là bên xác nhận (Provider xác nhận pha 1; Requester xác nhận pha 2). Mọi xác nhận là không thể đảo ngược |
| **BR-23** | Ở bước thanh toán, hệ thống hiển thị tài khoản nhận của Provider: ưu tiên thông tin đính kèm yêu cầu → fallback tài khoản đã lưu của Provider khớp (phương thức gửi + tiền tệ gửi) → không có thì cảnh báo liên hệ Provider |
| **BR-24** | Quyền khiếu nại: Requester — cần `paymentProof`, tại `payment_sent`/`payment_confirmed`/`transfer_sent`; Provider — cần `transferProof`, **chỉ** tại `transfer_sent`. Khiếu nại ghi nhận người khiếu nại, ghi chú, bằng chứng, thời điểm |
| **BR-25** | Requester chỉ hủy được khi yêu cầu chưa được chấp nhận (`pending`/`waiting_accept`) |

### Nhóm Hiển thị & thông báo

| Mã | Quy tắc |
|---|---|
| **BR-26** | Provider: yêu cầu phát sinh sau khi mở phiên gắn nhãn "🔔 MỚI"; badge đếm yêu cầu chờ (`pending` + `waiting_accept`) hiển thị ở Trang chủ và tab "Yêu cầu" |
| **BR-27** | Cả hai phía dùng chung 4 nhóm lọc yêu cầu: Chờ chấp nhận / Đang xử lý / Hoàn thành / Từ chối-Hủy-Khiếu nại, kèm số đếm động |
| **BR-28** | Mọi mốc thời gian hiển thị tương đối: "Vừa xong" / "{n} phút trước" / "{n} giờ trước" / "{n} ngày trước" |

---

## 8. DỮ LIỆU NGHIỆP VỤ

### 8.1. Thực thể chính & quan hệ

```
PROVIDER ──(1:n)── DEAL ──(1:n)── REQUEST ──(n:1)── REQUESTER
                                     │
                                     ├── paymentProof  : PROOF (0..1)
                                     ├── transferProof : PROOF (0..1)
                                     ├── disputeProof  : PROOF (0..1)
                                     └── thông tin NGƯỜI THỤ HƯỞNG (nhúng)
PROVIDER/REQUESTER ──(1:n)── TÀI KHOẢN THANH TOÁN (ProviderAccount)
```

| Thực thể | Thuộc tính nghiệp vụ chính |
|---|---|
| **Deal** | Cặp tiền tệ, tỷ giá, hạn mức min–max, phương thức nhận (đầu gửi), phương thức chi (đầu nhận), thời gian chuyển cam kết, hạn hiệu lực, ghi chú, trạng thái (active/paused/expired), bộ đếm yêu cầu; hồ sơ uy tín Provider (tên, rating, số đánh giá, verified, số GD) |
| **Request** | Tham chiếu deal; 2 bên (tên + rating); số tiền gửi, tỷ giá chốt, số tiền nhận; phương thức 2 đầu; hồ sơ người thụ hưởng (tên, SĐT, ngân hàng, số TK, địa chỉ); lời nhắn; tài khoản nhận của Provider + memo; trạng thái (10); phí (tỷ lệ + tiền); cờ escrow; 3 bằng chứng; các mốc thời gian (tạo, xác nhận tiền, hoàn tất, khiếu nại) |
| **Proof** | Loại, nhãn, mã tham chiếu, ghi chú, thời điểm, danh sách tệp media (url, loại, tên) |
| **Tài khoản thanh toán** | Tiền tệ, phương thức, tên gợi nhớ, và trường tùy phương thức: SĐT / email / handle / (ngân hàng + số TK + chủ TK) |

### 8.2. Ma trận tiền tệ × phương thức thanh toán

| Tiền tệ | Phương thức (yêu cầu thông tin) |
|---|---|
| 🇺🇸 USD | Zelle (SĐT) · Venmo (handle) · PayPal (SĐT/email) · Bank Transfer (ngân hàng + số TK) |
| 🇪🇺 EUR | PayPal (SĐT/email) · SEPA Transfer (IBAN) · Bank Transfer (ngân hàng + số TK) |
| 🇬🇧 GBP | PayPal (SĐT/email) · Bank Transfer (ngân hàng + số TK) |
| 🇸🇬 SGD | PayNow (SĐT) · Bank Transfer (ngân hàng + số TK) |
| 🇦🇺 AUD | PayID (SĐT/email) · PayPal (SĐT/email) · Bank Transfer (ngân hàng + số TK) |
| 🇯🇵 JPY | PayPay (SĐT) · Bank Transfer (ngân hàng + số TK) |
| 🇰🇷 KRW | KakaoPay (SĐT) · Bank Transfer (ngân hàng + số TK) |
| 🇹🇭 THB | PromptPay (SĐT) · Bank Transfer (ngân hàng + số TK) |
| 🇨🇳 CNY | WeChat Pay (SĐT) · Alipay (SĐT/email) · Bank Transfer (ngân hàng + số TK) |
| 🇻🇳 VND | MoMo (SĐT) · ZaloPay (SĐT) · "Chuyển khoản NH" (ngân hàng + số TK) |

Quy tắc định dạng tiền: VND định dạng `25.500.000₫` không lẻ; JPY/KRW không số lẻ; còn lại tối đa 2 số lẻ kèm ký hiệu ($, €, £...).

### 8.3. Vòng đời trạng thái Deal

| Trạng thái | Nhãn | Vào marketplace? | Chuyển tiếp |
|---|---|---|---|
| `active` | "Hoạt động" | ✔ | → paused (Provider), → expired (hết hạn) |
| `paused` | "Tạm dừng" | ✘ | → active (Provider) |
| `expired` | "Hết hạn" | ✘ | (kết thúc) |

---

## 9. KPI & BÁO CÁO ĐỀ XUẤT

Các chỉ số đã hiện diện trên giao diện (mức minh họa) và nên chính thức hóa khi có backend:

| Nhóm | KPI | Hiện diện trên UI |
|---|---|---|
| Nền tảng | Số deal đang hoạt động; số request đang xử lý; số giao dịch hoàn thành | Footer demo |
| Provider | Thu nhập trong ngày; deal đang mở; tổng GD hoàn thành; GD trong tháng; **tỷ lệ hoàn thành (%)**; điểm đánh giá & số lượt | Trang chủ + Hồ sơ |
| Requester | Tổng GD; GD trong tháng; tỷ lệ hoàn thành; điểm đánh giá | Hồ sơ |
| Vận hành (đề xuất thêm) | Thời gian trung bình mỗi pha (chờ chấp nhận → hoàn tất) so với SLA cam kết; tỷ lệ từ chối; tỷ lệ hủy; tỷ lệ khiếu nại & thời gian xử lý; doanh thu phí theo hành lang | Chưa có |

---

## 10. GIẢ ĐỊNH, RÀNG BUỘC & VẤN ĐỀ MỞ

### 10.1. Giả định của prototype

1. Một thiết bị = một danh tính cố định (Provider "Nguyễn Văn B" / Requester "Nguyễn Văn A"); chưa có đăng nhập.
2. Dòng tiền thật nằm ngoài hệ thống; hệ thống chỉ ghi nhận trạng thái + bằng chứng.
3. Đồng hồ hệ thống neo tại 26/02/2026 12:00 (phục vụ demo dữ liệu "x giờ trước"); rating, thu nhập ngày, thống kê hồ sơ là số liệu tĩnh minh họa.
4. "Đồng bộ thời gian thực" giữa hai vai trò được mô phỏng bằng state chia sẻ trong một trang web.

### 10.2. Vấn đề mở cần quyết định trước khi triển khai thực tế (Open Issues)

| # | Vấn đề | Mô tả & khuyến nghị |
|---|---|---|
| OI-01 | **Quy trình giải quyết khiếu nại** | `disputed` hiện là trạng thái treo vĩnh viễn, không có actor trọng tài, không có SLA, không có kết cục (hoàn tiền/xử thắng). Cần định nghĩa quy trình phân xử + vai trò Admin |
| OI-02 | **Escrow & ví chưa hạch toán thật** | Số dư ví chỉ là hằng số hiển thị; không có giữ/trừ/cộng tiền thực. Cần quyết định mô hình: ví nội bộ, ký quỹ, hay chỉ "cam kết mềm" |
| OI-03 | **Provider không thể khiếu nại ở pha nhận tiền** | Nếu nhận thiếu tiền/sai memo ở `payment_sent`, Provider chỉ có thể "không xác nhận" — giao dịch treo. Khuyến nghị mở quyền khiếu nại cho Provider từ `payment_sent` |
| OI-04 | **Không có timeout/SLA tự động** | Không có hạn chót cho từng pha (chấp nhận, thanh toán, chi trả, xác nhận hoàn tất) → giao dịch có thể treo vô hạn. Khuyến nghị: tự hủy yêu cầu quá hạn chấp nhận; nhắc/leo thang khi quá SLA |
| OI-05 | **Đánh giá sau giao dịch** | Rating hiển thị khắp nơi nhưng chưa có chức năng chấm điểm sau khi `completed`. Cần bổ sung để khép kín vòng uy tín |
| OI-06 | **Chuẩn hóa từ điển trạng thái** | (a) `pending` và `waiting_accept` trùng ý nghĩa, cần hợp nhất; (b) thống kê footer còn tham chiếu trạng thái `in_progress` không tồn tại trong từ điển; (c) ứng dụng Provider tồn tại 2 bộ nhãn badge song song — bộ cũ ở Trang chủ gắn `accepted` → "Đã nhận" trong khi bộ chính thức ở tab Yêu cầu gắn `accepted` → "Chờ thanh toán" (hiện chưa lộ ra UI vì Trang chủ chỉ liệt kê yêu cầu chờ duyệt, nhưng là nợ kỹ thuật cần dọn) |
| OI-07 | **Xóa không xác nhận** | Xóa deal (Provider) và xóa tài khoản thanh toán (Provider) không có bước xác nhận, trong khi phía Requester có. Cần đồng nhất: luôn xác nhận trước khi xóa |
| OI-08 | **Sửa deal** | Không sửa được deal buộc Provider xóa/tạo lại, mất lịch sử bộ đếm yêu cầu. Cân nhắc cho sửa có kiểm soát (không ảnh hưởng yêu cầu đã chốt tỷ giá) |
| OI-09 | **Tỷ giá tham chiếu cứng** | PREVIEW_RATES/SUGGESTED_RATES là bảng tĩnh; cần nguồn tỷ giá thị trường thật + chính sách làm mới |
| OI-10 | **KYC/AML & tuân thủ** | Mô hình chuyển tiền xuyên biên giới P2P chịu quy định pháp lý chặt (giấy phép remittance, AML/CTF, giới hạn ngoại hối). Bắt buộc đánh giá pháp lý trước khi vận hành thật |
| OI-11 | **Kênh liên lạc trong ứng dụng** | UI nhiều chỗ khuyên "Liên hệ nhà cung cấp" nhưng không có chat/SĐT. Cần kênh nhắn tin gắn với giao dịch |
| OI-12 | **Bảo mật dữ liệu nhạy cảm** | Số tài khoản, SĐT người thụ hưởng hiển thị/copy tự do; bằng chứng chứa thông tin tài chính. Cần chính sách che dấu (masking), phân quyền và lưu trữ an toàn |
| OI-13 | **Phí không hoàn khi giao dịch đổ vỡ** | Phí thu ngay lúc chấp nhận, không hoàn kể cả khi khiếu nại do lỗi bên kia — cần rà soát tính công bằng & truyền thông rõ trong điều khoản |

---

## PHỤ LỤC A — BẢNG TRẠNG THÁI GIAO DỊCH

| Mã trạng thái | Nhãn hiển thị | Nhóm lọc | Màu nền/chữ | Ý nghĩa |
|---|---|---|---|---|
| `pending` | "Chờ duyệt" | Chờ chấp nhận | Vàng | Yêu cầu chờ Provider duyệt (dữ liệu khởi tạo) |
| `waiting_accept` | "Chờ chấp nhận" | Chờ chấp nhận | Xanh dương | Yêu cầu mới gửi, chờ Provider duyệt |
| `accepted` | "Chờ thanh toán" | Đang xử lý | Xanh dương | Đã chấp nhận; chờ Requester chuyển tiền |
| `payment_sent` | "Chờ xác nhận" | Đang xử lý | Tím | Requester đã nộp bằng chứng thanh toán |
| `payment_confirmed` | "Đang chuyển tiền" | Đang xử lý | Vàng | Provider xác nhận đã nhận; đang chi trả |
| `transfer_sent` | "Chờ hoàn tất" | Đang xử lý | Xanh lục | Provider đã nộp bằng chứng chi trả |
| `completed` | "Hoàn thành" | Hoàn thành | Xanh lục | Requester xác nhận; escrow giải phóng |
| `rejected` | "Từ chối" | Từ chối/Khiếu nại | Đỏ | Provider từ chối yêu cầu |
| `cancelled` | "Đã hủy" | Từ chối/Khiếu nại | Xám | Requester hủy trước khi được chấp nhận |
| `disputed` | "Khiếu nại" | Từ chối/Khiếu nại | Cam | Một bên khiếu nại; chờ phân xử |

> *Ghi chú:* bảng trên là bộ nhãn chính thức (dùng ở tab Yêu cầu của cả hai phía). Riêng khối "Yêu cầu mới nhất" trên Trang chủ Provider dùng một bộ badge cũ có nhãn lệch (`accepted` → "Đã nhận") — không ảnh hưởng thực tế vì khối này chỉ hiển thị yêu cầu chờ duyệt; chi tiết tại OI-06.

## PHỤ LỤC B — DỮ LIỆU MẪU MINH HỌA

**B.1. Tỷ giá tham chiếu cho Requester (PREVIEW_RATES — trích):** USD→VND 25.500 · EUR→VND 27.900 · GBP→VND 32.200 · SGD→VND 19.050 · AUD→VND 16.900 · JPY→VND 172 · KRW→VND 19 · THB→VND 730 · CNY→VND 3.520 · USD→USD 0,98 · EUR→USD 1,08 · USD→EUR 0,92 ...

**B.2. Tỷ giá thị trường gợi ý cho Provider (SUGGESTED_RATES):** USD 25.500 · EUR 27.900 · GBP 32.200 · JPY 172 · KRW 19 · AUD 16.900 · SGD 19.100 · THB 730 · CNY 3.520.

**B.3. Deal mẫu trên marketplace (10):**

| Provider | Hành lang | Tỷ giá | Hạn mức | Thời gian | Rating |
|---|---|---|---|---|---|
| Hùng Mạnh ✓ | USD→VND | 25.520 | $50–10.000 | 30-60 phút | 4,9 (512 GD) |
| Thu Hà ✓ | USD→VND | 25.480 | $100–3.000 | 1-3 giờ | 4,8 (187 GD) |
| Đức Anh | USD→VND | 25.460 | $200–5.000 | 2-4 giờ | 4,6 (94 GD) |
| Lan Anh ✓ | EUR→VND | 27.850 | €50–2.000 | 1-2 giờ | 5,0 (63 GD) |
| Minh Phúc ✓ | GBP→VND | 32.150 | £50–3.000 | 1-2 giờ | 4,7 (302 GD) |
| Bảo Ngọc ✓ | SGD→VND | 19.050 | S$100–5.000 | 2-4 giờ | 4,8 (155 GD) |
| Quốc Bảo | AUD→VND | 16.900 | A$100–4.000 | 2-3 giờ | 4,5 (78 GD) |
| Thanh Thảo ✓ | JPY→VND | 172 | ¥10.000–500.000 | 1-2 giờ | 4,9 (421 GD) |
| Việt Anh ✓ | USD→USD | 0,98 | $100–8.000 | 1-2 giờ | 4,8 (233 GD) |
| Hải Yến ✓ | EUR→USD | 1,06 | €50–3.000 | 2-3 giờ | 4,7 (118 GD) |

(✓ = đã xác minh. Hành lang USD→USD: nhận USD ở Mỹ, chi trả USD vào tài khoản ngoại tệ tại VN, "phí" thể hiện qua tỷ giá 0,98.)

**B.4. Ví dụ chuỗi giao dịch hoàn chỉnh (yêu cầu mẫu r4):** $300 USD→VND, tỷ giá 25.500 → người thụ hưởng nhận 7.650.000₫ qua MB Bank. Bằng chứng thanh toán PayPal `PP-20260224XYZ` (12:00, xác nhận 12:10) → bằng chứng chi trả `MB-7650000-2402` (13:00) → hoàn tất 13:15. Phí hệ thống người gửi: $1,50.

## PHỤ LỤC C — TỪ ĐIỂN NHÃN/THÔNG ĐIỆP CHÍNH TRÊN UI

| Ngữ cảnh | Nhãn nguyên văn |
|---|---|
| Nút hành động chính của Provider | "Chấp nhận" · "Từ chối" · "✅ Đồng ý & Chấp nhận" · "Xác nhận đã nhận đủ {số tiền} qua {phương thức}" · "📤 Đã chuyển {tiền tệ} — Upload bằng chứng" · "⚠️ Khiếu Nại" · "Đăng Deal" · "Tạm dừng"/"Kích hoạt" |
| Nút hành động chính của Requester | "Tìm Deal Phù Hợp" · "Chọn deal này" · "Gửi Yêu Cầu" · "Hủy yêu cầu" · "📤 Xác nhận đã gửi tiền & tải bằng chứng" · "✓ Đã nhận đủ tiền {tiền tệ} - Hoàn tất" · "⚠️ Khiếu Nại" |
| Banner chờ | "⏳ Chờ nhà cung cấp chấp nhận" · "⏳ Chờ người gửi chuyển tiền…" · "⏳ Chờ nhà cung cấp xác nhận đã nhận tiền..." · "🔄 Nhà cung cấp đang chuyển tiền cho {tên}…" · "⏳ Chờ người dùng xác nhận đã nhận tiền..." |
| Kết quả | "🎉 Giao dịch hoàn tất!" / "🎉 Hoàn tất!" · "Nhà cung cấp từ chối. Thử tìm deal khác." · "⚠️ Khiếu nại bởi: {tên}" |
| Phí & escrow | "💸 Platform fee — thu ngay, không hoàn trả" · "🔒 Escrow — tạm giữ trong suốt giao dịch" · "🔓 Escrow giải phóng khi giao dịch hoàn tất." · "- Phí hệ thống (0.5%): {tiền}" · "- Escrow đã được giải phóng" |
| Đối soát | "Memo / Nội dung chuyển khoản:" · "⚠️ Vui lòng điền chính xác {memo} vào ghi chú / memo của giao dịch…" · "Điền chính xác nội dung này khi chuyển để đối soát." |
| Bằng chứng | "Xác nhận đã gửi tiền" · "Xác nhận đã chuyển tiền" · "Khiếu nại giao dịch" · "Bằng chứng thanh toán của bạn" · "Bằng chứng nhà cung cấp đã chuyển tiền" · "Bằng chứng thanh toán từ người gửi" · "📎 Bằng chứng khiếu nại" |

---

*Tài liệu được lập trên cơ sở phân tích toàn bộ mã nguồn prototype (ProviderApp, RequesterApp, ProofModal, mockData, App). Mọi nhãn trong dấu nháy kép là văn bản hiển thị nguyên văn trên giao diện.*
