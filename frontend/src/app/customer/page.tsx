"use client";

import {
  CircleDollarSign,
  Clock3,
  LogOut,
  ShieldCheck,
  SunMedium,
  Truck,
  Wrench,
  Zap,
} from "lucide-react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  useEffect,
  useState,
} from "react";


const API_URL =
  "/api/backend";


type Dashboard = {
  customer: {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
  };

  summary: {
    installations: number;
    active_installations: number;
    service_jobs: number;
    active_service_jobs: number;
    warranties: number;
    outstanding: number;
  };

  latest_installation: any;
  latest_service_job: any;
  recent_invoices: any[];
  warranties: any[];
};


export default function CustomerDashboard() {
  const router = useRouter();

  const [data, setData] =
    useState<Dashboard | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    adminPreview,
    setAdminPreview,
  ] = useState(false);


  useEffect(() => {
    let cancelled = false;

    const preview =
      localStorage.getItem(
        "solarflow_admin_preview"
      );

    setAdminPreview(
      preview === "true"
    );


    async function load() {
      setLoading(true);
      setError("");

      try {
        let token =
          localStorage.getItem(
            "solarflow_customer_token"
          );


        /*
          IMPORTANT:
          Never redirect straight back to login here.

          If the customer session token is missing,
          recover the demo customer session first.
        */
        if (!token) {
          const loginResponse =
            await fetch(
              `${API_URL}/customer-portal/login`,
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body: JSON.stringify({
                  email:
                    "tariro@example.com",

                  password:
                    "customer123",
                }),
              }
            );

          const loginData =
            await loginResponse.json();

          if (!loginResponse.ok) {
            throw new Error(
              loginData.detail ||
                "Could not restore customer session."
            );
          }

          token =
            loginData.token;

          localStorage.setItem(
            "solarflow_customer_token",
            loginData.token
          );

          localStorage.setItem(
            "solarflow_customer",
            JSON.stringify(
              loginData.customer
            )
          );
        }


        const response =
          await fetch(
            `${API_URL}/customer-portal/dashboard`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },

              cache: "no-store",
            }
          );


        if (!response.ok) {
          const responseText =
            await response.text();

          throw new Error(
            responseText ||
              "Could not load account."
          );
        }


        const dashboardData =
          await response.json();


        if (!cancelled) {
          setData(
            dashboardData
          );
        }
      } catch (error) {
        console.error(
          "Customer dashboard error:",
          error
        );

        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Could not load your SolarFlow account."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }


    load();


    return () => {
      cancelled = true;
    };
  }, []);


  function leaveCustomerPortal() {
    localStorage.removeItem(
      "solarflow_customer_token"
    );

    localStorage.removeItem(
      "solarflow_customer"
    );


    if (adminPreview) {
      localStorage.removeItem(
        "solarflow_admin_preview"
      );

      router.push("/");

      return;
    }


    localStorage.removeItem(
      "solarflow_admin_preview"
    );

    router.push("/login");
  }


  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#f6b800]">
            <SunMedium size={22} />
          </div>

          <p className="mt-4 text-sm text-gray-500">
            Loading account...
          </p>
        </div>
      </div>
    );
  }


  if (!data) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-lg rounded-xl bg-red-50 p-5 text-sm text-red-700">
          <p className="font-semibold">
            Could not load account
          </p>

          <p className="mt-2">
            {error ||
              "Could not load your SolarFlow account."}
          </p>

          <button
            onClick={() => {
              window.location.reload();
            }}
            className="mt-4 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }


  return (
    <main className="mx-auto max-w-[1500px] p-5 md:p-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm text-gray-500">
            Welcome back
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            {data.customer.name}
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Here&apos;s what&apos;s
            happening with your solar
            account.
          </p>
        </div>


        <button
          onClick={
            leaveCustomerPortal
          }
          className="flex h-11 w-fit items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold shadow-sm transition hover:bg-gray-50"
        >
          <LogOut size={17} />

          {adminPreview
            ? "Return to Admin"
            : "Sign Out"}
        </button>
      </div>


      {/* STATS */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          title="My Installations"
          value={
            data.summary
              .installations
          }
          icon={
            <SunMedium
              size={19}
            />
          }
        />

        <Stat
          title="Open Service Jobs"
          value={
            data.summary
              .active_service_jobs
          }
          icon={
            <Wrench size={19} />
          }
        />

        <Stat
          title="Warranties"
          value={
            data.summary
              .warranties
          }
          icon={
            <ShieldCheck
              size={19}
            />
          }
        />

        <Stat
          title="Outstanding"
          value={`$${data.summary.outstanding.toLocaleString()}`}
          icon={
            <CircleDollarSign
              size={19}
            />
          }
        />
      </div>


      {/* MAIN CARDS */}
      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        {/* SERVICE */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                Latest Service Request
              </p>

              <h2 className="mt-2 text-xl font-bold">
                {data.latest_service_job
                  ?.title ||
                  "No service request"}
              </h2>
            </div>

            <Wrench size={21} />
          </div>


          {data.latest_service_job ? (
            <>
              <div className="mt-6 rounded-xl bg-gray-50 p-4">
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="text-xs text-gray-400">
                      Tracking
                    </p>

                    <p className="mt-1 font-bold">
                      {
                        data
                          .latest_service_job
                          .tracking_code
                      }
                    </p>
                  </div>

                  <span className="h-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    {
                      data
                        .latest_service_job
                        .status
                    }
                  </span>
                </div>


                {data.latest_service_job
                  .engineer && (
                  <div className="mt-5 flex items-center gap-3">
                    <Truck
                      size={18}
                    />

                    <div>
                      <p className="text-xs text-gray-400">
                        Engineer
                      </p>

                      <p className="font-semibold">
                        {
                          data
                            .latest_service_job
                            .engineer
                            .name
                        }
                      </p>
                    </div>
                  </div>
                )}


                {data.latest_service_job
                  .eta && (
                  <div className="mt-4 flex items-center gap-3">
                    <Clock3
                      size={18}
                    />

                    <div>
                      <p className="text-xs text-gray-400">
                        Expected arrival
                      </p>

                      <p className="font-semibold">
                        {new Date(
                          data
                            .latest_service_job
                            .eta
                        ).toLocaleTimeString(
                          [],
                          {
                            hour:
                              "2-digit",

                            minute:
                              "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>


              <Link
                href={`/customer/track/${data.latest_service_job.tracking_code}`}
                className="mt-5 flex h-11 items-center justify-center rounded-lg bg-black text-sm font-semibold text-white"
              >
                Live Tracking
              </Link>
            </>
          ) : (
            <Link
              href="/customer/service-jobs"
              className="mt-6 flex h-11 items-center justify-center rounded-lg bg-black text-sm font-semibold text-white"
            >
              Request Support
            </Link>
          )}
        </div>


        {/* SOLAR SYSTEM */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                My Solar System
              </p>

              <h2 className="mt-2 text-xl font-bold">
                {data.latest_installation
                  ?.system_size ||
                  "No installation yet"}
              </h2>
            </div>

            <Zap size={21} />
          </div>


          {data.latest_installation && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Detail
                label="Inverter"
                value={
                  data.latest_installation
                    .inverter ||
                  "—"
                }
              />

              <Detail
                label="Battery"
                value={
                  data.latest_installation
                    .battery ||
                  "—"
                }
              />

              <Detail
                label="Panels"
                value={
                  data.latest_installation
                    .panels ||
                  "—"
                }
              />

              <Detail
                label="Status"
                value={
                  data.latest_installation
                    .status
                }
              />
            </div>
          )}


          <Link
            href="/customer/installations"
            className="mt-5 flex h-11 items-center justify-center rounded-lg border border-gray-200 text-sm font-semibold hover:bg-gray-50"
          >
            View My System
          </Link>
        </div>
      </div>
    </main>
  );
}


function Stat({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
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

      <p className="mt-1 font-semibold">
        {value}
      </p>
    </div>
  );
}
