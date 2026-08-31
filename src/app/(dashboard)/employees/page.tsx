import Link from "next/link";
import { getEmployees } from "@/actions/employees";
import { Plus, Users } from "lucide-react";
import { EmployeesClient } from "@/components/employees/EmployeesClient";

export const dynamic = "force-dynamic";

const roleLabels: Record<string, string> = {
  ADMIN: "Админ",
  MANAGER: "Мудир",
  CASHIER: "Кассир",
};

export default async function EmployeesPage() {
  let employees: any[] = [];
  try {
    employees = await getEmployees();
  } catch {}

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Кормандон</h1>
          <p className="text-sm text-slate-500">{employees.length} корбар</p>
        </div>
        <Link
          href="/employees/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Илова кардани корманд
        </Link>
      </div>

      {employees.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border p-12 text-center">
          <Users className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">Корманд нест</p>
        </div>
      ) : (
        <EmployeesClient employees={employees} roleLabels={roleLabels} />
      )}
    </div>
  );
}
