// app/(admin)/layout.tsx
import DashboardLayout from "@/app/(admin)/dashboard/layout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}
