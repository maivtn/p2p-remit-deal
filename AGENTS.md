# P2P Remit Deals

Nền tảng chuyển tiền ngang hàng kết nối Requester ↔ Provider qua KYC, ký quỹ, ledger, SLA và dispute.

## Rules

Chi tiết được chia theo chủ đề trong `.Codex/rules/`:

| File | Chủ đề | Apply |
|---|---|---|
| [01-project-overview.md](.Codex/rules/01-project-overview.md) | Mô tả sản phẩm, actors, tài liệu tham chiếu, **web app target platforms**, responsive rules, phạm vi prototype | Always |
| [02-tech-stack.md](.Codex/rules/02-tech-stack.md) | Stack, cấu trúc thư mục, path alias, lệnh dev | Always |
| [03-state-machine.md](.Codex/rules/03-state-machine.md) | State machine, timers, invariants, guard conditions | `src/app/**` |
| [04-data-model.md](.Codex/rules/04-data-model.md) | Interfaces Deal/DealRequest/Proof, fee model, wallet model | `src/app/data/**`, components |
| [05-design-system.md](.Codex/rules/05-design-system.md) | Color tokens, UX principles, component inventory | `src/app/components/**` |
| [06-code-conventions.md](.Codex/rules/06-code-conventions.md) | Forbidden patterns, naming, imports, TypeScript | Always |
| [07-mock-data.md](.Codex/rules/07-mock-data.md) | Mock data JS layer cho HTML screens — load, schema, helper functions | `src/html/**` |

## Tài liệu nghiệp vụ

- [BA Final v1.6.1](src/docs/P2P_Remit_Deals_BA_Final_v1.6.1.md)
- [Wireframes v1.6.1](src/docs/P2P_Remit_Deals_Wireframes_v1.6.1.md)
