"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const settingsSchema = z.object({
  storeName: z.string().min(1),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  currency: z.string().default("TJS"),
  currencySymbol: z.string().default("сомонӣ"),
  receiptFooter: z.string().optional().nullable(),
  language: z.string().default("tg"),
  theme: z.string().default("light"),
  allowNegativeStock: z.boolean().default(false),
});

export async function getSettings() {
  let settings = await prisma.storeSettings.findUnique({
    where: { id: "default" },
  });
  if (!settings) {
    settings = await prisma.storeSettings.create({
      data: { id: "default" },
    });
  }
  return settings;
}

export async function updateSettings(data: z.infer<typeof settingsSchema>) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "MANAGER")
    throw new Error("Иҷозат нест");

  const parsed = settingsSchema.parse(data);

  const settings = await prisma.storeSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      storeName: parsed.storeName,
      phone: parsed.phone || null,
      address: parsed.address || null,
      currency: parsed.currency,
      currencySymbol: parsed.currencySymbol,
      receiptFooter: parsed.receiptFooter || "Ташаккур барои харид!",
      language: parsed.language,
      theme: parsed.theme,
      allowNegativeStock: parsed.allowNegativeStock,
    },
    update: {
      storeName: parsed.storeName,
      phone: parsed.phone || null,
      address: parsed.address || null,
      currency: parsed.currency,
      currencySymbol: parsed.currencySymbol,
      receiptFooter: parsed.receiptFooter || null,
      language: parsed.language,
      theme: parsed.theme,
      allowNegativeStock: parsed.allowNegativeStock,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: (session.user as any).id,
      action: "UPDATE_SETTINGS",
      object: "StoreSettings",
      details: "Танзимоти мағоза нав шуд",
    },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return settings;
}
