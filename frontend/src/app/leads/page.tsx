"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  CircleDollarSign,
  Plus,
  Search,
  SunMedium,
  UserPlus,
  Users,
  X,
} from "lucide-react";


const API_URL =
  "https://solarflow-backend-production.up.railway.app";


type Lead = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  source: string | null;
  status: string;
  notes: string | null;
  estimated_value: number;
  created_at: string;
};


export default function LeadsPage() {
  const [leads, setLeads] =
    useState<Lead[]>([]);

  const [search, setSearch] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [name, setName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [source, setSource] =
    useState("Website");

  const [estimatedValue, setEstimatedValue] =
    useState("");


  async function loadLeads() {
    const response = await fetch(
      `${API_URL}/leads/`,
      {
        cache: "no-store",
      }
    );

    const data =
      await response.json();

    setLeads(data);
  }


  useEffect(() => {
    loadLeads();
  }, []);


  async function createLead(
    event: FormEvent
  ) {
    event.preventDefault();

    if (!name.trim()) return;

    await fetch(
      `${API_URL}/leads/`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          name,
          phone: phone || null,
          email: email || null,
          source,
          status: "New",
          notes: null,
          estimated_value:
            Number(
              estimatedValue || 0
            ),
        }),
      }
    );

    setName("");
    setPhone("");
    setEmail("");
    setEstimatedValue("");

    setShowForm(false);

    await loadLeads();
  }


  async function updateStatus(
    id: number,
    status: string
  ) {
    await fetch(
      `${API_URL}/leads/${id}`,
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

    await loadLeads();
  }


  const filtered =
    leads.filter((lead) =>
      lead.name
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );


  const pipelineValue =
    leads.reduce(
      (total, lead) =>
        total +
        lead.estimated_value,
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
                  Sales CRM
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
            New Lead
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] p-5 md:p-8">
        <h1 className="text-3xl font-bold">
          Leads
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Track potential solar customers
          from enquiry to sale.
        </p>

        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          <Stat
            label="Total Leads"
            value={leads.length.toString()}
            icon={
              <Users size={19} />
            }
          />

          <Stat
            label="New Leads"
            value={leads
              .filter(
                (lead) =>
                  lead.status === "New"
              )
              .length.toString()}
            icon={
              <UserPlus size={19} />
            }
          />

          <Stat
            label="Pipeline Value"
            value={`$${pipelineValue.toLocaleString()}`}
            icon={
              <CircleDollarSign
                size={19}
              />
            }
          />
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 bg-white">
          <div className="flex flex-col gap-4 border-b border-gray-100 p-5 md:flex-row md:items-center md:justify-between">
            <h2 className="font-bold">
              Sales Pipeline
            </h2>

            <div className="relative w-full md:w-[300px]">
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
                placeholder="Search leads..."
                className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
                  <th className="p-4">
                    Lead
                  </th>

                  <th className="p-4">
                    Contact
                  </th>

                  <th className="p-4">
                    Source
                  </th>

                  <th className="p-4">
                    Value
                  </th>

                  <th className="p-4">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtered.map(
                  (lead) => (
                    <tr
                      key={lead.id}
                      className="border-b border-gray-100"
                    >
                      <td className="p-4 font-semibold">
                        {lead.name}
                      </td>

                      <td className="p-4 text-sm text-gray-500">
                        {lead.phone ||
                          lead.email ||
                          "—"}
                      </td>

                      <td className="p-4 text-sm">
                        {lead.source ||
                          "—"}
                      </td>

                      <td className="p-4 font-semibold">
                        $
                        {lead.estimated_value.toLocaleString()}
                      </td>

                      <td className="p-4">
                        <select
                          value={
                            lead.status
                          }
                          onChange={(
                            event
                          ) =>
                            updateStatus(
                              lead.id,
                              event.target
                                .value
                            )
                          }
                          className="h-9 rounded-lg border border-gray-200 px-2 text-sm"
                        >
                          <option>
                            New
                          </option>

                          <option>
                            Contacted
                          </option>

                          <option>
                            Site Visit
                          </option>

                          <option>
                            Quote Sent
                          </option>

                          <option>
                            Won
                          </option>

                          <option>
                            Lost
                          </option>
                        </select>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={createLead}
            className="w-full max-w-lg rounded-2xl bg-white p-6"
          >
            <div className="flex justify-between">
              <h2 className="text-xl font-bold">
                New Lead
              </h2>

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
                setValue={setName}
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

              <div>
                <label className="text-xs font-bold uppercase text-gray-500">
                  Source
                </label>

                <select
                  value={source}
                  onChange={(event) =>
                    setSource(
                      event.target.value
                    )
                  }
                  className="mt-2 h-11 w-full rounded-lg border border-gray-200 px-3"
                >
                  <option>
                    Website
                  </option>

                  <option>
                    WhatsApp
                  </option>

                  <option>
                    Walk In
                  </option>

                  <option>
                    Referral
                  </option>

                  <option>
                    Facebook
                  </option>

                  <option>
                    Phone Call
                  </option>
                </select>
              </div>

              <Input
                label="Estimated Value"
                value={estimatedValue}
                setValue={
                  setEstimatedValue
                }
              />
            </div>

            <button className="mt-6 h-11 w-full rounded-lg bg-black font-semibold text-white">
              Create Lead
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
          setValue(event.target.value)
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
  value: string;
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