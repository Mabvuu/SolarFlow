"use client";

import {
  ArrowLeft,
  BellRing,
  CheckCircle2,
  Clock3,
  MapPin,
  Phone,
  Truck,
  UserRound,
  Volume2,
  VolumeX,
  Wrench,
  X,
} from "lucide-react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  useEffect,
  useRef,
  useState,
} from "react";


const API_URL =
  "https://solarflow-backend-uvqv.onrender.com";


const statusSteps = [
  "Request Received",
  "Accepted",
  "Engineer Assigned",
  "On Route",
  "Arrived",
  "Inspection",
  "Working",
  "Completed",
];


export default function TrackingPage() {
  const params = useParams();
  const router = useRouter();

  const code = String(
    params.code
  );

  const [job, setJob] =
    useState<any | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    notificationVisible,
    setNotificationVisible,
  ] = useState(true);

  const [
    statusChanged,
    setStatusChanged,
  ] = useState(false);

  const [
    soundEnabled,
    setSoundEnabled,
  ] = useState(false);

  const [
    returnLabel,
    setReturnLabel,
  ] = useState("Back");

  const previousStatus =
    useRef<string | null>(
      null
    );


  useEffect(() => {
    const admin =
      localStorage.getItem(
        "solarflow_demo_user"
      );

    const customer =
      localStorage.getItem(
        "solarflow_customer_token"
      );

    if (admin) {
      setReturnLabel(
        "Back to Service Jobs"
      );
    } else if (customer) {
      setReturnLabel(
        "Back to My Jobs"
      );
    }
  }, []);


  function goBack() {
    const admin =
      localStorage.getItem(
        "solarflow_demo_user"
      );

    const customer =
      localStorage.getItem(
        "solarflow_customer_token"
      );

    if (admin) {
      router.push(
        "/service-jobs"
      );
      return;
    }

    if (customer) {
      router.push(
        "/customer/service-jobs"
      );
      return;
    }

    router.back();
  }


  function beep() {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (
          window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (!AudioContextClass) {
        return;
      }

      const context =
        new AudioContextClass();

      const oscillator =
        context.createOscillator();

      const gain =
        context.createGain();

      oscillator.type =
        "sine";

      oscillator.frequency.value =
        880;

      gain.gain.setValueAtTime(
        0.0001,
        context.currentTime
      );

      gain.gain.exponentialRampToValueAtTime(
        0.18,
        context.currentTime +
          0.02
      );

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        context.currentTime +
          0.22
      );

      oscillator.connect(gain);

      gain.connect(
        context.destination
      );

      oscillator.start();

      oscillator.stop(
        context.currentTime +
          0.24
      );

      oscillator.onended =
        () => {
          context.close();
        };

    } catch (error) {
      console.error(
        "Sound alert failed",
        error
      );
    }
  }


  function toggleSound() {
    const next =
      !soundEnabled;

    setSoundEnabled(next);

    if (next) {
      beep();
    }
  }


  async function loadJob() {
    try {
      const response =
        await fetch(
          `${API_URL}/jobs/tracking/${encodeURIComponent(
            code
          )}`,
          {
            cache: "no-store",
          }
        );

      if (!response.ok) {
        const data =
          await response
            .json()
            .catch(
              () => null
            );

        throw new Error(
          data?.detail ||
            "Tracking information could not be found."
        );
      }

      const data =
        await response.json();


      if (
        previousStatus.current &&
        previousStatus.current !==
          data.status
      ) {
        setStatusChanged(
          true
        );

        setNotificationVisible(
          true
        );

        if (soundEnabled) {
          beep();
          window.setTimeout(
            beep,
            300
          );
        }

        window.setTimeout(
          () => {
            setStatusChanged(
              false
            );
          },
          5000
        );
      }


      previousStatus.current =
        data.status;

      setJob(data);
      setError("");

    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Could not load tracking."
      );

    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadJob();

    const refreshInterval =
      window.setInterval(
        loadJob,
        5000
      );

    return () =>
      window.clearInterval(
        refreshInterval
      );
  }, [
    code,
    soundEnabled,
  ]);


  /*
    WHILE THE ENGINEER IS ON ROUTE:
    beep every 8 seconds if the
    customer turned sound alerts on.
  */
  useEffect(() => {
    if (
      !soundEnabled ||
      job?.status !==
        "On Route"
    ) {
      return;
    }

    beep();

    const beepInterval =
      window.setInterval(
        () => {
          beep();
        },
        8000
      );

    return () =>
      window.clearInterval(
        beepInterval
      );
  }, [
    soundEnabled,
    job?.status,
  ]);


  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f6f7]">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#f6b800]">
            <Truck size={21} />
          </div>

          <p className="mt-4 text-sm text-gray-500">
            Loading live tracking...
          </p>
        </div>
      </div>
    );
  }


  if (!job) {
    return (
      <main className="min-h-screen bg-[#f5f6f7] p-6 md:p-10">
        <button
          onClick={goBack}
          className="mb-5 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold"
        >
          <ArrowLeft
            size={16}
          />

          {returnLabel}
        </button>

        <div className="mx-auto max-w-3xl rounded-xl border border-red-100 bg-red-50 p-5">
          <p className="font-semibold text-red-700">
            Tracking unavailable
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>
        </div>
      </main>
    );
  }


  const rawIndex =
    statusSteps.indexOf(
      job.status
    );

  const currentIndex =
    rawIndex >= 0
      ? rawIndex
      : 0;


  const updates =
    Array.isArray(
      job.updates
    )
      ? job.updates
      : [];


  const latestUpdate =
    updates.length
      ? updates[
          updates.length - 1
        ]
      : null;


  const onRoute =
    job.status ===
    "On Route";


  return (
    <>
      <main className="min-h-screen bg-[#f5f6f7] pb-32">
        {/* TOP HEADER */}
        <div className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-[1250px] items-center justify-between gap-4 px-5 py-5 md:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={goBack}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
                title={
                  returnLabel
                }
              >
                <ArrowLeft
                  size={18}
                />
              </button>

              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f6b800]">
                  <Truck
                    size={20}
                  />
                </div>

                <div>
                  <p className="font-bold">
                    SolarFlow
                  </p>

                  <p className="text-xs text-gray-500">
                    Live Service
                    Tracking
                  </p>
                </div>
              </div>
            </div>


            <div className="flex items-center gap-2">
              <button
                onClick={
                  toggleSound
                }
                className={`flex h-10 items-center gap-2 rounded-lg border px-3 text-xs font-semibold ${
                  soundEnabled
                    ? "border-[#f6b800] bg-[#fff8dc] text-black"
                    : "border-gray-200 bg-white text-gray-600"
                }`}
              >
                {soundEnabled ? (
                  <Volume2
                    size={16}
                  />
                ) : (
                  <VolumeX
                    size={16}
                  />
                )}

                <span className="hidden sm:inline">
                  {soundEnabled
                    ? "Sound On"
                    : "Sound Alerts"}
                </span>
              </button>


              <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />

                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>

                Live
              </div>
            </div>
          </div>
        </div>


        <div className="mx-auto max-w-[1250px] p-5 md:p-8">
          {/* ON ROUTE BANNER */}
          {onRoute && (
            <div className="mb-6 overflow-hidden rounded-2xl bg-[#101316] text-white">
              <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#f6b800] text-black">
                    <Truck
                      size={24}
                    />

                    <span className="absolute -right-1 -top-1 h-4 w-4 animate-ping rounded-full bg-emerald-400" />

                    <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-[#101316] bg-emerald-500" />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#f6b800]">
                      Engineer On The Way
                    </p>

                    <h2 className="mt-1 text-xl font-bold">
                      {job.engineer
                        ?.name ||
                        "Your engineer"}{" "}
                      is travelling to you
                    </h2>

                    <p className="mt-1 text-sm text-gray-400">
                      Keep this screen
                      open for live
                      updates.
                    </p>
                  </div>
                </div>


                {job.eta && (
                  <div className="rounded-xl bg-white/10 px-5 py-3">
                    <p className="text-xs text-gray-400">
                      Estimated Arrival
                    </p>

                    <p className="mt-1 text-2xl font-bold">
                      {new Date(
                        job.eta
                      ).toLocaleTimeString(
                        [],
                        {
                          hour:
                            "2-digit",

                          minute:
                            "2-digit",
                        }
                      )}
                    </p>
                  </div>
                )}
              </div>


              <div className="relative h-1.5 overflow-hidden bg-white/10">
                <div className="absolute inset-y-0 left-0 w-1/3 animate-[travel_2s_ease-in-out_infinite] bg-[#f6b800]" />
              </div>
            </div>
          )}


          {/* TITLE */}
          <div>
            <p className="text-sm font-medium text-gray-500">
              Service Request
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold">
                {
                  job.tracking_code
                }
              </h1>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  onRoute
                    ? "bg-amber-50 text-amber-700"
                    : job.status ===
                      "Completed"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {job.status}
              </span>

              {job.priority ===
                "Urgent" && (
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                  URGENT
                </span>
              )}
            </div>

            <h2 className="mt-4 text-xl font-bold">
              {job.title}
            </h2>

            {job.description && (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
                {
                  job.description
                }
              </p>
            )}
          </div>


          <div className="mt-7 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
            {/* JOB PROGRESS */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div>
                <p className="font-bold">
                  Job Progress
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Live progress from
                  the SolarFlow service
                  team.
                </p>
              </div>


              <div className="mt-8">
                {statusSteps.map(
                  (
                    step,
                    index
                  ) => {
                    const passed =
                      index <
                      currentIndex;

                    const current =
                      index ===
                      currentIndex;

                    return (
                      <div
                        key={
                          step
                        }
                        className="flex gap-4"
                      >
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full ${
                              current
                                ? "bg-[#f6b800] text-black"
                                : passed
                                ? "bg-black text-white"
                                : "border border-gray-200 bg-white text-gray-400"
                            }`}
                          >
                            {passed ? (
                              <CheckCircle2
                                size={
                                  18
                                }
                              />
                            ) : current ? (
                              onRoute ? (
                                <Truck
                                  size={
                                    17
                                  }
                                />
                              ) : (
                                <span className="h-2.5 w-2.5 rounded-full bg-black" />
                              )
                            ) : (
                              <span className="text-xs font-bold">
                                {index +
                                  1}
                              </span>
                            )}
                          </div>

                          {index <
                            statusSteps.length -
                              1 && (
                            <div
                              className={`h-12 w-px ${
                                index <
                                currentIndex
                                  ? "bg-black"
                                  : "bg-gray-200"
                              }`}
                            />
                          )}
                        </div>


                        <div className="pt-2">
                          <p
                            className={`text-sm font-semibold ${
                              current
                                ? "text-black"
                                : passed
                                ? "text-gray-700"
                                : "text-gray-400"
                            }`}
                          >
                            {step}
                          </p>

                          {current && (
                            <p className="mt-1 text-xs text-gray-500">
                              Current
                              stage
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>


            {/* RIGHT COLUMN */}
            <div className="space-y-5">
              {job.eta &&
                job.status !==
                  "Completed" && (
                  <div className="rounded-2xl bg-[#101316] p-6 text-white">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock3
                        size={17}
                      />

                      <p className="text-sm">
                        Expected Arrival
                      </p>
                    </div>

                    <p className="mt-3 text-4xl font-bold">
                      {new Date(
                        job.eta
                      ).toLocaleTimeString(
                        [],
                        {
                          hour:
                            "2-digit",

                          minute:
                            "2-digit",
                        }
                      )}
                    </p>
                  </div>
                )}


              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                  Assigned Engineer
                </p>

                {job.engineer ? (
                  <>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f6b800]">
                        <UserRound
                          size={19}
                        />
                      </div>

                      <div>
                        <p className="font-bold">
                          {
                            job.engineer
                              .name
                          }
                        </p>

                        <p className="text-sm text-gray-500">
                          {job.engineer
                            .specialization ||
                            "Solar Engineer"}
                        </p>
                      </div>
                    </div>

                    {job.engineer
                      .phone && (
                      <div className="mt-5 flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-3 text-sm">
                        <Phone
                          size={15}
                        />

                        {
                          job.engineer
                            .phone
                        }
                      </div>
                    )}
                  </>
                ) : (
                  <p className="mt-4 text-sm text-gray-500">
                    Waiting for an
                    engineer to be
                    assigned.
                  </p>
                )}
              </div>


              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                  Service Location
                </p>

                <div className="mt-4 flex gap-3">
                  <MapPin
                    size={18}
                    className="shrink-0"
                  />

                  <p className="text-sm">
                    {job.address ||
                      "Address not recorded"}
                  </p>
                </div>
              </div>


              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                  Activity History
                </p>

                <div className="mt-5 space-y-5">
                  {[...updates]
                    .reverse()
                    .map(
                      (
                        update:
                          any
                      ) => (
                        <div
                          key={
                            update.id
                          }
                          className="border-l-2 border-gray-200 pl-4"
                        >
                          <p className="text-sm font-semibold">
                            {
                              update.status
                            }
                          </p>

                          {update.note && (
                            <p className="mt-1 text-sm leading-5 text-gray-500">
                              {
                                update.note
                              }
                            </p>
                          )}

                          <p className="mt-1 text-xs text-gray-400">
                            {new Date(
                              update.created_at
                            ).toLocaleString()}
                          </p>
                        </div>
                      )
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>


      {/* FLOATING NOTIFICATION */}
      {notificationVisible &&
        job.status !==
          "Completed" && (
          <div className="fixed bottom-6 right-6 z-[100] w-[calc(100%-48px)] max-w-sm">
            <div
              className={`overflow-hidden rounded-2xl border bg-white shadow-2xl ${
                statusChanged
                  ? "border-[#f6b800]"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-start gap-4 p-4">
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black text-white">
                  {onRoute ? (
                    <Truck
                      size={19}
                    />
                  ) : (
                    <BellRing
                      size={19}
                    />
                  )}

                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                </div>


                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                        {onRoute
                          ? "Engineer Moving"
                          : "Live Update"}
                      </p>

                      <p className="mt-1 font-bold">
                        {
                          job.status
                        }
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        setNotificationVisible(
                          false
                        )
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100"
                    >
                      <X
                        size={15}
                      />
                    </button>
                  </div>


                  <p className="mt-2 text-sm leading-5 text-gray-500">
                    {latestUpdate
                      ?.note ||
                      getStatusMessage(
                        job.status
                      )}
                  </p>


                  {onRoute && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm">
                      <Truck
                        size={15}
                      />

                      <span className="min-w-0 flex-1">
                        {job.engineer
                          ?.name ||
                          "Your engineer"}{" "}
                        is on the way
                      </span>

                      {job.eta && (
                        <strong>
                          {new Date(
                            job.eta
                          ).toLocaleTimeString(
                            [],
                            {
                              hour:
                                "2-digit",

                              minute:
                                "2-digit",
                            }
                          )}
                        </strong>
                      )}
                    </div>
                  )}
                </div>
              </div>


              <div className="h-1 bg-gray-100">
                <div
                  className="h-full bg-[#f6b800] transition-all duration-700"
                  style={{
                    width: `${
                      ((currentIndex +
                        1) /
                        statusSteps.length) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}
    </>
  );
}


function getStatusMessage(
  status: string
) {
  switch (status) {
    case "Request Received":
      return "Your service request has been received.";

    case "Accepted":
      return "The SolarFlow team accepted your request.";

    case "Engineer Assigned":
      return "An engineer has been assigned.";

    case "On Route":
      return "Your engineer is currently travelling to your location.";

    case "Arrived":
      return "Your engineer has arrived.";

    case "Inspection":
      return "Your solar system is being inspected.";

    case "Working":
      return "Work on your solar system is in progress.";

    case "Completed":
      return "The service job has been completed.";

    default:
      return "Your service request has been updated.";
  }
}