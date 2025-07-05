interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="h-full">
      <main className="min-h-screen">{children}</main>
    </div>
  );
};

export default MainLayout;
