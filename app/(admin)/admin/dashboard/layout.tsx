// app/(admin)/admin/layout.tsx
import { Playfair_Display, DM_Sans } from "next/font/google";
import Sidebar from "@/components/admin/sideBar"; 

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-playfair",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dm-sans",
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${playfair.variable} ${dmSans.variable}`}>
      <Sidebar />
      {/*
        margin-left diatur otomatis di globals.css:
        body.sb-open  → margin-left: 264px
        body.sb-closed → margin-left: 68px
      */}
      <main className="sb-content-area">
        {children}
      </main>
    </div>
  );
}