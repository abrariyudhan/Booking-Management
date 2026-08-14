import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Booking Management",
  description: "Internal tool to manage customer bookings",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <header className="nav">
          <div className="nav-inner">
            <Link href="/" className="nav-brand">
              Booking Management
            </Link>
            <Link href="/bookings">Bookings</Link>
            <Link href="/bookings/new">New Booking</Link>
            <Link href="/services">Services</Link>
          </div>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
