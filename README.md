# HisobPro

**Ҳамаи ҳисобҳои магазин — дар як ҷо.**

HisobPro is a modern, production-ready retail management and POS system designed for small and medium-sized stores in Tajikistan.

## Features

- 🛒 Full POS (Point of Sale) with barcode support
- 📦 Product & Inventory management
- 👥 Customers + Debt tracking
- 🚚 Suppliers & Stock receiving
- 💰 Expenses management
- ↩️ Returns
- 📊 Reports & Charts (real data)
- 👤 Role-based access (Admin / Manager / Cashier)
- 🌙 Dark / Light mode
- 🇹🇯 Full Tajik (Cyrillic) interface
- 📱 Fully responsive (Desktop + Mobile)

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Server Actions
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js (Credentials)
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/kayumovyokub708-blip/HisobPro.git
cd HisobPro
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment

```bash
cp .env.example .env
```

Edit `.env` and set your `DATABASE_URL` and `NEXTAUTH_SECRET`.

### 4. Database setup

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Seed demo data
npm run db:seed
```

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo credentials (after seeding)

- Username: `admin`
- Password: `admin123`

## Project Structure

```
HisobPro/
├── prisma/
│   ├── schema.prisma      # Full database schema
│   └── seed.ts            # Demo data
├── src/
│   ├── app/               # Next.js App Router pages
│   ├── components/        # Reusable UI components
│   ├── lib/               # Utilities, Prisma client, auth
│   └── types/             # TypeScript types
├── public/
└── ...
```

## Development Roadmap

1. ✅ Project architecture & database schema
2. 🔄 Authentication
3. 🔄 Main layout + Dashboard
4. 🔄 Products & Categories
5. 🔄 Inventory
6. 🔄 POS
7. 🔄 Customers & Debts
8. 🔄 Suppliers & Purchases
9. 🔄 Expenses & Returns
10. 🔄 Reports & Charts
11. 🔄 Employees & Permissions
12. 🔄 Notifications & Activity Log
13. 🔄 Settings
14. 🔄 Testing & Optimization

## License

Private / All rights reserved.

---

Made with ❤️ for Tajikistan businesses.
