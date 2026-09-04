"use client";

import {
  CircleDollarSign,
  House,
  LogOut,
  Menu,
  ShieldCheck,
  SunMedium,
  UserRound,
  Wrench,
  X,
  Zap,
} from "lucide-react";

import Link from "next/link";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  ReactNode,
  useEffect,
  useState,
} from "react";


const API_URL =
  "https://solarflow-backend-production.up.railway.app";


const links = [
  {
    name: "Home",
    href: "/customer",
    icon: House,
  },
  {
    name: "Service Jobs",
    href: "/customer/service-jobs",
    icon: Wrench,
  },
  {
    name: "My Solar System",
    href: "/customer/installations",
    icon: Zap,
  },
  {
    name: "Invoices",
    href: "/customer/invoices",
    icon: CircleDollarSign,
  },
  {
    name: "Warranties",
    href: "/customer/warranties",
    icon: ShieldCheck,
  },
];


export default function CustomerShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [ready, setReady] =
    useState(false);

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [customerName, setCustomerName] =
    useState("Customer");

  const [sessionError, setSessionError] =
    useState("");


  const isLogin =
    pathname === "/customer/login";


  useEffect(() => {
    let cancelled = false;

    async function prepareSession() {
      if (isLogin) {
        if (!cancelled) {
          setReady(true);
        }

        return;
      }

      setReady(false);
      setSessionError("");

      let token =
        localStorage.getItem(
          "solarflow_customer_token"
        );

      let stored =
        localStorage.getItem(
          "solarflow_customer"
        );


      /*
        The normal login page should already have
        created the token.

        For the demo, if the browser lost the token
        during navigation, automatically recover the
        Tariro demo session instead of throwing the
        user back to the login page.
      */
      if (!token) {
        try {
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
                  email:
                    "tariro@example.com",

                  password:
                    "customer123",
                }),
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.detail ||
                "Could not restore customer session."
            );
          }

          token = data.token;

          stored =
            JSON.stringify(
              data.customer
            );

          localStorage.setItem(
            "solarflow_customer_token",
            data.token
          );

          localStorage.setItem(
            "solarflow_customer",
            stored
          );
        } catch (error) {
          console.error(
            "Customer session error:",
            error
          );

          if (!cancelled) {
            setSessionError(
              "Could not open the customer portal."
            );

            setReady(true);
          }

          return;
        }
      }


      if (stored) {
        try {
          const customer =
            JSON.parse(stored);

          if (!cancelled) {
            setCustomerName(
              customer.name ||
                "Customer"
            );
          }
        } catch {
          if (!cancelled) {
            setCustomerName(
              "Customer"
            );
          }
        }
      }


      if (!cancelled) {
        setReady(true);
      }
    }


    prepareSession();


    return () => {
      cancelled = true;
    };
  }, [
    isLogin,
    pathname,
  ]);


  function logout() {
    localStorage.removeItem(
      "solarflow_customer_token"
    );

    localStorage.removeItem(
      "solarflow_customer"
    );

    localStorage.removeItem(
      "solarflow_admin_preview"
    );

    router.push("/login");
  }


  if (isLogin) {
    return <>{children}</>;
  }


  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f6f7]">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#f6b800] text-black">
            <SunMedium size={22} />
          </div>

          <p className="mt-4 text-sm text-gray-500">
            Opening customer portal...
          </p>
        </div>
      </div>
    );
  }


  if (sessionError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f6f7] p-6">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#f6b800]">
            <SunMedium size={22} />
          </div>

          <h1 className="mt-5 text-xl font-bold">
            Customer Portal
          </h1>

          <p className="mt-3 text-sm text-red-600">
            {sessionError}
          </p>

          <button
            onClick={() => {
              window.location.href =
                "/login";
            }}
            className="mt-5 h-11 w-full rounded-lg bg-black text-sm font-semibold text-white"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#f5f6f7]">
      {menuOpen && (
        <button
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() =>
            setMenuOpen(false)
          }
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-[250px] flex-col bg-[#101316] text-white transition-transform ${
          menuOpen
            ? "translate-x-0"
            : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-5">
          <Link
            href="/customer"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f6b800] text-black">
              <SunMedium size={22} />
            </div>

            <div>
              <p className="font-bold">
                SolarFlow
              </p>

              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
                Customer Portal
              </p>
            </div>
          </Link>

          <button
            onClick={() =>
              setMenuOpen(false)
            }
            className="lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-3 pt-5">
          {links.map((item) => {
            const Icon =
              item.icon;

            const active =
              item.href === "/customer"
                ? pathname ===
                  "/customer"
                : pathname.startsWith(
                    item.href
                  );

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() =>
                  setMenuOpen(false)
                }
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm ${
                  active
                    ? "bg-white font-semibold text-black"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} />

                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f6b800] text-black">
              <UserRound size={17} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {customerName}
              </p>

              <p className="text-xs text-gray-500">
                Customer
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-400 hover:bg-white/5 hover:text-white"
          >
            <LogOut size={17} />

            Sign Out
          </button>
        </div>
      </aside>

      <div className="lg:ml-[250px]">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-gray-200 bg-white px-5 md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setMenuOpen(true)
              }
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 lg:hidden"
            >
              <Menu size={19} />
            </button>

            <div>
              <p className="text-xs text-gray-400">
                Customer Portal
              </p>

              <p className="font-bold">
                {customerName}
              </p>
            </div>
          </div>

          <Link
            href="/customer/service-jobs"
            className="rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white"
          >
            Get Support
          </Link>
        </header>

        {children}
      </div>
    </div>
  );
}
