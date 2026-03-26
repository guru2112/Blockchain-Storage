import "./globals.css";
import Navbar from "@/components/layout/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50 text-slate-900 antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
