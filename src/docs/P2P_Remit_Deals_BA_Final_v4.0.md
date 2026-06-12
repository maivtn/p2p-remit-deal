# TÀI LIỆU PHÂN TÍCH NGHIỆP VỤ TRIỂN KHAI - P2P REMIT DEALS

**Phiên bản:** Final v4.0 - Implementation Ready  
**Ngày lập:** 12/06/2026  
**Nguồn tổng hợp:** v1.0 + v2.0 + v3.0; trong đó v2.0 là bản nghiệp vụ sau cùng, v3.0 là bản hợp nhất, v4.0 là bản tối ưu để đưa vào triển khai.  
**Trạng thái:** Draft for Product / Engineering / QA / Operations / Legal review  
**Nguyên tắc:** Không phát hành giao dịch tiền thật nếu thiếu Legal Gate, KYC, ví/ledger, ký quỹ Provider, SLA engine và Admin dispute.

---

## 0. TÓM TẮT NÂNG CẤP TỪ v3.0 LÊN v4.0

Bản v3.0 đã hợp nhất đúng các quyết định lớn từ v2.0: state machine mới, ký quỹ Provider, Admin phân xử, phí thu khi hoàn tất, SLA, KYC, chat và rating. Tuy nhiên, để đội dự án có thể triển khai, tài liệu cần thêm lớp “delivery-ready”. v4.0 bổ sung các phần sau:

| Nhóm tối ưu | Nội dung thêm ở v4.0 | Giá trị cho triển khai |
|---|---|---|
| Scope triển khai | Chốt M0/M1/M2/M3, hard release gates, MVP không được cắt các thành phần niềm tin | Giảm rủi ro launch thiếu nền tảng an toàn |
| Requirement traceability | Bổ sung FR, BR, AC, NFR có mã ổn định | Dev/QA dễ bóc backlog, viết test, trace scope |
| State machine | Thêm guard condition, side effect, idempotency, invariant | Backend triển khai ít mơ hồ, tránh double action/double fee |
| Ledger & ký quỹ | Bổ sung ledger types, balance invariant, reconciliation rule, refund/penalty flow | Có nền tảng hạch toán nội bộ an toàn |
| Fee/Collateral hardening | Tách rõ tổng chi phí hiển thị với luồng thu phí thật; bổ sung công thức collateral theo kịch bản hoàn tiền Requester | Tránh mơ hồ hạch toán, giảm rủi ro thu phí qua Provider ngoài kiểm soát |
| API contract mức BA | Đề xuất resource/action/event, error model, idempotency key | Là cầu nối trước khi viết OpenAPI/technical design |
| Ops runbook | Dispute intake, evidence checklist, RACI, SLA vận hành | CS/Ops/Admin có quy trình xử lý thực tế |
| QA/Test | Test matrix theo state, vai trò, negative case, financial ledger | QA có cơ sở lập test suite end-to-end |
| Risk & Decision Log | Chốt quyết định, nêu câu hỏi mở có owner | PO/Legal/Tech biết phần nào còn phải phê duyệt |

---

## 1. EXECUTIVE SUMMARY CHO TRIỂN KHAI

P2P Remit Deals là marketplace hai chiều kết nối:

- **Requester:** người có nhu cầu chuyển tiền cho người thụ hưởng.
- **Provider:** người có thanh khoản ở hai đầu, niêm yết deal tỷ giá và thực hiện chi trả.
- **Platform:** hệ thống tạo niềm tin bằng KYC, ký quỹ Provider, ledger, proof, memo, SLA, Admin phân xử, chat và rating.

Mô hình vẫn giữ nguyên tinh thần từ prototype: dòng tiền giao dịch chính chạy ngoài hệ thống qua Zelle, Venmo, PayPal, MoMo, ZaloPay, chuyển khoản ngân hàng. Điểm khác biệt khi triển khai thật là nền tảng phải giữ **một phần tiền thật** trong ví nội bộ để ký quỹ Provider và thực thi phán quyết tranh chấp.

### 1.1. Kết luận BA quan trọng

1. **Niềm tin là sản phẩm lõi, không phải tính năng phụ.** Do đó MVP giao dịch thật bắt buộc có KYC, ký quỹ, ledger, SLA và dispute resolution.
2. **Requester không ký quỹ.** Requester đã chịu rủi ro chuyển tiền trước cho Provider; ký quỹ hai phía làm tăng vốn chết và giảm conversion.
3. **Provider ký quỹ đủ để bao phủ nghĩa vụ chi trả và kịch bản hoàn tiền Requester.** Đây là nguồn đền bù thật nếu Provider nhận tiền nhưng không chi trả đúng; công thức collateral phải được Finance/Legal chốt trước M1.
4. **Phí chỉ thu khi giao dịch hoàn tất hoặc theo phán quyết bên thua.** Cách này công bằng hơn so với thu ngay khi accept.
5. **Không có trạng thái treo vô hạn.** Mỗi trạng thái sống có timer, reminder, escalation hoặc quyết định của Admin.
6. **Dispute phải có lối ra chuẩn.** Chỉ đóng bằng 4 outcome: R1_complete, R2_refund_requester, R3_no_payment, R4_mutual_cancel.
7. **Không launch nếu pháp chế chưa phê duyệt mô hình.** Tài liệu này là BA/FSD, không thay thế legal memo.

### 1.2. Đề xuất MVP pilot

Vì mô hình có rủi ro pháp lý, thanh khoản và vận hành, BA đề xuất triển khai pilot hẹp trước:

| Thành phần | Đề xuất pilot |
|---|---|
| Corridor ưu tiên | USD -> VND hoặc 1 corridor chính do PO/Legal chốt |
| Phương thức ưu tiên | Bank Transfer + 1 ví phổ biến ở mỗi đầu, có khả năng đối soát tốt |
| Provider pilot | Nhóm nhỏ, KYC Tier 2, ký quỹ trước, training quy trình |
| Requester pilot | KYC Tier 1, hạn mức thấp, onboarding rõ phí/memo/proof |
| Admin coverage | Có người trực xử dispute theo SLA 48h trước khi mở giao dịch thật |
| Launch gate | E2E test completed và disputed -> resolved đạt 100%, ledger reconciliation 100% |

---

## 2. PHẠM VI, NGOÀI PHẠM VI VÀ GATE PHÁT HÀNH

### 2.1. Trong phạm vi v4.0

| Module | Nội dung |
|---|---|
| Onboarding & KYC | T0/T1/T2, role eligibility, hạn mức, trạng thái xác minh |
| Marketplace | Tìm deal, lọc, xếp hạng, hiển thị phí/tổng chi phí/tín hiệu uy tín |
| Deal Management | Tạo/sửa version/pause/delete/expire/repost, validate tỷ giá và tài khoản Provider |
| Request Lifecycle | Tạo request, state machine, timer, proof, memo, trạng thái đóng |
| Payment Guidance | Hiển thị tài khoản Provider, copy all, QR nếu hỗ trợ, tổng phải chuyển |
| Wallet & Ledger | Ví Provider, ký quỹ, lock/unlock/freeze, phí, phạt, đền bù, reconciliation |
| Dispute & Admin | Khiếu nại, Admin queue, evidence, phán quyết R1-R4, appeal giới hạn |
| Chat | Chat theo request, immutable log, Admin join khi disputed |
| Rating | Double-blind rating sau completed, tín hiệu đúng hạn/quá SLA |
| Notification | In-app, push/email tùy cấu hình, event-driven, deep-link |
| Reporting | KPI giao dịch, dispute, Provider, tài chính, rủi ro |
| Security & Privacy | Masking, unmask theo ngữ cảnh, proof access control, audit log |

### 2.2. Ngoài phạm vi tài liệu này

| Ngoài phạm vi | Ghi chú |
|---|---|
| Chọn vendor eKYC/gateway cụ thể | Tài liệu này nêu yêu cầu nghiệp vụ, không chọn nhà cung cấp |
| OpenAPI chi tiết | v4.0 chỉ nêu API contract mức BA; Tech Lead cần tách tài liệu API |
| Thiết kế database vật lý | v4.0 nêu entity/field nghiệp vụ; Engineering quyết định schema/index |
| Quy trình pháp lý theo từng quốc gia | Legal cần viết legal memo và compliance playbook riêng |
| Chính sách kế toán/thuế cuối cùng | Finance/Legal phê duyệt trước production |

### 2.3. Hard release gates

| Gate | Điều kiện đạt | Owner |
|---|---|---|
| G0 - Legal | Có legal memo cho corridor pilot, mô hình ví/ký quỹ/phí/dispute được phê duyệt | Legal + PO |
| G1 - KYC | User chưa đủ tier không thể giao dịch; Provider bắt buộc Tier 2 | Product + Engineering |
| G2 - Ledger | Mọi transaction nội bộ có ledger entry, cân bằng số dư trước/sau, audit được | Engineering + Finance |
| G3 - Collateral | Provider không accept được nếu ví khả dụng không đủ ký quỹ | Engineering |
| G4 - State Machine | Tất cả transition có guard, idempotency, side effects đúng | Engineering + QA |
| G5 - SLA/Notification | T1-T6 chạy tự động, reminder/escalation hoạt động | Engineering + Ops |
| G6 - Admin Dispute | Admin đóng được disputed bằng R1-R4, ledger thực thi đúng | Ops + QA |
| G7 - Security | Mask/unmask đúng quyền; proof URL hết hạn; audit log truy cập | Security + Engineering |
| G8 - E2E QA | Happy path, expired path, dispute path, negative financial path pass 100% | QA |

---

## 3. ACTORS, PERSONA VÀ RACI

### 3.1. Loại tài khoản và vai nghiệp vụ

Hệ thống phân biệt **loại tài khoản** (account type) với **vai nghiệp vụ** (role). Có 2 loại tài khoản:

| Loại tài khoản | Vai có thể giữ | KYC bắt buộc | Mục tiêu |
|---|---|---|---|
| **Member** | Requester, Provider, hoặc cả hai (dual-role) | T1 → Requester · T2 → Provider + dual-role | Tham gia giao dịch P2P — gửi tiền hoặc cung cấp thanh khoản |
| **Admin** | Admin / Arbitrator | Không áp dụng (tài khoản nội bộ, không tự đăng ký) | Phân xử tranh chấp, quản lý nền tảng, kiểm duyệt rủi ro |

#### Vai trong tài khoản Member

| Vai | KYC tối thiểu | Quyền chính | Ràng buộc chính |
|---|---|---|---|
| **Requester** | T1 | Tìm deal, gửi request, chuyển tiền ngoài hệ thống, upload proof, khiếu nại, xác nhận hoàn tất, đánh giá | Phí 0,5%; tuân thủ SLA thanh toán |
| **Provider** | T2 | Tạo/sửa deal, accept/reject request, xác nhận nhận tiền, chi trả Beneficiary, upload proof, khiếu nại, quản lý ví | Đủ ký quỹ; có tài khoản thanh toán; chịu SLA |
| **Dual-role** (Requester + Provider) | T2 | Toàn bộ quyền cả hai vai; chuyển đổi vai qua role switcher trong app | **Tối đa 1 giao dịch active tại mọi thời điểm, tính gộp cả hai vai** (INV-11) |

> **Beneficiary** (người nhận tiền) không có tài khoản hệ thống; thông tin do Member vai Requester khai báo hoặc chọn từ danh sách đã lưu.
>
> **System** điều phối state machine, SLA scheduler, notification, fee/collateral, masking — không tự `completed` nếu thiếu xác nhận hoặc phán quyết Admin.

### 3.2. RACI cấp quy trình

| Quy trình | Requester | Provider | Admin/Ops | System | Legal/Compliance |
|---|---|---|---|---|---|
| KYC Requester | R | - | C | A/R | C |
| KYC Provider | - | R | C | A/R | C |
| Tạo deal | - | R/A | C | R | - |
| Gửi request | R/A | C | - | R | - |
| Chấp nhận request | C | R/A | - | R | - |
| Thanh toán Provider | R/A | C | - | C | - |
| Xác nhận nhận tiền | C | R/A | - | R | - |
| Chi trả Beneficiary | C | R/A | - | C | - |
| Hoàn tất | R/A | C | - | R | - |
| Khiếu nại | R | R | A | R | C |
| Phán quyết | C | C | R/A | R | C |
| Đổi rule phí/SLA | C | C | C | R | A |

Ký hiệu: R = Responsible, A = Accountable, C = Consulted.

---

## 4. PRODUCT CAPABILITY MAP

| Capability | P0/M1 | P1/M2 | P2/M3 |
|---|---:|---:|---:|
| Đăng ký, login, OTP | Yes | - | - |
| KYC T1/T2 & hạn mức | Yes | Nâng cấp automation | Multi-market rules |
| Provider wallet & ledger | Yes | Rút/nạp nâng cao | Finance dashboard |
| Deal create/edit/version/pause | Yes | Repost/clone | Campaign/featured deal |
| Deal search/ranking | Yes | Ranking theo risk/SLA sâu hơn | ML personalization |
| Request state machine | Yes | Optimized UX | - |
| Proof/memo/copy/QR | Yes | Proof quality check | OCR đối soát |
| SLA engine | Yes | SLA theo corridor/provider tier | Predictive risk |
| Dispute Admin R1-R4 | Yes | Appeal workflow | Automation assist |
| Chat theo request | Có thể M1.5/M2 | Yes | Moderation nâng cao |
| Rating double-blind | M2 | Yes | Reputation scoring |
| Notification | Yes | Template & segmentation | Growth automation |
| AML/risk alerts | Basic | Advanced | Network analysis |
| Reporting/KPI | Basic | Ops dashboard | Finance/risk BI |

### 4.1. MVP không được cắt

Các capability sau **không được cắt khỏi M1 nếu xử lý giao dịch thật**: KYC T1/T2, Provider wallet, ledger, collateral lock, state machine, proof/memo, SLA T1-T6, Admin dispute R1-R4, notification tài chính, audit log.

---

## 5. THUẬT NGỮ CHUẨN

| Thuật ngữ | Định nghĩa chuẩn v4.0 |
|---|---|
| Corridor | Cặp tiền tệ gửi -> nhận, ví dụ USD -> VND |
| Deal | Bản chào tỷ giá của Provider gồm corridor, rate, hạn mức, method, SLA, hạn hiệu lực |
| Deal Version | Snapshot điều kiện deal tại một lần sửa; request luôn gắn với version cụ thể |
| Request | Yêu cầu chuyển tiền của Requester, là thực thể trung tâm có state machine |
| Provider Account | Tài khoản nhận tiền của Provider ở đầu gửi, dùng để Requester thanh toán |
| Beneficiary Account | Thông tin người nhận cuối, do Requester nhập/lưu |
| Memo | Mã đối soát bắt buộc ghi trong nội dung chuyển tiền cho Provider |
| Proof | Bằng chứng bất biến: file ảnh/video/audio + ghi chú + refCode + timestamp |
| Internal Wallet | Ví nội bộ dùng cho ký quỹ, phí, phạt, đền bù |
| Collateral | Khoản ký quỹ Provider bị lock/freeze để bảo vệ Requester |
| Ledger Entry | Bút toán bất biến ghi mọi thay đổi số dư ví |
| SLA Timer | Đồng hồ theo pha, dùng nhắc hạn và escalation |
| Dispute | Case khiếu nại phát sinh từ request, do Admin xử lý |
| Resolution Outcome | Kết cục phán quyết R1/R2/R3/R4 |
| Rating Double-blind | Đánh giá 2 chiều, chỉ công khai khi cả hai đã đánh giá hoặc hết hạn |

---

## 6. MÔ HÌNH NGHIỆP VỤ END-TO-END

### 6.1. Happy path

```text
Provider KYC T2 + nạp ví + khai báo account
      -> tạo deal active
Requester KYC T1
      -> nhập nhu cầu
      -> chọn deal
      -> gửi request
System tạo pending_acceptance + T1
Provider accept nếu đủ collateral
      -> System lock collateral + accepted + T2
Requester chuyển tiền ngoài hệ thống + đúng memo + upload paymentProof
      -> payment_sent + T3
Provider đối soát, xác nhận nhận đủ
      -> payment_confirmed + T4
Provider chuyển tiền cho Beneficiary + upload transferProof
      -> transfer_sent + T5
Requester xác nhận Beneficiary nhận đủ
      -> completed
System thu phí, unlock collateral, mở rating window
```

### 6.2. Dispute path

```text
payment_sent / payment_confirmed / transfer_sent
      -> Requester hoặc Provider mở dispute theo quyền
      -> System freeze collateral + tạo case Admin + T6
      -> Admin thu thập proof/chat/ledger/sao kê
      -> Admin chọn R1/R2/R3/R4
      -> System thực thi ledger + cập nhật violation/reputation
      -> request resolved
```

### 6.3. Expiry path

| Pha | Điều kiện hết hạn | Kết quả |
|---|---|---|
| pending_acceptance | Provider không phản hồi trước T1 | request -> expired; không phí; gợi ý deal khác |
| accepted | Requester không upload paymentProof trước T2 | request -> expired; unlock collateral; +1 violation Requester |
| payment_sent | Provider không xác nhận trước T3 | ticket Admin; không tự chuyển trạng thái |
| payment_confirmed | Provider không chi trả trước T4 | ticket Admin; Requester được CTA khiếu nại nổi bật |
| transfer_sent | Requester không xác nhận trước T5 | ticket Admin; không tự completed |
| disputed | Admin quá T6 | escalate trưởng nhóm vận hành |

---

## 7. STATE MACHINE CHUẨN v4.0

### 7.1. Danh mục trạng thái

| Status | Nhãn Requester | Nhãn Provider | Nhóm | Ai cầm lượt | Timer | Kết thúc? |
|---|---|---|---|---|---|---|
| pending_acceptance | Chờ nhà cung cấp chấp nhận | Yêu cầu mới cần phản hồi | Chờ chấp nhận | Provider | T1 | No |
| accepted | Chờ bạn chuyển tiền | Chờ người gửi thanh toán | Đang xử lý | Requester | T2 | No |
| payment_sent | Chờ Provider xác nhận nhận tiền | Cần đối soát tiền vào | Đang xử lý | Provider | T3 | No |
| payment_confirmed | Provider đang chuyển tiền | Cần chuyển cho người nhận | Đang xử lý | Provider | T4 | No |
| transfer_sent | Chờ bạn xác nhận hoàn tất | Chờ người gửi xác nhận | Đang xử lý | Requester | T5 | No |
| disputed | Đang phân xử | Đang phân xử | Khiếu nại | Admin + các bên | T6 | No |
| completed | Hoàn thành | Hoàn thành | Hoàn thành | - | - | Yes |
| rejected | Bị từ chối | Đã từ chối | Đã đóng | - | - | Yes |
| cancelled | Đã hủy | Người gửi đã hủy | Đã đóng | - | - | Yes |
| expired | Hết hạn | Hết hạn | Đã đóng | - | - | Yes |
| resolved | Đã phân xử | Đã phân xử | Đã đóng | - | - | Yes |

### 7.2. Transition table với guard và side effect

| ID | From | Action | Actor | Guard bắt buộc | To | Side effect |
|---|---|---|---|---|---|---|
| ST-00 | — (tạo mới) | create_request | Requester | Requester KYC T1; deal active; amount trong min/max; **account không có request non-terminal nào ở bất kỳ vai nào** (INV-11) | pending_acceptance | start T1; notify Provider |
| ST-01 | pending_acceptance | accept_request | Provider | Provider KYC T2; deal active/version valid; wallet available >= collateral; request not expired; **account không có request non-terminal nào ở bất kỳ vai nào** (INV-11) | accepted | lock collateral; snapshot fee/rate/SLA; start T2; notify Requester |
| ST-02 | pending_acceptance | reject_request | Provider | rejectReason not empty | rejected | store reason; notify Requester; stop T1 |
| ST-03 | pending_acceptance | cancel_request | Requester | confirm dialog accepted | cancelled | stop T1; no fee |
| ST-04 | pending_acceptance | timer_expired_T1 | System | now > deadline; no prior terminal status | expired | notify both; suggest alternative deals |
| ST-05 | accepted | submit_payment_proof | Requester | proof valid; at least note or file; before/after T2 depending policy | payment_sent | save immutable proof; start T3; notify Provider |
| ST-06 | accepted | timer_expired_T2 | System | no paymentProof | expired | unlock collateral; violation Requester; notify both |
| ST-07 | payment_sent | confirm_payment_received | Provider | confirmation 2-step; no active dispute | payment_confirmed | paymentConfirmedAt; start T4; notify Requester |
| ST-08 | payment_sent | provider_open_dispute | Provider | >= 30 minutes after paymentProof; dispute category; evidence attached | disputed | freeze collateral; create Admin case; start T6 |
| ST-09 | payment_sent | requester_open_dispute | Requester | paymentProof exists; category; evidence/note | disputed | freeze collateral; create Admin case; start T6 |
| ST-10 | payment_confirmed | submit_transfer_proof | Provider | transfer proof valid; beneficiary data available | transfer_sent | save immutable proof; start T5; notify Requester |
| ST-11 | payment_confirmed | requester_open_dispute | Requester | paymentProof exists; category | disputed | freeze collateral; create Admin case |
| ST-12 | transfer_sent | complete_request | Requester | transferProof exists; confirmation 2-step; checkbox checked | completed | charge fees; unlock collateral; completedAt; open rating |
| ST-13 | transfer_sent | requester_open_dispute | Requester | transferProof exists or SLA breach; category | disputed | freeze collateral; create Admin case |
| ST-14 | transfer_sent | provider_open_dispute | Provider | transferProof exists; reason Requester not confirming | disputed | freeze collateral; create Admin case |
| ST-15 | disputed | resolve_dispute | Admin | outcome R1-R4; rationale; evidence reviewed | resolved | ledger execution; update violations; notify; close T6 |
| ST-16 | payment_sent/payment_confirmed/transfer_sent | timer_escalate | System | deadline missed; not terminal | same status + ticket | create escalation ticket; notify Ops |

### 7.3. Invariants bắt buộc

| Mã | Invariant |
|---|---|
| INV-01 | Một request chỉ có một status hiện hành; mọi transition phải ghi vào status history. |
| INV-02 | Terminal status không được chuyển trạng thái, trừ khi có cơ chế appeal được phê duyệt riêng cho resolved. |
| INV-03 | Không được thu phí hai lần cho cùng một request. |
| INV-04 | Không được unlock collateral khi request đang disputed. |
| INV-05 | Ledger balanceAfter phải bằng balanceBefore cộng/trừ đúng amount theo transaction type. |
| INV-06 | Proof sau khi submit là immutable: không sửa, không xóa, chỉ bổ sung proof mới cho dispute nếu được phép. |
| INV-07 | Request luôn gắn dealVersionId; không dùng trực tiếp current rate của deal để tính request đã tạo. |
| INV-08 | Tất cả action tài chính phải có idempotency key. |
| INV-09 | Mọi unmask dữ liệu nhạy cảm phải ghi audit log: actor, requestId, field, timestamp, purpose. |
| INV-10 | Không tự completed ở transfer_sent nếu thiếu xác nhận Requester hoặc outcome R1 của Admin. |
| INV-11 | **Một account chỉ được có tối đa 1 request ở non-terminal status tại mọi thời điểm, tính gộp qua cả hai vai (Requester và Provider).** Một account KYC T2 có thể giữ cả hai vai, nhưng không thể tham gia 2 giao dịch đồng thời dù ở bất kỳ sự kết hợp vai nào. Non-terminal = `pending_acceptance`, `accepted`, `payment_sent`, `payment_confirmed`, `transfer_sent`, `disputed`. System phải block `create_request` và `accept_request` nếu account đã có bất kỳ request non-terminal nào ở bất kỳ vai nào, và phải hiển thị deep-link đến giao dịch đang dở. |

---

## 8. MÔ HÌNH TÀI CHÍNH, VÍ, KÝ QUỸ VÀ LEDGER

### 8.1. Nguyên tắc tài chính

| Hạng mục | Quy tắc v4.0 |
|---|---|
| Phí hệ thống | 0,5% số tiền gửi cho mỗi bên, tổng 1% |
| Thời điểm chốt phí | Khi Provider accept request |
| Thời điểm thu phí | Khi completed hoặc theo outcome resolved |
| Phí Requester | Hiển thị trong tổng chi phí. Luồng thu khuyến nghị: platform wallet/gateway pre-authorization và capture khi completed/resolved; không mặc định chuyển phí cho Provider nếu chưa có cơ chế settlement rõ |
| Phí Provider | Trừ từ ví nội bộ khi completed hoặc resolved nếu thua |
| Ký quỹ Provider | Lock giá trị đủ bảo vệ: max(nghĩa vụ chi trả cho Beneficiary, giá trị hoàn tiền cho Requester) + buffer cấu hình; currency và FX policy do Finance/Legal chốt |
| Requester collateral | Không áp dụng trong MVP |
| Disputed | Collateral chuyển từ locked sang frozen hoặc giữ trạng thái frozen logical đến khi resolved |
| Refund/Compensation | Chỉ thực hiện qua ledger theo outcome Admin, không xử tay ngoài hệ thống |

### 8.1.1. Quyết định v4-FEE-01 - tách phí Requester khỏi khoản chuyển P2P

Ở v2/v3 có cách diễn đạt “total payable = amountSend + requesterFee”. Điều này đúng ở góc nhìn tổng chi phí của Requester, nhưng chưa đủ rõ cho hạch toán. Nếu Requester chuyển cả phí nền tảng cho Provider ngoài hệ thống, platform không kiểm soát trực tiếp được doanh thu, Provider phải settlement lại phí, và dispute sẽ phức tạp hơn.

Vì vậy, BA khuyến nghị MVP triển khai một trong hai phương án và phải chốt trước M1:

| Phương án | Mô tả | Khuyến nghị |
|---|---|---|
| A - Platform collect | Requester fee được pre-authorize/capture qua platform wallet/gateway; khoản chuyển P2P cho Provider chỉ là amountSend | **Ưu tiên** vì ledger rõ, platform kiểm soát doanh thu, ít tranh chấp |
| B - Provider collect & settle | Requester chuyển amountSend + requesterFee cho Provider; platform thu lại phí từ Provider wallet theo ledger | Chỉ dùng nếu Legal/Finance phê duyệt và có settlement report rõ |

UI phải tách bạch: **“Số tiền chuyển cho Provider”**, **“Phí nền tảng”**, **“Tổng chi phí của bạn”**. Không dùng một con số “tổng phải chuyển” nếu nó làm người dùng hiểu rằng toàn bộ đều chuyển cho Provider.

### 8.1.2. Quyết định v4-COL-01 - collateral phải bao phủ kịch bản hoàn tiền

Collateral không chỉ là “nghĩa vụ chi trả cho Beneficiary”. Khi Provider nhận tiền nhưng không chi trả, platform cần có nguồn bồi hoàn cho Requester. Công thức nghiệp vụ đề xuất:

```text
collateralRequired = max(payoutObligationFxEquivalent, requesterRefundExposure) x (1 + bufferRate)
```

Trong đó:

| Thành phần | Ý nghĩa |
|---|---|
| payoutObligationFxEquivalent | Giá trị số tiền Provider phải chi cho Beneficiary, quy đổi về collateral currency |
| requesterRefundExposure | Giá trị có thể phải hoàn cho Requester: amountSend + requesterFee đã capture nếu policy hoàn phí |
| bufferRate | Đệm rủi ro tỷ giá/phí, mặc định đề xuất 2% trong pilot |
| collateralCurrency | Currency ví/collateral được Finance/Legal chốt theo corridor pilot |

Nếu pilot USD -> VND, cần chốt trước: collateral giữ bằng USD, VND hay settlement currency khác. Quyết định này ảnh hưởng trực tiếp tới refund, FX gain/loss, ledger và legal model.

### 8.2. Wallet balance model

Mỗi ví có ba số dư nghiệp vụ:

| Số dư | Ý nghĩa | Có thể dùng accept request? | Có thể rút? |
|---|---|---:|---:|
| available | Số dư khả dụng | Yes | Yes |
| locked | Đang ký quỹ cho request sống | No | No |
| frozen | Đang freeze do dispute | No | No |

**Invariant ví:** `totalBalance = available + locked + frozen`.

### 8.3. Ledger transaction types

| Type | Khi phát sinh | Debit/Credit nghiệp vụ |
|---|---|---|
| wallet_topup | Provider nạp tiền ví | Credit available |
| wallet_withdraw | Provider rút tiền | Debit available |
| collateral_lock | Provider accept request | Debit available, credit locked |
| collateral_unlock | completed/expired/R1/R3/R4 | Debit locked/frozen, credit available |
| collateral_freeze | request disputed | Debit locked, credit frozen hoặc đánh dấu frozen |
| platform_fee_provider | completed/R1 hoặc Provider thua | Debit available/locked/frozen, credit platform revenue |
| platform_fee_requester | completed nếu thu qua tổng phải chuyển hoặc ghi nhận payable | Credit platform revenue theo chính sách thu |
| penalty_provider | Provider thua dispute hoặc vi phạm nặng | Debit frozen/available, credit platform revenue/penalty |
| penalty_requester | Requester thua dispute | Ghi nợ payable/violation hoặc debit ví nếu có |
| compensation_requester | R2 refund_requester | Debit frozen Provider, credit Requester/settlement payable |
| adjustment_admin | Điều chỉnh có phê duyệt | Bắt buộc reason, approver, audit |

### 8.4. Ví dụ hạch toán happy path

Giả sử request USD -> VND, Requester gửi 500 USD, Provider phải chi 12.750.000 VND, phí mỗi bên 2,5 USD hoặc quy đổi theo chính sách hệ thống.

| Bước | Ledger/Business effect |
|---|---|
| Provider accept | Lock collateral tương đương 12.750.000 VND + buffer trong ví Provider |
| Requester thanh toán Provider | Dòng tiền ngoài hệ thống; ledger nội bộ chưa ghi tiền giao dịch chính |
| Provider xác nhận nhận tiền | Chỉ ghi timestamp; không tạo ledger tiền chính |
| Provider chi trả Beneficiary | Dòng tiền ngoài hệ thống; lưu proof |
| Requester completed | Thu phí Provider; ghi nhận phí Requester theo chính sách; unlock collateral; mở rating |

### 8.5. Ví dụ hạch toán R2_refund_requester

| Bước | Ledger/Business effect |
|---|---|
| Requester đã thanh toán, Provider không chi trả | Requester mở dispute |
| System freeze collateral | locked -> frozen |
| Admin chọn R2 | Trích frozen collateral để bồi hoàn Requester theo chính sách payout/refund |
| Provider chịu phạt | Ghi penalty + violation; có thể khóa Provider nếu rủi ro cao |
| Request resolved | Status -> resolved; hai bên nhận phán quyết |

### 8.6. Reconciliation rules

| Mã | Rule |
|---|---|
| FIN-01 | Tổng ledger theo wallet phải bằng số dư ví hiện hành theo từng currency. |
| FIN-02 | Mọi request accepted phải có collateral_lock ledger. |
| FIN-03 | Mọi request completed/resolved/expired phải không còn locked/frozen collateral, trừ khi có appeal hold được phê duyệt. |
| FIN-04 | Mọi platform fee phải có requestId, userId, rate snapshot, amount, currency. |
| FIN-05 | Không cho balance âm, trừ payable nợ Requester nếu chính sách phê duyệt rõ. |
| FIN-06 | Mọi admin adjustment cần two-person approval nếu vượt ngưỡng cấu hình. |

---

## 9. SLA, NOTIFICATION VÀ ESCALATION

### 9.1. Timer matrix

| Timer | Status | Mặc định | Reminder | Hết hạn |
|---|---|---:|---|---|
| T1 | pending_acceptance | 2 giờ | 1h, 1h45 | expired |
| T2 | accepted | 1 giờ | 30p, 50p | expired + unlock collateral + violation Requester |
| T3 | payment_sent | 1 giờ | 30p, 50p | tạo ticket Admin, mark Provider late |
| T4 | payment_confirmed | SLA deal + 30p | 80% SLA | tạo ticket Admin, mở CTA dispute cho Requester |
| T5 | transfer_sent | 24 giờ | 6h, 20h | ticket Admin, không tự completed |
| T6 | disputed | 48 giờ | 24h | escalate trưởng nhóm vận hành |

### 9.2. Notification events

| Event | Người nhận | Kênh tối thiểu | Nội dung chính |
|---|---|---|---|
| request_created | Provider | In-app + push | Có yêu cầu mới cần phản hồi trước deadline |
| request_accepted | Requester | In-app + push/email | Provider đã chấp nhận; hướng dẫn thanh toán; T2 countdown |
| request_rejected | Requester | In-app + push | Lý do từ chối + CTA tìm deal tương tự |
| payment_proof_submitted | Provider | In-app + push | Requester đã nộp proof, cần đối soát |
| payment_confirmed | Requester | In-app | Provider xác nhận nhận tiền, đang chuyển cho người nhận |
| transfer_proof_submitted | Requester | In-app + push | Provider đã chuyển, cần kiểm tra và xác nhận |
| request_completed | Hai bên | In-app + email | Hoàn tất, phí, collateral, mở rating |
| request_expired | Hai bên | In-app | Hết hạn và hệ quả |
| dispute_opened | Hai bên + Admin | In-app + push/email | Case đã mở, SLA 48h |
| dispute_resolved | Hai bên | In-app + email | Outcome, rationale ngắn, tài chính thực thi |
| sla_reminder | Actor cầm lượt | In-app + push | Còn X thời gian để xử lý |
| admin_escalation | Admin/Ops | Console + alert | Case quá SLA hoặc gần quá SLA |

### 9.3. Microcopy bắt buộc

| Ngữ cảnh | Microcopy chuẩn |
|---|---|
| Chờ chấp nhận | Đã gửi tới {provider}. Nhà cung cấp cần phản hồi trước {deadline}. |
| Thanh toán | Bước quan trọng: dán đúng mã {memo} vào nội dung chuyển khoản. Đây là mã bảo vệ giao dịch của bạn. |
| Bạn được bảo vệ | Nhà cung cấp đã ký quỹ {collateralAmount}. Nếu có tranh chấp, đội trọng tài xử lý trong 48 giờ. |
| Chờ Provider chi trả | {provider} đang chuyển {amountReceive} cho {beneficiary} qua {method}. Cam kết trước {deadline}. |
| Xác nhận hoàn tất | Chỉ xác nhận khi {beneficiary} đã nhận đủ {amountReceive}. Hành động này không thể hoàn tác. |
| Dispute | Khiếu nại đã được tiếp nhận. Admin sẽ xử lý trong 48 giờ. |

---

## 10. DISPUTE, ADMIN VÀ OPS RUNBOOK

### 10.1. Điều kiện mở dispute

| Người mở | Status được mở | Điều kiện | Category bắt buộc |
|---|---|---|---|
| Requester | payment_sent | Đã upload paymentProof, Provider không xác nhận hoặc có vấn đề | Provider không xác nhận / Sai đối soát / Khác |
| Requester | payment_confirmed | Provider xác nhận nhận tiền nhưng chậm/không chi trả | Quá SLA / Không chi trả / Khác |
| Requester | transfer_sent | Provider đã upload transferProof nhưng Beneficiary chưa nhận/thiếu/sai | Chưa nhận / Thiếu tiền / Sai người nhận / Khác |
| Provider | payment_sent | Tối thiểu 30 phút sau paymentProof, tiền không về/thiếu/sai memo | Không nhận / Thiếu tiền / Sai memo / Proof nghi giả |
| Provider | transfer_sent | Đã upload transferProof nhưng Requester không xác nhận | Người gửi không xác nhận / Cần Admin xác minh |

### 10.2. Evidence checklist

| Case type | Bằng chứng tối thiểu |
|---|---|
| Requester đã thanh toán | Payment receipt, reference number, amount, sender account, memo, timestamp |
| Provider chưa nhận tiền | Sao kê/tài khoản nhận trong khoảng thời gian liên quan, payment method, memo search |
| Provider đã chi trả | Transfer receipt, beneficiary account, amount, timestamp, ref number |
| Beneficiary chưa nhận | Statement/screenshot từ beneficiary nếu có, account nhận, thời gian kiểm tra |
| Proof nghi giả | Metadata proof, đối chiếu ref number, dấu hiệu chỉnh sửa, statement xác minh |

### 10.3. Admin dispute workflow

| Bước | Mô tả | SLA nội bộ |
|---|---|---|
| A1 - Intake | Case vào queue; tự assign hoặc manual assign; kiểm tra thông tin tối thiểu | 2 giờ |
| A2 - Triage | Xác định loại dispute, mức rủi ro, cần thêm bằng chứng không | 6 giờ |
| A3 - Evidence request | Yêu cầu bên liên quan bổ sung bằng chứng theo template | 12 giờ phản hồi |
| A4 - Review | Xem timeline, proof, chat, ledger, KYC, lịch sử vi phạm | Trong T6 |
| A5 - Decision | Chọn R1/R2/R3/R4, nhập rationale, preview ledger effect | Trong 48 giờ |
| A6 - Execution | System thực thi ledger/status/notification; Admin kiểm tra kết quả | Ngay sau decision |
| A7 - Appeal hold | Nếu có phúc thẩm được phép, chuyển trưởng nhóm trong 7 ngày | Theo policy |

### 10.4. Resolution outcomes

| Outcome | Khi dùng | Tài chính | Uy tín/vi phạm |
|---|---|---|---|
| R1_complete | Bằng chứng cho thấy Beneficiary đã nhận đủ, Requester không xác nhận | Thu phí 2 bên; unlock collateral | Requester +1 violation xác nhận chậm |
| R2_refund_requester | Provider nhận tiền nhưng không chi trả/chi sai | Trích collateral bồi hoàn Requester; Provider chịu penalty | Provider violation nặng; có thể khóa |
| R3_no_payment | Requester chưa thanh toán hoặc proof giả | Unlock collateral Provider; Requester chịu penalty nếu policy cho phép | Requester violation/gian lận |
| R4_mutual_cancel | Hai bên đồng ý hủy hoặc lỗi khách quan | Hoàn trạng thái tiền, miễn phí/phạt | Không vi phạm hoặc ghi chú neutral |

### 10.5. Admin control requirements

- Admin không được sửa proof gốc, chỉ được thêm note/phán quyết.
- Admin decision phải có rationale, outcome, evidence references và audit log.
- Các action tài chính vượt ngưỡng cần second approval nếu cấu hình yêu cầu.
- Admin access phải theo RBAC: viewer, arbitrator, supervisor, finance admin, compliance admin.

---

## 11. KYC, AML, RISK VÀ DATA PROTECTION

### 11.1. KYC tiers

KYC chỉ áp dụng cho tài khoản **Member**. Tài khoản **Admin** được tạo nội bộ và không đi qua luồng KYC tự phục vụ.

| Tier | Yêu cầu | Loại tài khoản | Vai mở khóa | Hạn mức đề xuất |
|---|---|---|---|---|
| T0 | Email/SĐT + OTP | Member | Xem marketplace, lưu account (chưa giao dịch) | Không giao dịch |
| T1 | eKYC giấy tờ + liveness | Member | **Requester** | <= 1.000 USD/GD; <= 5.000 USD/30 ngày hoặc theo Legal |
| T2 | T1 + địa chỉ + nguồn tiền + tài khoản chính chủ | Member | **Provider** + giữ nguyên Requester → **Dual-role** | Theo thẩm định và risk score; giới hạn 1 giao dịch active gộp cả hai vai (INV-11) |
| — | Tạo nội bộ | **Admin** | Admin / Arbitrator | Không áp dụng |

### 11.2. Risk controls

| Risk | Control nghiệp vụ |
|---|---|
| Provider lừa đảo | KYC T2, ký quỹ 100%, rating, SLA, dispute R2 |
| Requester proof giả | Provider dispute tại payment_sent, Admin kiểm evidence, R3 |
| Sai memo/sai account | Copy all, QR, memo lớn, confirmation checklist |
| Giao dịch treo | SLA T1-T6, reminder, escalation |
| Deal tỷ giá ảo | Cảnh báo > +/-3%, chặn > +/-10%, rate source snapshot |
| Dis-intermediation | Chat warning, chỉ giao dịch trong app được bảo vệ, proof/ledger/rating gắn nền tảng |
| Lộ dữ liệu | Mask mặc định, unmask theo context, audit log, proof URL hết hạn |
| Rửa tiền/gian lận | KYC, hạn mức, risk score, velocity rule, beneficiary clustering, suspicious pattern review |

### 11.3. Data protection requirements

| Mã | Requirement |
|---|---|
| DP-01 | Số tài khoản, SĐT, email tài chính phải mask mặc định. |
| DP-02 | Full data chỉ hiển thị khi user đang ở bước cần hành động: Requester thanh toán hoặc Provider chi trả. |
| DP-03 | Mỗi lần unmask/copy phải ghi audit log. |
| DP-04 | Proof file chỉ truy cập qua signed URL có hạn; không public index. |
| DP-05 | Chat/proof/ledger/status history là record nghiệp vụ, không cho user tự xóa trong thời hạn lưu trữ bắt buộc. |
| DP-06 | Export dữ liệu cho Admin phải có quyền phù hợp và audit. |

---

## 12. FUNCTIONAL REQUIREMENTS v4.0

### 12.1. Onboarding & KYC

| ID | Requirement | Priority |
|---|---|---|
| FR-ONB-01 | System shall support two account types: **Member** (self-registered, subject to KYC) and **Admin** (internally provisioned, no KYC self-service). | P0 |
| FR-ONB-02 | System shall allow Member registration/login with phone/email OTP. Admin accounts shall be provisioned by platform operators only. | P0 |
| FR-ONB-03 | System shall prevent any transaction action for a Member account that has not met the required KYC tier. | P0 |
| FR-ONB-04 | System shall unlock the Requester role for Member accounts at KYC T1 or higher. | P0 |
| FR-ONB-05 | System shall unlock the Provider role for Member accounts at KYC T2; KYC T2 Member retains the Requester role (dual-role). | P0 |
| FR-ONB-06 | System shall enforce transaction limits by KYC tier, corridor and rolling window. | P0 |
| FR-ONB-07 | System shall store KYC status, tier, review reason and effective time for audit. | P0 |
| FR-ONB-08 | A KYC T2 Member account shall operate in both Requester and Provider roles (dual-role) without creating a separate account; the app shall provide a role switcher UI to navigate between both feature sets. | P0 |
| FR-ONB-09 | System shall enforce the cross-role single active transaction rule (INV-11): a Member account with an active non-terminal request in any role cannot initiate or accept another request in any role until the active request reaches a terminal status. | P0 |

### 12.2. Provider wallet & ledger

| ID | Requirement | Priority |
|---|---|---|
| FR-WAL-01 | Provider shall have wallet balances: available, locked, frozen by currency. | P0 |
| FR-WAL-02 | System shall create immutable ledger entry for every wallet-changing action. | P0 |
| FR-WAL-03 | System shall block accept_request if available balance is less than required collateral. | P0 |
| FR-WAL-04 | System shall support collateral lock, unlock and freeze by requestId. | P0 |
| FR-WAL-05 | System shall expose wallet transaction history to Provider and Finance/Admin. | P1 |
| FR-WAL-06 | System shall support reconciliation report by wallet, currency and date. | P0 |

### 12.3. Deal management

| ID | Requirement | Priority |
|---|---|---|
| FR-DEAL-01 | Provider shall create deal with corridor, rate, min/max, methods, SLA, expiry and note. | P0 |
| FR-DEAL-02 | System shall validate rate > 0 and min < max. | P0 |
| FR-DEAL-03 | System shall require at least one provider payment account for each receive method on deal. | P0 |
| FR-DEAL-04 | System shall warn if rate differs from market reference by > +/-3% and block if > +/-10%. | P0 |
| FR-DEAL-05 | Provider shall edit deal; system shall create new deal version. | P0 |
| FR-DEAL-06 | Existing requests shall keep original dealVersion snapshot. | P0 |
| FR-DEAL-07 | Provider shall pause/reactivate deal; paused deal not visible in marketplace. | P0 |
| FR-DEAL-08 | Provider shall soft delete deal only if no live requests exist; deletion requires confirmation. | P0 |

### 12.4. Marketplace & request creation

| ID | Requirement | Priority |
|---|---|---|
| FR-MKT-01 | Requester shall input send currency, receive currency, amount, methods and beneficiary. | P0 |
| FR-MKT-02 | System shall show estimated amountReceive, fee and total payable from the first step. | P0 |
| FR-MKT-03 | System shall filter deals by active status, corridor and min/max amount. | P0 |
| FR-MKT-04 | System shall rank deals by method match, receive amount/rate, SLA performance, rating and risk flags. | P0 |
| FR-MKT-05 | Requester shall select a deal and review snapshot before submitting request. | P0 |
| FR-MKT-06 | System shall create request in pending_acceptance and start T1. | P0 |

### 12.5. Transaction execution

| ID | Requirement | Priority |
|---|---|---|
| FR-TXN-01 | Provider shall accept or reject pending request; reject requires reason. | P0 |
| FR-TXN-02 | On accept, system shall lock collateral, snapshot fee/rate/SLA and start T2. | P0 |
| FR-TXN-03 | Requester shall see Provider account, total payable, memo, copy all and QR where supported. | P0 |
| FR-TXN-04 | Requester shall submit paymentProof to move accepted to payment_sent. | P0 |
| FR-TXN-05 | Provider shall confirm payment received with irreversible confirmation dialog. | P0 |
| FR-TXN-06 | Provider shall submit transferProof to move payment_confirmed to transfer_sent. | P0 |
| FR-TXN-07 | Requester shall complete request with irreversible confirmation dialog and beneficiary checked checkbox. | P0 |
| FR-TXN-08 | On completed, system shall charge fee, unlock collateral and open rating window. | P0 |
| FR-TXN-09 | System shall block `create_request` if the account has any non-terminal request in any role (Requester or Provider); error message shall name the blocking request and include a deep-link to it. | P0 |
| FR-TXN-10 | System shall block `accept_request` if the account has any non-terminal request in any role (Requester or Provider); error message shall name the blocking request and include a deep-link to it. | P0 |

### 12.6. Proof, memo and file handling

| ID | Requirement | Priority |
|---|---|---|
| FR-PRF-01 | Proof shall include type, uploader, note, refCode, files and timestamp. | P0 |
| FR-PRF-02 | Proof shall be valid if it has at least one file or non-empty note. | P0 |
| FR-PRF-03 | Proof files shall support image/video/audio with configurable max count and size. | P0 |
| FR-PRF-04 | Proof shall be immutable after submission. | P0 |
| FR-PRF-05 | Memo shall be generated per request and be copyable. | P0 |
| FR-PRF-06 | System shall display warning if user attempts action without required proof. | P0 |

### 12.7. Dispute & Admin

| ID | Requirement | Priority |
|---|---|---|
| FR-DSP-01 | Requester shall open dispute from payment_sent, payment_confirmed or transfer_sent if paymentProof exists. | P0 |
| FR-DSP-02 | Provider shall open dispute from payment_sent after 30 minutes or transfer_sent with required evidence. | P0 |
| FR-DSP-03 | Opening dispute shall freeze collateral and create Admin case with T6. | P0 |
| FR-DSP-04 | Admin shall view timeline, proof, chat, ledger, profiles and SLA history in one case view. | P0 |
| FR-DSP-05 | Admin shall request additional evidence and record deadlines. | P0 |
| FR-DSP-06 | Admin shall resolve only with R1/R2/R3/R4 and mandatory rationale. | P0 |
| FR-DSP-07 | System shall execute ledger and status effects according to outcome. | P0 |

### 12.8. Chat, rating, notification, reporting

| ID | Requirement | Priority |
|---|---|---|
| FR-CHT-01 | System shall create one chat thread per accepted request. | P1 |
| FR-CHT-02 | Chat messages shall be immutable and available as dispute evidence. | P1 |
| FR-REV-01 | System shall open double-blind rating window for 7 days after completed. | P1 |
| FR-REV-02 | Rating shall affect public reputation after both rated or window expires. | P1 |
| FR-NOT-01 | System shall send in-app notifications for all critical events. | P0 |
| FR-NOT-02 | Notifications shall deep-link to request detail or Admin case. | P0 |
| FR-RPT-01 | System shall provide KPI reports for transaction, finance, dispute, risk and SLA. | P1 |

---

## 13. BUSINESS RULES v4.0

| ID | Business Rule |
|---|---|
| BR-001 | Deal must have corridor, rate > 0, min < max, at least one receive method, at least one payout method, SLA and expiry. |
| BR-002 | Only active deal versions are visible in marketplace; paused/expired/soft-deleted deals are hidden. |
| BR-003 | Every request must reference immutable dealVersion snapshot. |
| BR-004 | Deal rate deviation > +/-3% from market reference requires warning; > +/-10% blocks publishing. |
| BR-005 | Provider cannot publish/switch on a deal method without a matching payment account. |
| BR-006 | Requester must see fee and total payable before submitting request and before payment. |
| BR-007 | Requester phải thấy “tổng chi phí”, nhưng UI/API phải tách “số tiền chuyển cho Provider” và “phí nền tảng”; fee collection method phải được cấu hình rõ theo corridor. |
| BR-008 | Provider cannot accept if available wallet balance is below required collateral. |
| BR-009 | Collateral amount = max(payout obligation FX equivalent, requester refund exposure) plus configured buffer. |
| BR-010 | Collateral is locked on accepted, unlocked on completed/expired/resolved, frozen on disputed. |
| BR-011 | Platform fee is charged only on completed or according to dispute outcome. |
| BR-012 | Proof is required for accepted -> payment_sent and payment_confirmed -> transfer_sent. |
| BR-013 | Proof is immutable and visible only to transaction parties and authorized Admin. |
| BR-014 | Memo is mandatory for Requester payment and must be prominently displayed with copy all/QR where possible. |
| BR-015 | Provider can dispute at payment_sent only after minimum 30 minutes from paymentProof submission. |
| BR-016 | Requester can dispute only after paymentProof exists. |
| BR-017 | Irreversible actions require explicit confirmation: Provider confirm payment, Requester complete, delete/cancel destructive actions. |
| BR-018 | Every live request status must have SLA timer and visible “current actor”. |
| BR-019 | System must not auto-complete transfer_sent without Requester confirmation or Admin R1 outcome. |
| BR-020 | Dispute can only close with R1_complete, R2_refund_requester, R3_no_payment or R4_mutual_cancel. |
| BR-021 | Admin resolution must include rationale and audit trail. |
| BR-022 | Rating is double-blind and available only after completed. |
| BR-023 | Resolved transactions do not allow free-form rating unless policy explicitly allows controlled feedback. |
| BR-024 | Chat is immutable and becomes evidence when dispute opens. |
| BR-025 | Sensitive data is masked by default and unmasked only in action context with audit logging. |
| BR-026 | KYC tier controls role, limit and allowed action. |
| BR-027 | Every wallet-changing action must have ledger entry and idempotency key. |
| BR-028 | Terminal requests cannot be modified except adding Admin notes/appeal record. |
| BR-029 | Reject reason is mandatory and visible to Requester in user-friendly language. |
| BR-030 | Deal with live requests cannot be hard-deleted. |

---

## 14. USE CASE SPECIFICATIONS

### 14.1. UC-R-01 - Requester nhập nhu cầu và tìm deal

| Mục | Nội dung |
|---|---|
| Actor | Requester |
| Priority | P0 |
| Preconditions | User logged in; KYC T1 for submitting request; T0 can preview but cannot submit |
| Trigger | Requester chọn “Gửi tiền” |
| Success outcome | Requester thấy danh sách deal phù hợp, đã biết fee và total payable |

**Main flow**
1. Requester chọn currency gửi, currency nhận và amountSend.
2. System hiển thị tỷ giá tham chiếu, amountReceive ước tính, fee 0,5%, total payable.
3. Requester chọn payment method ở đầu gửi và payout method ở đầu nhận.
4. Requester nhập hoặc chọn Beneficiary account đã lưu.
5. System validate dữ liệu người nhận theo method.
6. Requester bấm “Tìm deal phù hợp”.
7. System lọc deal active đúng corridor/hạn mức/method và trả danh sách xếp hạng.

**Alternate/exception**
- Nếu chưa KYC T1: cho xem deal nhưng CTA “Hoàn tất xác minh để gửi yêu cầu”.
- Nếu không có deal: hiển thị deal gần đúng và CTA đổi số tiền/method.
- Nếu beneficiary thiếu trường bắt buộc: highlight field và không cho sang bước chọn deal.

**Acceptance criteria**
- AC-R01-01: total payable luôn hiển thị trước khi tạo request.
- AC-R01-02: danh sách deal không chứa deal paused/expired/soft-deleted.
- AC-R01-03: deal ngoài hạn mức không chọn được.

### 14.2. UC-R-06 - Requester thanh toán Provider và nộp proof

| Mục | Nội dung |
|---|---|
| Actor | Requester |
| Priority | P0 |
| Preconditions | Request status = accepted; Provider account available; T2 active |
| Success outcome | Request chuyển sang payment_sent, Provider được thông báo |

**Main flow**
1. Requester mở request detail.
2. System hiển thị “Bạn đang cầm lượt”, countdown T2, total payable, Provider account, memo.
3. Requester dùng copy all hoặc QR để chuyển tiền ngoài hệ thống.
4. Requester bấm “Tôi đã gửi tiền”.
5. System mở proof modal; Requester upload file/ghi chú.
6. System validate proof và chuyển status sang payment_sent.

**Exception**
- Nếu quá T2 trước khi submit proof: request expired, collateral unlock, Requester + violation.
- Nếu proof rỗng: không cho submit.
- Nếu Provider account missing: đây là lỗi cấu hình, không nên xảy ra do BR-005; tạo ticket support nếu xảy ra.

**Acceptance criteria**
- AC-R06-01: memo có copy button và cảnh báo bắt buộc.
- AC-R06-02: paymentProof sau submit không sửa/xóa được.
- AC-R06-03: trạng thái payment_sent start T3 và notify Provider.

### 14.3. UC-P-04 - Provider duyệt request

| Mục | Nội dung |
|---|---|
| Actor | Provider |
| Priority | P0 |
| Preconditions | Provider KYC T2; request = pending_acceptance; T1 active |
| Success outcome | Request accepted hoặc rejected có lý do |

**Main flow accept**
1. Provider mở danh sách “Cần xử lý”.
2. Provider xem thông tin Requester, amountSend, amountReceive, beneficiary summary, fee, collateral, SLA.
3. System kiểm tra ví khả dụng.
4. Provider bấm “Đồng ý & Chấp nhận”.
5. System hiển thị confirmation với collateral sẽ khóa và fee khi completed.
6. Provider xác nhận.
7. System lock collateral, chuyển accepted, start T2, notify Requester.

**Alternate reject**
1. Provider bấm “Từ chối”.
2. System bắt chọn reason code.
3. System chuyển rejected, notify Requester và gợi ý tìm deal khác.

**Acceptance criteria**
- AC-P04-01: nếu ví thiếu collateral, nút accept disabled hoặc điều hướng nạp ví.
- AC-P04-02: accept tạo ledger collateral_lock.
- AC-P04-03: rejectReason bắt buộc và lưu audit.

### 14.4. UC-P-05 - Provider xác nhận đã nhận tiền

| Mục | Nội dung |
|---|---|
| Actor | Provider |
| Priority | P0 |
| Preconditions | Request = payment_sent; paymentProof exists |
| Success outcome | Request = payment_confirmed |

**Main flow**
1. Provider xem paymentProof, memo, total payable, tài khoản nhận.
2. Provider đối soát thực tế ngoài hệ thống.
3. Provider bấm “Xác nhận đã nhận đủ”.
4. System hiển thị irreversible confirmation.
5. Provider xác nhận.
6. System ghi paymentConfirmedAt, chuyển payment_confirmed, start T4.

**Exception**
- Nếu tiền chưa về/thiếu/sai memo: sau 30 phút Provider mở dispute.
- Nếu Provider không phản hồi quá T3: system tạo ticket Admin.

**Acceptance criteria**
- AC-P05-01: không có nút confirm nếu không có paymentProof.
- AC-P05-02: confirmation nêu rõ “không thể hoàn tác”.
- AC-P05-03: status history ghi actor/time/IP/device nếu có.

### 14.5. UC-P-06 - Provider chi trả Beneficiary

| Mục | Nội dung |
|---|---|
| Actor | Provider |
| Priority | P0 |
| Preconditions | Request = payment_confirmed |
| Success outcome | Request = transfer_sent |

**Main flow**
1. Provider xem beneficiary detail được unmask theo ngữ cảnh chi trả.
2. Provider chuyển tiền ngoài hệ thống theo đúng amountReceive/method.
3. Provider bấm “Đã chuyển tiền”.
4. System mở proof modal.
5. Provider upload transferProof.
6. System chuyển transfer_sent, start T5, notify Requester.

**Acceptance criteria**
- AC-P06-01: beneficiary full data chỉ unmask ở bước này và ghi audit log.
- AC-P06-02: transferProof bắt buộc.
- AC-P06-03: Requester nhận notification kèm CTA kiểm tra/hoàn tất.

### 14.6. UC-A-02 - Admin phân xử dispute

| Mục | Nội dung |
|---|---|
| Actor | Admin/Arbitrator |
| Priority | P0 |
| Preconditions | Request = disputed; collateral frozen; Admin assigned |
| Success outcome | Request = resolved, ledger thực thi đúng outcome |

**Main flow**
1. Admin mở case queue, nhận case.
2. Admin xem timeline, proof, chat, ledger, KYC/risk, SLA history.
3. Admin yêu cầu bổ sung bằng chứng nếu cần.
4. Admin chọn outcome R1/R2/R3/R4.
5. System preview side effects tài chính và uy tín.
6. Admin nhập rationale và xác nhận.
7. System thực thi ledger/status/notification.

**Acceptance criteria**
- AC-A02-01: không thể resolve nếu thiếu outcome hoặc rationale.
- AC-A02-02: outcome R2 phải tạo compensation ledger.
- AC-A02-03: mọi decision có audit log và không sửa được sau khi đóng, chỉ có appeal record.

---

## 15. DATA MODEL NGHIỆP VỤ

### 15.1. ERD mức BA

```text
USER 1---1 KYC_PROFILE
USER 1---n PAYMENT_ACCOUNT
USER 1---n WALLET 1---n LEDGER_ENTRY
USER(provider) 1---n DEAL 1---n DEAL_VERSION
DEAL_VERSION 1---n REQUEST
REQUEST 1---1 BENEFICIARY_SNAPSHOT
REQUEST 1---n PROOF
REQUEST 1---0..1 DISPUTE
REQUEST 1---0..1 CHAT_THREAD 1---n MESSAGE
REQUEST 1---0..2 REVIEW
REQUEST 1---n SLA_TIMER
REQUEST 1---n STATUS_HISTORY
USER 1---n NOTIFICATION
USER 1---n VIOLATION
```

### 15.2. Entity dictionary

| Entity | Key fields | Ghi chú nghiệp vụ |
|---|---|---|
| User | id, phone/email, displayName, status, roleFlags, riskScore | Một user có thể có cả Requester và Provider role |
| KYC_PROFILE | userId, tier, status, submittedAt, approvedAt, rejectedReason | Quyền giao dịch phụ thuộc tier/status |
| PaymentAccount | userId, currency, method, label, maskedFields, fullEncryptedFields, status | Provider account và Beneficiary saved account có thể dùng chung cấu trúc |
| Wallet | userId, currency, available, locked, frozen | Provider bắt buộc có ví để ký quỹ |
| LedgerEntry | id, walletId, type, amount, currency, balanceBefore, balanceAfter, requestId, idempotencyKey | Bất biến; không update, chỉ append |
| Deal | id, providerId, status, currentVersionId, createdAt, deletedAt | Soft delete |
| DealVersion | id, dealId, rate, minAmount, maxAmount, sendMethods, receiveMethods, slaMinutes, note, effectiveAt | Request snapshot version này |
| Request | id, dealVersionId, requesterId, providerId, status, amountSend, amountReceive, fees, collateral, memo, deadlines | Thực thể trung tâm |
| BeneficiarySnapshot | requestId, name, method, currency, phone, bank, account, address | Snapshot tại thời điểm request |
| Proof | id, requestId, type, uploaderId, note, refCode, files, createdAt | Immutable |
| Dispute | id, requestId, openedBy, category, status, assignee, outcome, rationale, openedAt, resolvedAt | T6 48h |
| ChatThread/Message | requestId, senderId, type, content, attachment, createdAt, systemEvent | Không sửa/xóa |
| Review | requestId, fromUserId, toUserId, stars, tags, comment, blindStatus, createdAt | Public sau double-blind |
| SlaTimer | requestId, timerType, deadline, remindersSent, escalatedAt, status | Scheduler xử lý |
| StatusHistory | requestId, fromStatus, toStatus, action, actorId, reason, createdAt | Audit state machine |
| Notification | userId, eventType, channel, payload, deepLink, readAt | Event-driven |
| Violation | userId, requestId, type, severity, createdAt, expiresAt | Dùng risk/reputation |

### 15.3. Field validation quan trọng

| Object | Field | Rule |
|---|---|---|
| Deal | rate | number > 0; compare market reference |
| Deal | min/max | min > 0; max > min |
| Deal | methods | must match currency method matrix |
| Request | amountSend | > 0; within deal version min/max; within KYC limit |
| Beneficiary | name | required |
| Beneficiary | phone/account | required tùy method |
| Proof | files/note | at least 1 file or non-empty note |
| Dispute | category | required |
| Admin Decision | rationale | required |
| Review | stars | integer 1-5 |

---

## 16. API CONTRACT MỨC BA

Phần này không thay thế OpenAPI. Mục tiêu là giúp PO/BA/Tech thống nhất resource, action, guard, event và side effect.

### 16.1. API principles

| Nguyên tắc | Mô tả |
|---|---|
| Action endpoint cho state transition | Không update status trực tiếp; gọi action như accept, submit-proof, resolve |
| Idempotency | Mọi action tài chính/state quan trọng cần idempotency key |
| Event-driven | Sau action thành công phát event cho notification, SLA, reporting |
| Authorization | Kiểm tra role + ownership + KYC + status guard |
| Audit | Ghi actor, action, requestId, timestamp, device/IP nếu có |
| Error chuẩn | Trả mã lỗi nghiệp vụ rõ ràng: KYC_REQUIRED, INSUFFICIENT_COLLATERAL, INVALID_STATUS... |

### 16.2. Resource/action đề xuất

| Resource/Action | Actor | Purpose | Guard chính | Event phát sinh |
|---|---|---|---|---|
| POST /kyc/submit | User | Nộp KYC | Logged in | kyc_submitted |
| GET /marketplace/deals | Requester | Tìm deal | T0+ | deals_searched |
| POST /deals | Provider | Tạo deal | KYC T2; account đủ | deal_created |
| PATCH /deals/{id} | Provider | Sửa deal -> version mới | Owner; no invalid method | deal_version_created |
| POST /deals/{id}/pause | Provider | Tạm dừng | Owner | deal_paused |
| POST /requests | Requester | Gửi request | KYC T1; within limit | request_created |
| POST /requests/{id}/accept | Provider | Accept | Owner Provider; collateral enough | request_accepted, collateral_locked |
| POST /requests/{id}/reject | Provider | Reject | reason required | request_rejected |
| POST /requests/{id}/cancel | Requester | Cancel | pending_acceptance | request_cancelled |
| POST /requests/{id}/payment-proof | Requester | Submit paymentProof | accepted | payment_proof_submitted |
| POST /requests/{id}/confirm-payment | Provider | Confirm received | payment_sent | payment_confirmed |
| POST /requests/{id}/transfer-proof | Provider | Submit transferProof | payment_confirmed | transfer_proof_submitted |
| POST /requests/{id}/complete | Requester | Complete | transfer_sent | request_completed, fees_charged |
| POST /requests/{id}/disputes | Requester/Provider | Open dispute | Status + proof guard | dispute_opened, collateral_frozen |
| POST /admin/disputes/{id}/resolve | Admin | Resolve dispute | outcome + rationale | dispute_resolved, ledger_executed |
| GET /wallets/me | Provider | Xem ví | Owner | - |
| GET /ledger | Provider/Admin/Finance | Xem bút toán | RBAC | - |
| POST /messages | Request parties | Chat | accepted+ or Admin in dispute | message_created |
| POST /reviews | Request parties | Rating | completed within 7d | review_submitted |

### 16.3. Error codes nghiệp vụ

| Code | Khi nào trả |
|---|---|
| KYC_REQUIRED | User chưa đạt tier cần thiết |
| LIMIT_EXCEEDED | Amount vượt hạn mức tier/corridor/window |
| INVALID_STATUS | Action không hợp lệ với status hiện tại |
| INSUFFICIENT_COLLATERAL | Provider ví khả dụng không đủ ký quỹ |
| DEAL_NOT_ACTIVE | Deal không active hoặc version không còn hợp lệ cho request mới |
| METHOD_ACCOUNT_MISSING | Provider thiếu account cho method đã chọn |
| PROOF_REQUIRED | Thiếu proof hoặc proof rỗng |
| DISPUTE_TOO_EARLY | Provider mở dispute payment_sent trước 30 phút |
| ALREADY_TERMINAL | Request đã ở trạng thái kết thúc |
| IDEMPOTENCY_CONFLICT | Idempotency key trùng nhưng payload khác |
| UNAUTHORIZED_UNMASK | Actor không có quyền xem dữ liệu đầy đủ |

---

## 17. UI/UX REQUIREMENTS

### 17.1. Information architecture

| Vai trò | Tab chính | Màn P0 |
|---|---|---|
| Requester | Gửi tiền, Yêu cầu, Liên kết, Hồ sơ | Wizard gửi tiền, deal results, request detail, payment instruction, proof modal, dispute modal |
| Provider | Trang chủ, Deals, Yêu cầu, Hồ sơ/Ví | Dashboard cần xử lý, deal form, request detail, confirm payment, transfer proof, wallet |
| Admin | Disputes, Users, Deals, Ledger, Config | Dispute queue, case detail, decision modal, user risk profile, ledger view |

### 17.2. UX P0 requirements

| ID | Requirement | Mục tiêu |
|---|---|---|
| UX-001 | Header request detail luôn hiển thị status, current actor, countdown | Người dùng biết ai đang cầm lượt |
| UX-002 | Stepper 4 pha phủ lên 11 trạng thái kỹ thuật | Giảm phức tạp state machine |
| UX-003 | Màn thanh toán có “phiếu lệnh” gồm amount, account, memo, copy all, QR | Giảm lỗi nhập liệu |
| UX-004 | Memo hiển thị nổi bật, không bị xuống dòng, có copy riêng | Giảm tranh chấp đối soát |
| UX-005 | Hành động irreversible dùng bottom sheet/confirm 2 bước | Tránh bấm nhầm |
| UX-006 | “Bạn được bảo vệ” hiển thị tại màn thanh toán | Giảm lo âu chuyển tiền |
| UX-007 | Reject/expired có CTA phục hồi: tìm deal tương tự | Giảm drop-off |
| UX-008 | Upload proof mobile-first: camera, preview, retry, cảnh báo file mờ nếu có | Tăng chất lượng proof |
| UX-009 | Data sensitive mask mặc định, copy/unmask có audit và giải thích | Bảo vệ dữ liệu |
| UX-010 | Admin decision modal preview ledger effect trước khi resolve | Giảm sai sót vận hành |

### 17.3. Screen-level notes

| Screen | Thành phần bắt buộc |
|---|---|
| Requester Step 1 | amountSend, fee, total payable, estimated receive, method, beneficiary, KYC warning |
| Deal Card | Provider verified, rating, completed count, on-time rate, response time, rate, receive amount, SLA, method match |
| Request Detail | status, current actor, timer, stepper, amount, fee, memo, proof sections, chat, action CTA |
| Payment Instruction | Provider account, amount, fee, total, memo, copy all, QR, protection block |
| Provider Request Detail | Requester trust signals, amount, beneficiary summary, fee, collateral, SLA, accept/reject |
| Admin Case Detail | Timeline, status history, proof, chat, ledger, KYC/risk, evidence request, decision panel |

---

## 18. ACCEPTANCE CRITERIA VÀ TEST MATRIX

### 18.1. System acceptance criteria

| ID | Acceptance Criteria |
|---|---|
| AC-SYS-001 | User T0 không thể gửi request hoặc trở thành Provider. |
| AC-SYS-002 | Provider T1 không thể tạo/active deal hoặc accept request. |
| AC-SYS-003 | Provider không thể accept nếu ví thiếu collateral. |
| AC-SYS-004 | Requester thấy total payable ở Step 1, Deal Review và Payment Instruction. |
| AC-SYS-005 | Request accepted tạo collateral_lock ledger đúng amount/currency/requestId. |
| AC-SYS-006 | accepted -> payment_sent không thể xảy ra nếu proof rỗng. |
| AC-SYS-007 | payment_confirmed -> transfer_sent không thể xảy ra nếu thiếu transferProof. |
| AC-SYS-008 | completed thu phí đúng một lần, unlock collateral và mở rating window. |
| AC-SYS-009 | disputed freeze collateral và tạo Admin case có deadline 48h. |
| AC-SYS-010 | Admin không thể resolve nếu thiếu outcome hoặc rationale. |
| AC-SYS-011 | R2 tạo compensation ledger và cập nhật Provider violation. |
| AC-SYS-012 | transfer_sent quá T5 không tự completed. |
| AC-SYS-013 | Terminal request không cho submit proof/complete/dispute mới, trừ appeal policy nếu có. |
| AC-SYS-014 | Mọi wallet transaction có ledger entry cân bằng before/after. |
| AC-SYS-015 | Sensitive fields chỉ unmask trong action context và có audit log. |

### 18.2. Test matrix E2E

| Test ID | Scenario | Expected |
|---|---|---|
| E2E-001 | Happy path request completed | Status completed; fees charged; collateral unlocked; rating opened |
| E2E-002 | Provider reject | Status rejected; reason visible; no collateral/fee |
| E2E-003 | Requester cancel before accept | Status cancelled; no collateral/fee |
| E2E-004 | T1 expired | Status expired; deal suggestion; no fee |
| E2E-005 | T2 expired | Status expired; collateral unlocked; Requester violation |
| E2E-006 | Provider insufficient collateral | Accept blocked; CTA top-up wallet |
| E2E-007 | Payment proof empty | Submit blocked |
| E2E-008 | Provider dispute payment_sent before 30 min | Blocked with DISPUTE_TOO_EARLY |
| E2E-009 | Provider dispute payment_sent after 30 min | Status disputed; collateral frozen; Admin case created |
| E2E-010 | Requester dispute transfer_sent | Status disputed; Admin case created |
| E2E-011 | Admin R1_complete | Fees charged; collateral unlocked; Requester violation |
| E2E-012 | Admin R2_refund_requester | Compensation from collateral; Provider violation |
| E2E-013 | Admin R3_no_payment | Collateral unlocked; Requester violation |
| E2E-014 | Admin R4_mutual_cancel | No fee/violation; collateral unlocked |
| E2E-015 | Duplicate complete request | Idempotent; no double fee |
| E2E-016 | Terminal state action attempted | INVALID_STATUS/ALREADY_TERMINAL |
| E2E-017 | Unmask outside context | UNAUTHORIZED_UNMASK |
| E2E-018 | Deal edit after request created | Request keeps old dealVersion rate |
| E2E-019 | Delete deal with live request | Blocked; suggest pause |
| E2E-020 | Ledger reconciliation after batch | All wallet totals match ledger |

---

## 19. NON-FUNCTIONAL REQUIREMENTS

| ID | Category | Requirement | Target đề xuất |
|---|---|---|---|
| NFR-001 | Security | RBAC cho Requester/Provider/Admin/Finance/Compliance | P0 |
| NFR-002 | Security | All sensitive data encrypted at rest and in transit | P0 |
| NFR-003 | Audit | State transitions, ledger, proof access, Admin decisions logged | P0 |
| NFR-004 | Availability | Transaction core uptime target | >= 99.5% pilot, nâng sau |
| NFR-005 | Performance | Deal search response | p95 <= 2s pilot |
| NFR-006 | Performance | State transition action | p95 <= 1s excluding file upload |
| NFR-007 | Reliability | Idempotent action for all financial transitions | P0 |
| NFR-008 | Data retention | Retain transaction/proof/chat per legal policy | Legal quyết định |
| NFR-009 | Privacy | Mask/unmask and signed proof URLs | P0 |
| NFR-010 | Observability | Metrics/logs/traces for transition, ledger, SLA scheduler | P0 |
| NFR-011 | Accessibility | Mobile-first, touch target >= 44px, text contrast | P1 |
| NFR-012 | Localization | Currency/date/number by locale; currency ISO always visible | P0 |

---

## 20. ROADMAP VÀ BACKLOG TRIỂN KHAI

### 20.1. Roadmap

| Phase | Mục tiêu | Scope | Gate ra |
|---|---|---|---|
| M0 - Discovery & Legal Gate | Xác nhận mô hình vận hành có thể triển khai | Legal memo, corridor pilot, vendor shortlist, architecture spike, threat model | G0 duyệt |
| M1 - Trusted Transaction MVP | Chạy giao dịch thật trong pilot có kiểm soát | KYC, wallet/ledger, deal/request, state machine, proof/memo/QR, SLA, Admin R1-R4, notification | E2E completed + disputed resolved; ledger audit 100% |
| M1.5 - Ops hardening | Giảm rủi ro vận hành | Admin workflow nâng cao, evidence templates, reconciliation dashboard, incident runbook | Pilot ổn định |
| M2 - Trust Loop | Tăng repeat và niềm tin | Chat, rating double-blind, deal version UX, rate API, reporting, masking nâng cao | NPS/risk KPI đạt ngưỡng |
| M3 - Scale | Mở rộng thị trường | Thêm corridor, AML nâng cao, growth tools, automation dispute | Legal/ops readiness từng market |

### 20.2. Epic backlog M1

| Epic | User story mẫu | Priority | Dependency |
|---|---|---|---|
| E-01 KYC & Role | As a user, I can verify to T1/T2 so that I can transact/provider | P0 | Vendor/legal |
| E-02 Wallet/Ledger | As a Provider, I can top up wallet and see available/locked/frozen | P0 | Payment gateway |
| E-03 Deal Management | As a Provider, I can create/edit/version deals with valid accounts | P0 | KYC T2 |
| E-04 Marketplace | As a Requester, I can compare deals by cost, trust and speed | P0 | Deal |
| E-05 Request State Machine | As both parties, I can move request through valid states only | P0 | Deal, wallet |
| E-06 Proof/Memo/QR | As Requester/Provider, I can submit proof and copy payment instruction | P0 | Request |
| E-07 SLA Scheduler | As system, I can remind/escalate/expire based on timers | P0 | Request |
| E-08 Dispute Admin | As Admin, I can resolve disputes with R1-R4 and ledger effects | P0 | Ledger, proof |
| E-09 Notification | As user, I receive actionable notifications for critical events | P0 | Events |
| E-10 Security/Audit | As platform, I log and protect sensitive operations | P0 | All modules |
| E-11 QA Automation | As QA, I can run transition/ledger E2E tests | P0 | All modules |

### 20.3. Definition of Ready / Done

| Type | Criteria |
|---|---|
| Definition of Ready | Requirement có actor, precondition, main flow, guard, side effect, AC, error case, analytics event nếu cần |
| Definition of Done | Code merged, unit/integration tests pass, AC pass, audit/log/event implemented, security review for sensitive data, QA evidence attached |

---

## 21. KPI, DASHBOARD VÀ ANALYTICS EVENTS

### 21.1. KPI

| Nhóm | KPI | Mục đích |
|---|---|---|
| Transaction | GMV, request count, completed rate, expired rate, median time per phase | Sức khỏe luồng chính |
| Provider | active deals, acceptance rate, on-time rate, dispute lost rate, wallet locked ratio | Quản trị supply |
| Requester | repeat rate, cancel rate, T2 late rate, dispute opened/lost | Chất lượng demand |
| Finance | fee revenue, penalties, collateral locked/frozen, reconciliation breaks | Tài chính/ledger |
| Ops | dispute rate, outcome mix R1-R4, admin handling time, SLA breach | Vận hành dispute |
| Risk | AML flags, proof fraud, repeated counterparty clusters, disintermediation signals | Rủi ro |

### 21.2. Analytics events tối thiểu

| Event | Properties |
|---|---|
| deal_search_submitted | corridor, amount, sendMethod, receiveMethod, kycTier |
| deal_selected | dealId, providerId, rate, receiveAmount, rank, trustSignals |
| request_created | requestId, dealVersionId, amount, corridor |
| request_accepted | requestId, collateralAmount, providerWalletCurrency |
| payment_instruction_viewed | requestId, copiedMemo, copiedAll, qrViewed |
| payment_proof_submitted | requestId, fileCount, hasNote |
| payment_confirmed | requestId, timeFromProof |
| transfer_proof_submitted | requestId, timeFromPaymentConfirmed |
| request_completed | requestId, totalDuration, feeAmount |
| dispute_opened | requestId, openedBy, category, statusAtOpen |
| dispute_resolved | requestId, outcome, handlingTime |
| rating_submitted | requestId, stars, tags |

---

## 22. RISK REGISTER

| ID | Risk | Impact | Probability | Mitigation | Owner |
|---|---|---:|---:|---|---|
| RISK-01 | Mô hình vướng quy định chuyển tiền/ngoại hối | Very High | High | Legal gate trước M1, pilot corridor được phê duyệt | Legal/PO |
| RISK-02 | Provider không chấp nhận ký quỹ cao | High | Medium | Pilot nhỏ, tiered collateral sau lịch sử tốt | PO/Ops |
| RISK-03 | Ledger sai gây thiệt hại tài chính | Very High | Medium | Double-entry-like ledger, idempotency, reconciliation daily | Engineering/Finance |
| RISK-04 | Proof giả hoặc memo sai gây tranh chấp | High | High | Copy/QR, proof checklist, Admin evidence, OCR later | Product/Ops |
| RISK-05 | Admin quá tải dispute | High | Medium | Evidence templates, triage, KPI, automate M2 | Ops |
| RISK-06 | Dữ liệu nhạy cảm bị lộ | Very High | Medium | Masking, RBAC, signed URL, audit, security review | Security |
| RISK-07 | Giao dịch ngoài nền tảng | Medium | High | Giá trị bảo vệ thật, chat warning, rating/coverage only in-app | Product |
| RISK-08 | Tỷ giá biến động nhanh | Medium | Medium | Rate API, threshold, deal version, quote expiry | Product/Engineering |
| RISK-09 | Push/email không đến làm trễ SLA | Medium | Medium | In-app source of truth, retry, multi-channel for critical events | Engineering |
| RISK-10 | Provider thiếu liquidity đầu nhận dù đã accept | High | Medium | Collateral + SLA + dispute penalty + Provider limits | Ops/Risk |

---

## 23. DECISION LOG VÀ OPEN QUESTIONS

### 23.1. Decision log đã chốt trong v4.0

| ID | Decision | Rationale |
|---|---|---|
| DEC-01 | v2.0 là baseline nghiệp vụ cuối; v4.0 không quay lại escrow ảo v1 | v2 giải quyết lỗ hổng triển khai |
| DEC-02 | Provider ký quỹ một phía | Bảo vệ bên xuống tiền trước, giảm vốn chết cho Requester |
| DEC-03 | Phí thu khi completed hoặc theo outcome bên thua | Công bằng và dễ giải thích |
| DEC-04 | pending/waiting_accept hợp nhất thành pending_acceptance | Một nguồn sự thật |
| DEC-05 | Dispute không phải terminal; terminal là resolved | Có quy trình phán quyết |
| DEC-06 | Không auto-complete ở transfer_sent khi quá T5 | Tránh rủi ro xác nhận tiền chưa nhận |
| DEC-07 | Deal sửa bằng version | Bảo vệ request đã chốt |
| DEC-08 | Proof/chat/ledger/status history immutable | Phục vụ audit và dispute |

### 23.2. Open questions cần PO/Legal/Tech chốt trước M1

| ID | Câu hỏi | Owner đề xuất | Ảnh hưởng |
|---|---|---|---|
| OQ-01 | Corridor pilot đầu tiên là gì: USD->VND hay multi-currency ngay? | PO + Legal | Scope KYC/legal/payment/rate |
| OQ-02 | Collateral currency là VND, USD hay multi-wallet theo payout currency? | Finance + Tech | Ledger/FX complexity |
| OQ-03 | Chọn phương án v4-FEE-01: platform collect hay Provider collect & settle? | PO + Legal + Finance | UX/pháp lý/hạch toán/ledger |
| OQ-04 | Cơ chế bồi hoàn Requester trong R2 đi qua ví nội bộ, bank payout hay credit platform? | Finance + Legal | Refund operations |
| OQ-05 | Admin phán quyết có cho appeal không, appeal giữ freeze bao lâu? | Legal + Ops | SLA/ledger hold |
| OQ-06 | Hạn mức KYC T1/T2 cụ thể theo corridor là bao nhiêu? | Legal + Risk | Validation & risk |
| OQ-07 | Có yêu cầu lưu trữ proof/chat/ledger bao lâu theo thị trường pilot? | Legal + Security | Data retention |
| OQ-08 | Vendor eKYC/payment gateway nào hỗ trợ thị trường mục tiêu? | Tech + Procurement | Delivery plan |
| OQ-09 | Provider onboarding có cần manual approval ngoài KYC T2 không? | Ops + Risk | Supply quality |
| OQ-10 | Có cho Provider nhiều tài khoản trên cùng method/currency và chọn default thế nào? | Product | Payment instruction UX |

---

## 24. PHỤ LỤC A - STATE TRANSITION TEST CHECKLIST

| From | Action | Positive test | Negative test |
|---|---|---|---|
| pending_acceptance | accept | đủ KYC/collateral -> accepted | thiếu collateral -> blocked |
| pending_acceptance | reject | có reason -> rejected | thiếu reason -> blocked |
| pending_acceptance | cancel | Requester confirm -> cancelled | Provider gọi cancel -> unauthorized |
| accepted | submit proof | proof valid -> payment_sent | proof rỗng -> blocked |
| accepted | T2 expire | no proof -> expired | proof submitted before scheduler -> no expire |
| payment_sent | confirm | Provider confirm -> payment_confirmed | Requester confirm -> unauthorized |
| payment_sent | dispute Provider | after 30m -> disputed | before 30m -> blocked |
| payment_confirmed | transfer proof | valid -> transfer_sent | missing beneficiary -> blocked/support |
| transfer_sent | complete | Requester confirm -> completed | Provider complete -> unauthorized |
| disputed | resolve | Admin outcome+rationale -> resolved | missing rationale -> blocked |
| terminal | any action | read-only | status-changing action -> blocked |

---

## 25. PHỤ LỤC B - MA TRẬN TIỀN TỆ VÀ PHƯƠNG THỨC

| Currency | Methods | Required data |
|---|---|---|
| USD | Zelle, Venmo, PayPal, Bank Transfer | phone/email/handle or bank + account |
| EUR | PayPal, SEPA, Bank Transfer | email/IBAN/bank + account |
| GBP | PayPal, Bank Transfer | email or bank + account |
| SGD | PayNow, Bank Transfer | phone or bank + account |
| AUD | PayID, PayPal, Bank Transfer | phone/email or bank + account |
| JPY | PayPay, Bank Transfer | phone or bank + account |
| KRW | KakaoPay, Bank Transfer | phone or bank + account |
| THB | PromptPay, Bank Transfer | phone or bank + account |
| CNY | WeChat Pay, Alipay, Bank Transfer | phone/email or bank + account |
| VND | MoMo, ZaloPay, Bank Transfer | phone or bank + account holder; VietQR where available |

---

## 26. PHỤ LỤC C - GỢI Ý CẤU TRÚC BACKLOG CHI TIẾT

| Epic | Story ID | User story | AC tóm tắt |
|---|---|---|---|
| KYC | US-001 | As a Requester, I can submit KYC T1 | Approved T1 can create request; rejected shows reason |
| Wallet | US-010 | As a Provider, I can see available/locked/frozen | Balances match ledger |
| Wallet | US-011 | As system, I lock collateral on accept | Ledger created, available decreased |
| Deal | US-020 | As Provider, I create deal with methods | Missing account blocks submit |
| Deal | US-021 | As Provider, I edit deal | New version, old request unchanged |
| Marketplace | US-030 | As Requester, I compare deals | Filter/ranking correct; cost visible |
| Request | US-040 | As Requester, I submit request | pending_acceptance, T1, Provider notified |
| Transaction | US-050 | As Provider, I accept request | collateral lock, accepted, T2 |
| Transaction | US-051 | As Requester, I submit payment proof | payment_sent, proof immutable |
| Transaction | US-052 | As Provider, I confirm payment | payment_confirmed, T4 |
| Transaction | US-053 | As Provider, I submit transfer proof | transfer_sent, T5 |
| Transaction | US-054 | As Requester, I complete request | fee, unlock, rating |
| SLA | US-060 | As system, I expire accepted after T2 | expired, unlock, violation |
| Dispute | US-070 | As user, I open dispute | frozen collateral, Admin case |
| Admin | US-071 | As Admin, I resolve R2 | compensation ledger, resolved |
| Security | US-080 | As system, I mask/unmask sensitive data | Audit log for unmask/copy |
| Notification | US-090 | As user, I get critical alerts | Deep-link correct |
| QA | US-100 | As QA, I run state machine regression | All invalid transitions blocked |

---

## 27. KẾT LUẬN BA

Bản v4.0 đưa tài liệu từ mức “mô tả nghiệp vụ” sang mức “sẵn sàng bóc tách triển khai”. Quyết định quan trọng nhất là không cắt các thành phần bảo vệ niềm tin ra khỏi MVP. Với sản phẩm tài chính P2P, phần tạo niềm tin - KYC, ký quỹ, ledger, SLA, proof, Admin phân xử - chính là lõi sản phẩm.

Khuyến nghị BA cho bước tiếp theo:

1. PO/Legal chốt corridor pilot và mô hình pháp lý trước.
2. Tech Lead tách tài liệu Technical Design + OpenAPI từ mục API contract.
3. QA Lead chuyển AC/Test Matrix thành bộ test E2E tự động.
4. Ops xây dispute playbook chi tiết từ mục Admin/Ops Runbook.
5. Finance xác nhận ledger transaction types, phương án thu phí Requester theo v4-FEE-01, collateral currency theo v4-COL-01 và refund payout.
6. UX/UI dùng mục UI requirements để cập nhật wireframe/prototype production.

**Không nên launch giao dịch thật khi chưa pass đủ hard release gates G0-G8.**
