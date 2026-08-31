import { PrismaClient, Role, Unit, PaymentMethod } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding HisobPro database...");

  // Clean existing data (dev only)
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.returnItem.deleteMany();
  await prisma.return.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.customerPayment.deleteMany();
  await prisma.customerDebt.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();
  await prisma.storeSettings.deleteMany();

  // Store settings
  await prisma.storeSettings.create({
    data: {
      id: "default",
      storeName: "Мағозаи Намуна",
      phone: "+992 90 123 4567",
      address: "Душанбе, кӯчаи Рӯдакӣ 45",
      currency: "TJS",
      currencySymbol: "сомонӣ",
      receiptFooter: "Ташаккур барои харид! Боз ҳам ташриф биёред.",
      language: "tg",
      theme: "light",
      allowNegativeStock: false,
    },
  });

  // Admin user
  const passwordHash = await bcrypt.hash(
    process.env.DEMO_ADMIN_PASSWORD || "admin123",
    12
  );

  const admin = await prisma.user.create({
    data: {
      name: process.env.DEMO_ADMIN_NAME || "Администратор",
      username: process.env.DEMO_ADMIN_USERNAME || "admin",
      phone: "+992 90 111 2233",
      passwordHash,
      role: Role.ADMIN,
      status: true,
    },
  });

  // Manager
  const managerHash = await bcrypt.hash("manager123", 12);
  await prisma.user.create({
    data: {
      name: "Менеҷер Али",
      username: "manager",
      phone: "+992 90 222 3344",
      passwordHash: managerHash,
      role: Role.MANAGER,
      status: true,
    },
  });

  // Cashier
  const cashierHash = await bcrypt.hash("cashier123", 12);
  await prisma.user.create({
    data: {
      name: "Кассир Зарина",
      username: "cashier",
      phone: "+992 90 333 4455",
      passwordHash: cashierHash,
      role: Role.CASHIER,
      status: true,
    },
  });

  // Categories
  const categories = await Promise.all(
    [
      "Хӯрокворӣ",
      "Нӯшокиҳо",
      "Шириниҳо",
      "Маҳсулоти маишӣ",
      "Косметика",
      "Либос",
      "Электроника",
    ].map((name) =>
      prisma.category.create({
        data: { name },
      })
    )
  );

  const catFood = categories[0];
  const catDrinks = categories[1];
  const catSweets = categories[2];
  const catHome = categories[3];

  // Suppliers
  const supplier1 = await prisma.supplier.create({
    data: {
      name: "ООО «ТоҷикТаом»",
      contactPerson: "Раҳимов С.",
      phone: "+992 37 221 3344",
      address: "Душанбе",
      debt: 0,
    },
  });

  const supplier2 = await prisma.supplier.create({
    data: {
      name: "ИП Каримов",
      contactPerson: "Каримов У.",
      phone: "+992 91 555 6677",
      address: "Хуҷанд",
      debt: 2500,
    },
  });

  // Products (demo)
  const productsData = [
    {
      name: "Coca-Cola 0.5L",
      sku: "CC-05",
      barcode: "4600494600018",
      brand: "Coca-Cola",
      purchasePrice: 3.5,
      sellingPrice: 5.0,
      quantity: 48,
      minStock: 12,
      unit: Unit.PIECE,
      categoryId: catDrinks.id,
      supplierId: supplier1.id,
    },
    {
      name: "Pepsi 0.5L",
      sku: "PP-05",
      barcode: "4600494600025",
      brand: "Pepsi",
      purchasePrice: 3.4,
      sellingPrice: 4.8,
      quantity: 36,
      minStock: 10,
      unit: Unit.PIECE,
      categoryId: catDrinks.id,
      supplierId: supplier1.id,
    },
    {
      name: "Fanta 0.5L",
      sku: "FT-05",
      barcode: "4600494600032",
      brand: "Fanta",
      purchasePrice: 3.3,
      sellingPrice: 4.7,
      quantity: 24,
      minStock: 8,
      unit: Unit.PIECE,
      categoryId: catDrinks.id,
      supplierId: supplier1.id,
    },
    {
      name: "Шир 1L",
      sku: "MLK-1",
      barcode: "4600494600100",
      brand: "Ширин",
      purchasePrice: 7.0,
      sellingPrice: 9.5,
      quantity: 30,
      minStock: 10,
      unit: Unit.LITER,
      categoryId: catFood.id,
      supplierId: supplier2.id,
    },
    {
      name: "Нон",
      sku: "BRD-01",
      barcode: "4600494600209",
      brand: "Нони маҳаллӣ",
      purchasePrice: 2.0,
      sellingPrice: 3.0,
      quantity: 80,
      minStock: 20,
      unit: Unit.PIECE,
      categoryId: catFood.id,
      supplierId: supplier2.id,
    },
    {
      name: "Шакар 1кг",
      sku: "SGR-1",
      barcode: "4600494600308",
      brand: "Шакар",
      purchasePrice: 8.5,
      sellingPrice: 11.0,
      quantity: 45,
      minStock: 15,
      unit: Unit.KG,
      categoryId: catFood.id,
      supplierId: supplier1.id,
    },
    {
      name: "Равған 1L",
      sku: "OIL-1",
      barcode: "4600494600407",
      brand: "Олтой",
      purchasePrice: 18.0,
      sellingPrice: 23.0,
      quantity: 20,
      minStock: 5,
      unit: Unit.LITER,
      categoryId: catFood.id,
      supplierId: supplier1.id,
    },
    {
      name: "Биринҷ 1кг",
      sku: "RICE-1",
      barcode: "4600494600506",
      brand: "Биринҷи тоҷикӣ",
      purchasePrice: 12.0,
      sellingPrice: 15.5,
      quantity: 60,
      minStock: 20,
      unit: Unit.KG,
      categoryId: catFood.id,
      supplierId: supplier2.id,
    },
    {
      name: "Шоколад",
      sku: "CHOC-01",
      barcode: "4600494600605",
      brand: "Alpen Gold",
      purchasePrice: 6.0,
      sellingPrice: 9.0,
      quantity: 40,
      minStock: 10,
      unit: Unit.PIECE,
      categoryId: catSweets.id,
      supplierId: supplier1.id,
    },
    {
      name: "Сабун",
      sku: "SOAP-01",
      barcode: "4600494600704",
      brand: "Lux",
      purchasePrice: 4.0,
      sellingPrice: 6.5,
      quantity: 5,
      minStock: 8,
      unit: Unit.PIECE,
      categoryId: catHome.id,
      supplierId: supplier2.id,
    },
  ];

  for (const p of productsData) {
    await prisma.product.create({ data: p });
  }

  // Customers
  const customer1 = await prisma.customer.create({
    data: {
      name: "Аҳмадов Ҷамшед",
      phone: "+992 90 777 8899",
      address: "Душанбе, Сино",
      totalPurchases: 1250,
      debt: 350,
    },
  });

  await prisma.customer.create({
    data: {
      name: "Раҳимова Дилбар",
      phone: "+992 91 666 7788",
      address: "Душанбе",
      totalPurchases: 890,
      debt: 0,
    },
  });

  await prisma.customerDebt.create({
    data: {
      customerId: customer1.id,
      amount: 350,
      remaining: 350,
      description: "Қарзи қаблӣ",
    },
  });

  // Sample expenses
  await prisma.expense.createMany({
    data: [
      {
        category: "Иҷора",
        amount: 2500,
        description: "Иҷораи моҳона",
        paymentMethod: PaymentMethod.CASH,
        userId: admin.id,
        date: new Date(),
      },
      {
        category: "Барқ",
        amount: 380,
        description: "Пардохти барқ",
        paymentMethod: PaymentMethod.CARD,
        userId: admin.id,
        date: new Date(),
      },
    ],
  });

  // Activity log
  await prisma.activityLog.create({
    data: {
      userId: admin.id,
      action: "SETUP",
      object: "System",
      details: "Система насб шуд ва маълумоти демо илова карда шуд",
    },
  });

  // Notification for low stock
  await prisma.notification.create({
    data: {
      title: "Маҳсулоти камшуда",
      message: "Сабун — танҳо 5 дона мондааст (ҳадди минималӣ: 8)",
      type: "low_stock",
      link: "/products",
      userId: admin.id,
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log("   Admin: admin / admin123");
  console.log("   Manager: manager / manager123");
  console.log("   Cashier: cashier / cashier123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
