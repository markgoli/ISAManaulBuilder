import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import TopNavBar from "../components/TopNavBar";
import Sidebar from "../components/sidebar/Sidebar";
import { AuthProvider } from "../../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Axora",
  description: "Axora",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true} className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}>
        <AuthProvider>
          <ProtectedRoute>
            <div className="flex h-screen">
              <Sidebar/>
              <div className="flex-1 flex flex-col">
                <TopNavBar/>
                <main className="flex-1 p-6 overflow-y-auto scrollbar-hide">{children}</main>
              </div>
            </div>
          </ProtectedRoute>
        </AuthProvider>
      </body>
    </html>
  );
}


