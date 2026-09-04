"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  Building2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  SunMedium,
  UserRound,
  Users,
  X,
} from "lucide-react";


const API_URL =
  "https://solarflow-backend-uvqv.onrender.com";


type Customer = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  customer_type: string;
  created_at: string;
};


export default function CustomersPage() {
  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [customerType, setCustomerType] =
    useState("Residential");


  async function loadCustomers() {
    try {
      const response = await fetch(
        `${API_URL}/customers/`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Could not load customers"
        );
      }

      const data =
        await response.json();

      setCustomers(data);
    } catch (error) {
      console.error(error);

      setError(
        "Could not load customers."
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadCustomers();
  }, []);


  async function createCustomer(
    event: FormEvent
  ) {
    event.preventDefault();

    if (!name.trim()) {
      setError(
        "Customer name is required."
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/customers/`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name: name.trim(),
            email:
              email.trim() || null,
            phone:
              phone.trim() || null,
            address:
              address.trim() || null,
            customer_type:
              customerType,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Could not create customer"
        );
      }

      setName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setCustomerType(
        "Residential"
      );

      setShowForm(false);

      await loadCustomers();
    } catch (error) {
      console.error(error);

      setError(
        "Could not create customer."
      );
    } finally {
      setSaving(false);
    }
  }


  const filteredCustomers =
    customers.filter((customer) => {
      const value =
        search.toLowerCase();

      return (
        customer.name
          .toLowerCase()
          .includes(value) ||
        customer.email
          ?.toLowerCase()
          .includes(value) ||
        customer.phone
          ?.toLowerCase()
          .includes(value) ||
        customer.address
          ?.toLowerCase()
          .includes(value)
      );
    });


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
                  Customer Management
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
            New Customer
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] p-5 md:p-8">
        <div>
          <p className="text-sm font-medium text-gray-500">
            CRM
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Customers
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Residential and commercial
            solar customers.
          </p>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          <Stat
            title="Total Customers"
            value={customers.length}
            icon={<Users size={19} />}
          />

          <Stat
            title="Residential"
            value={
              customers.filter(
                (item) =>
                  item.customer_type ===
                  "Residential"
              ).length
            }
            icon={
              <UserRound size={19} />
            }
          />

          <Stat
            title="Commercial"
            value={
              customers.filter(
                (item) =>
                  item.customer_type ===
                  "Commercial"
              ).length
            }
            icon={
              <Building2 size={19} />
            }
          />
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold">
                Customer Directory
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                All registered customers
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
                placeholder="Search customers..."
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
              Loading customers...
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredCustomers.map(
                (customer) => (
                  <div
                    key={customer.id}
                    className="flex flex-col gap-4 p-5 md:flex-row md:items-center"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100">
                        {customer.name
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold">
                            {customer.name}
                          </p>

                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                            {
                              customer.customer_type
                            }
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
                          {customer.phone && (
                            <span className="flex items-center gap-1">
                              <Phone size={13} />
                              {customer.phone}
                            </span>
                          )}

                          {customer.email && (
                            <span className="flex items-center gap-1">
                              <Mail size={13} />
                              {customer.email}
                            </span>
                          )}

                          {customer.address && (
                            <span className="flex items-center gap-1">
                              <MapPin size={13} />
                              {customer.address}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Link
                      href="/service-jobs/new"
                      className="rounded-lg border border-gray-200 px-4 py-2 text-center text-sm font-semibold"
                    >
                      Create Service Job
                    </Link>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={createCustomer}
            className="w-full max-w-lg rounded-2xl bg-white p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  New Customer
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Add a new customer.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowForm(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200"
              >
                <X size={17} />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <Input
                label="Customer Name"
                value={name}
                onChange={setName}
              />

              <Input
                label="Phone"
                value={phone}
                onChange={setPhone}
              />

              <Input
                label="Email"
                value={email}
                onChange={setEmail}
              />

              <Input
                label="Address"
                value={address}
                onChange={setAddress}
              />

              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Customer Type
                </label>

                <select
                  value={customerType}
                  onChange={(event) =>
                    setCustomerType(
                      event.target.value
                    )
                  }
                  className="mt-2 h-11 w-full rounded-lg border border-gray-200 px-3"
                >
                  <option>
                    Residential
                  </option>

                  <option>
                    Commercial
                  </option>

                  <option>
                    Industrial
                  </option>
                </select>
              </div>
            </div>

            <button
              disabled={saving}
              className="mt-6 h-11 w-full rounded-lg bg-black font-semibold text-white disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Create Customer"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}


function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wide text-gray-500">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-2 h-11 w-full rounded-lg border border-gray-200 px-3 outline-none"
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
  value: number;
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