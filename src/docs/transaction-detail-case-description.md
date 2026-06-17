# Mô tả các case màn hình Chi tiết giao dịch

Tài liệu này mô tả các trạng thái/case chính của màn hình **Transaction Detail / Chi tiết giao dịch** trong flow tìm deal, chọn deal, chấp nhận, upload bằng chứng, xác nhận nhận tiền và khiếu nại.

---

## 1. Tổng quan flow

### Flow A tìm deal và chọn deal

1. A vào màn **Tìm Deal**.
2. A nhập thông tin tìm deal.
3. A bấm **Tìm Deal Phù Hợp**.
4. Hệ thống chuyển sang màn **Deal phù hợp**.
5. A chọn một deal của B.
6. A xác nhận chọn deal.
7. Hệ thống tạo giao dịch giữa A và B với status **Chờ chấp nhận**.
8. B có **15 phút** để **Chấp nhận** hoặc **Huỷ/Từ chối**.
9. Nếu quá 15 phút chưa phản hồi, giao dịch chuyển sang status **Hết hạn**.
10. Nếu B chấp nhận, giao dịch chuyển sang status **Đang xử lý**.
11. Khi đang xử lý, hai bên có **1 giờ** để gửi tiền ngoài hệ thống và upload bằng chứng chuyển tiền.
12. Sau khi hai bên upload proof và xác nhận nhận đủ tiền, giao dịch chuyển sang **Hoàn tất**.
13. Nếu có vấn đề, một bên có thể mở **Khiếu nại**.

---

## 2. Quy tắc bằng chứng

- Mỗi bên chỉ upload bằng chứng cho khoản tiền **mình gửi**.
- Bằng chứng của bên kia là **view-only** đối với mình.
- Khi bên kia đã upload bằng chứng, mình có thể xem bằng chứng đó.
- Nếu mình đã nhận tiền từ bên kia, mình bấm **Xác nhận đã nhận tiền** hoặc **Xác nhận đã nhận đủ tiền**.
- Nếu mình đã upload bằng chứng nhưng bên kia chưa upload hoặc giao dịch có vấn đề, mình có thể **Khiếu nại**.
- Modal khiếu nại và modal giải thích khiếu nại cho phép upload:
  - Hình ảnh
  - Video
  - Audio
  - Tối đa 6 file
  - Có ghi chú/mô tả

---

# 3. Danh sách case màn hình chi tiết

---

## Case 01 — Chờ bên kia chấp nhận

### Khi nào xảy ra

Case này xảy ra sau khi:

1. A tìm deal.
2. A chọn deal của B.
3. A xác nhận chọn deal.
4. Hệ thống tạo giao dịch và chờ B phản hồi.

### Status

**Chờ bên kia chấp nhận**

### Countdown

**15 phút**

B có 15 phút để chấp nhận hoặc từ chối giao dịch.

### Nội dung hiển thị

- Thông tin giao dịch:
  - Mã giao dịch
  - A gửi bao nhiêu
  - Người thụ hưởng nhận bao nhiêu
  - Tỷ giá
  - Phương thức A sẽ gửi
  - Phương thức B sẽ gửi
- Trạng thái:
  - A: Đã chọn deal / Đã gửi yêu cầu
  - B: Chờ chấp nhận
- Countdown 15 phút.

### Action

Đối với A:

- Không có nút upload bằng chứng.
- Có thể xem trạng thái chờ.
- Có thể quay lại / xem lịch sử / huỷ nếu business cho phép.

Đối với B:

- Case tương ứng là **Case 08 — Chờ bên mình chấp nhận**.

### Chuyển trạng thái

- B chấp nhận → sang **Case 02 — Đã chấp nhận / Đang xử lý**.
- B từ chối → giao dịch chuyển sang **Đã từ chối**.
- Quá 15 phút → giao dịch chuyển sang **Hết hạn**.

---

## Case 02 — Đã chấp nhận / Đang xử lý / Mình cần upload bằng chứng

### Khi nào xảy ra

Case này xảy ra sau khi B đã chấp nhận giao dịch.

### Status

**Đang xử lý**

### Countdown

**1 giờ**

Hai bên có 1 giờ để:

- Gửi tiền ngoài hệ thống.
- Upload bằng chứng chuyển tiền.

### Nội dung hiển thị

- Thông tin giao dịch.
- Countdown 1 giờ.
- Luồng mình gửi tiền.
- Luồng bên kia gửi tiền.
- Khu vực bằng chứng của mình.
- Khu vực bằng chứng bên kia.

### Action của mình

- **Upload bằng chứng chuyển tiền**

Click button này mở modal upload proof.

### Modal upload bằng chứng chuyển tiền

Modal gồm:

- Upload file:
  - Hình ảnh
  - Có thể chụp ảnh
  - Có thể chọn file từ thiết bị
- Ghi chú / mô tả
- Button xác nhận upload

### Chuyển trạng thái

- Mình upload proof, bên kia chưa upload → sang **Case 04**.
- Bên kia upload proof trước, mình chưa upload → sang **Case 03**.
- Hai bên đều upload proof → sang **Case 05**.
- Quá 1 giờ nhưng chưa đủ proof → chuyển sang trạng thái timeout/expired/need review tuỳ business rule.

---

## Case 03 — Bên kia đã upload bằng chứng, mình chưa upload

### Khi nào xảy ra

Case này xảy ra khi:

- Bên kia đã gửi tiền và upload proof.
- Mình chưa upload proof cho khoản tiền mình gửi.

### Status

**Đang xử lý / Chờ bạn xử lý**

### Countdown

Vẫn dùng countdown 1 giờ của giai đoạn xử lý nếu còn thời gian.

### Nội dung hiển thị

- Proof của bên kia.
- Proof bên kia là view-only.
- Thông tin khoản tiền mình cần gửi.
- Khu vực upload proof của mình.

### Action

- **Xác nhận đã nhận tiền**
- **Upload bằng chứng chuyển tiền**

### Ý nghĩa action

**Xác nhận đã nhận tiền**

Dùng khi mình kiểm tra tài khoản và thấy tiền bên kia gửi đã vào.

**Upload bằng chứng chuyển tiền**

Dùng để upload proof cho khoản tiền mình gửi.

### Chuyển trạng thái

- Mình xác nhận đã nhận tiền nhưng chưa upload proof → vẫn cần upload proof nếu business yêu cầu đủ hai proof.
- Mình upload proof → nếu đã xác nhận nhận tiền, có thể chuyển sang hoàn tất hoặc chờ bên kia xác nhận phần của họ.
- Nếu cả hai bên đã upload proof → sang **Case 05**.

---

## Case 04 — Mình đã upload bằng chứng, bên kia chưa upload

### Khi nào xảy ra

Case này xảy ra khi:

- Mình đã gửi tiền.
- Mình đã upload proof.
- Bên kia chưa upload proof.

### Status

**Đang xử lý / Chờ bên kia upload bằng chứng**

### Countdown

Vẫn dùng countdown 1 giờ nếu còn thời gian.

### Nội dung hiển thị

- Proof mình đã upload.
- Trạng thái proof của mình: Đã upload.
- Khu vực bên kia: Chưa có bằng chứng.
- Thông tin người nhận / số tiền / phương thức.

### Action

- **Khiếu nại**

### Khi nào dùng khiếu nại

Dùng khi:

- Mình đã gửi tiền nhưng bên kia không gửi lại.
- Bên kia không upload proof.
- Bên kia không phản hồi.
- Giao dịch gần hết thời gian hoặc có dấu hiệu bất thường.

### Modal khiếu nại

Modal gồm:

- Upload hình ảnh / video / audio
- Tối đa 6 file
- Ghi chú khiếu nại
- Button gửi khiếu nại

### Chuyển trạng thái

- Bên kia upload proof → sang **Case 05**.
- Mình gửi khiếu nại → sang **Case 07**.

---

## Case 05 — Cả hai bên đã upload bằng chứng

### Khi nào xảy ra

Case này xảy ra khi:

- Mình đã upload proof.
- Bên kia cũng đã upload proof.
- Giao dịch chưa hoàn tất vì cần xác nhận đã nhận đủ tiền.

### Status

**Chờ xác nhận nhận đủ tiền**

### Nội dung hiển thị

- Proof mình đã upload.
- Proof bên kia đã upload.
- Proof bên kia là view-only.
- Trạng thái xác nhận nhận tiền.

### Action

- **Xác nhận đã nhận đủ tiền**
- **Khiếu nại**

### Ý nghĩa action

**Xác nhận đã nhận đủ tiền**

Dùng khi mình đã kiểm tra và xác nhận người thụ hưởng của mình đã nhận đủ tiền.

**Khiếu nại**

Dùng khi:

- Proof bên kia không đúng.
- Mình chưa nhận tiền.
- Nhận thiếu tiền.
- Tên / số điện thoại / tài khoản không khớp.
- Có vấn đề cần admin xử lý.

### Chuyển trạng thái

- Mình xác nhận đã nhận đủ tiền và bên kia cũng xác nhận → sang **Case 06 — Hoàn tất**.
- Mình khiếu nại → sang **Case 07**.
- Bên kia khiếu nại → sang **Case 09**.

---

## Case 06 — Hoàn tất

### Khi nào xảy ra

Case này xảy ra khi:

- Hai bên đã upload proof.
- Hai bên đã xác nhận đã nhận đủ tiền.
- Không còn khiếu nại mở.

### Status

**Hoàn tất**

### Nội dung hiển thị

- Thông tin giao dịch.
- Proof của hai bên.
- Timeline hoàn tất.
- Tổng kết giao dịch.

### Action

- **Đánh giá**

### Modal / form đánh giá

Gồm:

- Rating sao.
- Ghi chú / nhận xét.
- Button gửi đánh giá.

### Chuyển trạng thái

- Sau khi đánh giá, giao dịch vẫn giữ trạng thái **Hoàn tất**.
- Có thể lưu rating vào hồ sơ đối tác.

---

## Case 07 — Bên mình khiếu nại

### Khi nào xảy ra

Case này xảy ra khi mình là người mở khiếu nại.

Ví dụ:

- Mình chưa nhận đủ tiền.
- Mình đã gửi tiền nhưng bên kia không gửi.
- Proof bên kia không đúng.
- Thông tin nhận tiền không khớp.

### Status

**Bên mình khiếu nại / Đang khiếu nại**

### Nội dung hiển thị

- Lý do khiếu nại.
- Ghi chú khiếu nại.
- Bằng chứng khiếu nại mình đã upload.
- Trạng thái xử lý của admin.
- Proof giao dịch liên quan.

### Action

- **Rút khiếu nại**

### Ý nghĩa action

Dùng khi:

- Hai bên đã tự xử lý xong.
- Mình đã nhận đủ tiền.
- Mình muốn huỷ yêu cầu admin xử lý.

### Chuyển trạng thái

- Rút khiếu nại → quay lại trạng thái xử lý phù hợp, hoặc hoàn tất nếu hai bên đã xác nhận đủ.
- Admin xử lý xong → chuyển sang kết quả xử lý theo quyết định admin.

---

## Case 08 — Bên kia chờ bên mình chấp nhận

### Khi nào xảy ra

Case này xảy ra khi:

- Bên kia tìm thấy deal của mình.
- Bên kia chọn deal của mình.
- Hệ thống tạo yêu cầu giao dịch.
- Bên mình cần chấp nhận hoặc từ chối.

### Status

**Chờ bên mình chấp nhận**

### Countdown

**15 phút**

Bên mình có 15 phút để chấp nhận hoặc từ chối.

### Nội dung hiển thị

- Thông tin người yêu cầu.
- Số tiền giao dịch.
- Tỷ giá.
- Phương thức hai bên sẽ gửi/nhận.
- Countdown 15 phút.

### Action

- **Từ chối**
- **Chấp nhận**

### Modal confirm khi click Chấp nhận

Modal gồm:

- Tóm tắt giao dịch.
- Mình sẽ gửi bao nhiêu.
- Mình gửi qua phương thức nào.
- Bên kia sẽ gửi bao nhiêu.
- Bên kia gửi qua phương thức nào.
- Cảnh báo sau khi chấp nhận cần gửi tiền và upload proof.
- Button:
  - Huỷ
  - Đồng ý & Chấp nhận

### Chuyển trạng thái

- Click Chấp nhận và confirm → sang **Case 02 — Đã chấp nhận / Đang xử lý**.
- Click Từ chối → giao dịch chuyển sang **Đã từ chối**.
- Quá 15 phút → giao dịch chuyển sang **Hết hạn**.

---

## Case 09 — Bên kia khiếu nại

### Khi nào xảy ra

Case này xảy ra khi bên kia là người mở khiếu nại.

Ví dụ:

- Bên kia báo chưa nhận tiền.
- Bên kia cho rằng proof của mình không đúng.
- Bên kia báo nhận thiếu.
- Bên kia yêu cầu admin kiểm tra.

### Status

**Bên kia khiếu nại**

### Nội dung hiển thị

- Lý do bên kia khiếu nại.
- Mô tả khiếu nại.
- Proof liên quan.
- Trạng thái xử lý.
- Khu vực phản hồi của mình.

### Action

- **Giải thích về khiếu nại**

### Modal giải thích về khiếu nại

Modal gồm:

- Upload hình ảnh / video / audio
- Tối đa 6 file
- Ghi chú giải thích
- Button gửi giải thích

### Nội dung ghi chú gợi ý

Ví dụ:

- Đã chuyển tiền lúc nào.
- Mã giao dịch là gì.
- Tài khoản nhận nào.
- Tại sao proof hợp lệ.
- Bổ sung ảnh/video/audio nếu cần.

### Chuyển trạng thái

- Gửi giải thích → trạng thái chuyển thành **Chờ admin xử lý** hoặc **Đã phản hồi khiếu nại**.
- Admin xử lý xong → chuyển sang kết quả xử lý theo quyết định admin.

---

# 4. Status đề xuất

## Status chính

| Status | Ý nghĩa |
|---|---|
| `pending_acceptance` | Chờ một bên chấp nhận |
| `expired` | Hết hạn do quá thời gian chấp nhận |
| `rejected` | Bị từ chối |
| `processing` | Hai bên đã chấp nhận, đang xử lý |
| `waiting_proof` | Đang chờ upload bằng chứng |
| `proof_uploaded` | Đã có proof từ một hoặc hai bên |
| `waiting_receive_confirmation` | Chờ xác nhận đã nhận tiền |
| `completed` | Hoàn tất |
| `disputed_by_me` | Bên mình khiếu nại |
| `disputed_by_counterparty` | Bên kia khiếu nại |
| `dispute_resolved` | Khiếu nại đã xử lý |

---

# 5. Timer đề xuất

## Timer 1 — Chờ chấp nhận

Áp dụng cho:

- Case 01
- Case 08

Thời gian:

- 15 phút

Hết thời gian:

- Status chuyển sang `expired`.

## Timer 2 — Đang xử lý / Upload proof

Áp dụng cho:

- Case 02
- Case 03
- Case 04
- Case 05

Thời gian:

- 1 giờ

Hết thời gian:

Tuỳ business rule:

- Chuyển sang `expired_processing`
- Hoặc tự động mở review
- Hoặc cho phép khiếu nại
- Hoặc khoá action upload proof

---

# 6. Gợi ý cấu trúc dữ liệu

```ts
type TransactionStatus =
  | "pending_acceptance"
  | "expired"
  | "rejected"
  | "processing"
  | "waiting_proof"
  | "proof_uploaded"
  | "waiting_receive_confirmation"
  | "completed"
  | "disputed_by_me"
  | "disputed_by_counterparty"
  | "dispute_resolved";

interface TransactionTimer {
  type: "acceptance" | "proof_upload";
  startedAt: string;
  expiresAt: string;
  durationSeconds: number;
}

interface TransactionProof {
  id: string;
  uploadedBy: "me" | "counterparty";
  files: {
    id: string;
    type: "image" | "video" | "audio" | "pdf";
    url: string;
    name: string;
    size: number;
  }[];
  note: string;
  uploadedAt: string;
}

interface TransactionDispute {
  id: string;
  openedBy: "me" | "counterparty";
  reason: string;
  note: string;
  files: {
    id: string;
    type: "image" | "video" | "audio";
    url: string;
    name: string;
  }[];
  status: "open" | "explained" | "withdrawn" | "resolved";
  createdAt: string;
}
```

---

# 7. Mapping nhanh case → action

| Case | Status chính | Action chính |
|---|---|---|
| Case 01 | Chờ bên kia chấp nhận | Không upload proof, chờ B phản hồi |
| Case 02 | Đang xử lý | Upload bằng chứng chuyển tiền |
| Case 03 | Bên kia đã upload, mình chưa upload | Xác nhận đã nhận tiền, Upload proof |
| Case 04 | Mình đã upload, bên kia chưa upload | Khiếu nại |
| Case 05 | Hai bên đã upload proof | Xác nhận đã nhận đủ tiền, Khiếu nại |
| Case 06 | Hoàn tất | Đánh giá |
| Case 07 | Bên mình khiếu nại | Rút khiếu nại |
| Case 08 | Chờ bên mình chấp nhận | Từ chối, Chấp nhận |
| Case 09 | Bên kia khiếu nại | Giải thích về khiếu nại |
