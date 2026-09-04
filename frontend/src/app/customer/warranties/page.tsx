"use client";

import {
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";


const API_URL =
  "https://solarflow-backend-uvgv.onrender.com";


export default function CustomerWarrantiesPage() {
  const [warranties, setWarranties] =
    useState<any[]>([]);


  useEffect(() => {
    async function load() {
      const token =
        localStorage.getItem(
          "solarflow_customer_token"
        );

      const response = await fetch(
        `${API_URL}/customer-portal/warranties`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setWarranties(
          await response.json()
        );
      }
    }

    load();
  }, []);


  return (
    <main className="mx-auto max-w-[1400px] p-5 md:p-8">
      <p className="text-sm text-gray-500">
        Equipment Protection
      </p>

      <h1 className="mt-1 text-3xl font-bold">
        My Warranties
      </h1>

      <p className="mt-2 text-sm text-gray-500">
        Warranty information for your
        installed equipment.
      </p>

      <div className="mt-7 grid gap-4 xl:grid-cols-2">
        {warranties.map(
          (warranty) => (
            <div
              key={warranty.id}
              className="rounded-2xl border border-gray-200 bg-white p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff7d6]">
                    <ShieldCheck
                      size={20}
                    />
                  </div>

                  <div>
                    <p className="text-lg font-bold">
                      {
                        warranty.item_name
                      }
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {warranty.serial_number
                        ? `Serial: ${warranty.serial_number}`
                        : "No serial recorded"}
                    </p>
                  </div>
                </div>

                <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <CheckCircle2
                    size={13}
                  />

                  {
                    warranty.status
                  }
                </span>
              </div>

              <div className="mt-6 rounded-xl bg-gray-50 p-4">
                <p className="text-xs text-gray-400">
                  Installed System
                </p>

                <p className="mt-1 font-semibold">
                  {warranty.installation
                    ?.system_size ||
                    "Not linked"}
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </main>
  );
}