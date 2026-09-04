"use client";

import {
  CircleDollarSign,
  FileText,
  WalletCards,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";


const API_URL =
  "https://solarflow-backend-production.up.railway.app";


export default function CustomerInvoicesPage() {
  const [invoices, setInvoices] =
    useState<any[]>([]);


  useEffect(() => {
    async function load() {
      const token =
        localStorage.getItem(
          "solarflow_customer_token"
        );

      const response = await fetch(
        `${API_URL}/customer-portal/invoices`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setInvoices(
          await response.json()
        );
      }
    }

    load();
  }, []);


  const total =
    invoices.reduce(
      (sum, invoice) =>
        sum + invoice.amount,
      0
    );

  const paid =
    invoices.reduce(
      (sum, invoice) =>
        sum +
        invoice.amount_paid,
      0
    );

  const outstanding =
    invoices.reduce(
      (sum, invoice) =>
        sum + invoice.balance,
      0
    );


  return (
    <main className="mx-auto max-w-[1400px] p-5 md:p-8">
      <p className="text-sm text-gray-500">
        Billing
      </p>

      <h1 className="mt-1 text-3xl font-bold">
        My Invoices
      </h1>

      <p className="mt-2 text-sm text-gray-500">
        View your billing and payment
        status.
      </p>

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <Stat
          label="Total Invoiced"
          value={`$${total.toLocaleString()}`}
          icon={
            <FileText size={19} />
          }
        />

        <Stat
          label="Paid"
          value={`$${paid.toLocaleString()}`}
          icon={
            <CircleDollarSign
              size={19}
            />
          }
        />

        <Stat
          label="Outstanding"
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
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
                <th className="p-4">
                  Invoice
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

                    <td className="p-4">
                      $
                      {invoice.amount.toLocaleString()}
                    </td>

                    <td className="p-4 text-emerald-700">
                      $
                      {invoice.amount_paid.toLocaleString()}
                    </td>

                    <td className="p-4 font-semibold">
                      $
                      {invoice.balance.toLocaleString()}
                    </td>

                    <td className="p-4">
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold">
                        {
                          invoice.status
                        }
                      </span>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}


function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex justify-between">
        <p className="text-sm text-gray-500">
          {label}
        </p>

        {icon}
      </div>

      <p className="mt-4 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}