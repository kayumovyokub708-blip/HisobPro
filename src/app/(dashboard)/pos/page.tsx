import { POSTerminal } from "@/components/pos/POSTerminal";

export const dynamic = "force-dynamic";

export default function POSPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Касса (POS)</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Фурӯши зуд · Barcode · Пардохт
        </p>
      </div>
      <POSTerminal />
    </div>
  );
}
