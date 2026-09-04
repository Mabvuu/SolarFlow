"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  AlertTriangle,
  ArrowLeft,
  Boxes,
  CircleDollarSign,
  Package,
  Plus,
  Search,
  SunMedium,
  X,
} from "lucide-react";


const API_URL =
  "https://solarflow-backend-uvgv.onrender.com";


type InventoryItem = {
  id: number;
  name: string;
  sku: string | null;
  category: string | null;
  quantity: number;
  reorder_level: number;
  unit_cost: number;
  selling_price: number;
  created_at: string;
};


export default function InventoryPage() {
  const [items, setItems] =
    useState<InventoryItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [name, setName] =
    useState("");

  const [sku, setSku] =
    useState("");

  const [category, setCategory] =
    useState("Solar Panels");

  const [quantity, setQuantity] =
    useState("0");

  const [
    reorderLevel,
    setReorderLevel,
  ] = useState("5");

  const [unitCost, setUnitCost] =
    useState("0");

  const [
    sellingPrice,
    setSellingPrice,
  ] = useState("0");

  const [error, setError] =
    useState("");


  async function loadInventory() {
    try {
      setError("");

      const response = await fetch(
        `${API_URL}/inventory/`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Could not load inventory"
        );
      }

      setItems(
        await response.json()
      );
    } catch {
      setError(
        "Could not load inventory."
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadInventory();
  }, []);


  async function createItem(
    event: FormEvent
  ) {
    event.preventDefault();

    if (!name.trim()) {
      setError(
        "Item name is required."
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/inventory/`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name: name.trim(),
            sku: sku.trim() || null,
            category:
              category || null,
            quantity:
              Math.max(
                Number(quantity || 0),
                0
              ),
            reorder_level:
              Math.max(
                Number(
                  reorderLevel || 0
                ),
                0
              ),
            unit_cost:
              Math.max(
                Number(unitCost || 0),
                0
              ),
            selling_price:
              Math.max(
                Number(
                  sellingPrice || 0
                ),
                0
              ),
          }),
        }
      );

      if (!response.ok) {
        const data =
          await response.json();

        throw new Error(
          data.detail ||
            "Could not add item"
        );
      }

      setName("");
      setSku("");
      setCategory(
        "Solar Panels"
      );
      setQuantity("0");
      setReorderLevel("5");
      setUnitCost("0");
      setSellingPrice("0");
      setShowForm(false);

      await loadInventory();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not add item."
      );
    } finally {
      setSaving(false);
    }
  }


  async function changeQuantity(
    item: InventoryItem,
    amount: number
  ) {
    const nextQuantity =
      Math.max(
        item.quantity + amount,
        0
      );

    await fetch(
      `${API_URL}/inventory/${item.id}/quantity`,
      {
        method: "PATCH",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          quantity: nextQuantity,
        }),
      }
    );

    await loadInventory();
  }


  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const value =
          search.toLowerCase();

        return (
          item.name
            .toLowerCase()
            .includes(value) ||
          item.sku
            ?.toLowerCase()
            .includes(value) ||
          item.category
            ?.toLowerCase()
            .includes(value)
        );
      }),
    [items, search]
  );


  const lowStock =
    items.filter(
      (item) =>
        item.quantity <=
        item.reorder_level
    ).length;


  const stockValue =
    items.reduce(
      (total, item) =>
        total +
        item.quantity *
          item.unit_cost,
      0
    );


  return (
    <div className="min-h-screen bg-[#f5f6f7]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 md:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200"
            >
              <ArrowLeft size={18} />
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f6b800]">
                <SunMedium size={21} />
              </div>

              <div>
                <p className="font-bold">
                  SolarFlow
                </p>

                <p className="text-xs text-gray-500">
                  Stock Management
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() =>
              setShowForm(true)
            }
            className="flex h-11 items-center gap-2 rounded-lg bg-black px-4 text-sm font-semibold text-white"
          >
            <Plus size={17} />
            Add Stock Item
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] p-5 md:p-8">
        <h1 className="text-3xl font-bold">
          Inventory
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Panels, batteries, inverters,
          cables and installation
          accessories.
        </p>

        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          <Stat
            title="Stock Items"
            value={items.length.toString()}
            icon={<Boxes size={19} />}
          />

          <Stat
            title="Low Stock"
            value={lowStock.toString()}
            icon={
              <AlertTriangle
                size={19}
              />
            }
          />

          <Stat
            title="Stock Cost Value"
            value={`$${stockValue.toLocaleString(
              undefined,
              {
                maximumFractionDigits: 2,
              }
            )}`}
            icon={
              <CircleDollarSign
                size={19}
              />
            }
          />
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold">
                Warehouse Stock
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Current stock levels
              </p>
            </div>

            <div className="relative w-full sm:w-[300px]">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search stock..."
                className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-3"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 px-5 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="p-10 text-center text-sm text-gray-500">
              Loading inventory...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px]">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
                    <th className="p-4">
                      Item
                    </th>

                    <th className="p-4">
                      Category
                    </th>

                    <th className="p-4">
                      Quantity
                    </th>

                    <th className="p-4">
                      Reorder
                    </th>

                    <th className="p-4">
                      Cost
                    </th>

                    <th className="p-4">
                      Selling
                    </th>

                    <th className="p-4">
                      Status
                    </th>

                    <th className="p-4">
                      Adjust
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map(
                    (item) => {
                      const isLow =
                        item.quantity <=
                        item.reorder_level;

                      return (
                        <tr
                          key={item.id}
                          className="border-b border-gray-100"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                                <Package
                                  size={
                                    18
                                  }
                                />
                              </div>

                              <div>
                                <p className="font-semibold">
                                  {
                                    item.name
                                  }
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                  {item.sku ||
                                    "No SKU"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="p-4 text-sm">
                            {item.category ||
                              "—"}
                          </td>

                          <td className="p-4 font-bold">
                            {
                              item.quantity
                            }
                          </td>

                          <td className="p-4 text-sm">
                            {
                              item.reorder_level
                            }
                          </td>

                          <td className="p-4 text-sm">
                            $
                            {item.unit_cost.toLocaleString()}
                          </td>

                          <td className="p-4 font-semibold">
                            $
                            {item.selling_price.toLocaleString()}
                          </td>

                          <td className="p-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                isLow
                                  ? "bg-red-50 text-red-700"
                                  : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              {isLow
                                ? "Low Stock"
                                : "In Stock"}
                            </span>
                          </td>

                          <td className="p-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  changeQuantity(
                                    item,
                                    -1
                                  )
                                }
                                className="h-9 w-9 rounded-lg border border-gray-200 font-bold"
                              >
                                −
                              </button>

                              <button
                                onClick={() =>
                                  changeQuantity(
                                    item,
                                    1
                                  )
                                }
                                className="h-9 w-9 rounded-lg bg-black font-bold text-white"
                              >
                                +
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <form
            onSubmit={createItem}
            className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Add Inventory Item
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Add equipment or
                  installation stock.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowForm(false)
                }
              >
                <X size={19} />
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Input
                label="Item Name"
                value={name}
                setValue={setName}
              />

              <Input
                label="SKU"
                value={sku}
                setValue={setSku}
              />

              <div>
                <Label>
                  Category
                </Label>

                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(
                      event.target.value
                    )
                  }
                  className="mt-2 h-11 w-full rounded-lg border border-gray-200 px-3"
                >
                  <option>
                    Solar Panels
                  </option>
                  <option>
                    Batteries
                  </option>
                  <option>
                    Inverters
                  </option>
                  <option>
                    Cables
                  </option>
                  <option>
                    Mounting
                  </option>
                  <option>
                    Electrical
                  </option>
                  <option>
                    Accessories
                  </option>
                </select>
              </div>

              <Input
                label="Quantity"
                value={quantity}
                setValue={setQuantity}
                type="number"
              />

              <Input
                label="Reorder Level"
                value={reorderLevel}
                setValue={
                  setReorderLevel
                }
                type="number"
              />

              <Input
                label="Unit Cost"
                value={unitCost}
                setValue={setUnitCost}
                type="number"
              />

              <Input
                label="Selling Price"
                value={sellingPrice}
                setValue={
                  setSellingPrice
                }
                type="number"
              />
            </div>

            <button
              disabled={saving}
              className="mt-6 h-11 w-full rounded-lg bg-black font-semibold text-white disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Add Stock Item"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}


function Label({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <label className="text-xs font-bold uppercase text-gray-500">
      {children}
    </label>
  );
}


function Input({
  label,
  value,
  setValue,
  type = "text",
}: {
  label: string;
  value: string;
  setValue: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>

      <input
        type={type}
        min={
          type === "number"
            ? "0"
            : undefined
        }
        value={value}
        onChange={(event) =>
          setValue(
            event.target.value
          )
        }
        className="mt-2 h-11 w-full rounded-lg border border-gray-200 px-3"
      />
    </div>
  );
}


function Stat({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex justify-between">
        <p className="text-sm text-gray-500">
          {title}
        </p>

        {icon}
      </div>

      <p className="mt-4 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}