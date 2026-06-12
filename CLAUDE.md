# P2P Remit Deals

Nền tảng chuyển tiền ngang hàng kết nối Requester ↔ Provider qua KYC, ký quỹ, ledger, SLA và dispute.

## Rules

Chi tiết được chia theo chủ đề trong `.claude/rules/`:

| File | Chủ đề | Apply |
|---|---|---|
| [01-project-overview.md](.claude/rules/01-project-overview.md) | Mô tả sản phẩm, actors, tài liệu tham chiếu, phạm vi prototype | Always |
| [02-tech-stack.md](.claude/rules/02-tech-stack.md) | Stack, cấu trúc thư mục, path alias, lệnh dev | Always |
| [03-state-machine.md](.claude/rules/03-state-machine.md) | State machine, timers, invariants, guard conditions | `src/app/**` |
| [04-data-model.md](.claude/rules/04-data-model.md) | Interfaces Deal/DealRequest/Proof, fee model, wallet model | `src/app/data/**`, components |
| [05-design-system.md](.claude/rules/05-design-system.md) | Color tokens, UX principles, component inventory | `src/app/components/**` |
| [06-code-conventions.md](.claude/rules/06-code-conventions.md) | Forbidden patterns, naming, imports, TypeScript | Always |

## Tài liệu nghiệp vụ

- [BA Final v4.0](src/docs/P2P_Remit_Deals_BA_Final_v4.0.md)
- [UX/UI Spec v4.0](src/docs/P2P_Remit_Deals_UX_UI_Spec_v4.0.md)
- [UI Text Wireframes v4.0](src/docs/P2P_Remit_Deals_UI_Text_Wireframes_v4.0.md)
