"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { PaymentMethod } from "@prisma/client";

const customerSchema = z.object({
  name: z.string().min(1, "Ном ҳатмист"),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function getCustomers(params?: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = params?.page || 1;
  const limit = params?.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (params?.search) {
    where.OR = [
      { name: { contains: params.search } },
      { phone: { contains: params.search } },
    ];
  }

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.customer.count({ where }),
  ]);

  return { customers, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getCustomer(id: string) {
  return prisma.customer.findUnique({
    where: { id },
    include: {
      sales: {
        take: 20,
        orderBy: { createdAt: "desc" },
        include: { items: { include: { product: true } } },
      },
      debts: { orderBy: { createdAt: "desc" } },
      payments: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
}

export async function createCustomer(data: z.infer<typeof customerSchema>) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const parsed = customerSchema.parse(data);
  const customer = await prisma.customer.create({
    data: {
      name: parsed.name,
      phone: parsed.phone || null,
      address: parsed.address || null,
      notes: parsed.notes || null,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: (session.user as any).id,
      action: "CREATE_CUSTOMER",
      object: "Customer",
      details: `Мизоҷ илова шуд: ${customer.name}`,
    },
  });

  revalidatePath("/customers");
  return customer;
}

export async function updateCustomer(
  id: string,
  data: z.infer<typeof customerSchema>
) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const parsed = customerSchema.parse(data);
  const customer = await prisma.customer.update({
    where: { id },
    data: {
      name: parsed.name,
      phone: parsed.phone || null,
      address: parsed.address || null,
      notes: parsed.notes || null,
    },
  });

  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  return customer;
}

export async function deleteCustomer(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  if ((session.user as any).role !== "ADMIN")
    throw new Error("Танҳо Админ метавонад нест кунад");

  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) throw new Error("Мизоҷ ёфт нашуд");

  await prisma.customer.delete({ where: { id } });

  await prisma.activityLog.create({
    data: {
      userId: (session.user as any).id,
      action: "DELETE_CUSTOMER",
      object: "Customer",
      details: `Мизоҷ нест шуд: ${customer.name}`,
    },
  });

  revalidatePath("/customers");
  return { success: true };
}

export async function addCustomerDebt(
  customerId: string,
  amount: number,
  description?: string
) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  if (amount <= 0) throw new Error("Маблағ бояд зиёд аз 0 бошад");

  await prisma.$transaction(async (tx) => {
    await tx.customerDebt.create({
      data: {
        customerId,
        amount,
        remaining: amount,
        description: description || null,
      },
    });
    await tx.customer.update({
      where: { id: customerId },
      data: { debt: { increment: amount } },
    });
    await tx.activityLog.create({
      data: {
        userId: (session.user as any).id,
        action: "ADD_DEBT",
        object: "CustomerDebt",
        details: `Қарз ${amount} сомонӣ илова шуд`,
      },
    });
  });

  revalidatePath(`/customers/${customerId}`);
  revalidatePath("/customers");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function addCustomerPayment(
  customerId: string,
  amount: number,
  method: PaymentMethod = "CASH",
  notes?: string
) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  if (amount <= 0) throw new Error("Маблағ бояд зиёд аз 0 бошад");

  await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw new Error("Мизоҷ ёфт нашуд");

    const payAmount = Math.min(amount, Number(customer.debt));

    await tx.customerPayment.create({
      data: {
        customerId,
        amount: payAmount,
        method,
        notes: notes || null,
      },
    });

    let left = payAmount;
    const openDebts = await tx.customerDebt.findMany({
      where: { customerId, remaining: { gt: 0 } },
      orderBy: { createdAt: "asc" },
    });
    for (const d of openDebts) {
      if (left <= 0) break;
      const reduce = Math.min(left, Number(d.remaining));
      await tx.customerDebt.update({
        where: { id: d.id },
        data: { remaining: Number(d.remaining) - reduce },
      });
      left -= reduce;
    }

    await tx.customer.update({
      where: { id: customerId },
      data: { debt: { decrement: payAmount } },
    });

    await tx.activityLog.create({
      data: {
        userId: (session.user as any).id,
        action: "CUSTOMER_PAYMENT",
        object: "CustomerPayment",
        details: `Пардохти қарз ${payAmount} сомонӣ`,
      },
    });
  });

  revalidatePath(`/customers/${customerId}`);
  revalidatePath("/customers");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getCustomersWithDebt() {
  return prisma.customer.findMany({
    where: { debt: { gt: 0 } },
    orderBy: { debt: "desc" },
  });
}
