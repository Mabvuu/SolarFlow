"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  CheckCircle2,
  Plus,
  Search,
  ShieldCheck,
  SunMedium,
  UserRound,
  X,
} from "lucide-react";

const API_URL = "/api/backend";

type Customer = {
  id: number;
  name: string;
};

type Installation = {
  id: number;
  system_size: string | null;
  status: string;

  customer: {
    id: number;
    name: string;
  } | null;
};

type Warranty = {
  id: number;
  item_name: string;
  serial_number: string | null;
  status: string;
  created_at: string;

  customer: {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
  } | null;

  installation: {
    id: number;
    system_size: string | null;
    status: string;
  } | null;
};

export default function WarrantiesPage() {
  const [warranties, setWarranties] =
    useState<Warranty[]>([]);

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [installations, setInstallations] =
    useState<Installation[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [customerId, setCustomerId] =
    useState("");

  const [installationId, setInstallationId] =
    useState("");

  const [itemName, setItemName] =
    useState("");

  const [serialNumber, setSerialNumber] =
    useState("");

  const [error, setError] =
    useState("");

  async function loadData() {
    try {
      setError("");

      const [
        warrantyResponse,
        customerResponse,
        installationResponse,
      ] = await Promise.all([
        fetch(
          `${API_URL}/warranties/`,
          {
            cache: "no-store",
          }
        ),

        fetch(
          `${API_URL}/customers/`,
          {
            cache: "no-store",
          }
        ),

        fetch(
          `${API_URL}/installations/`,
          {
            cache: "no-store",
          }
        ),
      ]);

      if (!warrantyResponse.ok) {
        throw new Error(
          "Could not load warranties"
        );
      }

      const warrantyData =
        await warrantyResponse.json();

      const customerData =
        await customerResponse.json();

      const installationData =
        await installationResponse.json();

      setWarranties(warrantyData);
      setCustomers(customerData);
      setInstallations(installationData);

      if (
        customerData.length > 0 &&
        !customerId
      ) {
        setCustomerId(
          String(customerData[0].id)
        );
      }
    } catch (error) {
      console.error(error);

      setError(
        "Could not load warranty information."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function createWarranty(
    event: FormEvent
  ) {
    event.preventDefault();

    if (!customerId) {
      setError(
        "Please select a customer."
      );

      return;
    }

    if (!itemName.trim()) {
      setError(
        "Equipment name is required."
      );

      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/warranties/`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            customer_id:
              Number(customerId),

            installation_id:
              installationId
                ? Number(installationId)
                : null,

            item_name:
              itemName.trim(),

            serial_number:
              serialNumber.trim() ||
              null,

            status: "Active",
          }),
        }
      );

      if (!response.ok) {
        const data =
          await response.json();

        throw new Error(
          data.detail ||
            "Could not register warranty"
        );
      }

      setItemName("");
      setSerialNumber("");
      setInstallationId("");

      setShowForm(false);

      await loadData();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Could not register warranty."
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(
    id: number,
    status: string
  ) {
    try {
      const response = await fetch(
        `${API_URL}/warranties/${id}/status`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            status,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Could not update warranty"
        );
      }

      await loadData();
    } catch (error) {
      console.error(error);
    }
  }

  const filteredWarranties =
    warranties.filter(
      (warranty) => {
        const value =
          search
            .trim()
            .toLowerCase();

        if (!value) {
          return true;
        }

        return (
          warranty.item_name
            .toLowerCase()
            .includes(value) ||
          warranty.serial_number
            ?.toLowerCase()
            .includes(value) ||
          warranty.customer?.name
            .toLowerCase()
            .includes(value) ||
          warranty.status
            .toLowerCase()
            .includes(value)
        );
      }
    );

  const active =
    warranties.filter(
      (item) =>
        item.status === "Active"
    ).length;

  const claims =
    warranties.filter(
      (item) =>
        item.status === "Claim Open"
    ).length;

  const expired =
    warranties.filter(
      (item) =>
        item.status === "Expired"
    ).length;

  return (
    <div className="min-h-screen bg-[#f5f6f7]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 md:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white"
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
                  Warranty Management
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

            Register Warranty
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] p-5 md:p-8">
        <div>
          <p className="text-sm font-medium text-gray-500">
            After Sales
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Warranties
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Track solar equipment,
            serial numbers and warranty
            claims.
          </p>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat
            title="Total Warranties"
            value={warranties.length}
            icon={
              <ShieldCheck size={19} />
            }
          />

          <Stat
            title="Active"
            value={active}
            icon={
              <CheckCircle2 size={19} />
            }
          />

          <Stat
            title="Open Claims"
            value={claims}
            icon={
              <ShieldCheck size={19} />
            }
          />

          <Stat
            title="Expired"
            value={expired}
            icon={
              <ShieldCheck size={19} />
            }
          />
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold">
                Warranty Register
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Equipment warranty
                records
              </p>
            </div>

            <div className="relative w-full sm:w-[320px]">
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
                placeholder="Search warranties..."
                className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-3 text-sm outline-none"
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
              Loading warranties...
            </div>
          ) : filteredWarranties.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                <ShieldCheck size={21} />
              </div>

              <p className="mt-4 font-bold">
                No warranties found
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Register equipment
                warranties here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 p-5 lg:grid-cols-2">
              {filteredWarranties.map(
                (warranty) => (
                  <div
                    key={warranty.id}
                    className="rounded-xl border border-gray-200 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#fff7d6]">
                          <ShieldCheck
                            size={20}
                          />
                        </div>

                        <div>
                          <p className="font-bold">
                            {
                              warranty.item_name
                            }
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            {warranty.serial_number
                              ? `Serial: ${warranty.serial_number}`
                              : "Serial number not recorded"}
                          </p>
                        </div>
                      </div>

                      <select
                        value={
                          warranty.status
                        }
                        onChange={(event) =>
                          updateStatus(
                            warranty.id,
                            event.target
                              .value
                          )
                        }
                        className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-xs font-semibold"
                      >
                        <option>
                          Active
                        </option>

                        <option>
                          Claim Open
                        </option>

                        <option>
                          Replaced
                        </option>

                        <option>
                          Expired
                        </option>
                      </select>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <Detail
                        label="Customer"
                        value={
                          warranty.customer
                            ?.name ||
                          "—"
                        }
                      />

                      <Detail
                        label="Installation"
                        value={
                          warranty.installation
                            ?.system_size ||
                          "Not linked"
                        }
                      />
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <UserRound
                          size={15}
                        />

                        {warranty.customer
                          ?.name ||
                          "No customer"}
                      </div>

                      <p className="text-xs text-gray-400">
                        Registered{" "}
                        {new Date(
                          warranty.created_at
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <form
            onSubmit={createWarranty}
            className="my-8 w-full max-w-lg rounded-2xl bg-white p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Register Warranty
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Register customer
                  equipment.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowForm(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <Label>
                  Customer
                </Label>

                <select
                  value={customerId}
                  onChange={(event) =>
                    setCustomerId(
                      event.target.value
                    )
                  }
                  className="mt-2 h-11 w-full rounded-lg border border-gray-200 bg-white px-3"
                >
                  <option value="">
                    Select customer
                  </option>

                  {customers.map(
                    (customer) => (
                      <option
                        key={
                          customer.id
                        }
                        value={
                          customer.id
                        }
                      >
                        {
                          customer.name
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <Label>
                  Installation
                </Label>

                <select
                  value={
                    installationId
                  }
                  onChange={(event) =>
                    setInstallationId(
                      event.target.value
                    )
                  }
                  className="mt-2 h-11 w-full rounded-lg border border-gray-200 bg-white px-3"
                >
                  <option value="">
                    Not linked
                  </option>

                  {installations.map(
                    (installation) => (
                      <option
                        key={
                          installation.id
                        }
                        value={
                          installation.id
                        }
                      >
                        #
                        {
                          installation.id
                        }{" "}
                        —{" "}
                        {installation
                          .customer
                          ?.name ||
                          "Customer"}{" "}
                        —{" "}
                        {installation.system_size ||
                          "Solar System"}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <Label>
                  Equipment
                </Label>

                <input
                  value={itemName}
                  onChange={(event) =>
                    setItemName(
                      event.target.value
                    )
                  }
                  placeholder="Example: 5kVA Hybrid Inverter"
                  className="mt-2 h-11 w-full rounded-lg border border-gray-200 px-3"
                />
              </div>

              <div>
                <Label>
                  Serial Number
                </Label>

                <input
                  value={
                    serialNumber
                  }
                  onChange={(event) =>
                    setSerialNumber(
                      event.target.value
                    )
                  }
                  placeholder="Example: INV-5K-2026-4431"
                  className="mt-2 h-11 w-full rounded-lg border border-gray-200 px-3"
                />
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              disabled={saving}
              className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-black font-semibold text-white disabled:opacity-50"
            >
              <ShieldCheck
                size={17}
              />

              {saving
                ? "Saving..."
                : "Register Warranty"}
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
    <label className="text-xs font-bold uppercase tracking-wide text-gray-500">
      {children}
    </label>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <p className="text-xs text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold">
        {value}
      </p>
    </div>
  );
}

function Stat({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm text-gray-500">
          {title}
        </p>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}