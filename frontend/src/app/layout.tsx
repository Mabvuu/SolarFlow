import type {
  Metadata,
} from "next";

import "./globals.css";

import ErpShell from "@/components/erp-shell";

export const metadata: Metadata = {
  title: "SolarFlow ERP",
  description:
    "Solar installation, service and business operations management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ErpShell>
          {children}
        </ErpShell>
      </body>
    </html>
  );
}