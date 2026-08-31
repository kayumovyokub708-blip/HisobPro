# HisobPro

**Ҳамаи ҳисобҳои магазин — дар як ҷо.**

HisobPro — системаи замонавӣ ва production-ready барои идоракунии мағозаҳо, POS, анбор, мизоҷон, қарзҳо, хароҷот ва ҳисоботҳо (махсусан барои Тоҷикистон).

## Ҳолати ҷорӣ

- ✅ Архитектура + Prisma Schema (пурра)
- ✅ Seed (маҳсулот, корбарон, категорияҳо, мизоҷон, хароҷот)
- ✅ Authentication (NextAuth + bcrypt + JWT)
- ✅ Login воқеӣ
- ✅ Protected routes + Role-Based Access (Admin / Manager / Cashier)
- ✅ Sidebar (responsive + mobile hamburger)
- ✅ Dashboard бо маълумоти воқеӣ аз Database
- 🔄 Products, POS, Inventory, Customers... (дар ҳоли сохташавӣ)

## Tech Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- PostgreSQL + Prisma ORM
- NextAuth.js (Credentials)
- bcryptjs, Zod, Recharts, Lucide

## Насб

```bash
git clone https://github.com/kayumovyokub708-blip/HisobPro.git
cd HisobPro
npm install
cp .env.example .env
# DATABASE_URL ва NEXTAUTH_SECRET-ро танзим кунед
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Кушоед: http://localhost:3000

### Credential-ҳои демо

| Нақш     | Username | Password    |
|----------|----------|-------------|
| Admin    | admin    | admin123    |
| Manager  | manager  | manager123  |
| Cashier  | cashier  | cashier123  |

## Сохтор

```
src/
├── app/
│   ├── (dashboard)/     # Protected pages + layout
│   ├── api/auth/        # NextAuth
│   └── login/
├── components/
│   ├── layout/Sidebar.tsx
│   └── providers.tsx
├── lib/
│   ├── auth.ts
│   ├── prisma.ts
│   └── utils.ts
└── types/
prisma/
├── schema.prisma
└── seed.ts
```

## Нақшаи минбаъда

1. Products CRUD + Categories
2. POS (сабад, barcode, пардохт, чек)
3. Inventory movements
4. Customers + Debt
5. Suppliers + Purchases
6. Expenses & Returns
7. Reports + Charts
8. Notifications + Activity Log
9. Settings + Dark Mode
10. Testing + Production polish

---

Made with ❤️ for Tajikistan businesses.
