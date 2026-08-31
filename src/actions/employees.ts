"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

const employeeSchema = z.object({
  name: z.string().min(1, "Ном ҳатмист"),
  username: z.string().min(3, "Username ҳадди ақал 3 аломат"),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  role: z.enum(["ADMIN", "MANAGER", "CASHIER"]),
  password: z.string().min(4).optional(),
  status: z.boolean().optional(),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  if ((session.user as any).role !== "ADMIN")
    throw new Error("Танҳо Админ метавонад кормандонро идора кунад");
  return session;
}

export async function getEmployees() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      username: true,
      phone: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });
}

export async function createEmployee(data: z.infer<typeof employeeSchema>) {
  await requireAdmin();
  const parsed = employeeSchema.parse(data);
  if (!parsed.password) throw new Error("Парол ҳатмист");

  const exists = await prisma.user.findUnique({
    where: { username: parsed.username },
  });
  if (exists) throw new Error("Ин username аллакай вуҷуд дорад");

  const passwordHash = await bcrypt.hash(parsed.password, 10);
  const user = await prisma.user.create({
    data: {
      name: parsed.name,
      username: parsed.username,
      phone: parsed.phone || null,
      email: parsed.email || null,
      role: parsed.role as Role,
      passwordHash,
      status: parsed.status ?? true,
    },
  });

  revalidatePath("/employees");
  return { id: user.id, username: user.username };
}

export async function updateEmployee(
  id: string,
  data: z.infer<typeof employeeSchema>
) {
  const session = await requireAdmin();
  const parsed = employeeSchema.parse(data);

  const updateData: any = {
    name: parsed.name,
    username: parsed.username,
    phone: parsed.phone || null,
    email: parsed.email || null,
    role: parsed.role as Role,
  };
  if (typeof parsed.status === "boolean") updateData.status = parsed.status;
  if (parsed.password) {
    updateData.passwordHash = await bcrypt.hash(parsed.password, 10);
  }

  if (id === (session.user as any).id && parsed.role !== "ADMIN") {
    throw new Error("Шумо наметавонед нақши худро аз Админ иваз кунед");
  }

  await prisma.user.update({ where: { id }, data: updateData });
  revalidatePath("/employees");
  return { success: true };
}

export async function toggleEmployeeStatus(id: string) {
  const session = await requireAdmin();
  if (id === (session.user as any).id)
    throw new Error("Шумо наметавонед худро ғайрифаъол кунед");

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("Корбар ёфт нашуд");

  await prisma.user.update({
    where: { id },
    data: { status: !user.status },
  });
  revalidatePath("/employees");
  return { success: true };
}

export async function deleteEmployee(id: string) {
  const session = await requireAdmin();
  if (id === (session.user as any).id)
    throw new Error("Шумо наметавонед худро нест кунед");

  await prisma.user.delete({ where: { id } });
  revalidatePath("/employees");
  return { success: true };
}
