"use client";

import {
  AlertTriangle,
  Boxes,
  ChevronRight,
  CircleDollarSign,
  PackageCheck,
  SunMedium,
  Truck,
  Users,
  Wrench,
  Zap,
} from "lucide-react";

import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";


const API_URL =
  "https://solarflow-backend-uvqv.onrender.com";


type DashboardData = {
  metrics: {
    total_customers: number;
    total_leads: number;
    total_quotes: number;
    active_installations: number;
    completed_installations: number;
    open_service_jobs: number;
    urgent_jobs: number;
    available_engineers: number;
    low_stock_items: number;
    total_invoiced: number;
    total_received: number;
    outstanding: number;
    active_warranties: number;
  };

  recent_jobs: {
    id: number;
    tracking_code: string;
    title: string;
    job_type: string;
    priority: string;
    status: string;
    eta: string | null;
    address: string | null;

    customer: {
      id: number;
      name: string;
    } | null;

    engineer: {
      id: number;
      name: string;
    } | null;
  }[];

  installations: {
    id: number;
    system_size: string | null;
    status: string;
    scheduled_date: string | null;

    customer: {
      id: number;
      name: string;
    } | null;

    engineer: {
      id: number;
      name: string;
    } | null;
  }[];

  engineers: {
    id: number;
    name: string;
    specialization: string | null;
    status: string;
  }[];

  low_stock: {
    id: number;
    name: string;
    sku: string | null;
    quantity: number;
    reorder_level: number;
  }[];
};


export default function DashboardPage() {
  const [data, setData] =
    useState<DashboardData | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  async function loadDashboard() {
    try {
      setError("");

      const response = await fetch(
        `${API_URL}/dashboard/`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Could not load dashboard"
        );
      }

      setData(
        await response.json()
      );
    } catch (error) {
      console.error(error);

      setError(
        "Could not connect to the SolarFlow backend."
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadDashboard();

    const interval =
      setInterval(
        loadDashboard,
        15000
      );

    return () =>
      clearInterval(interval);
  }, []);


  return (
    <div className="min-h-screen bg-[#f5f6f7]">
      <main className="mx-auto max-w-[1600px] p-5 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Solar Operations
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-950">
              Operations Dashboard
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Live overview of sales,
              installations, field
              service, finance and stock.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

            Operations online
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading || !data ? (
          <div className="mt-7 rounded-xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500">
            Loading dashboard...
          </div>
        ) : (
          <>
            <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Metric
                title="Payments Received"
                value={`$${data.metrics.total_received.toLocaleString()}`}
                note={`$${data.metrics.outstanding.toLocaleString()} outstanding`}
                icon={
                  <CircleDollarSign
                    size={19}
                  />
                }
              />

              <Metric
                title="Active Installations"
                value={
                  data.metrics.active_installations.toString()
                }
                note={`${data.metrics.completed_installations} completed`}
                icon={
                  <SunMedium size={19} />
                }
              />

              <Metric
                title="Open Service Jobs"
                value={
                  data.metrics.open_service_jobs.toString()
                }
                note={`${data.metrics.urgent_jobs} urgent`}
                icon={
                  <Wrench size={19} />
                }
              />

              <Metric
                title="Customers"
                value={
                  data.metrics.total_customers.toString()
                }
                note={`${data.metrics.total_leads} active sales leads`}
                icon={
                  <Users size={19} />
                }
              />
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[2fr_1fr]">
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="flex items-center justify-between border-b border-gray-100 p-5">
                  <div>
                    <h2 className="font-bold">
                      Live Service
                      Operations
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Latest fault,
                      maintenance and
                      installation jobs
                    </p>
                  </div>

                  <Link
                    href="/service-jobs"
                    className="text-sm font-semibold"
                  >
                    View all
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px]">
                    <thead>
                      <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
                        <th className="p-4">
                          Job
                        </th>

                        <th className="p-4">
                          Customer
                        </th>

                        <th className="p-4">
                          Engineer
                        </th>

                        <th className="p-4">
                          Status
                        </th>

                        <th className="p-4">
                          ETA
                        </th>

                        <th className="p-4" />
                      </tr>
                    </thead>

                    <tbody>
                      {data.recent_jobs.map(
                        (job) => (
                          <tr
                            key={
                              job.id
                            }
                            className="border-b border-gray-100 last:border-0"
                          >
                            <td className="p-4">
                              <p className="font-bold">
                                {
                                  job.tracking_code
                                }
                              </p>

                              <p className="mt-1 max-w-[220px] truncate text-xs text-gray-500">
                                {
                                  job.title
                                }
                              </p>
                            </td>

                            <td className="p-4 text-sm">
                              {job.customer
                                ?.name ||
                                "—"}
                            </td>

                            <td className="p-4 text-sm">
                              {job.engineer
                                ?.name ||
                                "Unassigned"}
                            </td>

                            <td className="p-4">
                              <Status
                                value={
                                  job.status
                                }
                              />
                            </td>

                            <td className="p-4 text-sm font-semibold">
                              {job.eta
                                ? new Date(
                                    job.eta
                                  ).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )
                                : "—"}
                            </td>

                            <td className="p-4">
                              <Link
                                href={`/service-jobs/${job.id}`}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50"
                              >
                                <ChevronRight
                                  size={
                                    16
                                  }
                                />
                              </Link>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-xl bg-[#15191c] p-6 text-white">
                <p className="text-sm text-gray-400">
                  Featured Service Job
                </p>

                {data.recent_jobs[0] ? (
                  <>
                    <div className="mt-3 flex items-start justify-between gap-3">
                      <h2 className="text-xl font-bold">
                        {
                          data
                            .recent_jobs[0]
                            .tracking_code
                        }
                      </h2>

                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold">
                        {
                          data
                            .recent_jobs[0]
                            .status
                        }
                      </span>
                    </div>

                    <p className="mt-5 text-sm text-gray-400">
                      {
                        data
                          .recent_jobs[0]
                          .title
                      }
                    </p>

                    <p className="mt-1 font-semibold">
                      {data.recent_jobs[0]
                        .customer?.name ||
                        "Customer"}
                    </p>

                    <div className="mt-7 flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f6b800] text-black">
                        <Truck size={21} />
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">
                          Assigned
                          Engineer
                        </p>

                        <p className="mt-1 font-semibold">
                          {data
                            .recent_jobs[0]
                            .engineer
                            ?.name ||
                            "Unassigned"}
                        </p>
                      </div>
                    </div>

                    {data.recent_jobs[0]
                      .eta && (
                      <div className="mt-6 rounded-xl bg-white/5 p-4">
                        <p className="text-xs text-gray-500">
                          Expected
                          arrival
                        </p>

                        <p className="mt-1 text-2xl font-bold">
                          {new Date(
                            data.recent_jobs[0]
                              .eta
                          ).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute:
                                "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    )}

                    <Link
                      href={`/track/${data.recent_jobs[0].tracking_code}`}
                      className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-white text-sm font-bold text-black"
                    >
                      Customer Tracking

                      <ChevronRight
                        size={16}
                      />
                    </Link>
                  </>
                ) : (
                  <p className="mt-5 text-sm text-gray-400">
                    No service jobs
                    available.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold">
                      Engineers
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Field team status
                    </p>
                  </div>

                  <Truck
                    size={19}
                    className="text-gray-400"
                  />
                </div>

                <div className="mt-5 space-y-4">
                  {data.engineers.map(
                    (engineer) => (
                      <div
                        key={engineer.id}
                        className="flex items-center gap-3"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xs font-bold">
                          {engineer.name
                            .split(" ")
                            .map(
                              (part) =>
                                part[0]
                            )
                            .join("")
                            .slice(
                              0,
                              2
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {
                              engineer.name
                            }
                          </p>

                          <p className="truncate text-xs text-gray-500">
                            {engineer.specialization ||
                              "Solar Engineer"}
                          </p>
                        </div>

                        <Status
                          value={
                            engineer.status
                          }
                        />
                      </div>
                    )
                  )}
                </div>

                <Link
                  href="/engineers"
                  className="mt-5 flex h-10 items-center justify-center rounded-lg border border-gray-200 text-sm font-semibold hover:bg-gray-50"
                >
                  View Engineers
                </Link>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold">
                      Stock Alerts
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Items requiring
                      restock
                    </p>
                  </div>

                  <AlertTriangle
                    size={19}
                    className="text-gray-400"
                  />
                </div>

                <div className="mt-5 space-y-3">
                  {data.low_stock.map(
                    (item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-lg border border-gray-100 p-3"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                          <Boxes
                            size={18}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {item.name}
                          </p>

                          <p className="text-xs text-gray-500">
                            {item.sku ||
                              "No SKU"}
                          </p>
                        </div>

                        <span className="text-sm font-bold text-red-600">
                          {
                            item.quantity
                          }{" "}
                          left
                        </span>
                      </div>
                    )
                  )}

                  {data.low_stock
                    .length === 0 && (
                    <p className="text-sm text-gray-500">
                      All stock levels
                      are healthy.
                    </p>
                  )}
                </div>

                <Link
                  href="/inventory"
                  className="mt-5 flex h-10 items-center justify-center rounded-lg border border-gray-200 text-sm font-semibold hover:bg-gray-50"
                >
                  Open Inventory
                </Link>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold">
                      Installations
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Current
                      installation
                      pipeline
                    </p>
                  </div>

                  <PackageCheck
                    size={19}
                    className="text-gray-400"
                  />
                </div>

                <div className="mt-5 space-y-4">
                  {data.installations.map(
                    (
                      installation
                    ) => (
                      <div
                        key={
                          installation.id
                        }
                        className="flex items-center gap-3"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fff7d6]">
                          <Zap
                            size={18}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {installation
                              .customer
                              ?.name ||
                              "Customer"}
                          </p>

                          <p className="truncate text-xs text-gray-500">
                            {installation.system_size ||
                              "Solar System"}
                          </p>
                        </div>

                        <Status
                          value={
                            installation.status
                          }
                        />
                      </div>
                    )
                  )}
                </div>

                <Link
                  href="/installations"
                  className="mt-5 flex h-10 items-center justify-center rounded-lg border border-gray-200 text-sm font-semibold hover:bg-gray-50"
                >
                  View Installations
                </Link>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}


function Metric({
  title,
  value,
  note,
  icon,
}: {
  title: string;
  value: string;
  note: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-500">
          {title}
        </p>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold tracking-tight text-gray-950">
        {value}
      </p>

      <p className="mt-2 text-xs text-gray-500">
        {note}
      </p>
    </div>
  );
}


function Status({
  value,
}: {
  value: string;
}) {
  const green = [
    "Completed",
    "Available",
    "Paid",
    "Active",
  ];

  const orange = [
    "On Route",
    "On Job",
    "Working",
    "In Progress",
    "Scheduled",
  ];

  const purple = [
    "Arrived",
    "Inspection",
    "Site Survey",
  ];


  const style =
    green.includes(value)
      ? "bg-emerald-50 text-emerald-700"
      : orange.includes(value)
      ? "bg-amber-50 text-amber-700"
      : purple.includes(value)
      ? "bg-purple-50 text-purple-700"
      : "bg-gray-100 text-gray-700";


  return (
    <span
      className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}
    >
      {value}
    </span>
  );
}