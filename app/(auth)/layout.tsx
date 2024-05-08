import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";

import "../globals.css";

export const metadata = {
  title: "Bojio",
  description: "Nextjs 14 Meetings Application",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-dark-1 flex flex-col xl:flex-row items-center">
          <div className="xl:w-1/2 flex justify-center overflow-hidden items-center py-20">
            {children}
          </div>
          <img
            src="/assets/side-img.svg"
            alt="logo"
            className="hidden xl:block xl:w-1/2 h-screen object-cover bg-no-repeat"
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
