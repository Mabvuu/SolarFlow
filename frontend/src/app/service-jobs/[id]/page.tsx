"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock3,
  MapPin,
  Phone,
  Save,
  SunMedium,
  Truck,
  UserRound,
  Wrench,
} from "lucide-react";

const API_URL = "https://solarflow-backend-uvgv.onrender.com";

const statuses = [
  "Request Received",
  "Accepted",
  "Engineer Assigned",
  "On Route",
  "Arrived",
  "Inspection",
  "Working",
  "Completed",
];

type Job = {
  id: number;
  tracking_code: string;
  job_type: string;
  title: string;
  description: string | null;
  address: string | null;
  priority: string;
  status: string;
  eta: string | null;
  fault_confirmed_fixed: boolean;
  customer_confirmed: boolean;
  created_at: string;
  completed_at: string | null;

  customer: {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
  } | null;

  engineer: {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
    specialization: string | null;
    status: string;
  } | null;

  updates: {
    id: number;
    status: string;
    note: string | null;
    created_at: string;
  }[];
};

export default function ServiceJobDetailPage() {
  const params = useParams();

  const id = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedStatus, setSelectedStatus] =
    useState("");

  const [note, setNote] = useState("");

  const [eta, setEta] = useState("");

  const [saving, setSaving] = useState(false);

  async function loadJob() {
    try {
      const response = await fetch(
        `${API_URL}/jobs/${id}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Job not found");
      }

      const data = await response.json();

      setJob(data);
      setSelectedStatus(data.status);

      if (data.eta) {
        const date = new Date(data.eta);

        const year = date.getFullYear();

        const month = String(
          date.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
          date.getDate()
        ).padStart(2, "0");

        const hour = String(
          date.getHours()
        ).padStart(2, "0");

        const minute = String(
          date.getMinutes()
        ).padStart(2, "0");

        setEta(
          `${year}-${month}-${day}T${hour}:${minute}`
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJob();
  }, [id]);

  async function updateStatus() {
    if (!job) return;

    setSaving(true);

    try {
      const response = await fetch(
        `${API_URL}/jobs/${job.id}/status`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            status: selectedStatus,
            note:
              note ||
              `Job updated to ${selectedStatus}.`,
            eta: eta
              ? new Date(eta).toISOString()
              : null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Could not update job"
        );
      }

      setNote("");

      await loadJob();
    } catch (error) {
      console.error(error);

      alert(
        "Something went wrong updating the job."
      );
    } finally {
      setSaving(false);
    }
  }

  async function confirmEngineerWork() {
    if (!job) return;

    try {
      await fetch(
        `${API_URL}/jobs/${job.id}/confirm-fixed`,
        {
          method: "PATCH",
        }
      );

      await loadJob();
    } catch (error) {
      console.error(error);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f6f7]">
        Loading job...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Job not found.
      </div>
    );
  }

  const currentStep = Math.max(
    statuses.indexOf(job.status),
    0
  );

  return (
    <div className="min-h-screen bg-[#f5f6f7]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/service-jobs"
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
                  Service Operations
                </p>
              </div>
            </div>
          </div>

          <Link
            href={`/track/${job.tracking_code}`}
            className="rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white"
          >
            Customer View
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] p-5 md:p-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-semibold text-gray-500">
              {job.tracking_code}
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              {job.title}
            </h1>

            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <UserRound size={15} />

                {job.customer?.name}
              </span>

              <span className="flex items-center gap-2">
                <MapPin size={15} />

                {job.address}
              </span>

              <span className="flex items-center gap-2">
                <Wrench size={15} />

                {job.job_type}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600">
              {job.priority}
            </span>

            <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
              {job.status}
            </span>
          </div>
        </div>

        <div className="mt-7 grid gap-5 xl:grid-cols-[1fr_430px]">
          <div className="space-y-5">
            {/* PROGRESS */}

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold">
                    Job Progress
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Live status visible to the
                    customer.
                  </p>
                </div>

                <Truck size={20} />
              </div>

              <div className="mt-7">
                {statuses.map(
                  (status, index) => {
                    const complete =
                      index < currentStep;

                    const current =
                      index === currentStep;

                    return (
                      <div
                        key={status}
                        className="flex gap-4"
                      >
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${
                              complete
                                ? "border-black bg-black text-white"
                                : current
                                ? "border-[#f6b800] bg-[#f6b800]"
                                : "border-gray-200 text-gray-300"
                            }`}
                          >
                            {complete ? (
                              <Check size={16} />
                            ) : (
                              <span className="h-2 w-2 rounded-full bg-current" />
                            )}
                          </div>

                          {index !==
                            statuses.length -
                              1 && (
                            <div
                              className={`h-12 w-[2px] ${
                                complete
                                  ? "bg-black"
                                  : "bg-gray-200"
                              }`}
                            />
                          )}
                        </div>

                        <div className="pt-1">
                          <p
                            className={`font-semibold ${
                              current
                                ? "text-black"
                                : complete
                                ? "text-gray-700"
                                : "text-gray-400"
                            }`}
                          >
                            {status}
                          </p>

                          {current && (
                            <p className="mt-1 text-xs text-gray-500">
                              Current stage
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* HISTORY */}

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="font-bold">
                Activity History
              </h2>

              <div className="mt-5 space-y-5">
                {[...job.updates]
                  .reverse()
                  .map((update) => (
                    <div
                      key={update.id}
                      className="flex gap-4"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100">
                        <CheckCircle2
                          size={17}
                        />
                      </div>

                      <div>
                        <p className="text-sm font-bold">
                          {update.status}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {update.note}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {new Date(
                            update.created_at
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {/* CONTROL */}

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="font-bold">
                Update Job
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Updates appear on the customer's
                tracking screen.
              </p>

              <div className="mt-6">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Status
                </label>

                <select
                  value={selectedStatus}
                  onChange={(event) =>
                    setSelectedStatus(
                      event.target.value
                    )
                  }
                  className="mt-2 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 outline-none"
                >
                  {statuses.map((status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-5">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Expected arrival
                </label>

                <input
                  type="datetime-local"
                  value={eta}
                  onChange={(event) =>
                    setEta(
                      event.target.value
                    )
                  }
                  className="mt-2 h-11 w-full rounded-lg border border-gray-200 px-3 outline-none"
                />
              </div>

              <div className="mt-5">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Update note
                </label>

                <textarea
                  value={note}
                  onChange={(event) =>
                    setNote(
                      event.target.value
                    )
                  }
                  placeholder="Example: Engineer has left the office and is travelling to the customer."
                  className="mt-2 min-h-[110px] w-full resize-none rounded-lg border border-gray-200 p-3 text-sm outline-none"
                />
              </div>

              <button
                onClick={updateStatus}
                disabled={saving}
                className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-black text-sm font-bold text-white disabled:opacity-50"
              >
                <Save size={16} />

                {saving
                  ? "Updating..."
                  : "Update Job"}
              </button>
            </div>

            {/* ENGINEER */}

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                Assigned Engineer
              </p>

              {job.engineer ? (
                <>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <UserRound size={21} />
                    </div>

                    <div>
                      <p className="font-bold">
                        {job.engineer.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {
                          job.engineer
                            .specialization
                        }
                      </p>
                    </div>
                  </div>

                  {job.engineer.phone && (
                    <a
                      href={`tel:${job.engineer.phone}`}
                      className="mt-5 flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 text-sm font-semibold"
                    >
                      <Phone size={15} />
                      {job.engineer.phone}
                    </a>
                  )}
                </>
              ) : (
                <p className="mt-4 text-sm text-gray-500">
                  No engineer assigned.
                </p>
              )}
            </div>

            {/* ETA */}

            {job.eta && (
              <div className="rounded-2xl bg-[#15191c] p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Customer ETA
                </p>

                <div className="mt-3 flex items-center gap-3">
                  <Clock3 className="text-[#f6b800]" />

                  <p className="text-3xl font-bold">
                    {new Date(
                      job.eta
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* ENGINEER COMPLETE */}

            {!job.fault_confirmed_fixed &&
              job.status !==
                "Completed" && (
                <button
                  onClick={
                    confirmEngineerWork
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white p-4 text-sm font-bold"
                >
                  <CheckCircle2
                    size={18}
                  />
                  Engineer Confirm Work Done
                </button>
              )}

            {job.fault_confirmed_fixed && (
              <div className="rounded-xl bg-emerald-50 p-5">
                <p className="font-bold text-emerald-800">
                  Engineer completed work
                </p>

                <p className="mt-1 text-sm text-emerald-700">
                  Waiting for customer
                  confirmation.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}