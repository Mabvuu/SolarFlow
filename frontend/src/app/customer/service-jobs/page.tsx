"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  ChevronRight,
  MapPin,
  Plus,
  Truck,
  Wrench,
  X,
} from "lucide-react";


const API_URL =
  "https://solarflow-backend-production.up.railway.app";


export default function CustomerJobsPage() {
  const [jobs, setJobs] =
    useState<any[]>([]);

  const [showForm, setShowForm] =
    useState(false);

  const [title, setTitle] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [jobType, setJobType] =
    useState("Fault");

  const [priority, setPriority] =
    useState("Normal");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);


  function headers() {
    return {
      "Content-Type":
        "application/json",

      Authorization:
        `Bearer ${localStorage.getItem(
          "solarflow_customer_token"
        )}`,
    };
  }


  async function loadJobs() {
    try {
      const response = await fetch(
        `${API_URL}/customer-portal/service-jobs`,
        {
          headers: headers(),
          cache: "no-store",
        }
      );

      if (response.ok) {
        setJobs(
          await response.json()
        );
      }
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadJobs();
  }, []);


  async function submitRequest(
    event: FormEvent
  ) {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        `${API_URL}/customer-portal/service-jobs`,
        {
          method: "POST",
          headers: headers(),

          body: JSON.stringify({
            job_type: jobType,
            title:
              title.trim(),
            description:
              description.trim() ||
              null,
            priority,
          }),
        }
      );

      if (!response.ok) {
        const data =
          await response.json();

        alert(
          data.detail ||
            "Could not submit request."
        );

        return;
      }

      setTitle("");
      setDescription("");
      setJobType("Fault");
      setPriority("Normal");
      setShowForm(false);

      await loadJobs();
    } finally {
      setSubmitting(false);
    }
  }


  async function confirmJob(
    id: number
  ) {
    const response = await fetch(
      `${API_URL}/customer-portal/service-jobs/${id}/confirm`,
      {
        method: "PATCH",
        headers: headers(),
      }
    );

    if (!response.ok) {
      const data =
        await response.json();

      alert(
        data.detail ||
          "Could not confirm job."
      );

      return;
    }

    await loadJobs();
  }


  return (
    <main className="mx-auto max-w-[1400px] p-5 md:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-gray-500">
            Support
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            My Service Jobs
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Faults, maintenance and
            engineer visits.
          </p>
        </div>

        <button
          onClick={() =>
            setShowForm(true)
          }
          className="flex h-11 items-center justify-center gap-2 rounded-lg bg-black px-4 text-sm font-semibold text-white"
        >
          <Plus size={17} />

          Report a Fault
        </button>
      </div>

      {loading ? (
        <div className="mt-7 rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
          Loading service jobs...
        </div>
      ) : (
        <div className="mt-7 space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                    <Wrench
                      size={20}
                    />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold">
                        {
                          job.tracking_code
                        }
                      </p>

                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        {job.status}
                      </span>
                    </div>

                    <p className="mt-2 font-semibold">
                      {job.title}
                    </p>

                    {job.description && (
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        {
                          job.description
                        }
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                      {job.address && (
                        <span className="flex items-center gap-1.5">
                          <MapPin
                            size={14}
                          />

                          {
                            job.address
                          }
                        </span>
                      )}

                      {job.engineer && (
                        <span className="flex items-center gap-1.5">
                          <Truck
                            size={14}
                          />

                          {
                            job
                              .engineer
                              .name
                          }
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {job.fault_confirmed_fixed &&
                    !job.customer_confirmed && (
                      <button
                        onClick={() =>
                          confirmJob(
                            job.id
                          )
                        }
                        className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
                      >
                        Confirm Work Done
                      </button>
                    )}

                  <Link
                    href={`/customer/track/${job.tracking_code}`}
                    className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    Track

                    <ChevronRight
                      size={16}
                    />
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {jobs.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
              <Wrench
                size={24}
                className="mx-auto text-gray-400"
              />

              <p className="mt-4 font-bold">
                No service jobs
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Report a fault when
                you need assistance.
              </p>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={
              submitRequest
            }
            className="w-full max-w-lg rounded-2xl bg-white p-6"
          >
            <div className="flex justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Report a Problem
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  The request will
                  immediately appear
                  in the Admin Service
                  Jobs workspace.
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

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-gray-500">
                  Request Type
                </label>

                <select
                  value={jobType}
                  onChange={(event) =>
                    setJobType(
                      event.target.value
                    )
                  }
                  className="mt-2 h-11 w-full rounded-lg border border-gray-200 px-3"
                >
                  <option>
                    Fault
                  </option>

                  <option>
                    Maintenance
                  </option>

                  <option>
                    Inspection
                  </option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-gray-500">
                  Problem
                </label>

                <input
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value
                    )
                  }
                  placeholder="Example: Inverter not charging"
                  className="mt-2 h-11 w-full rounded-lg border border-gray-200 px-3"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-gray-500">
                  Description
                </label>

                <textarea
                  value={
                    description
                  }
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder="Describe what is happening..."
                  className="mt-2 min-h-[130px] w-full rounded-lg border border-gray-200 p-3"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-gray-500">
                  Priority
                </label>

                <select
                  value={priority}
                  onChange={(event) =>
                    setPriority(
                      event.target.value
                    )
                  }
                  className="mt-2 h-11 w-full rounded-lg border border-gray-200 px-3"
                >
                  <option>
                    Normal
                  </option>

                  <option>
                    High
                  </option>

                  <option>
                    Urgent
                  </option>
                </select>
              </div>
            </div>

            <button
              disabled={
                submitting
              }
              className="mt-6 h-11 w-full rounded-lg bg-black font-semibold text-white disabled:opacity-50"
            >
              {submitting
                ? "Submitting..."
                : "Submit Request"}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}