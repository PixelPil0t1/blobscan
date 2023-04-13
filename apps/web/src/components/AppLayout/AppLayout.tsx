import { BottomBarLayout } from "./BottomBarLayout";
import { TopBarLayout } from "./TopBarLayout";

interface LayoutProps {
  children: React.ReactNode;
  variant?: string;
}

const AppLayout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBarLayout />
      <main className="container mx-auto grow py-20">{children}</main>
      <BottomBarLayout />
    </div>
  );
};

export default AppLayout;
