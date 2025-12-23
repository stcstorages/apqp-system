import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "APQP System",
  description: "Automated APQP Documentation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
