import { Outlet } from "react-router-dom";
import MobileBottomNav from "../components/MobileBottomNav";
import Navbar from "../components/Navbar";

const MainLayout = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-5 pb-24 sm:px-6 sm:py-6 sm:pb-6 lg:px-8">
        <Outlet />
      </main>
      <MobileBottomNav />
    </div>
  );
};

export default MainLayout;
