"use server";

import { prisma } from "@/lib/prisma";

export async function getInventoryStats() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      quantity: true,
      minStock: true,
      purchasePrice: true,
      sellingPrice: true,
      unit: true,
    },
  });

  let totalValue = 0;
  let lowStock = 0;
  let outOfStock = 0;

  for (const p of products) {
    totalValue += Number(p.quantity) * Number(p.purchasePrice);
    if (Number(p.quantity) <= 0) outOfStock++;
    else if (Number(p.quantity) <= Number(p.minStock) && Number(p.minStock) > 0)
      lowStock++;
  }

  return {
    productCount: products.length,
    totalValue,
    lowStock,
    outOfStock,
    products,
  };
}

export async function getInventoryMovements(params?: {
  page?: number;
  limit?: number;
  productId?: string;
}) {
  const page = params?.page || 1;
  const limit = params?.limit || 30;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (params?.productId) where.productId = params.productId;

  const [movements, total] = await Promise.all([
    prisma.inventoryMovement.findMany({
      where,
      include: {
        product: true,
        user: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.inventoryMovement.count({ where }),
  ]);

  return { movements, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getLowStockProducts() {
  const products = await prisma.product.findMany({
    orderBy: { quantity: "asc" },
  });
  return products.filter(
    (p) =>
      Number(p.quantity) <= Number(p.minStock) && Number(p.minStock) > 0
  );
}
