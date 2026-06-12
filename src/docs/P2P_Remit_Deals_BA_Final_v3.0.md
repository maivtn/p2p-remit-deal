# TÀI LIỆU PHÂN TÍCH NGHIỆP VỤ HỢP NHẤT — P2P REMIT DEALS

Phiên bản: Final v3.0  
Ngày tổng hợp: 12/06/2026  
Nguyên tắc nguồn: v2.0 là bản sau cùng; v1.0 dùng để bổ sung chi tiết nghiệp vụ, form, use case, nhãn UI và dữ liệu mẫu.


# 1. Mục tiêu và phạm vi tài liệu

Mục tiêu của bản Final v3.0 là tạo ra một tài liệu BA/FSD hợp nhất, đủ rõ cho đội sản phẩm, kỹ thuật, kiểm thử, vận hành và pháp chế cùng sử dụng. Tài liệu mô tả mô hình kinh doanh, hành trình giao dịch, vai trò người dùng, use case, business rules, dữ liệu nghiệp vụ, SLA, tranh chấp, KYC/AML, UX/UI và roadmap triển khai.

- Trong phạm vi: đăng ký vai trò theo KYC, tạo và quản lý deal, tìm deal, gửi yêu cầu, thanh toán ngoài hệ thống, proof/memo, ví nội bộ, ký quỹ Provider, phí, SLA, dispute/resolution, chat, rating, Admin console, báo cáo vận hành.
- Ngoài phạm vi chi tiết kỹ thuật: lựa chọn nhà cung cấp eKYC, gateway thanh toán cụ thể, kiến trúc hạ tầng, thiết kế API chi tiết, hợp đồng pháp lý và quy trình báo cáo pháp lý theo từng thị trường.
- Điều kiện bắt buộc trước khi chạy giao dịch thật: có ý kiến pháp lý chính thức, có ký quỹ thật, có ledger, có Admin phân xử và có state machine không treo.

# 2. Tóm tắt điều hành cho Product Owner

P2P Remit Deals là marketplace hai chiều kết nối Requester có nhu cầu chuyển tiền với Provider có thanh khoản ở hai đầu. Dòng tiền chính vẫn đi ngoài hệ thống qua Zelle, Venmo, PayPal, MoMo, ZaloPay hoặc ngân hàng; nền tảng tạo giá trị bằng quy trình chuẩn hóa, bằng chứng, memo đối soát, ký quỹ Provider, SLA, trọng tài và uy tín.

| Vấn đề từ v1.0 | Quyết định cuối theo v2.0/v3.0 | Ý nghĩa triển khai |
| --- | --- | --- |
| Dispute bị treo | Bổ sung Admin/Trọng tài, SLA 48h, 4 kết cục phân xử | Mọi giao dịch có đường kết thúc |
| Escrow chỉ là cờ UI | Ký quỹ một phía từ Provider qua ví nội bộ | Có nguồn đền bù thật cho Requester |
| Phí thu ngay, không hoàn | Phí 0,5%/bên chỉ thu khi completed; resolved thì bên thua chịu phí phạt | Công bằng và dễ giải thích hơn |
| Không có timeout | SLA T1–T6 + reminder + escalation | Không để giao dịch treo vô hạn |
| Provider không khiếu nại pha nhận tiền | Provider được khiếu nại từ payment_sent sau tối thiểu 30 phút | Đối xứng rủi ro |
| Không có rating/chat/KYC rõ | Bổ sung rating double-blind, chat theo request, KYC T0/T1/T2 | Khép kín vòng tin cậy và tuân thủ |

# 3. Actors và trách nhiệm nghiệp vụ

| Actor | Mục tiêu | Quyền chính | Điều kiện / Ràng buộc |
| --- | --- | --- | --- |
| Requester | Gửi tiền nhanh, tỷ giá tốt, người thụ hưởng nhận đúng đủ | Tìm deal, gửi request, chuyển tiền, upload proof, khiếu nại, xác nhận hoàn tất, đánh giá | KYC Tier 1 để giao dịch; tuân thủ SLA thanh toán; phí 0,5% được cộng vào tổng phải chuyển |
| Provider | Kiếm chênh lệch tỷ giá, xoay vòng vốn, giữ uy tín | Tạo/sửa/pause deal, chấp nhận/từ chối request, xác nhận nhận tiền, chi trả, upload proof, khiếu nại | KYC Tier 2; có ví nội bộ; đủ ký quỹ; chịu SLA và phí Provider |
| Beneficiary | Nhận tiền cuối cùng | Không dùng hệ thống trực tiếp | Thông tin do Requester khai báo; được Provider chi trả ngoài hệ thống |
| Admin/Trọng tài | Đảm bảo tranh chấp có kết luận công bằng | Xem toàn bộ hồ sơ case, yêu cầu bổ sung bằng chứng, tham gia chat, ra phán quyết, khóa/mở tài khoản | Phải thao tác trong Admin console; phán quyết có căn cứ và audit log |
| System | Khớp deal, điều phối trạng thái, lưu bằng chứng, nhắc SLA, xử lý ledger | Validate, state transition, notification, fee/collateral ledger, masking dữ liệu, KPI report | Không tự hoàn tất transfer_sent nếu chưa có xác nhận hoặc phán quyết |

# 4. Mô hình nghiệp vụ end-to-end

1. Provider hoàn tất KYC Tier 2, nạp ví nội bộ và khai báo tài khoản nhận tiền theo từng currency/payment method.
2. Provider tạo deal: corridor, tỷ giá, min/max, phương thức nhận/chi, SLA, hạn hiệu lực, ghi chú. Deal active xuất hiện trên marketplace.
3. Requester hoàn tất KYC Tier 1, nhập nhu cầu gửi tiền, chọn currency gửi/nhận, payment method, người thụ hưởng và ghi chú.
4. System lọc deal active đúng corridor, đúng hạn mức, chấm điểm theo method match, rating/SLA và sắp xếp cho Requester chọn.
5. Requester chọn deal và gửi request. Request ở trạng thái pending_acceptance, bắt đầu SLA T1.
6. Provider chấp nhận nếu đủ ký quỹ. System khóa collateral Provider, snapshot tỷ giá/phí/SLA, chuyển sang accepted và mở T2.
7. Requester chuyển tiền thật cho Provider ngoài hệ thống, bắt buộc ghi đúng memo, upload paymentProof; trạng thái payment_sent.
8. Provider đối soát tiền vào và memo. Nếu đúng, xác nhận nhận đủ; trạng thái payment_confirmed. Nếu sai/thiếu/không nhận được, Provider có thể khiếu nại sau 30 phút.
9. Provider chi trả cho Beneficiary ngoài hệ thống, upload transferProof; trạng thái transfer_sent.
10. Requester kiểm tra người thụ hưởng đã nhận đủ rồi xác nhận hoàn tất; trạng thái completed, system thu phí, mở khóa ký quỹ và mở cửa sổ rating.
11. Nếu có tranh chấp, giao dịch vào disputed, ký quỹ freeze, Admin xử lý trong SLA 48h và đóng về resolved với một trong 4 kết cục chuẩn.

# 5. State machine chuẩn v3.0

| Mã trạng thái | Nhãn UI | Loại | Ai đang cầm lượt | Đồng hồ |
| --- | --- | --- | --- | --- |
| pending_acceptance | Chờ chấp nhận | Sống | Provider | T1 |
| accepted | Chờ thanh toán | Sống | Requester | T2 |
| payment_sent | Chờ xác nhận nhận tiền | Sống | Provider | T3 |
| payment_confirmed | Đang chuyển cho người nhận | Sống | Provider | T4 |
| transfer_sent | Chờ xác nhận hoàn tất | Sống | Requester | T5 |
| disputed | Đang phân xử | Sống có Admin | Admin + hai bên bổ sung bằng chứng | T6 |
| completed | Hoàn thành | Kết thúc tốt | Không còn lượt | - |
| rejected | Bị từ chối | Kết thúc | Không còn lượt | - |
| cancelled | Đã hủy | Kết thúc | Không còn lượt | - |
| expired | Hết hạn | Kết thúc | Không còn lượt | - |
| resolved | Đã phân xử | Kết thúc | Không còn lượt | - |

| Từ trạng thái | Hành động | Người thực hiện | Sang trạng thái | Side effect |
| --- | --- | --- | --- | --- |
| pending_acceptance | Chấp nhận | Provider | accepted | Khóa collateral Provider; snapshot tỷ giá/phí/SLA; start T2 |
| pending_acceptance | Từ chối + lý do | Provider | rejected | Lưu rejectReason; thông báo Requester |
| pending_acceptance | Hủy | Requester | cancelled | Đóng request; không phát sinh phí |
| pending_acceptance | Quá T1 | System | expired | Thông báo hai bên; gợi ý deal khác |
| accepted | Upload paymentProof | Requester | payment_sent | Lưu proof; start T3 |
| accepted | Quá T2 | System | expired | Mở khóa collateral; ghi vi phạm Requester |
| payment_sent | Xác nhận nhận đủ | Provider | payment_confirmed | Ghi paymentConfirmedAt; start T4 |
| payment_confirmed | Upload transferProof | Provider | transfer_sent | Lưu transferProof; start T5 |
| transfer_sent | Xác nhận hoàn tất | Requester | completed | Thu phí; mở ký quỹ; mở rating |
| payment_sent/payment_confirmed/transfer_sent | Khiếu nại | Requester | disputed | Freeze collateral; start T6 |
| payment_sent/transfer_sent | Khiếu nại | Provider | disputed | Freeze collateral; start T6 |
| disputed | Phán quyết | Admin | resolved | Ghi outcome; thực thi ledger; update uy tín |

# 6. Mô hình phí, ví và ký quỹ

| Hạng mục | Quy tắc cuối |
| --- | --- |
| Phí hệ thống | 0,5% trên số tiền gửi cho mỗi bên, tổng 1% |
| Thời điểm thu phí | Chỉ thu khi giao dịch completed hoặc resolved theo bên thua |
| Phí Requester | Cộng vào tổng phải chuyển ở pha 1: Tiền gửi + phí 0,5% |
| Phí Provider | Trừ từ ví nội bộ khi completed hoặc resolved theo phán quyết |
| Ký quỹ Provider | Khóa 100% giá trị chi trả, quy đổi theo tỷ giá hệ thống + đệm 2% |
| Requester ký quỹ? | Không. Requester đã chịu rủi ro chuyển tiền trước nên không bắt ký quỹ 2 lần |
| Disputed | Collateral bị freeze đến khi Admin ra phán quyết |
| Ledger | Mọi bút toán nạp/rút/khóa/mở/phí/phạt/đền bù phải có ledger entry và audit log |

# 7. SLA, timeout và escalation

| Timer | Pha | Hạn mặc định | Nhắc | Khi quá hạn |
| --- | --- | --- | --- | --- |
| T1 | pending_acceptance | 2 giờ | 1h, 1h45 | expired; gợi ý deal khác |
| T2 | accepted | 1 giờ | 30p, 50p | expired; mở collateral; +1 vi phạm Requester |
| T3 | payment_sent | 1 giờ | 30p, 50p | ticket Admin; đánh dấu quá SLA Provider |
| T4 | payment_confirmed | SLA deal + 30p | 80% SLA | ticket Admin; Requester được nổi bật nút khiếu nại |
| T5 | transfer_sent | 24 giờ | 6h, 20h | ticket Admin; không tự completed |
| T6 | disputed | 48 giờ | 24h | escalate trưởng nhóm vận hành |

- Tất cả trạng thái sống phải hiển thị “ai đang cầm lượt” và thời gian còn lại.
- Thông báo bắt buộc qua in-app; push/email tùy cấu hình; sự kiện tài chính quan trọng có thể thêm SMS.
- Mọi thông báo deep-link vào chi tiết giao dịch.

# 8. Use case Provider

| Mã | Use case | Mô tả BA cuối | P0/P1 |
| --- | --- | --- | --- |
| UC-P-01 | Dashboard cần xử lý | Hiển thị yêu cầu chờ, giao dịch sắp quá SLA, ví khả dụng/đang ký quỹ, rating, completed count | P1 |
| UC-P-02 | Tạo deal | Provider nhập corridor, tỷ giá, min/max, phương thức, SLA, hạn hiệu lực; system validate tài khoản tương ứng và lệch tỷ giá | P0 |
| UC-P-03 | Sửa/pause/xóa/đăng lại deal | Sửa tạo version; request cũ giữ snapshot; xóa cần xác nhận 2 bước và soft delete | P0 |
| UC-P-04 | Duyệt request | Xem Requester profile, số tiền, beneficiary, phí, collateral, SLA; chấp nhận nếu đủ ký quỹ hoặc từ chối kèm lý do | P0 |
| UC-P-05 | Xác nhận nhận tiền | Đối soát paymentProof, sao kê, số tiền, memo; xác nhận không thể đảo ngược | P0 |
| UC-P-06 | Chi trả beneficiary | Xem thông tin người nhận đã mask/unmask theo ngữ cảnh; chuyển tiền ngoài hệ thống; upload transferProof | P0 |
| UC-P-07 | Khiếu nại | Tại payment_sent sau 30 phút nếu chưa nhận/thiếu/sai memo; tại transfer_sent nếu Requester không xác nhận | P0 |
| UC-P-08 | Quản lý tài khoản nhận tiền | Thêm/sửa/xóa tài khoản theo currency/method; chặn xóa nếu đang dùng bởi giao dịch sống | P0 |
| UC-P-09 | Ví và ký quỹ | Nạp/rút ví; xem available/locked/frozen; xem ledger | P0 |

# 9. Use case Requester

| Mã | Use case | Mô tả BA cuối | P0/P1 |
| --- | --- | --- | --- |
| UC-R-01 | Nhập nhu cầu | Chọn gửi/nhận, số tiền, method, beneficiary, ghi chú; hiển thị ước tính + phí + tổng phải chuyển | P0 |
| UC-R-02 | Chọn deal | Danh sách deal lọc đúng corridor/hạn mức, xếp theo match, tỷ giá, SLA, rating và rủi ro quá SLA | P0 |
| UC-R-03 | Gửi request | Xác nhận Provider, tỷ giá thật, beneficiary, phí, SLA; tạo pending_acceptance | P0 |
| UC-R-04 | Theo dõi request | Chi tiết giao dịch có stepper 4 pha, trạng thái v3, ai đang cầm lượt, countdown, proof, chat | P0 |
| UC-R-05 | Hủy request | Chỉ khi pending_acceptance; có xác nhận; theo dõi tần suất hủy | P1 |
| UC-R-06 | Thanh toán Provider | Hiển thị tài khoản Provider, tổng tiền, memo lớn, copy all, QR nếu hỗ trợ; upload paymentProof | P0 |
| UC-R-07 | Xác nhận hoàn tất | Chỉ khi transfer_sent; bottom sheet cảnh báo không thể hoàn tác + checkbox đã kiểm tra với người nhận | P0 |
| UC-R-08 | Khiếu nại | Từ payment_sent/payment_confirmed/transfer_sent; phân loại bắt buộc; upload bằng chứng | P0 |
| UC-R-09 | Quản lý tài khoản người nhận | Lưu beneficiary/payment account để auto-fill một chạm | P1 |
| UC-R-10 | Đánh giá Provider | Sau completed, rating double-blind trong 7 ngày | P1 |
| UC-R-11 | Gửi lại giao dịch cũ | Repeat remittance từ giao dịch completed hoặc beneficiary đã lưu | P1 |

# 10. Use case Admin / Trọng tài

| Mã | Use case | Mô tả | Ưu tiên |
| --- | --- | --- | --- |
| UC-A-01 | Quản lý hàng đợi dispute | Xem case disputed và ticket quá SLA; assign người xử lý; sắp theo deadline | P0 |
| UC-A-02 | Phân xử dispute | Xem timeline, proof, chat, ledger, hồ sơ hai bên; yêu cầu bổ sung bằng chứng; ra phán quyết | P0 |
| UC-A-03 | Thực thi phán quyết | System ghi ledger theo R1/R2/R3/R4; update status resolved, violation, rating impact | P0 |
| UC-A-04 | Quản trị người dùng | Xem KYC tier, giao dịch, violation; khóa/mở tài khoản; điều chỉnh hạn mức | P1 |
| UC-A-05 | Giám sát AML | Cảnh báo structuring, nhiều Requester về một beneficiary, tần suất bất thường, deal rủi ro | P1 |
| UC-A-06 | Cấu hình vận hành | SLA theo corridor, fee, ngưỡng tỷ giá, template thông báo, reason code | P1 |

| Outcome | Khi nào dùng | Thực thi tài chính |
| --- | --- | --- |
| R1_complete | Beneficiary đã nhận đủ nhưng Requester không xác nhận | Thu phí 2 bên, mở ký quỹ, Requester +1 vi phạm |
| R2_refund_requester | Provider nhận tiền nhưng không chi trả/chi sai | Trích ký quỹ Provider bồi hoàn; Provider chịu phí phạt |
| R3_no_payment | Requester chưa thanh toán hoặc proof giả | Mở ký quỹ Provider; Requester bị vi phạm/phí phạt/khóa nếu gian lận |
| R4_mutual_cancel | Hủy đồng thuận hoặc lỗi khách quan | Hoàn trạng thái tiền; không phí, không vi phạm |

# 11. Quy tắc nghiệp vụ chuẩn hóa

| Mã | Quy tắc |
| --- | --- |
| BR-01 | Deal phải có corridor, tỷ giá > 0, min < max, ít nhất 1 phương thức nhận và 1 phương thức chi, SLA, hạn hiệu lực. |
| BR-02 | Deal active mới hiển thị trên marketplace. Deal paused/expired/soft-deleted không hiển thị. |
| BR-03 | Deal có version; request đã tạo giữ snapshot version tại thời điểm gửi. |
| BR-04 | Tỷ giá deal lệch > ±3% thị trường phải cảnh báo; > ±10% chặn đăng. |
| BR-05 | Mỗi phương thức nhận tiền của Provider trên deal phải có tài khoản thanh toán tương ứng. |
| BR-06 | Requester thấy phí 0,5% và tổng phải chuyển từ bước nhập nhu cầu. |
| BR-07 | Xếp hạng deal theo corridor, active, hạn mức, method match, tỷ giá, SLA/rating. |
| BR-08 | Payment proof và transfer proof là bất biến, không sửa/xóa sau khi nộp. |
| BR-09 | Memo là bắt buộc để đối soát; UI phải có copy all và QR nếu method hỗ trợ. |
| BR-10 | Provider chỉ chấp nhận request khi ví khả dụng đủ collateral. |
| BR-11 | Collateral bị freeze khi disputed và chỉ mở theo completed/expired/resolved. |
| BR-12 | Provider được khiếu nại tại payment_sent sau tối thiểu 30 phút từ khi Requester nộp proof. |
| BR-13 | Mọi hành động không thể đảo ngược phải có xác nhận 2 bước hoặc hold-to-confirm. |
| BR-14 | Mọi trạng thái sống có SLA và escalation; không để trạng thái treo vô hạn. |
| BR-15 | Dispute chỉ đóng bằng một trong 4 outcome R1/R2/R3/R4. |
| BR-16 | Rating double-blind trong 7 ngày sau completed; resolved không cho đánh giá tự do. |
| BR-17 | Chat theo request là bất biến và là bằng chứng phân xử. |
| BR-18 | Dữ liệu nhạy cảm mask mặc định và chỉ unmask theo ngữ cảnh cần hành động. |
| BR-19 | KYC tier quyết định quyền và hạn mức. T0 chỉ xem, T1 gửi request, T2 làm Provider. |
| BR-20 | Mọi giao dịch tài chính nội bộ phải có ledger entry và audit log. |

# 12. Dữ liệu nghiệp vụ và mô hình thực thể

| Entity | Thuộc tính chính | Ghi chú |
| --- | --- | --- |
| User | id, role flags, profile, status, riskScore | Một user có thể là Requester và/hoặc Provider nếu đủ KYC |
| KYC_PROFILE | tier, status, documents, liveness, address, sourceOfFunds | Quyết định quyền giao dịch |
| Wallet | userId, currency, available, locked, frozen | Dùng cho collateral và phí |
| LedgerEntry | type, amount, currency, relatedRequestId, balanceBefore/After, audit | Bắt buộc cho nạp/rút/lock/unlock/fee/refund/penalty |
| Deal | providerId, corridor, status, currentVersionId, counters | Soft delete; versioned |
| DealVersion | rate, min, max, methods, SLA, note, effectiveAt | Snapshot khi tạo request |
| Request | dealVersionId, requesterId, providerId, amountSend, amountReceive, status, fee, collateral, memo, deadlines | Thực thể trung tâm |
| Beneficiary | name, phone, bank, account, address, method, currency | Có thể embedded trong request hoặc lưu account reusable |
| Proof | type, refCode, note, files, createdAt, uploaderId | payment/transfer/dispute; bất biến |
| Dispute | requestId, openedBy, category, evidence, assignee, outcome, rationale | SLA 48h |
| ChatThread/Message | requestId, sender, content, attachment, systemEvent | Không sửa/xóa |
| Review | requestId, fromUser, toUser, stars, tags, comment, blindStatus | Double-blind |
| SlaTimer | requestId, phase, deadline, remindersSent, escalated | Scheduler đọc để nhắc và escalate |
| Notification | recipient, channel, event, deepLink, readAt | In-app/push/email/SMS |

# 13. Ma trận tiền tệ và phương thức thanh toán

| Tiền tệ | Phương thức hỗ trợ | Trường dữ liệu bắt buộc |
| --- | --- | --- |
| USD | Zelle, Venmo, PayPal, Bank Transfer | SĐT/email/handle hoặc bank + account |
| EUR | PayPal, SEPA, Bank Transfer | email/IBAN/bank + account |
| GBP | PayPal, Bank Transfer | email hoặc bank + account |
| SGD | PayNow, Bank Transfer | SĐT hoặc bank + account |
| AUD | PayID, PayPal, Bank Transfer | SĐT/email hoặc bank + account |
| JPY | PayPay, Bank Transfer | SĐT hoặc bank + account |
| KRW | KakaoPay, Bank Transfer | SĐT hoặc bank + account |
| THB | PromptPay, Bank Transfer | SĐT hoặc bank + account |
| CNY | WeChat Pay, Alipay, Bank Transfer | SĐT/email hoặc bank + account |
| VND | MoMo, ZaloPay, Chuyển khoản NH | SĐT hoặc ngân hàng + số tài khoản + chủ TK; hỗ trợ VietQR |

# 14. Yêu cầu UX/UI bắt buộc

| Mã | Yêu cầu UI/UX | Mục tiêu |
| --- | --- | --- |
| UX-P0-1 | Hiển thị tổng chi phí từ bước đầu: tiền gửi, phí 0,5%, tổng phải chuyển, người nhận thực nhận | Không gây bất ngờ phí |
| UX-P0-2 | Màn thanh toán có copy từng dòng, copy all, QR, memo lớn nổi bật | Giảm lỗi chuyển tiền |
| UX-P0-3 | Xác nhận nhận đủ/hoàn tất dùng bottom sheet 2 bước + checkbox/hold | Tránh bấm nhầm hành động irreversible |
| UX-P0-4 | Khối “Bạn được bảo vệ” tại màn thanh toán: ký quỹ Provider + trọng tài 48h | Giảm lo âu khi chuyển tiền |
| UX-P0-5 | Header chi tiết giao dịch luôn hiển thị ai đang cầm lượt + countdown | Giảm mơ hồ trạng thái |
| UX-P0-6 | Tất cả xóa/hủy dùng một AlertDialog nhất quán | Phòng lỗi thao tác |
| UX-P1-1 | Stepper 4 pha phủ lên 12 trạng thái kỹ thuật | Người dùng hiểu tiến trình dễ hơn |
| UX-P1-2 | Từ chối có lý do + CTA tìm deal tương tự | Phục hồi nhanh |
| UX-P1-3 | Card deal có tín hiệu đúng hạn, phản hồi trung bình, volume 30 ngày | Tăng niềm tin khi chọn Provider |
| UX-P1-4 | Upload proof mobile-first: camera, nén ảnh, retry queue, cảnh báo ảnh mờ | Giảm lỗi bằng chứng |
| UX-P2-1 | Design token trạng thái và typography số tiền tabular | Nhất quán và dễ đọc |

# 15. KYC, AML, bảo mật dữ liệu

| Tier | Yêu cầu | Quyền | Hạn mức đề xuất |
| --- | --- | --- | --- |
| T0 | Email/SĐT + OTP | Xem marketplace, lưu tài khoản | Không giao dịch |
| T1 | eKYC giấy tờ + liveness | Gửi request | ≤ $1.000/GD; ≤ $5.000/30 ngày |
| T2 | T1 + địa chỉ + nguồn tiền + bank chính chủ | Làm Provider; nâng hạn mức Requester | Theo thẩm định |

- AML: phát hiện chia nhỏ giao dịch, tần suất bất thường, nhiều Requester tới cùng beneficiary, corridor rủi ro, proof giả, lặp lại đối tác bất thường.
- Bảo mật: mask mặc định số tài khoản/SĐT; unmask theo ngữ cảnh hành động; mọi lần xem/unmask ghi audit log.
- Proof URL phải có chữ ký hết hạn; chỉ hai bên và Admin được xem; không index public.
- Gate pháp lý M0 là bắt buộc trước khi giao dịch thật.

# 16. KPI và báo cáo vận hành

| Nhóm | KPI | Nguồn dữ liệu |
| --- | --- | --- |
| Giao dịch | GMV, số request, tỷ lệ completed, tỷ lệ expired, thời gian trung vị từng pha | REQUEST, SLA_TIMER |
| Provider | Tỷ lệ đúng SLA, số deal active, volume 30 ngày, rating, dispute lost rate | DEAL, REQUEST, REVIEW, DISPUTE |
| Requester | Tỷ lệ hủy, thanh toán đúng hạn, dispute opened/lost, repeat rate | REQUEST, VIOLATION |
| Tài chính | Doanh thu phí, phí phạt, tổng collateral locked/frozen, ledger reconciliation | WALLET, LEDGER |
| Tranh chấp | Tỷ lệ disputed, outcome R1/R2/R3/R4, thời gian phân xử, phúc thẩm | DISPUTE |
| Rủi ro | AML alerts, proof giả, giao dịch ngoài nền tảng phát hiện qua chat | AML, CHAT, DISPUTE |

# 17. Acceptance Criteria cấp hệ thống

| Mã | Acceptance Criteria |
| --- | --- |
| AC-01 | Không user nào có thể tạo giao dịch thật nếu chưa đạt KYC tier tương ứng. |
| AC-02 | Provider không thể accept nếu ví khả dụng không đủ collateral. |
| AC-03 | Requester luôn thấy tổng phải chuyển trước khi gửi request và trước khi thanh toán. |
| AC-04 | Mọi request sống phải có deadline SLA và hiển thị countdown ở chi tiết. |
| AC-05 | paymentProof là điều kiện bắt buộc để chuyển accepted → payment_sent. |
| AC-06 | transferProof là điều kiện bắt buộc để chuyển payment_confirmed → transfer_sent. |
| AC-07 | completed phải thu phí, mở khóa collateral và tạo quyền rating. |
| AC-08 | disputed phải freeze collateral và tạo case Admin với SLA 48h. |
| AC-09 | Admin chỉ được đóng dispute bằng R1/R2/R3/R4 và phải có rationale. |
| AC-10 | Mọi bút toán ví phải có ledger entry khớp số dư trước/sau. |
| AC-11 | Mọi xóa/hủy phải có xác nhận; deal có giao dịch sống không xóa cứng được. |
| AC-12 | Dữ liệu tài khoản/memo/proof phải mask/unmask theo quyền và audit log. |

# 18. Roadmap triển khai

| Giai đoạn | Phạm vi | Gate ra |
| --- | --- | --- |
| M0 — Pháp lý & nền móng | Ý kiến pháp lý, eKYC/gateway shortlist, mô hình ledger, state machine, threat model | Pháp chế và kiến trúc duyệt |
| M1 — MVP giao dịch tin cậy | KYC T1/T2, deal/request, ví/collateral, fee completed, proof/memo/QR, SLA T1–T6, Admin dispute 4 outcome | E2E chạy được cả completed và disputed→resolved; ledger audit 100% |
| M2 — Vòng tin cậy | Chat theo request, rating double-blind, sửa deal version, tỷ giá realtime, masking nâng cao, dashboard KPI | Pilot NPS đạt ngưỡng; dispute rate dưới ngưỡng |
| M3 — Scale | Thêm corridor, AML nâng cao, tối ưu phí, automation dispute, growth dashboard | Sẵn sàng mở rộng thị trường |

# 19. Rủi ro còn lại và khuyến nghị BA

| Rủi ro | Mức độ | Khuyến nghị |
| --- | --- | --- |
| Pháp lý remittance xuyên biên giới | Rất cao | Không launch giao dịch thật trước khi có legal memo theo từng thị trường |
| Provider không muốn ký quỹ cao | Cao | Pilot với nhóm Provider nhỏ, có bậc tín nhiệm giảm collateral sau lịch sử tốt |
| Tranh chấp proof/memo | Cao | Ưu tiên copy all, QR, proof quality check, chat audit |
| Chi phí Admin phân xử | Trung bình/Cao | Thiết kế reason code, evidence template, automation trước M2 |
| Dis-intermediation | Trung bình | Tăng giá trị bảo vệ bằng collateral, resolution, rating và cảnh báo chat |
| Tỷ giá biến động | Trung bình | Realtime API, ngưỡng lệch, deal version, quote expiry |

# 20. Phụ lục — nhãn UI và microcopy chuẩn

| Ngữ cảnh | Microcopy đề xuất |
| --- | --- |
| Chờ chấp nhận | Đã gửi tới {Provider}. Nhà cung cấp cần phản hồi trước {deadline}. |
| Bị từ chối | {Provider} từ chối: {reason}. Tìm deal tương tự với thông tin đã nhập. |
| Trước chuyển tiền | Bước quan trọng: dán đúng mã {memo} vào nội dung chuyển khoản. Đây là mã bảo vệ giao dịch của bạn. |
| Bạn được bảo vệ | Nhà cung cấp đã ký quỹ {amount}. Nếu có tranh chấp, đội trọng tài xử lý trong 48 giờ. |
| Chờ Provider chi trả | {Provider} đang chuyển {amountReceive} cho {beneficiary} qua {method}. Cam kết trước {deadline}. |
| Xác nhận hoàn tất | Chỉ xác nhận khi {beneficiary} đã nhận đủ {amountReceive}. Hành động này không thể hoàn tác. |
| Phí | Phí hệ thống 0,5% — chỉ thu khi giao dịch hoàn tất. |
| Dispute | Khiếu nại đã được tiếp nhận. Admin sẽ xử lý trong 48 giờ. |
