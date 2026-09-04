"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Plus,
  Search,
  SunMedium,
  Truck,
  UserRound,
  Wrench,
} from "lucide-react";

type JobUpdate = {
  id: number;
  status: string;
  note: string | null;
  created_at: string;
};

type ServiceJob = {
  id: number;
  tracking_code: string;
  job_type: string;
  title: string;
  description: string | null;
  address: string | null;
  priority: string;
  status: string;
  eta: string | null;
  created_at: string;
  completed_at: string | null;
  fault_confirmed_fixed: boolean;
  customer_confirmed: boolean;

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

  updates: JobUpdate[];
};

const API_URL = "https://solarflow-backend-production.up.railway.app";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Request Received": "bg-gray-100 text-gray-700",
    Accepted: "bg-blue-50 text-blue-700",
    "Engineer Assigned": "bg-indigo-50 text-indigo-700",
    "On Route": "bg-amber-50 text-amber-700",
    Arrived: "bg-purple-50 text-purple-700",
    Inspection: "bg-orange-50 text-orange-700",
    Working: "bg-orange-50 text-orange-700",
    Completed: "bg-emerald-50 text-emerald-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
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
      <div className="flex items-start justify-between">
        <p className="text-sm text-gray-500">{title}</p>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
          {icon}
        </div>
      </div>

      <p className="mt-5 text-3xl font-bold tracking-tight text-gray-950">
        {value}
      </p>
    </div>
  );
}

export default function ServiceJobsPage() {
  const [jobs, setJobs] = useState<ServiceJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  async function loadJobs() {
    try {
      setError("");

      const response = await fetch(`${API_URL}/jobs/`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Could not load service jobs");
      }

      const data = await response.json();

      setJobs(data);
    } catch (error) {
      console.error(error);

      setError(
        "Could not connect to the backend. Make sure FastAPI is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return true;
    }

    return (
      job.tracking_code.toLowerCase().includes(value) ||
      job.title.toLowerCase().includes(value) ||
      job.job_type.toLowerCase().includes(value) ||
      job.status.toLowerCase().includes(value) ||
      job.priority.toLowerCase().includes(value) ||
      job.address?.toLowerCase().includes(value) ||
      job.customer?.name.toLowerCase().includes(value) ||
      job.engineer?.name.toLowerCase().includes(value)
    );
  });

  const openJobs = jobs.filter(
    (job) => job.status !== "Completed"
  ).length;

  const engineersOnRoute = jobs.filter(
    (job) => job.status === "On Route"
  ).length;

  const urgentJobs = jobs.filter(
    (job) => job.priority.toLowerCase() === "urgent"
  ).length;

  const completedJobs = jobs.filter(
    (job) => job.status === "Completed"
  ).length;

  return (
    <div className="min-h-screen bg-[#f5f6f7]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4 md:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 bg-white transition hover:bg-gray-50"
            >
              <ArrowLeft size={19} />
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f6b800] text-black">
                <SunMedium size={22} />
              </div>

              <div>
                <p className="font-bold text-gray-950">
                  SolarFlow
                </p>

                <p className="text-xs text-gray-500">
                  Field Service Operations
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/service-jobs/new"
            className="flex h-11 items-center gap-2 rounded-lg bg-black px-4 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            <Plus size={17} />

            <span className="hidden sm:inline">
              New Service Job
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] p-5 md:p-8">
        <div>
          <p className="text-sm font-medium text-gray-500">
            Operations
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-950">
            Service Jobs
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Track faults, installations, maintenance and engineer activity.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat
            title="Open Jobs"
            value={openJobs.toString()}
            icon={<Wrench size={19} />}
          />

          <Stat
            title="Engineers On Route"
            value={engineersOnRoute.toString()}
            icon={<Truck size={19} />}
          />

          <Stat
            title="Urgent"
            value={urgentJobs.toString()}
            icon={<AlertTriangle size={19} />}
          />

          <Stat
            title="Completed"
            value={completedJobs.toString()}
            icon={<Clock3 size={19} />}
          />
        </div>

        <div className="mt-7 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-gray-950">
                Live Field Operations
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                All active service and installation requests
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
                  setSearch(event.target.value)
                }
                placeholder="Search jobs..."
                className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
              />
            </div>
          </div>

          {error && (
            <div className="border-b border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="p-12 text-center text-sm text-gray-500">
              Loading service jobs...
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                <Wrench size={20} />
              </div>

              <p className="mt-4 font-semibold text-gray-900">
                No service jobs found
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Try another search or create a new job.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-5 transition hover:bg-gray-50/70"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
                    <div className="flex min-w-0 flex-1 gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                        {job.job_type.toLowerCase() === "fault" ? (
                          <Wrench size={21} />
                        ) : (
                          <SunMedium size={21} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold text-gray-950">
                            {job.tracking_code}
                          </p>

                          <StatusBadge status={job.status} />

                          {job.priority.toLowerCase() === "urgent" && (
                            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                              URGENT
                            </span>
                          )}
                        </div>

                        <p className="mt-2 font-medium text-gray-800">
                          {job.title}
                        </p>

                        {job.description && (
                          <p className="mt-1 max-w-[700px] truncate text-sm text-gray-400">
                            {job.description}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <UserRound size={14} />

                            {job.customer?.name || "No customer"}
                          </span>

                          <span className="flex items-center gap-1.5">
                            <MapPin size={14} />

                            {job.address ||
                              job.customer?.address ||
                              "No address"}
                          </span>

                          <span className="flex items-center gap-1.5">
                            <Truck size={14} />

                            {job.engineer?.name ||
                              "Engineer not assigned"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center xl:justify-end">
                      <div className="grid grid-cols-2 gap-6 sm:flex sm:items-center">
                        <div>
                          <p className="text-xs text-gray-400">
                            Expected arrival
                          </p>

                          <p className="mt-1 font-bold text-gray-900">
                            {job.eta
                              ? new Date(
                                  job.eta
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">
                            Customer tracking
                          </p>

                          <p
                            className={`mt-1 text-sm font-semibold ${
                              job.status === "Completed"
                                ? "text-gray-500"
                                : "text-emerald-700"
                            }`}
                          >
                            {job.status === "Completed"
                              ? "Completed"
                              : "Active"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                        <Link
                          href={`/service-jobs/${job.id}`}
                          className="flex h-10 items-center justify-center gap-2 rounded-lg bg-black px-4 text-sm font-semibold text-white transition hover:bg-gray-800"
                        >
                          Manage
                          <ChevronRight size={16} />
                        </Link>

                        <Link
                          href={`/track/${job.tracking_code}`}
                          className="flex h-10 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
                        >
                          Customer View
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}