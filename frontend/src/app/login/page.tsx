"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  ArrowRight,
  Building2,
  Check,
  LockKeyhole,
  Mail,
  ShieldCheck,
  SunMedium,
  UserRound,
  Users,
  Wrench,
  Zap,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";


const API_URL =
  "https://solarflow-backend-uvqv.onrender.com";


type LoginType =
  | "admin"
  | "customer";


export default function LoginPage() {
  const router = useRouter();

  const [
    loginType,
    setLoginType,
  ] = useState<LoginType>(
    "admin"
  );

  const [email, setEmail] =
    useState(
      "admin@solarflow.co.zw"
    );

  const [
    password,
    setPassword,
  ] = useState("demo123");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  function chooseAdmin() {
    setLoginType("admin");

    setEmail(
      "admin@solarflow.co.zw"
    );

    setPassword("demo123");

    setError("");
  }


  function chooseCustomer() {
    setLoginType("customer");

    setEmail(
      "tariro@example.com"
    );

    setPassword(
      "customer123"
    );

    setError("");
  }


  async function login(
    event: FormEvent
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      if (
        loginType === "admin"
      ) {
        if (
          email !==
            "admin@solarflow.co.zw" ||
          password !== "demo123"
        ) {
          throw new Error(
            "Invalid admin email or password."
          );
        }

        localStorage.setItem(
          "solarflow_demo_user",
          "true"
        );

        localStorage.removeItem(
          "solarflow_customer_token"
        );

        localStorage.removeItem(
          "solarflow_customer"
        );

        localStorage.removeItem(
          "solarflow_admin_preview"
        );

        router.push("/");

        return;
      }


      const response =
        await fetch(
          `${API_URL}/customer-portal/login`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              email,
              password,
            }),
          }
        );


      const data =
        await response.json();


      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Invalid customer login."
        );
      }


      localStorage.removeItem(
        "solarflow_demo_user"
      );

      localStorage.removeItem(
        "solarflow_admin_preview"
      );

      localStorage.setItem(
        "solarflow_customer_token",
        data.token
      );

      localStorage.setItem(
        "solarflow_customer",
        JSON.stringify(
          data.customer
        )
      );

      router.push(
        "/customer"
      );

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Login failed."
      );

    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      {/* LEFT SIDE */}
      <div className="hidden min-h-screen bg-[#101316] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f6b800] text-black">
            <SunMedium
              size={24}
            />
          </div>

          <div>
            <p className="text-xl font-bold">
              SolarFlow
            </p>

            <p className="text-xs uppercase tracking-[0.25em] text-gray-500">
              ERP
            </p>
          </div>
        </div>


        <div className="max-w-[600px]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            {loginType ===
            "admin" ? (
              <Zap size={27} />
            ) : (
              <UserRound
                size={27}
              />
            )}
          </div>

          <h1 className="mt-8 text-5xl font-bold leading-[1.15]">
            {loginType ===
            "admin"
              ? "Run your entire solar operation from one place."
              : "Your solar system, service and support in one place."}
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-gray-400">
            {loginType ===
            "admin"
              ? "Manage sales, installations, engineers, customer service, inventory, invoices, warranties and reporting."
              : "Track your installation, follow engineer visits, report faults and view invoices and warranties."}
          </p>


          <div className="mt-10 space-y-4">
            {loginType ===
            "admin" ? (
              <>
                <Feature
                  text="Manage customers and sales"
                />

                <Feature
                  text="Assign engineers and track jobs"
                />

                <Feature
                  text="Control stock, billing and warranties"
                />
              </>
            ) : (
              <>
                <Feature
                  text="Track service jobs live"
                />

                <Feature
                  text="See your solar installation"
                />

                <Feature
                  text="View invoices and warranties"
                />
              </>
            )}
          </div>
        </div>


        <p className="text-sm text-gray-600">
          SolarFlow Operations
          Platform
        </p>
      </div>


      {/* RIGHT SIDE */}
      <div className="flex min-h-screen items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[520px]">
          <div className="mb-9 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f6b800]">
              <SunMedium
                size={22}
              />
            </div>

            <div>
              <p className="font-bold">
                SolarFlow
              </p>

              <p className="text-xs text-gray-500">
                Solar Operations
                Platform
              </p>
            </div>
          </div>


          <p className="text-sm font-semibold text-gray-500">
            Welcome to SolarFlow
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight">
            How would you like
            to sign in?
          </h2>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Choose the workspace
            you want to access.
          </p>


          {/* LOGIN TYPE */}
          <div className="mt-7 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={
                chooseAdmin
              }
              className={`relative rounded-xl border-2 p-4 text-left transition ${
                loginType ===
                "admin"
                  ? "border-black bg-black text-white"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  loginType ===
                  "admin"
                    ? "bg-white/10"
                    : "bg-gray-100"
                }`}
              >
                <Building2
                  size={19}
                />
              </div>

              <p className="mt-4 font-bold">
                Admin
              </p>

              <p
                className={`mt-1 text-xs leading-5 ${
                  loginType ===
                  "admin"
                    ? "text-gray-400"
                    : "text-gray-500"
                }`}
              >
                Staff & operations
              </p>

              {loginType ===
                "admin" && (
                <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#f6b800] text-black">
                  <Check
                    size={13}
                  />
                </div>
              )}
            </button>


            <button
              type="button"
              onClick={
                chooseCustomer
              }
              className={`relative rounded-xl border-2 p-4 text-left transition ${
                loginType ===
                "customer"
                  ? "border-black bg-black text-white"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  loginType ===
                  "customer"
                    ? "bg-white/10"
                    : "bg-gray-100"
                }`}
              >
                <Users
                  size={19}
                />
              </div>

              <p className="mt-4 font-bold">
                Customer
              </p>

              <p
                className={`mt-1 text-xs leading-5 ${
                  loginType ===
                  "customer"
                    ? "text-gray-400"
                    : "text-gray-500"
                }`}
              >
                My solar portal
              </p>

              {loginType ===
                "customer" && (
                <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#f6b800] text-black">
                  <Check
                    size={13}
                  />
                </div>
              )}
            </button>
          </div>


          <div className="my-7 h-px bg-gray-200" />


          <div className="mb-5">
            <div className="flex items-center gap-2">
              {loginType ===
              "admin" ? (
                <ShieldCheck
                  size={18}
                />
              ) : (
                <UserRound
                  size={18}
                />
              )}

              <p className="font-bold">
                {loginType ===
                "admin"
                  ? "Admin Workspace"
                  : "Customer Portal"}
              </p>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              {loginType ===
              "admin"
                ? "Access company operations and management."
                : "Access your personal solar account."}
            </p>
          </div>


          <form
            onSubmit={login}
          >
            <div>
              <label className="text-sm font-semibold">
                Email
              </label>

              <div className="relative mt-2">
                <Mail
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(
                    event
                  ) =>
                    setEmail(
                      event.target
                        .value
                    )
                  }
                  className="h-12 w-full rounded-xl border border-gray-200 pl-10 pr-4 outline-none transition focus:border-gray-500"
                />
              </div>
            </div>


            <div className="mt-5">
              <label className="text-sm font-semibold">
                Password
              </label>

              <div className="relative mt-2">
                <LockKeyhole
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="password"
                  value={
                    password
                  }
                  onChange={(
                    event
                  ) =>
                    setPassword(
                      event.target
                        .value
                    )
                  }
                  className="h-12 w-full rounded-xl border border-gray-200 pl-10 pr-4 outline-none transition focus:border-gray-500"
                />
              </div>
            </div>


            {error && (
              <div className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}


            <button
              disabled={
                loading
              }
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black font-semibold text-white disabled:opacity-50"
            >
              {loading
                ? "Signing in..."
                : loginType ===
                  "admin"
                ? "Sign in as Admin"
                : "Sign in as Customer"}

              {!loading && (
                <ArrowRight
                  size={17}
                />
              )}
            </button>
          </form>


          {/* DEMO DETAILS */}
          <div className="mt-7 rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
              Demo Login
            </p>

            {loginType ===
            "admin" ? (
              <>
                <p className="mt-3 text-sm">
                  <strong>
                    Email:
                  </strong>{" "}
                  admin@solarflow.co.zw
                </p>

                <p className="mt-1 text-sm">
                  <strong>
                    Password:
                  </strong>{" "}
                  demo123
                </p>
              </>
            ) : (
              <>
                <p className="mt-3 text-sm">
                  <strong>
                    Email:
                  </strong>{" "}
                  tariro@example.com
                </p>

                <p className="mt-1 text-sm">
                  <strong>
                    Password:
                  </strong>{" "}
                  customer123
                </p>
              </>
            )}
          </div>


          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-400">
            {loginType ===
            "admin" ? (
              <Wrench
                size={14}
              />
            ) : (
              <Zap size={14} />
            )}

            {loginType ===
            "admin"
              ? "SolarFlow Operations Workspace"
              : "SolarFlow Customer Workspace"}
          </div>
        </div>
      </div>
    </div>
  );
}


function Feature({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm text-gray-400">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
        <Check size={13} />
      </div>

      {text}
    </div>
  );
}