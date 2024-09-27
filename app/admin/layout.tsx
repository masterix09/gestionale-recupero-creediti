import Sidebar from "@/components/admin/Sidebar";
import { Toaster } from "@/components/ui/toaster";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full h-screen flex flex-col lg:flex-row">
      <div className="w-full lg:w-[25%] lg:h-full bg-white/80 p-3">
        <Sidebar />
        <Toaster />
      </div>
      <div className="w-full lg:w-[75%] h-full p-3">{children}</div>
    </div>
  );
}
