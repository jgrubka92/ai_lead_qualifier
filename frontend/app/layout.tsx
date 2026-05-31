import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Lead Qualifier — Faliam",
  description: "Qualify inbound leads against Faliam's ICP",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: "#FAF7F2" }}>{children}</body>
    </html>
  );
}
