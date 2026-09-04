"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  MapPin,
  Plus,
  SunMedium,
  Truck,
  X,
  Zap,
} from "lucide-react";


const API_URL =
  "https://solarflow-backend-uvqv.onrender.com";


type Customer = {
  id: number;
  name: string;
  address: string | null;
};


type Engineer = {
  id: number;
  name: string;
  status: string;
};


type Installation = {
  id: number;
  system_size: string | null;
  inverter: string | null;
  battery: string | null;
  panels: string | null;
  installation_address: string | null;
  status: string;
  scheduled_date: string | null;
  completed_at: string | null;
  created_at: string;

  customer: {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
  } | null;

  engineer: {
    id: number;
    name: string;
    phone: string | null;
    specialization: string | null;
  } | null;
};


export default function InstallationsPage() {
  const [
    installations,
    setInstallations,
  ] = useState<Installation[]>([]);

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [engineers, setEngineers] =
    useState<Engineer[]>([]);

  const [showForm, setShowForm] =
    useState(false);

  const [customerId, setCustomerId] =
    useState("");

  const [engineerId, setEngineerId] =
    useState("");

  const [systemSize, setSystemSize] =
    useState("");

  const [inverter, setInverter] =
    useState("");

  const [battery, setBattery] =
    useState("");

  const [panels, setPanels] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [scheduledDate, setScheduledDate] =
    useState("");


  async function loadData() {
    const [
      installationResponse,
      customerResponse,
      engineerResponse,
    ] = await Promise.all([
      fetch(
        `${API_URL}/installations/`,
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

      fetch(
        `${API_URL}/engineers/`,
        {
          cache: "no-store",
        }
      ),
    ]);

    setInstallations(
      await installationResponse.json()
    );

    const customerData =
      await customerResponse.json();

    const engineerData =
      await engineerResponse.json();

    setCustomers(customerData);
    setEngineers(engineerData);

    if (
      !customerId &&
      customerData.length
    ) {
      setCustomerId(
        String(customerData[0].id)
      );

      setAddress(
        customerData[0].address || ""
      );
    }
  }


  useEffect(() => {
    loadData();
  }, []);


  function changeCustomer(
    value: string
  ) {
    setCustomerId(value);

    const customer =
      customers.find(
        (item) =>
          item.id === Number(value)
      );

    if (customer?.address) {
      setAddress(
        customer.address
      );
    }
  }


  async function createInstallation(
    event: FormEvent
  ) {
    event.preventDefault();

    if (!customerId) return;

    await fetch(
      `${API_URL}/installations/`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          customer_id:
            Number(customerId),

          engineer_id:
            engineerId
              ? Number(engineerId)
              : null,

          system_size:
            systemSize || null,

          inverter:
            inverter || null,

          battery:
            battery || null,

          panels:
            panels || null,

          installation_address:
            address || null,

          status: "Scheduled",

          scheduled_date:
            scheduledDate
              ? new Date(
                  scheduledDate
                ).toISOString()
              : null,
        }),
      }
    );

    setSystemSize("");
    setInverter("");
    setBattery("");
    setPanels("");
    setScheduledDate("");

    setShowForm(false);

    await loadData();
  }


  async function updateStatus(
    id: number,
    status: string
  ) {
    await fetch(
      `${API_URL}/installations/${id}/status`,
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
                  Installation Operations
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
            New Installation
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] p-5 md:p-8">
        <h1 className="text-3xl font-bold">
          Installations
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Schedule and manage customer
          solar installations.
        </p>

        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          <Stat
            title="Total Installations"
            value={
              installations.length
            }
            icon={<Zap size={19} />}
          />

          <Stat
            title="Scheduled"
            value={
              installations.filter(
                (item) =>
                  item.status ===
                  "Scheduled"
              ).length
            }
            icon={
              <CalendarDays size={19} />
            }
          />

          <Stat
            title="Completed"
            value={
              installations.filter(
                (item) =>
                  item.status ===
                  "Completed"
              ).length
            }
            icon={
              <CheckCircle2 size={19} />
            }
          />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {installations.map(
            (installation) => (
              <div
                key={installation.id}
                className="rounded-xl border border-gray-200 bg-white p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#fff7d6]">
                      <SunMedium
                        size={21}
                      />
                    </div>

                    <div>
                      <p className="font-bold">
                        {installation
                          .customer
                          ?.name ||
                          "Customer"}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {installation.system_size ||
                          "Solar System"}
                      </p>
                    </div>
                  </div>

                  <select
                    value={
                      installation.status
                    }
                    onChange={(event) =>
                      updateStatus(
                        installation.id,
                        event.target
                          .value
                      )
                    }
                    className="h-9 rounded-lg border border-gray-200 px-2 text-xs font-semibold"
                  >
                    <option>
                      Scheduled
                    </option>

                    <option>
                      Site Survey
                    </option>

                    <option>
                      Materials Ready
                    </option>

                    <option>
                      In Progress
                    </option>

                    <option>
                      Testing
                    </option>

                    <option>
                      Completed
                    </option>
                  </select>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
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
                      "Unassigned"
                    }
                  />
                </div>

                {installation.installation_address && (
                  <div className="mt-5 flex items-center gap-2 border-t border-gray-100 pt-4 text-sm text-gray-500">
                    <MapPin size={15} />

                    {
                      installation.installation_address
                    }
                  </div>
                )}

                {installation.scheduled_date && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                    <CalendarDays
                      size={15}
                    />

                    {new Date(
                      installation.scheduled_date
                    ).toLocaleString()}
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <form
            onSubmit={
              createInstallation
            }
            className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6"
          >
            <div className="flex justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  New Installation
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Schedule a solar
                  installation.
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

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <Label>
                  Customer
                </Label>

                <select
                  value={customerId}
                  onChange={(event) =>
                    changeCustomer(
                      event.target.value
                    )
                  }
                  className="mt-2 h-11 w-full rounded-lg border border-gray-200 px-3"
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
                        {
                          customer.name
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <Label>
                  Engineer
                </Label>

                <select
                  value={engineerId}
                  onChange={(event) =>
                    setEngineerId(
                      event.target.value
                    )
                  }
                  className="mt-2 h-11 w-full rounded-lg border border-gray-200 px-3"
                >
                  <option value="">
                    Assign later
                  </option>

                  {engineers.map(
                    (engineer) => (
                      <option
                        key={
                          engineer.id
                        }
                        value={
                          engineer.id
                        }
                      >
                        {
                          engineer.name
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              <Input
                label="System Size"
                value={systemSize}
                setValue={
                  setSystemSize
                }
                placeholder="5kVA"
              />

              <Input
                label="Inverter"
                value={inverter}
                setValue={setInverter}
                placeholder="5kVA Hybrid Inverter"
              />

              <Input
                label="Battery"
                value={battery}
                setValue={setBattery}
                placeholder="10kWh Lithium"
              />

              <Input
                label="Panels"
                value={panels}
                setValue={setPanels}
                placeholder="8 x 550W"
              />

              <div className="sm:col-span-2">
                <Input
                  label="Installation Address"
                  value={address}
                  setValue={setAddress}
                  placeholder=""
                />
              </div>

              <div className="sm:col-span-2">
                <Label>
                  Scheduled Date
                </Label>

                <input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(event) =>
                    setScheduledDate(
                      event.target.value
                    )
                  }
                  className="mt-2 h-11 w-full rounded-lg border border-gray-200 px-3"
                />
              </div>
            </div>

            <button className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-black font-semibold text-white">
              <Truck size={17} />
              Schedule Installation
            </button>
          </form>
        </div>
      )}
    </div>
  );
}


function Label({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <label className="text-xs font-bold uppercase text-gray-500">
      {children}
    </label>
  );
}


function Input({
  label,
  value,
  setValue,
  placeholder,
}: {
  label: string;
  value: string;
  setValue: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <Label>{label}</Label>

      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          setValue(event.target.value)
        }
        className="mt-2 h-11 w-full rounded-lg border border-gray-200 px-3"
      />
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

      <p className="mt-1 text-sm font-semibold">
        {value}
      </p>
    </div>
  );
}


function Stat({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
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