---
description: Tech stack, directory structure, path aliases, and dev commands for the P2P Remit Deals project.
alwaysApply: true
---

# Tech Stack & Project Structure

## Stack

| Thành phần | Công nghệ |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 6, `@vitejs/plugin-react` |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| UI primitives | Radix UI (accordion, dialog, tabs, sheet, popover…) |
| UI components | shadcn/ui pattern — `src/app/components/ui/` |
| UI extended | MUI v7 (`@mui/material`, `@mui/icons-material`, Emotion) |
| Icons | lucide-react |
| Animation | motion (Framer Motion v12) |
| Charts | recharts |
| Forms | react-hook-form |
| Routing | react-router v7 |
| Notifications | sonner |
| Path alias | `@` → `src/` |

## Directory structure

```
src/
├── app/
│   ├── App.tsx                  # Root: PhoneFrame + dual-pane Requester/Provider
│   ├── components/
│   │   ├── ui/                  # shadcn/ui primitives — không sửa logic nghiệp vụ ở đây
│   │   ├── shared/              # Components dùng chung: ProofModal, MethodIcon, RecipientDetails
│   │   ├── requester/           # RequesterApp + tất cả màn Requester
│   │   └── provider/            # ProviderApp + tất cả màn Provider
│   └── data/
│       ├── mockData.ts          # Interfaces, CURRENCIES, mock deals/requests, formatAmount
│       └── paymentIcons.ts      # Mapping phương thức thanh toán → icon
├── docs/                        # Tài liệu BA/UX (tham chiếu, không import vào code)
├── images/                      # Logo phương thức thanh toán (png)
└── styles/                      # CSS: index.css, theme.css, tailwind.css, fonts.css
```

## Path alias

Luôn dùng `@/` thay cho đường dẫn tương đối sâu:

```typescript
import { formatAmount } from '@/app/data/mockData';
import { ProofModal } from '@/app/components/shared/ProofModal';
```

## Dev commands

```bash
npm run dev      # Start dev server — http://localhost:5173
npm run build    # Build production
```
