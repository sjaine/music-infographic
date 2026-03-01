import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LogProvider } from "./(components)/LogContext";
import ConsolePanel from "./(components)/ConsolePanel";
import ConsoleToggle from "./(components)/ConsoleToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Music Recommendatoins",
  description: "Get Recommendend depending on your mood",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/tlo3qdm.css" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LogProvider>
          {children}
          <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-4">
            <ConsoleToggle />
            <ConsolePanel />
          </div>
        </LogProvider>
      </body>
    </html>
  );
}
