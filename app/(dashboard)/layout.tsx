import AppSidebar from "@/components/app-sidebar";
import { SidebarProviderPersist } from "@/components/sidebar-provider-persist";
import { SidebarInset } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProviderPersist>
      <AppSidebar />
      <SidebarInset>
        <main className="flex flex-1 flex-col p-6">{children}</main>
      </SidebarInset>
    </SidebarProviderPersist>
  );
}
