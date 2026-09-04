"use client";

import {
  CalendarDays,
  MapPin,
  SunMedium,
  Truck,
  Zap,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";


const API_URL =
  "https://solarflow-backend-production.up.railway.app";


export default function CustomerInstallationsPage() {
  const [
    installations,
    setInstallations,
  ] = useState<any[]>([]);


  useEffect(() => {
    async function load() {
      const token =
        localStorage.getItem(
          "solarflow_customer_token"
        );

      const response = await fetch(
        `${API_URL}/customer-portal/installations`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setInstallations(
          await response.json()
        );
      }
    }

    load();
  }, []);


  return (
    <main className="mx-auto max-w-[1400px] p-5 md:p-8">
      <p className="text-sm text-gray-500">
        My Account
      </p>

      <h1 className="mt-1 text-3xl font-bold">
        My Solar System
      </h1>

      <p className="mt-2 text-sm text-gray-500">
        Your installations and system
        equipment.
      </p>

      <div className="mt-7 grid gap-5 xl:grid-cols-2">
        {installations.map(
          (installation) => (
            <div
              key={installation.id}
              className="rounded-2xl border border-gray-200 bg-white p-6"
            >
              <div className="flex justify-between">
                <div className="flex gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff7d6]">
                    <SunMedium
                      size={21}
                    />
                  </div>

                  <div>
                    <p className="text-xl font-bold">
                      {installation.system_size ||
                        "Solar System"}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Installation #
                      {installation.id}
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  {
                    installation.status
                  }
                </span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Detail
                  label="Inverter"
                  value={
                    installation.inverter ||
                    "—"
                  }
                />

                <Detail
                  label="Battery"
                  value={
                    installation.battery ||
                    "—"
                  }
                />

                <Detail
                  label="Panels"
                  value={
                    installation.panels ||
                    "—"
                  }
                />

                <Detail
                  label="Engineer"
                  value={
                    installation.engineer
                      ?.name ||
                    "Not assigned"
                  }
                />
              </div>

              <div className="mt-5 space-y-2 border-t border-gray-100 pt-4 text-sm text-gray-500">
                {installation.installation_address && (
                  <p className="flex items-center gap-2">
                    <MapPin size={15} />
                    {
                      installation.installation_address
                    }
                  </p>
                )}

                {installation.scheduled_date && (
                  <p className="flex items-center gap-2">
                    <CalendarDays
                      size={15}
                    />

                    {new Date(
                      installation.scheduled_date
                    ).toLocaleString()}
                  </p>
                )}

                {installation.engineer && (
                  <p className="flex items-center gap-2">
                    <Truck size={15} />

                    {
                      installation.engineer
                        .name
                    }
                  </p>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </main>
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
    <div className="rounded-xl bg-gray-50 p-4">
      <p className="text-xs text-gray-400">
        {label}
      </p>

      <p className="mt-1 font-semibold">
        {value}
      </p>
    </div>
  );
}