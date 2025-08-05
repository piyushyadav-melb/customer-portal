import DashboardLayout from "@/components/layout/dashboard-layout";
import { SocketProvider } from "@/provider/providers";

const layout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <DashboardLayout>{children}</DashboardLayout>
  );
};

export default layout;
