import { LoadingOutlined } from "@ant-design/icons";
import React from "react";

const Loader: React.FC = () => (
  <div
    style={{
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)", // เพิ่มการแปลตำแหน่งเพื่อให้ loader อยู่ตรงกลางอย่างสมบูรณ์
      zIndex: 2000,
      width: "100%",
      height: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <LoadingOutlined
      style={{
        fontSize: 100,
        color: "#180731",
      }}
      spin
    />
  </div>
);

export default Loader;
