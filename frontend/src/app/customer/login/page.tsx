"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  SunMedium,
} from "lucide-react";


const API_URL =
  "https://solarflow-backend-uvgv.onrender.com";


export default function CustomerLoginPage() {
  const [error, setError] =
    useState("");


  useEffect(() => {
    let cancelled = false;


    async function loginCustomer() {
      try {
        const existingToken =
          localStorage.getItem(
            "solarflow_customer_token"
          );


        if (existingToken) {
          window.location.replace(
            "/customer"
          );

          return;
        }


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
                email:
                  "tariro@example.com",

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
              "Customer login failed."
          );
        }


        localStorage.removeItem(
          "solarflow_demo_user"
        );

        localStorage.removeItem(
          "solarflow_admin_preview"
        );

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


        if (!cancelled) {
          window.location.replace(
            "/customer"
          );
        }
      } catch (error) {
        console.error(
          "Customer login error:",
          error
        );

        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Customer login failed."
          );
        }
      }
    }


    loginCustomer();


    return () => {
      cancelled = true;
    };
  }, []);


  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f6f7] p-6">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#f6b800] text-black">
          <SunMedium size={22} />
        </div>

        {!error ? (
          <p className="mt-4 text-sm text-gray-500">
            Opening customer portal...
          </p>
        ) : (
          <>
            <p className="mt-4 text-sm text-red-600">
              {error}
            </p>

            <button
              onClick={() => {
                window.location.href =
                  "/login";
              }}
              className="mt-4 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white"
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
