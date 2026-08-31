"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const returnItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().positive(),
  price: z.number().min(0),
});

const createReturnSchema = z.object({
  saleId: z.string().min(1),
  reason: z.string().optional().nullable(),
  items: z.array(returnItemSchema).min(1, "Ҳадди ақал як маҳсулот"),
});

export async function getReturns(params?: { page?: number; limit?: number }) {
  const page = params?.page || 1;
  const limit = params?.limit || 20;
  const skip = (page - 1) * limit;

  const [returns, total] = await Promise.all([
    prisma.return.findMany({
      include: {
        sale: true,
        customer: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.return.count(),
  ]);

  return { returns, total, page, totalPages: Math.ceil(total / limit) };
}

export async function findSaleByReceipt(receiptNumber: string) {
  if (!receiptNumber.trim()) return null;
  return prisma.sale.findFirst({
    where: { receiptNumber: receiptNumber.trim() },
    include: {
      items: { include: { product: true } },
      customer: true,
      returns: { include: { items: true } },
    },
  });
}

export async function createReturn(input: z.infer<typeof createReturnSchema>) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const data = createReturnSchema.parse(input);
  const userId = (session.user as any).id;

  const sale = await prisma.sale.findUnique({
    where: { id: data.saleId },
    include: {
      items: true,
      returns: { include: { items: true } },
    },
  });
  if (!sale) throw new Error("Фурӯш ёфт нашуд");

  const returnedQty: Record<string, number> = {};
  for (const r of sale.returns) {
    for (const ri of r.items) {
      returnedQty[ri.productId] =
        (returnedQty[ri.productId] || 0) + Number(ri.quantity);
    }
  }

  const soldQty: Record<string, number> = {};
  for (const si of sale.items) {
    soldQty[si.productId] =
      (soldQty[si.productId] || 0) + Number(si.quantity);
  }

  for (const item of data.items) {
    const max =
      (soldQty[item.productId] || 0) - (returnedQty[item.productId] || 0);
    if (item.quantity > max + 0.0001) {
      throw new Error(
        `Миқдори баргардонидан аз фурӯш зиёд аст (макс: ${max})`
      );
    }
  }

  let totalRefund = 0;
  for (const item of data.items) {
    totalRefund += item.quantity * item.price;
  }

  const ret = await prisma.$transaction(async (tx) => {
    const newReturn = await tx.return.create({
      data: {
        saleId: data.saleId,
        customerId: sale.customerId,
        totalRefund,
        reason: data.reason || null,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            total: item.quantity * item.price,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
        sale: true,
      },
    });

    for (const item of data.items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) continue;

      const previousStock = Number(product.quantity);
      const newStock = previousStock + item.quantity;

      await tx.product.update({
        where: { id: item.productId },
        data: { quantity: newStock },
      });

      await tx.inventoryMovement.create({
        data: {
          productId: item.productId,
          operation: "RETURN",
          quantity: item.quantity,
          previousStock,
          newStock,
          userId,
          notes: `Баргардонидан аз чек ${sale.receiptNumber}`,
        },
      });
    }

    await tx.activityLog.create({
      data: {
        userId,
        action: "CREATE_RETURN",
        object: "Return",
        details: `Баргардонидан ${sale.receiptNumber}: ${totalRefund.toFixed(2)} сомонӣ`,
      },
    });

    return newReturn;
  });

  revalidatePath("/returns");
  revalidatePath("/products");
  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  revalidatePath("/pos");

  return ret;
}
