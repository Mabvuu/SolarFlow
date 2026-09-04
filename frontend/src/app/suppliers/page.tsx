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
  Phone,
  Plus,
  Search,
  SunMedium,
  UserRound,
  X,
} from "lucide-react";


const API_URL =
  "https://solarflow-backend-uvgv.onrender.com";


type Supplier = {
  id: number;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
};


export default function SuppliersPage() {
  const [suppliers, setSuppliers] =
    useState<Supplier[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [showForm, setShowForm] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [name, setName] =
    useState("");

  const [
    contactPerson,
    setContactPerson,
  ] = useState("");

  const [phone, setPhone] =
    useState("");

  const [email, setEmail] =
    useState("");


  async function loadSuppliers() {
    try {
      const response = await fetch(
        `${API_URL}/suppliers/`,
        {
          cache: "no-store",
        }
      );

      setSuppliers(
        await response.json()
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadSuppliers();
  }, []);


  async function createSupplier(
    event: FormEvent
  ) {
    event.preventDefault();

    if (!name.trim()) return;

    setSaving(true);

    try {
      await fetch(
        `${API_URL}/suppliers/`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name: name.trim(),
            contact_person:
              contactPerson.trim() ||
              null,
            phone:
              phone.trim() || null,
            email:
              email.trim() || null,
          }),
        }
      );

      setName("");
      setContactPerson("");
      setPhone("");
      setEmail("");

      setShowForm(false);

      await loadSuppliers();
    } finally {
      setSaving(false);
    }
  }


  const filtered =
    suppliers.filter(
      (supplier) => {
        const value =
          search.toLowerCase();

        return (
          supplier.name
            .toLowerCase()
            .includes(value) ||
          supplier.contact_person
            ?.toLowerCase()
            .includes(value) ||
          supplier.email
            ?.toLowerCase()
            .includes(value)
        );
      }
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
                  Procurement
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
            Add Supplier
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] p-5 md:p-8">
        <h1 className="text-3xl font-bold">
          Suppliers
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Manage solar equipment and
          materials suppliers.
        </p>

        <div className="mt-7 rounded-xl border border-gray-200 bg-white">
          <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Suppliers
              </p>

              <p className="mt-1 text-3xl font-bold">
                {suppliers.length}
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
                placeholder="Search suppliers..."
                className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-3"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-gray-500">
              Loading suppliers...
            </div>
          ) : (
            <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map(
                (supplier) => (
                  <div
                    key={supplier.id}
                    className="rounded-xl border border-gray-200 p-5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                        <Building2
                          size={20}
                        />
                      </div>

                      <div>
                        <p className="font-bold">
                          {supplier.name}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Equipment
                          Supplier
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-3 border-t border-gray-100 pt-4 text-sm text-gray-500">
                      <p className="flex items-center gap-2">
                        <UserRound
                          size={15}
                        />

                        {supplier.contact_person ||
                          "No contact person"}
                      </p>

                      <p className="flex items-center gap-2">
                        <Phone
                          size={15}
                        />

                        {supplier.phone ||
                          "No phone"}
                      </p>

                      <p className="flex items-center gap-2">
                        <Mail
                          size={15}
                        />

                        {supplier.email ||
                          "No email"}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={createSupplier}
            className="w-full max-w-lg rounded-2xl bg-white p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Add Supplier
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Register a new
                  supplier.
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

            <div className="mt-6 space-y-4">
              <Input
                label="Company Name"
                value={name}
                setValue={setName}
              />

              <Input
                label="Contact Person"
                value={contactPerson}
                setValue={
                  setContactPerson
                }
              />

              <Input
                label="Phone"
                value={phone}
                setValue={setPhone}
              />

              <Input
                label="Email"
                value={email}
                setValue={setEmail}
              />
            </div>

            <button
              disabled={saving}
              className="mt-6 h-11 w-full rounded-lg bg-black font-semibold text-white disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Add Supplier"}
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
  setValue,
}: {
  label: string;
  value: string;
  setValue: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-bold uppercase text-gray-500">
        {label}
      </label>

      <input
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