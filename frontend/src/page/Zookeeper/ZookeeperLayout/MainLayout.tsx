import React from "react";
import Sidebar from "../../../component/zookeeper/sidebar"; 
import { Outlet } from "react-router-dom"; 

const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex-1 overflow-auto bg-gray-100">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
