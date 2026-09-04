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
  FileText,
  Plus,
  SunMedium,
  WalletCards,
  X,
} from "lucide-react";


const API_URL =
  "https://solarflow-backend-uvgv.onrender.com";


type Customer = {
  id: number;
  name: string;
};


type Invoice = {
  id: number;
  invoice_number: string;
  amount: number;
  amount_paid: number;
  balance: number;
  status: string;
  created_at: string;

  customer: {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
  } | null;
};


export default function InvoicesPage() {
  const [invoices, setInvoices] =
    useState<Invoice[]>([]);

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [showForm, setShowForm] =
    useState(false);

  const [customerId, setCustomerId] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [saving, setSaving] =
    useState(false);


  async function loadData() {
    const [
      invoiceResponse,
      customerResponse,
    ] = await Promise.all([
      fetch(
        `${API_URL}/invoices/`,
        {
          cache: "no-store",
        }
      ),

      fetch(
        `${API_URL}/customers/`,
        {
          cache: "no-store",
        }
      ),
    ]);

    setInvoices(
      await invoiceResponse.json()
    );

    const customerData =
      await customerResponse.json();

    setCustomers(customerData);

    if (
      customerData.length &&
      !customerId
    ) {
      setCustomerId(
        String(customerData[0].id)
      );
    }
  }


  useEffect(() => {
    loadData();
  }, []);


  async function createInvoice(
    event: FormEvent
  ) {
    event.preventDefault();

    if (
      !customerId ||
      Number(amount) <= 0
    ) {
      return;
    }

    setSaving(true);

    try {
      await fetch(
        `${API_URL}/invoices/`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            customer_id:
              Number(customerId),
            amount:
              Number(amount),
            amount_paid: 0,
            status: "Unpaid",
          }),
        }
      );

      setAmount("");
      setShowForm(false);

      await loadData();
    } finally {
      setSaving(false);
    }
  }


  async function markPaid(
    invoice: Invoice
  ) {
    await fetch(
      `${API_URL}/invoices/${invoice.id}/status`,
      {
        method: "PATCH",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          status: "Paid",
        }),
      }
    );

    await loadData();
  }


  async function recordHalfPayment(
    invoice: Invoice
  ) {
    const amountPaid =
      Math.min(
        invoice.amount,
        invoice.amount_paid +
          invoice.balance / 2
      );

    await fetch(
      `${API_URL}/invoices/${invoice.id}/payment`,
      {
        method: "PATCH",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          amount_paid: amountPaid,
        }),
      }
    );

    await loadData();
  }


  const totalInvoiced =
    invoices.reduce(
      (sum, invoice) =>
        sum + invoice.amount,
      0
    );


  const totalPaid =
    invoices.reduce(
      (sum, invoice) =>
        sum +
        invoice.amount_paid,
      0
    );


  const outstanding =
    Math.max(
      totalInvoiced - totalPaid,
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
                  Finance
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
            New Invoice
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] p-5 md:p-8">
        <h1 className="text-3xl font-bold">
          Invoices
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Customer billing and payment
          tracking.
        </p>

        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          <Stat
            title="Total Invoiced"
            value={`$${totalInvoiced.toLocaleString()}`}
            icon={
              <FileText size={19} />
            }
          />

          <Stat
            title="Payments Received"
            value={`$${totalPaid.toLocaleString()}`}
            icon={
              <CircleDollarSign
                size={19}
              />
            }
          />

          <Stat
            title="Outstanding"
            value={`$${outstanding.toLocaleString()}`}
            icon={
              <WalletCards
                size={19}
              />
            }
          />
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
                  <th className="p-4">
                    Invoice
                  </th>

                  <th className="p-4">
                    Customer
                  </th>

                  <th className="p-4">
                    Amount
                  </th>

                  <th className="p-4">
                    Paid
                  </th>

                  <th className="p-4">
                    Balance
                  </th>

                  <th className="p-4">
                    Status
                  </th>

                  <th className="p-4">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {invoices.map(
                  (invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-b border-gray-100"
                    >
                      <td className="p-4 font-bold">
                        {
                          invoice.invoice_number
                        }
                      </td>

                      <td className="p-4 text-sm">
                        {invoice.customer
                          ?.name || "—"}
                      </td>

                      <td className="p-4 font-semibold">
                        $
                        {invoice.amount.toLocaleString()}
                      </td>

                      <td className="p-4 text-sm text-emerald-700">
                        $
                        {invoice.amount_paid.toLocaleString()}
                      </td>

                      <td className="p-4 font-semibold text-red-600">
                        $
                        {invoice.balance.toLocaleString()}
                      </td>

                      <td className="p-4">
                        <Status
                          value={
                            invoice.status
                          }
                        />
                      </td>

                      <td className="p-4">
                        {invoice.status !==
                          "Paid" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                recordHalfPayment(
                                  invoice
                                )
                              }
                              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold"
                            >
                              Record Payment
                            </button>

                            <button
                              onClick={() =>
                                markPaid(
                                  invoice
                                )
                              }
                              className="rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white"
                            >
                              Mark Paid
                            </button>
                          </div>
                        )}
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
            onSubmit={createInvoice}
            className="w-full max-w-lg rounded-2xl bg-white p-6"
          >
            <div className="flex justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  New Invoice
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Bill a customer.
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

            <div className="mt-6">
              <label className="text-xs font-bold uppercase text-gray-500">
                Customer
              </label>

              <select
                value={customerId}
                onChange={(event) =>
                  setCustomerId(
                    event.target.value
                  )
                }
                className="mt-2 h-11 w-full rounded-lg border border-gray-200 px-3"
              >
                {customers.map(
                  (customer) => (
                    <option
                      key={customer.id}
                      value={customer.id}
                    >
                      {customer.name}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="mt-4">
              <label className="text-xs font-bold uppercase text-gray-500">
                Invoice Amount
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) =>
                  setAmount(
                    event.target.value
                  )
                }
                className="mt-2 h-11 w-full rounded-lg border border-gray-200 px-3"
              />
            </div>

            <button
              disabled={saving}
              className="mt-6 h-11 w-full rounded-lg bg-black font-semibold text-white disabled:opacity-50"
            >
              {saving
                ? "Creating..."
                : "Create Invoice"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}


function Status({
  value,
}: {
  value: string;
}) {
  const style =
    value === "Paid"
      ? "bg-emerald-50 text-emerald-700"
      : value ===
        "Partially Paid"
      ? "bg-amber-50 text-amber-700"
      : "bg-red-50 text-red-700";

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}
    >
      {value}
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