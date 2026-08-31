import Link from "next/link";
import { getCustomers } from "@/actions/customers";
import { Plus, Users } from "lucide-react";
import { CustomersTable } from "@/components/customers/CustomersTable";
import { CustomerSearch } from "@/components/customers/CustomerSearch";

export const dynamic = "force-dynamic";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.q || "";
  const page = Number(params.page) || 1;

  let data = { customers: [] as any[], total: 0, page: 1, totalPages: 0 };
  try {
    data = await getCustomers({ search, page });
  } catch (e) {
    console.error(e);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Мизоҷон</h1>
          <p className="text-sm text-slate-500">{data.total} мизоҷ</p>
        </div>
        <Link
          href="/customers/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Илова кардани мизоҷ
        </Link>
      </div>

      <CustomerSearch />

      {data.customers.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <Users className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium mb-2">Ҳоло ягон мизоҷ нест</h3>
          <Link
            href="/customers/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium mt-4"
          >
            <Plus className="w-4 h-4" />
            Илова кардани мизоҷ
          </Link>
        </div>
      ) : (
        <CustomersTable
          customers={data.customers}
          page={data.page}
          totalPages={data.totalPages}
        />
      )}
    </div>
  );
}
