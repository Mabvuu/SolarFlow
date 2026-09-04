"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  Mail,
  Phone,
  Plus,
  Search,
  SunMedium,
  Truck,
  UserRound,
  Wrench,
  X,
} from "lucide-react";


const API_URL =
  "/api/backend";


type Engineer = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  specialization: string | null;
  status: string;
  is_active: boolean;
  created_at: string;
};


export default function EngineersPage() {
  const [engineers, setEngineers] =
    useState<Engineer[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [showForm, setShowForm] =
    useState(false);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [
    specialization,
    setSpecialization,
  ] = useState("");

  const [saving, setSaving] =
    useState(false);


  async function loadEngineers() {
    try {
      const response = await fetch(
        `${API_URL}/engineers/`,
        {
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      setEngineers(data);
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadEngineers();
  }, []);


  async function createEngineer(
    event: FormEvent
  ) {
    event.preventDefault();

    if (!name.trim()) return;

    setSaving(true);

    try {
      await fetch(
        `${API_URL}/engineers/`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name,
            email: email || null,
            phone: phone || null,
            specialization:
              specialization || null,
            status: "Available",
          }),
        }
      );

      setName("");
      setEmail("");
      setPhone("");
      setSpecialization("");

      setShowForm(false);

      await loadEngineers();
    } finally {
      setSaving(false);
    }
  }


  const filtered =
    engineers.filter((engineer) => {
      const value =
        search.toLowerCase();

      return (
        engineer.name
          .toLowerCase()
          .includes(value) ||
        engineer.specialization
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
                  Field Team
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
            Add Engineer
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] p-5 md:p-8">
        <h1 className="text-3xl font-bold">
          Engineers
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Manage installation engineers
          and field technicians.
        </p>

        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          <Stat
            label="Total Engineers"
            value={engineers.length}
            icon={<Truck size={19} />}
          />

          <Stat
            label="Available"
            value={
              engineers.filter(
                (item) =>
                  item.status ===
                  "Available"
              ).length
            }
            icon={
              <UserRound size={19} />
            }
          />

          <Stat
            label="On Job"
            value={
              engineers.filter(
                (item) =>
                  item.status !==
                    "Available" &&
                  item.status !==
                    "Inactive"
              ).length
            }
            icon={<Wrench size={19} />}
          />
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 p-5">
            <div className="relative max-w-[320px]">
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
                placeholder="Search engineers..."
                className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-3"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-gray-500">
              Loading engineers...
            </div>
          ) : (
            <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map(
                (engineer) => (
                  <div
                    key={engineer.id}
                    className="rounded-xl border border-gray-200 p-5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 font-bold">
                          {engineer.name
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>

                        <div>
                          <p className="font-bold">
                            {engineer.name}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {engineer.specialization ||
                              "Solar Engineer"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          engineer.status ===
                          "Available"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {engineer.status}
                      </span>
                    </div>

                    <div className="mt-5 space-y-2 text-sm text-gray-500">
                      {engineer.phone && (
                        <p className="flex items-center gap-2">
                          <Phone size={14} />
                          {engineer.phone}
                        </p>
                      )}

                      {engineer.email && (
                        <p className="flex items-center gap-2">
                          <Mail size={14} />
                          {engineer.email}
                        </p>
                      )}
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
            onSubmit={createEngineer}
            className="w-full max-w-lg rounded-2xl bg-white p-6"
          >
            <div className="flex justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Add Engineer
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Add a field team member.
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
                label="Name"
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
                label="Specialization"
                value={specialization}
                onChange={
                  setSpecialization
                }
              />
            </div>

            <button
              disabled={saving}
              className="mt-6 h-11 w-full rounded-lg bg-black font-semibold text-white"
            >
              {saving
                ? "Saving..."
                : "Add Engineer"}
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
      <label className="text-xs font-bold uppercase text-gray-500">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-2 h-11 w-full rounded-lg border border-gray-200 px-3"
      />
    </div>
  );
}


function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex justify-between">
        <p className="text-sm text-gray-500">
          {label}
        </p>

        {icon}
      </div>

      <p className="mt-4 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}