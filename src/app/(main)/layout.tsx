import { Navbar } from "@/components/navbar";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="h-full bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      <Navbar />
      <main className="pt-40 pb-30 bg-gradient-to-b from-white to-gray-50">
        {children}
      </main>
      {/* <Footer/> */}
    </div>
  );
};

export default MainLayout;
