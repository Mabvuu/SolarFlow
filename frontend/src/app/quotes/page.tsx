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
  FileCheck2,
  FileText,
  Plus,
  SunMedium,
  X,
} from "lucide-react";


const API_URL =
  "https://solarflow-backend-uvqv.onrender.com";


type Customer = {
  id: number;
  name: string;
};


type Quote = {
  id: number;
  quote_number: string;
  description: string | null;
  total: number;
  status: string;
  created_at: string;

  customer: {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
  } | null;
};


export default function QuotesPage() {
  const [quotes, setQuotes] =
    useState<Quote[]>([]);

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [showForm, setShowForm] =
    useState(false);

  const [customerId, setCustomerId] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [total, setTotal] =
    useState("");


  async function loadData() {
    const [quoteResponse, customerResponse] =
      await Promise.all([
        fetch(`${API_URL}/quotes/`, {
          cache: "no-store",
        }),

        fetch(
          `${API_URL}/customers/`,
          {
            cache: "no-store",
          }
        ),
      ]);

    setQuotes(
      await quoteResponse.json()
    );

    const customerData =
      await customerResponse.json();

    setCustomers(customerData);

    if (
      !customerId &&
      customerData.length
    ) {
      setCustomerId(
        String(customerData[0].id)
      );
    }
  }


  useEffect(() => {
    loadData();
  }, []);


  async function createQuote(
    event: FormEvent
  ) {
    event.preventDefault();

    if (!customerId) return;

    await fetch(
      `${API_URL}/quotes/`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          customer_id:
            Number(customerId),
          description:
            description || null,
          total: Number(total || 0),
          status: "Draft",
        }),
      }
    );

    setDescription("");
    setTotal("");
    setShowForm(false);

    await loadData();
  }


  async function updateStatus(
    id: number,
    status: string
  ) {
    await fetch(
      `${API_URL}/quotes/${id}/status`,
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

    await loadData();
  }


  const quoteValue =
    quotes.reduce(
      (total, item) =>
        total + item.total,
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
                  Sales & Quotations
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
            New Quote
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] p-5 md:p-8">
        <h1 className="text-3xl font-bold">
          Quotes
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Create and manage customer
          solar quotations.
        </p>

        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          <Stat
            title="Total Quotes"
            value={quotes.length.toString()}
            icon={
              <FileText size={19} />
            }
          />

          <Stat
            title="Accepted"
            value={quotes
              .filter(
                (item) =>
                  item.status ===
                  "Accepted"
              )
              .length.toString()}
            icon={
              <FileCheck2 size={19} />
            }
          />

          <Stat
            title="Quote Value"
            value={`$${quoteValue.toLocaleString()}`}
            icon={
              <CircleDollarSign
                size={19}
              />
            }
          />
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
                <th className="p-4">
                  Quote
                </th>

                <th className="p-4">
                  Customer
                </th>

                <th className="p-4">
                  Description
                </th>

                <th className="p-4">
                  Amount
                </th>

                <th className="p-4">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {quotes.map((quote) => (
                <tr
                  key={quote.id}
                  className="border-b border-gray-100"
                >
                  <td className="p-4 font-bold">
                    {quote.quote_number}
                  </td>

                  <td className="p-4 text-sm">
                    {quote.customer
                      ?.name || "—"}
                  </td>

                  <td className="max-w-[300px] truncate p-4 text-sm text-gray-500">
                    {quote.description ||
                      "Solar system quotation"}
                  </td>

                  <td className="p-4 font-bold">
                    $
                    {quote.total.toLocaleString()}
                  </td>

                  <td className="p-4">
                    <select
                      value={quote.status}
                      onChange={(event) =>
                        updateStatus(
                          quote.id,
                          event.target
                            .value
                        )
                      }
                      className="h-9 rounded-lg border border-gray-200 px-2 text-sm"
                    >
                      <option>
                        Draft
                      </option>

                      <option>
                        Sent
                      </option>

                      <option>
                        Accepted
                      </option>

                      <option>
                        Rejected
                      </option>

                      <option>
                        Expired
                      </option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={createQuote}
            className="w-full max-w-lg rounded-2xl bg-white p-6"
          >
            <div className="flex justify-between">
              <h2 className="text-xl font-bold">
                Create Quote
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
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                className="mt-2 min-h-[120px] w-full rounded-lg border border-gray-200 p-3"
                placeholder="5kVA solar system including installation..."
              />
            </div>

            <div className="mt-4">
              <label className="text-xs font-bold uppercase text-gray-500">
                Total Amount
              </label>

              <input
                type="number"
                value={total}
                onChange={(event) =>
                  setTotal(
                    event.target.value
                  )
                }
                className="mt-2 h-11 w-full rounded-lg border border-gray-200 px-3"
              />
            </div>

            <button className="mt-6 h-11 w-full rounded-lg bg-black font-semibold text-white">
              Create Quote
            </button>
          </form>
        </div>
      )}
    </div>
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