"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { PaymentMethod } from "@prisma/client";

const saleItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().positive(),
  price: z.number().min(0),
  discount: z.number().min(0).default(0),
});

const createSaleSchema = z.object({
  items: z.array(saleItemSchema).min(1, "Сабад холӣ аст"),
  discount: z.number().min(0).default(0),
  paymentMethod: z.nativeEnum(PaymentMethod),
  customerId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

function generateReceiptNumber() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `HP-${date}-${rand}`;
}

export async function searchProductsForPOS(query: string) {
  if (!query || query.length < 1) {
    return prisma.product.findMany({
      take: 30,
      orderBy: { name: "asc" },
      include: { category: true },
    });
  }

  return prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: query } },
        { barcode: { contains: query } },
        { sku: { contains: query } },
      ],
    },
    take: 20,
    orderBy: { name: "asc" },
    include: { category: true },
  });
}

export async function getProductByBarcode(barcode: string) {
  return prisma.product.findFirst({
    where: { barcode },
    include: { category: true },
  });
}

export async function createSale(input: z.infer<typeof createSaleSchema>) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const data = createSaleSchema.parse(input);
  const userId = (session.user as any).id;

  let subtotal = 0;
  for (const item of data.items) {
    subtotal += item.price * item.quantity - (item.discount || 0);
  }
  const total = Math.max(0, subtotal - (data.discount || 0));

  const sale = await prisma.$transaction(async (tx) => {
    for (const item of data.items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) throw new Error(`Маҳсулот ёфт нашуд`);
      if (Number(product.quantity) < item.quantity) {
        throw new Error(
          `Анбор нокифоя: ${product.name} (монда: ${product.quantity})`
        );
      }
    }

    const receiptNumber = generateReceiptNumber();

    const newSale = await tx.sale.create({
      data: {
        receiptNumber,
        subtotal,
        discount: data.discount || 0,
        total,
        paymentMethod: data.paymentMethod,
        notes: data.notes || null,
        userId,
        customerId: data.customerId || null,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            discount: item.discount || 0,
            total: item.price * item.quantity - (item.discount || 0),
          })),
        },
      },
      include: {
        items: { include: { product: true } },
        user: true,
        customer: true,
      },
    });

    for (const item of data.items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) continue;

      const previousStock = Number(product.quantity);
      const newStock = previousStock - item.quantity;

      await tx.product.update({
        where: { id: item.productId },
        data: { quantity: newStock },
      });

      await tx.inventoryMovement.create({
        data: {
          productId: item.productId,
          operation: "SALE",
          quantity: item.quantity,
          previousStock,
          newStock,
          userId,
          notes: `Фурӯш #${receiptNumber}`,
        },
      });

      if (newStock <= Number(product.minStock) && Number(product.minStock) > 0) {
        await tx.notification.create({
          data: {
            title: "Маҳсулоти камшуда",
            message: `${product.name} — танҳо ${newStock} мондааст`,
            type: "low_stock",
            link: `/products/${product.id}`,
            userId,
          },
        });
      }
    }

    if (data.customerId) {
      await tx.customer.update({
        where: { id: data.customerId },
        data: { totalPurchases: { increment: total } },
      });
    }

    await tx.activityLog.create({
      data: {
        userId,
        action: "CREATE_SALE",
        object: "Sale",
        details: `Фурӯш #${receiptNumber} — ${total.toFixed(2)} сомонӣ`,
      },
    });

    return newSale;
  });

  revalidatePath("/dashboard");
  revalidatePath("/products");
  revalidatePath("/pos");
  revalidatePath("/inventory");

  return sale;
}

export async function getRecentSales(limit = 10) {
  return prisma.sale.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      customer: true,
      items: { include: { product: true } },
    },
  });
}
