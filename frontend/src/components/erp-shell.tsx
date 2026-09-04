"use client";

import {
  Bell,
  ChevronsUpDown,
  CircleDollarSign,
  FileText,
  Gauge,
  House,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  ShoppingCart,
  SunMedium,
  Truck,
  UserRound,
  Users,
  Warehouse,
  Wrench,
  X,
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

type Customer = {
  id: number;
  name: string;
  email: string | null;
};

const navItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: House,
  },
  {
    name: "Customers",
    href: "/customers",
    icon: Users,
  },
  {
    name: "Leads",
    href: "/leads",
    icon: UserRound,
  },
  {
    name: "Quotes",
    href: "/quotes",
    icon: FileText,
  },
  {
    name: "Installations",
    href: "/installations",
    icon: SunMedium,
  },
  {
    name: "Service Jobs",
    href: "/service-jobs",
    icon: Wrench,
  },
  {
    name: "Engineers",
    href: "/engineers",
    icon: Truck,
  },
  {
    name: "Inventory",
    href: "/inventory",
    icon: Warehouse,
  },
  {
    name: "Suppliers",
    href: "/suppliers",
    icon: ShoppingCart,
  },
  {
    name: "Invoices",
    href: "/invoices",
    icon: CircleDollarSign,
  },
  {
    name: "Warranties",
    href: "/warranties",
    icon: ShieldCheck,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: Gauge,
  },
];

export default function ErpShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);

  const [
    workspaceOpen,
    setWorkspaceOpen,
  ] = useState(false);

  const [
    customers,
    setCustomers,
  ] = useState<Customer[]>([]);

  const [
    selectedCustomer,
    setSelectedCustomer,
  ] = useState("");

  const [
    loadingCustomers,
    setLoadingCustomers,
  ] = useState(false);

  const [
    switching,
    setSwitching,
  ] = useState(false);

  const [
    switchError,
    setSwitchError,
  ] = useState("");

  const [ready, setReady] =
    useState(false);

  /*
    IMPORTANT:
    /customer and /customer/... are customer pages.

    /customers is NOT a customer portal page.
  */
  const isCustomerPortal =
    pathname === "/customer" ||
    pathname.startsWith(
      "/customer/"
    );

  const isPublicTracking =
    pathname === "/track" ||
    pathname.startsWith(
      "/track/"
    );

  const isLogin =
    pathname === "/login";

  const bypassAdminShell =
    isLogin ||
    isCustomerPortal ||
    isPublicTracking;

  useEffect(() => {
    if (bypassAdminShell) {
      setReady(true);
      return;
    }

    const adminSession =
      localStorage.getItem(
        "solarflow_demo_user"
      );

    if (!adminSession) {
      router.replace("/login");
      return;
    }

    setReady(true);
  }, [
    pathname,
    router,
    bypassAdminShell,
  ]);

  async function openWorkspaceSwitcher() {
    setWorkspaceOpen(true);
    setSwitchError("");

    if (customers.length > 0) {
      return;
    }

    setLoadingCustomers(true);

    try {
      const response =
        await fetch(
          `${API_URL}/customers/`,
          {
            cache: "no-store",
          }
        );

      if (!response.ok) {
        throw new Error(
          "Could not load customers."
        );
      }

      const data =
        await response.json();

      setCustomers(data);

      if (data.length > 0) {
        setSelectedCustomer(
          String(data[0].id)
        );
      }
    } catch (error) {
      console.error(error);

      setSwitchError(
        "Could not load customers."
      );
    } finally {
      setLoadingCustomers(false);
    }
  }

  async function switchToCustomer() {
    const customer =
      customers.find(
        (item) =>
          item.id ===
          Number(selectedCustomer)
      );

    if (!customer) {
      setSwitchError(
        "Select a customer."
      );
      return;
    }

    if (!customer.email) {
      setSwitchError(
        "This customer does not have an email address."
      );
      return;
    }

    setSwitching(true);
    setSwitchError("");

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
              email: customer.email,
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
            "Could not open customer portal."
        );
      }

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

      localStorage.setItem(
        "solarflow_admin_preview",
        "true"
      );

      setWorkspaceOpen(false);

      router.push("/customer");
    } catch (error) {
      console.error(error);

      setSwitchError(
        error instanceof Error
          ? error.message
          : "Could not switch workspace."
      );
    } finally {
      setSwitching(false);
    }
  }

  function signOut() {
    localStorage.removeItem(
      "solarflow_demo_user"
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

    router.push("/login");
  }

  if (bypassAdminShell) {
    return <>{children}</>;
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f6f7]">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#f6b800]">
            <SunMedium size={22} />
          </div>

          <p className="mt-4 text-sm text-gray-500">
            Loading SolarFlow...
          </p>
        </div>
      </div>
    );
  }

  const currentItem =
    navItems.find((item) => {
      if (item.href === "/") {
        return pathname === "/";
      }

      return pathname.startsWith(
        item.href
      );
    });

  const pageTitle =
    currentItem?.name ||
    "SolarFlow";

  return (
    <div className="min-h-screen bg-[#f5f6f7]">
      {sidebarOpen && (
        <button
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col bg-[#101316] text-white transition-transform duration-200 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f6b800] text-black">
                <SunMedium
                  size={23}
                />
              </div>

              <div>
                <p className="font-bold">
                  SolarFlow
                </p>

                <p className="text-[10px] uppercase tracking-[0.23em] text-gray-500">
                  ERP
                </p>
              </div>
            </Link>

            <button
              onClick={() =>
                setSidebarOpen(false)
              }
              className="lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          <button
            onClick={
              openWorkspaceSwitcher
            }
            className="mt-4 flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-left hover:bg-white/10"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500">
                Workspace
              </p>

              <p className="mt-1 text-sm font-semibold">
                Admin Workspace
              </p>
            </div>

            <ChevronsUpDown
              size={16}
              className="text-gray-500"
            />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-600">
            Operations
          </p>

          <nav className="space-y-1">
            {navItems.map(
              (item) => {
                const Icon =
                  item.icon;

                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(
                        item.href
                      );

                return (
                  <Link
                    key={
                      item.href
                    }
                    href={
                      item.href
                    }
                    onClick={() =>
                      setSidebarOpen(
                        false
                      )
                    }
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                      active
                        ? "bg-white font-semibold text-black"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon
                      size={18}
                    />

                    {item.name}
                  </Link>
                );
              }
            )}
          </nav>
        </div>

        <div className="border-t border-white/10 p-3">
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f6b800] text-xs font-bold text-black">
              SA
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                System Admin
              </p>

              <p className="text-xs text-gray-500">
                Administrator
              </p>
            </div>
          </div>

          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-400 hover:bg-white/5 hover:text-white"
          >
            <LogOut size={18} />

            Sign Out
          </button>
        </div>
      </aside>

      <div className="min-h-screen lg:ml-[260px]">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                setSidebarOpen(true)
              }
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 lg:hidden"
            >
              <Menu size={20} />
            </button>

            <div>
              <p className="text-xs text-gray-400">
                Admin Workspace
              </p>

              <p className="font-bold">
                {pageTitle}
              </p>
            </div>

            <div className="relative ml-5 hidden xl:block">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                placeholder="Search operations..."
                className="h-10 w-[320px] rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none focus:border-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={
                openWorkspaceSwitcher
              }
              className="hidden h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold md:flex"
            >
              <ChevronsUpDown
                size={16}
              />

              Switch Workspace
            </button>

            <button className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white">
              <Bell size={18} />

              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </button>

            <Link
              href="/service-jobs/new"
              className="hidden h-10 items-center gap-2 rounded-lg bg-black px-4 text-sm font-semibold text-white sm:flex"
            >
              <Wrench size={16} />

              New Service Job
            </Link>
          </div>
        </header>

        <div className="[&>div>header:first-child]:hidden">
          {children}
        </div>
      </div>

      {workspaceOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  SolarFlow
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  Switch Workspace
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Move between staff
                  operations and a
                  customer portal.
                </p>
              </div>

              <button
                onClick={() =>
                  setWorkspaceOpen(
                    false
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 rounded-xl border-2 border-black p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
                  <House size={19} />
                </div>

                <div>
                  <p className="font-bold">
                    Admin Workspace
                  </p>

                  <p className="text-sm text-gray-500">
                    Staff operations
                    and management
                  </p>
                </div>
              </div>
            </div>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200" />

              <span className="text-xs font-bold uppercase tracking-wide text-gray-400">
                Customer Portal
              </span>

              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <label className="text-xs font-bold uppercase tracking-wide text-gray-500">
              View portal as
            </label>

            {loadingCustomers ? (
              <div className="mt-2 rounded-xl border border-gray-200 p-4 text-sm text-gray-500">
                Loading customers...
              </div>
            ) : (
              <select
                value={
                  selectedCustomer
                }
                onChange={(
                  event
                ) =>
                  setSelectedCustomer(
                    event.target.value
                  )
                }
                className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-3 outline-none"
              >
                {customers.map(
                  (customer) => (
                    <option
                      key={
                        customer.id
                      }
                      value={
                        customer.id
                      }
                    >
                      {customer.name}
                      {customer.email
                        ? ` — ${customer.email}`
                        : ""}
                    </option>
                  )
                )}
              </select>
            )}

            {switchError && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {switchError}
              </div>
            )}

            <button
              onClick={
                switchToCustomer
              }
              disabled={
                switching ||
                loadingCustomers ||
                !selectedCustomer
              }
              className="mt-5 h-12 w-full rounded-xl bg-black font-semibold text-white disabled:opacity-50"
            >
              {switching
                ? "Opening Portal..."
                : "Open Customer Portal"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}