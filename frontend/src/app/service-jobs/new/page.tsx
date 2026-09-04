"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  ArrowLeft,
  CalendarClock,
  MapPin,
  Save,
  SunMedium,
  Truck,
  UserRound,
  Wrench,
} from "lucide-react";

const API_URL = "https://solarflow-backend-uvgv.onrender.com";

type Customer = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  customer_type: string;
};

type Engineer = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  specialization: string | null;
  status: string;
};

export default function NewServiceJobPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [engineers, setEngineers] = useState<Engineer[]>([]);

  const [customerId, setCustomerId] = useState("");
  const [engineerId, setEngineerId] = useState("");

  const [jobType, setJobType] = useState("Fault");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [eta, setEta] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [customersResponse, engineersResponse] =
          await Promise.all([
            fetch(`${API_URL}/customers/`, {
              cache: "no-store",
            }),
            fetch(`${API_URL}/engineers/`, {
              cache: "no-store",
            }),
          ]);

        if (!customersResponse.ok) {
          throw new Error("Could not load customers");
        }

        if (!engineersResponse.ok) {
          throw new Error("Could not load engineers");
        }

        const customersData =
          await customersResponse.json();

        const engineersData =
          await engineersResponse.json();

        setCustomers(customersData);
        setEngineers(engineersData);

        if (customersData.length > 0) {
          setCustomerId(
            String(customersData[0].id)
          );

          if (customersData[0].address) {
            setAddress(customersData[0].address);
          }
        }
      } catch (error) {
        console.error(error);

        setError(
          "Could not load customers and engineers."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  function handleCustomerChange(value: string) {
    setCustomerId(value);

    const customer = customers.find(
      (item) => item.id === Number(value)
    );

    if (customer?.address) {
      setAddress(customer.address);
    }
  }

  async function submitJob(event: FormEvent) {
    event.preventDefault();

    if (!customerId) {
      setError("Please select a customer.");
      return;
    }

    if (!title.trim()) {
      setError("Please enter the job title.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/jobs/`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            customer_id: Number(customerId),

            engineer_id: engineerId
              ? Number(engineerId)
              : null,

            job_type: jobType,

            title: title.trim(),

            description:
              description.trim() || null,

            address:
              address.trim() || null,

            priority,

            eta: eta
              ? new Date(eta).toISOString()
              : null,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();

        throw new Error(
          data.detail || "Could not create job"
        );
      }

      const data = await response.json();

      router.push(
        `/service-jobs/${data.id}`
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Could not create service job."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f6f7]">
        <p className="text-sm text-gray-500">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f6f7]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/service-jobs"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
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
                  New Service Request
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] p-5 py-8 md:p-8">
        <div>
          <p className="text-sm font-medium text-gray-500">
            Field Operations
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Create Service Job
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Log a fault, maintenance request,
            inspection or new installation.
          </p>
        </div>

        <form
          onSubmit={submitJob}
          className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]"
        >
          <div className="space-y-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex items-center gap-3">
                <UserRound size={20} />

                <div>
                  <h2 className="font-bold">
                    Customer
                  </h2>

                  <p className="text-sm text-gray-500">
                    Who is requesting the service?
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Customer
                </label>

                <select
                  value={customerId}
                  onChange={(event) =>
                    handleCustomerChange(
                      event.target.value
                    )
                  }
                  className="mt-2 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 outline-none"
                >
                  <option value="">
                    Select customer
                  </option>

                  {customers.map((customer) => (
                    <option
                      key={customer.id}
                      value={customer.id}
                    >
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-5">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Service Address
                </label>

                <div className="relative mt-2">
                  <MapPin
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    value={address}
                    onChange={(event) =>
                      setAddress(
                        event.target.value
                      )
                    }
                    placeholder="Installation/service address"
                    className="h-11 w-full rounded-lg border border-gray-200 pl-10 pr-3 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex items-center gap-3">
                <Wrench size={20} />

                <div>
                  <h2 className="font-bold">
                    Job Details
                  </h2>

                  <p className="text-sm text-gray-500">
                    What does the customer need?
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-gray-500">
                    Job Type
                  </label>

                  <select
                    value={jobType}
                    onChange={(event) =>
                      setJobType(
                        event.target.value
                      )
                    }
                    className="mt-2 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 outline-none"
                  >
                    <option value="Fault">
                      Fault / Repair
                    </option>

                    <option value="Installation">
                      New Installation
                    </option>

                    <option value="Maintenance">
                      Maintenance
                    </option>

                    <option value="Inspection">
                      Inspection
                    </option>

                    <option value="Upgrade">
                      System Upgrade
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-gray-500">
                    Priority
                  </label>

                  <select
                    value={priority}
                    onChange={(event) =>
                      setPriority(
                        event.target.value
                      )
                    }
                    className="mt-2 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 outline-none"
                  >
                    <option value="Low">
                      Low
                    </option>

                    <option value="Normal">
                      Normal
                    </option>

                    <option value="High">
                      High
                    </option>

                    <option value="Urgent">
                      Urgent
                    </option>
                  </select>
                </div>
              </div>

              <div className="mt-5">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Job Title
                </label>

                <input
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value
                    )
                  }
                  placeholder="Example: Inverter not charging batteries"
                  className="mt-2 h-11 w-full rounded-lg border border-gray-200 px-3 outline-none"
                />
              </div>

              <div className="mt-5">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder="Describe the issue or installation requirements..."
                  className="mt-2 min-h-[140px] w-full resize-none rounded-lg border border-gray-200 p-3 text-sm outline-none"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex items-center gap-3">
                <Truck size={20} />

                <div>
                  <h2 className="font-bold">
                    Engineer Assignment
                  </h2>

                  <p className="text-sm text-gray-500">
                    Assign now or leave unassigned.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Engineer
                </label>

                <select
                  value={engineerId}
                  onChange={(event) =>
                    setEngineerId(
                      event.target.value
                    )
                  }
                  className="mt-2 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 outline-none"
                >
                  <option value="">
                    Assign later
                  </option>

                  {engineers.map((engineer) => (
                    <option
                      key={engineer.id}
                      value={engineer.id}
                    >
                      {engineer.name} —{" "}
                      {engineer.status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-5">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Expected Arrival
                </label>

                <div className="relative mt-2">
                  <CalendarClock
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="datetime-local"
                    value={eta}
                    onChange={(event) =>
                      setEta(
                        event.target.value
                      )
                    }
                    className="h-11 w-full rounded-lg border border-gray-200 pl-10 pr-3 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="sticky top-6 rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="font-bold">
                Create Job
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                The system will automatically
                generate a unique customer tracking
                code.
              </p>

              <div className="mt-6 space-y-4 border-y border-gray-100 py-5">
                <Summary
                  label="Type"
                  value={jobType}
                />

                <Summary
                  label="Priority"
                  value={priority}
                />

                <Summary
                  label="Engineer"
                  value={
                    engineers.find(
                      (engineer) =>
                        engineer.id ===
                        Number(engineerId)
                    )?.name || "Not assigned"
                  }
                />

                <Summary
                  label="Tracking"
                  value="Generated automatically"
                />
              </div>

              {error && (
                <div className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-black text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={17} />

                {saving
                  ? "Creating..."
                  : "Create Service Job"}
              </button>

              <Link
                href="/service-jobs"
                className="mt-3 flex h-11 w-full items-center justify-center rounded-lg border border-gray-200 text-sm font-semibold"
              >
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

function Summary({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-sm text-gray-500">
        {label}
      </span>

      <span className="text-right text-sm font-semibold text-gray-900">
        {value}
      </span>
    </div>
  );
}