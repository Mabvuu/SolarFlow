"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  AlertTriangle,
  ArrowLeft,
  Boxes,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  Gauge,
  SunMedium,
  TrendingUp,
  Users,
  WalletCards,
  Wrench,
  Zap,
} from "lucide-react";


const API_URL =
  "https://solarflow-backend-uvgv.onrender.com";


type ReportData = {
  sales: {
    total_leads: number;
    won_leads: number;
    lead_conversion_rate: number;
    total_quotes: number;
    accepted_quotes: number;
    quote_acceptance_rate: number;
    quote_value: number;
    accepted_quote_value: number;
  };

  operations: {
    total_customers: number;
    total_installations: number;
    completed_installations: number;
    total_service_jobs: number;
    completed_service_jobs: number;
    job_completion_rate: number;
    urgent_open_jobs: number;
    available_engineers: number;
  };

  finance: {
    total_invoiced: number;
    total_received: number;
    outstanding: number;
  };

  inventory: {
    cost_value: number;
    retail_value: number;
    low_stock_items: number;
  };

  warranties: {
    active_warranties: number;
  };
};


export default function ReportsPage() {
  const [data, setData] =
    useState<ReportData | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);


  useEffect(() => {
    async function loadReports() {
      try {
        const response =
          await fetch(
            `${API_URL}/reports/overview`,
            {
              cache: "no-store",
            }
          );

        const result =
          await response.json();

        setData(result);
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, []);


  if (loading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f6f7]">
        <p className="text-sm text-gray-500">
          Loading reports...
        </p>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#f5f6f7]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center px-5 py-4 md:px-8">
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
                  Business Intelligence
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] p-5 md:p-8">
        <p className="text-sm font-medium text-gray-500">
          Performance
        </p>

        <h1 className="mt-1 text-3xl font-bold">
          Reports & Analytics
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Sales, finance, operations,
          stock and service performance.
        </p>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            title="Revenue Received"
            value={`$${data.finance.total_received.toLocaleString()}`}
            note={`$${data.finance.outstanding.toLocaleString()} outstanding`}
            icon={
              <CircleDollarSign
                size={19}
              />
            }
          />

          <Metric
            title="Quote Pipeline"
            value={`$${data.sales.quote_value.toLocaleString()}`}
            note={`${data.sales.quote_acceptance_rate}% acceptance`}
            icon={
              <FileText size={19} />
            }
          />

          <Metric
            title="Job Completion"
            value={`${data.operations.job_completion_rate}%`}
            note={`${data.operations.completed_service_jobs} jobs completed`}
            icon={
              <Wrench size={19} />
            }
          />

          <Metric
            title="Inventory Value"
            value={`$${data.inventory.retail_value.toLocaleString()}`}
            note={`${data.inventory.low_stock_items} low stock items`}
            icon={
              <Boxes size={19} />
            }
          />
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          <Section
            title="Sales Performance"
            subtitle="Lead and quotation performance"
            icon={
              <TrendingUp
                size={20}
              />
            }
          >
            <ReportRow
              label="Total Leads"
              value={
                data.sales.total_leads
              }
            />

            <ReportRow
              label="Won Leads"
              value={
                data.sales.won_leads
              }
            />

            <ReportRow
              label="Lead Conversion"
              value={`${data.sales.lead_conversion_rate}%`}
            />

            <ReportRow
              label="Quotes Created"
              value={
                data.sales.total_quotes
              }
            />

            <ReportRow
              label="Accepted Quotes"
              value={
                data.sales.accepted_quotes
              }
            />

            <ReportRow
              label="Accepted Quote Value"
              value={`$${data.sales.accepted_quote_value.toLocaleString()}`}
            />
          </Section>

          <Section
            title="Finance"
            subtitle="Billing and collections"
            icon={
              <WalletCards
                size={20}
              />
            }
          >
            <ReportRow
              label="Total Invoiced"
              value={`$${data.finance.total_invoiced.toLocaleString()}`}
            />

            <ReportRow
              label="Payments Received"
              value={`$${data.finance.total_received.toLocaleString()}`}
            />

            <ReportRow
              label="Outstanding"
              value={`$${data.finance.outstanding.toLocaleString()}`}
            />
          </Section>

          <Section
            title="Field Operations"
            subtitle="Installations and service work"
            icon={
              <Gauge size={20} />
            }
          >
            <ReportRow
              label="Customers"
              value={
                data.operations.total_customers
              }
            />

            <ReportRow
              label="Installations"
              value={
                data.operations.total_installations
              }
            />

            <ReportRow
              label="Completed Installations"
              value={
                data.operations.completed_installations
              }
            />

            <ReportRow
              label="Service Jobs"
              value={
                data.operations.total_service_jobs
              }
            />

            <ReportRow
              label="Completed Jobs"
              value={
                data.operations.completed_service_jobs
              }
            />

            <ReportRow
              label="Available Engineers"
              value={
                data.operations.available_engineers
              }
            />

            <ReportRow
              label="Urgent Open Jobs"
              value={
                data.operations.urgent_open_jobs
              }
            />
          </Section>

          <Section
            title="Stock & Warranty"
            subtitle="Equipment exposure"
            icon={<Zap size={20} />}
          >
            <ReportRow
              label="Inventory Cost Value"
              value={`$${data.inventory.cost_value.toLocaleString()}`}
            />

            <ReportRow
              label="Inventory Retail Value"
              value={`$${data.inventory.retail_value.toLocaleString()}`}
            />

            <ReportRow
              label="Low Stock Items"
              value={
                data.inventory.low_stock_items
              }
            />

            <ReportRow
              label="Active Warranties"
              value={
                data.warranties.active_warranties
              }
            />
          </Section>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Highlight
            icon={
              <Users size={19} />
            }
            label="Lead Conversion"
            value={`${data.sales.lead_conversion_rate}%`}
          />

          <Highlight
            icon={
              <CheckCircle2
                size={19}
              />
            }
            label="Job Completion"
            value={`${data.operations.job_completion_rate}%`}
          />

          <Highlight
            icon={
              <AlertTriangle
                size={19}
              />
            }
            label="Urgent Jobs"
            value={
              data.operations.urgent_open_jobs.toString()
            }
          />
        </div>
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
        <p className="text-sm text-gray-500">
          {title}
        </p>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold">
        {value}
      </p>

      <p className="mt-2 text-xs text-gray-500">
        {note}
      </p>
    </div>
  );
}


function Section({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
          {icon}
        </div>

        <div>
          <h2 className="font-bold">
            {title}
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="mt-2">
        {children}
      </div>
    </div>
  );
}


function ReportRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-4 last:border-0">
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="font-bold">
        {value}
      </p>
    </div>
  );
}


function Highlight({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100">
        {icon}
      </div>

      <div>
        <p className="text-xs text-gray-500">
          {label}
        </p>

        <p className="mt-1 text-xl font-bold">
          {value}
        </p>
      </div>
    </div>
  );
}