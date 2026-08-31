"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { PaymentMethod } from "@prisma/client";

export const EXPENSE_CATEGORIES = [
  "Иҷора",
  "Барқ",
  "Интернет",
  "Маош",
  "Нақлиёт",
  "Таъмир",
  "Реклама",
  "Дигар",
];

const expenseSchema = z.object({
  category: z.string().min(1),
  amount: z.coerce.number().positive("Маблағ бояд зиёд аз 0 бошад"),
  description: z.string().optional().nullable(),
  paymentMethod: z.nativeEnum(PaymentMethod).default("CASH"),
  date: z.string().optional(),
});

export async function getExpenses(params?: {
  page?: number;
  limit?: number;
  category?: string;
}) {
  const page = params?.page || 1;
  const limit = params?.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (params?.category) where.category = params.category;

  const [expenses, total, sum] = await Promise.all([
    prisma.expense.findMany({
      where,
      include: { user: true },
      orderBy: { date: "desc" },
      skip,
      take: limit,
    }),
    prisma.expense.count({ where }),
    prisma.expense.aggregate({ where, _sum: { amount: true } }),
  ]);

  return {
    expenses,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    totalAmount: Number(sum._sum.amount || 0),
  };
}

export async function createExpense(data: z.infer<typeof expenseSchema>) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const role = (session.user as any).role;
  if (role === "CASHIER") throw new Error("Иҷозат нест");

  const parsed = expenseSchema.parse(data);

  const expense = await prisma.expense.create({
    data: {
      category: parsed.category,
      amount: parsed.amount,
      description: parsed.description || null,
      paymentMethod: parsed.paymentMethod,
      date: parsed.date ? new Date(parsed.date) : new Date(),
      userId: (session.user as any).id,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: (session.user as any).id,
      action: "CREATE_EXPENSE",
      object: "Expense",
      details: `${parsed.category}: ${parsed.amount} сомонӣ`,
    },
  });

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  return expense;
}

export async function deleteExpense(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  if ((session.user as any).role === "CASHIER")
    throw new Error("Иҷозат нест");

  await prisma.expense.delete({ where: { id } });
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  return { success: true };
}
