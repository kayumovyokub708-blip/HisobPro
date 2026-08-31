"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Unit } from "@prisma/client";

const productSchema = z.object({
  name: z.string().min(1, "Номи маҳсулот ҳатмист"),
  sku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  purchasePrice: z.coerce.number().min(0),
  sellingPrice: z.coerce.number().min(0),
  quantity: z.coerce.number().min(0).default(0),
  minStock: z.coerce.number().min(0).default(0),
  unit: z.nativeEnum(Unit).default(Unit.PIECE),
  categoryId: z.string().optional().nullable(),
  supplierId: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  expirationDate: z.string().optional().nullable(),
});

export async function getProducts(params?: {
  search?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}) {
  const page = params?.page || 1;
  const limit = params?.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (params?.search) {
    const q = params.search;
    where.OR = [
      { name: { contains: q } },
      { barcode: { contains: q } },
      { sku: { contains: q } },
      { brand: { contains: q } },
    ];
  }
  if (params?.categoryId) {
    where.categoryId = params.categoryId;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        supplier: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { category: true, supplier: true },
  });
}

export async function createProduct(data: z.infer<typeof productSchema>) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const role = (session.user as any).role;
  if (role === "CASHIER") throw new Error("Иҷозат нест");

  const parsed = productSchema.parse(data);

  const product = await prisma.product.create({
    data: {
      name: parsed.name,
      sku: parsed.sku || null,
      barcode: parsed.barcode || null,
      brand: parsed.brand || null,
      purchasePrice: parsed.purchasePrice,
      sellingPrice: parsed.sellingPrice,
      quantity: parsed.quantity,
      minStock: parsed.minStock,
      unit: parsed.unit,
      categoryId: parsed.categoryId || null,
      supplierId: parsed.supplierId || null,
      description: parsed.description || null,
      expirationDate: parsed.expirationDate
        ? new Date(parsed.expirationDate)
        : null,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: (session.user as any).id,
      action: "CREATE_PRODUCT",
      object: "Product",
      details: `Маҳсулот илова шуд: ${product.name}`,
    },
  });

  if (Number(product.quantity) <= Number(product.minStock)) {
    await prisma.notification.create({
      data: {
        title: "Маҳсулоти камшуда",
        message: `${product.name} — танҳо ${product.quantity} мондааст`,
        type: "low_stock",
        link: `/products/${product.id}`,
        userId: (session.user as any).id,
      },
    });
  }

  revalidatePath("/products");
  revalidatePath("/dashboard");
  return product;
}

export async function updateProduct(
  id: string,
  data: z.infer<typeof productSchema>
) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const role = (session.user as any).role;
  if (role === "CASHIER") throw new Error("Иҷозат нест");

  const parsed = productSchema.parse(data);

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: parsed.name,
      sku: parsed.sku || null,
      barcode: parsed.barcode || null,
      brand: parsed.brand || null,
      purchasePrice: parsed.purchasePrice,
      sellingPrice: parsed.sellingPrice,
      quantity: parsed.quantity,
      minStock: parsed.minStock,
      unit: parsed.unit,
      categoryId: parsed.categoryId || null,
      supplierId: parsed.supplierId || null,
      description: parsed.description || null,
      expirationDate: parsed.expirationDate
        ? new Date(parsed.expirationDate)
        : null,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: (session.user as any).id,
      action: "UPDATE_PRODUCT",
      object: "Product",
      details: `Маҳсулот таҳрир шуд: ${product.name}`,
    },
  });

  revalidatePath("/products");
  revalidatePath(`/products/${id}`);
  revalidatePath("/dashboard");
  return product;
}

export async function deleteProduct(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const role = (session.user as any).role;
  if (role !== "ADMIN") throw new Error("Танҳо Админ метавонад нест кунад");

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new Error("Маҳсулот ёфт нашуд");

  await prisma.product.delete({ where: { id } });

  await prisma.activityLog.create({
    data: {
      userId: (session.user as any).id,
      action: "DELETE_PRODUCT",
      object: "Product",
      details: `Маҳсулот нест шуд: ${product.name}`,
    },
  });

  revalidatePath("/products");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export async function createCategory(name: string, description?: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const category = await prisma.category.create({
    data: { name, description: description || null },
  });

  revalidatePath("/categories");
  revalidatePath("/products");
  return category;
}

export async function deleteCategory(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  if ((session.user as any).role !== "ADMIN")
    throw new Error("Танҳо Админ метавонад нест кунад");

  await prisma.category.delete({ where: { id } });
  revalidatePath("/categories");
  revalidatePath("/products");
  return { success: true };
}

export async function getSuppliers() {
  return prisma.supplier.findMany({ orderBy: { name: "asc" } });
}
