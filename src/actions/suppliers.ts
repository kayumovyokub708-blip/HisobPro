"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const supplierSchema = z.object({
  name: z.string().min(1, "Ном ҳатмист"),
  contactPerson: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function getSuppliers(params?: { search?: string }) {
  const where: any = {};
  if (params?.search) {
    where.OR = [
      { name: { contains: params.search } },
      { phone: { contains: params.search } },
      { contactPerson: { contains: params.search } },
    ];
  }
  return prisma.supplier.findMany({
    where,
    orderBy: { name: "asc" },
    include: { _count: { select: { purchases: true, products: true } } },
  });
}

export async function getSupplier(id: string) {
  return prisma.supplier.findUnique({
    where: { id },
    include: {
      purchases: {
        take: 20,
        orderBy: { createdAt: "desc" },
        include: { items: { include: { product: true } } },
      },
      products: { take: 20 },
    },
  });
}

export async function createSupplier(data: z.infer<typeof supplierSchema>) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  if ((session.user as any).role === "CASHIER") throw new Error("Иҷозат нест");

  const parsed = supplierSchema.parse(data);
  const supplier = await prisma.supplier.create({
    data: {
      name: parsed.name,
      contactPerson: parsed.contactPerson || null,
      phone: parsed.phone || null,
      address: parsed.address || null,
      notes: parsed.notes || null,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: (session.user as any).id,
      action: "CREATE_SUPPLIER",
      object: "Supplier",
      details: `Таъминкунанда: ${supplier.name}`,
    },
  });

  revalidatePath("/suppliers");
  return supplier;
}

export async function updateSupplier(id: string, data: z.infer<typeof supplierSchema>) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  if ((session.user as any).role === "CASHIER") throw new Error("Иҷозат нест");

  const parsed = supplierSchema.parse(data);
  const supplier = await prisma.supplier.update({
    where: { id },
    data: {
      name: parsed.name,
      contactPerson: parsed.contactPerson || null,
      phone: parsed.phone || null,
      address: parsed.address || null,
      notes: parsed.notes || null,
    },
  });
  revalidatePath("/suppliers");
  revalidatePath(`/suppliers/${id}`);
  return supplier;
}

export async function deleteSupplier(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  if ((session.user as any).role !== "ADMIN")
    throw new Error("Танҳо Админ метавонад нест кунад");

  await prisma.supplier.delete({ where: { id } });
  revalidatePath("/suppliers");
  return { success: true };
}
