"use client";

import { useState, useRef, useEffect, useTransition, useCallback } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CreditCard,
  Banknote,
  QrCode,
  CheckCircle2,
  Printer,
  X,
} from "lucide-react";
import {
  searchProductsForPOS,
  getProductByBarcode,
  createSale,
} from "@/actions/sales";
import { formatCurrency } from "@/lib/utils";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  discount: number;
  unit: string;
  maxStock: number;
};

const unitLabels: Record<string, string> = {
  PIECE: "дона",
  KG: "кг",
  GRAM: "г",
  LITER: "л",
  METER: "м",
  BOX: "қуттӣ",
};

export function POSTerminal() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartDiscount, setCartDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH" | "CARD" | "QR" | "MIXED"
  >("CASH");
  const [isPending, startTransition] = useTransition();
  const [searching, setSearching] = useState(false);
  const [successSale, setSuccessSale] = useState<any>(null);
  const [error, setError] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const barcodeBuffer = useRef("");
  const barcodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await searchProductsForPOS(query);
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement &&
        e.target !== searchRef.current
      ) {
        return;
      }

      if (e.key === "Enter" && barcodeBuffer.current.length > 3) {
        e.preventDefault();
        const code = barcodeBuffer.current;
        barcodeBuffer.current = "";
        handleBarcode(code);
        return;
      }

      if (e.key.length === 1) {
        barcodeBuffer.current += e.key;
        if (barcodeTimer.current) clearTimeout(barcodeTimer.current);
        barcodeTimer.current = setTimeout(() => {
          barcodeBuffer.current = "";
        }, 80);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [cart]);

  async function handleBarcode(code: string) {
    try {
      const product = await getProductByBarcode(code);
      if (product) {
        addToCart(product);
        setQuery("");
      } else {
        setError(`Barcode ёфт нашуд: ${code}`);
        setTimeout(() => setError(""), 3000);
      }
    } catch {
      setError("Хатогӣ ҳангоми ҷустуҷӯи barcode");
    }
  }

  const addToCart = useCallback((product: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        if (existing.quantity >= Number(product.quantity)) {
          setError(`Анбор нокифоя: ${product.name}`);
          setTimeout(() => setError(""), 2500);
          return prev;
        }
        return prev.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      if (Number(product.quantity) <= 0) {
        setError(`Маҳсулот тамом шудааст: ${product.name}`);
        setTimeout(() => setError(""), 2500);
        return prev;
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: Number(product.sellingPrice),
          quantity: 1,
          discount: 0,
          unit: product.unit,
          maxStock: Number(product.quantity),
        },
      ];
    });
    searchRef.current?.focus();
  }, []);

  function updateQty(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.productId !== productId) return i;
          const next = i.quantity + delta;
          if (next <= 0) return null as any;
          if (next > i.maxStock) {
            setError("Анбор нокифоя");
            setTimeout(() => setError(""), 2000);
            return i;
          }
          return { ...i, quantity: next };
        })
        .filter(Boolean)
    );
  }

  function removeItem(productId: string) {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }

  function clearCart() {
    setCart([]);
    setCartDiscount(0);
  }

  const subtotal = cart.reduce(
    (sum, i) => sum + i.price * i.quantity - i.discount,
    0
  );
  const total = Math.max(0, subtotal - cartDiscount);

  function handleCheckout() {
    if (cart.length === 0) return;
    setError("");
    startTransition(async () => {
      try {
        const sale = await createSale({
          items: cart.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
            discount: i.discount,
          })),
          discount: cartDiscount,
          paymentMethod,
        });
        setSuccessSale(sale);
        setCart([]);
        setCartDiscount(0);
      } catch (err: any) {
        setError(err.message || "Хатогӣ рӯй дод");
      }
    });
  }

  function printReceipt() {
    window.print();
  }

  if (successSale) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            Фурӯш бомуваффақият анҷом ёфт
          </h2>
          <p className="text-slate-500 mt-1">
            Чек № {successSale.receiptNumber}
          </p>
          <p className="text-3xl font-bold mt-3">
            {formatCurrency(Number(successSale.total))}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-sm print:border-0" id="receipt">
          <div className="text-center mb-4">
            <div className="font-bold text-lg">HisobPro</div>
            <div className="text-xs text-slate-500">Чек № {successSale.receiptNumber}</div>
            <div className="text-xs text-slate-500">
              {new Date(successSale.createdAt).toLocaleString("tg-TJ")}
            </div>
            <div className="text-xs text-slate-500">
              Кассир: {successSale.user?.name}
            </div>
          </div>
          <div className="border-t border-dashed border-slate-300 my-3" />
          {successSale.items?.map((item: any) => (
            <div key={item.id} className="flex justify-between text-sm py-1">
              <span>
                {item.product?.name} × {Number(item.quantity)}
              </span>
              <span>{formatCurrency(Number(item.total))}</span>
            </div>
          ))}
          <div className="border-t border-dashed border-slate-300 my-3" />
          <div className="flex justify-between font-bold">
            <span>Ҳамагӣ</span>
            <span>{formatCurrency(Number(successSale.total))}</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Пардохт:{" "}
            {successSale.paymentMethod === "CASH"
              ? "Нақд"
              : successSale.paymentMethod === "CARD"
              ? "Корт"
              : successSale.paymentMethod === "QR"
              ? "QR"
              : "Омехта"}
          </div>
          <div className="text-center text-xs text-slate-400 mt-4">
            Ташаккур барои харид!
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center print:hidden">
          <button
            onClick={printReceipt}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-medium text-sm"
          >
            <Printer className="w-4 h-4" />
            Чоп кардани чек
          </button>
          <button
            onClick={() => {
              setSuccessSale(null);
              searchRef.current?.focus();
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm"
          >
            Фурӯши нав
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-[calc(100vh-8rem)]">
      <div className="lg:col-span-3 flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ҷустуҷӯ ё barcode сканер..."
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-base focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
            autoComplete="off"
          />
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-2.5 flex items-center justify-between">
            {error}
            <button onClick={() => setError("")}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {searching ? (
            <div className="p-8 text-center text-slate-400 text-sm">Ҷустуҷӯ...</div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">Маҳсулот ёфт нашуд</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 max-h-[60vh] lg:max-h-[calc(100vh-14rem)] overflow-y-auto">
              {results.map((p) => {
                const stock = Number(p.quantity);
                const out = stock <= 0;
                return (
                  <button
                    key={p.id}
                    onClick={() => !out && addToCart(p)}
                    disabled={out}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      out
                        ? "opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-700"
                        : "border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 active:scale-[0.98]"
                    }`}
                  >
                    <div className="font-medium text-sm line-clamp-2">{p.name}</div>
                    <div className="text-blue-600 font-bold text-sm mt-1">
                      {formatCurrency(Number(p.sellingPrice))}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {out ? "Тамом" : `${stock} ${unitLabels[p.unit] || p.unit}`}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-2 flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 font-semibold">
            <ShoppingCart className="w-5 h-5" />
            Сабад
            {cart.length > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                {cart.length}
              </span>
            )}
          </div>
          {cart.length > 0 && (
            <button onClick={clearCart} className="text-xs text-rose-500 hover:underline">
              Тоза кардан
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[200px] max-h-[40vh] lg:max-h-none">
          {cart.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm py-12">
              Сабад холӣ аст
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{item.name}</div>
                  <div className="text-xs text-slate-500">
                    {formatCurrency(item.price)} × {item.quantity}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQty(item.productId, -1)}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:bg-slate-100"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item.productId, 1)}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:bg-slate-100"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="w-8 h-8 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center justify-center ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Субтотал</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm gap-2">
            <span className="text-slate-500">Скидка</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={cartDiscount || ""}
              onChange={(e) =>
                setCartDiscount(Math.max(0, Number(e.target.value) || 0))
              }
              className="w-28 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-right text-sm outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Ҳамагӣ</span>
            <span className="text-blue-600">{formatCurrency(total)}</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { id: "CASH" as const, label: "Нақд", icon: Banknote },
              { id: "CARD" as const, label: "Корт", icon: CreditCard },
              { id: "QR" as const, label: "QR", icon: QrCode },
              { id: "MIXED" as const, label: "Омехта", icon: CreditCard },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-medium border transition-colors ${
                    paymentMethod === m.id
                      ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300"
                      : "border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {m.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || isPending}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-base transition-colors shadow-md"
          >
            {isPending ? "Интизор шавед..." : "Фурӯшро анҷом додан"}
          </button>
        </div>
      </div>
    </div>
  );
}
