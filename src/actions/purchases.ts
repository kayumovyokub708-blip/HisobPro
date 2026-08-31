"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const purchaseItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().positive(),
  purchasePrice: z.number().min(0),
});

const createPurchaseSchema = z.object({
  supplierId: z.string().min(1, "Таъминкунанда ҳатмист"),
  notes: z.string().optional().nullable(),
  items: z.array(purchaseItemSchema).min(1, "Ҳадди ақал як маҳсулот"),
});

export async function getPurchases(params?: { page?: number; limit?: number }) {
  const page = params?.page || 1;
  const limit = params?.limit || 20;
  const skip = (page - 1) * limit;

  const [purchases, total] = await Promise.all([
    prisma.purchase.findMany({
      include: {
        supplier: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.purchase.count(),
  ]);

  return { purchases, total, page, totalPages: Math.ceil(total / limit) };
}

export async function createPurchase(input: z.infer<typeof createPurchaseSchema>) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  if ((session.user as any).role === "CASHIER") throw new Error("Иҷозат нест");

  const data = createPurchaseSchema.parse(input);
  const userId = (session.user as any).id;

  let total = 0;
  for (const item of data.items) {
    total += item.quantity * item.purchasePrice;
  }

  const purchase = await prisma.$transaction(async (tx) => {
    const newPurchase = await tx.purchase.create({
      data: {
        supplierId: data.supplierId,
        total,
        notes: data.notes || null,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            purchasePrice: item.purchasePrice,
            total: item.quantity * item.purchasePrice,
          })),
        },
      },
      include: {
        supplier: true,
        items: { include: { product: true } },
      },
    });

    for (const item of data.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;

      const previousStock = Number(product.quantity);
      const newStock = previousStock + item.quantity;

      await tx.product.update({
        where: { id: item.productId },
        data: { quantity: newStock, purchasePrice: item.purchasePrice },
      });

      await tx.inventoryMovement.create({
        data: {
          productId: item.productId,
          operation: "RECEIVE",
          quantity: item.quantity,
          previousStock,
          newStock,
          userId,
          notes: `Қабули мол аз ${newPurchase.supplier?.name || "таъминкунанда"}`,
        },
      });
    }

    await tx.activityLog.create({
      data: {
        userId,
        action: "CREATE_PURCHASE",
        object: "Purchase",
        details: `Қабули мол: ${total.toFixed(2)} сомонӣ`,
      },
    });

    return newPurchase;
  });

  revalidatePath("/purchases");
  revalidatePath("/products");
  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  revalidatePath("/suppliers");

  return purchase;
}

export async function getProductsForPurchase() {
  return prisma.product.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, purchasePrice: true, quantity: true, unit: true },
  });
}
