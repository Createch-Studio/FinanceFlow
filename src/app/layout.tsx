import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";
import "@/style/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "FinanceFlow - Personal Finance Dashboard",
  description: "Kelola transaksi, budget, aset, dan tugas keuangan Anda dalam satu tempat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={cn("bg-background font-sans antialiased", inter.variable)}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
