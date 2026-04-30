import AppSidebar from "@/components/app-sidebar";
import AppHeader from "@/components/app-header";
import { SidebarProviderPersist } from "@/components/sidebar-provider-persist";
import { SidebarInset } from "@/components/ui/sidebar";
import { BalanceVisibilityProvider } from "@/contexts/balance-visibility-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BalanceVisibilityProvider>
      <SidebarProviderPersist>
        <AppSidebar />
        <SidebarInset className="flex flex-col">
          <AppHeader />
          <main className="flex flex-1 flex-col overflow-y-auto">{children}</main>
        </SidebarInset>
      </SidebarProviderPersist>
    </BalanceVisibilityProvider>
  );
}
